<?php

namespace App\Models\HRM;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Designation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'designations';

    protected $fillable = [
        'title',
        'department_id',
        'parent_id',
        'is_active',
    ];

    protected $casts = [
        'id' => 'integer',
        'department_id' => 'integer',
        'parent_id' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function users(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'designation_id');
    }

    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Designation::class, 'parent_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors
    public function getEmployeeCountAttribute(): int
    {
        return $this->users()->count(); // note: better to use withCount() outside
    }

    // Optional: customize array output for API responses
    public function toArray(): array
    {
        $array = parent::toArray();
        $array['department_name'] = optional($this->department)->name;
        $array['employee_count'] = $this->employee_count;
        return $array;
    }
}
