<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class TenantDefaultSeeder extends Seeder
{
    /**
     * Run the database seeds for a new tenant.
     */
    public function run(): void
    {
        $this->createRolesAndPermissions();
        $this->createDefaultDepartments();
        $this->createDefaultLeaveTypes();
        $this->createDefaultSettings();
    }

    /**
     * Create default roles and permissions for tenant
     */
    private function createRolesAndPermissions(): void
    {
        // Create default roles
        $roles = [
            'Super Administrator' => 'Full access to all features',
            'HR Manager' => 'Manage HR operations and employee data',
            'Department Head' => 'Manage department staff and operations',
            'Employee' => 'Basic employee access',
            'Project Manager' => 'Manage projects and project teams',
        ];

        foreach ($roles as $roleName => $description) {
            Role::firstOrCreate(
                ['name' => $roleName],
                ['description' => $description]
            );
        }

        // Create basic permissions
        $permissions = [
            // User management
            'users.view',
            'users.create', 
            'users.edit',
            'users.delete',
            
            // Department management
            'departments.view',
            'departments.create',
            'departments.edit', 
            'departments.delete',
            
            // Attendance management
            'attendance.view',
            'attendance.create',
            'attendance.edit',
            'attendance.delete',
            
            // Leave management
            'leaves.view',
            'leaves.create',
            'leaves.edit',
            'leaves.delete',
            'leaves.approve',
            
            // Project management
            'projects.view',
            'projects.create',
            'projects.edit',
            'projects.delete',
            
            // Reports
            'reports.view',
            'reports.export',
            
            // Settings
            'settings.view',
            'settings.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        $superAdmin = Role::where('name', 'Super Administrator')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo(Permission::all());
        }

        $hrManager = Role::where('name', 'HR Manager')->first();
        if ($hrManager) {
            $hrManager->givePermissionTo([
                'users.view', 'users.create', 'users.edit',
                'departments.view', 'departments.create', 'departments.edit',
                'attendance.view', 'attendance.create', 'attendance.edit',
                'leaves.view', 'leaves.create', 'leaves.edit', 'leaves.approve',
                'reports.view', 'reports.export',
            ]);
        }

        $deptHead = Role::where('name', 'Department Head')->first();
        if ($deptHead) {
            $deptHead->givePermissionTo([
                'users.view',
                'attendance.view', 'attendance.edit',
                'leaves.view', 'leaves.approve',
                'projects.view', 'projects.create', 'projects.edit',
                'reports.view',
            ]);
        }

        $employee = Role::where('name', 'Employee')->first();
        if ($employee) {
            $employee->givePermissionTo([
                'attendance.view', 'attendance.create',
                'leaves.view', 'leaves.create',
                'projects.view',
            ]);
        }

        $projectManager = Role::where('name', 'Project Manager')->first();
        if ($projectManager) {
            $projectManager->givePermissionTo([
                'users.view',
                'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
                'reports.view',
            ]);
        }
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
            ['name' => 'Sales', 'code' => 'SALES', 'description' => 'Sales Department'],
            ['name' => 'Marketing', 'code' => 'MKT', 'description' => 'Marketing Department'],
            ['name' => 'Operations', 'code' => 'OPS', 'description' => 'Operations Department'],
        ];

        foreach ($departments as $dept) {
            if (class_exists('App\\Models\\HRM\\Department')) {
                \App\Models\HRM\Department::firstOrCreate(
                    ['code' => $dept['code']],
                    $dept
                );
            } else {
                // Fallback if Department model doesn't exist yet
                DB::table('departments')->updateOrInsert(
                    ['code' => $dept['code']],
                    array_merge($dept, [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                );
            }
        }
    }

    /**
     * Create default leave types
     */
    private function createDefaultLeaveTypes(): void
    {
        $leaveTypes = [
            ['name' => 'Annual Leave', 'code' => 'AL', 'days_per_year' => 21, 'color' => '#3B82F6'],
            ['name' => 'Sick Leave', 'code' => 'SL', 'days_per_year' => 10, 'color' => '#EF4444'],
            ['name' => 'Maternity Leave', 'code' => 'ML', 'days_per_year' => 90, 'color' => '#F59E0B'],
            ['name' => 'Paternity Leave', 'code' => 'PL', 'days_per_year' => 15, 'color' => '#10B981'],
            ['name' => 'Emergency Leave', 'code' => 'EL', 'days_per_year' => 3, 'color' => '#8B5CF6'],
            ['name' => 'Study Leave', 'code' => 'STL', 'days_per_year' => 5, 'color' => '#06B6D4'],
        ];

        foreach ($leaveTypes as $leaveType) {
            if (class_exists('App\\Models\\HRM\\LeaveType')) {
                \App\Models\HRM\LeaveType::firstOrCreate(
                    ['code' => $leaveType['code']],
                    $leaveType
                );
            } else {
                // Fallback if LeaveType model doesn't exist yet
                DB::table('leave_types')->updateOrInsert(
                    ['code' => $leaveType['code']],
                    array_merge($leaveType, [
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                );
            }
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
            'company_phone' => '+1234567890',
            'company_address' => '123 Business Street, City, Country',
            'working_hours_start' => '09:00',
            'working_hours_end' => '17:00',
            'working_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'attendance_late_threshold' => 15, // minutes
            'leave_approval_required' => true,
            'overtime_calculation' => 'auto',
            'payroll_frequency' => 'monthly',
            'currency' => 'USD',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i',
            'timezone' => 'UTC',
        ];

        foreach ($settings as $key => $value) {
            if (class_exists('App\\Models\\Setting')) {
                \App\Models\Setting::firstOrCreate(
                    ['key' => $key],
                    ['value' => is_array($value) ? json_encode($value) : $value]
                );
            } else {
                // Fallback using DB
                DB::table('settings')->updateOrInsert(
                    ['key' => $key],
                    [
                        'value' => is_array($value) ? json_encode($value) : $value,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
