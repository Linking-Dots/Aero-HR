<?php

namespace Database\Seeders\Tenant;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Console\Command;

class TenantRolesSeeder extends Seeder
{
    /**
     * The command instance.
     *
     * @var Command
     */
    protected $command;

    /**
     * Set the console command instance.
     *
     * @param Command $command
     * @return void
     */
    public function setCommand(Command $command)
    {
        $this->command = $command;
        return $this;
    }

    /**
     * Run the database seeds.
     * This creates the comprehensive role and permission system for each tenant.
     */
    public function run(): void
    {
        // Temporarily switch to array cache to avoid database cache issues
        $originalCacheDefault = config('cache.default');
        config(['cache.default' => 'array']);
        
        // Clear the cache manager instance to pick up new config
        app()->forgetInstance('cache');
        app()->forgetInstance('cache.store');
        
        try {
            // Clear permission cache for this tenant (with fallback for missing cache table)
            try {
                app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            } catch (\Exception $e) {
                // Ignore cache table not found errors
                if ($this->command) {
                    $this->command->warn('⚠️  Permission cache reset skipped (cache table not found)');
                }
            }

            // Create permissions for all modules
            $this->createPermissions();

            // Create roles with hierarchy
            $this->createRoles();

            // Assign permissions to roles
            $this->assignPermissionsToRoles();

            if ($this->command) {
                $this->command->info('✅ Tenant role and permission system created successfully!');
            }
        } finally {
            // Restore original cache configuration
            config(['cache.default' => $originalCacheDefault]);
            app()->forgetInstance('cache');
            app()->forgetInstance('cache.store');
        }
    }

