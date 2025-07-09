<?php


namespace App\Models\HRM;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'punchin',
        'punchout',
        'punchin_location',
        'punchout_location',
    ];

    protected $casts = [
        'date' => 'date',
        'punchin' => 'datetime',
        'punchout' => 'datetime',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get punch in location as array
     */
    public function getPunchinLocationArrayAttribute(): ?array
    {
        return $this->punchin_location ? json_decode($this->punchin_location, true) : null;
    }

    /**
     * Get punch out location as array
     */
    public function getPunchoutLocationArrayAttribute(): ?array
    {
        return $this->punchout_location ? json_decode($this->punchout_location, true) : null;
    }

}
