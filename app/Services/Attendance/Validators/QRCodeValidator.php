<?php

namespace App\Services\Attendance\Validators;

use App\Services\Attendance\Contracts\AttendanceValidatorInterface;
use App\Models\AttendanceQRCode;
use Carbon\Carbon;

class QRCodeValidator implements AttendanceValidatorInterface
{
    protected array $config;
    protected string $message = '';

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function validate(array $context): bool
    {
        if (!isset($context['qr_code'])) {
            $this->message = 'QR code is required for attendance.';
            return false;
        }

        $qrCode = AttendanceQRCode::where('code', $context['qr_code'])
            ->where('is_active', true)
            ->first();

        if (!$qrCode) {
            $this->message = 'Invalid or expired QR code.';
            return false;
        }

        // Check expiration
        if ($qrCode->expires_at && Carbon::now()->isAfter($qrCode->expires_at)) {
            $this->message = 'QR code has expired.';
            return false;
        }

        // Check location if specified
        if (isset($context['lat'], $context['lng']) && $qrCode->location_restriction) {
            $distance = $this->calculateDistance(
                $context['lat'], $context['lng'],
                $qrCode->latitude, $qrCode->longitude
            );

            $maxDistance = $this->config['max_distance'] ?? 50; // meters
            if ($distance > $maxDistance) {
                $this->message = 'You are too far from the QR code location.';
                return false;
            }
        }

        return true;
    }

    public function getMessage(): string
    {
        return $this->message;
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