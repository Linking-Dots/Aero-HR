<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantUser extends Model
{
    protected $fillable = [
        'tenant_id', 'name', 'email', 'role',
        'invited_at', 'accepted_at', 'invitation_token'
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'accepted_at' => 'datetime'
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id', 'id');
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isInvited(): bool
    {
        return $this->role === 'invited';
    }

    public function hasAccepted(): bool
    {
        return !is_null($this->accepted_at);
    }

    public function isPendingInvitation(): bool
    {
        return $this->isInvited() && !$this->hasAccepted();
    }

    public function scopeOwners($query)
    {
        return $query->where('role', 'owner');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopePendingInvitations($query)
    {
        return $query->where('role', 'invited')
                     ->whereNull('accepted_at');
    }

    public function scopeAccepted($query)
    {
        return $query->whereNotNull('accepted_at');
    }
}
