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
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['errors' => ['User not found']], 404);
        } catch (\Exception $e) {
            return response()->json(['errors' => ['An unexpected error occurred. Please try again later.']], 500);
        }
    }

}
