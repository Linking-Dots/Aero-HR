<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobInterview extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_application_id',
        'title',
        'description',
        'interview_date',
        'duration_minutes',
        'location',
        'is_online',
        'meeting_link',
        'interview_type',
        'status',
        'scheduled_by',
        'interviewer_ids',
        'interview_notes',
        'feedback',
        'rating',
        'recommendation'
    ];

    protected $casts = [
        'interview_date' => 'datetime',
        'duration_minutes' => 'integer',
        'is_online' => 'boolean',
        'interviewer_ids' => 'array',
        'rating' => 'float',
    ];

    /**
     * Get the job application this interview is for.
     */
    public function jobApplication()
    {
        return $this->belongsTo(JobApplication::class);
    }

    /**
     * Get the user who scheduled the interview.
     */
    public function scheduler()
    {
        return $this->belongsTo(User::class, 'scheduled_by');
    }

    /**
     * Get the interviewers for this interview.
     */
    public function interviewers()
    {
        return User::whereIn('id', $this->interviewer_ids ?? [])->get();
    }

    /**
     * Get the interview feedback entries for this interview.
     */
    public function feedbackEntries()
    {
        return $this->hasMany(JobInterviewFeedback::class);
    }

    /**
     * Check if the interview is upcoming.
     */
    public function isUpcoming()
    {
        return now()->lt($this->interview_date);
    }

    /**
     * Check if the interview is in progress.
     */
    public function isInProgress()
    {
        $now = now();
        $endTime = $this->interview_date->copy()->addMinutes($this->duration_minutes);
        return $now->gte($this->interview_date) && $now->lte($endTime);
    }

    /**
     * Check if the interview has ended.
     */
    public function hasEnded()
    {
        $endTime = $this->interview_date->copy()->addMinutes($this->duration_minutes);
        return now()->gt($endTime);
    }

    /**
     * Get the time until the interview (for upcoming interviews).
     */
    public function timeUntil()
    {
        if (!$this->isUpcoming()) {
            return null;
        }

        return now()->diffForHumans($this->interview_date, ['syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE]);
    }
}
