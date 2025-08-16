<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add essential web middleware stack
        $middleware->web(prepend: [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
        ]);
        
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\TrackSecurityActivity::class,
        ]);
        
        // Configure CSRF exclusions
        $middleware->validateCsrfTokens(except: [
            'check-user-type',
            'check-domain',
            'login',
            'register',
            '*/login',
            '*/register',
        ]);        // Register custom middleware aliases
        $middleware->alias([
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'custom_permission' => \App\Http\Middleware\CheckPermission::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'api_security' => \App\Http\Middleware\ApiSecurityMiddleware::class,
            'security_headers' => \App\Http\Middleware\SecurityHeaders::class,
            'enhanced_rate_limit' => \App\Http\Middleware\EnhancedRateLimit::class,
            'role_permission_sync' => \App\Http\Middleware\EnsureRolePermissionSync::class,
            'track_security' => \App\Http\Middleware\TrackSecurityActivity::class,
        ]);
        
        // Configure authentication redirect
        $middleware->redirectTo(function ($request) {
            if (function_exists('tenant') && tenant()) {
                $tenant = tenant();
                return route('tenant.login', ['tenant' => $tenant->domain]);
            }
            return route('central.login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
