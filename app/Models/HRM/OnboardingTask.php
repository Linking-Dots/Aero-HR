<?php

namespace App\Models\HRM;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'onboarding_id',
        'task',
        'description',
        'due_date',
        'completed_date',
        'status', // pending, in-progress, completed, not-applicable
        'assigned_to',
        'notes',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_date' => 'date',
    ];

    /**
     * Get the onboarding process that this task belongs to.
     */
    public function onboarding(): BelongsTo
    {
        return $this->belongsTo(Onboarding::class);
    }

    /**
     * Get the user assigned to this task.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
