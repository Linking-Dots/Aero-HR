<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AssignUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assign:user-roles {super-admin-id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign Super Administrator role to specific user and Employee role to all others';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $superAdminId = $this->argument('super-admin-id') ?? 18;
        
        // Check if roles exist
        $superAdminRole = Role::where('name', 'Super Administrator')->first();
        $employeeRole = Role::where('name', 'Employee')->first();
        
        if (!$superAdminRole || !$employeeRole) {
            $this->error('Required roles not found. Please run the seeder first.');
            return 1;
        }

        // Get all users
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->error('No users found in the database.');
            return 1;
        }

        $superAdminUser = null;
        $employeeCount = 0;

        foreach ($users as $user) {
            // Clear existing roles first
            $user->syncRoles([]);
            
            if ($user->id == $superAdminId) {
                $user->assignRole('Super Administrator');
                $superAdminUser = $user;
                $this->info("✅ Super Administrator role assigned to: {$user->name} (ID: {$user->id}, Email: {$user->email})");
            } else {
                $user->assignRole('Employee');
                $employeeCount++;
            }
        }

        if (!$superAdminUser) {
            $this->warn("⚠️  User with ID {$superAdminId} not found. No Super Administrator assigned.");
        }

        $this->info("✅ Employee role assigned to {$employeeCount} users.");
        $this->info("🎉 Role assignment completed successfully!");
        
        return 0;
    }
}
