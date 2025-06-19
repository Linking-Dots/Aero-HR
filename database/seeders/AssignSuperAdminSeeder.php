<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AssignSuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🔐 Assigning Super Administrator role...');
        
        $superAdminRole = Role::where('name', 'Super Administrator')->first();
        
        if (!$superAdminRole) {
            $this->command->error('Super Administrator role not found. Please run EnterpriseRoleSystemSeeder first.');
            return;
        }
        
        $superAdminUsers = User::role('Super Administrator')->count();
        
        if ($superAdminUsers > 0) {
            $this->command->info("✅ Super Administrator role already assigned to {$superAdminUsers} user(s)");
            return;
        }
        
        $firstUser = User::first();
        
        if (!$firstUser) {
            $this->command->error('No users found in database.');
            return;
        }
        
        $firstUser->assignRole('Super Administrator');
        
        $this->command->info("✅ Super Administrator role assigned to: {$firstUser->email}");
        $this->command->info("📋 User now has roles: " . $firstUser->roles->pluck('name')->implode(', '));
    }
}
