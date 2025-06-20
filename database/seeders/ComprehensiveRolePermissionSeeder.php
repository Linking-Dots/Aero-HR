<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class ComprehensiveRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions for all modules
        $this->createPermissions();
        
        // Create roles with hierarchy
        $this->createRoles();
        
        // Assign permissions to roles
        $this->assignPermissionsToRoles();

        $this->command->info('✅ Comprehensive role and permission system created successfully!');
    }

    /**
     * Create all permissions based on modules
     */
    private function createPermissions(): void
    {
        $modules = [
            // Core System
            'core' => [
                'dashboard.view' => 'View dashboard and analytics',
                'stats.view' => 'View system statistics',
                'updates.view' => 'View system updates'
            ],

            // Self Service Module
            'self-service' => [
                'attendance.own.view' => 'View own attendance records',
                'attendance.own.punch' => 'Punch in/out attendance',
                'leave.own.view' => 'View own leave requests',
                'leave.own.create' => 'Create own leave requests',
                'leave.own.update' => 'Update own leave requests',
                'leave.own.delete' => 'Delete own leave requests',
                'communications.own.view' => 'View own communications',
                'profile.own.view' => 'View own profile',
                'profile.own.update' => 'Update own profile',
                'profile.password.change' => 'Change own password'
            ],

            // Human Resource Management
            'hrm' => [
                'employees.view' => 'View employee records',
                'employees.create' => 'Create employee records',
                'employees.update' => 'Update employee records',
                'employees.delete' => 'Delete employee records',
                'employees.import' => 'Import employee data',
                'employees.export' => 'Export employee data',
                'departments.view' => 'View departments',
                'departments.create' => 'Create departments',
                'departments.update' => 'Update departments',
                'departments.delete' => 'Delete departments',
                'designations.view' => 'View designations/positions',
                'designations.create' => 'Create designations',
                'designations.update' => 'Update designations',
                'designations.delete' => 'Delete designations',
                'attendance.view' => 'View all attendance records',
                'attendance.create' => 'Create attendance records',
                'attendance.update' => 'Update attendance records',
                'attendance.delete' => 'Delete attendance records',
                'attendance.import' => 'Import attendance data',
                'attendance.export' => 'Export attendance data',
                'holidays.view' => 'View holidays',
                'holidays.create' => 'Create holidays',
                'holidays.update' => 'Update holidays',
                'holidays.delete' => 'Delete holidays',
                'leaves.view' => 'View all leave requests',
                'leaves.create' => 'Create leave requests',
                'leaves.update' => 'Update leave requests',
                'leaves.delete' => 'Delete leave requests',
                'leaves.approve' => 'Approve/reject leave requests',
                'leaves.analytics' => 'View leave analytics',
                'leave-settings.view' => 'View leave policy settings',
                'leave-settings.update' => 'Update leave policy settings',
                'jurisdiction.view' => 'View work locations',
                'jurisdiction.create' => 'Create work locations',
                'jurisdiction.update' => 'Update work locations',
                'jurisdiction.delete' => 'Delete work locations'
            ],

            // Project & Portfolio Management
            'ppm' => [
                'daily-works.view' => 'View work logs',
                'daily-works.create' => 'Create work logs',
                'daily-works.update' => 'Update work logs',
                'daily-works.delete' => 'Delete work logs',
                'daily-works.import' => 'Import work log data',
                'daily-works.export' => 'Export work log data',
                'projects.analytics' => 'View project analytics',
                'tasks.view' => 'View tasks',
                'tasks.create' => 'Create tasks',
                'tasks.update' => 'Update tasks',
                'tasks.delete' => 'Delete tasks',
                'tasks.assign' => 'Assign tasks',
                'reports.view' => 'View reports',
                'reports.create' => 'Create reports',
                'reports.update' => 'Update reports',
                'reports.delete' => 'Delete reports'
            ],

            // Document & Knowledge Management
            'dms' => [
                'letters.view' => 'View official correspondence',
                'letters.create' => 'Create official correspondence',
                'letters.update' => 'Update official correspondence',
                'letters.delete' => 'Delete official correspondence',
                'documents.view' => 'View documents',
                'documents.create' => 'Create documents',
                'documents.update' => 'Update documents',
                'documents.delete' => 'Delete documents'
            ],

            // Customer Relationship Management (Future)
            'crm' => [
                'customers.view' => 'View customer records',
                'customers.create' => 'Create customer records',
                'customers.update' => 'Update customer records',
                'customers.delete' => 'Delete customer records',
                'leads.view' => 'View leads and opportunities',
                'leads.create' => 'Create leads',
                'leads.update' => 'Update leads',
                'leads.delete' => 'Delete leads',
                'feedback.view' => 'View customer feedback',
                'feedback.create' => 'Create feedback records',
                'feedback.update' => 'Update feedback',
                'feedback.delete' => 'Delete feedback'
            ],

            // Supply Chain & Inventory Management (Future)
            'scm' => [
                'inventory.view' => 'View inventory',
                'inventory.create' => 'Create inventory items',
                'inventory.update' => 'Update inventory',
                'inventory.delete' => 'Delete inventory items',
                'suppliers.view' => 'View suppliers',
                'suppliers.create' => 'Create supplier records',
                'suppliers.update' => 'Update suppliers',
                'suppliers.delete' => 'Delete suppliers',
                'purchase-orders.view' => 'View purchase orders',
                'purchase-orders.create' => 'Create purchase orders',
                'purchase-orders.update' => 'Update purchase orders',
                'purchase-orders.delete' => 'Delete purchase orders',
                'warehousing.view' => 'View warehouse operations',
                'warehousing.manage' => 'Manage warehouse operations'
            ],

            // Retail & Sales Operations (Future)
            'retail' => [
                'pos.view' => 'View point of sale',
                'pos.operate' => 'Operate POS terminal',
                'sales.view' => 'View sales records',
                'sales.create' => 'Create sales transactions',
                'sales.analytics' => 'View sales analytics'
            ],

            // Financial Management & Accounting (Future)
            'finance' => [
                'accounts-payable.view' => 'View accounts payable',
                'accounts-payable.manage' => 'Manage accounts payable',
                'accounts-receivable.view' => 'View accounts receivable',
                'accounts-receivable.manage' => 'Manage accounts receivable',
                'ledger.view' => 'View general ledger',
                'ledger.manage' => 'Manage general ledger',
                'financial-reports.view' => 'View financial reports',
                'financial-reports.create' => 'Create financial reports'
            ],

            // System Administration
            'admin' => [
                'users.view' => 'View user accounts',
                'users.create' => 'Create user accounts',
                'users.update' => 'Update user accounts',
                'users.delete' => 'Delete user accounts',
                'users.impersonate' => 'Impersonate other users',
                'roles.view' => 'View roles and permissions',
                'roles.create' => 'Create roles',
                'roles.update' => 'Update roles',
                'roles.delete' => 'Delete roles',
                'permissions.assign' => 'Assign permissions to roles',
                'settings.view' => 'View system settings',
                'settings.update' => 'Update system settings',
                'company.settings' => 'Manage company settings',
                'attendance.settings' => 'Manage attendance settings',
                'email.settings' => 'Manage email settings',
                'notification.settings' => 'Manage notification settings',
                'theme.settings' => 'Manage theme and branding',
                'localization.settings' => 'Manage localization settings',
                'performance.settings' => 'Manage performance settings',
                'approval.settings' => 'Manage approval workflows',
                'invoice.settings' => 'Manage invoice settings',
                'salary.settings' => 'Manage salary settings',
                'system.settings' => 'Manage system architecture',
                'audit.view' => 'View audit logs',
                'audit.export' => 'Export audit data',
                'backup.create' => 'Create system backups',
                'backup.restore' => 'Restore system backups'
            ]
        ];

        foreach ($modules as $module => $permissions) {
            foreach ($permissions as $permissionName => $description) {
                Permission::firstOrCreate([
                    'name' => $permissionName,
                    'guard_name' => 'web'
                ], [
                    'module' => $module,
                    'description' => $description
                ]);
            }
        }

        $this->command->info('✅ Permissions created for all modules');
    }

    /**
     * Create roles with hierarchy levels
     */
    private function createRoles(): void
    {
        $roles = [
            [
                'name' => 'Super Administrator',
                'description' => 'Full system access with all privileges',
                'hierarchy_level' => 1,
                'is_system_role' => true
            ],
            [
                'name' => 'Administrator',
                'description' => 'Administrative access to most system functions',
                'hierarchy_level' => 10,
                'is_system_role' => true
            ],
            [
                'name' => 'HR Manager',
                'description' => 'Human resources management and employee operations',
                'hierarchy_level' => 20,
                'is_system_role' => false
            ],
            [
                'name' => 'Project Manager',
                'description' => 'Project and portfolio management capabilities',
                'hierarchy_level' => 20,
                'is_system_role' => false
            ],
            [
                'name' => 'Department Manager',
                'description' => 'Departmental management and team oversight',
                'hierarchy_level' => 30,
                'is_system_role' => false
            ],
            [
                'name' => 'Team Lead',
                'description' => 'Team leadership and basic management functions',
                'hierarchy_level' => 40,
                'is_system_role' => false
            ],
            [
                'name' => 'Senior Employee',
                'description' => 'Senior level employee with extended access',
                'hierarchy_level' => 50,
                'is_system_role' => false
            ],
            [
                'name' => 'Employee',
                'description' => 'Standard employee access to self-service functions',
                'hierarchy_level' => 60,
                'is_system_role' => false
            ],
            [
                'name' => 'Contractor',
                'description' => 'Limited access for contractors and temporary staff',
                'hierarchy_level' => 70,
                'is_system_role' => false
            ],
            [
                'name' => 'Intern',
                'description' => 'Basic access for interns and trainees',
                'hierarchy_level' => 80,
                'is_system_role' => false
            ]
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate([
                'name' => $roleData['name'],
                'guard_name' => 'web'
            ], $roleData);
        }

        $this->command->info('✅ Roles created with hierarchy levels');
    }

    /**
     * Assign permissions to roles based on hierarchy and responsibility
     */
    private function assignPermissionsToRoles(): void
    {
        // Super Administrator - All permissions
        $superAdmin = Role::findByName('Super Administrator');
        $superAdmin->givePermissionTo(Permission::all());

        // Administrator - Most permissions except super admin functions
        $admin = Role::findByName('Administrator');
        $adminPermissions = Permission::whereNotIn('name', [
            'users.impersonate',
            'backup.create',
            'backup.restore'
        ])->get();
        $admin->givePermissionTo($adminPermissions);

        // HR Manager - HR and employee management
        $hrManager = Role::findByName('HR Manager');
        $hrPermissions = Permission::whereIn('module', ['core', 'self-service', 'hrm', 'dms'])
            ->orWhere('name', 'like', 'users.%')
            ->orWhere('name', 'like', 'settings.%')
            ->orWhere('name', 'like', 'company.%')
            ->orWhere('name', 'like', 'attendance.%')
            ->orWhere('name', 'like', 'leave-%')
            ->get();
        $hrManager->givePermissionTo($hrPermissions);

        // Project Manager - Project and portfolio management
        $projectManager = Role::findByName('Project Manager');
        $projectPermissions = Permission::whereIn('module', ['core', 'self-service', 'ppm', 'dms'])
            ->orWhere('name', 'like', 'employees.view')
            ->orWhere('name', 'like', 'departments.view')
            ->orWhere('name', 'like', 'designations.view')
            ->get();
        $projectManager->givePermissionTo($projectPermissions);

        // Department Manager - Departmental oversight
        $deptManager = Role::findByName('Department Manager');
        $deptPermissions = Permission::whereIn('module', ['core', 'self-service', 'ppm'])
            ->orWhereIn('name', [
                'employees.view', 'employees.update',
                'attendance.view', 'attendance.create',
                'leaves.view', 'leaves.approve',
                'departments.view', 'designations.view'
            ])
            ->get();
        $deptManager->givePermissionTo($deptPermissions);

        // Team Lead - Team management
        $teamLead = Role::findByName('Team Lead');
        $teamPermissions = Permission::whereIn('module', ['core', 'self-service'])
            ->orWhereIn('name', [
                'employees.view',
                'attendance.view',
                'leaves.view',
                'daily-works.view', 'daily-works.create', 'daily-works.update',
                'tasks.view', 'tasks.create', 'tasks.update', 'tasks.assign'
            ])
            ->get();
        $teamLead->givePermissionTo($teamPermissions);

        // Senior Employee - Extended self-service
        $seniorEmployee = Role::findByName('Senior Employee');
        $seniorPermissions = Permission::whereIn('module', ['core', 'self-service'])
            ->orWhereIn('name', [
                'daily-works.view', 'daily-works.create', 'daily-works.update',
                'tasks.view', 'tasks.create', 'tasks.update'
            ])
            ->get();
        $seniorEmployee->givePermissionTo($seniorPermissions);

        // Employee - Basic self-service
        $employee = Role::findByName('Employee');
        $employeePermissions = Permission::whereIn('module', ['core', 'self-service'])
            ->orWhereIn('name', [
                'daily-works.view', 'daily-works.create',
                'tasks.view'
            ])
            ->get();
        $employee->givePermissionTo($employeePermissions);

        // Contractor - Limited access
        $contractor = Role::findByName('Contractor');
        $contractorPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'attendance.own.view', 'attendance.own.punch',
            'profile.own.view', 'profile.own.update', 'profile.password.change',
            'daily-works.view', 'daily-works.create',
            'tasks.view'
        ])
        ->get();
        $contractor->givePermissionTo($contractorPermissions);

        // Intern - Minimal access
        $intern = Role::findByName('Intern');
        $internPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'attendance.own.view', 'attendance.own.punch',
            'profile.own.view', 'profile.password.change',
            'tasks.view'
        ])
        ->get();
        $intern->givePermissionTo($internPermissions);

        $this->command->info('✅ Permissions assigned to all roles');
    }
}
