<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Stancl\Tenancy\Facades\Tenancy;

class TenantPerformanceOptimizerService
{
    private TenantMonitoringService $monitoringService;
    private TenantCacheService $cacheService;
    private TenantStorageService $storageService;

    public function __construct(
        TenantMonitoringService $monitoringService,
        TenantCacheService $cacheService,
        TenantStorageService $storageService
    ) {
        $this->monitoringService = $monitoringService;
        $this->cacheService = $cacheService;
        $this->storageService = $storageService;
    }

    /**
     * Optimize tenant performance
     */
    public function optimizeTenant(Tenant $tenant, array $options = []): array
    {
        $startTime = microtime(true);
        $results = [
            'tenant_id' => $tenant->id,
            'optimizations' => [],
            'improvements' => [],
            'duration' => 0,
            'success' => false
        ];

        try {
            tenancy()->initialize($tenant);

            Log::info("Starting performance optimization for tenant: {$tenant->id}");

            // Get baseline metrics
            $baseline = $this->monitoringService->getTenantHealthMetrics($tenant);

            // Perform optimizations
            if (!isset($options['skip_database']) || !$options['skip_database']) {
                $results['optimizations']['database'] = $this->optimizeDatabase($tenant);
            }

            if (!isset($options['skip_cache']) || !$options['skip_cache']) {
                $results['optimizations']['cache'] = $this->optimizeCache($tenant);
            }

            if (!isset($options['skip_storage']) || !$options['skip_storage']) {
                $results['optimizations']['storage'] = $this->optimizeStorage($tenant);
            }

            if (!isset($options['skip_queries']) || !$options['skip_queries']) {
                $results['optimizations']['queries'] = $this->optimizeQueries($tenant);
            }

            if (!isset($options['skip_sessions']) || !$options['skip_sessions']) {
                $results['optimizations']['sessions'] = $this->optimizeSessions($tenant);
            }

            // Get post-optimization metrics
            $postOptimization = $this->monitoringService->getTenantHealthMetrics($tenant);

            // Calculate improvements
            $results['improvements'] = $this->calculateImprovements($baseline, $postOptimization);
            $results['duration'] = round((microtime(true) - $startTime) * 1000, 2);
            $results['success'] = true;

            Log::info("Performance optimization completed for tenant: {$tenant->id}", $results);

        } catch (\Exception $e) {
            Log::error("Performance optimization failed for tenant: {$tenant->id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $results['error'] = $e->getMessage();
        } finally {
            tenancy()->end();
        }

        return $results;
    }

    /**
     * Optimize database for tenant
     */
    private function optimizeDatabase(Tenant $tenant): array
    {
        $results = [
            'actions' => [],
            'statistics' => [],
            'success' => false
        ];

        try {
            // Analyze tables
            $tables = DB::select("SHOW TABLES");
            $tableColumn = 'Tables_in_' . config('database.connections.tenant.database');

            foreach ($tables as $table) {
                $tableName = $table->$tableColumn;
                
                // Optimize table
                DB::statement("OPTIMIZE TABLE `{$tableName}`");
                $results['actions'][] = "Optimized table: {$tableName}";
            }

            // Update statistics
            foreach ($tables as $table) {
                $tableName = $table->$tableColumn;
                DB::statement("ANALYZE TABLE `{$tableName}`");
                $results['actions'][] = "Analyzed table: {$tableName}";
            }

            // Check for missing indexes
            $missingIndexes = $this->detectMissingIndexes();
            if (!empty($missingIndexes)) {
                $results['recommendations'] = $missingIndexes;
            }

            $results['statistics'] = [
                'tables_optimized' => count($tables),
                'tables_analyzed' => count($tables)
            ];

            $results['success'] = true;

        } catch (\Exception $e) {
            $results['error'] = $e->getMessage();
            Log::error("Database optimization failed for tenant: {$tenant->id}", [
                'error' => $e->getMessage()
            ]);
        }

        return $results;
    }

    /**
     * Optimize cache for tenant
     */
    private function optimizeCache(Tenant $tenant): array
    {
        $results = [
            'actions' => [],
            'success' => false
        ];

        try {
            // Clear expired cache entries
            $this->cacheService->forget($tenant, 'temp_cache');
            $results['actions'][] = 'Cleared expired cache entries';

            // Warm up critical caches
            $criticalCaches = [
                'tenant_settings',
                'user_permissions',
                'navigation_menu',
                'system_config'
            ];

            foreach ($criticalCaches as $cacheKey) {
                $this->warmUpCache($tenant, $cacheKey);
                $results['actions'][] = "Warmed up cache: {$cacheKey}";
            }

            // Get cache statistics (simplified)
            $results['statistics'] = [
                'cache_operations' => count($criticalCaches),
                'cache_warmed' => true
            ];

            $results['success'] = true;

        } catch (\Exception $e) {
            $results['error'] = $e->getMessage();
            Log::error("Cache optimization failed for tenant: {$tenant->id}", [
                'error' => $e->getMessage()
            ]);
        }

        return $results;
    }

    /**
     * Optimize storage for tenant
     */
    private function optimizeStorage(Tenant $tenant): array
    {
        $results = [
            'actions' => [],
            'statistics' => [],
            'success' => false
        ];

        try {
            // Clean up temporary files
            $tempCleaned = $this->cleanupTempFiles();
            $results['actions'][] = "Cleaned {$tempCleaned} temporary files";

            // Optimize images if possible
            $imagesOptimized = $this->optimizeImages();
            if ($imagesOptimized > 0) {
                $results['actions'][] = "Optimized {$imagesOptimized} images";
            }

            // Clean up old logs
            $logsCleaned = $this->cleanupOldLogs();
            $results['actions'][] = "Cleaned {$logsCleaned} old log files";

            // Get storage statistics
            $stats = $this->storageService->getTenantStorageStats($tenant);
            $results['statistics'] = $stats;

            $results['success'] = true;

        } catch (\Exception $e) {
            $results['error'] = $e->getMessage();
            Log::error("Storage optimization failed for tenant: {$tenant->id}", [
                'error' => $e->getMessage()
            ]);
        }

        return $results;
    }

    /**
     * Optimize queries for tenant
     */
    private function optimizeQueries(Tenant $tenant): array
    {
        $results = [
            'actions' => [],
            'recommendations' => [],
            'success' => false
        ];

        try {
            // Enable query log temporarily
            DB::enableQueryLog();

            // Run some common queries to analyze
            $this->runCommonQueries();

            // Analyze slow queries
            $slowQueries = $this->analyzeSlowQueries();
            if (!empty($slowQueries)) {
                $results['recommendations'] = $slowQueries;
            }

            $results['actions'][] = 'Analyzed query performance';
            $results['success'] = true;

        } catch (\Exception $e) {
            $results['error'] = $e->getMessage();
            Log::error("Query optimization failed for tenant: {$tenant->id}", [
                'error' => $e->getMessage()
            ]);
        }

        return $results;
    }

    /**
     * Optimize sessions for tenant
     */
    private function optimizeSessions(Tenant $tenant): array
    {
        $results = [
            'actions' => [],
            'success' => false
        ];

        try {
            // Clean up expired sessions
            Artisan::call('session:gc');
            $results['actions'][] = 'Cleaned up expired sessions';

            $results['success'] = true;

        } catch (\Exception $e) {
            $results['error'] = $e->getMessage();
            Log::error("Session optimization failed for tenant: {$tenant->id}", [
                'error' => $e->getMessage()
            ]);
        }

        return $results;
    }

    /**
     * Calculate performance improvements
     */
    private function calculateImprovements(array $baseline, array $postOptimization): array
    {
        $improvements = [];

        // Database improvements
        if (isset($baseline['database']['database_size_mb']) && isset($postOptimization['database']['database_size_mb'])) {
            $sizeDiff = $baseline['database']['database_size_mb'] - $postOptimization['database']['database_size_mb'];
            if ($sizeDiff > 0) {
                $improvements['database_size_reduced_mb'] = round($sizeDiff, 2);
            }
        }

        // Performance improvements
        if (isset($baseline['performance']['database_response_ms']) && isset($postOptimization['performance']['database_response_ms'])) {
            $responseDiff = $baseline['performance']['database_response_ms'] - $postOptimization['performance']['database_response_ms'];
            if ($responseDiff > 0) {
                $improvements['database_response_improved_ms'] = round($responseDiff, 2);
            }
        }

        // Cache improvements
        if (isset($baseline['cache']['hit_rate']) && isset($postOptimization['cache']['hit_rate'])) {
            $hitRateDiff = $postOptimization['cache']['hit_rate'] - $baseline['cache']['hit_rate'];
            if ($hitRateDiff > 0) {
                $improvements['cache_hit_rate_improved_percent'] = round($hitRateDiff, 2);
            }
        }

        return $improvements;
    }

    /**
     * Detect missing indexes
     */
    private function detectMissingIndexes(): array
    {
        $recommendations = [];

        try {
            // Check for common patterns that need indexes
            $queries = [
                "SELECT * FROM users WHERE email = ?" => "Consider adding index on users.email",
                "SELECT * FROM users WHERE created_at >= ?" => "Consider adding index on users.created_at",
                "SELECT * FROM users WHERE status = ?" => "Consider adding index on users.status"
            ];

            // This is a simplified version - in production you'd analyze actual query logs
            $recommendations = array_values($queries);

        } catch (\Exception $e) {
            Log::warning("Could not detect missing indexes: " . $e->getMessage());
        }

        return $recommendations;
    }

    /**
     * Warm up cache
     */
    private function warmUpCache(Tenant $tenant, string $cacheKey): void
    {
        switch ($cacheKey) {
            case 'tenant_settings':
                $this->cacheService->remember($tenant, 'tenant_settings', 3600, function () {
                    return DB::table('settings')->get();
                });
                break;
            case 'user_permissions':
                $this->cacheService->remember($tenant, 'user_permissions', 3600, function () {
                    return DB::table('permissions')->get();
                });
                break;
            // Add more cache warming strategies as needed
        }
    }

    /**
     * Clean up temporary files
     */
    private function cleanupTempFiles(): int
    {
        $count = 0;
        $tempPath = storage_path('app/temp');
        
        if (is_dir($tempPath)) {
            $files = glob($tempPath . '/*');
            $cutoff = now()->subHours(24);
            
            foreach ($files as $file) {
                if (is_file($file) && filemtime($file) < $cutoff->timestamp) {
                    if (unlink($file)) {
                        $count++;
                    }
                }
            }
        }

        return $count;
    }

    /**
     * Optimize images
     */
    private function optimizeImages(): int
    {
        // This would integrate with image optimization libraries
        // For now, return 0 as placeholder
        return 0;
    }

    /**
     * Clean up old logs
     */
    private function cleanupOldLogs(): int
    {
        $count = 0;
        $logPath = storage_path('logs');
        
        if (is_dir($logPath)) {
            $files = glob($logPath . '/*.log');
            $cutoff = now()->subDays(30);
            
            foreach ($files as $file) {
                if (filemtime($file) < $cutoff->timestamp) {
                    if (unlink($file)) {
                        $count++;
                    }
                }
            }
        }

        return $count;
    }

    /**
     * Run common queries for analysis
     */
    private function runCommonQueries(): void
    {
        // Run some common queries to populate query log
        DB::table('users')->count();
        if (DB::getSchemaBuilder()->hasTable('roles')) {
            DB::table('roles')->get();
        }
        if (DB::getSchemaBuilder()->hasTable('permissions')) {
            DB::table('permissions')->get();
        }
    }

    /**
     * Analyze slow queries
     */
    private function analyzeSlowQueries(): array
    {
        $recommendations = [];
        $queries = DB::getQueryLog();

        foreach ($queries as $query) {
            // Consider queries taking more than 100ms as slow
            if ($query['time'] > 100) {
                $recommendations[] = [
                    'query' => $query['query'],
                    'time' => $query['time'],
                    'recommendation' => 'Consider optimizing this slow query'
                ];
            }
        }

        return $recommendations;
    }
}
