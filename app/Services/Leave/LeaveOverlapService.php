<?php

namespace App\Services\Leave;

use App\Models\Holiday;
use App\Models\Leave;
use App\Models\LeaveSetting;
use Carbon\Carbon;

class LeaveOverlapService
{
    /**
     * Check for overlapping leaves for a user
     */
    public function checkOverlappingLeaves(int $userId, Carbon $fromDate, Carbon $toDate, ?int $excludeLeaveId = null): array
    {
        $query = Leave::with('employee')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->where('leaves.user_id', $userId)
            ->where(function ($q) use ($fromDate, $toDate) {
                $q->whereBetween('from_date', [$fromDate, $toDate])
                    ->orWhereBetween('to_date', [$fromDate, $toDate])
                    ->orWhere(function ($q) use ($fromDate, $toDate) {
                        $q->where('from_date', '<=', $fromDate)
                            ->where('to_date', '>=', $toDate);
                    });
            });

        if ($excludeLeaveId) {
            $query->where('id', '!=', $excludeLeaveId);
        }

        $overlapping = $query->get();

        if ($overlapping->isEmpty()) {
            return [];
        }

        return $overlapping->map(function ($leave) {
            return $leave->from_date->equalTo($leave->to_date)
                ? "\"{$leave->leave_type}\" leave already exists for: " . $leave->from_date->format('Y-m-d')
                : "\"{$leave->leave_type}\" leave already exists from " . $leave->from_date->format('Y-m-d') . ' to ' . $leave->to_date->format('Y-m-d');
        })->toArray();
    }

    public function checkOverLappingHoliday(Carbon $fromDate, Carbon $toDate, ?int $excludeHolidayId = null): array
    {
        $query = Holiday::where(function ($q) use ($fromDate, $toDate) {
            $q->whereBetween('from_date', [$fromDate, $toDate])
                ->orWhereBetween('to_date', [$fromDate, $toDate])
                ->orWhere(function ($q) use ($fromDate, $toDate) {
                    $q->where('from_date', '<=', $fromDate)
                        ->where('to_date', '>=', $toDate);
                });
        });

        if ($excludeHolidayId) {
            $query->where('id', '!=', $excludeHolidayId);
        }

        $overlapping = $query->get();

        if ($overlapping->isEmpty()) {
            return [];
        }

        return $overlapping->map(function ($holiday) {
            return $holiday->from_date->equalTo($holiday->to_date)
                ? "\"{$holiday->title}\" holiday on this date: " . $holiday->from_date->format('Y-m-d')
                : "\"{$holiday->title}\" holiday on this dates: " . $holiday->from_date->format('Y-m-d') . ' to ' . $holiday->to_date->format('Y-m-d');
        })->toArray();
    }

    /**
     * Check if there are any overlapping leaves and return error message
     */
    public function getOverlapErrorMessage(int $userId, Carbon $fromDate, Carbon $toDate, ?int $excludeLeaveId = null): ?string
    {
        $overlapsLeave = $this->checkOverlappingLeaves($userId, $fromDate, $toDate, $excludeLeaveId);
        $overlapsHoliday = $this->checkOverLappingHoliday($fromDate, $toDate, $excludeLeaveId);

        $overlaps = array_merge($overlapsLeave, $overlapsHoliday);

        return empty($overlaps) ? null : implode(', ', $overlaps);
    }
}
