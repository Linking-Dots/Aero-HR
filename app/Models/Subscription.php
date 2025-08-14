<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'tenant_id', 'plan_id', 'stripe_subscription_id', 'stripe_customer_id',
        'status', 'trial_ends_at', 'ends_at', 'auto_renew', 
        'current_period_start', 'current_period_end', 'metadata'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'auto_renew' => 'boolean',
        'metadata' => 'array'
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trialing']);
    }

    public function isOnTrial(): bool
    {
        return $this->status === 'trialing' && 
               $this->trial_ends_at && 
               $this->trial_ends_at->isFuture();
    }

    public function hasExpired(): bool
    {
        return $this->ends_at && $this->ends_at->isPast();
    }

    public function isPastDue(): bool
    {
        return $this->status === 'past_due';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getTrialDaysRemaining(): int
    {
        if (!$this->isOnTrial()) {
            return 0;
        }

        return $this->trial_ends_at->diffInDays(now());
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'trialing']);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
                     ->orWhere(function ($q) {
                         $q->whereNotNull('ends_at')
                           ->where('ends_at', '<', now());
                     });
    }
}
