<?php

namespace App\Models\HRM;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Offboarding extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'initiation_date',
        'last_working_date',
        'exit_interview_date',
        'reason', // resignation, termination, retirement, end-of-contract, other
        'status', // pending, in-progress, completed, cancelled
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'initiation_date' => 'date',
        'last_working_date' => 'date',
        'exit_interview_date' => 'date',
    ];

    /**
     * Get the employee that is being offboarded.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    /**
     * Get the user who created the offboarding record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the offboarding tasks for this offboarding process.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(OffboardingTask::class);
    }
}
