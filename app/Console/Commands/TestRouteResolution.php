<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

class TestRouteResolution extends Command
{
    protected $signature = 'test:routes';
    protected $description = 'Test route resolution for debugging';

    public function handle()
    {
        $this->info('Testing route resolution...');
        
        try {
            $centralLogin = route('central.login');
            $this->info("✅ central.login resolves to: {$centralLogin}");
        } catch (\Exception $e) {
            $this->error("❌ central.login failed: " . $e->getMessage());
        }
        
        try {
            $adminDashboard = route('admin.dashboard');
            $this->info("✅ admin.dashboard resolves to: {$adminDashboard}");
        } catch (\Exception $e) {
            $this->error("❌ admin.dashboard failed: " . $e->getMessage());
        }
        
        $this->info('Route list check:');
        $routes = Route::getRoutes();
        $centralRoutes = 0;
        $adminRoutes = 0;
        
        foreach ($routes as $route) {
            $name = $route->getName();
            if ($name && str_starts_with($name, 'central.')) {
                $centralRoutes++;
            }
            if ($name && str_starts_with($name, 'admin.')) {
                $adminRoutes++;
            }
        }
        
        $this->info("Found {$centralRoutes} central.* routes");
        $this->info("Found {$adminRoutes} admin.* routes");
        
        // Check tenant function
        $this->info('Checking tenant context:');
        if (function_exists('tenant')) {
            $tenant = tenant();
            if ($tenant) {
                $this->info("Current tenant: {$tenant->domain}");
            } else {
                $this->info("No tenant context (central domain)");
            }
        } else {
            $this->error("tenant() function not available");
        }
    }
}
