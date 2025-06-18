<?php

namespace App\Services\Attendance;

use Illuminate\Http\Request;

/**
 * Factory for creating attendance validators
 */
class AttendanceValidatorFactory
{
    /**
     * Create appropriate validator based on attendance type
     */
    public static function create($attendanceType, Request $request): BaseAttendanceValidator
    {
        switch ($attendanceType->slug) {
            case 'geo_polygon':
                return new PolygonLocationValidator($attendanceType, $request);
            
            case 'wifi_ip':
                return new IpLocationValidator($attendanceType, $request);
            
            case 'route-waypoint':
            case 'route_waypoint':
                return new RouteWaypointValidator($attendanceType, $request);
            
            case 'qr_code':
                return new QrCodeValidator($attendanceType, $request);
            
            default:
                throw new \InvalidArgumentException("Unsupported attendance type: {$attendanceType->slug}");
        }
    }
}
