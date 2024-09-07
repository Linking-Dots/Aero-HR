<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyWorkSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'incharge',
        'totalDailyWorks',
        'resubmissions',
        'embankment',
        'structure',
        'pavement'
    ];

    protected $casts = [
        'id' => 'integer',
        'totalDailyWorks' => 'integer',
        'resubmissions' => 'integer',
        'embankment' => 'integer',
        'structure' => 'integer',
        'pavement' => 'integer',
    ];
}
