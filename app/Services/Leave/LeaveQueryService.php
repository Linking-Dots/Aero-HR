<?php

namespace App\Services\Leave;

use App\Models\Leave;
use App\Models\LeaveSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveQueryService
{
    /**
     * Get leave records with pagination and filtering
     */
    public function getLeaveRecords(Request $request, int $perPage = 30, int $page = 1, string $employee = '', ?int $year = null, ?string $month = null): array
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

        $this->applyDateFilters($leavesQuery, $year, $month, $isAdmin, $user->id);
        $this->applyEmployeeFilter($leavesQuery, $employee);

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
    }

    /**
     * Apply date filters to the query
     */
    private function applyDateFilters($query, ?int $year, ?string $month, bool $isAdmin, int $userId): void
    {
        if ($year) {
            $query->where('leaves.user_id', $userId)->whereYear('leaves.from_date', $year);
        } elseif ($isAdmin && $month) {
            $range = [
                Carbon::createFromFormat('Y-m', $month)->startOfMonth(),
                Carbon::createFromFormat('Y-m', $month)->endOfMonth(),
            ];
            $query->whereBetween('leaves.from_date', $range);
        } elseif (!$isAdmin) {
            $query->where('leaves.user_id', $userId);
        }
    }

    /**
     * Apply employee filter to the query
     */
    private function applyEmployeeFilter($query, string $employee): void
    {
        if ($employee) {
            $query->whereHas('employee', fn($q) => $q->where('name', 'like', "%$employee%"));
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
    }
}
