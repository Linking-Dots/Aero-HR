<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Domain extends Model
{
    use HasFactory;

    protected $fillable = [
        'domain',
        'tenant_id',
        'is_primary',
        'is_verified',
        'ssl_status',
        'verified_at',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the tenant that owns the domain.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if the domain is verified.
     */
    public function isVerified(): bool
    {
        return $this->is_verified;
    }

    /**
     * Check if the domain has SSL.
     */
    public function hasSSL(): bool
    {
        return $this->ssl_status === 'active';
    }

    /**
     * Mark domain as verified.
     */
    public function markAsVerified(): void
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);
    }

    /**
     * Set as primary domain for tenant.
     */
    public function setAsPrimary(): void
    {
        // Remove primary status from other domains of the same tenant
        static::where('tenant_id', $this->tenant_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        // Set this domain as primary
        $this->update(['is_primary' => true]);
    }

    /**
     * Find domain by name.
     */
    public static function findByName(string $domain): ?self
    {
        return static::where('domain', $domain)->first();
    }
}
