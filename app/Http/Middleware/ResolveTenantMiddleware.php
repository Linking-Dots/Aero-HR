<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Facades\Tenancy;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantMiddleware
{
    /**
     * Handle an incoming request.
     * Resolves tenant from subdomain and initializes tenant context
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip tenant resolution for central domain routes
        if ($this->isCentralDomain($request)) {
            return $next($request);
        }

        try {
            $tenant = $this->resolveTenant($request);

            if (!$tenant) {
                return $this->handleTenantNotFound($request);
            }

            // Check tenant status and subscription
            if (!$this->isValidTenantAccess($tenant)) {
                return $this->handleInvalidTenant($request, $tenant);
            }

            // Initialize tenant context
            $this->initializeTenantContext($tenant);

            // Add tenant to request for easy access
            $request->attributes->set('tenant', $tenant);

            return $next($request);

        } catch (\Exception $e) {
            Log::error('Tenant resolution failed', [
                'host' => $request->getHost(),
                'path' => $request->getPathInfo(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->view('errors.tenant-error', [
                'message' => 'Unable to resolve tenant. Please contact support.'
            ], 500);
        }
    }

    /**
     * Resolve tenant from request
     */
    private function resolveTenant(Request $request): ?Tenant
    {
        $host = $request->getHost();
        $slug = null;

        // Development environment - path-based routing
        if ($this->isDevelopmentEnvironment($host)) {
            $pathSegments = explode('/', trim($request->getPathInfo(), '/'));
            if (count($pathSegments) >= 2 && $pathSegments[0] === 'tenant') {
                $slug = $pathSegments[1];
            }
        } else {
            // Production environment - subdomain routing
            $slug = $this->extractSubdomain($host);
        }

        if (!$slug) {
            return null;
        }

        // Cache tenant lookup for performance
        return Cache::remember("tenant.{$slug}", 300, function () use ($slug) {
            return Tenant::with(['domains', 'subscription.plan'])
                ->where('slug', $slug)
                ->first();
        });
    }

    /**
     * Check if tenant has valid access
     */
    private function isValidTenantAccess(Tenant $tenant): bool
    {
        // Check tenant status
        if ($tenant->status !== 'active') {
            return false;
        }

        // Check subscription status
        $subscription = $tenant->subscription;
        if (!$subscription) {
            // Allow trial period for new tenants
            return $tenant->created_at->addDays(14) > now();
        }

        // Check subscription status
        if (!in_array($subscription->stripe_status, ['active', 'trialing'])) {
            return false;
        }

        // Check if subscription is expired
        if ($subscription->ends_at && $subscription->ends_at < now()) {
            return false;
        }

        return true;
    }

    /**
     * Initialize tenant context
     */
    private function initializeTenantContext(Tenant $tenant): void
    {
        // Initialize tenancy using the package
        tenancy()->initialize($tenant);

        // Set tenant-specific configurations
        $this->configureTenantDatabase($tenant);
        $this->configureTenantStorage($tenant);
        $this->configureTenantCache($tenant);
        $this->configureTenantSession($tenant);
    }

    /**
     * Configure tenant database connection
     */
    private function configureTenantDatabase(Tenant $tenant): void
    {
        $connectionName = "tenant_{$tenant->id}";
        
        Config::set("database.connections.{$connectionName}", [
            'driver' => 'mysql',
            'host' => $tenant->db_host ?? config('database.connections.mysql.host'),
            'port' => $tenant->db_port ?? config('database.connections.mysql.port'),
            'database' => $tenant->db_name,
            'username' => $tenant->db_username,
            'password' => decrypt($tenant->db_password),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ]);

        // Set as default connection for tenant context
        Config::set('database.default', $connectionName);
    }

    /**
     * Configure tenant storage
     */
    private function configureTenantStorage(Tenant $tenant): void
    {
        $storagePrefix = "tenants/{$tenant->slug}";
        
        // Configure S3 with tenant prefix
        Config::set('filesystems.disks.s3.prefix', $storagePrefix);
        
        // Configure local storage with tenant directory
        $localPath = storage_path("app/tenants/{$tenant->slug}");
        Config::set('filesystems.disks.tenant_local', [
            'driver' => 'local',
            'root' => $localPath,
            'visibility' => 'private',
        ]);
    }

    /**
     * Configure tenant cache
     */
    private function configureTenantCache(Tenant $tenant): void
    {
        $cachePrefix = "tenant_{$tenant->id}";
        Config::set('cache.prefix', $cachePrefix);
        
        // Configure Redis with tenant prefix if using Redis
        if (config('cache.default') === 'redis') {
            Config::set('database.redis.options.prefix', $cachePrefix . ':');
        }
    }

    /**
     * Configure tenant session
     */
    private function configureTenantSession(Tenant $tenant): void
    {
        $sessionConfig = config('session');
        $sessionConfig['cookie'] = "aero_hr_session_{$tenant->id}";
        $sessionConfig['domain'] = request()->getHost();
        
        Config::set('session', $sessionConfig);
    }

    /**
     * Check if this is a central domain request
     */
    private function isCentralDomain(Request $request): bool
    {
        $host = $request->getHost();
        $centralDomains = [
            config('app.central_domain', 'mysoftwaredomain.com'),
            'www.' . config('app.central_domain', 'mysoftwaredomain.com'),
            '127.0.0.1',
            'localhost'
        ];

        return in_array($host, $centralDomains);
    }

    /**
     * Check if we're in development environment
     */
    private function isDevelopmentEnvironment(string $host): bool
    {
        return in_array($host, ['127.0.0.1', 'localhost']) || 
               app()->environment('local');
    }

    /**
     * Extract subdomain from host
     */
    private function extractSubdomain(string $host): ?string
    {
        $centralDomain = config('app.central_domain', 'mysoftwaredomain.com');
        
        if (str_ends_with($host, '.' . $centralDomain)) {
            $subdomain = str_replace('.' . $centralDomain, '', $host);
            return $subdomain !== 'www' ? $subdomain : null;
        }

        return null;
    }

    /**
     * Handle tenant not found
     */
    private function handleTenantNotFound(Request $request): Response
    {
        Log::warning('Tenant not found', [
            'host' => $request->getHost(),
            'path' => $request->getPathInfo()
        ]);

        return response()->view('errors.tenant-not-found', [], 404);
    }

    /**
     * Handle invalid tenant access
     */
    private function handleInvalidTenant(Request $request, Tenant $tenant): Response
    {
        Log::warning('Invalid tenant access attempt', [
            'tenant_id' => $tenant->id,
            'tenant_slug' => $tenant->slug,
            'tenant_status' => $tenant->status,
            'subscription_status' => $tenant->subscription?->stripe_status,
            'host' => $request->getHost()
        ]);

        $reason = $this->getAccessDeniedReason($tenant);

        return response()->view('errors.tenant-access-denied', [
            'tenant' => $tenant,
            'reason' => $reason
        ], 403);
    }

    /**
     * Get reason for access denied
     */
    private function getAccessDeniedReason(Tenant $tenant): string
    {
        if ($tenant->status !== 'active') {
            return 'This tenant account is currently ' . $tenant->status . '.';
        }

        $subscription = $tenant->subscription;
        if (!$subscription) {
            return 'This tenant does not have an active subscription.';
        }

        if (!in_array($subscription->stripe_status, ['active', 'trialing'])) {
            return 'The subscription for this tenant is ' . $subscription->stripe_status . '.';
        }

        if ($subscription->ends_at && $subscription->ends_at < now()) {
            return 'The subscription for this tenant has expired.';
        }

        return 'Access to this tenant is currently restricted.';
    }
}
