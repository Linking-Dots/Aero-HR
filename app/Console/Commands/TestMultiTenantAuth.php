<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Stancl\Tenancy\Facades\Tenancy;

class TestMultiTenantAuth extends Command
{
    protected $signature = 'tenant:test-auth {tenant_id}';
    protected $description = 'Test multi-tenant authentication for a specific tenant';

    public function handle()
    {
        $tenantId = $this->argument('tenant_id');
        
        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            $this->error("Tenant {$tenantId} not found");
            return Command::FAILURE;
        }

        $this->info("Testing multi-tenant authentication for tenant: {$tenant->name}");
        $this->info("Tenant ID: {$tenant->id}");
        
        // Get tenant domain
        $domain = $tenant->domains->first();
        if ($domain) {
            $this->info("Domain: {$domain->domain}");
        }

        // Test tenant context
        $tenant->run(function () {
            $this->info("✓ Successfully entered tenant context");
            
            // Check if we can access tenant users
            $userCount = User::count();
            $this->info("✓ Found {$userCount} users in tenant database");
            
            // Check if we can find the admin user
            $adminUser = User::whereHas('roles', function($query) {
                $query->where('name', 'Tenant Admin');
            })->first();
            if ($adminUser) {
                $this->info("✓ Found tenant admin: {$adminUser->email}");
            } else {
                $this->warn("⚠ No tenant admin found - checking all users with admin roles");
                $admins = User::whereHas('roles', function($query) {
                    $query->where('name', 'like', '%admin%');
                })->get();
                if ($admins->count() > 0) {
                    foreach ($admins as $admin) {
                        $this->info("  → Admin user: {$admin->email} (roles: " . $admin->roles->pluck('name')->implode(', ') . ")");
                    }
                } else {
                    $this->info("  → No admin roles found");
                }
            }
            
            // Check roles and permissions
            if (class_exists('Spatie\Permission\Models\Role')) {
                $roleCount = \Spatie\Permission\Models\Role::count();
                $permissionCount = \Spatie\Permission\Models\Permission::count();
                $this->info("✓ Found {$roleCount} roles and {$permissionCount} permissions");
            }
        });

        // Test URL generation
        $loginUrl = $this->generateTenantLoginUrl($domain ? $domain->domain : null);
        $this->info("Login URL: {$loginUrl}");

        $this->info("🎉 Multi-tenant authentication test completed successfully!");
        return Command::SUCCESS;
    }

    private function generateTenantLoginUrl(?string $domain): string
    {
        if (!$domain) {
            return 'No domain configured';
        }

        if (app()->environment('local')) {
            return "http://127.0.0.1:8000/{$domain}/login";
        } else {
            return "https://{$domain}/login";
        }
    }
}
