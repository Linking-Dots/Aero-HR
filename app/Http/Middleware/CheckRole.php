<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $role)
    {
        // Check if the authenticated user has the required role
        if (!Auth::check() || !$request->user()->hasRole($role)) {
            // If not authorized, return unauthorized response
            abort(403, 'Unauthorized');
        }

        // Proceed to the next request if authorized
        return $next($request);
    }
}
