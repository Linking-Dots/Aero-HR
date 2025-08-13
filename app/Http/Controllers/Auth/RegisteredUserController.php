<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthenticationSecurityService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    protected $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Check registration rate limiting
        $result = $this->securityService->monitorRegistrationAttempt($request);
        
        if (!$result['allowed']) {
            return back()->withErrors([
                'email' => 'Too many registration attempts. Please try again later.'
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // Set default security preferences for new users
            'security_email_notifications' => true,
            'security_push_notifications' => true,
            'security_sms_notifications' => false,
            'security_alert_threshold' => 'medium',
            'real_time_monitoring' => true,
            'geo_location_tracking' => true,
            'device_fingerprinting' => true,
            'behavioral_analysis' => true,
            'session_timeout' => 60
        ]);

        // Log user registration
        $this->securityService->logSecurityEvent('user_registered', [
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'email' => $user->email,
            'name' => $user->name
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Track initial session for new user
        $this->trackUserSession($request, $user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Track user session in security system
     */
    private function trackUserSession(Request $request, $user): void
    {
        try {
            DB::table('user_sessions_tracking')->insert([
                'user_id' => $user->id,
                'session_id' => $request->session()->getId(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_type' => $this->getDeviceType($request->userAgent()),
                'device_name' => $this->getDeviceName($request->userAgent()),
                'browser' => $this->getBrowser($request->userAgent()),
                'platform' => $this->getPlatform($request->userAgent()),
                'location' => 'Registration Location',
                'device_fingerprint' => json_encode($this->generateDeviceFingerprint($request)),
                'is_active' => true,
                'last_activity' => now(),
                'login_at' => now(),
                'logout_at' => null,
                'logout_type' => null,
                'security_flags' => json_encode(['first_login' => true]),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to track user session on registration: ' . $e->getMessage());
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
}
