<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\AuthManager;
use Illuminate\Foundation\Application;

class AuthRedirectServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure Laravel's default authentication redirect
        Application::$redirectToRoute = function ($request) {
            // Check if we're in a tenant context
            if (function_exists('tenant') && tenant()) {
                $tenant = tenant();
                return route('tenant.login', ['tenant' => $tenant->domain]);
            }
            
            // Check if request is for a tenant route but no tenant is resolved
            if ($request->route() && str_contains($request->route()->getName() ?? '', 'tenant.')) {
                // Extract tenant from URL if possible
                $path = $request->path();
                if (preg_match('/^tenant\/([^\/]+)/', $path, $matches)) {
                    return route('tenant.login', ['tenant' => $matches[1]]);
                }
            }
            
            // Default to central login
            return route('central.login');
        };
    }
}
