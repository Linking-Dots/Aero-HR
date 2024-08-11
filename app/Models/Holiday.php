<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'holiday_date',
        'day',
        'action',
    ];

    protected $dates = [
        'holiday_date',
    ];
}
