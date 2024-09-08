<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use App\Models\LeaveType;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LeaveController extends Controller
{
    public function index(): \Inertia\Response
    {
        // Fetch all leaves for the current user
        $allLeaves = DB::table('leaves')
            ->join('leave_types', 'leaves.leave_type', '=', 'leave_types.id')
            ->select('leaves.*', 'leave_types.type as leave_type')
            ->where('leaves.user_id', auth()->id())
            ->get();

        // Fetch all leave types and their total days available
        $leaveTypes = LeaveType::all();

        // Group leaves by leave type and sum up the number of days for each type
        $leaveCounts = []; // Initialize an empty array to store the total days for each leave type
        foreach ($allLeaves as $leave) {
            $type = $leave->leave_type;
            $days = $leave->no_of_days;

            // If the leave type is not in the array, initialize it
            if (!isset($leaveCounts[$type])) {
                $leaveCounts[$type] = 0;
            }

            // Add the number of days to the total for this leave type
            $leaveCounts[$type] += $days;
        }

        $leaveCountsWithRemaining = []; // Initialize an empty array to store the results

        foreach ($leaveTypes as $leaveType) {
            $totalDaysAvailable = $leaveType->days; // Assuming 'days' is the field in leave_types table
            $type = $leaveType->type; // Get the type of leave
            $daysUsed = $leaveCounts[$type] ?? 0; // Get the days used, default to 0 if not set
            $remainingDays = $totalDaysAvailable - $daysUsed;

            // Add the calculated data to the result array
            $leaveCountsWithRemaining[] = [
                'leave_type' => $type,
                'total_days' => $totalDaysAvailable,
                'days_used' => $daysUsed,
                'remaining_days' => $remainingDays,
            ];
        }


        $leavesData = [
            'leaveTypes' => $leaveTypes,
            'allLeaves' => $allLeaves,
            'leaveCounts' => $leaveCountsWithRemaining,
        ];


        return Inertia::render('LeavesEmployee', [
            'title' => 'Leaves',
            'leavesData' => $leavesData,
            'allUsers' => User::all(),
        ]);
    }


    public function create(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'id' => 'nullable|exists:leaves,id',
            'leaveType' => 'required|exists:leave_types,type',
            'fromDate' => 'required|date',
            'toDate' => 'required|date|after_or_equal:fromDate',
            'daysCount' => 'required|integer|min:1',
            'leaveReason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [
                'user_id' => auth()->id(),
                'leave_type' => LeaveType::where('type', $request->input('leaveType'))->first()->id,
                'from_date' => $request->input('fromDate'),
                'to_date' => $request->input('toDate'),
                'no_of_days' => $request->input('daysCount'),
                'reason' => $request->input('leaveReason'),
                'status' => 'New',
            ];

            if ($request->has('id')) {
                // Update existing leave record
                $leave = Leave::find($request->input('id'));

                if (!$leave || $leave->user_id !== auth()->id()) {
                    return response()->json([
                        'error' => 'Unauthorized or leave record not found.'
                    ], 403);
                }

                $leave->update($data);
            } else {
                // Create new leave record
                Leave::create($data);
            }

            // Fetch all leaves for the authenticated user
            $allLeaves = DB::table('leaves')
                ->join('leave_types', 'leaves.leave_type', '=', 'leave_types.id')
                ->select('leaves.*', 'leave_types.type as leave_type')
                ->where('leaves.user_id', auth()->id())
                ->get();

            // Fetch all leave types and their total days available
            $leaveTypes = LeaveType::all();

            // Group leaves by leave type and sum up the number of days for each type
            $leaveCounts = [];
            foreach ($allLeaves as $leave) {
                $type = $leave->leave_type;
                $days = $leave->no_of_days;

                if (!isset($leaveCounts[$type])) {
                    $leaveCounts[$type] = 0;
                }

                $leaveCounts[$type] += $days;
            }

            $leaveCountsWithRemaining = [];
            foreach ($leaveTypes as $leaveType) {
                $totalDaysAvailable = $leaveType->days;
                $type = $leaveType->type;
                $daysUsed = $leaveCounts[$type] ?? 0;
                $remainingDays = $totalDaysAvailable - $daysUsed;

                $leaveCountsWithRemaining[] = [
                    'leave_type' => $type,
                    'total_days' => $totalDaysAvailable,
                    'days_used' => $daysUsed,
                    'remaining_days' => $remainingDays,
                ];
            }

            $leavesData = [
                'leaveTypes' => $leaveTypes,
                'allLeaves' => $allLeaves,
                'leaveCounts' => $leaveCountsWithRemaining,
            ];

            return response()->json([
                'message' => $request->has('id') ? 'Leave application updated successfully' : 'Leave application submitted successfully',
                'leavesData' => $leavesData
            ]);
        } catch (\Exception $e) {
            // Log detailed error information
            \Log::error('Failed to submit leave application', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'error' => 'Failed to submit leave application. Please try again later.'
            ], 500);
        }
    }


    public function delete(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate the incoming request
            $request->validate([
                'id' => 'required|exists:leaves,id',
            ]);

            // Find the daily work by ID
            $leave = Leave::find($request->query('id'));


            if (!$leave) {
                return response()->json(['error' => 'Leave application not found'], 404);
            }

            // Delete the daily work
            $leave->delete();

            $allLeaves = DB::table('leaves')
                ->join('leave_types', 'leaves.leave_type', '=', 'leave_types.id')
                ->select('leaves.*', 'leave_types.type as leave_type')
                ->where('leaves.user_id', auth()->id())
                ->get();

            // Fetch all leave types and their total days available
            $leaveTypes = LeaveType::all();

            // Group leaves by leave type and sum up the number of days for each type
            $leaveCounts = [];
            foreach ($allLeaves as $leave) {
                $type = $leave->leave_type;
                $days = $leave->no_of_days;

                if (!isset($leaveCounts[$type])) {
                    $leaveCounts[$type] = 0;
                }

                $leaveCounts[$type] += $days;
            }

            $leaveCountsWithRemaining = [];
            foreach ($leaveTypes as $leaveType) {
                $totalDaysAvailable = $leaveType->days;
                $type = $leaveType->type;
                $daysUsed = $leaveCounts[$type] ?? 0;
                $remainingDays = $totalDaysAvailable - $daysUsed;

                $leaveCountsWithRemaining[] = [
                    'leave_type' => $type,
                    'total_days' => $totalDaysAvailable,
                    'days_used' => $daysUsed,
                    'remaining_days' => $remainingDays,
                ];
            }

            $leavesData = [
                'leaveTypes' => $leaveTypes,
                'allLeaves' => $allLeaves,
                'leaveCounts' => $leaveCountsWithRemaining,
            ];

            // Return a success response
            return response()->json([
                'message' => 'Leave application deleted successfully',
                'leavesData' => $leavesData
            ], 200);

        } catch (\Exception $e) {
            // Catch any exceptions and return an error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



}
