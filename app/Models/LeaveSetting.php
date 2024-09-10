<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'days',
        'eligibility',
        'carry_forward',
        'earned_leave',
        'special_conditions',
    ];

    protected $casts = [
        'id' => 'integer',
        'type' => 'string',
        'days' => 'integer',
        'eligibility' => 'string',
        'carry_forward' => 'boolean',
        'earned_leave' => 'boolean',
        'special_conditions' => 'string',

    ];

}
