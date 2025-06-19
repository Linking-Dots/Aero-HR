<?php

namespace App\Services\Role;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Enterprise Role Permission Service
 * 
 * Implements ISO 27001/27002 compliant role-based access control
 * Follows RBAC (Role-Based Access Control) industry standards
 */
class RolePermissionService
{
    /**
     * Standard enterprise module definitions aligned with pages.jsx
     */
    private const ENTERPRISE_MODULES = [
        // Core HR & Employee Management
        'employees' => [
            'name' => 'Employee Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'import', 'export'],
            'description' => 'Employee directory, profiles, and management',
            'category' => 'human_resources'
        ],
        'departments' => [
            'name' => 'Department Management',
            'permissions' => ['read', 'write', 'create', 'delete'],
            'description' => 'Department structure and management',
            'category' => 'human_resources'
        ],
        'designations' => [
            'name' => 'Job Positions',
            'permissions' => ['read', 'write', 'create', 'delete'],
            'description' => 'Job titles and position management',
            'category' => 'human_resources'
        ],
        'attendances' => [
            'name' => 'Attendance Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'import', 'export'],
            'description' => 'Time tracking and attendance monitoring',
            'category' => 'human_resources'
        ],
        'leaves' => [
            'name' => 'Leave Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'approve', 'reject'],
            'description' => 'Leave applications and approvals',
            'category' => 'human_resources'
        ],
        'holidays' => [
            'name' => 'Holiday Calendar',
            'permissions' => ['read', 'write', 'create', 'delete'],
            'description' => 'Holiday and calendar management',
            'category' => 'human_resources'
        ],

        // Customer Management (CRM)
        'customers' => [
            'name' => 'Customer Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'import', 'export'],
            'description' => 'Customer relationship management',
            'category' => 'customer_relations'
        ],
        'leads' => [
            'name' => 'Leads & Opportunities',
            'permissions' => ['read', 'write', 'create', 'delete', 'convert'],
            'description' => 'Lead generation and opportunity tracking',
            'category' => 'customer_relations'
        ],
        'feedback' => [
            'name' => 'Customer Feedback',
            'permissions' => ['read', 'write', 'create', 'delete'],
            'description' => 'Customer feedback and reviews',
            'category' => 'customer_relations'
        ],

        // Project Management
        'projects' => [
            'name' => 'Project Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'manage', 'assign'],
            'description' => 'Project planning and execution',
            'category' => 'project_management'
        ],
        'daily_works' => [
            'name' => 'Daily Work Logs',
            'permissions' => ['read', 'write', 'create', 'delete', 'approve'],
            'description' => 'Daily work tracking and logging',
            'category' => 'project_management'
        ],
        'work_summary' => [
            'name' => 'Work Summary Reports',
            'permissions' => ['read', 'write', 'export'],
            'description' => 'Work performance reports',
            'category' => 'project_management'
        ],

        // Inventory Management System (IMS)
        'inventory' => [
            'name' => 'Inventory Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'import', 'export', 'audit'],
            'description' => 'Stock and inventory management',
            'category' => 'inventory'
        ],
        'suppliers' => [
            'name' => 'Supplier Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'import', 'export'],
            'description' => 'Supplier and vendor management',
            'category' => 'inventory'
        ],
        'purchase_orders' => [
            'name' => 'Purchase Orders',
            'permissions' => ['read', 'write', 'create', 'delete', 'approve', 'reject'],
            'description' => 'Purchase order management',
            'category' => 'inventory'
        ],
        'warehousing' => [
            'name' => 'Warehousing',
            'permissions' => ['read', 'write', 'create', 'delete', 'transfer'],
            'description' => 'Warehouse operations management',
            'category' => 'inventory'
        ],

        // Point of Sale (POS)
        'pos' => [
            'name' => 'Point of Sale',
            'permissions' => ['read', 'write', 'create', 'process', 'refund'],
            'description' => 'Sales terminal operations',
            'category' => 'point_of_sale'
        ],
        'sales_history' => [
            'name' => 'Sales History',
            'permissions' => ['read', 'export', 'report'],
            'description' => 'Transaction history and reports',
            'category' => 'point_of_sale'
        ],

        // Finance & Accounting
        'finance' => [
            'name' => 'Finance & Accounting',
            'permissions' => ['read', 'write', 'create', 'delete', 'approve', 'audit'],
            'description' => 'Financial management and accounting',
            'category' => 'finance'
        ],
        'accounts_payable' => [
            'name' => 'Accounts Payable',
            'permissions' => ['read', 'write', 'create', 'delete', 'approve', 'pay'],
            'description' => 'Vendor payment management',
            'category' => 'finance'
        ],
        'accounts_receivable' => [
            'name' => 'Accounts Receivable',
            'permissions' => ['read', 'write', 'create', 'delete', 'collect'],
            'description' => 'Customer payment tracking',
            'category' => 'finance'
        ],
        'ledger' => [
            'name' => 'General Ledger',
            'permissions' => ['read', 'write', 'create', 'delete', 'reconcile'],
            'description' => 'General accounting ledger',
            'category' => 'finance'
        ],
        'financial_reports' => [
            'name' => 'Financial Reports',
            'permissions' => ['read', 'export', 'generate'],
            'description' => 'Financial reporting and analytics',
            'category' => 'finance'
        ],

        // Document Center
        'documents' => [
            'name' => 'Document Center',
            'permissions' => ['read', 'write', 'create', 'delete', 'approve', 'archive'],
            'description' => 'Document management system',
            'category' => 'document_management'
        ],
        'letters' => [
            'name' => 'Official Letters',
            'permissions' => ['read', 'write', 'create', 'delete', 'send'],
            'description' => 'Official correspondence',
            'category' => 'document_management'
        ],

        // System Administration
        'admin' => [
            'name' => 'System Administration',
            'permissions' => ['read', 'write', 'create', 'delete', 'configure', 'audit'],
            'description' => 'System administration and configuration',
            'category' => 'administration'
        ],
        'users' => [
            'name' => 'User Administration',
            'permissions' => ['read', 'write', 'create', 'delete', 'activate', 'deactivate'],
            'description' => 'User account management',
            'category' => 'administration'
        ],
        'roles' => [
            'name' => 'Role Management',
            'permissions' => ['read', 'write', 'create', 'delete', 'assign'],
            'description' => 'Role and permission management',
            'category' => 'administration'
        ],
        'settings' => [
            'name' => 'System Configuration',
            'permissions' => ['read', 'write', 'configure', 'backup', 'restore'],
            'description' => 'System settings and configuration',
            'category' => 'administration'
        ],
        'analytics' => [
            'name' => 'Performance Analytics',
            'permissions' => ['read', 'export', 'dashboard'],
            'description' => 'System performance and analytics',
            'category' => 'administration'
        ]
    ];    /**
     * Standard enterprise role templates
     */
    private const ENTERPRISE_ROLES = [
        'super_admin' => [
            'name' => 'Super Administrator',
            'description' => 'Full system access with all permissions',
            'guard_name' => 'web',
            'is_system_role' => true,
            'hierarchy_level' => 1,
            'permissions' => '*' // All permissions
        ],
        'administrator' => [
            'name' => 'Administrator',
            'description' => 'Administrative access to most system functions',
            'guard_name' => 'web',
            'is_system_role' => true,
            'hierarchy_level' => 2,
            'permissions' => [
                'read admin', 'write admin', 'create admin', 'delete admin', 'configure admin', 'audit admin',
                'read users', 'write users', 'create users', 'delete users', 'activate users', 'deactivate users',
                'read roles', 'write roles', 'create roles', 'delete roles', 'assign roles',
                'read settings', 'write settings', 'configure settings', 'backup settings', 'restore settings',
                'read employees', 'write employees', 'create employees', 'delete employees', 'import employees', 'export employees',
                'read departments', 'write departments', 'create departments', 'delete departments',
                'read designations', 'write designations', 'create designations', 'delete designations'
            ]
        ],
        'hr_manager' => [
            'name' => 'HR Manager',
            'description' => 'Human resources management and oversight',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 3,
            'permissions' => [
                'read employees', 'write employees', 'create employees', 'delete employees', 'import employees', 'export employees',
                'read departments', 'write departments', 'create departments', 'delete departments',
                'read designations', 'write designations', 'create designations', 'delete designations',
                'read attendances', 'write attendances', 'create attendances', 'delete attendances', 'import attendances', 'export attendances',
                'read leaves', 'write leaves', 'create leaves', 'delete leaves', 'approve leaves', 'reject leaves',
                'read holidays', 'write holidays', 'create holidays', 'delete holidays'
            ]
        ],
        'project_manager' => [
            'name' => 'Project Manager',
            'description' => 'Project management and team coordination',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 3,
            'permissions' => [
                'read projects', 'write projects', 'create projects', 'delete projects', 'manage projects', 'assign projects',
                'read daily_works', 'write daily_works', 'create daily_works', 'delete daily_works', 'approve daily_works',
                'read work_summary', 'write work_summary', 'export work_summary',
                'read employees', 'read attendances'
            ]
        ],
        'finance_manager' => [
            'name' => 'Finance Manager',
            'description' => 'Financial operations and accounting management',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 3,
            'permissions' => [
                'read finance', 'write finance', 'create finance', 'delete finance', 'approve finance', 'audit finance',
                'read accounts_payable', 'write accounts_payable', 'create accounts_payable', 'delete accounts_payable', 'approve accounts_payable', 'pay accounts_payable',
                'read accounts_receivable', 'write accounts_receivable', 'create accounts_receivable', 'delete accounts_receivable', 'collect accounts_receivable',
                'read ledger', 'write ledger', 'create ledger', 'delete ledger', 'reconcile ledger',
                'read financial_reports', 'export financial_reports', 'generate financial_reports'
            ]
        ],
        'inventory_manager' => [
            'name' => 'Inventory Manager',
            'description' => 'Inventory and supply chain management',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 4,
            'permissions' => [
                'read inventory', 'write inventory', 'create inventory', 'delete inventory', 'import inventory', 'export inventory', 'audit inventory',
                'read suppliers', 'write suppliers', 'create suppliers', 'delete suppliers', 'import suppliers', 'export suppliers',
                'read purchase_orders', 'write purchase_orders', 'create purchase_orders', 'delete purchase_orders', 'approve purchase_orders', 'reject purchase_orders',
                'read warehousing', 'write warehousing', 'create warehousing', 'delete warehousing', 'transfer warehousing'
            ]
        ],
        'sales_manager' => [
            'name' => 'Sales Manager',
            'description' => 'Sales operations and customer management',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 4,
            'permissions' => [
                'read customers', 'write customers', 'create customers', 'delete customers', 'import customers', 'export customers',
                'read leads', 'write leads', 'create leads', 'delete leads', 'convert leads',
                'read feedback', 'write feedback', 'create feedback', 'delete feedback',
                'read pos', 'write pos', 'create pos', 'process pos', 'refund pos',
                'read sales_history', 'export sales_history', 'report sales_history'
            ]
        ],
        'team_lead' => [
            'name' => 'Team Lead',
            'description' => 'Team leadership and project coordination',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 5,
            'permissions' => [
                'read daily_works', 'write daily_works', 'create daily_works',
                'read attendances', 'read leaves', 'read projects'
            ]
        ],
        'supervisor' => [
            'name' => 'Supervisor',
            'description' => 'Supervisory access and team oversight',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 6,
            'permissions' => [
                'read employees', 'read attendances', 'read daily_works',
                'read leaves', 'approve leaves'
            ]
        ],
        'employee' => [
            'name' => 'Employee',
            'description' => 'Standard employee access to personal features',
            'guard_name' => 'web',
            'is_system_role' => false,
            'hierarchy_level' => 10,
            'permissions' => [
                'read attendances', 'read leaves', 'create leaves',
                'read daily_works', 'create daily_works'
            ]
        ]
    ];

