<?php

namespace App\Services;

use App\Models\TenantUser;
use App\Models\User as CentralUser;
use App\Models\Tenant;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UnifiedLoginService
{
    private TenantLoginTokenService $tokenService;

    public function __construct(TenantLoginTokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    /**
     * Determine user type and location based on email
     */
    public function findUserByEmail(string $email): array
    {
        // First check if it's a central admin user
        $centralUser = CentralUser::where('email', $email)->first();
        if ($centralUser) {
            return [
                'type' => 'central',
                'user' => $centralUser,
                'tenant' => null,
                'login_url' => null
            ];
        }

        // Check if it's a tenant user
        $tenantUser = TenantUser::where('email', $email)->with('tenant')->first();
        if ($tenantUser && $tenantUser->tenant) {
            return [
                'type' => 'tenant',
                'user' => $tenantUser,
                'tenant' => $tenantUser->tenant,
                'login_url' => $this->getTenantLoginUrl($tenantUser->tenant->domain)
            ];
        }

        return [
            'type' => 'unknown',
            'user' => null,
            'tenant' => null,
            'login_url' => null
        ];
    }

    /**
     * Validate credentials for tenant user
     */
    public function validateTenantCredentials(string $email, string $password): ?TenantUser
    {
        $tenantUser = TenantUser::where('email', $email)->with('tenant')->first();
        
        if (!$tenantUser || !$tenantUser->tenant) {
            return null;
        }

        // Initialize tenant context to check password in tenant database
        try {
            tenancy()->initialize($tenantUser->tenant);
            
            $user = \App\Models\User::where('email', $email)->first();
            
            if ($user && Hash::check($password, $user->password)) {
                return $tenantUser;
            }
        } catch (\Exception $e) {
            Log::error('Error validating tenant credentials', [
                'email' => $email,
                'tenant_id' => $tenantUser->tenant->id,
                'error' => $e->getMessage()
            ]);
        } finally {
            tenancy()->end();
        }

        return null;
    }

    /**
     * Authenticate user from central domain - detects type and redirects appropriately
     */
    public function authenticateFromCentral(string $email, string $password): array
    {
        Log::info('Central domain login attempt', [
            'email' => $email,
            'ip' => request()->ip()
        ]);

        // First, check if it's a central admin user
        $centralUser = CentralUser::where('email', $email)->first();
        
        if ($centralUser && Hash::check($password, $centralUser->password)) {
            Log::info('Central admin login successful', ['email' => $email]);
            
            return [
                'success' => true,
                'user_type' => 'central',
                'user' => $centralUser,
                'redirect_url' => route('admin.dashboard'),
                'message' => 'Welcome back, Admin!'
            ];
        }

        // If not central admin, check tenant users
        $tenantUser = $this->validateTenantCredentials($email, $password);
        
        if (!$tenantUser) {
            Log::warning('Central login failed - invalid credentials', ['email' => $email]);
            
            return [
                'success' => false,
                'error' => 'Invalid credentials. Please check your email and password.',
                'suggestions' => [
                    'Double-check your email address',
                    'Try resetting your password',
                    'Make sure you\'re using the right login portal'
                ]
            ];
        }

        // Check if tenant is active
        if ($tenantUser->tenant->status !== 'active') {
            Log::warning('Login attempt for inactive tenant', [
                'email' => $email,
                'tenant_id' => $tenantUser->tenant_id,
                'tenant_status' => $tenantUser->tenant->status
            ]);
            
            return [
                'success' => false,
                'error' => 'Your company account is currently inactive. Please contact support.',
                'tenant_status' => $tenantUser->tenant->status
            ];
        }

        // Generate auto-login token for subdomain redirect
        $autoLoginUrl = $this->getTenantLoginUrlWithToken($tenantUser);

        Log::info('Tenant user login from central - redirecting to subdomain', [
            'email' => $email,
            'tenant_domain' => $tenantUser->tenant->domain
        ]);

        return [
            'success' => true,
            'user_type' => 'tenant',
            'user' => $tenantUser,
            'tenant' => $tenantUser->tenant,
            'redirect_url' => $autoLoginUrl,
            'message' => "Welcome back! Redirecting to {$tenantUser->tenant->name}..."
        ];
    }

    /**
     * Authenticate user directly on tenant subdomain
     */
    public function authenticateOnTenantDomain(string $email, string $password): array
    {
        $tenant = tenancy()->tenant;
        
        if (!$tenant) {
            Log::error('Tenant authentication attempted without tenant context');
            return [
                'success' => false,
                'error' => 'Invalid tenant context. Please try again.'
            ];
        }

        Log::info('Direct tenant login attempt', [
            'email' => $email,
            'tenant_id' => $tenant->id,
            'tenant_domain' => $tenant->domain,
            'ip' => request()->ip()
        ]);

        // Find user in current tenant database
        $user = \App\Models\User::where('email', $email)->first();
        
        if (!$user || !Hash::check($password, $user->password)) {
            Log::warning('Direct tenant login failed', [
                'email' => $email,
                'tenant_id' => $tenant->id,
                'user_found' => !!$user
            ]);
            
            return [
                'success' => false,
                'error' => 'Invalid credentials. Please check your email and password.',
                'suggestions' => [
                    'Make sure you\'re logging into the correct company portal',
                    'Try resetting your password',
                    'Contact your company admin for assistance'
                ]
            ];
        }

        // Check if user is active
        if (!$user->is_active) {
            Log::warning('Login attempt for inactive tenant user', [
                'email' => $email,
                'tenant_id' => $tenant->id,
                'user_id' => $user->id
            ]);
            
            return [
                'success' => false,
                'error' => 'Your account is inactive. Please contact your company administrator.'
            ];
        }

        Log::info('Direct tenant login successful', [
            'email' => $email,
            'tenant_id' => $tenant->id,
            'user_id' => $user->id
        ]);

        return [
            'success' => true,
            'user_type' => 'tenant_direct',
            'user' => $user,
            'tenant' => $tenant,
            'redirect_url' => route('dashboard'),
            'message' => 'Welcome back!'
        ];
    }

    /**
     * Create secure login token for tenant user
     */
    public function createTenantLoginToken(TenantUser $tenantUser): string
    {
        return $this->tokenService->generateLoginToken($tenantUser->tenant, $tenantUser);
    }

    /**
     * Get tenant login URL with auto-login token
     */
    public function getTenantLoginUrlWithToken(TenantUser $tenantUser): string
    {
        $token = $this->createTenantLoginToken($tenantUser);
        $baseUrl = $this->getTenantLoginUrl($tenantUser->tenant->domain);
        
        return "{$baseUrl}/auto-login?token={$token}";
    }

    /**
     * Generate tenant base login URL
     */
    private function getTenantLoginUrl(string $domain): string
    {
        // For development server (path-based routing)
        if (app()->environment('local') && 
            (request()->getHost() === '127.0.0.1' || request()->getHost() === 'localhost')) {
            $port = request()->getPort();
            $portSuffix = ($port && $port != 80 && $port != 443) ? ":{$port}" : '';
            return "http://127.0.0.1{$portSuffix}/tenant/{$domain}";
        }
        
        // For production (subdomain-based routing)
        $appDomain = config('app.domain', 'aero-hr.local');
        
        if (app()->environment('local')) {
            return "http://{$domain}.{$appDomain}";
        }
        
        return "https://{$domain}.{$appDomain}";
    }

    /**
     * Check if email belongs to tenant user (for quick lookup)
     */
    public function isTenantUser(string $email): bool
    {
        $cacheKey = 'tenant_user_check:' . md5($email);
        
        return Cache::remember($cacheKey, 300, function () use ($email) {
            return TenantUser::where('email', $email)->exists();
        });
    }

    /**
     * Clear user type cache (call when user changes)
     */
    public function clearUserCache(string $email): void
    {
        $cacheKey = 'tenant_user_check:' . md5($email);
        Cache::forget($cacheKey);
    }
}
