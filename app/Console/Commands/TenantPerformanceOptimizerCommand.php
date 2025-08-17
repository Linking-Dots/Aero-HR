<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\TenantPerformanceOptimizerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TenantPerformanceOptimizerCommand extends Command
{
    protected $signature = 'tenant:optimize 
                            {--tenant= : Specific tenant ID to optimize}
                            {--all : Optimize all tenants}
                            {--skip-database : Skip database optimization}
                            {--skip-cache : Skip cache optimization}
                            {--skip-storage : Skip storage optimization}
                            {--skip-queries : Skip query optimization}
                            {--skip-sessions : Skip session optimization}
                            {--report : Generate optimization report}';

    protected $description = 'Optimize tenant performance';

    public function handle(): int
    {
        $this->info('⚡ Tenant Performance Optimizer');
        $this->info('==============================');
        $this->newLine();

        try {
            $tenants = $this->getTenants();
            $optimizer = app(TenantPerformanceOptimizerService::class);
            $options = $this->getOptimizationOptions();

            $results = [];
            $progressBar = $this->output->createProgressBar(count($tenants));

            foreach ($tenants as $tenant) {
                $this->line("Optimizing tenant: {$tenant->name} ({$tenant->id})");
                
                $result = $optimizer->optimizeTenant($tenant, $options);
                $results[] = $result;
                
                if ($result['success']) {
                    $this->info("✅ Optimization completed in {$result['duration']}ms");
                } else {
                    $this->error("❌ Optimization failed: " . ($result['error'] ?? 'Unknown error'));
                }

                $progressBar->advance();
                $this->newLine();
            }

            $progressBar->finish();
            $this->newLine(2);

            if ($this->option('report')) {
                $this->generateOptimizationReport($results);
            }

            $this->displaySummary($results);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Performance optimization failed: ' . $e->getMessage());
            Log::error('Tenant performance optimization command failed', [
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
            return Tenant::all();
        }

        // Default to active tenants
        return Tenant::where('status', 'active')->get();
    }

    private function getOptimizationOptions(): array
    {
        return [
            'skip_database' => $this->option('skip-database'),
            'skip_cache' => $this->option('skip-cache'),
            'skip_storage' => $this->option('skip-storage'),
            'skip_queries' => $this->option('skip-queries'),
            'skip_sessions' => $this->option('skip-sessions'),
        ];
    }

    private function generateOptimizationReport(array $results): void
    {
        $this->info('📊 Optimization Report');
        $this->info('======================');
        $this->newLine();

        foreach ($results as $result) {
            if (!$result['success']) {
                continue;
            }

            $this->line("🏢 Tenant: {$result['tenant_id']}");
            $this->line("Duration: {$result['duration']}ms");
            $this->newLine();

            // Database optimizations
            if (isset($result['optimizations']['database'])) {
                $db = $result['optimizations']['database'];
                if ($db['success']) {
                    $this->line("📊 Database:");
                    foreach ($db['actions'] as $action) {
                        $this->line("  • {$action}");
                    }
                    if (isset($db['statistics'])) {
                        $stats = $db['statistics'];
                        $this->line("  Tables optimized: " . ($stats['tables_optimized'] ?? 0));
                        $this->line("  Tables analyzed: " . ($stats['tables_analyzed'] ?? 0));
                    }
                }
            }

            // Cache optimizations
            if (isset($result['optimizations']['cache'])) {
                $cache = $result['optimizations']['cache'];
                if ($cache['success']) {
                    $this->line("🚀 Cache:");
                    foreach ($cache['actions'] as $action) {
                        $this->line("  • {$action}");
                    }
                }
            }

            // Storage optimizations
            if (isset($result['optimizations']['storage'])) {
                $storage = $result['optimizations']['storage'];
                if ($storage['success']) {
                    $this->line("💾 Storage:");
                    foreach ($storage['actions'] as $action) {
                        $this->line("  • {$action}");
                    }
                }
            }

            // Improvements
            if (!empty($result['improvements'])) {
                $this->line("📈 Improvements:");
                foreach ($result['improvements'] as $metric => $value) {
                    $this->line("  • {$metric}: {$value}");
                }
            }

            $this->newLine();
        }
    }

    private function displaySummary(array $results): void
    {
        $this->info('📈 Summary');
        $this->info('==========');

        $totalTenants = count($results);
        $successfulOptimizations = count(array_filter($results, fn($r) => $r['success']));
        $failedOptimizations = $totalTenants - $successfulOptimizations;
        $totalDuration = array_sum(array_column($results, 'duration'));
        $avgDuration = $totalTenants > 0 ? round($totalDuration / $totalTenants, 2) : 0;

        $this->line("Total Tenants: {$totalTenants}");
        $this->line("Successful Optimizations: {$successfulOptimizations}");
        $this->line("Failed Optimizations: {$failedOptimizations}");
        $this->line("Total Duration: {$totalDuration}ms");
        $this->line("Average Duration: {$avgDuration}ms");

        // Performance improvements summary
        $totalImprovements = [];
        foreach ($results as $result) {
            if (isset($result['improvements'])) {
                foreach ($result['improvements'] as $metric => $value) {
                    if (!isset($totalImprovements[$metric])) {
                        $totalImprovements[$metric] = 0;
                    }
                    $totalImprovements[$metric] += $value;
                }
            }
        }

        if (!empty($totalImprovements)) {
            $this->newLine();
            $this->line("🎯 Total Improvements:");
            foreach ($totalImprovements as $metric => $value) {
                $this->line("  • {$metric}: {$value}");
            }
        }

        if ($failedOptimizations > 0) {
            $this->newLine();
            $this->warn("⚠️  {$failedOptimizations} optimization(s) failed. Check logs for details.");
        } else {
            $this->newLine();
            $this->info("✅ All optimizations completed successfully!");
        }
    }
}
