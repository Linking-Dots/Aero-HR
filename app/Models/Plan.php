<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_yearly',
        'stripe_price_id_monthly',
        'stripe_price_id_yearly',
        'stripe_product_id',
        'features',
        'max_users',
        'max_storage_gb',
        'custom_domain',
        'api_access',
        'priority_support',
        'is_active',
        'is_featured',
        'sort_order',
        // Legacy compatibility
        'price',
        'billing_cycle',
        'limits',
        'stripe_price_id',
        'stripe_monthly_price_id',
        'stripe_yearly_price_id',
        'trial_days',
    ];

    protected $casts = [
        'features' => 'array',
        'limits' => 'array',
        'max_users' => 'integer',
        'max_storage_gb' => 'integer',
        'custom_domain' => 'boolean',
        'api_access' => 'boolean',
        'priority_support' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'price_monthly' => 'integer',
        'price_yearly' => 'integer',
        'price' => 'decimal:2',
        'trial_days' => 'integer',
    ];

    public function tenants()
    {
        return $this->hasManyThrough(Tenant::class, Subscription::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function hasFeature(string $feature): bool
    {
        $features = $this->features ?? [];
        if (is_array($features) && !isset($features['modules'])) {
            return in_array($feature, $features);
        }
        
        // Legacy support
        $modules = $features['modules'] ?? [];
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
        if ($this->price_monthly) {
            return '$' . number_format($this->getMonthlyPriceInDollars(), 2);
        }
        return '$' . number_format($this->price, 2);
    }

    /**
     * Check if plan is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if plan is featured.
     */
    public function isFeatured(): bool
    {
        return $this->is_featured ?? false;
    }

    /**
     * Get the monthly price in dollars.
     */
    public function getMonthlyPriceInDollars(): float
    {
        return ($this->price_monthly ?? 0) / 100;
    }

    /**
     * Get the yearly price in dollars.
     */
    public function getYearlyPriceInDollars(): float
    {
        return ($this->price_yearly ?? 0) / 100;
    }

    /**
     * Get yearly savings percentage.
     */
    public function getYearlySavingsPercentage(): int
    {
        if (!$this->price_monthly || !$this->price_yearly) {
            return 0;
        }

        $monthlyYearly = $this->price_monthly * 12;
        $savings = $monthlyYearly - $this->price_yearly;
        
        return round(($savings / $monthlyYearly) * 100);
    }

    /**
     * Get active plans ordered by sort order.
     */
    public static function active(): \Illuminate\Database\Eloquent\Builder
    {
        return static::where('is_active', true)->orderBy('sort_order');
    }

    /**
     * Get featured plans.
     */
    public static function featured(): \Illuminate\Database\Eloquent\Builder
    {
        return static::where('is_featured', true)->where('is_active', true);
    }

    /**
     * Find plan by slug.
     */
    public static function findBySlug(string $slug): ?self
    {
        return static::where('slug', $slug)->where('is_active', true)->first();
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
