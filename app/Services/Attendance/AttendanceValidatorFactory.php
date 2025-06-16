<?php

namespace App\Services\Attendance;

use App\Services\Attendance\Contracts\AttendanceValidatorInterface;
use App\Services\Attendance\Validators\{
    GeoPolygonValidator,
    WifiIpValidator,
    RouteWaypointValidator,
    QRCodeValidator,
    NFCValidator,
    DeviceFingerprintValidator,
    TimeRangeValidator,
    ProximityValidator,
    GeofenceValidator
};

class AttendanceValidatorFactory
{
    private static array $validators = [
        'geo_polygon' => GeoPolygonValidator::class,
        'wifi_ip' => WifiIpValidator::class,
        'route_waypoint' => RouteWaypointValidator::class,
        'qr_code' => QRCodeValidator::class,
        'nfc' => NFCValidator::class,
        'device_fingerprint' => DeviceFingerprintValidator::class,
        'time_range' => TimeRangeValidator::class,
        'proximity' => ProximityValidator::class,
        'geofence' => GeofenceValidator::class,
    ];

    /**
     * Factory method to create the appropriate validator.
     *
     * @param string $slug  The validator type slug (e.g. 'geo_polygon')
     * @param array $config Config from the AttendanceType model
     *
     * @return AttendanceValidatorInterface
     * @throws \Exception if the validator type is unknown
     */
    public static function make(string $slug, array $config): AttendanceValidatorInterface
    {
        if (!isset(self::$validators[$slug])) {
            throw new \InvalidArgumentException("Unknown validator type: {$slug}");
        }

        $validatorClass = self::$validators[$slug];
        return new $validatorClass($config);
    }

    public static function register(string $type, string $validatorClass): void
    {
        if (!is_subclass_of($validatorClass, AttendanceValidatorInterface::class)) {
            throw new \InvalidArgumentException("Validator must implement AttendanceValidatorInterface");
        }

        self::$validators[$type] = $validatorClass;
    }

    public static function getAvailableTypes(): array
    {
        return array_keys(self::$validators);
    }
}
