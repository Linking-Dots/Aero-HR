<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\TenantUser;
use App\Models\Domain;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stancl\Tenancy\Facades\Tenancy;

class TenantService
{
    /**
     * Create a new tenant with database and default setup
     */
    public function createTenant(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            try {
                // Create tenant record
                $tenant = Tenant::create([
                    'id' => (string) Str::uuid(),
                    'name' => $data['name'],
                    'slug' => Str::slug($data['name']),
                    'domain' => $data['domain'] ?? Str::slug($data['name']),
                    'database_name' => 'tenant_' . Str::random(8),
                    'plan_id' => $data['plan_id'],
                    'status' => 'active',
                    'trial_ends_at' => now()->addDays(14),
                    'settings' => $data['settings'] ?? []
                ]);

                // Create domain records for the tenant
                $domain = $data['domain'] ?? Str::slug($data['name']);
                
                // Production domain (subdomain)
                Domain::create([
                    'domain' => $domain . '.' . config('app.domain', 'aero-hr.local'),
                    'tenant_id' => $tenant->id
                ]);
                
                // Development domain (path-based)
                if (app()->environment('local')) {
                    Domain::create([
                        'domain' => '127.0.0.1:8000/tenant/' . $domain,
                        'tenant_id' => $tenant->id
                    ]);
                }

                Log::info('Tenant created successfully', [
                    'tenant_id' => $tenant->id,
                    'domain' => $tenant->domain,
                    'plan_id' => $tenant->plan_id
                ]);

                // The tenancy package will automatically create the database
                // and run migrations through the TenantCreated event

                return $tenant;
                
            } catch (\Exception $e) {
                Log::error('Tenant creation failed', [
                    'error' => $e->getMessage(),
                    'data' => $data,
                    'trace' => $e->getTraceAsString()
                ]);
                throw new \Exception("Failed to create tenant: " . $e->getMessage());
            }
        });
    }

    /**
     * Create tenant owner user in the tenant database
     */
    public function createTenantOwner(Tenant $tenant, array $ownerData): TenantUser
    {
        try {
            // Create in central database for tracking
            $tenantUser = TenantUser::create([
                'tenant_id' => $tenant->id,
                'name' => $ownerData['name'],
                'email' => $ownerData['email'],
                'role' => 'owner',
                'accepted_at' => now()
            ]);

            // Initialize tenant context and create user in tenant database
            Tenancy::initialize($tenant);
            
            // Check if User model exists in tenant context
            if (!class_exists(\App\Models\User::class)) {
                throw new \Exception("User model not found in tenant context");
            }
            
            $user = \App\Models\User::create([
                'name' => $ownerData['name'],
                'email' => $ownerData['email'],
                'password' => bcrypt($ownerData['password']),
                'is_active' => true,
                'email_verified_at' => now(),
                'role' => 'Super Administrator', // Ensure owner gets admin role
            ]);

            // Assign owner role if Spatie Permission package is available
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                try {
                    $ownerRole = \Spatie\Permission\Models\Role::firstOrCreate([
                        'name' => 'Super Administrator',
                        'guard_name' => 'web'
                    ]);
                    $user->assignRole($ownerRole);
                } catch (\Exception $e) {
                    Log::warning("Failed to assign role to tenant owner: " . $e->getMessage());
                }
            }

            Tenancy::end();
            
            return $tenantUser;
            
        } catch (\Exception $e) {
            Tenancy::end();
            throw new \Exception("Failed to create tenant owner: " . $e->getMessage());
        }
    }

    /**
     * Seed default data for new tenant
     */
    public function seedTenantDefaults(Tenant $tenant): void
    {
        try {
            Tenancy::initialize($tenant);
            
            // Run tenant-specific seeders
            Artisan::call('db:seed', [
                '--class' => 'MinimalTenantSeeder',
                '--force' => true
            ]);
            
            Tenancy::end();
            
        } catch (\Exception $e) {
            Tenancy::end();
            Log::error("Failed to seed tenant defaults for {$tenant->id}: " . $e->getMessage());
        }
    }

    /**
     * Get tenant by domain
     */
    public function getTenantByDomain(string $domain): ?Tenant
    {
        return Tenant::where('domain', $domain)->first();
    }

    /**
     * Check if tenant has reached plan limits
     */
    public function checkPlanLimits(Tenant $tenant, string $limitType): bool
    {
        if (!$tenant->plan) {
            return false;
        }

        Tenancy::initialize($tenant);
        
        $currentCount = match($limitType) {
            'max_employees' => \App\Models\User::count(),
            'max_departments' => \App\Models\HRM\Department::count(),
            'max_projects' => \App\Models\Project::count(),
            default => 0
        };
        
        Tenancy::end();

        return $tenant->plan->isWithinLimits($limitType, $currentCount);
    }

    /**
     * Suspend tenant (disable access)
     */
    public function suspendTenant(Tenant $tenant, string $reason = ''): bool
    {
        try {
            $tenant->update([
                'status' => 'suspended',
                'settings' => array_merge($tenant->settings ?? [], [
                    'suspension_reason' => $reason,
                    'suspended_at' => now()->toDateTimeString()
                ])
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to suspend tenant {$tenant->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Reactivate suspended tenant
     */
    public function reactivateTenant(Tenant $tenant): bool
    {
        try {
            $settings = $tenant->settings ?? [];
            unset($settings['suspension_reason'], $settings['suspended_at']);

            $tenant->update([
                'status' => 'active',
                'settings' => $settings
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to reactivate tenant {$tenant->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete tenant and all associated data
     */
    public function deleteTenant(Tenant $tenant): bool
    {
        try {
            // Delete tenant-specific data
            TenantUser::where('tenant_id', $tenant->id)->delete();
            
            // Delete subscription if exists
            if ($tenant->subscription) {
                $tenant->subscription->delete();
            }
            
            // The tenancy package will handle database deletion
            $tenant->delete();
            
            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to delete tenant {$tenant->id}: " . $e->getMessage());
            return false;
        }
    }
}
