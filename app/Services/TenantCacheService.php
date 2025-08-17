<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class TenantCacheService
{
    /**
     * Get tenant-specific cache key
     */
    private function getTenantCacheKey(Tenant $tenant, string $key): string
    {
        return "tenant:{$tenant->id}:{$key}";
    }

    /**
     * Store data in tenant-specific cache
     */
    public function put(Tenant $tenant, string $key, $value, $ttl = 3600): bool
    {
        try {
            $cacheKey = $this->getTenantCacheKey($tenant, $key);
            Cache::put($cacheKey, $value, $ttl);
            
            Log::debug('Tenant cache stored', [
                'tenant_id' => $tenant->id,
                'key' => $key,
                'ttl' => $ttl
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to store tenant cache', [
                'tenant_id' => $tenant->id,
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get data from tenant-specific cache
     */
    public function get(Tenant $tenant, string $key, $default = null)
    {
        try {
            $cacheKey = $this->getTenantCacheKey($tenant, $key);
            return Cache::get($cacheKey, $default);
        } catch (\Exception $e) {
            Log::error('Failed to get tenant cache', [
                'tenant_id' => $tenant->id,
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return $default;
        }
    }

    /**
     * Remember data in tenant-specific cache
     */
    public function remember(Tenant $tenant, string $key, $ttl, \Closure $callback)
    {
        try {
            $cacheKey = $this->getTenantCacheKey($tenant, $key);
            return Cache::remember($cacheKey, $ttl, $callback);
        } catch (\Exception $e) {
            Log::error('Failed to remember tenant cache', [
                'tenant_id' => $tenant->id,
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return $callback();
        }
    }

    /**
     * Forget tenant-specific cache key
     */
    public function forget(Tenant $tenant, string $key): bool
    {
        try {
            $cacheKey = $this->getTenantCacheKey($tenant, $key);
            return Cache::forget($cacheKey);
        } catch (\Exception $e) {
            Log::error('Failed to forget tenant cache', [
                'tenant_id' => $tenant->id,
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Clear all cache for a tenant
     */
    public function clearTenantCache(Tenant $tenant): bool
    {
        try {
            $pattern = "tenant:{$tenant->id}:*";
            
            if (config('cache.default') === 'redis') {
                $keys = Redis::keys($pattern);
                if (!empty($keys)) {
                    Redis::del($keys);
                }
            } else {
                // For file-based cache, we'll need to iterate through known keys
                // This is less efficient but works for development
                $knownKeys = [
                    'dashboard_stats',
                    'user_count',
                    'recent_activities',
                    'settings',
                    'permissions_cache'
                ];
                
                foreach ($knownKeys as $key) {
                    $this->forget($tenant, $key);
                }
            }
            
            Log::info('Tenant cache cleared', [
                'tenant_id' => $tenant->id
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to clear tenant cache', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get tenant cache statistics
     */
    public function getTenantCacheStats(Tenant $tenant): array
    {
        try {
            $stats = [
                'total_keys' => 0,
                'memory_usage' => 0,
                'hit_rate' => 0,
                'active_keys' => []
            ];

            if (config('cache.default') === 'redis') {
                $pattern = "tenant:{$tenant->id}:*";
                $keys = Redis::keys($pattern);
                $stats['total_keys'] = count($keys);
                
                foreach ($keys as $key) {
                    $ttl = Redis::ttl($key);
                    $stats['active_keys'][] = [
                        'key' => str_replace("tenant:{$tenant->id}:", '', $key),
                        'ttl' => $ttl > 0 ? $ttl : 'persistent'
                    ];
                }
            }

            return $stats;
        } catch (\Exception $e) {
            Log::error('Failed to get tenant cache stats', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'total_keys' => 0,
                'memory_usage' => 0,
                'hit_rate' => 0,
                'active_keys' => [],
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Warm up tenant cache with common data
     */
    public function warmUpTenantCache(Tenant $tenant): bool
    {
        try {
            tenancy()->initialize($tenant);
            
            // Cache common data that's frequently accessed
            $this->remember($tenant, 'user_count', 3600, function () {
                return \App\Models\User::count();
            });
            
            $this->remember($tenant, 'active_users_count', 1800, function () {
                return \App\Models\User::where('last_login_at', '>=', now()->subDays(30))->count();
            });
            
            // Cache tenant settings
            $this->remember($tenant, 'tenant_settings', 7200, function () use ($tenant) {
                return $tenant->data ?? [];
            });
            
            Log::info('Tenant cache warmed up', [
                'tenant_id' => $tenant->id
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to warm up tenant cache', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            return false;
        } finally {
            tenancy()->end();
        }
    }
}
