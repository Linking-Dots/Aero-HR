<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Use the new CombinedSeeder which includes all necessary seeding functionality
        $this->call([
            CombinedSeeder::class,
        ]);
    }
}
