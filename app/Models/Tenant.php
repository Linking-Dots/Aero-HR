<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasFactory;

    protected $fillable = [
        'id', // UUID as primary key for stancl/tenancy
        'data', // Required by stancl/tenancy
        'slug',
        'name',
        'email',
        'phone',
        'db_name',
        'db_username',
        'db_password',
        'db_host',
        'db_port',
        'status',
        'settings',
        'storage_prefix',
        'stripe_customer_id',
        'trial_ends_at',
        'suspended_at',
        'terminated_at',
    ];

    protected $casts = [
        'data' => 'array',
        'settings' => 'array',
        'trial_ends_at' => 'datetime',
        'suspended_at' => 'datetime',
        'terminated_at' => 'datetime',
        'db_port' => 'integer',
    ];

    protected $hidden = [
        'db_password',
        'db_username',
    ];

    public static function getCustomColumns(): array
    {
        return [
            'id', // UUID as primary key
            'data', // Required by stancl/tenancy
            'slug',
            'name',
            'email',
            'phone',
            'db_name',
            'db_username',
            'db_password',
            'db_host',
            'db_port',
            'status',
            'settings',
            'storage_prefix',
            'stripe_customer_id',
            'trial_ends_at',
            'suspended_at',
            'terminated_at',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tenant) {
            if (empty($tenant->uuid)) {
                $tenant->uuid = Str::uuid()->toString();
            }
            
            if (empty($tenant->storage_prefix)) {
                $tenant->storage_prefix = "tenants/{$tenant->slug}";
            }
        });
    }

    /**
     * Get the tenant's domains.
     */
    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }

    /**
     * Get the tenant's primary domain.
     */
    public function primaryDomain(): HasOne
    {
        return $this->hasOne(Domain::class)->where('is_primary', true);
    }

    /**
     * Get the tenant's subscriptions.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the tenant's active subscription.
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->whereIn('stripe_status', ['active', 'trialing']);
    }

    /**
     * Get the tenant's user lookup entries.
     */
    public function userLookups(): HasMany
    {
        return $this->hasMany(TenantUserLookup::class);
    }

    /**
     * Accessor for decrypted database username.
     */
    public function getDbUsernameAttribute($value)
    {
        return $value ? decrypt($value) : null;
    }

    /**
     * Mutator for encrypted database username.
     */
    public function setDbUsernameAttribute($value)
    {
        $this->attributes['db_username'] = $value ? encrypt($value) : null;
    }

    /**
     * Accessor for decrypted database password.
     */
    public function getDbPasswordAttribute($value)
    {
        return $value ? decrypt($value) : null;
    }

    /**
     * Mutator for encrypted database password.
     */
    public function setDbPasswordAttribute($value)
    {
        $this->attributes['db_password'] = $value ? encrypt($value) : null;
    }

    /**
     * Get the database connection array for this tenant.
     */
    public function getDatabaseConnection(): array
    {
        return [
            'driver' => 'mysql',
            'host' => $this->db_host,
            'port' => $this->db_port,
            'database' => $this->db_name,
            'username' => $this->db_username,
            'password' => $this->db_password,
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ];
    }

    /**
     * Check if tenant is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if tenant is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Generate a unique database name.
     */
    public static function generateDatabaseName(): string
    {
        $prefix = config('database.tenant_db_prefix', 'saas_tenant_');
        $uuid = Str::uuid()->toString();
        
        return $prefix . str_replace('-', '_', $uuid);
    }

    /**
     * Find tenant by domain.
     */
    public static function findByDomain(string $domain): ?self
    {
        return static::whereHas('domains', function ($query) use ($domain) {
            $query->where('domain', $domain);
        })->first();
    }

    /**
     * Find tenant by slug.
     */
    public static function findBySlug(string $slug): ?self
    {
        return static::where('slug', $slug)->first();
    }

    // Legacy compatibility methods
    public function plan()
    {
        return $this->subscriptions()->latest()->first()?->plan;
    }

    public function subscription()
    {
        return $this->activeSubscription();
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }

    public function getDomainUrl(): string
    {
        $domain = $this->primaryDomain?->domain ?? "{$this->slug}.mysoftwaredomain.com";
        return "https://{$domain}";
    }
}
