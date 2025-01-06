<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\LeaveSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LeaveController extends Controller
{
    public function index1(): \Inertia\Response
    {
        $user = Auth::user();
        // Fetch all leaves and their leave types
        $allLeaves = DB::table('leaves')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->where('leaves.user_id', auth()->id())
            ->orderBy('leaves.from_date', 'desc')
            ->get();

        // Fetch all leave types
        $leaveTypes = LeaveSetting::all();

        // Initialize arrays to store leave counts by user and by leave type
        $leaveCountsByUser = [];

        // Process leaves to aggregate totals by user and leave type
        foreach ($allLeaves as $leave) {
            $userId = $leave->user_id;
            $type = $leave->leave_type;
            $days = $leave->no_of_days;

            // Initialize arrays if they don't exist
            if (!isset($leaveCountsByUser[$userId])) {
                $leaveCountsByUser[$userId] = [];
            }
            if (!isset($leaveCountsByUser[$userId][$type])) {
                $leaveCountsByUser[$userId][$type] = 0;
            }

            // Add the number of days to the total for this user and leave type
            $leaveCountsByUser[$userId][$type] += $days;
        }

        // Prepare leave counts with remaining days
        $leaveCountsWithRemainingByUser = [];

        foreach ($leaveCountsByUser as $userId => $userLeaveCounts) {
            $leaveCountsWithRemaining = [];
            foreach ($leaveTypes as $leaveType) {
                $type = $leaveType->type;
                $totalDaysAvailable = $leaveType->days;
                $daysUsed = $userLeaveCounts[$type] ?? 0;
                $remainingDays = $totalDaysAvailable - $daysUsed;

                $leaveCountsWithRemaining[] = [
                    'leave_type' => $type,
                    'total_days' => $totalDaysAvailable,
                    'days_used' => $daysUsed,
                    'remaining_days' => $remainingDays,
                ];
            }
            $leaveCountsWithRemainingByUser[$userId] = $leaveCountsWithRemaining;
        }

        // Prepare data for the view
        $leavesData = [
            'leaveTypes' => $leaveTypes,
            'allLeaves' => $allLeaves,
            'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
        ];


        return Inertia::render('LeavesEmployee', [
            'title' => 'Leaves',
            'leavesData' => $leavesData,
            'allUsers' => User::all(),
        ]);
    }

    public function index2(): \Inertia\Response
    {
        $user = Auth::user();
        $currentYear = now()->year;

        // Fetch all leaves for the current year and their leave types
        $allLeaves = DB::table('leaves')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->when(!$user->hasRole('Administrator'), function ($query) {
                // Restrict to the current user if not an admin
                return $query->where('leaves.user_id', auth()->id());
            })
            ->whereYear('leaves.from_date', $currentYear) // Filter by current year
            ->orderBy('leaves.from_date', 'desc')
            ->get();

        // Fetch all leave types
        $leaveTypes = LeaveSetting::all();

        // Initialize arrays to store leave counts by user and by leave type
        $leaveCountsByUser = [];

        // Process leaves to aggregate totals by user and leave type for the current year
        foreach ($allLeaves as $leave) {
            $userId = $leave->user_id;
            $type = $leave->leave_type;
            $days = $leave->no_of_days;

            // Initialize arrays if they don't exist
            if (!isset($leaveCountsByUser[$userId])) {
                $leaveCountsByUser[$userId] = [];
            }
            if (!isset($leaveCountsByUser[$userId][$type])) {
                $leaveCountsByUser[$userId][$type] = 0;
            }

            // Add the number of days to the total for this user and leave type
            $leaveCountsByUser[$userId][$type] += $days;
        }

        // Prepare leave counts with remaining days for the current year
        $leaveCountsWithRemainingByUser = [];

        foreach ($leaveCountsByUser as $userId => $userLeaveCounts) {
            $leaveCountsWithRemaining = [];
            foreach ($leaveTypes as $leaveType) {
                $type = $leaveType->type;
                $totalDaysAvailable = $leaveType->days;
                $daysUsed = $userLeaveCounts[$type] ?? 0;
                $remainingDays = $totalDaysAvailable - $daysUsed;

                $leaveCountsWithRemaining[] = [
                    'leave_type' => $type,
                    'total_days' => $totalDaysAvailable,
                    'days_used' => $daysUsed,
                    'remaining_days' => $remainingDays,
                ];
            }
            $leaveCountsWithRemainingByUser[$userId] = $leaveCountsWithRemaining;
        }

        // Prepare data for the view
        $leavesData = [
            'leaveTypes' => $leaveTypes,
            'allLeaves' => $allLeaves,
            'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
        ];

        return Inertia::render('LeavesAdmin', [
            'title' => 'Leaves',
            'leavesData' => $leavesData,
            'allUsers' => User::all()
        ]);
    }


    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        // Get the date from the query parameter, defaulting to today's date if none is provided
        $selectedMonth = Carbon::createFromFormat('Y-m', $request->query('month'))->startOfMonth();
        $endOfMonth = $selectedMonth->copy()->endOfMonth();
        $perPage = $request->get('perPage', 30); // Default to 30 items per page
        $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
        $employee = $request->get('employee', '');


        try {
            $user = Auth::user();

            // Build the query using Eloquent
            $leavesQuery = Leave::with('employee') // Ensure 'user' relationship is loaded
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                ->select('leaves.*', 'leave_settings.type as leave_type')
                ->when(!$user->hasRole('Administrator'), function ($query) {
                    // Restrict to the current user if not an admin
                    return $query->where('leaves.user_id', auth()->id());
                })
                ->whereBetween('leaves.from_date', [$selectedMonth, $endOfMonth])
                ->orderBy('leaves.from_date', 'desc');

            if ($employee !== '') {
                // Use relationship to filter by employee name
                $leavesQuery->whereHas('user', function ($query) use ($employee) {
                    $query->where('name', 'like', '%' . $employee . '%');
                });
            }

            // Paginate the query
            $leaveRecords = $leavesQuery->paginate($perPage, ['*'], 'page', $page);

            if ($leaveRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No leave records found for the selected date.',
                ], 404);
            }


            // Return paginated data for leaves
            return response()->json([
                'leaves' => $leaveRecords,
                'current_page' => $leaveRecords->currentPage(),
                'last_page' => $leaveRecords->lastPage(),
                'total' => $leaveRecords->total(),
            ]);

        } catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception); // Report the exception for debugging or logging
            return response()->json([
                'error' => 'An error occurred while retrieving attendance data.',
                'details' => $exception->getMessage() // Return the error message for debugging
            ], 500);
        }
    }


    public function create(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'id' => 'nullable|exists:leaves,id',
            'user_id' => 'nullable|exists:users,id',
            'leaveType' => 'required|exists:leave_settings,type',
            'fromDate' => 'required|date',
            'toDate' => 'required|date|after_or_equal:fromDate',
            'leaveReason' => 'required|string|max:255',
            'status' => 'nullable|in:New,Pending,Approved,Declined' // Include status validation
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();

            $data = [
                'user_id' => $request->input('user_id'),
                'leave_type' => LeaveSetting::where('type', $request->input('leaveType'))->first()->id,
                'from_date' => $request->input('fromDate'),
                'to_date' => $request->input('toDate'),
                'no_of_days' => $request->input('daysCount'),
                'reason' => $request->input('leaveReason'),
                'status' => $request->input('status', 'New'), // Default to 'New' if not provided
            ];

            // Update existing leave record
            $leave = Leave::find($request->input('id'));


            if ($request->has('id')) {

                $selectedMonth = Carbon::createFromFormat('Y-m', $request->input('month'))->startOfMonth();
                $endOfMonth = $selectedMonth->copy()->endOfMonth();
                $perPage = $request->get('perPage', 30); // Default to 30 items per page
                $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
                $employee = $request->get('employee', '');



                $leave->update($data);

                // Build the query using Eloquent
                $leavesQuery = Leave::with('employee') // Ensure 'user' relationship is loaded
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                    ->select('leaves.*', 'leave_settings.type as leave_type')
                    ->when(!$user->hasRole('Administrator'), function ($query) {
                        // Restrict to the current user if not an admin
                        return $query->where('leaves.user_id', auth()->id());
                    })
                    ->whereBetween('leaves.from_date', [$selectedMonth, $endOfMonth])
                    ->orderBy('leaves.from_date', 'desc');

                if ($employee !== '') {
                    // Use relationship to filter by employee name
                    $leavesQuery->whereHas('user', function ($query) use ($employee) {
                        $query->where('name', 'like', '%' . $employee . '%');
                    });
                }

                $message = 'Leave application updated successfully';
            } elseif ($request->has('status') && $request->has('id') && $leave->status !== $request->input('status')) {
                $selectedMonth = Carbon::createFromFormat('Y-m', $request->input('month'))->startOfMonth();
                $endOfMonth = $selectedMonth->copy()->endOfMonth();
                $perPage = $request->get('perPage', 30); // Default to 30 items per page
                $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
                $employee = $request->get('employee', '');


                $leave->update($data);

                // Build the query using Eloquent
                $leavesQuery = Leave::with('employee') // Ensure 'user' relationship is loaded
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                    ->select('leaves.*', 'leave_settings.type as leave_type')
                    ->when(!$user->hasRole('Administrator'), function ($query) {
                        // Restrict to the current user if not an admin
                        return $query->where('leaves.user_id', auth()->id());
                    })
                    ->whereBetween('leaves.from_date', [$selectedMonth, $endOfMonth])
                    ->orderBy('leaves.from_date', 'desc');

                if ($employee !== '') {
                    // Use relationship to filter by employee name
                    $leavesQuery->whereHas('user', function ($query) use ($employee) {
                        $query->where('name', 'like', '%' . $employee . '%');
                    });
                }
                $leave->approved_by = Auth::user()->id;
                $leave->save();
                $message = 'Leave application status updated to ' . $request->input('status');
            } else {
                $selectedMonth = Carbon::createFromFormat('Y-m-d', $request->input('fromDate'))->startOfMonth();
                $endOfMonth = $selectedMonth->copy()->endOfMonth();
                $perPage = 30; // Default to 30 items per page
                $page = 1;
                $fromDate = Carbon::parse($request->input('fromDate'));
                $toDate = Carbon::parse($request->input('toDate'));

                // Check for overlapping leaves
                $overlappingLeaves = Leave::where('user_id', $user->id)
                    ->where(function ($query) use ($fromDate, $toDate) {
                        $query->whereBetween('from_date', [$fromDate, $toDate])
                            ->orWhereBetween('to_date', [$fromDate, $toDate])
                            ->orWhere(function ($query) use ($fromDate, $toDate) {
                                $query->where('from_date', '<=', $fromDate)
                                    ->where('to_date', '>=', $toDate);
                            });
                    })
                    ->get();

                if ($overlappingLeaves->isNotEmpty()) {
                    $dates = $overlappingLeaves->map(function ($leave) {
                        if ($leave->from_date->equalTo($leave->to_date)) {
                            return 'Leave already exists for the following date: ' . $leave->from_date->format('Y-m-d');
                        } else {
                            return 'Leave already exists for the following dates: ' . $leave->from_date->format('Y-m-d') . ' to ' . $leave->to_date->format('Y-m-d');
                        }
                    })->join(', ');

                    return response()->json([
                        'error' => $dates,
                    ], 422);
                }
                // Create new leave record
                Leave::create($data);

                // Build the query using Eloquent
                $leavesQuery = Leave::with('employee') // Ensure 'user' relationship is loaded
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                    ->select('leaves.*', 'leave_settings.type as leave_type')
                    ->when(!$user->hasRole('Administrator'), function ($query) {
                        // Restrict to the current user if not an admin
                        return $query->where('leaves.user_id', auth()->id());
                    })
                    ->whereBetween('leaves.from_date', [$selectedMonth, $endOfMonth])
                    ->orderBy('leaves.from_date', 'desc');

                $message = 'Leave application submitted successfully';
            }


            // Paginate the query
            $leaveRecords = $leavesQuery->paginate($perPage, ['*'], 'page', $page);

            if ($leaveRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No leave records found for the selected date.',
                ], 404);
            }


            // Fetch all leave types
            $leaveTypes = LeaveSetting::all();

            // Initialize arrays to store leave counts by user and by leave type
            $leaveCountsByUser = [];

            $allLeaves = $leavesQuery->get();

            // Process leaves to aggregate totals by user and leave type
            foreach ($allLeaves as $leave) {
                $userId = $leave->user_id;
                $type = $leave->leave_type;
                $days = $leave->no_of_days;

                // Initialize arrays if they don't exist
                if (!isset($leaveCountsByUser[$userId])) {
                    $leaveCountsByUser[$userId] = [];
                }
                if (!isset($leaveCountsByUser[$userId][$type])) {
                    $leaveCountsByUser[$userId][$type] = 0;
                }

                // Add the number of days to the total for this user and leave type
                $leaveCountsByUser[$userId][$type] += $days;
            }

            // Prepare leave counts with remaining days
            $leaveCountsWithRemainingByUser = [];

            foreach ($leaveCountsByUser as $userId => $userLeaveCounts) {
                $leaveCountsWithRemaining = [];
                foreach ($leaveTypes as $leaveType) {
                    $type = $leaveType->type;
                    $totalDaysAvailable = $leaveType->days;
                    $daysUsed = $userLeaveCounts[$type] ?? 0;
                    $remainingDays = $totalDaysAvailable - $daysUsed;

                    $leaveCountsWithRemaining[] = [
                        'leave_type' => $type,
                        'total_days' => $totalDaysAvailable,
                        'days_used' => $daysUsed,
                        'remaining_days' => $remainingDays,
                    ];
                }
                $leaveCountsWithRemainingByUser[$userId] = $leaveCountsWithRemaining;
            }

            // Prepare data for the view
            $leavesData = [
                'leaveTypes' => $leaveTypes,
                'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            ];

            return response()->json([
                'message' => $message,
                'leaves' => $leaveRecords,
                'leavesData' => $leavesData,
                'current_page' => $leaveRecords->currentPage(),
                'last_page' => $leaveRecords->lastPage(),
                'total' => $leaveRecords->total(),
            ]);
        } catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception); // Report the exception for debugging or logging
            return response()->json([
                'error' => 'An error occurred while retrieving leaves data.',
                'details' => $exception->getMessage() // Return the error message for debugging
            ], 500);
        }
    }

    public function delete(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate the incoming request
            $request->validate([
                'id' => 'required|exists:leaves,id',
                'route' => 'required',
            ]);

            // Find the daily work by ID
            $leave = Leave::find($request->query('id'));


            if (!$leave) {
                return response()->json(['error' => 'Leave application not found'], 404);
            }

            // Delete the daily work
            $leave->delete();

            $user = Auth::user();
            // Fetch all leaves and their leave types
            if (($user->hasRole('Administrator')) && ($request->input('route') === 'leaves')) {
                $allLeaves = DB::table('leaves')
                    ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                    ->select('leaves.*', 'leave_settings.type as leave_type')
                    ->orderBy('leaves.from_date', 'desc')
                    ->get();
            } else {
                $allLeaves = DB::table('leaves')
                    ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                    ->select('leaves.*', 'leave_settings.type as leave_type')
                    ->where('leaves.user_id', auth()->id())
                    ->orderBy('leaves.from_date', 'desc')
                    ->get();
            }

            // Fetch all leave types
            $leaveTypes = LeaveSetting::all();

            // Initialize arrays to store leave counts by user and by leave type
            $leaveCountsByUser = [];

            // Process leaves to aggregate totals by user and leave type
            foreach ($allLeaves as $leave) {
                $userId = $leave->user_id;
                $type = $leave->leave_type;
                $days = $leave->no_of_days;

                // Initialize arrays if they don't exist
                if (!isset($leaveCountsByUser[$userId])) {
                    $leaveCountsByUser[$userId] = [];
                }
                if (!isset($leaveCountsByUser[$userId][$type])) {
                    $leaveCountsByUser[$userId][$type] = 0;
                }

                // Add the number of days to the total for this user and leave type
                $leaveCountsByUser[$userId][$type] += $days;
            }

            // Prepare leave counts with remaining days
            $leaveCountsWithRemainingByUser = [];

            foreach ($leaveCountsByUser as $userId => $userLeaveCounts) {
                $leaveCountsWithRemaining = [];
                foreach ($leaveTypes as $leaveType) {
                    $type = $leaveType->type;
                    $totalDaysAvailable = $leaveType->days;
                    $daysUsed = $userLeaveCounts[$type] ?? 0;
                    $remainingDays = $totalDaysAvailable - $daysUsed;

                    $leaveCountsWithRemaining[] = [
                        'leave_type' => $type,
                        'total_days' => $totalDaysAvailable,
                        'days_used' => $daysUsed,
                        'remaining_days' => $remainingDays,
                    ];
                }
                $leaveCountsWithRemainingByUser[$userId] = $leaveCountsWithRemaining;
            }

            // Prepare data for the view
            $leavesData = [
                'leaveTypes' => $leaveTypes,
                'allLeaves' => $allLeaves,
                'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
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
