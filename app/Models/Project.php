<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_name',
        'client_id',
        'start_date',
        'end_date',
        'rate',
        'rate_type',
        'priority',
        'project_leader_id',
        'team_leader_id',
        'description',
        'files', // Assuming this will be a JSON column for file paths or IDs
    ];

    protected $dates = [
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'files' => 'array',
    ];

    // Relationships (example)
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function projectLeader()
    {
        return $this->belongsTo(User::class, 'project_leader_id');
    }

    public function teamLeader()
    {
        return $this->belongsTo(User::class, 'team_leader_id');
    }
}
