<?php

namespace App\Services\Leave;

use App\Models\HRM\Leave;
use App\Models\HRM\LeaveSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Traits\HasPermissions;

class LeaveQueryService
{    /**
     * Get leave records with pagination and filtering
     */
    public function getLeaveRecords(Request $request, int $perPage = 30, int $page = 1, ?string $employee = '', ?int $year = null, ?string $month = null): array
    {
        $user = Auth::user();
        
        // Determine if this is an admin view based on request parameters or route context
        // If user_id is NOT specified and we're not filtering by a specific employee, treat as admin view
        $specificUserId = $request->get('user_id');
        $isAdminView = $request->get('admin_view', false) || 
                       (!$specificUserId && $request->get('view_all', false)) ||
                       $request->header('X-Admin-View') === 'true';
        
        // If no explicit admin indicators, default to employee view (safer default)
        $isAdmin = $isAdminView && $user;

        $perPage = $request->get('perPage', $perPage);
        $page = $request->get('employee') ? 1 : $request->get('page', $page);
        $employee = $request->get('employee', $employee) ?? '';
        $year = $request->get('year', $year);
        $month = $request->get('month', $month);
        $status = $request->get('status');
        $department = $request->get('department'); // Extract department if provided
        $leaveType = $request->get('leave_type');
        $specificUserId = $request->get('user_id'); // Extract user_id if provided

        $currentYear = $year ?: ($month ? Carbon::createFromFormat('Y-m', $month)->year : now()->year);

        $leavesQuery = Leave::with('employee')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type');

        // If a specific user_id is provided, filter by that user
        if ($specificUserId) {
            $leavesQuery->where('leaves.user_id', $specificUserId);
        }
        // Otherwise apply standard authorization rules
        else if (!$isAdmin) {
            $leavesQuery->where('leaves.user_id', $user->id);
        }

        $this->applyDateFilters($leavesQuery, $year, $month, $isAdmin, $user->id);
        $this->applyEmployeeFilter($leavesQuery, $employee);
        $this->applyStatusFilter($leavesQuery, $status);
        $this->applyLeaveTypeFilter($leavesQuery, $leaveType);
        $this->applyDepartmentFilter($leavesQuery, $department); // Apply department filter if provided

        $leaveRecords = $leavesQuery->orderByDesc('leaves.from_date')
            ->paginate($perPage, ['*'], 'page', $page);

        $leaveTypes = LeaveSetting::all();
        $leaveCountsWithRemainingByUser = $this->calculateLeaveCounts($year, $currentYear, $user);

        // Process the data to fix date issues
        $processedLeaveRecords = $leaveRecords->getCollection()->map(function ($leave) {
            // Check if from_date and to_date have 'T18:00:00' pattern
            if (is_string($leave->from_date) && strpos($leave->from_date, 'T18:00:00') !== false) {
                $leave->from_date = date('Y-m-d', strtotime($leave->from_date . ' +1 day'));
            }

            if (is_string($leave->to_date) && strpos($leave->to_date, 'T18:00:00') !== false) {
                $leave->to_date = date('Y-m-d', strtotime($leave->to_date . ' +1 day'));
            }

            return $leave;
        });

        $leaveRecords->setCollection($processedLeaveRecords);

        // Handle empty datasets appropriately
        $message = null;
        if ($leaveRecords->isEmpty()) {
            if ($specificUserId) {
                $message = 'No leave records found for the selected user.';
            } elseif (!$isAdmin) {
                $message = 'You have no leave records for the selected period.';
            } else {
                $message = 'No leave records found for the selected criteria.';
            }
        }

        return [
            'leaveRecords' => $leaveRecords, // Return paginated result directly
            'leavesData' => [
                'leaveTypes' => $leaveTypes,
                'leaveCountsByUser' => $leaveCountsWithRemainingByUser,
            ],
            'message' => $message, // Include appropriate message for empty data
        ];
    }/**
     * Apply date filters to the query
     */
    private function applyDateFilters($query, ?int $year, ?string $month, bool $isAdmin, int $userId): void
    {
        // If a specific user_id filter is already applied (from the main query), we don't need to reapply it here

        if ($year && !$isAdmin) {
            // For employees, filter by year and their own records
            $query->whereYear('leaves.from_date', $year);
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
    private function applyStatusFilter($query, $status): void
    {
        if (!empty($status)) {
            if (is_array($status)) {
                // Flatten all mapped statuses for all selected keys
                $statusMap = [
                    'pending' => ['New', 'Pending'],
                    'approved' => ['Approved'],
                    'rejected' => ['Declined', 'Rejected'],
                    'new' => ['New'],
                ];

                $mappedStatuses = [];

                foreach ($status as $stat) {
                    if (isset($statusMap[$stat])) {
                        $mappedStatuses = array_merge($mappedStatuses, $statusMap[$stat]);
                    } else {
                        $mappedStatuses[] = ucfirst($stat);
                    }
                }

                $mappedStatuses = array_unique($mappedStatuses);

                $query->whereIn('leaves.status', $mappedStatuses);
            } else {
                // Previous single string logic
                if ($status !== 'all') {
                    $statusMap = [
                        'pending' => ['New', 'Pending'],
                        'approved' => ['Approved'],
                        'rejected' => ['Declined', 'Rejected'],
                        'new' => ['New'],
                    ];

                    if (isset($statusMap[$status])) {
                        $query->whereIn('leaves.status', $statusMap[$status]);
                    } else {
                        $query->where('leaves.status', ucfirst($status));
                    }
                }
            }
        }
    }


    /**
     * Apply leave type filter to the query
     */
    private function applyLeaveTypeFilter($query, $leaveType): void
    {
        // Only apply filter if leaveType has actual values
        if (!empty($leaveType) && $leaveType !== 'all') {
            if (is_array($leaveType)) {
                // If 'all' is in the array, don't apply any filtering (show all leave types)
                // "All" takes precedence over specific selections
                if (in_array('all', $leaveType)) {
                    return; // Don't apply any leave type filtering
                }
                
                // Filter array to remove empty values and 'all'
                $validTypes = array_filter($leaveType, function($type) {
                    return !empty($type) && $type !== 'all';
                });
                
                if (count($validTypes) > 0) {
                    // Use the already joined leave_settings table
                    $query->where(function ($q) use ($validTypes) {
                        foreach ($validTypes as $type) {
                            $q->orWhere('leave_settings.type', 'like', "%$type%");
                        }
                    });
                }
            } elseif (!is_array($leaveType) && $leaveType !== 'all') {
                // Use the already joined leave_settings table
                $query->where('leave_settings.type', 'like', "%$leaveType%");
            }
        }
        // If leaveType is empty, null, or contains 'all', don't apply any filtering (show all leave types)
    }



    private function applyDepartmentFilter($query, $department): void
    {
        if (!empty($department)) {
            if (is_array($department)) {
                $query->whereHas('employee', function ($q) use ($department) {
                    $q->whereIn('department_id', $department);
                });
            } elseif ($department !== 'all') {
                $query->whereHas('employee', function ($q) use ($department) {
                    $q->where('department_id', '=', $department);
                });
            }
        }
    }


    /**
     * Calculate leave counts and remaining days for users
     */
    private function calculateLeaveCounts(?int $year, int $currentYear, $user): array
    {
        $userId = $user->id;

        $allLeaves = Leave::with('leaveSetting')
            ->where('user_id', $userId) // Always filter by the user ID
            ->whereYear('from_date', $currentYear)
            ->get();

        $leaveTypes = LeaveSetting::all();

        // Leave counts aggregation
        $leaveCountsByUser = [];
        foreach ($allLeaves as $leave) {
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
        
        // Determine if this is an admin view based on request parameters
        $isAdminView = $request->get('admin_view', false) || 
                       $request->get('view_all', false) ||
                       $request->header('X-Admin-View') === 'true';
        
        $isAdmin = $isAdminView && $user;

        $month = $request->get('month');
        $year = $request->get('year', now()->year);
        $employee = $request->get('employee');
        $leaveType = $request->get('leave_type');

        // Use join like in the main query for consistency
        $query = Leave::join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type_name');

        // Base filtering
        if (!$isAdmin) {
            $query->where('leaves.user_id', $user->id);
        }

        // Apply filters
        if ($month) {
            $monthStart = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $monthEnd = Carbon::createFromFormat('Y-m', $month)->endOfMonth();
            $query->whereBetween('leaves.from_date', [$monthStart, $monthEnd]);
        } elseif ($year) {
            $query->whereYear('leaves.from_date', $year);
        }

        if ($employee) {
            $query->whereHas('employee', fn($q) => $q->where('name', 'like', "%$employee%"));
        }

        if (!empty($leaveType) && $leaveType !== 'all') {
            // Use the joined table for filtering
            if (is_array($leaveType)) {
                // If 'all' is in the array, don't apply any filtering (show all leave types)
                // "All" takes precedence over specific selections
                if (!in_array('all', $leaveType)) {
                    // Filter array to remove empty values and 'all'
                    $validTypes = array_filter($leaveType, function($type) {
                        return !empty($type) && $type !== 'all';
                    });
                    
                    if (count($validTypes) > 0) {
                        $query->where(function ($q) use ($validTypes) {
                            foreach ($validTypes as $type) {
                                $q->orWhere('leave_settings.type', 'like', "%$type%");
                            }
                        });
                    }
                }
                // If 'all' is in array, don't apply any leave type filtering
            } elseif (!is_array($leaveType) && $leaveType !== 'all') {
                $query->where('leave_settings.type', 'like', "%$leaveType%");
            }
        }

        // Get status counts
        $stats = [
            'pending' => (clone $query)->whereIn('leaves.status', ['New', 'Pending'])->count(),
            'approved' => (clone $query)->where('leaves.status', 'Approved')->count(),
            'rejected' => (clone $query)->whereIn('leaves.status', ['Declined', 'Rejected'])->count(),
            'total' => (clone $query)->count(),
        ];

        return $stats;
    }
}
