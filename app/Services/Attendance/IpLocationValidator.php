<?php

namespace App\Services\Attendance;

/**
 * IP address-based validation service
 */
class IpLocationValidator extends BaseAttendanceValidator
{
    public function validate(): array
    {
        $allowedIps = $this->attendanceType->config['allowed_ips'] ?? [];
        $ip = $this->request->ip();
        
        if (empty($allowedIps)) {
            return $this->errorResponse('No IP addresses configured for this attendance type.');
        }
        
        if (!in_array($ip, $allowedIps)) {
            return $this->errorResponse(
                "Your network IP ({$ip}) is not authorized for attendance.", 
                403
            );
        }
        
        return $this->successResponse("Network IP ({$ip}) authorized for attendance.");
    }
}
