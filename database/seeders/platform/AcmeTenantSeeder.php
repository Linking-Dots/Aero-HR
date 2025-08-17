<?php

namespace Database\Seeders\Platform;

use App\Models\Domain;
use App\Models\Tenant;
use App\Models\TenantUserLookup;
use Illuminate\Database\Seeder;

class AcmeTenantSeeder extends Seeder
{
    public function run(): void
    {
        // Create the Acme tenant (for migration testing)
        $acmeTenant = Tenant::factory()->acme()->create([
            'status' => 'provisioning', // Will be changed to 'active' after provisioning
            'data' => [
                'migrated_from_single_company' => true,
                'migration_date' => now()->toISOString(),
            ],
        ]);

        // Create primary domain for Acme
        Domain::create([
            'domain' => 'acme.mysoftwaredomain.com',
            'tenant_id' => $acmeTenant->id,
            'is_primary' => true,
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        // Create user lookup entry for admin
        TenantUserLookup::create([
            'email' => 'admin@acme.com',
            'tenant_id' => $acmeTenant->id,
            'is_admin' => true,
        ]);

        // Create some test user lookups
        $testEmails = [
            'john.doe@acme.com',
            'jane.smith@acme.com',
            'manager@acme.com',
        ];

        foreach ($testEmails as $email) {
            TenantUserLookup::create([
                'email' => $email,
                'tenant_id' => $acmeTenant->id,
                'is_admin' => false,
            ]);
        }
    }
}
