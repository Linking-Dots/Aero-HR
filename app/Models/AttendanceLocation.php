<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'type', 'coordinates', 'allowed_ips', 
        'wifi_ssid', 'description', 'is_active'
    ];

    protected $casts = [
        'coordinates' => 'array',
        'allowed_ips' => 'array',
        'is_active' => 'boolean',
    ];

    public function rules()
    {
        return $this->hasMany(AttendanceRule::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}