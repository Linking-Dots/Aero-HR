<?php

namespace App\Jobs;

use App\Events\TenantProvisioned;
use App\Events\TenantProvisioningFailed;
use App\Models\Domain;
use App\Models\Tenant;
use App\Models\TenantUserLookup;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;
use Throwable;

class ProvisionTenantJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $maxExceptions = 1;
    public $timeout = 600; // 10 minutes

    protected Tenant $tenant;
    protected array $adminUser;
    protected bool $shouldSeedData;

    /**
     * Create a new job instance.
     */
    public function __construct(
        Tenant $tenant, 
        array $adminUser = [], 
        bool $shouldSeedData = true
    ) {
        $this->tenant = $tenant;
        $this->adminUser = $adminUser;
        $this->shouldSeedData = $shouldSeedData;
        
        // Set queue for tenant provisioning
        $this->onQueue('tenant-provisioning');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Starting tenant provisioning for tenant: {$this->tenant->id}");

            // Update status to provisioning
            $this->tenant->update(['status' => 'provisioning']);

            // Step 1: Use stancl/tenancy package to run migrations
            $this->runTenantMigrations();

            // Step 2: Use stancl/tenancy package to seed data
            if ($this->shouldSeedData) {
                $this->seedTenantData();
            }

            // Step 3: Create tenant admin user within tenant context
            if (!empty($this->adminUser)) {
                $this->createTenantAdminUser();
            }

            // Step 4: Setup storage directory for tenant
            $this->setupTenantStorage();

            // Step 5: Mark tenant as active
            $this->tenant->update(['status' => 'active']);

            Log::info("Successfully provisioned tenant: {$this->tenant->id}");

            // Dispatch success event
            event(new TenantProvisioned($this->tenant));

        } catch (Throwable $e) {
            Log::error("Failed to provision tenant {$this->tenant->id}: " . $e->getMessage(), [
                'tenant_id' => $this->tenant->id,
                'exception' => $e->getTraceAsString()
            ]);

            // Mark tenant as failed
            $this->tenant->update(['status' => 'failed']);

            // Dispatch failure event
            event(new TenantProvisioningFailed($this->tenant, $e->getMessage()));

            throw $e;
        }
    }

    /**
     * Run tenant migrations using stancl/tenancy package approach.
     */
    private function runTenantMigrations(): void
    {
        $exitCode = Artisan::call('tenants:migrate', [
            '--tenants' => [$this->tenant->id],
        ]);

        if ($exitCode !== 0) {
            throw new Exception("Failed to run tenant migrations for {$this->tenant->id}");
        }

        Log::info("Ran tenant migrations for: {$this->tenant->id}");
    }

    /**
     * Seed tenant data using stancl/tenancy package approach.
     */
    private function seedTenantData(): void
    {
        try {
            // Seed roles and permissions
            $exitCode = Artisan::call('tenants:seed', [
                '--tenants' => [$this->tenant->id],
                '--class' => 'TenantRolesSeeder',
            ]);

            if ($exitCode !== 0) {
                throw new Exception("Failed to seed tenant data for {$this->tenant->id}");
            }

            Log::info("Seeded tenant data for: {$this->tenant->id}");
        } catch (Exception $e) {
            Log::error("Failed to seed data for tenant {$this->tenant->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create tenant admin user within tenant context.
     */
    private function createTenantAdminUser(): void
    {
        if (empty($this->adminUser)) {
            return;
        }

        $this->tenant->run(function () {
            $adminUser = \App\Models\User::create([
                'id' => Str::uuid()->toString(),
                'name' => $this->adminUser['name'],
                'email' => $this->adminUser['email'],
                'password' => bcrypt($this->adminUser['password'] ?? 'password123'),
                'email_verified_at' => now(),
                'status' => 'active',
                'employee_id' => 'ADMIN001',
                'user_type' => 'admin',
                'is_tenant_admin' => true,
            ]);

            // Assign tenant admin role
            if ($adminUser && class_exists('Spatie\Permission\Models\Role')) {
                $tenantAdminRole = \Spatie\Permission\Models\Role::where('name', 'Tenant Admin')->first();
                if ($tenantAdminRole) {
                    $adminUser->assignRole($tenantAdminRole);
                }
            }

            // Create tenant user lookup record
            \App\Models\TenantUserLookup::create([
                'tenant_id' => $this->tenant->id,
                'user_id' => $adminUser->id,
                'email' => $adminUser->email,
                'role' => 'tenant_admin',
                'is_active' => true,
            ]);

            Log::info("Created admin user for tenant: {$this->tenant->id}");
        });
    }

    /**
     * Setup storage directory for tenant.
     */
    private function setupTenantStorage(): void
    {
        try {
            // Create tenant-specific storage directories
            $directories = [
                "tenant-{$this->tenant->id}/documents",
                "tenant-{$this->tenant->id}/avatars",
                "tenant-{$this->tenant->id}/exports",
                "tenant-{$this->tenant->id}/imports",
                "tenant-{$this->tenant->id}/temp",
            ];

            foreach ($directories as $directory) {
                if (!Storage::disk('public')->exists($directory)) {
                    Storage::disk('public')->makeDirectory($directory);
                }
            }

            Log::info("Setup storage directories for tenant: {$this->tenant->id}");
        } catch (Exception $e) {
            Log::warning("Failed to setup storage for tenant {$this->tenant->id}: " . $e->getMessage());
            // Don't fail the job for storage issues
        }
    }

    /**
     * Clean up resources on provisioning failure.
     */
    private function cleanupOnFailure(): void
    {
        try {
            // The stancl/tenancy package handles database cleanup automatically
            // We just need to clean up our custom resources
            
            // Remove storage directory
            Storage::disk('public')->deleteDirectory("tenant-{$this->tenant->id}");

            // Remove domain entries
            Domain::where('tenant_id', $this->tenant->id)->delete();

            // Remove user lookup entries
            TenantUserLookup::where('tenant_id', $this->tenant->id)->delete();

            Log::info("Cleaned up failed provisioning for tenant: {$this->tenant->id}");

        } catch (Exception $e) {
            Log::error("Failed to cleanup tenant {$this->tenant->id}: " . $e->getMessage());
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error("ProvisionTenantJob failed for tenant {$this->tenant->id}", [
            'tenant_id' => $this->tenant->id,
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Update tenant status
        $this->tenant->update(['status' => 'failed']);

        // Dispatch failure event
        event(new TenantProvisioningFailed($this->tenant, $exception->getMessage()));
    }
}
