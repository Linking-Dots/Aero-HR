<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LeaveResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // Process from_date and to_date to handle the 18:00 timestamp issue
        try {
            $fromDate = $this->from_date;
            if (is_string($fromDate)) {
                if (strpos($fromDate, 'T18:00:00') !== false) {
                    $fromDate = date('Y-m-d', strtotime($fromDate . ' +1 day'));
                } else {
                    // Just ensure it's in Y-m-d format
                    $fromDate = date('Y-m-d', strtotime($fromDate));
                }
            } else if ($fromDate instanceof \Carbon\Carbon) {
                $fromDateString = $fromDate->toDateTimeString();
                if (strpos($fromDateString, '18:00:00') !== false) {
                    $fromDate = $fromDate->copy()->addDay()->format('Y-m-d');
                } else {
                    $fromDate = $fromDate->format('Y-m-d');
                }
            } else {
                // Default fallback if the from_date is null or invalid
                $fromDate = date('Y-m-d');
            }
            
            $toDate = $this->to_date;
            if (is_string($toDate)) {
                if (strpos($toDate, 'T18:00:00') !== false) {
                    $toDate = date('Y-m-d', strtotime($toDate . ' +1 day'));
                } else {
                    // Just ensure it's in Y-m-d format
                    $toDate = date('Y-m-d', strtotime($toDate));
                }
            } else if ($toDate instanceof \Carbon\Carbon) {
                $toDateString = $toDate->toDateTimeString();
                if (strpos($toDateString, '18:00:00') !== false) {
                    $toDate = $toDate->copy()->addDay()->format('Y-m-d');
                } else {
                    $toDate = $toDate->format('Y-m-d');
                }
            } else {
                // Default fallback if the to_date is null or invalid
                $toDate = date('Y-m-d');
            }
        } catch (\Exception $e) {
            // In case of any error in date processing, just use today's date
            $fromDate = date('Y-m-d');
            $toDate = date('Y-m-d');
        }
        
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'leave_type' => $this->leave_type,
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'no_of_days' => $this->no_of_days,
            'reason' => $this->reason,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Only include essential employee data
            'employee' => $this->when($this->employee, [
                'id' => $this->employee->id,
                'name' => $this->employee->name,
                'profile_image' => $this->employee->profile_image,
                'department' => $this->employee->department,
                'designation' => $this->employee->designation,
            ]),
        ];
    }
}