    /**
     * Initialize standard enterprise modules and roles
     */
    public function initializeEnterpriseSystem(): array
    {
        DB::beginTransaction();
        
        try {
            $results = [
                'modules_created' => 0,
                'permissions_created' => 0,
                'roles_created' => 0,
                'assignments_made' => 0
            ];

            // Create all permissions for modules
            foreach (self::ENTERPRISE_MODULES as $moduleKey => $moduleConfig) {
                $results['modules_created']++;
                
                foreach ($moduleConfig['permissions'] as $permission) {
                    $permissionName = "{$permission} {$moduleKey}";
                    
                    Permission::firstOrCreate([
                        'name' => $permissionName,
                        'guard_name' => 'web'
                    ]);
                    
                    $results['permissions_created']++;
                }
            }

            // Create standard enterprise roles
            foreach (self::ENTERPRISE_ROLES as $roleKey => $roleConfig) {
                $role = Role::firstOrCreate([
                    'name' => $roleConfig['name'],
                    'guard_name' => $roleConfig['guard_name']
                ]);

                // Add custom attributes if using extended role model
                if (method_exists($role, 'update')) {
                    $role->update([
                        'description' => $roleConfig['description'],
                        'is_system_role' => $roleConfig['is_system_role'],
                        'hierarchy_level' => $roleConfig['hierarchy_level']
                    ]);
                }

                $results['roles_created']++;

                // Assign permissions based on role configuration
                $this->assignRolePermissions($role, $roleConfig['permissions']);
                $results['assignments_made']++;
            }

            DB::commit();
            Cache::forget('spatie.permission.cache');
            
            Log::info('Enterprise role system initialized', $results);
            
            return $results;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to initialize enterprise system: ' . $e->getMessage());
            throw $e;
        }
    }    /**
     * Assign permissions to a role with wildcard support
     */
    private function assignRolePermissions(Role $role, $permissions): void
    {
        if ($permissions === '*') {
            // Assign all permissions
            $role->syncPermissions(Permission::all());
            return;
        }

        $permissionNames = [];
        
        foreach ((array) $permissions as $permission) {
            // Direct permission assignment - no wildcard support since 
            // we're using explicit permission lists now
            $existingPermission = Permission::where('name', $permission)->first();
            if ($existingPermission) {
                $permissionNames[] = $permission;
            } else {
                Log::warning("Permission not found: {$permission} for role: {$role->name}");
            }
        }

        if (!empty($permissionNames)) {
            $role->syncPermissions(array_unique($permissionNames));
        }
    }

