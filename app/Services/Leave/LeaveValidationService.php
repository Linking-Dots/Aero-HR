<?php

namespace App\Services\Leave;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeaveValidationService
{
    /**
     * Get validation rules for leave creation/update
     */
    public function getLeaveValidationRules(): array
    {
        return [
            'id' => 'nullable|exists:leaves,id',
            'user_id' => 'required|exists:users,id',
            'leaveType' => 'required|exists:leave_settings,type',
            'fromDate' => 'required|date|before_or_equal:toDate',
            'toDate' => 'required|date|after_or_equal:fromDate',
            'daysCount' => 'required|integer|min:1',
            'leaveReason' => 'required|string|max:500',
            'status' => 'nullable|in:New,Pending,Approved,Declined',
        ];
    }

    /**
     * Get validation rules for delete operation
     */
    public function getDeleteValidationRules(): array
    {
        return [
            'id' => 'required|exists:leaves,id',
            'route' => 'required',
        ];
    }

    /**
     * Validate leave creation/update request
     */
    public function validateLeaveRequest(Request $request): \Illuminate\Contracts\Validation\Validator
    {
        return Validator::make($request->all(), $this->getLeaveValidationRules());
    }

    /**
     * Validate delete request
     */
    public function validateDeleteRequest(Request $request): array
    {
        return $request->validate($this->getDeleteValidationRules());
    }
}
