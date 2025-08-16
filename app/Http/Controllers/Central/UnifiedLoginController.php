<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Services\UnifiedLoginService;
use App\Services\ModernAuthenticationService;
use App\Models\User as CentralUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UnifiedLoginController extends Controller
{
    public function __construct(
        private UnifiedLoginService $unifiedLoginService,
        private ModernAuthenticationService $authService
    ) {}

    /**
     * Show unified login form
     */
    public function create()
    {
        return Inertia::render('Auth/UnifiedLogin', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle unified login - determines user type and routes accordingly
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

        // Rate limiting
        $key = 'unified_login.' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        try {
            // Find user by email across both systems
            $userInfo = $this->unifiedLoginService->findUserByEmail($email);

            if ($userInfo['type'] === 'unknown') {
                RateLimiter::hit($key, 60);
                throw ValidationException::withMessages([
                    'email' => 'No account found with this email address.',
                ]);
            }

            if ($userInfo['type'] === 'central') {
                // Handle central admin login
                return $this->handleCentralLogin($request, $userInfo['user'], $remember);
            }

            if ($userInfo['type'] === 'tenant') {
                // Handle tenant user login
                return $this->handleTenantLogin($request, $userInfo, $remember);
            }

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Unified login error', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'email' => 'Login failed. Please try again.',
            ]);
        }
    }

    /**
     * Handle central admin user login
     */
    private function handleCentralLogin(Request $request, CentralUser $user, bool $remember)
    {
        if (!Hash::check($request->password, $user->password)) {
            RateLimiter::hit('unified_login.' . $request->ip(), 60);
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => 'This account has been deactivated.',
            ]);
        }

        // Login central user
        Auth::login($user, $remember);
        
        // Update login stats
        $this->authService->updateLoginStats($user, $request);
        $this->authService->trackUserSession($user, $request);

        // Log successful login
        $this->authService->logAuthenticationEvent(
            $user,
            'central_login_success',
            'success',
            $request
        );

        $request->session()->regenerate();
        RateLimiter::clear('unified_login.' . $request->ip());

        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Handle tenant user login with redirection
     */
    private function handleTenantLogin(Request $request, array $userInfo, bool $remember)
    {
        $tenantUser = $userInfo['user'];
        $tenant = $userInfo['tenant'];

        // Validate credentials in tenant context
        $validatedTenantUser = $this->unifiedLoginService->validateTenantCredentials(
            $request->email, 
            $request->password
        );

        if (!$validatedTenantUser) {
            RateLimiter::hit('unified_login.' . $request->ip(), 60);
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        // Clear rate limiting on successful validation
        RateLimiter::clear('unified_login.' . $request->ip());

        // Generate auto-login URL for tenant domain
        $autoLoginUrl = $this->unifiedLoginService->getTenantLoginUrlWithToken($tenantUser);

        // Log unified login event
        Log::info('Unified login: Tenant user redirected', [
            'email' => $request->email,
            'tenant_id' => $tenant->id,
            'tenant_domain' => $tenant->domain,
            'redirect_url' => $autoLoginUrl,
            'ip' => $request->ip()
        ]);

        // For AJAX requests, return JSON response
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'redirect_url' => $autoLoginUrl,
                'tenant_domain' => $tenant->domain,
                'company_name' => $tenant->name,
            ]);
        }

        // For regular requests, redirect immediately
        return redirect()->away($autoLoginUrl)->with([
            'success' => 'Redirecting to your company platform...',
            'tenant_domain' => $tenant->domain,
        ]);
    }

    /**
     * AJAX endpoint to check user type before login
     */
    public function checkUserType(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $userInfo = $this->unifiedLoginService->findUserByEmail($request->email);

        return response()->json([
            'type' => $userInfo['type'],
            'tenant_domain' => $userInfo['tenant']->domain ?? null,
            'company_name' => $userInfo['tenant']->name ?? null,
        ]);
    }
}
