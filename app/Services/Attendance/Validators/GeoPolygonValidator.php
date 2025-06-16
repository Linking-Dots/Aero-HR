<?php

namespace App\Services\Attendance\Validators;

use App\Services\Attendance\Contracts\AttendanceValidatorInterface;

class GeoPolygonValidator implements AttendanceValidatorInterface
{
    protected array $config;
    protected string $message = '';

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function validate(array $context): bool
    {
        if (!isset($context['lat'], $context['lng'])) {
            $this->message = 'Location coordinates are required.';
            return false;
        }

        $userLat = $context['lat'];
        $userLng = $context['lng'];
        
        if (!isset($this->config['polygon'])) {
            $this->message = 'Polygon coordinates not configured.';
            return false;
        }

        $polygon = $this->config['polygon'];
        
        if ($this->isPointInPolygon($userLat, $userLng, $polygon)) {
            return true;
        }

        $this->message = 'You are outside the authorized work area.';
        return false;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    private function isPointInPolygon(float $lat, float $lng, array $polygon): bool
    {
        $vertices = count($polygon);
        $intersections = 0;

        for ($i = 0; $i < $vertices; $i++) {
            $j = ($i + 1) % $vertices;
            
            $xi = $polygon[$i]['lat'];
            $yi = $polygon[$i]['lng'];
            $xj = $polygon[$j]['lat'];
            $yj = $polygon[$j]['lng'];

            if ((($yi > $lng) !== ($yj > $lng)) && 
                ($lat < ($xj - $xi) * ($lng - $yi) / ($yj - $yi) + $xi)) {
                $intersections++;
            }
        }

        return ($intersections % 2) === 1;
    }
}
