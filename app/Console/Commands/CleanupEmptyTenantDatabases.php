<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;

class CleanupEmptyTenantDatabases extends Command
{
    protected $signature = 'tenant:cleanup-empty-databases {--dry-run : Show what would be deleted without actually deleting}';
    protected $description = 'Clean up empty tenant databases with wrong prefix';

    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info("🔍 DRY RUN MODE - No databases will be deleted");
        } else {
            $this->warn("⚠️  DANGER: This will permanently delete empty tenant databases!");
            if (!$this->confirm('Are you sure you want to continue?')) {
                return Command::SUCCESS;
            }
        }

        try {
            // Get all databases
            $databases = DB::select('SHOW DATABASES');
            $allDatabases = array_column($databases, 'Database');

            // Get valid tenant IDs from central database
            $validTenantIds = Tenant::pluck('id')->toArray();
            $this->info("Found " . count($validTenantIds) . " valid tenants in central database");

            // Find databases with old 'tenant' prefix
            $oldPrefixDatabases = array_filter($allDatabases, function($db) {
                return strpos($db, 'tenant') === 0 && strpos($db, 'saas_tenant_') !== 0;
            });

            $this->info("Found " . count($oldPrefixDatabases) . " databases with old 'tenant' prefix");

            // Find databases with correct 'saas_tenant_' prefix
            $correctPrefixDatabases = array_filter($allDatabases, function($db) {
                return strpos($db, 'saas_tenant_') === 0;
            });

            $this->info("Found " . count($correctPrefixDatabases) . " databases with correct 'saas_tenant_' prefix");

            $deletedCount = 0;
            $skippedCount = 0;

            foreach ($oldPrefixDatabases as $database) {
                // Extract tenant ID from database name
                $tenantId = str_replace('tenant', '', $database);
                
                // Check if this tenant ID exists in valid tenants
                $hasValidTenant = in_array($tenantId, $validTenantIds);
                
                // Check if corresponding saas_tenant_ database exists
                $correctDatabase = 'saas_tenant_' . $tenantId;
                $hasCorrectDatabase = in_array($correctDatabase, $correctPrefixDatabases);

                if ($hasValidTenant && $hasCorrectDatabase) {
                    // This old database is redundant - safe to delete
                    $this->info("📋 Checking database: {$database}");
                    
                    // Check if database is actually empty
                    $tableCount = $this->getTableCount($database);
                    
                    if ($tableCount === 0) {
                        $this->warn("  🗑️  Empty database found: {$database}");
                        
                        if (!$isDryRun) {
                            DB::statement("DROP DATABASE `{$database}`");
                            $this->info("  ✅ Deleted empty database: {$database}");
                            $deletedCount++;
                        } else {
                            $this->info("  🔍 Would delete: {$database}");
                            $deletedCount++;
                        }
                    } else {
                        $this->warn("  ⚠️  Database not empty ({$tableCount} tables): {$database}");
                        $skippedCount++;
                    }
                } else {
                    $this->info("📋 Keeping database: {$database} (no corresponding saas_tenant_ database)");
                    $skippedCount++;
                }
            }

            if ($isDryRun) {
                $this->info("\n🔍 DRY RUN SUMMARY:");
                $this->info("  Would delete: {$deletedCount} empty databases");
                $this->info("  Would skip: {$skippedCount} databases");
                $this->info("\nRun without --dry-run to actually delete the databases");
            } else {
                $this->info("\n✅ CLEANUP SUMMARY:");
                $this->info("  Deleted: {$deletedCount} empty databases");
                $this->info("  Skipped: {$skippedCount} databases");
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to cleanup databases: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function getTableCount($databaseName)
    {
        try {
            $tables = DB::select("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?", [$databaseName]);
            return $tables[0]->count ?? 0;
        } catch (\Exception $e) {
            $this->warn("  ⚠️  Could not check tables in {$databaseName}: " . $e->getMessage());
            return -1; // Unknown count, treat as non-empty for safety
        }
    }
}
