<?php

namespace App\Services\Attendance\Validators;

use App\Services\Attendance\Contracts\AttendanceValidatorInterface;
use Illuminate\Support\Facades\Log;

class RouteWaypointValidator implements AttendanceValidatorInterface
{
    protected array $config;
    protected string $message = '';

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function validate(array $context): bool
    {
        // Get the authenticated user
        $user = auth()->user();
        
        if (!$user) {
            $this->message = 'User not authenticated.';
            return false;
        }

        // Access user's attendance_config field
        $userAttendanceConfig = $user->attendance_config ?? [];
        
        Log::info('RouteWaypointValidator - User attendance config:', [
            'user_id' => $user->id,
            'attendance_config' => $userAttendanceConfig,
            'passed_config' => $this->config
        ]);

        // Check for location coordinates
        if (!isset($context['lat'], $context['lng'])) {
            $this->message = 'Location coordinates are required for route validation.';
            return false;
        }

        $userLat = (float) $context['lat'];
        $userLng = (float) $context['lng'];

        // Get waypoints from user's attendance_config
        $waypoints = $userAttendanceConfig['waypoints'] ?? [];
        $tolerance = $userAttendanceConfig['tolerance'] ?? 100; // Default 100 meters

        Log::info('RouteWaypointValidator - Extracted data:', [
            'user_id' => $user->id,
            'waypoints_count' => count($waypoints),
            'tolerance' => $tolerance,
            'user_location' => ['lat' => $userLat, 'lng' => $userLng]
        ]);

        // Check if waypoints are configured
        if (empty($waypoints)) {
            $this->message = 'Route waypoints not configured for your account. Please contact your administrator.';
            return false;
        }

        // Validate waypoints structure
        if (!$this->validateWaypoints($waypoints)) {
            $this->message = 'Invalid waypoint configuration. Please contact your administrator.';
            return false;
        }

        // Check if user is near any waypoint
        $nearestWaypoint = $this->findNearestWaypoint($userLat, $userLng, $waypoints, $tolerance);
        
        if ($nearestWaypoint) {
            $this->message = "Attendance validated at waypoint: {$nearestWaypoint['name']}";
            return true;
        }

        $this->message = "You are not within {$tolerance}m of any designated waypoint.";
        return false;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    private function validateWaypoints(array $waypoints): bool
    {
        if (count($waypoints) < 1) {
            return false;
        }

        foreach ($waypoints as $waypoint) {
            if (!isset($waypoint['lat'], $waypoint['lng'])) {
                return false;
            }
            
            if (!is_numeric($waypoint['lat']) || !is_numeric($waypoint['lng'])) {
                return false;
            }
        }

        return true;
    }

    private function findNearestWaypoint(float $userLat, float $userLng, array $waypoints, float $tolerance): ?array
    {
        foreach ($waypoints as $waypoint) {
            $distance = $this->calculateDistance(
                $userLat, $userLng,
                (float) $waypoint['lat'], (float) $waypoint['lng']
            );

            Log::info('Checking waypoint distance:', [
                'waypoint' => $waypoint,
                'distance' => $distance,
                'tolerance' => $tolerance,
                'within_range' => $distance <= $tolerance
            ]);

            if ($distance <= $tolerance) {
                return $waypoint;
            }
        }

        return null;
    }

    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000; // meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng/2) * sin($dLng/2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return $earthRadius * $c;
    }
}