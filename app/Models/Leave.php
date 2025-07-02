<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'leave_type',
        'from_date',
        'to_date',
        'no_of_days',
        'approved_by',
        'reason',
        'status',
    ];

    protected $casts = [
        'id' => 'integer',
        'leave_type' => 'string',
        'from_date' => 'date:Y-m-d', // Format as YYYY-MM-DD without time
        'to_date' => 'date:Y-m-d',   // Format as YYYY-MM-DD without time
        'no_of_days' => 'integer',
        'reason' => 'string',
        'status' => 'string',
        'approved_by' => 'integer',
    ];

    // Relationships
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Custom date serialization to ensure consistent date format without time component
     * 
     * @return array
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Format dates consistently to YYYY-MM-DD and handle T18:00:00 case
        if (isset($array['from_date'])) {
            if (is_string($array['from_date']) && strpos($array['from_date'], 'T18:00:00') !== false) {
                // For 18:00 UTC dates, add one day to get the correct local date
                $array['from_date'] = date('Y-m-d', strtotime($array['from_date'] . ' +1 day'));
            } else {
                $array['from_date'] = date('Y-m-d', strtotime($array['from_date']));
            }
        }
        
        if (isset($array['to_date'])) {
            if (is_string($array['to_date']) && strpos($array['to_date'], 'T18:00:00') !== false) {
                // For 18:00 UTC dates, add one day to get the correct local date
                $array['to_date'] = date('Y-m-d', strtotime($array['to_date'] . ' +1 day'));
            } else {
                $array['to_date'] = date('Y-m-d', strtotime($array['to_date']));
            }
        }
        
        return $array;
    }

    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function leaveSetting(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(LeaveSetting::class, 'leave_type');
    }

    public function approver(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Accessors
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'New' => 'primary',
            'Pending' => 'warning', 
            'Approved' => 'success',
            'Declined' => 'danger',
            default => 'default'
        };
    }

    /**
     * Get the from_date attribute.
     * Special handling for T18:00:00 timestamps to fix the date discrepancy.
     *
     * @param  string  $value
     * @return string
     */
    public function getFromDateAttribute($value)
    {
        if (is_string($value) && strpos($value, 'T18:00:00') !== false) {
            // For 18:00 UTC dates (6 PM), add one day to get the correct local date
            return date('Y-m-d', strtotime($value . ' +1 day'));
        }
        
        return $value instanceof \Carbon\Carbon ? $value->format('Y-m-d') : date('Y-m-d', strtotime($value));
    }

    /**
     * Get the to_date attribute.
     * Special handling for T18:00:00 timestamps to fix the date discrepancy.
     *
     * @param  string  $value
     * @return string
     */
    public function getToDateAttribute($value)
    {
        if (is_string($value) && strpos($value, 'T18:00:00') !== false) {
            // For 18:00 UTC dates (6 PM), add one day to get the correct local date
            return date('Y-m-d', strtotime($value . ' +1 day'));
        }
        
        return $value instanceof \Carbon\Carbon ? $value->format('Y-m-d') : date('Y-m-d', strtotime($value));
    }


}
