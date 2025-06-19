<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        try {
            // Get the first user or create a test admin user
            $user = User::first();
            
            if (!$user) {
                $user = User::create([
                    'name' => 'Test Administrator',
                    'email' => 'admin@test.com',
                    'password' => bcrypt('password'),
                    'user_name' => 'admin',
                    'employee_id' => 'EMP001'
                ]);
                $this->command->info('Created test admin user: admin@test.com / password');
            }

            // Get the Super Administrator role
            $superAdminRole = Role::where('name', 'Super Administrator')->first();
            
            if ($superAdminRole) {
                $user->assignRole($superAdminRole);
                $this->command->info("Assigned Super Administrator role to user: {$user->email}");
            } else {
                $this->command->warn('Super Administrator role not found. Run EnterpriseRoleSystemSeeder first.');
            }

        } catch (\Exception $e) {
            $this->command->error('Failed to assign admin role: ' . $e->getMessage());
            Log::error('AdminUserSeeder failed: ' . $e->getMessage());
        }
    }
}
