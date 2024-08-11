<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Report extends Model implements HasMedia
{
    use InteractsWithMedia;
    use HasFactory;

    protected $fillable = [
        'ref_no',
        'report_type',
        'issue_date',
        'details',
        'status',
        'remarks'
    ];

    public function tasks()
    {
        return $this->belongsToMany(DailyWork::class, 'task_has_report', 'report_id', 'task_id');
    }
}
