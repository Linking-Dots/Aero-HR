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
        $users = User::withTrashed()
            ->with('roles:name')
            ->get()
            ->map(fn($user) => array_merge($user->toArray(), [
                'roles' => $user->roles->pluck('name')->toArray()
            ]));

        return Inertia::render('UsersList', [
            'title' => 'Users',
            'allUsers' => $users,
            'roles' => Role::all(),
            'designations' => Designation::all(),
            'departments' => Department::all(),
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
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['errors' => ['User not found']], 404);
        } catch (\Exception $e) {
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
    public function updateFcmToken(Request $request)
    {
        // Validate that the request contains an FCM token
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        // Get the authenticated user
        $user = $request->user();

        // Update the user's FCM token
        $user->fcm_token = $request->input('fcm_token');
        $user->save();

        return response()->json([
            'message' => 'FCM token updated successfully',
            'fcm_token' => $user->fcm_token,
        ]);
    }

}
