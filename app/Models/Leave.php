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
        'from_date' => 'date',
        'to_date' => 'date',
        'no_of_days' => 'integer',
        'reason' => 'string',
        'status' => 'string',
        'approved_by' => 'integer',
    ];

    // Relationships (if any)
    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
