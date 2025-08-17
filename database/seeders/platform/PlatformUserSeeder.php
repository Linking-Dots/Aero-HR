<?php

namespace Database\Seeders\Platform;

use App\Models\PlatformUser;
use Illuminate\Database\Seeder;

class PlatformUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        PlatformUser::factory()->superAdmin()->create([
            'name' => 'Platform Super Admin',
            'email' => 'admin@mysoftwaredomain.com',
        ]);

        // Create additional platform users
        PlatformUser::factory()->support()->create([
            'name' => 'Support User',
            'email' => 'support@mysoftwaredomain.com',
        ]);

        PlatformUser::factory()->billing()->create([
            'name' => 'Billing User',
            'email' => 'billing@mysoftwaredomain.com',
        ]);
    }
}
