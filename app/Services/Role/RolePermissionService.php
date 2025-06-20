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
{    /**
     * Standard enterprise module definitions aligned with comprehensive permission system
     */
    private const ENTERPRISE_MODULES = [
        // Core System
        'core' => [
            'name' => 'Dashboard & Analytics',
            'permissions' => ['dashboard.view', 'stats.view', 'updates.view'],
            'description' => 'Core system dashboard and analytics',
            'category' => 'core_system'
        ],

        // Self Service Module  
        'self-service' => [
            'name' => 'Self Service Portal',
            'permissions' => [
                'attendance.own.view', 'attendance.own.punch',
                'leave.own.view', 'leave.own.create', 'leave.own.update', 'leave.own.delete',
                'communications.own.view', 'profile.own.view', 'profile.own.update', 'profile.password.change'
            ],
            'description' => 'Employee self-service capabilities',
            'category' => 'self_service'
        ],

        // Human Resource Management
        'hrm' => [
            'name' => 'Human Resource Management',
            'permissions' => [
                'employees.view', 'employees.create', 'employees.update', 'employees.delete', 'employees.import', 'employees.export',
                'departments.view', 'departments.create', 'departments.update', 'departments.delete',
                'designations.view', 'designations.create', 'designations.update', 'designations.delete',
                'attendance.view', 'attendance.create', 'attendance.update', 'attendance.delete', 'attendance.import', 'attendance.export',
                'holidays.view', 'holidays.create', 'holidays.update', 'holidays.delete',
                'leaves.view', 'leaves.create', 'leaves.update', 'leaves.delete', 'leaves.approve', 'leaves.analytics',
                'leave-settings.view', 'leave-settings.update',
                'jurisdiction.view', 'jurisdiction.create', 'jurisdiction.update', 'jurisdiction.delete'
            ],
            'description' => 'Human resources and employee management',
            'category' => 'human_resources'
        ],

        // Project & Portfolio Management
        'ppm' => [
            'name' => 'Project & Portfolio Management',
            'permissions' => [
                'daily-works.view', 'daily-works.create', 'daily-works.update', 'daily-works.delete', 'daily-works.import', 'daily-works.export',
                'projects.analytics',
                'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete', 'tasks.assign',
                'reports.view', 'reports.create', 'reports.update', 'reports.delete'
            ],
            'description' => 'Project management and portfolio tracking',
            'category' => 'project_management'
        ],

        // Document & Knowledge Management
        'dms' => [
            'name' => 'Document & Knowledge Management',
            'permissions' => [
                'letters.view', 'letters.create', 'letters.update', 'letters.delete',
                'documents.view', 'documents.create', 'documents.update', 'documents.delete'
            ],
            'description' => 'Document management and knowledge base',
            'category' => 'document_management'
        ],

        // Customer Relationship Management (Future)
        'crm' => [
            'name' => 'Customer Relationship Management',
            'permissions' => [
                'customers.view', 'customers.create', 'customers.update', 'customers.delete',
                'leads.view', 'leads.create', 'leads.update', 'leads.delete',
                'feedback.view', 'feedback.create', 'feedback.update', 'feedback.delete'
            ],
            'description' => 'Customer relationship and lead management',
            'category' => 'customer_relations'
        ],

        // Supply Chain & Inventory Management (Future)
        'scm' => [
            'name' => 'Supply Chain & Inventory Management',
            'permissions' => [
                'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
                'suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
                'purchase-orders.view', 'purchase-orders.create', 'purchase-orders.update', 'purchase-orders.delete',
                'warehousing.view', 'warehousing.manage'
            ],
            'description' => 'Supply chain and inventory operations',
            'category' => 'supply_chain'
        ],

        // Retail & Sales Operations (Future)
        'retail' => [
            'name' => 'Retail & Sales Operations',
            'permissions' => [
                'pos.view', 'pos.operate',
                'sales.view', 'sales.create', 'sales.analytics'
            ],
            'description' => 'Point of sale and retail operations',
            'category' => 'retail_sales'
        ],

        // Financial Management & Accounting (Future)
        'finance' => [
            'name' => 'Financial Management & Accounting',
            'permissions' => [
                'accounts-payable.view', 'accounts-payable.manage',
                'accounts-receivable.view', 'accounts-receivable.manage',
                'ledger.view', 'ledger.manage',
                'financial-reports.view', 'financial-reports.create'
            ],
            'description' => 'Financial management and accounting',
            'category' => 'financial_management'
        ],

        // System Administration
        'admin' => [
            'name' => 'System Administration',
            'permissions' => [
                'users.view', 'users.create', 'users.update', 'users.delete', 'users.impersonate',
                'roles.view', 'roles.create', 'roles.update', 'roles.delete', 'permissions.assign',
                'settings.view', 'settings.update',
                'company.settings', 'attendance.settings', 'email.settings', 'notification.settings',
                'theme.settings', 'localization.settings', 'performance.settings', 'approval.settings',
                'invoice.settings', 'salary.settings', 'system.settings',
                'audit.view', 'audit.export', 'backup.create', 'backup.restore'
            ],
            'description' => 'System administration and configuration',
            'category' => 'system_administration'
        ]
    ];    /**
     * Get all permissions grouped by module for frontend display
     */
    public function getPermissionsGroupedByModule(): array
    {
        $groupedPermissions = [];
        
        foreach (self::ENTERPRISE_MODULES as $moduleKey => $moduleConfig) {
            $groupedPermissions[$moduleKey] = [
                'name' => $moduleConfig['name'],
                'description' => $moduleConfig['description'],
                'category' => $moduleConfig['category'],
                'permissions' => []
            ];
            
            // Get actual permissions from database that match this module
            foreach ($moduleConfig['permissions'] as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission) {
                    $groupedPermissions[$moduleKey]['permissions'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $this->formatPermissionDisplayName($permission->name)
                    ];
                }
            }
        }
        
        return $groupedPermissions;
    }

    /**
     * Format permission name for display
     */
    private function formatPermissionDisplayName(string $permissionName): string
    {
        // Convert "employees.view" to "View Employees"
        $parts = explode('.', $permissionName);
        if (count($parts) >= 2) {
            $resource = ucfirst(str_replace('-', ' ', $parts[0]));
            $action = ucfirst($parts[1]);
            
            // Handle special cases for actions
            $actionMap = [
                'view' => 'View',
                'create' => 'Create',
                'update' => 'Edit',
                'delete' => 'Delete',
                'import' => 'Import',
                'export' => 'Export',
                'approve' => 'Approve',
                'assign' => 'Assign',
                'manage' => 'Manage',
                'operate' => 'Operate',
                'punch' => 'Punch',
                'change' => 'Change',
                'impersonate' => 'Impersonate',
                'analytics' => 'View Analytics'
            ];
            
            $actionText = $actionMap[$parts[1]] ?? ucfirst($parts[1]);
            
            // Handle "own" permissions
            if (count($parts) >= 3 && $parts[1] === 'own') {
                $actionText = $actionMap[$parts[2]] ?? ucfirst($parts[2]);
                return "{$actionText} Own {$resource}";
            }
            
            return "{$actionText} {$resource}";
        }
        
        return ucwords(str_replace(['.', '-', '_'], ' ', $permissionName));
    }    /**
     * Assign permissions to a role
     */
    public function assignPermissionsToRole(Role $role, array $permissions): void
    {
        $validPermissions = [];
        
        foreach ($permissions as $permission) {
            $existingPermission = Permission::where('name', $permission)->first();
            if ($existingPermission) {
                $validPermissions[] = $permission;
            } else {
                Log::warning("Permission not found: {$permission} for role: {$role->name}");
            }
        }

        if (!empty($validPermissions)) {
            $role->syncPermissions(array_unique($validPermissions));
            Cache::forget('spatie.permission.cache');
        }
    }    /**
     * Get enterprise modules structure for frontend
     */
    public function getEnterpriseModules(): array
    {
        return self::ENTERPRISE_MODULES;
    }

    /**
     * Get all permissions for a specific module
     */
    public function getModulePermissions(string $moduleKey): Collection
    {
        if (!isset(self::ENTERPRISE_MODULES[$moduleKey])) {
            return collect();
        }

        $modulePermissions = self::ENTERPRISE_MODULES[$moduleKey]['permissions'];
        
        return Permission::whereIn('name', $modulePermissions)
            ->orderBy('name')
            ->get();
    }

    /**
     * Get all roles with their permissions grouped by module
     */
    public function getRolesWithModulePermissions(): Collection
    {
        return Role::with(['permissions' => function ($query) {
            $query->orderBy('name');
        }])->get()->map(function ($role) {
            $role->module_permissions = $this->groupPermissionsByModule($role->permissions);
            return $role;
        });
    }

    /**
     * Group permissions by module
     */
    private function groupPermissionsByModule(Collection $permissions): array
    {
        $grouped = [];
        
        foreach (self::ENTERPRISE_MODULES as $moduleKey => $moduleConfig) {
            $modulePermissions = $permissions->whereIn('name', $moduleConfig['permissions']);
            
            if ($modulePermissions->isNotEmpty()) {
                $grouped[$moduleKey] = [
                    'name' => $moduleConfig['name'],
                    'permissions' => $modulePermissions->toArray()
                ];
            }
        }
        
        return $grouped;
    }    /**
     * Check if a user can access a specific module
     */
    public function userCanAccessModule(string $moduleKey, $user = null): bool
    {
        if (!$user) {
            $user = auth()->user();
        }
        
        if (!$user || !isset(self::ENTERPRISE_MODULES[$moduleKey])) {
            return false;
        }
        
        $modulePermissions = self::ENTERPRISE_MODULES[$moduleKey]['permissions'];
        
        // Check if user has any permission for this module
        foreach ($modulePermissions as $permission) {
            if ($user->can($permission)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get user's accessible modules
     */
    public function getUserAccessibleModules($user = null): array
    {
        if (!$user) {
            $user = auth()->user();
        }
        
        if (!$user) {
            return [];
        }
        
        $accessibleModules = [];
        
        foreach (self::ENTERPRISE_MODULES as $moduleKey => $moduleConfig) {
            if ($this->userCanAccessModule($moduleKey, $user)) {
                $accessibleModules[$moduleKey] = $moduleConfig;
            }
        }
        
        return $accessibleModules;
    }    /**
     * Validate role permissions for consistency
     */
    public function validateRolePermissions(Role $role): array
    {
        $validation = [
            'role' => $role->name,
            'valid' => true,
            'issues' => [],
            'recommendations' => []
        ];
        
        $permissions = $role->permissions->pluck('name');
        
        // Check if role has permissions that don't exist in our module structure
        foreach ($permissions as $permission) {
            $found = false;
            foreach (self::ENTERPRISE_MODULES as $moduleConfig) {
                if (in_array($permission, $moduleConfig['permissions'])) {
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                $validation['valid'] = false;
                $validation['issues'][] = "Permission '{$permission}' is not defined in any module";
            }
        }
        
        return $validation;
    }

    /**
     * Get permission statistics
     */
    public function getPermissionStatistics(): array
    {
        $stats = [
            'total_permissions' => Permission::count(),
            'total_roles' => Role::count(),
            'modules' => count(self::ENTERPRISE_MODULES),
            'permissions_by_module' => [],
            'roles_with_permissions' => Role::has('permissions')->count(),
            'unused_permissions' => Permission::doesntHave('roles')->count()
        ];
        
        foreach (self::ENTERPRISE_MODULES as $moduleKey => $moduleConfig) {
            $stats['permissions_by_module'][$moduleKey] = [
                'name' => $moduleConfig['name'],
                'permission_count' => count($moduleConfig['permissions']),
                'category' => $moduleConfig['category']
            ];
        }
        
        return $stats;
    }
}
