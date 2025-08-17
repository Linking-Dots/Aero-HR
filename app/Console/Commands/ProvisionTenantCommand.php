<?php

namespace App\Console\Commands;

use App\Jobs\ProvisionTenantJob;
use App\Models\Domain;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProvisionTenantCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenants:provision 
                            {slug : The tenant slug}
                            {--name= : The tenant name}
                            {--email= : The tenant admin email}
                            {--admin-name= : The admin user name}
                            {--admin-email= : The admin user email}
                            {--admin-password= : The admin user password}
                            {--plan= : The plan slug}
                            {--domain= : Custom domain (optional)}
                            {--seed : Seed default data}
                            {--force : Force provisioning even if tenant exists}';

    /**
     * The console command description.
     */
    protected $description = 'Provision a new tenant with database and initial setup';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $slug = $this->argument('slug');
        
        $this->info("Starting tenant provisioning for: {$slug}");

        try {
            // Validate input
            $this->validateInput();

            // Check if tenant already exists
            if (!$this->option('force') && Tenant::where('slug', $slug)->exists()) {
                $this->error("Tenant with slug '{$slug}' already exists. Use --force to override.");
                return 1;
            }

            // Get or create tenant
            $tenant = $this->getOrCreateTenant();
            
            // Prepare admin user data
            $adminUser = $this->prepareAdminUser();

            // Display tenant information
            $this->displayTenantInfo($tenant, $adminUser);

            if (!$this->confirm('Do you want to proceed with provisioning?', true)) {
                $this->info('Provisioning cancelled.');
                return 0;
            }

            // Dispatch provisioning job
            $this->info('Dispatching provisioning job...');
            
            if ($this->option('queue')) {
                ProvisionTenantJob::dispatch($tenant, $adminUser, $this->option('seed'));
                $this->info('Provisioning job queued. Check logs for progress.');
            } else {
                $job = new ProvisionTenantJob($tenant, $adminUser, $this->option('seed'));
                $job->handle();
                $this->info('Tenant provisioned successfully!');
            }

            // Display access information
            $this->displayAccessInfo($tenant, $adminUser);

            return 0;

        } catch (\Exception $e) {
            $this->error("Provisioning failed: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * Validate command input.
     */
    protected function validateInput(): void
    {
        $slug = $this->argument('slug');
        
        $validator = Validator::make(['slug' => $slug], [
            'slug' => 'required|string|max:50|regex:/^[a-z0-9-]+$/',
        ]);

        if ($validator->fails()) {
            throw new \InvalidArgumentException('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
        }

        // Validate admin email if provided
        if ($adminEmail = $this->option('admin-email')) {
            $validator = Validator::make(['email' => $adminEmail], [
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                throw new \InvalidArgumentException('Invalid admin email format.');
            }
        }
    }

    /**
     * Get or create tenant record.
     */
    protected function getOrCreateTenant(): Tenant
    {
        $slug = $this->argument('slug');
        
        // Use platform database connection
        $tenant = DB::connection('platform')->transaction(function () use ($slug) {
            $tenant = Tenant::where('slug', $slug)->first();
            
            if (!$tenant) {
                $tenantData = [
                    'slug' => $slug,
                    'name' => $this->option('name') ?: ucfirst($slug) . ' Corporation',
                    'email' => $this->option('email') ?: "admin@{$slug}.com",
                    'status' => 'pending',
                ];

                $tenant = Tenant::create($tenantData);
                
                // Create primary domain
                Domain::create([
                    'domain' => $this->option('domain') ?: "{$slug}.mysoftwaredomain.com",
                    'tenant_id' => $tenant->id,
                    'is_primary' => true,
                    'is_verified' => false,
                ]);
            }

            return $tenant;
        });

        return $tenant;
    }

    /**
     * Prepare admin user data.
     */
    protected function prepareAdminUser(): array
    {
        $slug = $this->argument('slug');
        
        return [
            'name' => $this->option('admin-name') ?: ucfirst($slug) . ' Admin',
            'email' => $this->option('admin-email') ?: "admin@{$slug}.com",
            'password' => $this->option('admin-password') ?: Str::random(12),
        ];
    }

    /**
     * Display tenant information.
     */
    protected function displayTenantInfo(Tenant $tenant, array $adminUser): void
    {
        $this->info("\n=== Tenant Information ===");
        $this->line("Slug: {$tenant->slug}");
        $this->line("Name: {$tenant->name}");
        $this->line("Email: {$tenant->email}");
        $this->line("Status: {$tenant->status}");
        
        $domain = $tenant->primaryDomain?->domain ?? "{$tenant->slug}.mysoftwaredomain.com";
        $this->line("Domain: {$domain}");

        $this->info("\n=== Admin User ===");
        $this->line("Name: {$adminUser['name']}");
        $this->line("Email: {$adminUser['email']}");
        $this->line("Password: {$adminUser['password']}");

        if ($this->option('seed')) {
            $this->line("\nDefault data will be seeded.");
        }
    }

    /**
     * Display access information after provisioning.
     */
    protected function displayAccessInfo(Tenant $tenant, array $adminUser): void
    {
        $domain = $tenant->primaryDomain?->domain ?? "{$tenant->slug}.mysoftwaredomain.com";
        
        $this->info("\n=== Access Information ===");
        $this->line("Tenant URL: https://{$domain}");
        $this->line("Admin Email: {$adminUser['email']}");
        $this->line("Admin Password: {$adminUser['password']}");
        
        $this->warn("\nIMPORTANT: Save the admin password as it won't be displayed again!");
    }
}
