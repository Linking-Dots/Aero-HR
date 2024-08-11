<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_type',
        'from_date',
        'to_date',
        'no_of_days',
        'reason',
        'status',
    ];

    // Relationships (if any)
    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }
}
