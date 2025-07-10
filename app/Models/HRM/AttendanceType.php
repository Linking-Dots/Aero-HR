<?php

namespace App\Models\HRM;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'config',
        'is_active',
        'priority',
        'required_permissions'
    ];

    protected $casts = [
        'config' => 'array',
        'required_permissions' => 'array',
        'is_active' => 'boolean'
    ];

    // Relationship with users
    public function users()
    {
        return $this->hasMany(User::class, 'attendance_type_id');
    }

    // Scope for active attendance types
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
