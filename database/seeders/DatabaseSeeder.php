<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\AttendanceType;
use App\Models\AttendanceRule;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
//        $roles = [
//            'Administrator', 'Manager','Deputy Manager', 'Supervision Engineer',
//            'Quality Control Inspector', 'Asst. Quality Control Inspector', 'Web Designer',
//            'HR', 'UI/UX Developer', 'SEO Analyst'
//        ];
//
//        // Create roles
//        foreach ($roles as $roleName) {
//            Role::firstOrCreate(['name' => $roleName]);
//        }
//
//        // Define modules and their permissions
        // $modules = [
        //     'Settings', 'Attendances', 'Departments', 'Designations', 'Timesheet', 'Users'
        // ];

        // $permissions = ['Read', 'Write', 'Create', 'Delete', 'Import', 'Export'];

        // // Create permissions for each module
        // foreach ($modules as $module) {
        //     foreach ($permissions as $permission) {
        //         $permName = strtolower($permission) . ' ' . strtolower($module);
        //         Permission::firstOrCreate(['name' => $permName]);
        //     }
        // }

        // // Assign permissions to Administrator role as an example
        // $adminRole = Role::findByName('Administrator');
        // $adminRole->givePermissionTo(Permission::all());

//        $users = User::all();

//// Assign the "Employee" role to all users
//        $users->each(function ($user) {
//            $user->assignRole('Employee');
//        });
        AttendanceType::create([
            'name' => 'Main Site Zone',
            'slug' => 'geo_polygon',
            'config' => [
                'polygons' => [
                    [[10.1, 123.5], [10.2, 123.5], [10.2, 123.6], [10.1, 123.6]]
                ]
            ]
        ]);

        AttendanceType::create([
            'name' => 'Office Wi-Fi',
            'slug' => 'wifi_ip',
            'config' => [
                'allowed_ips' => ['192.168.0.100', '203.0.113.10']
            ]
        ]);

        AttendanceRule::create([
            'attendance_type_id' => 1,
            'applicable_to_type' => User::class,
            'applicable_to_id' => 1
        ]);

        AttendanceRule::create([
            'attendance_type_id' => 2,
            'applicable_to_type' => User::class,
            'applicable_to_id' => 1
        ]);


    }
}
