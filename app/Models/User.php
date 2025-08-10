<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\HRM\Attendance;
use App\Models\HRM\AttendanceType;
use App\Models\HRM\Department;
use App\Models\HRM\Designation;
use App\Models\HRM\Leave;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use NotificationChannels\WebPush\HasPushSubscriptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class User
 *
 * @method bool hasRole(string|array $roles)
 * @method bool hasAnyRole(string|array $roles)
 * @method bool hasAllRoles(array $roles)
 * @method bool hasPermissionTo(string $permission, string $guardName = null)
 */
class User extends Authenticatable implements HasMedia
{
    use HasFactory, Notifiable, HasRoles, HasPushSubscriptions, InteractsWithMedia, SoftDeletes, TwoFactorAuthenticatable;



    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'user_name',
        'phone',
        'email',
        'dob',
        'address',
        'about',
        'report_to',
        'password',
        'designation',
        'nid',
        'name',
        'profile_image',
        'department',
        'date_of_joining',
        'active',
        'birthday',
        'gender',
        'passport_no',
        'passport_exp_date',
        'nationality',
        'religion',
        'marital_status',
        'employment_of_spouse',
        'number_of_children',
        'emergency_contact_primary_name',
        'emergency_contact_primary_relationship',
        'emergency_contact_primary_phone',
        'emergency_contact_secondary_name',
        'emergency_contact_secondary_relationship',
        'emergency_contact_secondary_phone',
        'bank_name',
        'bank_account_no',
        'ifsc_code',
        'pan_no',
        'family_member_name',
        'family_member_relationship',
        'family_member_dob',
        'family_member_phone',
        'education_ug_institution',
        'education_ug_degree',
        'education_ug_start_year',
        'education_ug_end_year',
        'education_pg_institution',
        'education_pg_degree',
        'education_pg_start_year',
        'education_pg_end_year',
        'experience_1_company',
        'experience_1_position',
        'experience_1_start_date',
        'experience_1_end_date',
        'experience_2_company',
        'experience_2_position',
        'experience_2_start_date',
        'experience_2_end_date',
        'experience_3_company',
        'experience_3_position',
        'experience_3_start_date',
        'experience_3_end_date',
        'salary_basis',
        'salary_amount',
        'payment_type',
        'pf_contribution',
        'pf_no',
        'employee_pf_rate',
        'additional_pf_rate',
        'total_pf_rate',
        'esi_contribution',
        'esi_no',
        'employee_esi_rate',
        'additional_esi_rate',
        'total_esi_rate',
        'email_verified_at',
        'attendance_type_id',
        'attendance_config',
        'fcm_token',
        'preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'report_to' => 'integer',
        'designation' => 'integer',
        'department' => 'integer',
        'attendance_type_id' => 'integer',
        'attendance_config' => 'array',
        'preferences' => 'array',
        'active' => 'boolean',
    ];

    public function ledProjects()
    {
        return $this->hasMany(Project::class, 'project_leader_id');
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_user');
    }

    public function experiences()
    {
        return $this->hasMany(Experience::class);
    }

    public function educations()
    {
        return $this->hasMany(Education::class);
    }


    public function setActiveStatus(bool $status)
    {
        if ($status) {
            // Restore the user if it's soft deleted
            if ($this->trashed()) {
                $this->restore();
            }
            $this->active = true;
        } else {
            // Soft delete the user and mark as inactive
            $this->active = false;
            $this->delete();
        }
        $this->save();
    }

    public function leaves()
    {
        return $this->hasMany(Leave::class, 'user_id');
    }

    // In User.php model
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'user_id');
    }

    public function attendanceType()
    {
        return $this->belongsTo(AttendanceType::class, 'attendance_type_id');
    }

    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class, 'designation');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department');
    }
}
