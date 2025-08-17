<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Stancl\Tenancy\Facades\Tenancy;

class TenantRedirectController extends Controller
{
    /**
     * Generate the correct tenant login URL based on environment
     */
    public function loginUrl(?string $domain = null): string
    {
        if (!$domain && Tenancy::initialized()) {
            $domain = tenant('domains')->first()?->domain;
        }

        if (!$domain) {
            return route('central.login');
        }

        // Development: path-based routing
        if (app()->environment('local') && in_array(request()->getHost(), ['127.0.0.1', 'localhost'])) {
            return URL::to("/tenant/{$domain}/login");
        }

        // Production: subdomain routing
        $centralDomain = config('tenancy.central_domains')[0] ?? 'mysoftwaredomain.com';
        return "https://{$domain}/login";
    }

    /**
     * Generate the correct tenant dashboard URL
     */
    public function dashboardUrl(?string $domain = null): string
    {
        if (!$domain && Tenancy::initialized()) {
            $domain = tenant('domains')->first()?->domain;
        }

        if (!$domain) {
            return route('central.dashboard', [], false) ?? '/';
        }

        // Development: path-based routing
        if (app()->environment('local') && in_array(request()->getHost(), ['127.0.0.1', 'localhost'])) {
            return URL::to("/tenant/{$domain}/dashboard");
        }

        // Production: subdomain routing
        return "https://{$domain}/dashboard";
    }

    /**
     * Redirect authenticated user to appropriate dashboard
     */
    public function redirectToDashboard(Request $request)
    {
        if (!Auth::check()) {
            return redirect($this->loginUrl());
        }

        return redirect($this->dashboardUrl());
    }

    /**
     * Handle logout and redirect to appropriate location
     */
    public function handleLogout(Request $request)
    {
        $domain = null;
        if (Tenancy::initialized()) {
            $domain = tenant('domains')->first()?->domain;
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect to tenant login or central home
        if ($domain) {
            return redirect($this->loginUrl($domain));
        }

        return redirect()->route('landing.home');
    }
}
