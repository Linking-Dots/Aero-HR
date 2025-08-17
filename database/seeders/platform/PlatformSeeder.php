<?php

namespace Database\Seeders\Platform;

use Illuminate\Database\Seeder;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PlanSeeder::class,
            PlatformUserSeeder::class,
            AcmeTenantSeeder::class,
        ]);
    }
}