    /**
     * Get enterprise module structure for frontend
     */
    public function getEnterpriseModules(): array
    {
        $modules = [];
        
        foreach (self::ENTERPRISE_MODULES as $moduleKey => $moduleConfig) {
            $modules[$moduleKey] = [
                'name' => $moduleConfig['name'],
                'description' => $moduleConfig['description'],
                'category' => $moduleConfig['category'],
                'permissions' => $moduleConfig['permissions'],
                'available_permissions' => $this->getModulePermissions($moduleKey)
            ];
        }

        return $modules;
    }

    /**
     * Get all permissions for a specific module
     */
    public function getModulePermissions(string $module): Collection
    {
        return Permission::where('name', 'like', "% {$module}")
            ->orderBy('name')
            ->get();
    }

    /**
     * Get role hierarchy for authorization checks
     */
    public function getRoleHierarchy(): array
    {
        $hierarchy = [];
        
        foreach (self::ENTERPRISE_ROLES as $roleKey => $roleConfig) {
            $hierarchy[$roleConfig['hierarchy_level']][] = [
                'key' => $roleKey,
                'name' => $roleConfig['name'],
                'description' => $roleConfig['description']
            ];
        }

        ksort($hierarchy);
        return $hierarchy;
    }

    /**
     * Check if a role can manage another role (hierarchy-based)
     */
    public function canManageRole(Role $managerRole, Role $targetRole): bool
    {
        $managerLevel = $this->getRoleHierarchyLevel($managerRole->name);
        $targetLevel = $this->getRoleHierarchyLevel($targetRole->name);
        
        return $managerLevel < $targetLevel;
    }

