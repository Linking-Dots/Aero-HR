<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_type',
        'days',
        'carry_forward',
        'earned_leave',
    ];

    protected $casts = [
        'carry_forward' => 'boolean',
        'earned_leave' => 'boolean',
    ];

}
