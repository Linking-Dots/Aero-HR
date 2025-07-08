<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OffboardingTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'offboarding_id',
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
     * Get the offboarding process that this task belongs to.
     */
    public function offboarding(): BelongsTo
    {
        return $this->belongsTo(Offboarding::class);
    }

    /**
     * Get the user assigned to this task.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