    /**
     * Create all permissions based on modules - using the existing comprehensive system
     */
    private function createPermissions(): void
    {
        // Import the same permission structure as the main ComprehensiveRolePermissionSeeder
        // but tailored for tenant context
        $modules = [
            // Core System
            'core' => [
                'core.dashboard.view' => 'View dashboard and analytics',
                'core.stats.view' => 'View system statistics',
                'core.updates.view' => 'View system updates'
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

            // Human Resource Management - Full HRM permissions from existing system
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
                'jurisdiction.delete' => 'Delete work locations',

                // Enhanced HRM from existing system
                'hr.onboarding.view' => 'View employee onboarding',
                'hr.onboarding.create' => 'Create onboarding process',
                'hr.onboarding.update' => 'Update onboarding process',
                'hr.onboarding.delete' => 'Delete onboarding process',
                'hr.offboarding.view' => 'View employee offboarding',
                'hr.offboarding.create' => 'Create offboarding process',
                'hr.offboarding.update' => 'Update offboarding process',
                'hr.offboarding.delete' => 'Delete offboarding process',
                'hr.checklists.view' => 'View HR checklists',
                'hr.checklists.create' => 'Create HR checklists',
                'hr.checklists.update' => 'Update HR checklists',
                'hr.checklists.delete' => 'Delete HR checklists',
                'hr.skills.view' => 'View skills database',
                'hr.skills.create' => 'Create skills',
                'hr.skills.update' => 'Update skills',
                'hr.skills.delete' => 'Delete skills',
                'hr.competencies.view' => 'View competencies',
                'hr.competencies.create' => 'Create competencies',
                'hr.competencies.update' => 'Update competencies',
                'hr.competencies.delete' => 'Delete competencies',
                'hr.employee.skills.view' => 'View employee skills',
                'hr.employee.skills.create' => 'Add employee skills',
                'hr.employee.skills.update' => 'Update employee skills',
                'hr.employee.skills.delete' => 'Remove employee skills',
                'hr.benefits.view' => 'View benefits programs',
                'hr.benefits.create' => 'Create benefits programs',
                'hr.benefits.update' => 'Update benefits programs',
                'hr.benefits.delete' => 'Delete benefits programs',
                'hr.safety.view' => 'View workplace safety',
                'hr.safety.create' => 'Create safety records',
                'hr.safety.update' => 'Update safety records',
                'hr.safety.delete' => 'Delete safety records',
                'hr.payroll.view' => 'View payroll',
                'hr.payroll.create' => 'Create payroll',
                'hr.payroll.update' => 'Update payroll',
                'hr.payroll.delete' => 'Delete payroll',
                'hr.payroll.process' => 'Process payroll',
                'hr.selfservice.view' => 'Access self-service portal',
                'hr.selfservice.profile.view' => 'View self-service profile',
                'hr.selfservice.profile.update' => 'Update self-service profile',
                'hr.selfservice.documents.view' => 'View self-service documents',
                'hr.selfservice.benefits.view' => 'View self-service benefits',
                'hr.selfservice.timeoff.view' => 'View self-service time off',
                'hr.selfservice.timeoff.request' => 'Request time off via self-service',
                'hr.selfservice.trainings.view' => 'View self-service trainings',
                'hr.selfservice.payslips.view' => 'View self-service payslips',
                'hr.selfservice.performance.view' => 'View self-service performance',
                'hr.timeoff.view' => 'View time off requests',
                'hr.timeoff.approve' => 'Approve time off requests',
                'hr.timeoff.reject' => 'Reject time off requests',
                'hr.timeoff.calendar.view' => 'View time off calendar'
            ],

            // Customer Relationship Management
            'crm' => [
                'crm.leads.view' => 'View leads',
                'crm.leads.create' => 'Create leads',
                'crm.leads.update' => 'Update leads',
                'crm.leads.delete' => 'Delete leads',
                'crm.contacts.view' => 'View contacts',
                'crm.contacts.create' => 'Create contacts',
                'crm.contacts.update' => 'Update contacts',
                'crm.contacts.delete' => 'Delete contacts',
                'crm.companies.view' => 'View companies',
                'crm.companies.create' => 'Create companies',
                'crm.companies.update' => 'Update companies',
                'crm.companies.delete' => 'Delete companies',
                'crm.deals.view' => 'View deals',
                'crm.deals.create' => 'Create deals',
                'crm.deals.update' => 'Update deals',
                'crm.deals.delete' => 'Delete deals',
                'crm.activities.view' => 'View activities',
                'crm.activities.create' => 'Create activities',
                'crm.activities.update' => 'Update activities',
                'crm.activities.delete' => 'Delete activities',
                'crm.reports.view' => 'View CRM reports',
                'crm.pipeline.view' => 'View sales pipeline',
                'crm.pipeline.manage' => 'Manage sales pipeline'
            ],

            // Project and Portfolio Management
            'ppm' => [
                'projects.view' => 'View projects',
                'projects.create' => 'Create projects',
                'projects.update' => 'Update projects',
                'projects.delete' => 'Delete projects',
                'tasks.view' => 'View tasks',
                'tasks.create' => 'Create tasks',
                'tasks.update' => 'Update tasks',
                'tasks.delete' => 'Delete tasks',
                'tasks.assign' => 'Assign tasks to team members',
                'daily-works.view' => 'View daily work reports',
                'daily-works.create' => 'Create daily work reports',
                'daily-works.update' => 'Update daily work reports',
                'daily-works.delete' => 'Delete daily work reports',
                'project-reports.view' => 'View project reports',
                'project-analytics.view' => 'View project analytics',
                'resource-allocation.view' => 'View resource allocation',
                'resource-allocation.manage' => 'Manage resource allocation'
            ],

            // Performance Management
            'performance' => [
                'performance-reviews.view' => 'View performance reviews',
                'performance-reviews.create' => 'Create performance reviews',
                'performance-reviews.update' => 'Update performance reviews',
                'performance-reviews.delete' => 'Delete performance reviews',
                'performance-reviews.approve' => 'Approve performance reviews',
                'performance-reviews.own.view' => 'View own performance reviews',
                'performance-reviews.own.create' => 'Create own performance reviews',
                'performance-reviews.own.update' => 'Update own performance reviews',
                'performance-analytics.view' => 'View performance analytics',
                'goals.view' => 'View goals',
                'goals.create' => 'Create goals',
                'goals.update' => 'Update goals',
                'goals.delete' => 'Delete goals',
                'goals.own.view' => 'View own goals',
                'goals.own.create' => 'Create own goals',
                'goals.own.update' => 'Update own goals'
            ],

            // Training and Development
            'training' => [
                'training-programs.view' => 'View training programs',
                'training-programs.create' => 'Create training programs',
                'training-programs.update' => 'Update training programs',
                'training-programs.delete' => 'Delete training programs',
                'training-sessions.view' => 'View training sessions',
                'training-sessions.create' => 'Create training sessions',
                'training-sessions.update' => 'Update training sessions',
                'training-sessions.delete' => 'Delete training sessions',
                'training-enrollments.view' => 'View training enrollments',
                'training-enrollments.create' => 'Create training enrollments',
                'training-enrollments.update' => 'Update training enrollments',
                'training-enrollments.delete' => 'Delete training enrollments',
                'training-assignment-submissions.view' => 'View training assignment submissions',
                'training-assignment-submissions.create' => 'Create training assignment submissions',
                'training-assignment-submissions.update' => 'Update training assignment submissions',
                'training-assignment-submissions.delete' => 'Delete training assignment submissions',
                'training-assignment-submissions.grade' => 'Grade training assignment submissions',
                'training-feedback.view' => 'View training feedback',
                'training-feedback.create' => 'Create training feedback',
                'training-feedback.own.view' => 'View own training feedback',
                'training-feedback.own.create' => 'Create own training feedback',
                'training-certificates.view' => 'View training certificates',
                'training-certificates.issue' => 'Issue training certificates'
            ],

            // Recruitment
            'recruitment' => [
                'jobs.view' => 'View job postings',
                'jobs.create' => 'Create job postings',
                'jobs.update' => 'Update job postings',
                'jobs.delete' => 'Delete job postings',
                'jobs.publish' => 'Publish job postings',
                'job-applications.view' => 'View job applications',
                'job-applications.update' => 'Update job applications',
                'job-applications.delete' => 'Delete job applications',
                'recruitment-pipeline.view' => 'View recruitment pipeline',
                'recruitment-pipeline.manage' => 'Manage recruitment pipeline',
                'candidates.view' => 'View candidates',
                'candidates.create' => 'Create candidates',
                'candidates.update' => 'Update candidates',
                'candidates.delete' => 'Delete candidates',
                'interviews.view' => 'View interviews',
                'interviews.schedule' => 'Schedule interviews',
                'interviews.conduct' => 'Conduct interviews',
                'interview-feedback.view' => 'View interview feedback',
                'interview-feedback.create' => 'Create interview feedback'
            ],

            // Inventory Management
            'inventory' => [
                'inventory.items.view' => 'View inventory items',
                'inventory.items.create' => 'Create inventory items',
                'inventory.items.update' => 'Update inventory items',
                'inventory.items.delete' => 'Delete inventory items',
                'inventory.categories.view' => 'View inventory categories',
                'inventory.categories.create' => 'Create inventory categories',
                'inventory.categories.update' => 'Update inventory categories',
                'inventory.categories.delete' => 'Delete inventory categories',
                'inventory.transactions.view' => 'View inventory transactions',
                'inventory.transactions.create' => 'Create inventory transactions',
                'inventory.reports.view' => 'View inventory reports',
                'inventory.audit.view' => 'View inventory audits',
                'inventory.audit.create' => 'Create inventory audits'
            ],

            // Document Management System
            'dms' => [
                'documents.view' => 'View documents',
                'documents.create' => 'Create documents',
                'documents.update' => 'Update documents',
                'documents.delete' => 'Delete documents',
                'documents.download' => 'Download documents',
                'documents.share' => 'Share documents',
                'document-categories.view' => 'View document categories',
                'document-categories.create' => 'Create document categories',
                'document-categories.update' => 'Update document categories',
                'document-categories.delete' => 'Delete document categories',
                'document-approval.view' => 'View document approvals',
                'document-approval.approve' => 'Approve documents',
                'document-approval.reject' => 'Reject documents'
            ],

            // Finance Management
            'finance' => [
                'finance.expenses.view' => 'View expenses',
                'finance.expenses.create' => 'Create expenses',
                'finance.expenses.update' => 'Update expenses',
                'finance.expenses.delete' => 'Delete expenses',
                'finance.expenses.approve' => 'Approve expenses',
                'finance.invoices.view' => 'View invoices',
                'finance.invoices.create' => 'Create invoices',
                'finance.invoices.update' => 'Update invoices',
                'finance.invoices.delete' => 'Delete invoices',
                'finance.payments.view' => 'View payments',
                'finance.payments.create' => 'Create payments',
                'finance.payments.update' => 'Update payments',
                'finance.budgets.view' => 'View budgets',
                'finance.budgets.create' => 'Create budgets',
                'finance.budgets.update' => 'Update budgets',
                'finance.reports.view' => 'View financial reports',
                'finance.analytics.view' => 'View financial analytics'
            ],

            // Administration
            'admin' => [
                'users.view' => 'View users',
                'users.create' => 'Create users',
                'users.update' => 'Update users',
                'users.delete' => 'Delete users',
                'roles.view' => 'View roles',
                'roles.create' => 'Create roles',
                'roles.update' => 'Update roles',
                'roles.delete' => 'Delete roles',
                'permissions.view' => 'View permissions',
                'permissions.update' => 'Update permissions',
                'settings.view' => 'View system settings',
                'settings.update' => 'Update system settings',
                'audit-logs.view' => 'View audit logs',
                'system-logs.view' => 'View system logs',
                'backup.create' => 'Create system backups',
                'backup.restore' => 'Restore system backups'
            ]
        ];

        // Create permissions
        foreach ($modules as $module => $permissions) {
            foreach ($permissions as $name => $description) {
                Permission::firstOrCreate([
                    'name' => $name,
                    'guard_name' => 'web'
                ], [
                    'description' => $description,
                    'module' => $module
                ]);
            }
        }

        if ($this->command) {
            $this->command->info('✅ Permissions created for all modules');
        }
    }

