<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class PlatformUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // Create super admin user
        DB::table('platform_users')->insert([
            'name' => 'Super Admin',
            'email' => 'admin@aero-hr.com',
            'email_verified_at' => $now,
            'password' => Hash::make('admin123'),
            'role' => 'super_admin',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Create support user
        DB::table('platform_users')->insert([
            'name' => 'Support User',
            'email' => 'support@aero-hr.com',
            'email_verified_at' => $now,
            'password' => Hash::make('support123'),
            'role' => 'support',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Create billing user
        DB::table('platform_users')->insert([
            'name' => 'Billing User',
            'email' => 'billing@aero-hr.com',
            'email_verified_at' => $now,
            'password' => Hash::make('billing123'),
            'role' => 'billing',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $this->command->info('Platform users created successfully!');
        $this->command->line('Super Admin: admin@aero-hr.com / admin123');
        $this->command->line('Support: support@aero-hr.com / support123');
        $this->command->line('Billing: billing@aero-hr.com / billing123');
    }
}
