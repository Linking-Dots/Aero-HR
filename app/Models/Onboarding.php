<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Onboarding extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'start_date',
        'expected_completion_date',
        'actual_completion_date',
        'status', // pending, in-progress, completed, cancelled
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'expected_completion_date' => 'date',
        'actual_completion_date' => 'date',
    ];

    /**
     * Get the employee that is being onboarded.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    /**
     * Get the user who created the onboarding record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the onboarding tasks for this onboarding process.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(OnboardingTask::class);
    }
}
