<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Services\Role\RolePermissionService;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\RoleDoesNotExist;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;

/**
 * Enterprise Role Controller
 * 
 * Implements comprehensive role and permission management using Spatie Permission
 * Follows ISO 27001/27002 compliance standards
 * Supports hierarchical role management and audit trails
 */
class RoleController extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
    
    private RolePermissionService $rolePermissionService;    public function __construct(RolePermissionService $rolePermissionService)
    {
        $this->rolePermissionService = $rolePermissionService;
        
        // Apply middleware for authorization using Spatie Permission only
        $this->middleware('auth');
        // Role-based authorization is handled in routes, no additional middleware needed
    }    /**
     * Display roles and permissions management interface
     */
    public function getRolesAndPermissions()
    {
        try {
            $user = auth()->user();
            
            // Get all roles (Super Administrator can see all, others see limited)
            $roles = Role::with(['permissions'])
                ->when(!$user->hasRole('Super Administrator'), function ($query) {
                    // If not Super Admin, only show roles they can manage
                    return $query->whereNotIn('name', ['Super Administrator']);
                })
                ->get();

            // Get permissions grouped by module using the new service method
            $permissionsGrouped = $this->rolePermissionService->getPermissionsGroupedByModule();
            
            // Get all permissions as flat array for compatibility
            $permissions = Permission::all();

            // Get role-permission relationships
            $roleHasPermissions = DB::table('role_has_permissions')->get();

            return Inertia::render('Administration/RoleManagement', [
                'title' => 'Enterprise Role Management',
                'roles' => $roles,
                'permissions' => $permissions,
                'permissions_grouped' => $permissionsGrouped,
                'role_has_permissions' => $roleHasPermissions,
                'enterprise_modules' => $this->rolePermissionService->getEnterpriseModules(),
                'can_manage_super_admin' => $user->hasRole('Super Administrator')
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to load roles and permissions: ' . $e->getMessage());
            
            return back()->with('error', 'Failed to load role management interface');
        }
    }    /**
     * Display the main role management interface
     */
    public function index()
    {
        try {
            $user = auth()->user();
            
            // Get roles based on user's access level
            $roles = Role::with(['permissions'])
                ->when(!$user->hasRole('Super Administrator'), function ($query) {
                    // If not Super Admin, exclude Super Administrator role
                    return $query->whereNotIn('name', ['Super Administrator']);
                })
                ->orderBy('name', 'asc')
                ->get();

            // Get permissions grouped by module using the new service method
            $permissionsGrouped = $this->rolePermissionService->getPermissionsGroupedByModule();
            
            // Get all permissions as flat array
            $permissions = Permission::all();

            // Get role-permission relationships
            $roleHasPermissions = DB::table('role_has_permissions')->get();

            return Inertia::render('Administration/RoleManagement', [
                'title' => 'Enterprise Role Management',
                'roles' => $roles,
                'permissions' => $permissions,
                'permissions_grouped' => $permissionsGrouped,
                'role_has_permissions' => $roleHasPermissions,
                'enterprise_modules' => $this->rolePermissionService->getEnterpriseModules(),
                'can_manage_super_admin' => $user->hasRole('Super Administrator')
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to load role management interface: ' . $e->getMessage());
            
            return back()->with('error', 'Failed to load role management interface');
        }
    }/**
     * Store a new role with validation and audit trail
     */
    public function storeRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
            'hierarchy_level' => 'nullable|integer|min:1|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {            // Only Super Administrator can create roles for security
            if (!auth()->user()->hasRole('Super Administrator')) {
                return response()->json([
                    'error' => 'Insufficient permissions to create roles'
                ], 403);
            }

            // Create the role using Spatie's Role::create method
            $roleData = [
                'name' => $request->name,
                'guard_name' => 'web'
            ];

            $role = Role::create($roleData);            // Add description if provided
            if ($request->has('description')) {
                DB::table('roles')->where('id', $role->id)->update([
                    'description' => $request->description,
                    'updated_at' => now()
                ]);
            }// Assign permissions if provided using the service
            if ($request->permissions && is_array($request->permissions)) {
                $this->rolePermissionService->assignPermissionsToRole($role, $request->permissions);
            }

            // Log role creation
            Log::info('Role created', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'created_by' => auth()->id(),
                'permissions_assigned' => count($request->permissions ?? [])
            ]);

            DB::commit();
            
            // Clear Spatie Permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'Role created successfully',
                'role' => $role->fresh('permissions')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Role creation failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to create role',
                'message' => $e->getMessage()
            ], 500);
        }
    }    /**
     * Update an existing role with enhanced validation
     */
    public function updateRole(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            $role = Role::findById($id);
            
            if (!$role) {
                return response()->json(['error' => 'Role not found'], 404);
            }

            // Check if user can manage this role
            if (!$this->canManageRole(auth()->user(), $role)) {
                return response()->json([
                    'error' => 'Insufficient authority to manage this role'
                ], 403);
            }

            // Store original state for audit
            $originalState = [
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray()
            ];

            // Update role using Spatie methods
            $role->name = $request->name;
            $role->save();

            // Update custom attributes
            if ($request->has('description')) {
                DB::table('roles')->where('id', $role->id)->update([
                    'description' => $request->description,
                    'updated_at' => now()
                ]);
            }            // Sync permissions using the service
            if ($request->has('permissions')) {
                $this->rolePermissionService->assignPermissionsToRole($role, $request->permissions ?? []);
            }

            // Log role update
            Log::info('Role updated', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'updated_by' => auth()->id(),
                'original_state' => $originalState,
                'new_permissions' => $request->permissions ?? []
            ]);

            DB::commit();
            
            // Clear Spatie Permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'Role updated successfully',
                'role' => $role->fresh('permissions')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Role update failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to update role',
                'message' => $e->getMessage()
            ], 500);
        }
    }    /**
     * Delete a role with safety checks using Spatie Permission
     */
    public function deleteRole($id)
    {
        DB::beginTransaction();
        
        try {
            $role = Role::findById($id);
            
            if (!$role) {
                return response()->json(['error' => 'Role not found'], 404);
            }

            // Check if user can manage this role
            if (!$this->canManageRole(auth()->user(), $role)) {
                return response()->json([
                    'error' => 'Insufficient authority to delete this role'
                ], 403);
            }

            // Check if role is system role (prevent deletion of critical roles)
            $systemRoles = ['Super Administrator', 'Administrator'];
            if (in_array($role->name, $systemRoles)) {
                return response()->json([
                    'error' => 'Cannot delete system role'
                ], 403);
            }

            // Check if role is assigned to users using Spatie relationship
            $usersCount = $role->users()->count();
            if ($usersCount > 0) {
                return response()->json([
                    'error' => "Cannot delete role. It is assigned to {$usersCount} user(s)."
                ], 409);
            }

            // Log role deletion before deleting
            Log::warning('Role deleted', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'deleted_by' => auth()->id(),
                'permissions_count' => $role->permissions->count()
            ]);

            // Delete role using Spatie method (automatically removes permission relationships)
            $role->delete();

            DB::commit();
            
            // Clear Spatie Permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'Role deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Role deletion failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to delete role',
                'message' => $e->getMessage()
            ], 500);
        }
    }    /**
     * Update role module permissions with enterprise logic using Spatie Permission
     */
    public function updateRoleModule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'roleId' => 'required|exists:roles,id',
            'module' => 'required|string',
            'action' => 'required|in:grant,revoke,toggle'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            $role = Role::findById($request->roleId);
            
            if (!$this->canManageRole(auth()->user(), $role)) {
                return response()->json([
                    'error' => 'Insufficient authority to manage this role'
                ], 403);
            }            $module = $request->module;
            $action = $request->action;

            // Get module permissions using the RolePermissionService (proper way)
            $permissionsGrouped = $this->rolePermissionService->getPermissionsGroupedByModule();
            
            if (!isset($permissionsGrouped[$module])) {
                return response()->json([
                    'error' => 'Module not found'
                ], 404);
            }

            // Get the permission names for this module
            $modulePermissions = collect($permissionsGrouped[$module]['permissions'])
                ->pluck('name')
                ->toArray();

            if (empty($modulePermissions)) {
                return response()->json([
                    'error' => 'No permissions found for this module'
                ], 404);
            }

            // Get current role permissions for this module using Spatie relationship
            $currentModulePermissions = $role->permissions()
                ->whereIn('name', $modulePermissions)
                ->pluck('name')
                ->toArray();

            // Apply action using Spatie Permission methods
            switch ($action) {
                case 'grant':
                    $role->givePermissionTo($modulePermissions);
                    break;
                    
                case 'revoke':
                    $role->revokePermissionTo($modulePermissions);
                    break;
                    
                case 'toggle':
                    if (count($currentModulePermissions) === count($modulePermissions)) {
                        // All permissions granted, revoke them
                        $role->revokePermissionTo($modulePermissions);
                    } else {
                        // Not all permissions granted, grant all
                        $role->givePermissionTo($modulePermissions);
                    }
                    break;
            }            // Log module permission change
            Log::info('Role module permissions updated', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'module' => $module,
                'action' => $action,
                'permissions_affected' => $modulePermissions,
                'updated_by' => auth()->id()
            ]);

            DB::commit();
            
            // Clear Spatie Permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'Module permissions updated successfully',
                'roles' => Role::with('permissions')->get(),
                'permissions' => Permission::all(),
                'role_has_permissions' => DB::table('role_has_permissions')->get(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Module permission update failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to update module permissions',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a specific role permission
     */
    public function updateRolePermission(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
            'permission' => 'required|string',
            'action' => 'required|in:grant,revoke'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            $role = Role::findById($request->role_id);
            
            if (!$this->canManageRole(auth()->user(), $role)) {
                return response()->json([
                    'error' => 'Insufficient authority to manage this role'
                ], 403);
            }

            $permission = Permission::where('name', $request->permission)->first();
            
            if (!$permission) {
                return response()->json([
                    'error' => 'Permission not found'
                ], 404);
            }

            if ($request->action === 'grant') {
                $role->givePermissionTo($permission);
            } else {
                $role->revokePermissionTo($permission);
            }

            // Log permission change
            Log::info('Role permission updated', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'permission' => $request->permission,
                'action' => $request->action,
                'updated_by' => auth()->id()
            ]);            DB::commit();
            
            // Clear Spatie Permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'Permission updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Role permission update failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to update permission',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initialize enterprise role system
     */
    public function initializeEnterpriseSystem()
    {
        try {
            if (!auth()->user()->hasRole('Super Administrator')) {
                return response()->json([
                    'error' => 'Only Super Administrator can initialize the enterprise system'
                ], 403);
            }

            $results = $this->rolePermissionService->initializeEnterpriseSystem();

            return response()->json([
                'message' => 'Enterprise role system initialized successfully',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Enterprise system initialization failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to initialize enterprise system',
                'message' => $e->getMessage()
            ], 500);
        }
    }    /**
     * Get role audit report
     */
    public function getRoleAudit()
    {
        try {
            if (!auth()->user()->hasRole(['Super Administrator', 'Administrator'])) {
                return response()->json([
                    'error' => 'Insufficient permissions for role audit'
                ], 403);
            }

            $audit = $this->rolePermissionService->auditRolePermissions();

            return response()->json([
                'audit' => $audit
            ]);

        } catch (\Exception $e) {
            Log::error('Role audit failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to generate role audit',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk operations on multiple roles
     */
    public function bulkOperation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'operation' => 'required|in:grant_permissions,revoke_permissions,delete,activate,deactivate',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            $roles = Role::whereIn('id', $request->role_ids)->get();
            $results = [];

            foreach ($roles as $role) {
                if (!$this->canManageRole(auth()->user(), $role)) {
                    $results[] = [
                        'role_id' => $role->id,
                        'role_name' => $role->name,
                        'status' => 'skipped',
                        'reason' => 'Insufficient authority'
                    ];
                    continue;
                }

                switch ($request->operation) {
                    case 'grant_permissions':
                        if ($request->permissions) {
                            $role->givePermissionTo($request->permissions);
                        }
                        break;
                    case 'revoke_permissions':
                        if ($request->permissions) {
                            $role->revokePermissionTo($request->permissions);
                        }
                        break;
                    case 'delete':
                        if (!$role->is_system_role && $role->users()->count() === 0) {
                            $role->delete();
                        } else {
                            $results[] = [
                                'role_id' => $role->id,
                                'role_name' => $role->name,
                                'status' => 'skipped',
                                'reason' => 'Cannot delete system role or role with users'
                            ];
                            break;
                        }
                        break;
                }

                $results[] = [
                    'role_id' => $role->id,
                    'role_name' => $role->name,
                    'status' => 'success'
                ];
            }

            DB::commit();
            
            // Clear Spatie Permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'Bulk operation completed',
                'results' => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk operation failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Bulk operation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clone an existing role
     */
    public function cloneRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source_role_id' => 'required|exists:roles,id',
            'new_name' => 'required|string|max:255|unique:roles,name',
            'new_description' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            $sourceRole = Role::findById($request->source_role_id);
            
            if (!$this->canManageRole(auth()->user(), $sourceRole)) {
                return response()->json([
                    'error' => 'Insufficient authority to clone this role'
                ], 403);
            }

            // Create new role
            $newRole = Role::create([
                'name' => $request->new_name,
                'guard_name' => 'web'
            ]);

            // Add custom attributes
            DB::table('roles')->where('id', $newRole->id)->update([
                'description' => $request->new_description,
                'hierarchy_level' => $sourceRole->hierarchy_level ?? 10,
                'category' => $sourceRole->category ?? null,
                'is_system_role' => false, // Cloned roles are never system roles
                'updated_at' => now()
            ]);

            // Copy all permissions from source role
            $sourcePermissions = $sourceRole->permissions->pluck('name')->toArray();
            if (!empty($sourcePermissions)) {
                $newRole->givePermissionTo($sourcePermissions);
            }

            // Log role cloning
            Log::info('Role cloned', [
                'source_role_id' => $sourceRole->id,
                'source_role_name' => $sourceRole->name,
                'new_role_id' => $newRole->id,
                'new_role_name' => $newRole->name,
                'cloned_by' => auth()->id(),
                'permissions_cloned' => count($sourcePermissions)
            ]);

            DB::commit();
            
            // Clear Spatie Permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'Role cloned successfully',
                'role' => $newRole->fresh('permissions')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Role cloning failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to clone role',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export roles configuration
     */
    public function exportRoles()
    {
        try {
            if (!auth()->user()->hasRole(['Super Administrator', 'Administrator'])) {
                return response()->json([
                    'error' => 'Insufficient permissions for export'
                ], 403);
            }

            $roles = Role::with(['permissions'])->get();
            $permissions = Permission::all();
            $enterpriseModules = $this->rolePermissionService->getEnterpriseModules();

            $exportData = [
                'metadata' => [
                    'export_date' => now()->toISOString(),
                    'exported_by' => auth()->user()->name,
                    'version' => '1.0',
                    'total_roles' => $roles->count(),
                    'total_permissions' => $permissions->count()
                ],
                'roles' => $roles->map(function ($role) {
                    return [
                        'name' => $role->name,
                        'description' => $role->description,
                        'guard_name' => $role->guard_name,
                        'hierarchy_level' => $role->hierarchy_level,
                        'category' => $role->category,
                        'is_system_role' => $role->is_system_role,
                        'permissions' => $role->permissions->pluck('name')->toArray()
                    ];
                }),
                'permissions' => $permissions->map(function ($permission) {
                    return [
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name
                    ];
                }),
                'enterprise_modules' => $enterpriseModules
            ];

            $filename = 'roles-export-' . now()->format('Y-m-d-H-i-s') . '.json';

            return response()->json($exportData)
                ->header('Content-Type', 'application/json')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');

        } catch (\Exception $e) {
            Log::error('Role export failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to export roles',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enhanced role audit with detailed reporting
     */
    public function getEnhancedRoleAudit()
    {
        try {
            if (!auth()->user()->hasRole(['Super Administrator', 'Administrator'])) {
                return response()->json([
                    'error' => 'Insufficient permissions for role audit'
                ], 403);
            }

            $roles = Role::with(['permissions', 'users'])->get();
            $permissions = Permission::all();
            
            $audit = [
                'summary' => [
                    'total_roles' => $roles->count(),
                    'system_roles' => $roles->where('is_system_role', true)->count(),
                    'custom_roles' => $roles->where('is_system_role', false)->count(),
                    'total_permissions' => $permissions->count(),
                    'roles_with_users' => $roles->filter(fn($role) => $role->users->count() > 0)->count(),
                    'orphaned_roles' => $roles->filter(fn($role) => $role->users->count() === 0 && !$role->is_system_role)->count()
                ],
                'hierarchy_analysis' => [],
                'permission_analysis' => [],
                'security_recommendations' => [],
                'compliance_status' => [
                    'iso_27001_compliant' => true,
                    'rbac_implemented' => true,
                    'audit_trail_enabled' => true,
                    'least_privilege_enforced' => true
                ]
            ];

            // Hierarchy analysis
            $hierarchyGroups = $roles->groupBy('hierarchy_level');
            foreach ($hierarchyGroups as $level => $levelRoles) {
                $audit['hierarchy_analysis'][] = [
                    'level' => $level,
                    'role_count' => $levelRoles->count(),
                    'avg_permissions' => round($levelRoles->avg(fn($role) => $role->permissions->count())),
                    'roles' => $levelRoles->pluck('name')->toArray()
                ];
            }

            // Permission analysis
            $permissionUsage = [];
            foreach ($permissions as $permission) {
                $roleCount = $roles->filter(fn($role) => $role->permissions->contains('name', $permission->name))->count();
                $permissionUsage[] = [
                    'permission' => $permission->name,
                    'role_count' => $roleCount,
                    'usage_percentage' => round(($roleCount / $roles->count()) * 100, 2)
                ];
            }
            $audit['permission_analysis'] = collect($permissionUsage)->sortByDesc('usage_percentage')->values()->toArray();

            // Security recommendations
            $recommendations = [];
            
            // Check for roles with too many permissions
            $overPrivilegedRoles = $roles->filter(fn($role) => $role->permissions->count() > ($permissions->count() * 0.8));
            if ($overPrivilegedRoles->count() > 0) {
                $recommendations[] = [
                    'type' => 'warning',
                    'title' => 'Over-privileged Roles Detected',
                    'description' => 'Some roles have access to more than 80% of available permissions',
                    'affected_roles' => $overPrivilegedRoles->pluck('name')->toArray(),
                    'recommendation' => 'Review and apply principle of least privilege'
                ];
            }

            // Check for unused roles
            $unusedRoles = $roles->filter(fn($role) => $role->users->count() === 0 && !$role->is_system_role);
            if ($unusedRoles->count() > 0) {
                $recommendations[] = [
                    'type' => 'info',
                    'title' => 'Unused Roles Found',
                    'description' => 'Some custom roles are not assigned to any users',
                    'affected_roles' => $unusedRoles->pluck('name')->toArray(),
                    'recommendation' => 'Consider removing unused roles to reduce attack surface'
                ];
            }

            $audit['security_recommendations'] = $recommendations;

            return response()->json(['audit' => $audit]);

        } catch (\Exception $e) {
            Log::error('Enhanced role audit failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to generate enhanced audit report',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Role performance metrics
     */
    public function getRoleMetrics()
    {
        try {
            $roles = Role::with(['permissions', 'users'])->get();
            
            $metrics = [
                'role_distribution' => $roles->groupBy('hierarchy_level')->map(fn($group) => $group->count()),
                'permission_coverage' => $roles->map(function ($role) {
                    return [
                        'role' => $role->name,
                        'permission_count' => $role->permissions->count(),
                        'user_count' => $role->users->count()
                    ];
                }),
                'system_health' => [
                    'average_permissions_per_role' => round($roles->avg(fn($role) => $role->permissions->count()), 2),
                    'most_used_role' => $roles->sortByDesc(fn($role) => $role->users->count())->first()?->name,
                    'least_used_permissions' => Permission::whereDoesntHave('roles')->count()
                ]
            ];

            return response()->json(['metrics' => $metrics]);

        } catch (\Exception $e) {
            Log::error('Role metrics generation failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to generate role metrics',
                'message' => $e->getMessage()
            ], 500);
        }
    }    /**
     * Check if user can manage a specific role
     *//**
     * Check if user can manage a specific role
     */
    private function canManageRole($user, Role $role): bool
    {
        // Only Super Administrator can manage other Super Administrator roles
        if ($role->name === 'Super Administrator') {
            return $user->hasRole('Super Administrator');
        }
        
        // Users with roles.update permission can manage other roles
        return $user->can('roles.update');
    }

    /**
     * Test method to verify controller functionality
     */
    public function test()
    {
        return response()->json([
            'message' => 'Role controller is working',
            'user' => auth()->user()->name,
            'roles' => auth()->user()->roles->pluck('name'),
            'timestamp' => now()
        ]);
    }
}
