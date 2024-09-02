<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class DepartmentController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = Department::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }

    public function updateUserDepartment(Request $request, $id)
    {
        try {
            $request->validate([
                'department' => 'required|integer',
            ]);

            $user = User::findOrFail($id);

            // Update the user's department
            $departmentChanged = $user->department !== $request->input('department');
            $user->department = $request->input('department');

            // If department changed, reset designation
            if ($departmentChanged) {
                $user->designation = null;
            }

            $user->save();

            return response()->json(['messages' => ['Department updated successfully']], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            \Log::error('Validation error updating department for user ID: ' . $id, [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case where the user was not found
            \Log::error('User not found when updating department for user ID: ' . $id);
            return response()->json(['errors' => ['User not found']], 404);
        } catch (\Exception $e) {
            // Handle any other errors
            \Log::error('An error occurred while updating department for user ID: ' . $id, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['errors' => ['An unexpected error occurred. Please try again later.']], 500);
        }
    }

}
