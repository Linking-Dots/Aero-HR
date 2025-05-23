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
        return Inertia::render('LeavesAdmin', [
            'title' => 'Leaves',
            'allUsers' => User::all()
        ]);
    }


    
    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            
           

            // Get leave records and leaves data using the getLeaveRecords function
            $leaveData = $this->getLeaveRecords($request);

            if ($leaveData['leaveRecords']->isEmpty()) {
                return response()->json([
                    'message' => 'No leave records found for the selected period.',
                    'leavesData' => $leaveData['leavesData'],
                ], 404);
            }

            return response()->json([
                'leaves' => $leaveData['leaveRecords'],
                'current_page' => $leaveData['leaveRecords']->currentPage(),
                'last_page' => $leaveData['leaveRecords']->lastPage(),
                'total' => $leaveData['leaveRecords']->total(),
                'leavesData' => $leaveData['leavesData'],
            ]);

        } catch (Throwable $exception) {
            report($exception);
            return response()->json([
                'error' => 'An error occurred while retrieving leave data.',
                'details' => $exception->getMessage()
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
                    return $leave->from_date->equalTo($leave->to_date)
                        ? 'Leave already exists for the following date: ' . $leave->from_date->format('Y-m-d')
                        : 'Leave already exists for the following dates: ' . $leave->from_date->format('Y-m-d') . ' to ' . $leave->to_date->format('Y-m-d');
                })->join(', ');

                return response()->json(['error' => $dates], 422);
            }

            // Create the leave record
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

            // Get leave records and leaves data after creation
            $leaveData = $this->getLeaveRecords($request, $request->get('perPage', 30), $request->get('page', 1), $request->get('employee', ''));

            return response()->json([
                'message' => 'Leave application submitted successfully',
                'leavesData' => $leaveData['leavesData'],
                'leaves' => $leaveData['leaveRecords'],
            ]);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json([
                'error' => 'An error occurred while submitting the leave data.',
                'details' => $exception->getMessage()
            ], 500);
        }
    }

    public function getLeaveRecords($request, $perPage = 30, $page = 1, $employee = '', $year = null, $month = null)
    {
        $perPage = $request->get('perPage', 30);
        $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
        $employee = $request->get('employee', '');
        $year = $request->get('year', null);
        $month = $request->get('month', null);
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrator');

        // Determine the year
        if ($year) {
            $currentYear = $year;
        } elseif ($month) {
            $currentYear = Carbon::createFromFormat('Y-m', $month)->year;
        } else {
            $currentYear = now()->year;
        }

        // Paginated leaves query
        $leavesQuery = Leave::with('employee')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->when(!$isAdmin, function ($query) {
                $query->where('leaves.user_id', auth()->id());
            });

                

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

        if ($employee !== '') {
            $leavesQuery->whereHas('employee', function ($query) use ($employee) {
                $query->where('name', 'like', '%' . $employee . '%');
            });
        }

        $leavesQuery->orderBy('leaves.from_date', 'desc');
        $leaveRecords = $leavesQuery->paginate($perPage, ['*'], 'page', $page);

        // Fetch all leave types
        $leaveTypes = LeaveSetting::all();

        // Initialize arrays to store leave counts by user and by leave type
        $leaveCountsByUser = [];
        $allLeaves = Leave::with('leaveSetting')
                ->when($request->has('year'), function ($query) {
                    $query->where('user_id', auth()->id());
                })
                ->whereYear('from_date', $currentYear)
                ->orderBy('from_date', 'desc')
                ->get();

        // Process leaves to aggregate totals by user and leave type
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

        return [
            'leaveTypes' => $leaveTypes,
            'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            'leaveRecords' => $leaveRecords,
            'leavesData' => [
                'leaveTypes' => $leaveTypes,
                'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            ]
        ];
    }


    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Find and update the leave record
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

            // Fetch updated leave records and data using the reusable function
            $leaveData = $this->getLeaveRecords(
                $request,
                $request->get('perPage', 30),
                $request->get('page', 1),
                $request->get('employee', ''),
                $request->get('year', null),
                $request->get('month', null),
            );

            return response()->json([
                'message' => 'Leave application updated successfully',
                'leaves' => $leaveData['leaveRecords'],
                'leavesData' => $leaveData['leavesData'],
            ], 200);

        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while updating the leave.',
                'details' => $e->getMessage(),
            ], 500);
        }
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

            // Find and delete the leave entry
            $leave = Leave::findOrFail($request->query('id'));
            $leave->delete();

            // Reuse the getLeaveRecords method to return updated data
            $leaveData = $this->getLeaveRecords($request);

            return response()->json([
                'message' => 'Leave application deleted successfully',
                'leavesData' => $leaveData['leavesData'],
                'leaves' => $leaveData['leaveRecords'],
            ], 200);
        } catch (\Throwable $e) {
            // Catch any exceptions and return an error response
            report($e);
            return response()->json(['error' => 'An error occurred while deleting the leave.', 'details' => $e->getMessage()], 500);
        }
    }



 

    public function leaveSummary(Request $request)
    {
        $year = $request->input('year', now()->year);
        $users = User::all();
    
        // Exclude 'Weekend' leave types
        $leaveTypes = LeaveSetting::where('type', '!=', 'Weekend')->get();
    
        // Get all leaves for the specified year
        $leaves = Leave::with('leaveSetting')
            ->whereYear('from_date', $year)
            ->whereHas('leaveSetting', function($query) {
                $query->where('type', '!=', 'Weekend');
            })
            ->get();
    
        $months = [
            1 => 'JAN', 2 => 'FEB', 3 => 'MAR', 4 => 'APR', 5 => 'MAY', 6 => 'JUN',
            7 => 'JULY', 8 => 'AUG', 9 => 'SEP', 10 => 'OCT', 11 => 'NOV', 12 => 'DEC'
        ];
    
        // Prepare dynamic leave type columns
        $leaveTypeColumns = $leaveTypes->pluck('type')->toArray();
    
        $result = [];
        $sl_no = 1; // Start SL NO from 1
    
        foreach ($users as $user) {
            $row = [
                'SL NO' => $sl_no++, // Add Serial Number
                'Name' => $user->name,
            ];
    
            $total = 0;
            $leaveTypeTotals = array_fill_keys($leaveTypeColumns, 0);
    
            foreach ($months as $num => $label) {
                $monthLeaves = $leaves->where('user_id', $user->id)
                    ->filter(function ($leave) use ($num) {
                        return \Carbon\Carbon::parse($leave->from_date)->month == $num;
                    });
    
                $days = $monthLeaves->sum('no_of_days');
                $row[$label] = $days > 0 ? $days : ''; // Show empty string if 0
                $total += $days;
            }
    
            // Leave type breakdown
            $userLeaves = $leaves->where('user_id', $user->id);
            foreach ($userLeaves as $leave) {
                $type = $leave->leaveSetting->type ?? '';
                if (isset($leaveTypeTotals[$type])) {
                    $leaveTypeTotals[$type] += $leave->no_of_days;
                }
            }
    
            $row['Total'] = $total;
            foreach ($leaveTypeColumns as $type) {
                $row[$type] = $leaveTypeTotals[$type];
            }
    
            $row['Remarks'] = ''; // Optional: You can add automatic remarks based on rules here
    
            $result[] = $row;
        }
    
        // Build final columns for frontend
        $columns = array_merge(
            ['SL NO', 'Name'],
            array_values($months),
            ['Total'],
            $leaveTypeColumns,
            ['Remarks']
        );
    
        return Inertia::render('LeaveSummary', [
            'title' => 'Leave Summary',
            'allUsers' => $users,
            'columns' => $columns,
            'data' => $result,
            'year' => $year, // Pass the selected year for initial filter
        ]);
    }
    


}
