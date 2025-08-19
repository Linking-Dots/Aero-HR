<?php

namespace App\Http\Middleware;

use App\Models\Domain;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;
use Stancl\Tenancy\Tenancy;

class InitializeTenancyByDomainPath extends InitializeTenancyByPath
{
    /**
     * Resolve the tenant by looking up the domain in the path parameter.
     */
    protected function resolveTenant($request)
    {
        $tenantId = $request->route('tenant');
        
        if (!$tenantId) {
            throw new \Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedByPathException($tenantId);
        }
        
        // Look up the domain record to find the tenant
        $domain = Domain::where('domain', $tenantId)->first();
        
        if (!$domain) {
            throw new \Stancl\Tenancy\Exceptions\TenantCouldNotBeIdentifiedByPathException($tenantId);
        }
        
        return $domain->tenant;
    }

    /**
     * Handle an incoming request.
     */
    public function handle($request, $next)
    {
        $tenant = $this->resolveTenant($request);
        
        tenancy()->initialize($tenant);
        
        return $next($request);
    }
}
