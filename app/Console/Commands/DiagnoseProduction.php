<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class DiagnoseProduction extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:diagnose-production';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Diagnose production deployment issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Laravel Application Diagnostics');
        $this->info('================================');

        // 1. Check Laravel version and environment
        $this->info('1. Application Status:');
        $this->info('   Laravel Version: ' . app()->version());
        $this->info('   Environment: ' . app()->environment());
        $this->info('   Debug Mode: ' . (config('app.debug') ? 'ON' : 'OFF'));
        $this->info('   APP_URL: ' . config('app.url'));
        $this->info('');

        // 2. Check file permissions
        $this->info('2. File Permissions:');
        $storagePath = storage_path();
        $bootstrapCachePath = base_path('bootstrap/cache');
        
        $this->info('   Storage Directory: ' . $storagePath);
        $this->info('   Storage Writable: ' . (is_writable($storagePath) ? '✓ YES' : '✗ NO'));
        $this->info('   Bootstrap Cache: ' . $bootstrapCachePath);
        $this->info('   Bootstrap Cache Writable: ' . (is_writable($bootstrapCachePath) ? '✓ YES' : '✗ NO'));
        $this->info('');

        // 3. Check database connection
        $this->info('3. Database Status:');
        try {
            DB::connection()->getPdo();
            $this->info('   Database Connection: ✓ CONNECTED');
            
            // Check migrations
            $migrationStatus = Artisan::call('migrate:status');
            $this->info('   Migration Status: ✓ OK');
        } catch (\Exception $e) {
            $this->error('   Database Connection: ✗ FAILED');
            $this->error('   Error: ' . $e->getMessage());
        }
        $this->info('');

        // 4. Check tenancy configuration
        $this->info('4. Tenancy Configuration:');
        $centralDomains = config('tenancy.central_domains');
        $this->info('   Central Domains: ' . implode(', ', $centralDomains));
        
        // Check if current domain is in central domains
        $currentDomain = request()->getHost();
        $isCentralDomain = in_array($currentDomain, $centralDomains);
        $this->info('   Current Domain: ' . $currentDomain);
        $this->info('   Is Central Domain: ' . ($isCentralDomain ? '✓ YES' : '✗ NO'));
        $this->info('');

        // 5. Check routes
        $this->info('5. Route Status:');
        try {
            $routes = Route::getRoutes();
            $this->info('   Routes: ✓ LOADED');
        } catch (\Exception $e) {
            $this->error('   Routes: ✗ FAILED');
        }
        
        // Check if specific routes exist
        $centralRoutes = ['landing.home', 'admin.dashboard'];
        foreach ($centralRoutes as $routeName) {
            $routeExists = Route::has($routeName);
            $this->info('   Route "' . $routeName . '": ' . ($routeExists ? '✓ EXISTS' : '✗ MISSING'));
        }
        $this->info('');

        // 6. Check key directories and files
        $this->info('6. Critical Files:');
        $criticalFiles = [
            'public/.htaccess' => public_path('.htaccess'),
            'public/index.php' => public_path('index.php'),
            '.env' => base_path('.env'),
            'composer.lock' => base_path('composer.lock'),
        ];

        foreach ($criticalFiles as $description => $path) {
            $exists = file_exists($path);
            $this->info('   ' . $description . ': ' . ($exists ? '✓ EXISTS' : '✗ MISSING'));
        }
        $this->info('');

        // 7. Generate suggestions
        $this->info('7. Recommendations:');
        
        if (!is_writable($storagePath)) {
            $this->warn('   → Set storage permissions: chmod -R 775 storage');
        }
        
        if (!is_writable($bootstrapCachePath)) {
            $this->warn('   → Set cache permissions: chmod -R 775 bootstrap/cache');
        }
        
        if (!in_array($currentDomain, $centralDomains)) {
            $this->warn('   → Add "' . $currentDomain . '" to central_domains in config/tenancy.php');
        }
        
        if (!file_exists(public_path('.htaccess'))) {
            $this->warn('   → Create .htaccess file in public directory');
        }

        $this->info('');
        $this->info('🎯 Quick Tests:');
        $this->info('   1. Check if index.php works directly: ' . config('app.url') . '/index.php');
        $this->info('   2. Check web server error logs');
        $this->info('   3. Verify document root points to: ' . public_path());

        return Command::SUCCESS;
    }
}
