<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    // Specify the table name if it's different from the default
    protected $table = 'departments';

    // Define the fillable attributes
    protected $fillable = [
        'name',
    ];

    protected $casts = [
        'id' => 'integer',
    ];
}
