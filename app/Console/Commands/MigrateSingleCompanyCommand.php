<?php

namespace App\Console\Commands;

use App\Jobs\ProvisionTenantJob;
use App\Models\Domain;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class MigrateSingleCompanyCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenants:migrate-single-company 
                            {--slug=acme : The tenant slug for the migrated company}
                            {--source-db= : Source database name (defaults to current DB)}
                            {--chunk-size=1000 : Number of records to process at once}
                            {--dry-run : Simulate the migration without making changes}
                            {--skip-validation : Skip pre-migration validation}';

    /**
     * The console command description.
     */
    protected $description = 'Migrate existing single company data to a new tenant';

    protected array $tenantTables = [];
    protected string $sourceConnection;
    protected string $tenantConnection;
    protected array $migrationStats = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $slug = $this->option('slug');
        
        $this->info("Starting single company migration to tenant: {$slug}");

        try {
            // Setup and validation
            $this->setupConnections();
            $this->loadTenantTables();
            
            if (!$this->option('skip-validation')) {
                $this->validateMigration();
            }

            // Get or create tenant
            $tenant = $this->getOrCreateTenant();

            if (!$this->option('dry-run')) {
                // Provision tenant database
                $this->provisionTenant($tenant);
                
                // Migrate data
                $this->migrateData($tenant);
                
                // Create user lookups
                $this->createUserLookups($tenant);
                
                // Finalize migration
                $this->finalizeMigration($tenant);
            } else {
                $this->info('DRY RUN: Simulating migration...');
                $this->simulateMigration($tenant);
            }

            // Display results
            $this->displayMigrationResults();

            return 0;

        } catch (\Exception $e) {
            $this->error("Migration failed: {$e->getMessage()}");
            $this->error("Stack trace: {$e->getTraceAsString()}");
            return 1;
        }
    }

    /**
     * Setup database connections.
     */
    protected function setupConnections(): void
    {
        $this->sourceConnection = $this->option('source-db') ? 'source_migration' : config('database.default');
        
        if ($this->option('source-db')) {
            Config::set('database.connections.source_migration', [
                'driver' => 'mysql',
                'host' => config('database.connections.mysql.host'),
                'port' => config('database.connections.mysql.port'),
                'database' => $this->option('source-db'),
                'username' => config('database.connections.mysql.username'),
                'password' => config('database.connections.mysql.password'),
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
                'strict' => true,
                'engine' => null,
            ]);
        }

        $this->info("Source connection: {$this->sourceConnection}");
    }

    /**
     * Load list of tenant tables from migrations.
     */
    protected function loadTenantTables(): void
    {
        $this->tenantTables = [
            // Core tables
            'users', 'departments', 'designations',
            
            // HR tables
            'attendances', 'leaves', 'holidays', 'leave_settings',
            'experiences', 'education', 'assets', 'jurisdictions',
            'tasks', 'jobs', 'payrolls',
            
            // CRM tables (if present)
            'crm_contacts', 'crm_leads', 'crm_opportunities', 'crm_accounts',
            
            // Inventory tables (if present)
            'inventory_items', 'inventory_categories', 'inventory_movements',
            
            // Project tables
            'projects', 'daily_works', 'daily_summaries', 'reports',
            'project_time_entries', 'project_budgets', 'project_budget_expenses',
            'project_resources', 'project_task_dependencies',
            
            // Permission tables
            'roles', 'permissions', 'role_has_permissions', 'model_has_permissions', 'model_has_roles',
            
            // Media and files
            'media',
            
            // Settings
            'company_settings',
        ];

        // Filter tables that actually exist in source database
        $existingTables = collect(DB::connection($this->sourceConnection)->select('SHOW TABLES'))
            ->pluck('Tables_in_' . DB::connection($this->sourceConnection)->getDatabaseName())
            ->toArray();

        $this->tenantTables = array_intersect($this->tenantTables, $existingTables);
        
        $this->info("Found " . count($this->tenantTables) . " tables to migrate");
    }

    /**
     * Validate migration prerequisites.
     */
    protected function validateMigration(): void
    {
        $this->info('Validating migration prerequisites...');

        // Check source database connectivity
        try {
            DB::connection($this->sourceConnection)->getPdo();
        } catch (\Exception $e) {
            throw new \Exception("Cannot connect to source database: {$e->getMessage()}");
        }

        // Check platform database connectivity
        try {
            DB::connection('platform')->getPdo();
        } catch (\Exception $e) {
            throw new \Exception("Cannot connect to platform database: {$e->getMessage()}");
        }

        // Check if source tables have data
        $totalRecords = 0;
        foreach ($this->tenantTables as $table) {
            if (Schema::connection($this->sourceConnection)->hasTable($table)) {
                $count = DB::connection($this->sourceConnection)->table($table)->count();
                $this->migrationStats[$table] = ['source_count' => $count];
                $totalRecords += $count;
            }
        }

        $this->info("Total records to migrate: " . number_format($totalRecords));

        if ($totalRecords === 0) {
            throw new \Exception("No data found in source database");
        }
    }

    /**
     * Get or create tenant record.
     */
    protected function getOrCreateTenant(): Tenant
    {
        $slug = $this->option('slug');
        
        $tenant = DB::connection('platform')->transaction(function () use ($slug) {
            $tenant = Tenant::where('slug', $slug)->first();
            
            if (!$tenant) {
                $tenant = Tenant::create([
                    'slug' => $slug,
                    'name' => ucfirst($slug) . ' Corporation',
                    'email' => "admin@{$slug}.com",
                    'status' => 'pending',
                    'data' => [
                        'migrated_from_single_company' => true,
                        'migration_date' => now()->toISOString(),
                        'source_database' => $this->option('source-db') ?: config('database.connections.' . $this->sourceConnection . '.database'),
                    ],
                ]);
                
                // Create primary domain
                Domain::create([
                    'domain' => "{$slug}.mysoftwaredomain.com",
                    'tenant_id' => $tenant->id,
                    'is_primary' => true,
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);
                
                $this->info("Created tenant record for: {$slug}");
            } else {
                $this->info("Using existing tenant record for: {$slug}");
            }

            return $tenant;
        });

        return $tenant;
    }

    /**
     * Provision tenant database.
     */
    protected function provisionTenant(Tenant $tenant): void
    {
        $this->info("Provisioning tenant database...");
        
        $job = new ProvisionTenantJob($tenant, [], false); // Don't seed default data
        $job->handle();
        
        $tenant->refresh();
        $this->tenantConnection = "tenant_{$tenant->id}";
        
        $this->info("Tenant database provisioned: {$tenant->db_name}");
    }

    /**
     * Migrate data from source to tenant database.
     */
    protected function migrateData(Tenant $tenant): void
    {
        $this->info("Starting data migration...");
        
        $progressBar = $this->output->createProgressBar(count($this->tenantTables));
        $progressBar->start();

        foreach ($this->tenantTables as $table) {
            $this->migrateTable($table);
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info("Data migration completed!");
    }

    /**
     * Migrate a single table.
     */
    protected function migrateTable(string $table): void
    {
        if (!Schema::connection($this->sourceConnection)->hasTable($table)) {
            $this->migrationStats[$table]['status'] = 'skipped - table not found';
            return;
        }

        if (!Schema::connection($this->tenantConnection)->hasTable($table)) {
            $this->migrationStats[$table]['status'] = 'skipped - target table not found';
            return;
        }

        $sourceCount = DB::connection($this->sourceConnection)->table($table)->count();
        
        if ($sourceCount === 0) {
            $this->migrationStats[$table]['status'] = 'skipped - no data';
            return;
        }

        $chunkSize = $this->option('chunk-size');
        $processed = 0;

        DB::connection($this->sourceConnection)
            ->table($table)
            ->orderBy('id')
            ->chunk($chunkSize, function ($records) use ($table, &$processed) {
                $data = $records->toArray();
                
                // Convert objects to arrays
                $data = array_map(function ($record) {
                    return (array) $record;
                }, $data);

                DB::connection($this->tenantConnection)->table($table)->insert($data);
                $processed += count($data);
            });

        $targetCount = DB::connection($this->tenantConnection)->table($table)->count();
        
        $this->migrationStats[$table] = [
            'source_count' => $sourceCount,
            'target_count' => $targetCount,
            'status' => $sourceCount === $targetCount ? 'success' : 'partial',
        ];
    }

    /**
     * Create user lookup entries.
     */
    protected function createUserLookups(Tenant $tenant): void
    {
        $this->info("Creating user lookup entries...");
        $this->info("Migration uses tenant domain for user identification (no lookup table needed)");
    }

    /**
     * Finalize migration.
     */
    protected function finalizeMigration(Tenant $tenant): void
    {
        $this->info("Finalizing migration...");
        
        // Update tenant status
        DB::connection('platform')->table('tenants')
            ->where('id', $tenant->id)
            ->update([
                'status' => 'active',
                'updated_at' => now(),
            ]);

        $this->info("Migration completed successfully!");
    }

    /**
     * Simulate migration (dry run).
     */
    protected function simulateMigration(Tenant $tenant): void
    {
        $this->info("=== DRY RUN SIMULATION ===");
        
        foreach ($this->tenantTables as $table) {
            if (isset($this->migrationStats[$table]['source_count'])) {
                $count = $this->migrationStats[$table]['source_count'];
                $this->line("Would migrate {$count} records from table: {$table}");
            }
        }
    }

    /**
     * Display migration results.
     */
    protected function displayMigrationResults(): void
    {
        $this->info("\n=== Migration Results ===");
        
        $totalSource = 0;
        $totalTarget = 0;
        $successTables = 0;

        foreach ($this->migrationStats as $table => $stats) {
            $status = $stats['status'] ?? 'unknown';
            $sourceCount = $stats['source_count'] ?? 0;
            $targetCount = $stats['target_count'] ?? 0;

            $this->line("{$table}: {$sourceCount} -> {$targetCount} ({$status})");
            
            $totalSource += $sourceCount;
            $totalTarget += $targetCount;
            
            if ($status === 'success') {
                $successTables++;
            }
        }

        $this->info("\nSummary:");
        $this->line("Tables processed: " . count($this->migrationStats));
        $this->line("Tables successful: {$successTables}");
        $this->line("Total records migrated: {$totalSource} -> {$totalTarget}");
        
        if ($totalSource === $totalTarget) {
            $this->info("✅ Migration completed successfully!");
        } else {
            $this->warn("⚠️  Some data may not have been migrated completely.");
        }
    }
}
