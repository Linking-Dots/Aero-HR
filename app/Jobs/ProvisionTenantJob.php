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
            Log::info("Starting tenant provisioning for tenant: {$this->tenant->slug}");

            // Check if already provisioned (idempotency)
            if ($this->tenant->isActive()) {
                Log::info("Tenant {$this->tenant->slug} is already active, skipping provisioning");
                return;
            }

            // Update status to provisioning
            $this->tenant->update(['status' => 'provisioning']);

            // Step 1: Generate database credentials
            $this->generateDatabaseCredentials();

            // Step 2: Create tenant database
            $this->createTenantDatabase();

            // Step 3: Configure tenant database connection
            $connectionName = $this->configureTenantConnection();

            // Step 4: Run tenant migrations
            $this->runTenantMigrations($connectionName);

            // Step 5: Seed default data
            if ($this->shouldSeedData) {
                $this->seedTenantDefaults($connectionName);
            }

            // Step 6: Create tenant admin user
            if (!empty($this->adminUser)) {
                $this->createTenantAdminUser($connectionName);
            }

            // Step 7: Setup storage prefix
            $this->setupStoragePrefix();

            // Step 8: Create default domain if not exists
            $this->createDefaultDomain();

            // Step 9: Mark tenant as active
            $this->tenant->update(['status' => 'active']);

            Log::info("Successfully provisioned tenant: {$this->tenant->slug}");

            // Dispatch success event
            event(new TenantProvisioned($this->tenant));

        } catch (Throwable $e) {
            Log::error("Failed to provision tenant {$this->tenant->slug}: " . $e->getMessage(), [
                'tenant_id' => $this->tenant->id,
                'exception' => $e->getTraceAsString()
            ]);

            // Cleanup on failure
            $this->cleanupOnFailure();

            // Mark tenant as failed
            $this->tenant->update(['status' => 'failed']);

            // Dispatch failure event
            event(new TenantProvisioningFailed($this->tenant, $e->getMessage()));

            throw $e;
        }
    }

    /**
     * Generate database name and credentials for the tenant.
     */
    private function generateDatabaseCredentials(): void
    {
        if (empty($this->tenant->db_name)) {
            $this->tenant->db_name = Tenant::generateDatabaseName();
        }

        if (empty($this->tenant->db_username)) {
            $this->tenant->db_username = 'tenant_' . Str::random(12);
        }

        if (empty($this->tenant->db_password)) {
            $this->tenant->db_password = Str::random(32);
        }

        $this->tenant->save();
    }

    /**
     * Create the tenant database and user (MySQL).
     */
    private function createTenantDatabase(): void
    {
        $adminConnection = DB::connection('tenant_admin');
        
        // Create database
        $dbName = $this->tenant->db_name;
        $adminConnection->statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

        // Create database user (optional - can use same credentials)
        $username = $this->tenant->db_username;
        $password = $this->tenant->db_password;
        $host = config('database.connections.tenant.host', '127.0.0.1');

        $adminConnection->statement("CREATE USER IF NOT EXISTS '{$username}'@'{$host}' IDENTIFIED BY '{$password}'");
        $adminConnection->statement("GRANT ALL PRIVILEGES ON `{$dbName}`.* TO '{$username}'@'{$host}'");
        $adminConnection->statement("FLUSH PRIVILEGES");

        Log::info("Created database and user for tenant: {$this->tenant->slug}");
    }

    /**
     * Configure the dynamic tenant database connection.
     */
    private function configureTenantConnection(): string
    {
        $connectionName = "tenant_{$this->tenant->id}";
        
        $connectionConfig = array_merge(
            config('database.connections.tenant'),
            $this->tenant->getDatabaseConnection()
        );

        Config::set("database.connections.{$connectionName}", $connectionConfig);
        
        // Test the connection
        DB::connection($connectionName)->getPdo();
        
        Log::info("Configured database connection for tenant: {$this->tenant->slug}");
        
        return $connectionName;
    }

    /**
     * Run tenant-specific migrations.
     */
    private function runTenantMigrations(string $connectionName): void
    {
        $exitCode = Artisan::call('migrate', [
            '--database' => $connectionName,
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        if ($exitCode !== 0) {
            throw new Exception("Failed to run tenant migrations for {$this->tenant->slug}");
        }

        Log::info("Ran tenant migrations for: {$this->tenant->slug}");
    }

    /**
     * Seed default tenant data (roles, permissions, etc.).
     */
    private function seedTenantDefaults(string $connectionName): void
    {
        // Switch to tenant database connection
        $originalConnection = config('database.default');
        Config::set('database.default', $connectionName);

        try {
            // Use comprehensive TenantRolesSeeder for roles and permissions
            $this->seedComprehensiveRolesAndPermissions($connectionName);
            
            // Create default departments
            $this->createDefaultDepartments($connectionName);
            
            // Create additional tenant-specific defaults
            $this->createDefaultSettings($connectionName);

            Log::info("Seeded comprehensive default data for tenant: {$this->tenant->slug}");
        } finally {
            // Restore original connection
            Config::set('database.default', $originalConnection);
        }
    }

    /**
     * Seed comprehensive roles and permissions using TenantRolesSeeder.
     */
    private function seedComprehensiveRolesAndPermissions(string $connectionName): void
    {
        try {
            // Use Artisan to run the tenant seeder with comprehensive roles
            $exitCode = Artisan::call('db:seed', [
                '--database' => $connectionName,
                '--class' => 'Database\\Seeders\\Tenant\\TenantRolesSeeder',
                '--force' => true,
            ]);

            if ($exitCode !== 0) {
                throw new Exception("Failed to seed tenant roles and permissions for {$this->tenant->slug}");
            }

            Log::info("Seeded comprehensive roles and permissions for tenant: {$this->tenant->slug}");
        } catch (Exception $e) {
            Log::error("Failed to seed roles for tenant {$this->tenant->slug}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create default settings for the tenant.
     */
    private function createDefaultSettings(string $connectionName): void
    {
        $settings = [
            [
                'key' => 'company_name',
                'value' => $this->tenant->name,
                'type' => 'string',
                'description' => 'Company name',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'timezone',
                'value' => 'UTC',
                'type' => 'string',
                'description' => 'Default timezone',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'date_format',
                'value' => 'Y-m-d',
                'type' => 'string',
                'description' => 'Default date format',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'currency',
                'value' => 'USD',
                'type' => 'string',
                'description' => 'Default currency',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'working_hours_start',
                'value' => '09:00',
                'type' => 'string',
                'description' => 'Working hours start time',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'working_hours_end',
                'value' => '17:00',
                'type' => 'string',
                'description' => 'Working hours end time',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'leave_year_start',
                'value' => '01-01',
                'type' => 'string',
                'description' => 'Leave year start date (MM-DD)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'default_leave_balance',
                'value' => '25',
                'type' => 'integer',
                'description' => 'Default annual leave balance in days',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            DB::connection($connectionName)->table('settings')->insertOrIgnore($setting);
        }

        Log::info("Created default settings for tenant: {$this->tenant->slug}");
    }

    /**
     * Create default departments for the tenant.
     */
    private function createDefaultDepartments(string $connectionName): void
    {
        $departments = [
            ['name' => 'Human Resources', 'code' => 'HR', 'description' => 'Human Resources Department'],
            ['name' => 'Information Technology', 'code' => 'IT', 'description' => 'IT Department'],
            ['name' => 'Finance', 'code' => 'FIN', 'description' => 'Finance Department'],
            ['name' => 'Operations', 'code' => 'OPS', 'description' => 'Operations Department'],
        ];

        foreach ($departments as $department) {
            DB::connection($connectionName)->table('departments')->insertOrIgnore($department);
        }
    }

    /**
     * Create the tenant admin user.
     */
    private function createTenantAdminUser(string $connectionName): void
    {
        $userData = array_merge([
            'password' => bcrypt('password'),
            'is_active' => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ], $this->adminUser);

        $userId = DB::connection($connectionName)->table('users')->insertGetId($userData);

        // Assign Tenant Admin role (from our comprehensive system)
        $tenantAdminRoleId = DB::connection($connectionName)
            ->table('roles')
            ->where('name', 'Tenant Admin')
            ->value('id');

        if ($tenantAdminRoleId) {
            DB::connection($connectionName)->table('model_has_roles')->insert([
                'role_id' => $tenantAdminRoleId,
                'model_type' => 'App\\Models\\User',
                'model_id' => $userId,
            ]);
        } else {
            Log::warning("Tenant Admin role not found for tenant: {$this->tenant->slug}");
        }

        // Add to tenant user lookup
        TenantUserLookup::addEmailToTenant(
            $userData['email'],
            $this->tenant->id,
            true // is_admin
        );

        Log::info("Created admin user for tenant: {$this->tenant->slug}");
    }

    /**
     * Setup storage prefix for tenant file isolation.
     */
    private function setupStoragePrefix(): void
    {
        $prefix = "tenants/{$this->tenant->slug}";
        
        // Update tenant with storage prefix
        $this->tenant->update(['storage_prefix' => $prefix]);

        // Create storage directories if using local storage
        if (config('filesystems.default') === 'local') {
            Storage::makeDirectory($prefix);
            Storage::makeDirectory("{$prefix}/uploads");
            Storage::makeDirectory("{$prefix}/exports");
            Storage::makeDirectory("{$prefix}/documents");
        }

        Log::info("Setup storage prefix for tenant: {$this->tenant->slug}");
    }

    /**
     * Create default domain for the tenant.
     */
    private function createDefaultDomain(): void
    {
        $domainName = "{$this->tenant->slug}.mysoftwaredomain.com";
        
        Domain::firstOrCreate(
            ['domain' => $domainName],
            [
                'tenant_id' => $this->tenant->id,
                'is_primary' => true,
                'is_verified' => true,
                'verified_at' => now(),
            ]
        );

        Log::info("Created default domain for tenant: {$this->tenant->slug}");
    }

    /**
     * Clean up resources on provisioning failure.
     */
    private function cleanupOnFailure(): void
    {
        try {
            // Drop database if it was created
            if (!empty($this->tenant->db_name)) {
                $adminConnection = DB::connection('tenant_admin');
                $adminConnection->statement("DROP DATABASE IF EXISTS `{$this->tenant->db_name}`");
                
                // Drop user if it was created
                if (!empty($this->tenant->db_username)) {
                    $host = config('database.connections.tenant.host', '127.0.0.1');
                    $adminConnection->statement("DROP USER IF EXISTS '{$this->tenant->db_username}'@'{$host}'");
                }
            }

            // Remove storage directory
            if (!empty($this->tenant->storage_prefix)) {
                Storage::deleteDirectory($this->tenant->storage_prefix);
            }

            // Remove domain entries
            Domain::where('tenant_id', $this->tenant->id)->delete();

            // Remove user lookup entries
            TenantUserLookup::where('tenant_id', $this->tenant->id)->delete();

            Log::info("Cleaned up failed provisioning for tenant: {$this->tenant->slug}");

        } catch (Exception $e) {
            Log::error("Failed to cleanup tenant {$this->tenant->slug}: " . $e->getMessage());
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(Throwable $exception): void
    {
        Log::error("ProvisionTenantJob failed for tenant {$this->tenant->slug}", [
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
