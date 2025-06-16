<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class AttendanceRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'attendance_type_id',
        'attendance_location_id',
        'is_mandatory',
        'is_active',
        'start_time',
        'end_time',
        'days_of_week',
        'config'
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
        'days_of_week' => 'array',
        'config' => 'array',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attendanceType()
    {
        return $this->belongsTo(AttendanceType::class);
    }

    public function attendanceLocation()
    {
        return $this->belongsTo(AttendanceLocation::class);
    }

    // Fix the scope method to return a query builder, not execute it
    public function scopeForUser($query, $user)
    {
        return $query->where('user_id', $user->id)
                    ->where('is_active', true)
                    ->with(['attendanceType', 'attendanceLocation']);
    }

    public function isApplicableAtTime($time = null)
    {
        $time = $time ?: now();
        $currentTime = Carbon::parse($time)->format('H:i');
        $currentDay = strtolower(Carbon::parse($time)->format('l'));

        // Check time range
        if ($this->start_time && $this->end_time) {
            $startTime = Carbon::parse($this->start_time)->format('H:i');
            $endTime = Carbon::parse($this->end_time)->format('H:i');
            
            if ($currentTime < $startTime || $currentTime > $endTime) {
                return false;
            }
        }

        // Check days of week
        if ($this->days_of_week && !in_array($currentDay, $this->days_of_week)) {
            return false;
        }

        return true;
    }
}