    /**
     * Get role hierarchy level
     */
    private function getRoleHierarchyLevel(string $roleName): int
    {
        foreach (self::ENTERPRISE_ROLES as $roleConfig) {
            if ($roleConfig['name'] === $roleName) {
                return $roleConfig['hierarchy_level'];
            }
        }
        
        return 999; // Unknown role gets lowest priority
    }

    /**
     * Audit role permissions for compliance
     */
    public function auditRolePermissions(): array
    {
        $audit = [
            'timestamp' => now(),
            'roles_reviewed' => 0,
            'permission_conflicts' => [],
            'orphaned_permissions' => [],
            'recommendations' => []
        ];

        $roles = Role::with('permissions')->get();
        
        foreach ($roles as $role) {
            $audit['roles_reviewed']++;
            
            // Check for permission conflicts
            $this->checkPermissionConflicts($role, $audit);
            
            // Check for unnecessary permissions
            $this->checkUnnecessaryPermissions($role, $audit);
        }

        // Check for orphaned permissions
        $audit['orphaned_permissions'] = Permission::whereDoesntHave('roles')->pluck('name')->toArray();

        Log::info('Role permission audit completed', $audit);
        
        return $audit;
    }

    /**
     * Check for permission conflicts within a role
     */
    private function checkPermissionConflicts(Role $role, array &$audit): void
    {
        $permissions = $role->permissions->pluck('name');
        
        // Example: Check if role has both read and delete but not write
        foreach ($this->getEnterpriseModules() as $moduleKey => $moduleConfig) {
            $modulePermissions = $permissions->filter(function ($permission) use ($moduleKey) {
                return str_ends_with($permission, " {$moduleKey}");
            });

            if ($modulePermissions->contains("delete {$moduleKey}") && 
                !$modulePermissions->contains("write {$moduleKey}")) {
                $audit['permission_conflicts'][] = [
                    'role' => $role->name,
                    'module' => $moduleKey,
                    'issue' => 'Has delete permission without write permission'
                ];
            }
        }
    }

    /**
     * Check for unnecessary permissions
     */
    private function checkUnnecessaryPermissions(Role $role, array &$audit): void
    {
        // Add logic to detect unnecessary permissions based on role hierarchy
        // For example, if a role has individual permissions that could be covered by admin access
    }

    /**
     * Get role-based navigation permissions for pages.jsx
     */
    public function getNavigationPermissions(): array
    {
        $navigation = [];
        
        foreach (self::ENTERPRISE_MODULES as $moduleKey => $moduleConfig) {
            $category = $moduleConfig['category'];
            
            if (!isset($navigation[$category])) {
                $navigation[$category] = [
                    'name' => ucwords(str_replace('_', ' ', $category)),
                    'modules' => []
                ];
            }
            
            $navigation[$category]['modules'][$moduleKey] = [
                'name' => $moduleConfig['name'],
                'required_permission' => "read {$moduleKey}",
                'admin_permission' => "admin {$moduleKey}"
            ];
        }

        return $navigation;
    }
}
