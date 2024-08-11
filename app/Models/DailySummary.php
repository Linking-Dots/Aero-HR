<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailySummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'incharge',
        'totalTasks',
        'totalResubmission',
        'embankmentTasks',
        'structureTasks',
        'pavementTasks'
    ];
}
