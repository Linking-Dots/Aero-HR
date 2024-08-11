<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyWork extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'number',
        'status',
        'type',
        'description',
        'location',
        'side',
        'qty_layer',
        'planned_time',
        'incharge',
        'completion_time',
        'inspection_details',
        'resubmission_count',
        'resubmission_date',
        'rfi_submission_date'
    ];



    public function reports()
    {
        return $this->belongsToMany(Report::class, 'daily_work_has_report', 'daily_work_id','report_id');
    }
}
