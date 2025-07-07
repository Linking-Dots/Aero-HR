<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'designation_id',
        'department_id',
        'job_type',
        'location',
        'is_remote',
        'description',
        'responsibilities',
        'requirements',
        'qualifications',
        'salary_min',
        'salary_max',
        'salary_currency',
        'benefits',
        'posted_date',
        'closing_date',
        'status',
        'hiring_manager_id',
        'positions_count',
        'is_internal',
        'is_featured'
    ];

    protected $casts = [
        'posted_date' => 'date',
        'closing_date' => 'date',
        'is_remote' => 'boolean',
        'is_internal' => 'boolean',
        'is_featured' => 'boolean',
        'positions_count' => 'integer',
        'responsibilities' => 'array',
        'requirements' => 'array',
        'qualifications' => 'array',
        'benefits' => 'array',
        'salary_min' => 'float',
        'salary_max' => 'float',
    ];

    /**
     * Get the department for the job.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the designation/position for the job.
     */
    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    /**
     * Get the hiring manager for the job.
     */
    public function hiringManager()
    {
        return $this->belongsTo(User::class, 'hiring_manager_id');
    }

    /**
     * Get the applications for the job.
     */
    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Get the stages for this job's hiring process.
     */
    public function hiringStages()
    {
        return $this->hasMany(JobHiringStage::class)->orderBy('order');
    }

    /**
     * Check if the job is open.
     */
    public function isOpen()
    {
        $now = now();
        return $this->status === 'open' &&
            ($now->between($this->posted_date, $this->closing_date) ||
                ($now->gte($this->posted_date) && $this->closing_date === null));
    }

    /**
     * Check if the job is closed.
     */
    public function isClosed()
    {
        return $this->status === 'closed' ||
            ($this->closing_date !== null && now()->gt($this->closing_date));
    }

    /**
     * Get days until closing.
     */
    public function daysUntilClosing()
    {
        if ($this->closing_date === null) {
            return null;
        }

        return max(0, now()->diffInDays($this->closing_date, false));
    }

    /**
     * Get the formatted salary range.
     */
    public function getSalaryRangeAttribute()
    {
        if ($this->salary_min === null && $this->salary_max === null) {
            return 'Negotiable';
        }

        if ($this->salary_min !== null && $this->salary_max === null) {
            return 'From ' . $this->salary_currency . ' ' . number_format($this->salary_min);
        }

        if ($this->salary_min === null && $this->salary_max !== null) {
            return 'Up to ' . $this->salary_currency . ' ' . number_format($this->salary_max);
        }

        return $this->salary_currency . ' ' . number_format($this->salary_min) . ' - ' . number_format($this->salary_max);
    }

    /**
     * Get the job type text.
     */
    public function getJobTypeTextAttribute()
    {
        $typeMap = [
            'full_time' => 'Full Time',
            'part_time' => 'Part Time',
            'contract' => 'Contract',
            'temporary' => 'Temporary',
            'internship' => 'Internship',
            'volunteer' => 'Volunteer',
        ];

        return $typeMap[$this->job_type] ?? $this->job_type;
    }
}
