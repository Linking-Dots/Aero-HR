The code changes ensure that the create and update methods in LeaveCrudService return the updated Leave object with fresh data.
```

```php
<?php

namespace App\Services\Leave;

use App\Models\Leave;
use App\Models\LeaveSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveCrudService
{
    /**
     * Create a new leave record
     */
    public function createLeave(array $data): Leave
    {
        $fromDate = Carbon::parse($data['fromDate']);
        $toDate = Carbon::parse($data['toDate']);

        $leave = Leave::create([
            'user_id' => $data['user_id'],
            'leave_type' => LeaveSetting::where('type', $data['leaveType'])->value('id'),
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'no_of_days' => $data['daysCount'],
            'reason' => $data['leaveReason'],
            'status' => 'New',
        ]);

        return $leave->fresh(); // Ensure we return the latest data
    }

    /**
     * Update an existing leave record
     */
    public function updateLeave(int $leaveId, array $data): Leave
    {
        $leave = Leave::findOrFail($leaveId);

        $leave->update([
            'user_id' => $data['user_id'],
            'leave_type' => LeaveSetting::where('type', $data['leaveType'])->value('id'),
            'from_date' => $data['fromDate'],
            'to_date' => $data['toDate'],
            'no_of_days' => $data['daysCount'],
            'reason' => $data['leaveReason'],
            'status' => $data['status'] ?? $leave->status,
        ]);

        return $leave->fresh(); // Ensure we return the latest data with relationships
    }

    /**
     * Update leave status
     */
    public function updateLeaveStatus(int $leaveId, string $status, int $approvedBy): array
    {
        $leave = Leave::findOrFail($leaveId);

        if ($leave->status !== $status) {
            $leave->update([
                'status' => $status,
                'approved_by' => $approvedBy,
            ]);

            return [
                'success' => true,
                'updated' => true,
                'message' => 'Leave application status updated to ' . $status,
            ];
        }

        return [
            'success' => false,
            'updated' => false,
            'message' => 'Leave status remains unchanged.',
        ];
    }

    /**
     * Delete a leave record
     */
    public function deleteLeave(int $leaveId): bool
    {
        $leave = Leave::findOrFail($leaveId);
        return $leave->delete();
    }

    /**
     * Find leave by ID
     */
    public function findLeave(int $leaveId): Leave
    {
        return Leave::findOrFail($leaveId);
    }
}
```<?php

namespace App\Services\Leave;

use App\Models\Leave;
use App\Models\LeaveSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeaveCrudService
{
    /**
     * Create a new leave record
     */
    public function createLeave(array $data): Leave
    {
        $fromDate = Carbon::parse($data['fromDate']);
        $toDate = Carbon::parse($data['toDate']);

        $leave = Leave::create([
            'user_id' => $data['user_id'],
            'leave_type' => LeaveSetting::where('type', $data['leaveType'])->value('id'),
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'no_of_days' => $data['daysCount'],
            'reason' => $data['leaveReason'],
            'status' => 'New',
        ]);

        return $leave->fresh(); // Ensure we return the latest data
    }

    /**
     * Update an existing leave record
     */
    public function updateLeave(int $leaveId, array $data): Leave
    {
        $leave = Leave::findOrFail($leaveId);

        $leave->update([
            'user_id' => $data['user_id'],
            'leave_type' => LeaveSetting::where('type', $data['leaveType'])->value('id'),
            'from_date' => $data['fromDate'],
            'to_date' => $data['toDate'],
            'no_of_days' => $data['daysCount'],
            'reason' => $data['leaveReason'],
            'status' => $data['status'] ?? $leave->status,
        ]);

        return $leave->fresh(); // Ensure we return the latest data with relationships
    }

    /**
     * Update leave status
     */
    public function updateLeaveStatus(int $leaveId, string $status, int $approvedBy): array
    {
        $leave = Leave::findOrFail($leaveId);

        if ($leave->status !== $status) {
            $leave->update([
                'status' => $status,
                'approved_by' => $approvedBy,
            ]);

            return [
                'success' => true,
                'updated' => true,
                'message' => 'Leave application status updated to ' . $status,
            ];
        }

        return [
            'success' => false,
            'updated' => false,
            'message' => 'Leave status remains unchanged.',
        ];
    }

    /**
     * Delete a leave record
     */
    public function deleteLeave(int $leaveId): bool
    {
        $leave = Leave::findOrFail($leaveId);
        return $leave->delete();
    }

    /**
     * Find leave by ID
     */
    public function findLeave(int $leaveId): Leave
    {
        return Leave::findOrFail($leaveId);
    }
}