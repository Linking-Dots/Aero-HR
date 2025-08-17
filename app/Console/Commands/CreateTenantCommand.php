<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use App\Models\Domain;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CreateTenantCommand extends Command
{
    protected $signature = 'tenant:create {name} {email} {domain} {--password=}';
    protected $description = 'Create a new tenant using stancl/tenancy best practices';

    public function handle()
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $domain = $this->argument('domain');
        $password = $this->option('password') ?: 'password123';

        $this->info("Creating tenant: {$name}");
        $this->info("Admin email: {$email}");
        $this->info("Domain: {$domain}");

        try {
            // Create tenant using stancl/tenancy approach
            $tenant = Tenant::create([
                'id' => Str::uuid()->toString(),
                'slug' => Str::slug($name),
                'name' => $name,
                'email' => $email,
                'plan' => 'starter'
            ]);

            $this->info("✓ Tenant created with ID: {$tenant->id}");

            // Create domain using stancl/tenancy approach
            $tenant->domains()->create([
                'domain' => $domain
            ]);

            $this->info("✓ Domain created: {$domain}");

            // Run tenant migrations using the package approach
            $this->info("Running migrations...");
            $this->call('tenants:migrate', [
                '--tenants' => [$tenant->id]
            ]);

            $this->info("✓ Migrations completed");

            // Seed tenant data using tenant context
            $this->info("Seeding tenant data...");
            $tenant->run(function () {
                // Call the tenant roles seeder directly
                $seeder = new \Database\Seeders\Tenant\TenantRolesSeeder();
                $seeder->run();
            });

            $this->info("✓ Roles and permissions seeded");

            // Create admin user within tenant context
            $tenant->run(function () use ($name, $email, $password) {
                $adminUser = User::create([
                    'id' => Str::uuid()->toString(),
                    'name' => $name,
                    'user_name' => Str::slug($name, ''),
                    'email' => $email,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                    'employee_id' => 1,
                    'user_type' => 'admin',
                    'is_tenant_admin' => true,
                    'active' => true,
                    'is_active' => true,
                ]);

                // Assign tenant admin role
                if ($adminUser && class_exists('Spatie\Permission\Models\Role')) {
                    $tenantAdminRole = \Spatie\Permission\Models\Role::where('name', 'Tenant Admin')->first();
                    if ($tenantAdminRole) {
                        $adminUser->assignRole($tenantAdminRole);
                    }
                }

                $this->info("✓ Admin user created: {$email}");
            });

            $this->info("🎉 Tenant creation completed successfully!");
            $this->info("Database: saas_tenant_{$tenant->id}");
            $this->info("Access URL: http://{$domain}");
            $this->info("Admin Login: {$email}");

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to create tenant: " . $e->getMessage());
            $this->error("Stack trace: " . $e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
