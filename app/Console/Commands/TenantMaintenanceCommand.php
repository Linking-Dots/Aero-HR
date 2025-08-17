<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\TenantMonitoringService;
use App\Services\TenantCacheService;
use App\Services\TenantStorageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TenantMaintenanceCommand extends Command
{
    protected $signature = 'tenant:maintenance 
                            {--tenant= : Specific tenant ID to maintain}
                            {--all : Maintain all tenants}
                            {--cache : Clear and warm up caches}
                            {--storage : Clean up storage}
                            {--backup : Create backups}
                            {--health : Check health}';

    protected $description = 'Perform maintenance tasks on tenants';

    public function handle(): int
    {
        $this->info('🔧 Starting Tenant Maintenance');
        $this->info('============================');
        $this->newLine();

        try {
            $tenants = $this->getTenants();
            $tasks = $this->getMaintenanceTasks();

            if (empty($tasks)) {
                $this->warn('No maintenance tasks specified. Use --cache, --storage, --backup, or --health');
                return Command::FAILURE;
            }

            $this->info("Performing maintenance on " . count($tenants) . " tenant(s)");
            $this->info("Tasks: " . implode(', ', $tasks));
            $this->newLine();

            $results = [];
            $progressBar = $this->output->createProgressBar(count($tenants));

            foreach ($tenants as $tenant) {
                $this->line("Processing tenant: {$tenant->name} ({$tenant->id})");
                
                $tenantResults = $this->performMaintenanceTasks($tenant, $tasks);
                $results[$tenant->id] = $tenantResults;
                
                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine(2);

            $this->displayResults($results);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Maintenance failed: ' . $e->getMessage());
            Log::error('Tenant maintenance command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    private function getTenants()
    {
        if ($this->option('tenant')) {
            $tenant = Tenant::find($this->option('tenant'));
            if (!$tenant) {
                throw new \Exception('Tenant not found: ' . $this->option('tenant'));
            }
            return collect([$tenant]);
        }

        if ($this->option('all')) {
            return Tenant::where('status', 'active')->get();
        }

        throw new \Exception('Please specify --tenant=ID or --all');
    }

    private function getMaintenanceTasks(): array
    {
        $tasks = [];
        
        if ($this->option('cache')) $tasks[] = 'cache';
        if ($this->option('storage')) $tasks[] = 'storage';
        if ($this->option('backup')) $tasks[] = 'backup';
        if ($this->option('health')) $tasks[] = 'health';

        return $tasks;
    }

    private function performMaintenanceTasks(Tenant $tenant, array $tasks): array
    {
        $results = [];

        foreach ($tasks as $task) {
            try {
                switch ($task) {
                    case 'cache':
                        $results['cache'] = $this->maintainCache($tenant);
                        break;
                    case 'storage':
                        $results['storage'] = $this->maintainStorage($tenant);
                        break;
                    case 'backup':
                        $results['backup'] = $this->createBackup($tenant);
                        break;
                    case 'health':
                        $results['health'] = $this->checkHealth($tenant);
                        break;
                }
            } catch (\Exception $e) {
                $results[$task] = ['success' => false, 'error' => $e->getMessage()];
            }
        }

        return $results;
    }

    private function maintainCache(Tenant $tenant): array
    {
        $cacheService = app(TenantCacheService::class);
        
        $cleared = $cacheService->clearTenantCache($tenant);
        $warmed = $cacheService->warmUpTenantCache($tenant);
        
        return [
            'success' => $cleared && $warmed,
            'cleared' => $cleared,
            'warmed' => $warmed
        ];
    }

    private function maintainStorage(Tenant $tenant): array
    {
        $storageService = app(TenantStorageService::class);
        $stats = $storageService->getTenantStorageStats($tenant);
        
        return [
            'success' => true,
            'stats' => $stats
        ];
    }

    private function createBackup(Tenant $tenant): array
    {
        $storageService = app(TenantStorageService::class);
        $backup = $storageService->createTenantBackup($tenant);
        
        return [
            'success' => !is_null($backup),
            'backup_file' => $backup
        ];
    }

    private function checkHealth(Tenant $tenant): array
    {
        $monitoringService = app(TenantMonitoringService::class);
        $health = $monitoringService->checkTenantHealth($tenant);
        
        return [
            'success' => true,
            'health_score' => $health['health_score'],
            'status' => $health['status'],
            'issues' => $health['issues']
        ];
    }

    private function displayResults(array $results): void
    {
        $this->info('📊 Maintenance Results');
        $this->info('=====================');
        
        foreach ($results as $tenantId => $tenantResults) {
            $tenant = Tenant::find($tenantId);
            $this->line("📁 {$tenant->name}:");
            
            foreach ($tenantResults as $task => $result) {
                $status = $result['success'] ? '✅' : '❌';
                $this->line("  {$status} {$task}");
                
                if (!$result['success'] && isset($result['error'])) {
                    $this->line("    Error: {$result['error']}");
                }
                
                if ($task === 'health' && $result['success']) {
                    $this->line("    Health Score: {$result['health_score']}/100 ({$result['status']})");
                    if (!empty($result['issues'])) {
                        $this->line("    Issues: " . implode(', ', $result['issues']));
                    }
                }
                
                if ($task === 'backup' && $result['success'] && isset($result['backup_file'])) {
                    $this->line("    Backup: {$result['backup_file']}");
                }
            }
            
            $this->newLine();
        }
    }
}
