<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ModernAuthenticationService;
use App\Services\UnifiedLoginService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    protected ModernAuthenticationService $authService;
    protected UnifiedLoginService $unifiedLoginService;

    public function __construct(
        ModernAuthenticationService $authService,
        UnifiedLoginService $unifiedLoginService
    ) {
        $this->authService = $authService;
        $this->unifiedLoginService = $unifiedLoginService;
    }

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     * Supports both central and tenant domain authentication
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $email = $request->email;
        $password = $request->password;
        $remember = $request->boolean('remember');

        // Check rate limiting
        $key = 'login.' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            $this->authService->logAuthenticationEvent(
                null,
                'login_rate_limited',
                'failure',
                $request,
                ['email' => $email, 'retry_after' => $seconds]
            );

            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        // Check if account is locked
        if ($this->authService->isAccountLocked($email)) {
            $this->authService->logAuthenticationEvent(
                null,
                'login_account_locked',
                'failure',
                $request,
                ['email' => $email]
            );

            throw ValidationException::withMessages([
                'email' => 'This account has been temporarily locked due to multiple failed login attempts.',
            ]);
        }

        // Determine if this is central domain or tenant domain login
        $isTenantDomain = $this->isTenantDomain($request);
        
        if ($isTenantDomain) {
            // Handle direct tenant domain login
            return $this->handleTenantDomainLogin($request, $email, $password, $remember);
        } else {
            // Handle central domain login with smart redirection
            return $this->handleCentralDomainLogin($request, $email, $password, $remember);
        }
    }

    /**
     * Handle login from central domain (smart user detection and redirection)
     */
    private function handleCentralDomainLogin(Request $request, string $email, string $password, bool $remember)
    {
        $authResult = $this->unifiedLoginService->authenticateFromCentral($email, $password);
        
        if (!$authResult['success']) {
            RateLimiter::hit('login.' . $request->ip(), 60);
            
            throw ValidationException::withMessages([
                'email' => $authResult['error'],
            ]);
        }

        // Clear rate limiting on successful authentication
        RateLimiter::clear('login.' . $request->ip());

        if ($authResult['user_type'] === 'central') {
            // Central admin user - login normally
            Auth::login($authResult['user'], $remember);
            
            $this->authService->updateLoginStats($authResult['user'], $request);
            $this->authService->trackUserSession($authResult['user'], $request);
            $this->authService->logAuthenticationEvent(
                $authResult['user'],
                'central_login_success',
                'success',
                $request
            );

            $request->session()->regenerate();
            
            return redirect()->intended($authResult['redirect_url'])->with('success', $authResult['message']);
            
        } else {
            // Tenant user - redirect to their subdomain with auto-login token
            return redirect($authResult['redirect_url'])->with([
                'success' => $authResult['message'],
                'tenant_name' => $authResult['tenant']->name
            ]);
        }
    }

    /**
     * Handle login directly on tenant domain
     */
    private function handleTenantDomainLogin(Request $request, string $email, string $password, bool $remember)
    {
        $authResult = $this->unifiedLoginService->authenticateOnTenantDomain($email, $password);
        
        if (!$authResult['success']) {
            RateLimiter::hit('login.' . $request->ip(), 60);
            
            throw ValidationException::withMessages([
                'email' => $authResult['error'],
            ]);
        }

        // Clear rate limiting on successful authentication
        RateLimiter::clear('login.' . $request->ip());

        // Login user in tenant context
        Auth::login($authResult['user'], $remember);

        // Update login statistics (tenant context)
        $this->authService->updateLoginStats($authResult['user'], $request);
        $this->authService->trackUserSession($authResult['user'], $request);
        $this->authService->logAuthenticationEvent(
            $authResult['user'],
            'tenant_direct_login_success',
            'success',
            $request
        );

        $request->session()->regenerate();

        return redirect()->intended($authResult['redirect_url'])->with('success', $authResult['message']);
    }

    /**
     * Determine if current request is on a tenant domain
     */
    private function isTenantDomain(Request $request): bool
    {
        $host = $request->getHost();
        
        // For development (path-based routing)
        if (app()->environment('local') && 
            ($host === '127.0.0.1' || $host === 'localhost')) {
            return str_contains($request->getPathInfo(), '/tenant/');
        }
        
        // For production (subdomain-based routing)
        $centralDomains = config('tenancy.central_domains', []);
        
        return !in_array($host, $centralDomains);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();

        if ($user) {
            // Log logout event
            $this->authService->logAuthenticationEvent(
                $user,
                'logout',
                'success',
                $request
            );

            // Update session tracking
            $sessionId = session()->getId();
            DB::table('user_sessions')
                ->where('session_id', $sessionId)
                ->update([
                    'is_current' => false,
                    'updated_at' => now(),
                ]);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
