<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantUserLookup extends Model
{
    use HasFactory;

    protected $table = 'tenant_user_lookup';

    protected $fillable = [
        'email',
        'tenant_id',
        'is_admin',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
    ];

    /**
     * Get the tenant associated with this lookup entry.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Find tenant for a given email.
     */
    public static function findTenantByEmail(string $email): ?Tenant
    {
        $lookup = static::where('email', $email)->first();
        return $lookup?->tenant;
    }

    /**
     * Check if email belongs to any tenant.
     */
    public static function emailExists(string $email): bool
    {
        return static::where('email', $email)->exists();
    }

    /**
     * Get all tenants for an email (in case user has access to multiple tenants).
     */
    public static function getTenantsForEmail(string $email): \Illuminate\Database\Eloquent\Collection
    {
        return static::where('email', $email)
            ->with('tenant')
            ->get()
            ->pluck('tenant');
    }

    /**
     * Add email to tenant lookup.
     */
    public static function addEmailToTenant(string $email, string $tenantId, bool $isAdmin = false): self
    {
        return static::firstOrCreate(
            ['email' => $email, 'tenant_id' => $tenantId],
            ['is_admin' => $isAdmin]
        );
    }

    /**
     * Remove email from tenant lookup.
     */
    public static function removeEmailFromTenant(string $email, string $tenantId): bool
    {
        return static::where('email', $email)
            ->where('tenant_id', $tenantId)
            ->delete() > 0;
    }

    /**
     * Check if email is admin for tenant.
     */
    public static function isAdminForTenant(string $email, int $tenantId): bool
    {
        return static::where('email', $email)
            ->where('tenant_id', $tenantId)
            ->where('is_admin', true)
            ->exists();
    }
}
