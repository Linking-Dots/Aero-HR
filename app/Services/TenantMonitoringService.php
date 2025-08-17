<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class TenantMonitoringService
{
    /**
     * Get comprehensive tenant health metrics
     */
    public function getTenantHealthMetrics(Tenant $tenant): array
    {
        try {
            tenancy()->initialize($tenant);
            
            $metrics = [
                'tenant_info' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'status' => $tenant->status,
                    'created_at' => $tenant->created_at,
                ],
                'database' => $this->getDatabaseMetrics(),
                'users' => $this->getUserMetrics(),
                'performance' => $this->getPerformanceMetrics($tenant),
                'storage' => $this->getStorageMetrics($tenant),
                'cache' => $this->getCacheMetrics($tenant),
                'last_checked' => now()->toISOString()
            ];
            
            return $metrics;
        } catch (\Exception $e) {
            Log::error('Failed to get tenant health metrics', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => $e->getMessage(),
                'tenant_id' => $tenant->id,
                'last_checked' => now()->toISOString()
            ];
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Get database metrics for tenant
     */
    private function getDatabaseMetrics(): array
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $tableCount = count($tables);
            
            $totalRecords = 0;
            $tableStats = [];
            
            foreach ($tables as $table) {
                $tableName = array_values((array) $table)[0];
                $count = DB::table($tableName)->count();
                $totalRecords += $count;
                $tableStats[$tableName] = $count;
            }
            
            // Get database size
            $dbName = DB::getDatabaseName();
            $sizeQuery = DB::select("
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.tables 
                WHERE table_schema = ?
            ", [$dbName]);
            
            $dbSize = $sizeQuery[0]->size_mb ?? 0;
            
            return [
                'table_count' => $tableCount,
                'total_records' => $totalRecords,
                'database_size_mb' => $dbSize,
                'tables' => $tableStats
            ];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'table_count' => 0,
                'total_records' => 0,
                'database_size_mb' => 0
            ];
        }
    }

    /**
     * Get user activity metrics
     */
    private function getUserMetrics(): array
    {
        try {
            $totalUsers = User::count();
            $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))->count();
            $newUsersThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
            $lastLogin = User::orderBy('last_login_at', 'desc')->first();
            
            return [
                'total_users' => $totalUsers,
                'active_users_30d' => $activeUsers,
                'new_users_this_month' => $newUsersThisMonth,
                'last_login' => $lastLogin ? $lastLogin->last_login_at : null,
                'activity_rate' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 2) : 0
            ];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'total_users' => 0,
                'active_users_30d' => 0,
                'new_users_this_month' => 0
            ];
        }
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics(Tenant $tenant): array
    {
        try {
            // Simulate performance checks
            $startTime = microtime(true);
            
            // Test database connection speed
            DB::select('SELECT 1');
            $dbResponseTime = (microtime(true) - $startTime) * 1000;
            
            // Test cache response time
            $cacheStartTime = microtime(true);
            Cache::get('test_key', 'test_value');
            $cacheResponseTime = (microtime(true) - $cacheStartTime) * 1000;
            
            return [
                'database_response_ms' => round($dbResponseTime, 2),
                'cache_response_ms' => round($cacheResponseTime, 2),
                'uptime_hours' => $this->calculateTenantUptime($tenant),
                'status' => $this->getPerformanceStatus($dbResponseTime, $cacheResponseTime)
            ];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'database_response_ms' => 0,
                'cache_response_ms' => 0,
                'status' => 'error'
            ];
        }
    }

    /**
     * Get storage metrics using TenantStorageService
     */
    private function getStorageMetrics(Tenant $tenant): array
    {
        try {
            $storageService = app(TenantStorageService::class);
            return $storageService->getTenantStorageStats($tenant);
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'total_size' => 0,
                'file_count' => 0
            ];
        }
    }

    /**
     * Get cache metrics using TenantCacheService
     */
    private function getCacheMetrics(Tenant $tenant): array
    {
        try {
            $cacheService = app(TenantCacheService::class);
            return $cacheService->getTenantCacheStats($tenant);
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'total_keys' => 0,
                'memory_usage' => 0
            ];
        }
    }

    /**
     * Calculate tenant uptime
     */
    private function calculateTenantUptime(Tenant $tenant): float
    {
        $created = Carbon::parse($tenant->created_at);
        return $created->diffInHours(now());
    }

    /**
     * Determine performance status
     */
    private function getPerformanceStatus(float $dbTime, float $cacheTime): string
    {
        if ($dbTime > 1000 || $cacheTime > 100) {
            return 'poor';
        } elseif ($dbTime > 500 || $cacheTime > 50) {
            return 'fair';
        } else {
            return 'good';
        }
    }

    /**
     * Check tenant health and return status
     */
    public function checkTenantHealth(Tenant $tenant): array
    {
        $metrics = $this->getTenantHealthMetrics($tenant);
        
        $healthScore = 100;
        $issues = [];
        
        // Check database performance
        if (isset($metrics['performance']['database_response_ms']) && 
            $metrics['performance']['database_response_ms'] > 1000) {
            $healthScore -= 20;
            $issues[] = 'Slow database response time';
        }
        
        // Check user activity
        if (isset($metrics['users']['activity_rate']) && 
            $metrics['users']['activity_rate'] < 10) {
            $healthScore -= 10;
            $issues[] = 'Low user activity rate';
        }
        
        // Check storage usage
        if (isset($metrics['storage']['total_size']) && 
            $metrics['storage']['total_size'] > 1024 * 1024 * 1024) { // 1GB
            $healthScore -= 15;
            $issues[] = 'High storage usage';
        }
        
        return [
            'health_score' => max(0, $healthScore),
            'status' => $this->getHealthStatus($healthScore),
            'issues' => $issues,
            'metrics' => $metrics
        ];
    }

    /**
     * Get health status based on score
     */
    private function getHealthStatus(int $score): string
    {
        if ($score >= 90) return 'excellent';
        if ($score >= 75) return 'good';
        if ($score >= 60) return 'fair';
        if ($score >= 40) return 'poor';
        return 'critical';
    }

    /**
     * Generate tenant health report
     */
    public function generateHealthReport(Tenant $tenant): array
    {
        $health = $this->checkTenantHealth($tenant);
        
        return [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'status' => $tenant->status
            ],
            'health' => $health,
            'recommendations' => $this->generateRecommendations($health),
            'generated_at' => now()->toISOString()
        ];
    }

    /**
     * Generate recommendations based on health metrics
     */
    private function generateRecommendations(array $health): array
    {
        $recommendations = [];
        
        foreach ($health['issues'] as $issue) {
            switch ($issue) {
                case 'Slow database response time':
                    $recommendations[] = 'Consider optimizing database queries or upgrading database resources';
                    break;
                case 'Low user activity rate':
                    $recommendations[] = 'Review user engagement strategies and provide training resources';
                    break;
                case 'High storage usage':
                    $recommendations[] = 'Archive old files or upgrade storage plan';
                    break;
            }
        }
        
        if (empty($recommendations)) {
            $recommendations[] = 'Tenant is performing well - no immediate action required';
        }
        
        return $recommendations;
    }
}
