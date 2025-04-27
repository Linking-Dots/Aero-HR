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
        return Inertia::render('LeavesEmployee', [
            'title' => 'Leaves',
            'allUsers' => User::all(),
        ]);
    }

    public function index2(): \Inertia\Response
    {
<<<<<<< HEAD
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
            'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
        ];
=======
        
>>>>>>> 12dbb76250fd5e370218201bc62f8d4e7a245042

        return Inertia::render('LeavesAdmin', [
            'title' => 'Leaves',
        
            'allUsers' => User::all()
        ]);
    }


    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        $perPage = $request->get('perPage', 30);
        $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
        $employee = $request->get('employee', '');
        $year = $request->get('year', null);
        $month = $request->get('month', null);

        try {
            $user = Auth::user();
            $isAdmin = $user->hasRole('Administrator');

<<<<<<< HEAD
            // Determine the year
            if ($year) {
                $currentYear = $year;
            } elseif ($month) {
                $currentYear = Carbon::createFromFormat('Y-m', $month)->year;
            } else {
                $currentYear = now()->year;
            }

            // Paginated leaves query
=======
            // Base query
>>>>>>> 12dbb76250fd5e370218201bc62f8d4e7a245042
            $leavesQuery = Leave::with('employee')
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                ->select('leaves.*', 'leave_settings.type as leave_type')
                ->when(!$isAdmin, function ($query) {
                    $query->where('leaves.user_id', auth()->id());
                });

                 

<<<<<<< HEAD
            if ($year) {
                $leavesQuery->where('leaves.user_id', auth()->id())
                            ->whereYear('leaves.from_date', $year);
            } elseif ($isAdmin && $month) {
                $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
                $endOfMonth = $startOfMonth->copy()->endOfMonth();
                $leavesQuery->whereBetween('leaves.from_date', [$startOfMonth, $endOfMonth]);
            } elseif (!$isAdmin) {
                $leavesQuery->where('leaves.user_id', auth()->id());
            }

=======
            $baseQuery = clone $leavesQuery; // Save original for allLeaves later

            if (!$year && $month) {
                $year = Carbon::createFromFormat('Y-m', $month)->year;
            }

            // Apply filters
            if ($year) {
                $leavesQuery->whereYear('leaves.from_date', $year);
                if (!$isAdmin) {
                    $leavesQuery->where('leaves.user_id', auth()->id());
                }
                $allLeaves = (clone $leavesQuery)->get();
            } 
            
            if ($isAdmin && $month) {
                $startOfMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
                $endOfMonth = Carbon::createFromFormat('Y-m', $month)->endOfMonth();
            
                $leavesQuery->whereBetween('leaves.from_date', [$startOfMonth, $endOfMonth]);
            
                if (!$isAdmin) {
                    $leavesQuery->where('leaves.user_id', auth()->id());
                }
            
            }

            // Filter by employee name (if provided)
>>>>>>> 12dbb76250fd5e370218201bc62f8d4e7a245042
            if ($employee !== '') {
                $leavesQuery->whereHas('employee', function ($query) use ($employee) {
                    $query->where('name', 'like', '%' . $employee . '%');
                });
            }

<<<<<<< HEAD
=======
            // Order and paginate
>>>>>>> 12dbb76250fd5e370218201bc62f8d4e7a245042
            $leavesQuery->orderBy('leaves.from_date', 'desc');
            $leaveRecords = $leavesQuery->paginate($perPage, ['*'], 'page', $page);

            // Fetch all leaves for calculating leavesData
            $allLeaves = Leave::with('leaveSetting')
                ->when($request->has('year'), function ($query) {
                    $query->where('user_id', auth()->id());
                })
                ->whereYear('from_date', $currentYear)
                ->orderBy('from_date', 'desc')
                ->get();

            $leaveTypes = LeaveSetting::all();

            // Calculate leave counts
            $leaveCountsByUser = [];

            foreach ($allLeaves as $leave) {
                $userId = $leave->user_id;
                $type = $leave->leaveSetting->type ?? 'Unknown'; // safer
                $days = $leave->no_of_days;

                if (!isset($leaveCountsByUser[$userId])) {
                    $leaveCountsByUser[$userId] = [];
                }
                if (!isset($leaveCountsByUser[$userId][$type])) {
                    $leaveCountsByUser[$userId][$type] = 0;
                }

                $leaveCountsByUser[$userId][$type] += $days;
            }

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

            $leavesData = [
                'leaveTypes' => $leaveTypes,
                'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            ];

            if ($leaveRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No leave records found for the selected period.',
                    'leavesData' => $leavesData,
                ], 404);
            }

