<?php

namespace App\Http\Controllers;

use App\Models\Designation;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class DesignationController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = Designation::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }

    public function updateUserDesignation(Request $request, $id)
    {
        try {
            $request->validate([
                'designation' => 'required|integer',
            ]);

            $user = User::findOrFail($id);

            // Update the user's designation
            $user->designation = $request->input('designation');
            $user->save();

            return response()->json(['messages' => ['Designation updated successfully']], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            \Log::error('Validation error updating designation for user ID: ' . $id, [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case where the user was not found
            \Log::error('User not found when updating designation for user ID: ' . $id);
            return response()->json(['errors' => ['User not found']], 404);
        } catch (\Exception $e) {
            // Handle any other errors
            \Log::error('An error occurred while updating designation for user ID: ' . $id, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['errors' => ['An unexpected error occurred. Please try again later.']], 500);
        }
    }

}
