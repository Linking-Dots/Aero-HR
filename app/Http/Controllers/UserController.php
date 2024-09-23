<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index1(): \Inertia\Response
    {
        $users = User::all();
        return Inertia::render('Employees/EmployeeList', [
            'title' => 'Employees',
            'allUsers' => $users,
            'designations' => Designation::all(),
            'departments' => Department::all(),
        ]);
    }

    public function index2(): \Inertia\Response
    {
        $users = User::withTrashed() // Include soft-deleted users
        ->with('roles:name')     // Load only the name from roles
        ->get()
            ->map(function ($user) {
                // Convert the user object to an array and replace roles with plucked names
                $userData = $user->toArray();
                $userData['roles'] = $user->roles->pluck('name')->toArray(); // Replace roles with names

                return $userData;
            });
        return Inertia::render('UsersList', [
            'title' => 'Users',
            'allUsers' => $users,
            'roles' => Role::all(),
        ]);
    }

    public function updateUserRole(Request $request, $id)
    {
        try {
            $request->validate([
                'roles' => 'required|array',
            ]);

            $user = User::findOrFail($id);

            $user->syncRoles($request->roles);


            return response()->json(['messages' => ['Role updated successfully']], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            \Log::error('Validation error updating role for user ID: ' . $id, [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case where the user was not found
            \Log::error('User not found when updating role for user ID: ' . $id);
            return response()->json(['errors' => ['User not found']], 404);
        } catch (\Exception $e) {
            // Handle any other errors
            \Log::error('An error occurred while updating role for user ID: ' . $id, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['errors' => ['An unexpected error occurred. Please try again later.']], 500);
        }
    }


    public function toggleStatus($id, Request $request)
    {
        $user = User::withTrashed()->findOrFail($id);

        // Toggle the active status based on the request
        $user->active = $request->input('active');

        // Handle soft delete or restore based on the new status
        if ($user->active) {
            $user->restore(); // Restore the user if they were soft deleted
        } else {
            $user->delete();  // Soft delete the user if marking inactive
        }

        $user->save();

        return response()->json([
            'message' => 'User status updated successfully',
            'active' => $user->active,
        ]);
    }



}
