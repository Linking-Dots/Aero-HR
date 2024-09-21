<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;
class RoleController extends Controller
{

    // Get all roles and permissions
    public function getRolesAndPermissions()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();
        $role_has_permissions = DB::table("role_has_permissions")->get();

        return Inertia::render('RolesSettings', [
            'title' => 'Roles and Permissions',
            'roles' => $roles,
            'permissions' => $permissions,
            'role_has_permissions' => $role_has_permissions
        ]);
    }

    // Store new role
    public function storeRole(Request $request)
    {
        $role = Role::create(['name' => $request->name]);
        if ($request->permissions) {
            $role->givePermissionTo($request->permissions);
        }

        return response()->json(['message' => 'Role created successfully', 'role' => $role]);
    }

    // Update role
    public function updateRole(Request $request, $id)
    {
        $role = Role::findById($id);
        $role->name = $request->name;
        $role->save();

        $role->syncPermissions($request->permissions);

        return response()->json(['message' => 'Role updated successfully', 'role' => $role]);
    }

    // Delete role
    public function deleteRole($id)
    {
        $role = Role::findById($id);
        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }


    public function updateRoleModule(Request $request)
    {
        $request->validate([
            'roleId' => 'required|exists:roles,id',
            'module' => 'required|string',
        ]);

        // Check if any permissions exist for the role
        $existingPermissions = DB::table('role_has_permissions')
            ->where('role_id', $request->roleId)
            ->pluck('permission_id')
            ->toArray();

        // Remove existing permissions for the role if any
        if (!empty($existingPermissions)) {
            DB::table('role_has_permissions')
                ->where('role_id', $request->roleId)
                ->delete();
        } else {
            // Find all permissions based on the provided module
            $permissions = Permission::where('name', 'like', '%' . $request->module . '%')->get();

            // If no permissions are found, create new permissions for the module
            if ($permissions->isEmpty()) {
                $actions = ['read', 'write', 'create', 'delete', 'import', 'export'];
                foreach ($actions as $action) {
                    $permissionName = $request->module . ' ' . $action;
                    $newPermission = Permission::create(['name' => $permissionName]);

                    // Insert the newly created permission for the role
                    DB::table('role_has_permissions')->insert([
                        'role_id' => $request->roleId,
                        'permission_id' => $newPermission->id,
                    ]);
                }
            } else {
                // Insert each found permission for the role
                foreach ($permissions as $permission) {
                    DB::table('role_has_permissions')->insert([
                        'role_id' => $request->roleId,
                        'permission_id' => $permission->id,
                    ]);
                }
            }
        }



        return response()->json([
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all(),
            'role_has_permissions' => DB::table('role_has_permissions')->get(),
        ]);
    }

}
