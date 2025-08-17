<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class PlatformUser extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'platform_users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Check if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is support.
     */
    public function isSupport(): bool
    {
        return $this->role === 'support';
    }

    /**
     * Check if user is billing.
     */
    public function isBilling(): bool
    {
        return $this->role === 'billing';
    }

    /**
     * Check if user is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get active platform users.
     */
    public static function active(): \Illuminate\Database\Eloquent\Builder
    {
        return static::where('is_active', true);
    }

    /**
     * Get super admins.
     */
    public static function superAdmins(): \Illuminate\Database\Eloquent\Builder
    {
        return static::where('role', 'super_admin')->where('is_active', true);
    }
}
