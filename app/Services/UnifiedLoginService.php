<?php

namespace App\Services;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Domain;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UnifiedLoginService
{
    private TenantLoginTokenService $tokenService;

    public function __construct(TenantLoginTokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    /**
     * Determine user type and location based on email using package standards
     */
    public function findUserByEmail(string $email): array
    {
        // First check if it's a central admin user (using platform_users table)
        $centralUser = DB::connection('mysql')->table('platform_users')->where('email', $email)->first();
        if ($centralUser) {
            return [
                'type' => $centralUser->role === 'super_admin' ? 'super_admin' : 'central',
                'user' => $centralUser,
                'tenant' => null,
                'login_url' => null
            ];
        }

        // Search for user across all tenant databases using package standards
        $tenants = Tenant::with('domains')->get();
        
        foreach ($tenants as $tenant) {
            try {
                // Initialize tenant context
                tenancy()->initialize($tenant);
                
                // Check if user exists in this tenant
                $user = User::where('email', $email)->first();
                
                if ($user) {
                    // Get the primary domain for this tenant
                    $domain = $tenant->domains()->first();
                    
                    return [
                        'type' => 'tenant',
                        'user' => $user,
                        'tenant' => $tenant,
                        'login_url' => $this->getTenantLoginUrl($domain ? $domain->domain : null),
                        'domain' => $domain
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Error checking tenant for user', [
                    'email' => $email,
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            } finally {
                // Always end tenant context
                tenancy()->end();
            }
        }

        return [
            'type' => 'unknown',
            'user' => null,
            'tenant' => null,
            'login_url' => null
        ];
    }

    /**
     * Validate credentials for tenant user using package standards
     */
    public function validateTenantCredentials(string $email, string $password, ?Tenant $tenant = null): ?array
    {
        if (!$tenant) {
            // If no tenant specified, find the tenant for this email
            $userInfo = $this->findUserByEmail($email);
            if ($userInfo['type'] !== 'tenant') {
                return null;
            }
            $tenant = $userInfo['tenant'];
        }

        try {
            // Initialize tenant context to check password in tenant database
            tenancy()->initialize($tenant);
            
            $user = User::where('email', $email)->first();
            
            if ($user && Hash::check($password, $user->password)) {
                return [
                    'user' => $user,
                    'tenant' => $tenant
                ];
            }
        } catch (\Exception $e) {
            Log::error('Error validating tenant credentials', [
                'email' => $email,
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
        } finally {
            // Always end tenant context
            tenancy()->end();
        }

        return null;
    }

    /**
     * Central login handling using package standards
     */
    public function handleCentralLogin(string $email, string $password): array
    {
        // Check for central admin user
        $centralUser = DB::connection('mysql')->table('users')
            ->where('email', $email)
            ->first();

        if (!$centralUser || !Hash::check($password, $centralUser->password)) {
            return [
                'success' => false,
                'message' => 'Invalid credentials for central admin'
            ];
        }

        return [
            'success' => true,
            'type' => 'central',
            'user' => $centralUser,
            'redirect_url' => '/admin'
        ];
    }

    /**
     * Tenant login handling using package standards
     */
    public function handleTenantLogin(string $email, string $password): array
    {
        $credentials = $this->validateTenantCredentials($email, $password);

        if (!$credentials) {
            return [
                'success' => false,
                'message' => 'Invalid credentials or user not found in any tenant'
            ];
        }

        $user = $credentials['user'];
        $tenant = $credentials['tenant'];

        // Check tenant status
        if ($tenant->status !== 'active') {
            Log::warning('Login attempt to inactive tenant', [
                'email' => $email,
                'tenant_id' => $tenant->id,
                'tenant_status' => $tenant->status
            ]);

            return [
                'success' => false,
                'message' => 'Tenant is not active'
            ];
        }

        // Generate auto-login token for tenant
        $domain = $tenant->domains()->first();
        $autoLoginUrl = $this->getTenantLoginUrlWithToken($user, $tenant);

        Log::info('Successful tenant login', [
            'email' => $email,
            'tenant_domain' => $domain ? $domain->domain : 'No domain set'
        ]);

        return [
            'success' => true,
            'type' => 'tenant',
            'user' => $user,
            'tenant' => $tenant,
            'redirect_url' => $autoLoginUrl,
            'message' => "Welcome back! Redirecting to {$tenant->name}..."
        ];
    }

    /**
     * Unified login - handles both central and tenant logins
     */
    public function unifiedLogin(string $email, string $password): array
    {
        $userInfo = $this->findUserByEmail($email);

        if ($userInfo['type'] === 'central') {
            return $this->handleCentralLogin($email, $password);
        } elseif ($userInfo['type'] === 'tenant') {
            return $this->handleTenantLogin($email, $password);
        }

        return [
            'success' => false,
            'message' => 'User not found in any system'
        ];
    }

    /**
     * Get tenant login URL with environment-specific routing
     */
    private function getTenantLoginUrl(?string $domain): ?string
    {
        if (!$domain) {
            return null;
        }

        if (app()->environment('local')) {
            // Development: path-based routing
            return url("/{$domain}");
        } else {
            // Production: subdomain routing
            return "https://{$domain}." . config('app.url');
        }
    }

    /**
     * Create tenant login token
     */
    public function createTenantLoginToken(User $user, Tenant $tenant): string
    {
        return $this->tokenService->generateLoginToken($tenant, $user);
    }

    /**
     * Get tenant login URL with auto-login token
     */
    public function getTenantLoginUrlWithToken(User $user, Tenant $tenant): string
    {
        $token = $this->createTenantLoginToken($user, $tenant);
        $domain = $tenant->domains()->first();
        
        if (!$domain) {
            throw new \Exception("No domain configured for tenant {$tenant->id}");
        }

        $baseUrl = $this->getTenantLoginUrl($domain->domain);
        return "{$baseUrl}/auto-login?token={$token}";
    }

    /**
     * Validate login token
     */
    public function validateLoginToken(string $token): ?array
    {
        return $this->tokenService->validateToken($token);
    }

    /**
     * Get user's accessible tenants using package standards
     */
    public function getUserTenants(string $email): array
    {
        $tenants = [];
        
        foreach (Tenant::with('domains')->get() as $tenant) {
            try {
                tenancy()->initialize($tenant);
                
                $user = User::where('email', $email)->first();
                if ($user) {
                    $domain = $tenant->domains()->first();
                    $tenants[] = [
                        'tenant' => $tenant,
                        'domain' => $domain ? $domain->domain : null,
                        'login_url' => $this->getTenantLoginUrl($domain ? $domain->domain : null),
                        'user' => $user
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Error checking user access to tenant', [
                    'email' => $email,
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
            } finally {
                tenancy()->end();
            }
        }

        return $tenants;
    }

    /**
     * Check if email exists in any tenant using package standards
     */
    public function emailExistsInAnyTenant(string $email): bool
    {
        foreach (Tenant::all() as $tenant) {
            try {
                tenancy()->initialize($tenant);
                
                if (User::where('email', $email)->exists()) {
                    return true;
                }
            } catch (\Exception $e) {
                Log::warning('Error checking email in tenant', [
                    'email' => $email,
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
            } finally {
                tenancy()->end();
            }
        }

        return false;
    }

    /**
     * Get tenant by domain using package standards
     */
    public function getTenantByDomain(string $domain): ?Tenant
    {
        $domainModel = Domain::where('domain', $domain)->first();
        return $domainModel ? $domainModel->tenant : null;
    }

    /**
     * Cache helper for tenant discovery
     */
    private function getCachedTenantForEmail(string $email): ?array
    {
        $cacheKey = "tenant_lookup:{$email}";
        return Cache::remember($cacheKey, 300, function () use ($email) {
            return $this->findUserByEmail($email);
        });
    }
}
