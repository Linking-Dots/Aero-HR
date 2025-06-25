<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class RefreshCsrfToken
{
    public function handle(Request $request, Closure $next)
    {
        // Refresh CSRF token on every request
        $request->session()->regenerateToken();
        
        // Add CSRF token to response headers
        $response = $next($request);
        $response->headers->set('X-CSRF-TOKEN', $request->session()->token());
        
        return $response;
    }
}
