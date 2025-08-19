<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Request;

class DomainServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Configure URL generation based on request domain
        $this->configureUrlGeneration();
        
        // Configure asset URLs for multi-tenant setup
        $this->configureAssetUrls();
    }

    /**
     * Configure URL generation for multi-tenant setup
     */
    private function configureUrlGeneration(): void
    {
        $request = Request::instance();
        $host = $request->getHost();
        
        // Allow both HTTP and HTTPS, don't force scheme
        // Set the root URL to match current scheme
        URL::forceRootUrl($request->getSchemeAndHttpHost());
    }

    /**
     * Configure asset URLs to work with the current domain
     */
    private function configureAssetUrls(): void
    {
        // Ensure Vite assets use the correct domain
        if (app()->hasBeenBootstrapped()) {
            $request = Request::instance();
            $host = $request->getHost();
            
            // Set the asset URL to match the current domain
            if (!in_array($host, ['localhost', '127.0.0.1'])) {
                config(['app.asset_url' => $request->getScheme() . '://' . $host]);
            }
        }
    }
}
