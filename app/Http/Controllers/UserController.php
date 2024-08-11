<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(): \Inertia\Response
    {
        $users = User::all();
        return Inertia::render('Employees/EmployeeList', [
            'title' => 'Employees',
            'allUsers' => $users,
            'designations' => Designation::all(),
            'departments' => Department::all(),
        ]);
    }

    public function assignAdminRole($userId)
    {
        $user = User::findOrFail($userId); // Retrieve the team by ID

        // Assign the 'admin' role to the team
        $user->assignRole('admin');

        return response()->json(['message' => 'Admin role assigned successfully'], 200);
    }
}
