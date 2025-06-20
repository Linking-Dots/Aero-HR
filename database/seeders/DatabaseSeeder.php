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
        // Run the comprehensive role and permission seeder first
        $this->call([
            ComprehensiveRolePermissionSeeder::class,
        ]);

        // Create default attendance types
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
