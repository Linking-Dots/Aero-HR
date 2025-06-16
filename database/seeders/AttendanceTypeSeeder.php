<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceType;

class AttendanceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $attendanceTypes = [
            [
                'name' => 'Geo Polygon',
                'slug' => 'geo_polygon',
                'description' => 'Location-based attendance using polygon boundaries',
                'icon' => '📍',
                'config' => ['polygon' => []],
                'is_active' => true,
                'priority' => 1,
            ],
            [
                'name' => 'WiFi/IP Based',
                'slug' => 'wifi_ip',
                'description' => 'Network-based attendance validation',
                'icon' => '📶',
                'config' => ['allowed_ips' => [], 'allowed_ranges' => []],
                'is_active' => true,
                'priority' => 2,
            ],
            [
                'name' => 'Route Waypoint',
                'slug' => 'route_waypoint',
                'description' => 'Route-based attendance for mobile workers',
                'icon' => '🛣️',
                'config' => ['waypoints' => [], 'tolerance' => 200],
                'is_active' => true,
                'priority' => 3,
            ],
            [
                'name' => 'QR Code',
                'slug' => 'qr_code',
                'description' => 'QR code-based attendance',
                'icon' => '📱',
                'config' => ['max_distance' => 50],
                'is_active' => true,
                'priority' => 4,
            ],
        ];

        foreach ($attendanceTypes as $type) {
            AttendanceType::create($type);
        }
    }
}