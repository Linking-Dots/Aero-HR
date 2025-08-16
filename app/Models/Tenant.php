<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase;

    protected $fillable = [
        'id', 'name', 'slug', 'domain', 'database_name', 
        'plan_id', 'status', 'trial_ends_at', 'settings'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'settings' => 'array'
    ];

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug', 
            'domain',
            'database_name',
            'plan_id',
            'status',
            'trial_ends_at',
            'settings'
        ];
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function tenantUsers()
    {
        return $this->hasMany(TenantUser::class);
    }

    /**
     * Relationship to domains (required by Stancl\Tenancy)
     */
    public function domains()
    {
        return $this->hasMany(\Stancl\Tenancy\Database\Models\Domain::class);
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription && 
               in_array($this->subscription->status, ['active', 'trialing']);
    }

    public function getDomainUrl(): string
    {
        return "http://{$this->domain}." . config('app.domain', 'localhost');
    }
}
