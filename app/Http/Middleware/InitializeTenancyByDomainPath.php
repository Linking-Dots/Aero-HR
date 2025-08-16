<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Tenancy;
use Stancl\Tenancy\Resolvers\DomainTenantResolver;
use App\Models\Tenant;

class InitializeTenancyByDomainPath
{
    /** @var callable|null */
    public static $onFail;

    /** @var Tenancy */
    protected $tenancy;

    /** @var DomainTenantResolver */
    protected $resolver;

    public function __construct(Tenancy $tenancy, DomainTenantResolver $resolver)
    {
        $this->tenancy = $tenancy;
        $this->resolver = $resolver;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Get domain from path parameter
        $domain = $request->route('tenant');
        
        if (!$domain) {
            return $this->handleFailure($request, $next);
        }

        // Find tenant by domain
        $tenant = Tenant::where('domain', $domain)->first();
        
        if (!$tenant) {
            return $this->handleFailure($request, $next);
        }

        // Initialize tenancy
        $this->tenancy->initialize($tenant);

        return $next($request);
    }

    protected function handleFailure(Request $request, Closure $next)
    {
        if (static::$onFail) {
            return call_user_func(static::$onFail, $request, $next);
        }

        abort(404, 'Tenant not found.');
    }
}
