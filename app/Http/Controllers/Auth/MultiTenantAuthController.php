<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Subscription;
use App\Models\Plan;
use App\Services\UnifiedLoginService;
use App\Services\ModernAuthenticationService;
use App\Services\TenantLoginTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Stancl\Tenancy\Facades\Tenancy;

class MultiTenantAuthController extends Controller
{
    protected UnifiedLoginService $unifiedLoginService;
    protected ModernAuthenticationService $authService;
    protected TenantLoginTokenService $tokenService;

    public function __construct(
        UnifiedLoginService $unifiedLoginService,
        ModernAuthenticationService $authService,
        TenantLoginTokenService $tokenService
    ) {
        $this->unifiedLoginService = $unifiedLoginService;
        $this->authService = $authService;
        $this->tokenService = $tokenService;
    }

    /**
     * Show the login form (platform or tenant-specific)
     */
    public function showLoginForm(Request $request): Response
    {
        $context = $this->determineLoginContext($request);
        
        return Inertia::render('Auth/MultiTenantLogin', [
            'context' => $context,
            'canResetPassword' => true,
            'status' => session('status'),
            'plans' => $this->getAvailablePlans(),
            'features' => $this->getAuthFeatures($context),
        ]);
    }

    /**
     * Handle authentication attempt
     */
    public function authenticate(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember' => 'boolean',
            'login_type' => 'sometimes|string|in:platform,tenant,auto',
        ]);

        $this->checkRateLimit($request);

        $email = $request->email;
        $password = $request->password;
        $remember = $request->boolean('remember');
        $loginType = $request->input('login_type', 'auto');

        try {
            $result = $this->performAuthentication($request, $email, $password, $remember, $loginType);
            
            if ($result['success']) {
                RateLimiter::clear($this->getRateLimitKey($request));
                return $this->handleSuccessfulAuth($result, $request);
            } else {
                RateLimiter::hit($this->getRateLimitKey($request), 300);
                throw ValidationException::withMessages(['email' => $result['message']]);
            }

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Authentication error', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw ValidationException::withMessages([
                'email' => 'An error occurred during authentication. Please try again.',
            ]);
        }
    }

    /**
     * Perform the actual authentication
     */
    private function performAuthentication(Request $request, string $email, string $password, bool $remember, string $loginType): array
    {
        $context = $this->determineLoginContext($request);
        
        switch ($loginType) {
            case 'platform':
                return $this->authenticatePlatformUser($email, $password, $remember, $request);
                
            case 'tenant':
                return $this->authenticateTenantUser($email, $password, $remember, $request);
                
            case 'auto':
            default:
                return $this->authenticateAuto($email, $password, $remember, $request, $context);
        }
    }

    /**
     * Authenticate platform/admin user
     */
    private function authenticatePlatformUser(string $email, string $password, bool $remember, Request $request): array
    {
        // Use central database connection
        $user = DB::connection(config('database.default'))
            ->table('users')
            ->where('email', $email)
            ->where('is_platform_admin', true)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            $this->logAuthEvent($email, 'platform_login_failed', $request);
            return [
                'success' => false,
                'message' => 'Invalid platform admin credentials.',
            ];
        }

        // Create User model instance for Auth
        $userModel = new User((array) $user);
        $userModel->id = $user->id;
        $userModel->exists = true;

        Auth::login($userModel, $remember);
        
        $this->logAuthEvent($userModel, 'platform_login_success', $request);
        
        return [
            'success' => true,
            'user_type' => 'platform',
            'user' => $userModel,
            'redirect_url' => route('platform.dashboard'),
            'message' => 'Welcome to the platform dashboard.',
        ];
    }

    /**
     * Authenticate tenant user in current tenant context
     */
    private function authenticateTenantUser(string $email, string $password, bool $remember, Request $request): array
    {
        if (!Tenancy::initialized()) {
            return [
                'success' => false,
                'message' => 'Tenant context not initialized.',
            ];
        }

        $tenant = tenant();
        
        // Check subscription status
        if (!$this->hasValidSubscription($tenant)) {
            return [
                'success' => false,
                'message' => 'This tenant account requires an active subscription.',
            ];
        }

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            $this->logAuthEvent($email, 'tenant_login_failed', $request, $tenant);
            return [
                'success' => false,
                'message' => 'Invalid credentials for this tenant.',
            ];
        }

        // Check if user account is active
        if (!$user->is_active) {
            return [
                'success' => false,
                'message' => 'Your account has been deactivated.',
            ];
        }

        Auth::login($user, $remember);
        
        $this->logAuthEvent($user, 'tenant_login_success', $request, $tenant);
        
        return [
            'success' => true,
            'user_type' => 'tenant',
            'user' => $user,
            'tenant' => $tenant,
            'redirect_url' => route('dashboard'),
            'message' => "Welcome back to {$tenant->name}!",
        ];
    }

    /**
     * Auto-detect user type and authenticate accordingly
     */
    private function authenticateAuto(string $email, string $password, bool $remember, Request $request, array $context): array
    {
        // First try platform authentication if we're on central domain
        if ($context['type'] === 'central') {
            $platformResult = $this->authenticatePlatformUser($email, $password, $remember, $request);
            if ($platformResult['success']) {
                return $platformResult;
            }
        }

        // If on tenant domain, try tenant authentication first
        if ($context['type'] === 'tenant') {
            $tenantResult = $this->authenticateTenantUser($email, $password, $remember, $request);
            if ($tenantResult['success']) {
                return $tenantResult;
            }
        }

        // For central domain, try to find user in tenant databases
        if ($context['type'] === 'central') {
            return $this->findUserInTenants($email, $password, $remember, $request);
        }

        return [
            'success' => false,
            'message' => 'Invalid credentials.',
        ];
    }

    /**
     * Find user across tenant databases and redirect
     */
    private function findUserInTenants(string $email, string $password, bool $remember, Request $request): array
    {
        $tenants = Tenant::with('subscription.plan')->where('status', 'active')->get();

        foreach ($tenants as $tenant) {
            try {
                tenancy()->initialize($tenant);
                
                $user = User::where('email', $email)->first();
                
                if ($user && Hash::check($password, $user->password) && $user->is_active) {
                    // Generate auto-login token for tenant redirect
                    $token = $this->tokenService->generateAutoLoginToken($user, $tenant);
                    
                    $redirectUrl = $this->buildTenantLoginUrl($tenant, $token);
                    
                    tenancy()->end();
                    
                    return [
                        'success' => true,
                        'user_type' => 'tenant_redirect',
                        'tenant' => $tenant,
                        'redirect_url' => $redirectUrl,
                        'message' => "Redirecting to {$tenant->name}...",
                    ];
                }
                
                tenancy()->end();
                
            } catch (\Exception $e) {
                tenancy()->end();
                Log::warning("Failed to check user in tenant {$tenant->slug}", [
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }

        return [
            'success' => false,
            'message' => 'No account found with these credentials.',
        ];
    }

    /**
     * Handle successful authentication
     */
    private function handleSuccessfulAuth(array $result, Request $request)
    {
        if ($result['user_type'] === 'tenant_redirect') {
            return redirect($result['redirect_url'])
                ->with('status', $result['message']);
        }

        return redirect()
            ->intended($result['redirect_url'])
            ->with('status', $result['message']);
    }

    /**
     * Check subscription validity
     */
    private function hasValidSubscription(Tenant $tenant): bool
    {
        $subscription = $tenant->subscription;
        
        if (!$subscription) {
            // Allow grace period for new tenants
            return $tenant->created_at->addDays(14) > now();
        }

        return in_array($subscription->stripe_status, ['active', 'trialing']) &&
               (!$subscription->ends_at || $subscription->ends_at > now());
    }

    /**
     * Determine login context
     */
    private function determineLoginContext(Request $request): array
    {
        $host = $request->getHost();
        $centralDomain = config('app.central_domain', 'mysoftwaredomain.com');

        if (Tenancy::initialized()) {
            return [
                'type' => 'tenant',
                'tenant' => tenant(),
                'domain' => $host,
            ];
        }

        if ($host === $centralDomain || str_ends_with($host, '127.0.0.1') || str_ends_with($host, 'localhost')) {
            return [
                'type' => 'central',
                'domain' => $host,
            ];
        }

        return [
            'type' => 'unknown',
            'domain' => $host,
        ];
    }

    /**
     * Get available plans for signup
     */
    private function getAvailablePlans(): array
    {
        return Plan::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'features' => $plan->features,
                    'is_featured' => $plan->is_featured,
                ];
            })
            ->toArray();
    }

    /**
     * Get authentication features based on context
     */
    private function getAuthFeatures(array $context): array
    {
        $features = [
            'social_login' => config('auth.social_login_enabled', false),
            'registration' => config('auth.registration_enabled', true),
            'password_reset' => true,
            'remember_me' => true,
        ];

        if ($context['type'] === 'tenant') {
            $features['tenant_branding'] = true;
            $features['sso'] = $context['tenant']->sso_enabled ?? false;
        }

        return $features;
    }

    /**
     * Build tenant login URL with auto-login token
     */
    private function buildTenantLoginUrl(Tenant $tenant, string $token): string
    {
        if (app()->environment('local')) {
            return url("/tenant/{$tenant->slug}/auto-login?token={$token}");
        }

        $centralDomain = config('app.central_domain', 'mysoftwaredomain.com');
        return "https://{$tenant->slug}.{$centralDomain}/auto-login?token={$token}";
    }

    /**
     * Check rate limiting
     */
    private function checkRateLimit(Request $request): void
    {
        $key = $this->getRateLimitKey($request);
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ]);
        }
    }

    /**
     * Get rate limit key
     */
    private function getRateLimitKey(Request $request): string
    {
        return 'login.' . $request->ip() . '.' . $request->input('email');
    }

    /**
     * Log authentication events
     */
    private function logAuthEvent($user, string $event, Request $request, ?Tenant $tenant = null): void
    {
        $context = [
            'event' => $event,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'host' => $request->getHost(),
        ];

        if ($user instanceof User) {
            $context['user_id'] = $user->id;
            $context['email'] = $user->email;
        } elseif (is_string($user)) {
            $context['email'] = $user;
        }

        if ($tenant) {
            $context['tenant_id'] = $tenant->id;
            $context['tenant_slug'] = $tenant->slug;
        }

        Log::info($event, $context);
    }

    /**
     * Logout user and handle tenant context
     */
    public function logout(Request $request)
    {
        $user = Auth::user();
        $tenant = Tenancy::initialized() ? tenant() : null;
        
        $this->logAuthEvent($user, 'logout', $request, $tenant);
        
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($tenant) {
            return redirect()->route('tenant.login')
                ->with('status', 'You have been logged out successfully.');
        }

        return redirect()->route('login')
            ->with('status', 'You have been logged out successfully.');
    }
}
