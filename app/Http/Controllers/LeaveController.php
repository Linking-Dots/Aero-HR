<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\LeaveSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

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
            'allUsers' => User::all(),
        ]);
    }

    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
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
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while retrieving leave data.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function create(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id' => 'nullable|exists:leaves,id',
            'user_id' => 'nullable|exists:users,id',
            'leaveType' => 'required|exists:leave_settings,type',
            'fromDate' => 'required|date',
            'toDate' => 'required|date|after_or_equal:fromDate',
            'leaveReason' => 'required|string|max:255',
            'status' => 'nullable|in:New,Pending,Approved,Declined',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $fromDate = Carbon::parse($request->input('fromDate'));
            $toDate = Carbon::parse($request->input('toDate'));
            $userId = $request->input('user_id');

            // Overlapping leave check
            $overlapping = Leave::where('user_id', $userId)
                ->where(function ($q) use ($fromDate, $toDate) {
                    $q->whereBetween('from_date', [$fromDate, $toDate])
                      ->orWhereBetween('to_date', [$fromDate, $toDate])
                      ->orWhere(function ($q) use ($fromDate, $toDate) {
                          $q->where('from_date', '<=', $fromDate)
                            ->where('to_date', '>=', $toDate);
                      });
                })
                ->get();

            if ($overlapping->isNotEmpty()) {
                $dates = $overlapping->map(function ($leave) {
                    return $leave->from_date->equalTo($leave->to_date)
                        ? 'Leave already exists for: ' . $leave->from_date->format('Y-m-d')
                        : 'Leave already exists from ' . $leave->from_date->format('Y-m-d') . ' to ' . $leave->to_date->format('Y-m-d');
                })->join(', ');

                return response()->json(['error' => $dates], 422);
            }

            // Save new leave
            Leave::create([
                'user_id' => $userId,
                'leave_type' => LeaveSetting::where('type', $request->input('leaveType'))->value('id'),
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'no_of_days' => $request->input('daysCount'),
                'reason' => $request->input('leaveReason'),
                'status' => 'New',
            ]);

            $leaveData = $this->getLeaveRecords(
                $request,
                $request->get('perPage', 30),
                $request->get('page', 1),
                $request->get('employee', ''),
                null,
                $request->get('month', null)
            );

            return response()->json([
                'message' => 'Leave application submitted successfully',
                'leavesData' => $leaveData['leavesData'],
                'leaves' => $leaveData['leaveRecords'],
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while submitting the leave data.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function getLeaveRecords($request, $perPage = 30, $page = 1, $employee = '', $year = null, $month = null)
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrator');

        $perPage = $request->get('perPage', $perPage);
        $page = $request->get('employee') ? 1 : $request->get('page', $page);
        $employee = $request->get('employee', $employee);
        $year = $request->get('year', $year);
        $month = $request->get('month', $month);

        $currentYear = $year ?: ($month ? Carbon::createFromFormat('Y-m', $month)->year : now()->year);

        $leavesQuery = Leave::with('employee')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->when(!$isAdmin, fn($q) => $q->where('leaves.user_id', $user->id));

        if ($year) {
            $leavesQuery->where('leaves.user_id', $user->id)->whereYear('leaves.from_date', $year);
        } elseif ($isAdmin && $month) {
            $range = [
                Carbon::createFromFormat('Y-m', $month)->startOfMonth(),
                Carbon::createFromFormat('Y-m', $month)->endOfMonth(),
            ];
            $leavesQuery->whereBetween('leaves.from_date', $range);
        } elseif (!$isAdmin) {
            $leavesQuery->where('leaves.user_id', $user->id);
        }

        if ($employee) {
            $leavesQuery->whereHas('employee', fn($q) => $q->where('name', 'like', "%$employee%"));
        }

        $leaveRecords = $leavesQuery->orderByDesc('leaves.from_date')->paginate($perPage, ['*'], 'page', $page);

        $leaveTypes = LeaveSetting::all();

        $allLeaves = Leave::with('leaveSetting')
            ->when($year, fn($q) => $q->where('user_id', $user->id))
            ->whereYear('from_date', $currentYear)
            ->get();

        // Leave counts aggregation
        $leaveCountsByUser = [];

        foreach ($allLeaves as $leave) {
            $userId = $leave->user_id;
            $type = $leave->leaveSetting->type ?? 'Unknown';
            $leaveCountsByUser[$userId][$type] = ($leaveCountsByUser[$userId][$type] ?? 0) + $leave->no_of_days;
        }

        $leaveCountsWithRemainingByUser = [];

        foreach ($leaveCountsByUser as $userId => $counts) {
            $leaveCountsWithRemainingByUser[$userId] = $leaveTypes->map(function ($type) use ($counts) {
                $used = $counts[$type->type] ?? 0;
                return [
                    'leave_type' => $type->type,
                    'total_days' => $type->days,
                    'days_used' => $used,
                    'remaining_days' => $type->days - $used,
                ];
            })->toArray();
        }

        return [
            'leaveTypes' => $leaveTypes,
            'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            'leaveRecords' => $leaveRecords,
            'leavesData' => [
                'leaveTypes' => $leaveTypes,
                'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            ],
        ];
    }

    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $leave = Leave::findOrFail($request->input('id'));

            $leave->update([
                'user_id' => $request->input('user_id'),
                'leave_type' => LeaveSetting::where('type', $request->input('leaveType'))->value('id'),
                'from_date' => $request->input('fromDate'),
                'to_date' => $request->input('toDate'),
                'no_of_days' => $request->input('daysCount'),
                'reason' => $request->input('leaveReason'),
                'status' => $request->input('status', $leave->status),
            ]);

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
            ]);
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
        $leave = Leave::findOrFail($request->input('id'));

        if ($leave->status !== $request->input('status')) {
            $leave->update([
                'status' => $request->input('status'),
                'approved_by' => Auth::id(),
            ]);

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
            $request->validate([
                'id' => 'required|exists:leaves,id',
                'route' => 'required',
            ]);

            Leave::findOrFail($request->query('id'))->delete();

            $leaveData = $this->getLeaveRecords($request);

            return response()->json([
                'message' => 'Leave application deleted successfully',
                'leavesData' => $leaveData['leavesData'],
                'leaves' => $leaveData['leaveRecords'],
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while deleting the leave.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function leaveSummary(Request $request)
    {
        $year = $request->input('year', now()->year);
        $users = User::all();
        $leaveTypes = LeaveSetting::where('type', '!=', 'Weekend')->get();

        $leaves = Leave::with('leaveSetting')
            ->whereYear('from_date', $year)
            ->whereHas('leaveSetting', fn($q) => $q->where('type', '!=', 'Weekend'))
            ->get();

        $months = [1=>'JAN',2=>'FEB',3=>'MAR',4=>'APR',5=>'MAY',6=>'JUN',7=>'JULY',8=>'AUG',9=>'SEP',10=>'OCT',11=>'NOV',12=>'DEC'];
        $leaveTypeColumns = $leaveTypes->pluck('type')->toArray();

        $result = [];
        $sl_no = 1;

        foreach ($users as $user) {
            $row = ['SL NO' => $sl_no++, 'Name' => $user->name];
            $total = 0;
            $leaveTypeTotals = array_fill_keys($leaveTypeColumns, 0);

            foreach ($months as $num => $label) {
                $monthLeaves = $leaves->where('user_id', $user->id)->filter(
                    fn($leave) => Carbon::parse($leave->from_date)->month == $num
                );

                $days = $monthLeaves->sum('no_of_days');
                $row[$label] = $days > 0 ? $days : '';
                $total += $days;
            }

            foreach ($leaves->where('user_id', $user->id) as $leave) {
                $type = $leave->leaveSetting->type ?? '';
                if (isset($leaveTypeTotals[$type])) {
                    $leaveTypeTotals[$type] += $leave->no_of_days;
                }
            }

            $row['Total'] = $total;
            foreach ($leaveTypeColumns as $type) {
                $row[$type] = $leaveTypeTotals[$type];
            }
            $row['Remarks'] = '';

            $result[] = $row;
        }

        return Inertia::render('LeaveSummary', [
            'title' => 'Leave Summary',
            'allUsers' => $users,
            'columns' => array_merge(['SL NO', 'Name'], array_values($months), ['Total'], $leaveTypeColumns, ['Remarks']),
            'data' => $result,
            'year' => $year,
        ]);
    }
}
