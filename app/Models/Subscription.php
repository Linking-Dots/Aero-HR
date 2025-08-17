<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'plan_id',
        'stripe_subscription_id',
        'stripe_status',
        'billing_cycle',
        'quantity',
        'current_period_start',
        'current_period_end',
        'trial_ends_at',
        'ends_at',
        'amount',
        'currency',
        'last_payment_at',
        'next_payment_at',
        'metadata',
        'cancellation_reason',
        'cancelled_at',
        // Legacy fields
        'stripe_customer_id',
        'status',
        'auto_renew',
    ];

    protected $casts = [
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
        'last_payment_at' => 'datetime',
        'next_payment_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
        'quantity' => 'integer',
        'amount' => 'integer',
        'auto_renew' => 'boolean',
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
        return in_array($this->stripe_status ?? $this->status, ['canceled', 'cancelled']);
    }

    /**
     * Check if subscription is incomplete.
     */
    public function isIncomplete(): bool
    {
        return in_array($this->stripe_status ?? $this->status, ['incomplete', 'incomplete_expired']);
    }

    /**
     * Get the amount in dollars.
     */
    public function getAmountInDollars(): float
    {
        return ($this->amount ?? 0) / 100;
    }

    public function getTrialDaysRemaining(): int
    {
        if (!$this->isOnTrial()) {
            return 0;
        }

        return $this->trial_ends_at->diffInDays(now());
    }

    /**
     * Get days until renewal.
     */
    public function getDaysUntilRenewal(): int
    {
        if (!$this->current_period_end) {
            return 0;
        }

        return now()->diffInDays($this->current_period_end, false);
    }

    /**
     * Check if subscription expires soon (within 7 days).
     */
    public function expiresSoon(): bool
    {
        $daysUntilRenewal = $this->getDaysUntilRenewal();
        return $daysUntilRenewal >= 0 && $daysUntilRenewal <= 7;
    }

    /**
     * Find subscription by Stripe ID.
     */
    public static function findByStripeId(string $stripeId): ?self
    {
        return static::where('stripe_subscription_id', $stripeId)->first();
    }

    public function scopeActive($query)
    {
        return $query->whereIn('stripe_status', ['active', 'trialing'])
                    ->orWhereIn('status', ['active', 'trialing']);
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
