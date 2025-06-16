<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'office_start_time',
        'office_end_time',
        'break_time_duration',
        'late_mark_after',
        'early_leave_before',
        'overtime_after',
        'allow_punch_from_mobile',
        'auto_punch_out',
        'auto_punch_out_time',
        'attendance_validation_type',
        'location_radius',
        'allowed_ips',
        'require_location_services',
        'weekend_days',
    ];

    protected $casts = [
        'allow_punch_from_mobile' => 'boolean',
        'auto_punch_out' => 'boolean',
        'require_location_services' => 'boolean',
        'weekend_days' => 'array',
        'office_start_time' => 'datetime:H:i',
        'office_end_time' => 'datetime:H:i',
        'auto_punch_out_time' => 'datetime:H:i',
    ];

    // Add this method to handle default values
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (is_null($model->weekend_days)) {
                $model->weekend_days = ['saturday', 'sunday'];
            }
        });
    }

    // Or use accessor/mutator approach
    public function getWeekendDaysAttribute($value)
    {
        if (is_null($value)) {
            return ['saturday', 'sunday'];
        }
        return json_decode($value, true);
    }
}