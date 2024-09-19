<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Designation;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            'Administrator', 'Manager','Deputy Manager', 'Supervision Engineer',
            'Quality Control Inspector', 'Asst. Quality Control Inspector', 'Web Designer',
            'HR', 'UI/UX Developer', 'SEO Analyst'
        ];

        // Create roles
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Define modules and their permissions
        $modules = [
            'Employee', 'Holidays', 'Leaves', 'Events', 'Chat', 'Jobs'
        ];

        $permissions = ['Read', 'Write', 'Create', 'Delete', 'Import', 'Export'];

        // Create permissions for each module
        foreach ($modules as $module) {
            foreach ($permissions as $permission) {
                $permName = strtolower($permission) . ' ' . strtolower($module);
                Permission::firstOrCreate(['name' => $permName]);
            }
        }

        // Assign permissions to Administrator role as an example
        $adminRole = Role::findByName('Administrator');
        $adminRole->givePermissionTo(Permission::all());

    }
}
