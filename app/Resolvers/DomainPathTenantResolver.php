<?php

namespace App\Resolvers;

use App\Models\Domain;
use Stancl\Tenancy\Contracts\Tenant;
use Stancl\Tenancy\Resolvers\Contracts\CachedTenantResolver;

class DomainPathTenantResolver extends CachedTenantResolver
{
    /**
     * The cache key prefix.
     */
    public static string $cacheKeyPrefix = 'tenancy.tenant.domain_path.';

    /**
     * Resolve tenant from route parameter by looking up domain.
     */
    public function resolveWithoutCache(...$args): Tenant
    {
        /** @var \Illuminate\Routing\Route $route */
        $route = $args[0];
        
        // Get the domain from the path parameter
        $domainName = $route->parameter('tenant');
        
        if (!$domainName) {
            throw new \Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedByPathException($domainName);
        }
        
        // Find the domain record
        $domain = Domain::where('domain', $domainName)->first();
        
        if (!$domain) {
            throw new \Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedByPathException($domainName);
        }
        
        // Return the associated tenant
        return $domain->tenant;
    }

    /**
     * Get cache key for the given arguments.
     */
    public function getCacheKey(...$args): string
    {
        /** @var \Illuminate\Routing\Route $route */
        $route = $args[0];
        $domainName = $route->parameter('tenant');
        
        return static::$cacheKeyPrefix . $domainName;
    }

    /**
     * Get arguments for the given tenant.
     */
    public function getArgsForTenant(Tenant $tenant): array
    {
        // Get the domain for this tenant
        $domain = $tenant->domains()->first();
        
        return $domain ? [$domain->domain] : [];
    }
}
