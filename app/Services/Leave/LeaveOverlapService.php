<?php

namespace App\Services\Leave;

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
        $query = Leave::where('user_id', $userId)
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
                ? 'Leave already exists for: ' . $leave->from_date->format('Y-m-d')
                : 'Leave already exists from ' . $leave->from_date->format('Y-m-d') . ' to ' . $leave->to_date->format('Y-m-d');
        })->toArray();
    }

    /**
     * Check if there are any overlapping leaves and return error message
     */
    public function getOverlapErrorMessage(int $userId, Carbon $fromDate, Carbon $toDate, ?int $excludeLeaveId = null): ?string
    {
        $overlaps = $this->checkOverlappingLeaves($userId, $fromDate, $toDate, $excludeLeaveId);
        
        return empty($overlaps) ? null : implode(', ', $overlaps);
    }
}
