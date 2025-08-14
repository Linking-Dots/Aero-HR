<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'billing_cycle', 
        'features', 'limits', 'stripe_price_id', 'stripe_monthly_price_id', 
        'stripe_yearly_price_id', 'is_active', 'trial_days'
    ];

    protected $casts = [
        'features' => 'array',
        'limits' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function hasFeature(string $feature): bool
    {
        $modules = $this->features['modules'] ?? [];
        return in_array($feature, $modules) || in_array('all_modules', $modules);
    }

    public function getLimit(string $limit): ?int
    {
        return $this->limits[$limit] ?? null;
    }

    public function isWithinLimits(string $limit, int $currentValue): bool
    {
        $maxLimit = $this->getLimit($limit);
        
        // If limit is null, it means unlimited
        if ($maxLimit === null) {
            return true;
        }
        
        return $currentValue <= $maxLimit;
    }

    public function getFormattedPrice(): string
    {
        return '$' . number_format($this->price, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeMonthly($query)
    {
        return $query->where('billing_cycle', 'monthly');
    }

    public function scopeYearly($query)
    {
        return $query->where('billing_cycle', 'yearly');
    }
}
