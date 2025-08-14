<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MinimalTenantSeeder extends Seeder
{
    /**
     * Run the database seeds for a new tenant.
     */
    public function run(): void
    {
        $this->createDefaultDepartments();
        $this->createDefaultSettings();
    }

    /**
     * Create default departments
     */
    private function createDefaultDepartments(): void
    {
        $departments = [
            ['name' => 'Human Resources', 'code' => 'HR', 'description' => 'Human Resources Department'],
            ['name' => 'Information Technology', 'code' => 'IT', 'description' => 'IT Department'],
            ['name' => 'Finance', 'code' => 'FIN', 'description' => 'Finance Department'],
            ['name' => 'Operations', 'code' => 'OPS', 'description' => 'Operations Department'],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->updateOrInsert(
                ['code' => $dept['code']],
                array_merge($dept, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Create default system settings
     */
    private function createDefaultSettings(): void
    {
        $settings = [
            'company_name' => 'Your Company',
            'company_email' => 'info@yourcompany.com',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i',
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
