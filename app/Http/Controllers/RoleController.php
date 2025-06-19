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

            // Get enterprise modules structure
            $enterpriseModules = $this->rolePermissionService->getEnterpriseModules();
            
            // Get all permissions organized by category
            $permissions = Permission::all()->groupBy(function ($permission) {
                $parts = explode(' ', $permission->name);
                return end($parts); // Get module name
            });

            // Get role-permission relationships
            $roleHasPermissions = DB::table('role_has_permissions')->get();

            // Get navigation permissions for frontend
            $navigationPermissions = $this->rolePermissionService->getNavigationPermissions();

            return Inertia::render('Administration/RoleManagement', [
                'title' => 'Enterprise Role Management',
                'roles' => $roles,
                'permissions' => $permissions,
                'role_has_permissions' => $roleHasPermissions,
                'enterprise_modules' => $enterpriseModules,
                'navigation_permissions' => $navigationPermissions,
                'user_hierarchy_level' => $this->getUserHierarchyLevel($user),
                'assignable_roles' => $this->getAssignableRoles($user)
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
            
            // Get enterprise modules structure
            $enterpriseModules = $this->rolePermissionService->getEnterpriseModules();
            
            // Get roles based on user's access level
            $roles = Role::with(['permissions'])
                ->when(!$user->hasRole('Super Administrator'), function ($query) {
                    // If not Super Admin, exclude Super Administrator role
                    return $query->whereNotIn('name', ['Super Administrator']);
                })
                ->orderBy('name', 'asc')
                ->get();

            // Get all permissions organized by category
            $permissions = Permission::all()->groupBy(function ($permission) {
                $parts = explode(' ', $permission->name);
                return end($parts); // Get module name
            });

            // Get role-permission relationships
            $roleHasPermissions = DB::table('role_has_permissions')->get();

            // Get navigation permissions for frontend
            $navigationPermissions = $this->rolePermissionService->getNavigationPermissions();

            return Inertia::render('Administration/RoleManagement', [
                'title' => 'Enterprise Role Management',
                'roles' => $roles,
                'permissions' => $permissions->flatten()->values(),
                'role_has_permissions' => $roleHasPermissions,
                'enterprise_modules' => $enterpriseModules,
                'navigation_permissions' => $navigationPermissions,
                'user_hierarchy_level' => $this->getUserHierarchyLevel($user),
                'assignable_roles' => $this->getAssignableRoles($user)
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
        
        try {
            // Check if user can create roles at this hierarchy level
            $userLevel = $this->getUserHierarchyLevel(auth()->user());
            $requestedLevel = $request->input('hierarchy_level', 10);
            
            if ($requestedLevel <= $userLevel) {
                return response()->json([
                    'error' => 'Cannot create role at or above your hierarchy level'
                ], 403);
            }

            // Create the role using Spatie's Role::create method
            $roleData = [
                'name' => $request->name,
                'guard_name' => 'web'
            ];

            $role = Role::create($roleData);

            // Add custom attributes using database update
            if ($request->has('description') || $request->has('hierarchy_level')) {
                DB::table('roles')->where('id', $role->id)->update([
                    'description' => $request->description,
                    'hierarchy_level' => $request->hierarchy_level ?? 10,
                    'updated_at' => now()
                ]);
            }

            // Assign permissions if provided using Spatie's givePermissionTo method
            if ($request->permissions && is_array($request->permissions)) {
                $validPermissions = Permission::whereIn('name', $request->permissions)->pluck('name')->toArray();
                if (!empty($validPermissions)) {
                    $role->givePermissionTo($validPermissions);
                }
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
            }

            // Sync permissions using Spatie's syncPermissions method
            if ($request->has('permissions')) {
                $validPermissions = Permission::whereIn('name', $request->permissions ?? [])->pluck('name')->toArray();
                $role->syncPermissions($validPermissions);
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
            }

            $module = $request->module;
            $action = $request->action;

            // Get module permissions using Spatie methods
            $modulePermissions = Permission::where('name', 'like', "% {$module}")
                ->pluck('name')
                ->toArray();

            // If no permissions exist for module, create them
            if (empty($modulePermissions)) {
                $modulePermissions = $this->createModulePermissions($module);
            }

            // Get current role permissions for this module using Spatie relationship
            $currentModulePermissions = $role->permissions()
                ->where('name', 'like', "% {$module}")
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
            }

            // Log module permission change
            Log::info('Role module permissions updated', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'module' => $module,
                'action' => $action,
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
     * Create standard permissions for a module
     */
    private function createModulePermissions(string $module): array
    {
        $standardActions = ['read', 'write', 'create', 'delete', 'import', 'export'];
        $permissions = [];

        foreach ($standardActions as $action) {
            $permissionName = "{$action} {$module}";
            $permission = Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web'
            ]);
            $permissions[] = $permissionName;
        }

        return $permissions;
    }

    /**
     * Check if user can manage a specific role
     */
    private function canManageRole($user, Role $role): bool
    {
        return $this->rolePermissionService->canManageRole(
            $user->roles->first(),
            $role
        );
    }    /**
     * Get user's hierarchy level
     */
    private function getUserHierarchyLevel($user): int
    {
        $hierarchyLevels = [
            'Super Administrator' => 1,
            'Administrator' => 2,
            'HR Manager' => 3,
            'Project Manager' => 3,
            'Finance Manager' => 3,
            'Inventory Manager' => 4,
            'Sales Manager' => 4,
            'Team Lead' => 5,
            'Supervisor' => 6,
            'Employee' => 10
        ];

        $highestLevel = 999;
        foreach ($user->roles as $role) {
            $level = $hierarchyLevels[$role->name] ?? 999;
            if ($level < $highestLevel) {
                $highestLevel = $level;
            }
        }

        return $highestLevel;
    }

    /**
     * Get roles that a user can assign to others
     */
    private function getAssignableRoles($user): array
    {
        if (!$user) {
            return [];
        }

        $userLevel = $this->getUserHierarchyLevel($user);
        $assignableRoles = [];

        $hierarchyLevels = [
            'Super Administrator' => 1,
            'Administrator' => 2,
            'HR Manager' => 3,
            'Project Manager' => 3,
            'Finance Manager' => 3,
            'Inventory Manager' => 4,
            'Sales Manager' => 4,
            'Team Lead' => 5,
            'Supervisor' => 6,
            'Employee' => 10
        ];

        foreach ($hierarchyLevels as $roleName => $level) {
            if ($level > $userLevel) {
                $assignableRoles[] = $roleName;
            }
        }

        return $assignableRoles;
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
