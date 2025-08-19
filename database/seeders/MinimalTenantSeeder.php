<?php

namespace Database\Seeders;

use Database\Seeders\Tenant\TenantRolesSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class MinimalTenantSeeder extends Seeder
{
    /**
     * Run the minimal tenant database seeds.
     * This seeder is called automatically when a new tenant is created.
     */
    public function run(): void
    {
        try {
            Log::info('Starting minimal tenant seeding');

            // Seed roles and permissions
            $this->call(TenantRolesSeeder::class);

            Log::info('Minimal tenant seeding completed successfully');

        } catch (\Exception $e) {
            Log::error('Error during minimal tenant seeding', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw to ensure the tenant creation process fails if seeding fails
            throw $e;
        }
    }
}
