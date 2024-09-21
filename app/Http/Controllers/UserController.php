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
        $users = User::with('roles:name') // Load only the name from roles
        ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_image' => $user->profile_image,
                    'created_at' => $user->created_at,
                    'roles' => $user->roles->pluck('name')->toArray(),  // Pluck role names directly
                ];
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


}
