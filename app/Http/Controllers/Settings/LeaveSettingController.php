<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\LeaveSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LeaveSettingController extends Controller
{
    public function index(): \Inertia\Response
    {
        $leaveSettings = LeaveSetting::all();
        return Inertia::render('LeaveSettings', [
            'title' => 'Leave Settings',
            'leaveTypes' => $leaveSettings,
        ]);
    }

    public function store(Request $request)
    {
        Log::info($request);
        $request->validate([
            'type' => 'required|string|max:255',
            'days' => 'required|integer',
            'eligibility' => 'nullable|string',
            'carry_forward' => 'required|boolean',
            'earned_leave' => 'required|boolean',
            'specialConditions' => 'nullable|string',
        ]);

        try {
            $leaveType = LeaveSetting::create([
                'type' => $request->input('type'),
                'days' => $request->input('days'),
                'eligibility' => $request->input('eligibility'),
                'carry_forward' => $request->input('carry_forward'),
                'earned_leave' => $request->input('earned_leave'),
                'specialConditions' => $request->input('specialConditions'),
            ]);

            return response()->json([
                'id' => $leaveType->id,
                'message' => 'Leave type added successfully.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add leave type. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|string|max:255',
            'days' => 'required|integer',
            'eligibility' => 'nullable|string',
            'carry_forward' => 'required|boolean',
            'earned_leave' => 'required|boolean',
            'specialConditions' => 'nullable|string',
        ]);

        try {
            $leaveType = LeaveSetting::findOrFail($id);
            $leaveType->update([
                'type' => $request->input('type'),
                'days' => $request->input('days'),
                'eligibility' => $request->input('eligibility'),
                'carry_forward' => $request->input('carry_forward'),
                'earned_leave' => $request->input('earned_leave'),
                'specialConditions' => $request->input('specialConditions'),
            ]);

            return response()->json([
                'id' => $leaveType->id,
                'message' => 'Leave type updated successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update leave type. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // Find the leave type by ID
            $leaveType = LeaveSetting::findOrFail($id);

            // Delete the leave type
            $leaveType->delete();

            return response()->json(['message' => 'Leave type deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete leave type.'], 500);
        }
    }


}
