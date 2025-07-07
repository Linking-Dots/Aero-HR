<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobHiringStage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_id',
        'name',
        'description',
        'order',
        'is_required',
        'expected_duration_days',
        'stage_type'
    ];

    protected $casts = [
        'order' => 'integer',
        'is_required' => 'boolean',
        'expected_duration_days' => 'integer',
    ];

    /**
     * Get the job this stage belongs to.
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the applications currently at this stage.
     */
    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'current_stage_id');
    }

    /**
     * Get the stage history entries for this stage.
     */
    public function stageHistories()
    {
        return $this->hasMany(JobApplicationStageHistory::class, 'stage_id');
    }

    /**
     * Get the next stage in the hiring process.
     */
    public function nextStage()
    {
        return JobHiringStage::where('job_id', $this->job_id)
            ->where('order', '>', $this->order)
            ->orderBy('order', 'asc')
            ->first();
    }

    /**
     * Get the previous stage in the hiring process.
     */
    public function previousStage()
    {
        return JobHiringStage::where('job_id', $this->job_id)
            ->where('order', '<', $this->order)
            ->orderBy('order', 'desc')
            ->first();
    }

    /**
     * Move an application to the next stage.
     */
    public function moveApplicationToNextStage(JobApplication $application, $notes = null)
    {
        $nextStage = $this->nextStage();

        if (!$nextStage) {
            return false;
        }

        // Create stage history entry
        JobApplicationStageHistory::create([
            'job_application_id' => $application->id,
            'stage_id' => $nextStage->id,
            'previous_stage_id' => $this->id,
            'changed_by' => auth()->id(),
            'changed_at' => now(),
            'notes' => $notes
        ]);

        // Update application
        $application->update([
            'current_stage_id' => $nextStage->id,
            'last_status_change' => now()
        ]);

        return true;
    }
}
