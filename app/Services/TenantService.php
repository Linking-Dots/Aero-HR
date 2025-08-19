<?php

namespace App\Services;

use App\Models\Domain;
use App\Models\Tenant;
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
        try {
            // Create tenant record using package standards
            $tenant = Tenant::create([
                'id' => (string) Str::uuid(),
                'name' => $data['name'],
                'slug' => $data['domain'] ?? Str::slug($data['name']),
                'status' => 'active',
                'data' => $data['settings'] ?? [],
            ]);

            // Create domain record for the tenant
            $domain = $data['domain'] ?? Str::slug($data['name']);

            Domain::create([
                'domain' => $domain,
                'tenant_id' => $tenant->id,
                'is_primary' => true,
            ]);

            Log::info('Tenant created successfully', [
                'tenant_id' => $tenant->id,
                'name' => $tenant->name,
                'domain' => $domain,
            ]);

            return $tenant;

        } catch (\Exception $e) {
            Log::error('Failed to create tenant', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Create a complete tenant with user - used for registration flow
     */
    public function createTenantWithUser(array $companyData, array $userData): Tenant
    {
        try {
            // Create the tenant
            $tenant = $this->createTenant($companyData);
            
            // Seed tenant defaults (includes migrations)
            $this->seedTenantDefaults($tenant);
            
            // Create the tenant owner
            $user = $this->createTenantOwner($tenant, $userData);
            
            Log::info('Complete tenant creation successful', [
                'tenant_id' => $tenant->id,
                'user_email' => $user->email,
            ]);
            
            return $tenant;
            
        } catch (\Exception $e) {
            Log::error('Failed to create complete tenant', [
                'error' => $e->getMessage(),
                'company_data' => $companyData,
                'user_data' => collect($userData)->except(['password'])->toArray(),
            ]);
            throw $e;
        }
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
                        'user' => $user,
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Error checking user access to tenant', [
                    'email' => $email,
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage(),
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
                'last_login' => $lastLogin ? $lastLogin->last_login_at : null,
            ];

        } catch (\Exception $e) {
            Log::error('Error getting tenant stats', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'users_count' => 0,
                'active_users' => 0,
                'last_login' => null,
            ];
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Create tenant owner user within the tenant database
     */
    public function createTenantOwner(Tenant $tenant, array $userData): User
    {
        try {
            // Initialize tenant context to work with tenant database
            tenancy()->initialize($tenant);

            // Create the super administrator user in the tenant database
            $user = User::create([
                'name' => $userData['name'],
                'user_name' => $userData['name'], // Required field
                'email' => $userData['email'],
                'password' => bcrypt($userData['password']),
                'email_verified_at' => now(), // Auto-verify email for owner
                'is_active' => true,
            ]);

            // Assign Super Administrator role if using Spatie permissions
            if (class_exists('\Spatie\Permission\Models\Role')) {
                $superAdminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Super Administrator']);
                $user->assignRole($superAdminRole);
            }

            Log::info('Tenant owner created successfully', [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return $user;

        } catch (\Exception $e) {
            Log::error('Failed to create tenant owner', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
                'userData' => array_diff_key($userData, array_flip(['password'])),
            ]);
            throw $e;
        } finally {
            // Always end tenant context
            tenancy()->end();
        }
    }

    /**
     * Seed default data for a new tenant
     */
    public function seedTenantDefaults(Tenant $tenant): bool
    {
        try {
            // Initialize tenant context
            tenancy()->initialize($tenant);

            // Run tenant migrations first
            $this->runTenantMigrations($tenant);

            // Seed default roles and permissions
            $this->seedDefaultRoles();

            // Seed default settings
            $this->seedDefaultSettings($tenant);

            Log::info('Tenant defaults seeded successfully', [
                'tenant_id' => $tenant->id,
                'name' => $tenant->name,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to seed tenant defaults', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        } finally {
            tenancy()->end();
        }
    }

    /**
     * Run tenant migrations
     */
    private function runTenantMigrations(Tenant $tenant): void
    {
        try {
            $exitCode = \Illuminate\Support\Facades\Artisan::call('tenants:migrate', [
                '--tenants' => [$tenant->id],
            ]);
            
            if ($exitCode !== 0) {
                throw new \Exception("Tenant migration failed with exit code: {$exitCode}");
            }
            
            Log::info('Tenant migrations completed successfully', [
                'tenant_id' => $tenant->id,
                'exit_code' => $exitCode,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to run tenant migrations', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Seed default roles for the tenant
     */
    private function seedDefaultRoles(): void
    {
        if (! class_exists('\Spatie\Permission\Models\Role')) {
            return;
        }

        $roles = [
            'Super Administrator' => 'Full system access and management',
            'HR Administrator' => 'HR operations and employee management',
            'Manager' => 'Team management and reporting',
            'Employee' => 'Basic employee portal access',
        ];

        foreach ($roles as $roleName => $description) {
            \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => $roleName,
            ], [
                'description' => $description,
            ]);
        }
    }

    /**
     * Seed default settings for the tenant
     */
    private function seedDefaultSettings(Tenant $tenant): void
    {
        $defaultSettings = [
            'company_name' => $tenant->name,
            'timezone' => $tenant->data['timezone'] ?? 'UTC',
            'currency' => $tenant->data['currency'] ?? 'USD',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i',
            'week_start' => 'monday',
            'fiscal_year_start' => '01-01',
            'language' => 'en',
            'attendance_enabled' => true,
            'leave_approval_required' => true,
            'document_storage_enabled' => true,
        ];

        // Create settings records or update tenant data
        foreach ($defaultSettings as $key => $value) {
            // Store in tenant data or create settings table entries as needed
            $tenant->update([
                'data' => array_merge($tenant->data ?? [], [$key => $value]),
            ]);
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
                'name' => $tenant->name,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to delete tenant', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Check if tenant domain is available
     */
    public function isDomainAvailable(string $domain): bool
    {
        return ! Domain::where('domain', $domain)->exists();
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
                'data' => array_merge($tenant->data ?? [], $data['settings'] ?? []),
            ]);

            Log::info('Tenant updated successfully', [
                'tenant_id' => $tenant->id,
                'changes' => $data,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to update tenant', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
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
            'features_enabled' => [],
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
                'results' => $results,
            ]);

            return $results;
        } catch (\Exception $e) {
            Log::error('Failed to initialize tenant advanced features', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
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
                'overview_generated_at' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get tenant overview', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'error' => $e->getMessage(),
                'tenant_id' => $tenant->id,
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
            'maintenance_completed_at' => now()->toISOString(),
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
                $results['backup_created'] = ! is_null($backup);
                if ($backup) {
                    $results['backup_file'] = $backup;
                }
            }

            $results['success'] = true;

            Log::info('Tenant maintenance completed', [
                'tenant_id' => $tenant->id,
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            Log::error('Tenant maintenance failed', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);
            $results['error'] = $e->getMessage();
        }

        return $results;
    }
}