    /**
     * Create roles with hierarchy for tenant - based on existing system
     */
    private function createRoles(): void
    {
        $roles = [
            [
                'name' => 'Tenant Admin',
                'description' => 'Full access to tenant system (created during tenant setup)',
                'hierarchy_level' => 10,
                'is_system_role' => true
            ],
            [
                'name' => 'HR Manager',
                'description' => 'Complete human resources management access',
                'hierarchy_level' => 20,
                'is_system_role' => false
            ],
            [
                'name' => 'Project Manager',
                'description' => 'Project and portfolio management access',
                'hierarchy_level' => 30,
                'is_system_role' => false
            ],
            [
                'name' => 'Department Manager',
                'description' => 'Departmental oversight and management',
                'hierarchy_level' => 40,
                'is_system_role' => false
            ],
            [
                'name' => 'Team Lead',
                'description' => 'Team leadership and task management',
                'hierarchy_level' => 50,
                'is_system_role' => false
            ],
            [
                'name' => 'Senior Employee',
                'description' => 'Senior employee with extended privileges',
                'hierarchy_level' => 55,
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

        if ($this->command) {
            $this->command->info('✅ Tenant roles created with hierarchy levels');
        }
    }

    /**
     * Assign permissions to roles - based on existing comprehensive system
     */
    private function assignPermissionsToRoles(): void
    {
        // Tenant Admin - All permissions (equivalent to Super Administrator but tenant-scoped)
        $tenantAdmin = Role::findByName('Tenant Admin');
        $tenantAdmin->givePermissionTo(Permission::all());

        // HR Manager - HR and employee management (same as existing system)
        $hrManager = Role::findByName('HR Manager');
        $hrPermissions = Permission::whereIn('module', ['core', 'self-service', 'hrm', 'performance', 'training', 'recruitment'])
            ->orWhere('name', 'like', 'users.%')
            ->orWhere('name', 'like', 'employees.%')
            ->orWhere('name', 'like', 'departments.%')
            ->orWhere('name', 'like', 'designations.%')
            ->orWhere('name', 'like', 'attendance.%')
            ->orWhere('name', 'like', 'leave%')
            ->orWhere('name', 'like', 'hr.%')
            ->get();
        $hrManager->givePermissionTo($hrPermissions);

        // Project Manager - Project and portfolio management (same as existing)
        $projectManager = Role::findByName('Project Manager');
        $projectPermissions = Permission::whereIn('module', ['core', 'self-service', 'ppm'])
            ->orWhereIn('name', ['employees.view', 'departments.view', 'designations.view'])
            ->get();
        $projectManager->givePermissionTo($projectPermissions);

        // Department Manager - Departmental oversight (same as existing)
        $deptManager = Role::findByName('Department Manager');
        $deptPermissions = Permission::whereIn('module', ['core', 'self-service', 'ppm'])
            ->orWhereIn('name', [
                'employees.view', 'employees.update',
                'attendance.view', 'attendance.create',
                'leaves.view', 'leaves.approve',
                'departments.view', 'designations.view',
                'performance-reviews.view', 'performance-reviews.create', 'performance-reviews.update', 'performance-reviews.approve',
                'performance-analytics.view',
                'hr.onboarding.view', 'hr.offboarding.view',
                'hr.skills.view', 'hr.employee.skills.view', 'hr.employee.skills.update',
                'hr.timeoff.view', 'hr.timeoff.approve', 'hr.timeoff.reject'
            ])
            ->get();
        $deptManager->givePermissionTo($deptPermissions);

        // Team Lead - Team management (same as existing)
        $teamLead = Role::findByName('Team Lead');
        $teamPermissions = Permission::whereIn('module', ['core', 'self-service'])
            ->orWhereIn('name', [
                'employees.view', 'attendance.view', 'leaves.view',
                'daily-works.view', 'daily-works.create', 'daily-works.update',
                'tasks.view', 'tasks.create', 'tasks.update', 'tasks.assign',
                'performance-reviews.view', 'performance-reviews.create', 'performance-reviews.update',
                'training-sessions.view', 'training-enrollments.view', 'training-enrollments.create',
                'training-assignment-submissions.view', 'training-assignment-submissions.grade'
            ])
            ->get();
        $teamLead->givePermissionTo($teamPermissions);

        // Senior Employee - Extended self-service (same as existing)
        $seniorEmployee = Role::findByName('Senior Employee');
        $seniorPermissions = Permission::whereIn('module', ['core', 'self-service'])
            ->orWhereIn('name', [
                'daily-works.view', 'daily-works.create', 'daily-works.update',
                'tasks.view', 'tasks.create', 'tasks.update',
                'performance-reviews.own.view', 'performance-reviews.own.create', 'performance-reviews.own.update',
                'training-feedback.own.view', 'training-feedback.own.create',
                'training-assignment-submissions.create', 'training-assignment-submissions.update'
            ])
            ->get();
        $seniorEmployee->givePermissionTo($seniorPermissions);

        // Employee - Basic self-service (same as existing)
        $employee = Role::findByName('Employee');
        $employeePermissions = Permission::whereIn('module', ['core', 'self-service'])
            ->orWhereIn('name', [
                'daily-works.view', 'daily-works.create',
                'tasks.view',
                'performance-reviews.own.view',
                'training-feedback.own.view', 'training-feedback.own.create',
                'training-assignment-submissions.create',
                'hr.selfservice.view', 'hr.selfservice.profile.view', 'hr.selfservice.profile.update',
                'hr.selfservice.documents.view', 'hr.selfservice.benefits.view',
                'hr.selfservice.timeoff.view', 'hr.selfservice.timeoff.request',
                'hr.selfservice.trainings.view', 'hr.selfservice.payslips.view',
                'hr.selfservice.performance.view'
            ])
            ->get();
        $employee->givePermissionTo($employeePermissions);

        // Contractor - Limited access (same as existing)
        $contractor = Role::findByName('Contractor');
        $contractorPermissions = Permission::whereIn('name', [
            'core.dashboard.view',
            'attendance.own.view', 'attendance.own.punch',
            'profile.own.view', 'profile.own.update', 'profile.password.change',
            'daily-works.view', 'daily-works.create',
            'tasks.view'
        ])->get();
        $contractor->givePermissionTo($contractorPermissions);

        // Intern - Minimal access (same as existing)
        $intern = Role::findByName('Intern');
        $internPermissions = Permission::whereIn('name', [
            'core.dashboard.view',
            'attendance.own.view', 'attendance.own.punch',
            'profile.own.view', 'profile.password.change',
            'tasks.view'
        ])->get();
        $intern->givePermissionTo($internPermissions);

        if ($this->command) {
            $this->command->info('✅ Permissions assigned to all tenant roles');
        }
    }
}
