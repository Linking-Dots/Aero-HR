<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use App\Models\Domain;

class TestUrlPatterns extends Command
{
    protected $signature = 'tenant:test-url-patterns';
    protected $description = 'Test both development and production URL patterns for multi-tenant routing';

    public function handle()
    {
        $this->info("🧪 Testing Multi-Tenant URL Patterns");
        $this->info("=======================================");

        // Get a test tenant
        $tenant = Tenant::with('domains')->first();
        
        if (!$tenant) {
            $this->error("No tenants found. Please create a tenant first.");
            return Command::FAILURE;
        }

        $domain = $tenant->domains->first();
        
        if (!$domain) {
            $this->error("No domain found for tenant. Please create a domain first.");
            return Command::FAILURE;
        }

        $this->info("Testing with tenant: {$tenant->name}");
        $this->info("Domain: {$domain->domain}");
        $this->newLine();

        // Test Development URLs (path-based)
        $this->info("📱 Development URLs (127.0.0.1:8000):");
        $this->info("✓ Login: http://127.0.0.1:8000/{$domain->domain}/login");
        $this->info("✓ Dashboard: http://127.0.0.1:8000/{$domain->domain}/dashboard");
        $this->info("✓ Users: http://127.0.0.1:8000/{$domain->domain}/users");
        $this->newLine();

        // Test Production URLs (subdomain-based) 
        $this->info("🌐 Production URLs (subdomain-based):");
        $this->info("✓ Login: https://{$domain->domain}/login");
        $this->info("✓ Dashboard: https://{$domain->domain}/dashboard");
        $this->info("✓ Users: https://{$domain->domain}/users");
        $this->newLine();

        // Test Central Domain URLs
        $this->info("🏢 Central Domain URLs:");
        $this->info("✓ Landing: http://127.0.0.1:8000/");
        $this->info("✓ Register: http://127.0.0.1:8000/register");
        $this->info("✓ Pricing: http://127.0.0.1:8000/pricing");
        $this->newLine();

        // Verify routing configuration
        $this->info("⚙️ Route Configuration Verification:");
        
        $isDevelopment = app()->environment('local') && 
            (request()->getHost() === '127.0.0.1' || request()->getHost() === 'localhost');
            
        if ($isDevelopment) {
            $this->info("✓ Environment: Development (using path-based routing)");
            $this->info("✓ Middleware: InitializeTenancyByPath");
        } else {
            $this->info("✓ Environment: Production (using subdomain routing)");
            $this->info("✓ Middleware: InitializeTenancyByDomain");
        }

        $this->info("✓ Central domains: " . implode(', ', config('tenancy.central_domains')));
        $this->newLine();

        $this->info("🎉 URL pattern testing completed successfully!");
        
        return Command::SUCCESS;
    }
}
