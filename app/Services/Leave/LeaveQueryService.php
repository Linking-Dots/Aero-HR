<?php

namespace App\Services\Leave;

use App\Models\Leave;
use App\Models\LeaveSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveQueryService
{    /**
     * Get leave records with pagination and filtering
     */
    public function getLeaveRecords(Request $request, int $perPage = 30, int $page = 1, ?string $employee = '', ?int $year = null, ?string $month = null): array
    {
        $user = Auth::user();
        $isAdmin = $user->can('leaves.view'); // Use permission instead of role

        $perPage = $request->get('perPage', $perPage);
        $page = $request->get('employee') ? 1 : $request->get('page', $page);
        $employee = $request->get('employee', $employee) ?? '';
        $year = $request->get('year', $year);
        $month = $request->get('month', $month);
        $status = $request->get('status');
        $leaveType = $request->get('leave_type');

        $currentYear = $year ?: ($month ? Carbon::createFromFormat('Y-m', $month)->year : now()->year);

        $leavesQuery = Leave::with('employee')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->when(!$isAdmin, fn($q) => $q->where('leaves.user_id', $user->id));

        $this->applyDateFilters($leavesQuery, $year, $month, $isAdmin, $user->id);
        $this->applyEmployeeFilter($leavesQuery, $employee);
        $this->applyStatusFilter($leavesQuery, $status);
        $this->applyLeaveTypeFilter($leavesQuery, $leaveType);

        $leaveRecords = $leavesQuery->orderByDesc('leaves.from_date')
            ->paginate($perPage, ['*'], 'page', $page);

        $leaveTypes = LeaveSetting::all();
        $leaveCountsWithRemainingByUser = $this->calculateLeaveCounts($year, $currentYear, $user);

        return [
            'leaveTypes' => $leaveTypes,
            'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            'leaveRecords' => $leaveRecords,
            'leavesData' => [
                'leaveTypes' => $leaveTypes,
                'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            ],
        ];
    }/**
     * Apply date filters to the query
     */
    private function applyDateFilters($query, ?int $year, ?string $month, bool $isAdmin, int $userId): void
    {
        if ($year && !$isAdmin) {
            // For employees, filter by year and their own records
            $query->where('leaves.user_id', $userId)->whereYear('leaves.from_date', $year);
        } elseif ($isAdmin && $month) {
            // For admins, filter by month across all employees
            $range = [
                Carbon::createFromFormat('Y-m', $month)->startOfMonth(),
                Carbon::createFromFormat('Y-m', $month)->endOfMonth(),
            ];
            $query->whereBetween('leaves.from_date', $range);
        } elseif ($isAdmin && $year) {
            // For admins, filter by year across all employees
            $query->whereYear('leaves.from_date', $year);
        } elseif (!$isAdmin) {
            // For employees, always filter to their own records
            $query->where('leaves.user_id', $userId);
        }
    }    /**
     * Apply employee filter to the query
     */
    private function applyEmployeeFilter($query, ?string $employee): void
    {
        if ($employee) {
            $query->whereHas('employee', fn($q) => $q->where('name', 'like', "%$employee%"));
        }
    }

    /**
     * Apply status filter to the query
     */
    private function applyStatusFilter($query, ?string $status): void
    {
        if ($status && $status !== 'all') {
            // Map frontend status to database status values
            $statusMap = [
                'pending' => ['New', 'Pending'],
                'approved' => ['Approved'],
                'rejected' => ['Declined', 'Rejected'],
                'new' => ['New']
            ];

            if (isset($statusMap[$status])) {
                $query->whereIn('leaves.status', $statusMap[$status]);
            } else {
                $query->where('leaves.status', ucfirst($status));
            }
        }
    }

    /**
     * Apply leave type filter to the query
     */
    private function applyLeaveTypeFilter($query, ?string $leaveType): void
    {
        if ($leaveType && $leaveType !== 'all') {
            $query->whereHas('leaveSetting', function($q) use ($leaveType) {
                $q->where('type', 'like', "%$leaveType%");
            });
        }
    }

    /**
     * Calculate leave counts and remaining days for users
     */
    private function calculateLeaveCounts(?int $year, int $currentYear, $user): array
    {
        $allLeaves = Leave::with('leaveSetting')
            ->when($year, fn($q) => $q->where('user_id', $user->id))
            ->whereYear('from_date', $currentYear)
            ->get();

        $leaveTypes = LeaveSetting::all();

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

        return $leaveCountsWithRemainingByUser;
    }    /**
     * Get leave statistics for admin dashboard
     */
    public function getLeaveStatistics(Request $request): array
    {
        $user = Auth::user();
        $isAdmin = $user->can('leaves.view');
        
        $month = $request->get('month');
        $year = $request->get('year', now()->year);
        $employee = $request->get('employee');
        $leaveType = $request->get('leave_type');
        
        $query = Leave::query();
        
        // Base filtering
        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }
        
        // Apply filters
        if ($month) {
            $monthStart = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $monthEnd = Carbon::createFromFormat('Y-m', $month)->endOfMonth();
            $query->whereBetween('from_date', [$monthStart, $monthEnd]);
        } elseif ($year) {
            $query->whereYear('from_date', $year);
        }
        
        if ($employee) {
            $query->whereHas('employee', fn($q) => $q->where('name', 'like', "%$employee%"));
        }
        
        if ($leaveType && $leaveType !== 'all') {
            $query->whereHas('leaveSetting', function($q) use ($leaveType) {
                $q->where('type', 'like', "%$leaveType%");
            });
        }
        
        // Get status counts
        $stats = [
            'pending' => (clone $query)->whereIn('status', ['New', 'Pending'])->count(),
            'approved' => (clone $query)->where('status', 'Approved')->count(),
            'rejected' => (clone $query)->whereIn('status', ['Declined', 'Rejected'])->count(),
            'total' => (clone $query)->count(),
        ];
        
        return $stats;
    }
}
