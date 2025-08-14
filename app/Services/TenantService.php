<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\TenantUser;
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

            // The tenancy package will automatically create the database
            // and run migrations through the TenantCreated event

            return $tenant;
            
        } catch (\Exception $e) {
            throw new \Exception("Failed to create tenant: " . $e->getMessage());
        }
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
            
            $user = \App\Models\User::create([
                'name' => $ownerData['name'],
                'email' => $ownerData['email'],
                'password' => bcrypt($ownerData['password']),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Assign owner role if roles exist
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                $ownerRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Super Administrator']);
                $user->assignRole($ownerRole);
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
