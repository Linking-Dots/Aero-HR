<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;
use Illuminate\Support\Str;

class SetupProductionTenancy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenancy:setup-production {domain} {--create-demo-tenant}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up tenancy for production environment';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $domain = $this->argument('domain');
        
        $this->info("Setting up tenancy for production domain: {$domain}");

        // Step 1: Verify the domain is in central_domains
        $centralDomains = config('tenancy.central_domains');
        
        if (!in_array($domain, $centralDomains)) {
            $this->error("Domain '{$domain}' is not configured as a central domain.");
            $this->info("Please add '{$domain}' to the 'central_domains' array in config/tenancy.php");
            $this->info("Current central domains: " . implode(', ', $centralDomains));
            return Command::FAILURE;
        }

        $this->info("✓ Domain '{$domain}' is configured as a central domain");

        // Step 2: Run necessary migrations
        $this->info("Running central database migrations...");
        $this->call('migrate', ['--force' => true]);

        // Step 3: Create demo tenant if requested
        if ($this->option('create-demo-tenant')) {
            $this->createDemoTenant();
        }

        // Step 4: Clear caches
        $this->info("Clearing application caches...");
        $this->call('config:clear');
        $this->call('route:clear');
        $this->call('view:clear');
        $this->call('cache:clear');

        $this->info("✓ Production tenancy setup completed!");
        $this->info("");
        $this->info("Central domain: https://{$domain}");
        
        if ($this->option('create-demo-tenant')) {
            $this->info("Demo tenant: https://demo.{$domain}");
        }

        return Command::SUCCESS;
    }

    protected function createDemoTenant()
    {
        $this->info("Creating demo tenant...");

        // Create tenant
        $tenant = Tenant::create([
            'id' => 'demo',
            'name' => 'Demo Company',
            'email' => 'admin@demo.com',
        ]);

        // Create domain for tenant
        $domain = $this->argument('domain');
        $tenant->domains()->create([
            'domain' => "demo.{$domain}",
        ]);

        $this->info("✓ Demo tenant created with domain: demo.{$domain}");
        
        // Run tenant migrations
        $this->info("Running tenant migrations...");
        tenancy()->initialize($tenant);
        $this->call('migrate', ['--force' => true]);
        tenancy()->end();

        $this->info("✓ Demo tenant database set up");
    }
}
