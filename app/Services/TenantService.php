<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Domain;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TenantService
{
    /**
     * Create a new tenant using package standards
     */
    public function createTenant(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            try {
                // Create tenant record using package standards
                $tenant = Tenant::create([
                    'id' => (string) Str::uuid(),
                    'name' => $data['name'],
                    'status' => 'active',
                    'data' => $data['settings'] ?? []
                ]);

                // Create domain record for the tenant
                $domain = $data['domain'] ?? Str::slug($data['name']);
                
                Domain::create([
                    'domain' => $domain,
                    'tenant_id' => $tenant->id,
                    'is_primary' => true
                ]);

                Log::info('Tenant created successfully', [
                    'tenant_id' => $tenant->id,
                    'name' => $tenant->name,
                    'domain' => $domain
                ]);

                return $tenant;

            } catch (\Exception $e) {
                Log::error('Failed to create tenant', [
                    'error' => $e->getMessage(),
                    'data' => $data
                ]);
                throw $e;
            }
        });
    }

    /**
     * Get tenant by domain using package standards
     */
    public function getTenantByDomain(string $domain): ?Tenant
    {
        $domainModel = Domain::where('domain', $domain)->first();
        return $domainModel ? $domainModel->tenant : null;
    }

    /**
     * Get user's accessible tenants using package standards
     */
    public function getUserTenants(string $email): array
    {
        $tenants = [];
        
        foreach (Tenant::with('domains')->get() as $tenant) {
            try {
                tenancy()->initialize($tenant);
                
                $user = User::where('email', $email)->first();
                if ($user) {
                    $domain = $tenant->domains()->first();
                    $tenants[] = [
                        'tenant' => $tenant,
                        'domain' => $domain,
                        'user' => $user
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Error checking user access to tenant', [
                    'email' => $email,
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
            } finally {
                tenancy()->end();
            }
        }

        return $tenants;
    }

    /**
     * Get tenant statistics
     */
    public function getTenantStats(Tenant $tenant): array
    {
        try {
            tenancy()->initialize($tenant);
            
            $userCount = User::count();
            $activeUsers = User::whereNotNull('last_login_at')
                ->where('last_login_at', '>=', now()->subDays(30))
                ->count();
            
            $lastLogin = User::whereNotNull('last_login_at')
                ->orderBy('last_login_at', 'desc')
                ->first();

            return [
                'users_count' => $userCount,
                'active_users' => $activeUsers,
                'last_login' => $lastLogin ? $lastLogin->last_login_at : null
            ];
            
        } catch (\Exception $e) {
            Log::error('Error getting tenant stats', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'users_count' => 0,
                'active_users' => 0,
                'last_login' => null
            ];
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Delete tenant using package standards
     */
    public function deleteTenant(Tenant $tenant): bool
    {
        try {
            // The package handles database cleanup automatically
            $tenant->delete();
            
            Log::info('Tenant deleted successfully', [
                'tenant_id' => $tenant->id,
                'name' => $tenant->name
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to delete tenant', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Check if tenant domain is available
     */
    public function isDomainAvailable(string $domain): bool
    {
        return !Domain::where('domain', $domain)->exists();
    }

    /**
     * Get tenant by ID with relations
     */
    public function getTenantWithDetails(string $tenantId): ?Tenant
    {
        return Tenant::with('domains')->find($tenantId);
    }

    /**
     * Update tenant information
     */
    public function updateTenant(Tenant $tenant, array $data): bool
    {
        try {
            $tenant->update([
                'name' => $data['name'] ?? $tenant->name,
                'status' => $data['status'] ?? $tenant->status,
                'data' => array_merge($tenant->data ?? [], $data['settings'] ?? [])
            ]);

            Log::info('Tenant updated successfully', [
                'tenant_id' => $tenant->id,
                'changes' => $data
            ]);

            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to update tenant', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Initialize tenant with advanced features
     */
    public function initializeTenantAdvancedFeatures(Tenant $tenant): array
    {
        $results = [
            'success' => false,
            'storage_initialized' => false,
            'cache_initialized' => false,
            'features_enabled' => []
        ];

        try {
            // Initialize storage
            $storageService = app(TenantStorageService::class);
            $storageService->createTenantStorage($tenant);
            $results['storage_initialized'] = true;
            $results['features_enabled'][] = 'storage';

            // Initialize cache
            $cacheService = app(TenantCacheService::class);
            $cacheService->put($tenant, 'advanced_features_initialized', true, 3600);
            $results['cache_initialized'] = true;
            $results['features_enabled'][] = 'cache';

            $results['success'] = true;

            Log::info('Tenant advanced features initialized', [
                'tenant_id' => $tenant->id,
                'results' => $results
            ]);

            return $results;
        } catch (\Exception $e) {
            Log::error('Failed to initialize tenant advanced features', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            $results['error'] = $e->getMessage();
            return $results;
        }
    }

    /**
     * Get comprehensive tenant overview
     */
    public function getTenantOverview(Tenant $tenant): array
    {
        try {
            $monitoringService = app(TenantMonitoringService::class);
            $storageService = app(TenantStorageService::class);

            return [
                'basic_stats' => $this->getTenantStats($tenant),
                'health_metrics' => $monitoringService->getTenantHealthMetrics($tenant),
                'storage_stats' => $storageService->getTenantStorageStats($tenant),
                'overview_generated_at' => now()->toISOString()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get tenant overview', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => $e->getMessage(),
                'tenant_id' => $tenant->id
            ];
        }
    }

    /**
     * Perform tenant maintenance
     */
    public function performTenantMaintenance(Tenant $tenant, array $options = []): array
    {
        $results = [
            'success' => false,
            'cache_cleared' => false,
            'storage_cleaned' => false,
            'health_checked' => false,
            'backup_created' => false,
            'maintenance_completed_at' => now()->toISOString()
        ];

        try {
            // Clear cache if requested
            if ($options['cache'] ?? false) {
                $cacheService = app(TenantCacheService::class);
                $cacheService->forget($tenant, 'temp_maintenance');
                $results['cache_cleared'] = true;
            }

            // Check health
            $monitoringService = app(TenantMonitoringService::class);
            $health = $monitoringService->checkTenantHealth($tenant);
            $results['health_checked'] = true;
            $results['health_score'] = $health['health_score'];

            // Create backup if requested
            if ($options['backup'] ?? false) {
                $storageService = app(TenantStorageService::class);
                $backup = $storageService->createTenantBackup($tenant);
                $results['backup_created'] = !is_null($backup);
                if ($backup) {
                    $results['backup_file'] = $backup;
                }
            }

            $results['success'] = true;

            Log::info('Tenant maintenance completed', [
                'tenant_id' => $tenant->id,
                'results' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Tenant maintenance failed', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage()
            ]);
            $results['error'] = $e->getMessage();
        }

        return $results;
    }
}