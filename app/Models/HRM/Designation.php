<?php

namespace App\Models\HRM;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    use HasFactory;

    // Specify the table name if it's different from the default
    protected $table = 'designations';

    // Define the fillable attributes
    protected $fillable = [
        'title',
        'department_id',
    ];

    protected $casts = [
        'id' => 'integer',
        'department_id' => 'integer',
    ];

    // Define the relationship with the Department model
    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function users(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'designation');
    }
}
