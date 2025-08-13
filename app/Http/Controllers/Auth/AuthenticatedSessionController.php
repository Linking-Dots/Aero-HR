<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthenticationSecurityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'csrfToken' => session('csrfToken')
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Monitor login attempt
        $result = $this->securityService->monitorLoginAttempt($request);
        
        if (!$result['allowed']) {
            return back()->withErrors([
                'email' => $result['message']
            ]);
        }

        $request->authenticate();

        $user = Auth::user();
        
        // Log successful login
        $this->securityService->logSecurityEvent('login_success', [
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'location' => $this->getLocationFromIP($request->ip())
        ]);

        // Track user session
        $this->trackUserSession($request, $user);

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false))
        ->with('csrfToken', csrf_token());
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        if ($user) {
            // Log logout
            $this->securityService->logSecurityEvent('logout', [
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Update session tracking
            $this->updateSessionTracking($request->session()->getId(), 'manual');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login')
        ->with('csrfToken', csrf_token());
    }

    /**
     * Track user session in security system
     */
    private function trackUserSession(Request $request, $user): void
    {
        try {
            DB::table('user_sessions_tracking')->updateOrInsert(
                ['session_id' => $request->session()->getId()],
                [
                    'user_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'device_type' => $this->getDeviceType($request->userAgent()),
                    'device_name' => $this->getDeviceName($request->userAgent()),
                    'browser' => $this->getBrowser($request->userAgent()),
                    'platform' => $this->getPlatform($request->userAgent()),
                    'location' => $this->getLocationFromIP($request->ip()),
                    'device_fingerprint' => json_encode($this->generateDeviceFingerprint($request)),
                    'is_active' => true,
                    'last_activity' => now(),
                    'login_at' => now(),
                    'logout_at' => null,
                    'logout_type' => null,
                    'security_flags' => json_encode([]),
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        } catch (\Exception $e) {
            // Log error but don't break login flow
            Log::error('Failed to track user session: ' . $e->getMessage());
        }
    }

    /**
     * Update session tracking on logout
     */
    private function updateSessionTracking(string $sessionId, string $logoutType): void
    {
        try {
            DB::table('user_sessions_tracking')
                ->where('session_id', $sessionId)
                ->update([
                    'is_active' => false,
                    'logout_at' => now(),
                    'logout_type' => $logoutType,
                    'updated_at' => now()
                ]);
        } catch (\Exception $e) {
            Log::error('Failed to update session tracking: ' . $e->getMessage());
        }
    }

    /**
     * Get device type from user agent
     */
    private function getDeviceType(string $userAgent): string
    {
        if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
            if (preg_match('/iPad/', $userAgent)) {
                return 'tablet';
            }
            return 'mobile';
        }
        return 'desktop';
    }

    /**
     * Get device name from user agent
     */
    private function getDeviceName(string $userAgent): string
    {
        if (preg_match('/iPhone/', $userAgent)) return 'iPhone';
        if (preg_match('/iPad/', $userAgent)) return 'iPad';
        if (preg_match('/Android/', $userAgent)) return 'Android Device';
        if (preg_match('/Windows/', $userAgent)) return 'Windows PC';
        if (preg_match('/Macintosh/', $userAgent)) return 'Mac';
        if (preg_match('/Linux/', $userAgent)) return 'Linux PC';
        
        return 'Unknown Device';
    }

    /**
     * Get browser from user agent
     */
    private function getBrowser(string $userAgent): string
    {
        if (preg_match('/Chrome/', $userAgent)) return 'Chrome';
        if (preg_match('/Firefox/', $userAgent)) return 'Firefox';
        if (preg_match('/Safari/', $userAgent) && !preg_match('/Chrome/', $userAgent)) return 'Safari';
        if (preg_match('/Edge/', $userAgent)) return 'Edge';
        if (preg_match('/Opera/', $userAgent)) return 'Opera';
        
        return 'Unknown Browser';
    }

    /**
     * Get platform from user agent
     */
    private function getPlatform(string $userAgent): string
    {
        if (preg_match('/Windows NT 10.0/', $userAgent)) return 'Windows 10';
        if (preg_match('/Windows NT 6.3/', $userAgent)) return 'Windows 8.1';
        if (preg_match('/Windows NT 6.1/', $userAgent)) return 'Windows 7';
        if (preg_match('/Mac OS X/', $userAgent)) return 'macOS';
        if (preg_match('/Linux/', $userAgent)) return 'Linux';
        if (preg_match('/Android/', $userAgent)) return 'Android';
        if (preg_match('/iOS/', $userAgent)) return 'iOS';
        
        return 'Unknown Platform';
    }

    /**
     * Generate device fingerprint
     */
    private function generateDeviceFingerprint(Request $request): array
    {
        return [
            'user_agent' => $request->userAgent(),
            'accept_language' => $request->header('Accept-Language'),
            'accept_encoding' => $request->header('Accept-Encoding'),
            'screen_resolution' => $request->header('X-Screen-Resolution'),
            'timezone' => $request->header('X-Timezone'),
            'generated_at' => now()->toISOString()
        ];
    }

    /**
     * Get location from IP address (basic implementation)
     */
    private function getLocationFromIP(string $ip): string
    {
        // Basic implementation - in production you might use a service like MaxMind
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Localhost';
        }
        
        // You can integrate with IP geolocation services here
        return 'Unknown Location';
    }
}
