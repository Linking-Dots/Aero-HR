<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\TenantMonitoringService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TenantHealthDashboardCommand extends Command
{
    protected $signature = 'tenant:health-dashboard 
                            {--tenant= : Specific tenant ID to check}
                            {--all : Check all tenants}
                            {--detailed : Show detailed metrics}
                            {--format=table : Output format (table, json)}';

    protected $description = 'Display tenant health dashboard';

    public function handle(): int
    {
        $this->info('🏥 Tenant Health Dashboard');
        $this->info('==========================');
        $this->newLine();

        try {
            $tenants = $this->getTenants();
            $monitoringService = app(TenantMonitoringService::class);

            if ($this->option('format') === 'json') {
                return $this->displayJsonFormat($tenants, $monitoringService);
            }

            return $this->displayTableFormat($tenants, $monitoringService);

        } catch (\Exception $e) {
            $this->error('❌ Health dashboard failed: ' . $e->getMessage());
            Log::error('Tenant health dashboard command failed', [
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
            return Tenant::with('domains')->get();
        }

        // Default to active tenants
        return Tenant::with('domains')->where('status', 'active')->get();
    }

    private function displayTableFormat($tenants, TenantMonitoringService $monitoringService): int
    {
        $healthData = [];
        $progressBar = $this->output->createProgressBar(count($tenants));

        foreach ($tenants as $tenant) {
            $health = $monitoringService->checkTenantHealth($tenant);
            $healthData[] = [
                'name' => $tenant->name,
                'id' => substr($tenant->id, 0, 8) . '...',
                'status' => $tenant->status,
                'health_score' => $health['health_score'],
                'health_status' => $health['status'],
                'issues' => count($health['issues']),
                'users' => $health['metrics']['users']['total_users'] ?? 0,
                'db_size' => isset($health['metrics']['database']['database_size_mb']) 
                    ? $health['metrics']['database']['database_size_mb'] . ' MB' 
                    : 'N/A'
            ];
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->table([
            'Name', 'ID', 'Status', 'Health Score', 'Health Status', 'Issues', 'Users', 'DB Size'
        ], $healthData);

        if ($this->option('detailed')) {
            $this->displayDetailedMetrics($tenants, $monitoringService);
        }

        $this->displaySummary($healthData);

        return Command::SUCCESS;
    }

    private function displayJsonFormat($tenants, TenantMonitoringService $monitoringService): int
    {
        $allData = [];

        foreach ($tenants as $tenant) {
            $health = $monitoringService->generateHealthReport($tenant);
            $allData[] = $health;
        }

        $this->line(json_encode($allData, JSON_PRETTY_PRINT));
        return Command::SUCCESS;
    }

    private function displayDetailedMetrics($tenants, TenantMonitoringService $monitoringService): void
    {
        $this->newLine();
        $this->info('📊 Detailed Health Metrics');
        $this->info('==========================');

        foreach ($tenants as $tenant) {
            $health = $monitoringService->checkTenantHealth($tenant);
            $metrics = $health['metrics'];

            $this->newLine();
            $this->line("🏢 <info>{$tenant->name}</info> ({$tenant->id})");
            $this->line("Status: {$tenant->status} | Health: {$health['health_score']}/100 ({$health['status']})");

            if (!empty($health['issues'])) {
                $this->line("⚠️  Issues: " . implode(', ', $health['issues']));
            }

            // Database metrics
            if (isset($metrics['database'])) {
                $db = $metrics['database'];
                $this->line("📊 Database: {$db['table_count']} tables, {$db['total_records']} records, {$db['database_size_mb']} MB");
            }

            // User metrics
            if (isset($metrics['users'])) {
                $users = $metrics['users'];
                $this->line("👥 Users: {$users['total_users']} total, {$users['active_users_30d']} active (30d), {$users['activity_rate']}% activity rate");
            }

            // Performance metrics
            if (isset($metrics['performance'])) {
                $perf = $metrics['performance'];
                $this->line("⚡ Performance: DB {$perf['database_response_ms']}ms, Cache {$perf['cache_response_ms']}ms");
            }

            // Storage metrics
            if (isset($metrics['storage'])) {
                $storage = $metrics['storage'];
                $this->line("💾 Storage: {$storage['total_size_human']}, {$storage['file_count']} files");
            }
        }
    }

    private function displaySummary(array $healthData): void
    {
        $this->newLine();
        $this->info('📈 Summary');
        $this->info('==========');

        $totalTenants = count($healthData);
        $healthyTenants = count(array_filter($healthData, fn($t) => $t['health_score'] >= 80));
        $criticalTenants = count(array_filter($healthData, fn($t) => $t['health_score'] < 60));
        $totalIssues = array_sum(array_column($healthData, 'issues'));
        $avgHealthScore = $totalTenants > 0 ? round(array_sum(array_column($healthData, 'health_score')) / $totalTenants, 2) : 0;

        $this->line("Total Tenants: {$totalTenants}");
        $this->line("Healthy Tenants (80+): {$healthyTenants}");
        $this->line("Critical Tenants (<60): {$criticalTenants}");
        $this->line("Total Issues: {$totalIssues}");
        $this->line("Average Health Score: {$avgHealthScore}/100");

        if ($criticalTenants > 0) {
            $this->newLine();
            $this->warn("⚠️  {$criticalTenants} tenant(s) require immediate attention!");
        } else {
            $this->newLine();
            $this->info("✅ All tenants are in good health!");
        }
    }
}
