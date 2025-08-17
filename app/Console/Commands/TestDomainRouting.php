<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use App\Models\Domain;
use Stancl\Tenancy\Facades\Tenancy;

class TestDomainRouting extends Command
{
    protected $signature = 'tenant:test-domain-routing {domain}';
    protected $description = 'Test domain-based tenant routing';

    public function handle()
    {
        $domainName = $this->argument('domain');
        
        $this->info("Testing domain routing for: {$domainName}");
        
        try {
            // Find domain
            $domain = Domain::where('domain', $domainName)->first();
            
            if (!$domain) {
                $this->error("Domain not found: {$domainName}");
                return Command::FAILURE;
            }
            
            $this->info("✓ Domain found in database");
            
            // Get tenant
            $tenant = $domain->tenant;
            
            if (!$tenant) {
                $this->error("Tenant not found for domain: {$domainName}");
                return Command::FAILURE;
            }
            
            $this->info("✓ Tenant found: {$tenant->name} (ID: {$tenant->id})");
            
            // Test tenant initialization
            Tenancy::initialize($tenant);
            $this->info("✓ Tenant context initialized successfully");
            
            // Test domain routes
            $devUrl = "http://127.0.0.1:8000/{$domainName}/login";
            $prodUrl = "https://{$domainName}/login";
            
            $this->info("\n📋 Route Configuration:");
            $this->info("Development URL: {$devUrl}");
            $this->info("Production URL: {$prodUrl}");
            
            // Test database access
            $tenant->run(function () {
                $userCount = \App\Models\User::count();
                $this->info("✓ Database accessible: {$userCount} users found");
            });
            
            $this->info("\n🎉 Domain routing test completed successfully!");
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error("Domain routing test failed: " . $e->getMessage());
            return Command::FAILURE;
        } finally {
            // The tenancy package will automatically clean up when the command ends
        }
    }
}
