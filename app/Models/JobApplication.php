<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class JobApplication extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'job_id',
        'applicant_id',
        'name',
        'email',
        'phone',
        'cover_letter',
        'status',
        'rating',
        'source',
        'current_stage_id',
        'applied_date',
        'last_status_change',
        'application_notes',
        'expected_salary',
        'notice_period',
        'experience_years',
        'application_ip',
        'referral_source',
        'referrer_id'
    ];

    protected $casts = [
        'applied_date' => 'date',
        'last_status_change' => 'date',
        'rating' => 'float',
        'expected_salary' => 'float',
        'notice_period' => 'integer',
        'experience_years' => 'float',
    ];

    /**
     * Get the job that was applied for.
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user who applied (if registered).
     */
    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    /**
     * Get the current hiring stage.
     */
    public function currentStage()
    {
        return $this->belongsTo(JobHiringStage::class, 'current_stage_id');
    }

    /**
     * Get the interviews for this application.
     */
    public function interviews()
    {
        return $this->hasMany(JobInterview::class);
    }

    /**
     * Get the user who referred this applicant.
     */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * Get the education records for this applicant.
     */
    public function educationRecords()
    {
        return $this->hasMany(JobApplicantEducation::class);
    }

    /**
     * Get the work experience records for this applicant.
     */
    public function experienceRecords()
    {
        return $this->hasMany(JobApplicantExperience::class);
    }

    /**
     * Get the stage history for this application.
     */
    public function stageHistory()
    {
        return $this->hasMany(JobApplicationStageHistory::class)->orderBy('changed_at', 'desc');
    }

    /**
     * Get the timeline of this application.
     */
    public function timeline()
    {
        return $this->stageHistory;
    }

    /**
     * Calculate the age of the application in days.
     */
    public function ageInDays()
    {
        return $this->applied_date->diffInDays(now());
    }

    /**
     * Determine if the application is active.
     */
    public function isActive()
    {
        return !in_array($this->status, ['rejected', 'withdrawn', 'hired', 'declined_offer']);
    }
}