<<<<<<< HEAD
=======
            // Fetch leave types
            $leaveTypes = LeaveSetting::all();

            // Aggregate leave counts
            $leaveCountsByUser = [];
            foreach ($allLeaves as $leave) {
                $userId = $leave->user_id;
                $type = $leave->leave_type;
                $days = $leave->no_of_days;

                if (!isset($leaveCountsByUser[$userId])) {
                    $leaveCountsByUser[$userId] = [];
                }
                if (!isset($leaveCountsByUser[$userId][$type])) {
                    $leaveCountsByUser[$userId][$type] = 0;
                }
                $leaveCountsByUser[$userId][$type] += $days;
            }

            // Prepare detailed leave info
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

>>>>>>> 12dbb76250fd5e370218201bc62f8d4e7a245042
            return response()->json([
                'leaves' => $leaveRecords,
                'leavesData' => [
                    'leaveTypes' => $leaveTypes,
                    'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
                ],
                'current_page' => $leaveRecords->currentPage(),
                'last_page' => $leaveRecords->lastPage(),
                'total' => $leaveRecords->total(),
                'leavesData' => $leavesData,
            ]);

        } catch (Throwable $exception) {
            report($exception);
            return response()->json([
                'error' => 'An error occurred while retrieving leave data.',
                'details' => $exception->getMessage()
            ], 500);
        }
    }


<<<<<<< HEAD

=======
>>>>>>> 12dbb76250fd5e370218201bc62f8d4e7a245042
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
            $fromDate = Carbon::parse($request->input('fromDate'));
            $toDate = Carbon::parse($request->input('toDate'));

            // Check for overlapping leaves
            $overlappingLeaves = Leave::where('user_id', $request->input('user_id'))
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

                return response()->json(['error' => $dates], 422);
            }

            $data = [
                'user_id' => $request->input('user_id'),
                'leave_type' => LeaveSetting::where('type', $request->input('leaveType'))->first()->id,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'no_of_days' => $request->input('daysCount'),
                'reason' => $request->input('leaveReason'),
                'status' => 'New',
            ];

            Leave::create($data);


            $leaveData = $this->getLeaveRecords($request);

            return response()->json([
                'message' => 'Leave application submitted successfully',
                'leavesData' => $leaveData,
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

    public function update(Request $request)
    {
        $leave = Leave::findOrFail($request->input('id'));

        $data = [
            'user_id' => $request->input('user_id'),
            'leave_type' => LeaveSetting::where('type', $request->input('leaveType'))->first()->id,
            'from_date' => $request->input('fromDate'),
            'to_date' => $request->input('toDate'),
            'no_of_days' => $request->input('daysCount'),
            'reason' => $request->input('leaveReason'),
            'status' => $request->input('status', $leave->status),
        ];

        $leave->update($data);

        return response()->json([
            'message' => 'Leave application updated successfully',
        ]);
    }

    public function updateStatus(Request $request)
    {
        $user = Auth::user();
        $leave = Leave::findOrFail($request->input('id'));

        if ($leave->status !== $request->input('status')) {
            $leave->update(['status' => $request->input('status'), 'approved_by' => $user->id]);

            return response()->json([
                'message' => 'Leave application status updated to ' . $request->input('status'),
            ]);
        }

        return response()->json([
            'message' => 'Leave status remains unchanged.',
        ]);
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


    public function getLeaveRecords($request) {
        $user = Auth::user();
        $selectedMonth = Carbon::createFromFormat('Y-m', $request->input('month', now()->format('Y-m')))->startOfMonth();
        $endOfMonth = $selectedMonth->copy()->endOfMonth();
        $perPage = $request->get('perPage', 30); // Default to 30 items per page
        $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
        $employee = $request->get('employee', '');


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
        return [
            'leaveTypes' => $leaveTypes,
            'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            'leaveRecords' => $leaveRecords,
        ];
    }


}
