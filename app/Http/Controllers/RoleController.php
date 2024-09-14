<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{

    // Get all roles and permissions
    public function getRolesAndPermissions()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return response()->json([
            'roles' => $roles,
            'permissions' => $permissions
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

}
