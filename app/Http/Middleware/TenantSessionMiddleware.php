<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Stancl\Tenancy\Facades\Tenancy;

class TenantSessionMiddleware
{
    /**
     * Handle an incoming request.
     * Ensures proper session isolation per tenant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Only apply session isolation if we're in a tenant context
        if (Tenancy::initialized()) {
            $tenant = tenant();
            
            // Set tenant-specific session configuration
            $sessionConfig = Config::get('session');
            $sessionConfig['cookie'] = 'aero_hr_session_' . $tenant->id;
            $sessionConfig['domain'] = $request->getHost();
            
            Config::set('session', $sessionConfig);
            
            // Ensure cache is also tenant-specific for session storage
            if ($sessionConfig['driver'] === 'cache') {
                Config::set('session.store', 'tenant_' . $tenant->id);
            }
        }

        return $next($request);
    }
}
