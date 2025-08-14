<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'key',
        'permissions',
        'last_used_at',
        'expires_at',
        'is_active'
    ];

    protected $casts = [
        'permissions' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    protected $hidden = [
        'key' // Hide full key in API responses
    ];

    /**
     * Relationship with tenant
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Generate a new API key
     */
    public static function generate(int $tenantId, string $name, array $permissions = ['read']): self
    {
        return self::create([
            'tenant_id' => $tenantId,
            'name' => $name,
            'key' => 'ak_' . Str::random(40),
            'permissions' => $permissions,
            'is_active' => true,
        ]);
    }

    /**
     * Check if key has permission
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions ?? []) || in_array('all', $this->permissions ?? []);
    }

    /**
     * Update last used timestamp
     */
    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Check if key is valid and active
     */
    public function isValid(): bool
    {
        return $this->is_active && 
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /**
     * Revoke the API key
     */
    public function revoke(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Get masked key for display
     */
    public function getMaskedKeyAttribute(): string
    {
        return substr($this->key, 0, 10) . '...' . substr($this->key, -4);
    }
}
