<?php

namespace App\Http\Controllers;

use App\Models\HRM\AttendanceType;
use App\Models\HRM\Department;
use App\Models\HRM\Designation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index1(): \Inertia\Response
    {

        return Inertia::render('Employees/EmployeeList', [
            'title' => 'Employee Management',
            'departments' => Department::all(),
            'designations' => Designation::all(),
            'attendanceTypes' => AttendanceType::where('is_active', true)->get(),
        ]);
    }
    public function index2(): \Inertia\Response
    {
        return Inertia::render('UsersList', [
            'title' => 'Users',
            'roles' => Role::all(),
            'departments' => Department::all(),
        ]);
    }
    public function updateUserRole(Request $request, $id)
    {
        try {
            $request->validate([
                'roles' => 'required|array',
            ]);

            $user = User::findOrFail($id);

            $user->syncRoles($request->roles);


            return response()->json(['messages' => ['Role updated successfully']], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['errors' => ['User not found']], 404);
        } catch (\Exception $e) {
            return response()->json(['errors' => ['An unexpected error occurred. Please try again later.']], 500);
        }
    }
    public function toggleStatus($id, Request $request)
    {
        $user = User::withTrashed()->findOrFail($id);

        // Toggle the active status based on the request
        $user->active = $request->input('active');

        // Handle soft delete or restore based on the new status
        if ($user->active) {
            $user->restore(); // Restore the user if they were soft deleted
        } else {
            $user->delete();  // Soft delete the user if marking inactive
        }

        $user->save();

        return response()->json([
            'message' => 'User status updated successfully',
            'active' => $user->active,
        ]);
    }
    public function updateFcmToken(Request $request)
    {
        // Validate that the request contains an FCM token
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        // Get the authenticated user
        $user = $request->user();

        // Update the user's FCM token
        $user->fcm_token = $request->input('fcm_token');
        $user->save();

        return response()->json([
            'message' => 'FCM token updated successfully',
            'fcm_token' => $user->fcm_token,
        ]);
    }

    public function updateUserAttendanceType(Request $request, $id)
    {
        try {
            $request->validate([
                'attendance_type_id' => 'required|exists:attendance_types,id',
                'attendance_config' => 'nullable|array',
            ]);

            $user = User::findOrFail($id);

            // Use Eloquent relationship to associate attendance type
            $attendanceType = AttendanceType::findOrFail($request->attendance_type_id);

            // If you have a belongsTo relationship: $user->attendanceType()
            $user->attendanceType()->associate($attendanceType);

            // Optionally update config if you have a JSON column for user-specific config
            if ($request->has('attendance_config')) {
                $user->attendance_config = $request->attendance_config;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'messages' => ["User attendance type updated to {$attendanceType->name} successfully."],
                'user' => $user->fresh('attendanceType'),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'messages' => ['Failed to update attendance type.'],
                'errors' => [$e->getMessage()],
            ], 500);
        }
    }

    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $perPage    = $request->input('perPage', 10);
            $page       = $request->input('page', 1);
            $search     = $request->input('search');
            $role       = $request->input('role');
            $status     = $request->input('status');
            $department = $request->input('department');

            // Base query
            $query = User::withTrashed()
                ->with(['department', 'designation', 'roles']);

            // Filters
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            if ($role && $role !== 'all') {
                $query->whereHas('roles', fn($q) => $q->where('name', $role));
            }

            if ($status && $status !== 'all') {
                $query->where('active', $status === 'active' ? 1 : 0);
            }

            if ($department && $department !== 'all') {
                $query->where('department_id', $department);
            }

            // Sort active users first
            $query->orderByDesc('active');

            // Paginate
            $users = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform user data
            $users->getCollection()->transform(function ($user) {
                return [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'phone'          => $user->phone,
                    'profile_image'  => $user->profile_image,
                    'active'         => $user->active,
                    'department_id' => $user->department_id,
                    'department' => $user->department ? ($user->department instanceof Department ? $user->department->name : 
                        (is_numeric($user->department) ? 
                            (Department::find($user->department) ? Department::find($user->department)->name : null) : 
                            $user->department)) : null,
                    'roles'          => $user->roles->pluck('name')->toArray(),
                    'created_at'     => $user->created_at,
                    'updated_at'     => $user->updated_at,
                ];
            });

            return response()->json([
                'users' => $users,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'error'   => 'An error occurred while retrieving user data.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Get user statistics - Industry standard user management metrics
     */
    public function stats(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Basic user counts
            $totalUsers = User::withTrashed()->count();
            $activeUsers = User::withTrashed()->where('active', 1)->count();
            $inactiveUsers = User::withTrashed()->where('active', 0)->count();
            $deletedUsers = User::onlyTrashed()->count();
            
            // Role and permission analytics
            $roleCount = Role::count();
            $rolesWithUsers = Role::withCount('users')->get()->map(function ($role) use ($totalUsers) {
                return [
                    'name' => $role->name,
                    'count' => $role->users_count,
                    'percentage' => $totalUsers > 0 ? round(($role->users_count / $totalUsers) * 100, 1) : 0
                ];
            });
            
            // Department-wise user distribution
            $departmentStats = Department::withCount('users')
                ->get()
                ->map(function ($dept) use ($totalUsers) {
                    return [
                        'name' => $dept->name,
                        'count' => $dept->users_count,
                        'percentage' => $totalUsers > 0 ? round(($dept->users_count / $totalUsers) * 100, 1) : 0
                    ];
                });
            
            // User activity and engagement metrics
            $now = now();
            $recentActivity = [
                'new_users_30_days' => User::where('created_at', '>=', $now->copy()->subDays(30))->count(),
                'new_users_90_days' => User::where('created_at', '>=', $now->copy()->subDays(90))->count(),
                'new_users_year' => User::where('created_at', '>=', $now->copy()->subYear())->count(),
                'recently_active' => User::where('updated_at', '>=', $now->copy()->subDays(7))->count(),
            ];
            
            // User status ratios and health metrics
            $statusRatio = [
                'active_percentage' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0,
                'inactive_percentage' => $totalUsers > 0 ? round(($inactiveUsers / $totalUsers) * 100, 1) : 0,
                'deleted_percentage' => $totalUsers > 0 ? round(($deletedUsers / $totalUsers) * 100, 1) : 0,
            ];
            
            // User growth analytics
            $previousMonthUsers = User::withTrashed()->where('created_at', '<', $now->copy()->startOfMonth())->count();
            $currentMonthUsers = User::withTrashed()->where('created_at', '>=', $now->copy()->startOfMonth())->count();
            $userGrowthRate = $previousMonthUsers > 0 ? round((($currentMonthUsers / $previousMonthUsers) * 100), 1) : 0;
            
            // Security and compliance metrics
            $securityMetrics = [
                'users_with_roles' => User::whereHas('roles')->count(),
                'users_without_roles' => User::whereDoesntHave('roles')->count(),
                'admin_users' => User::whereHas('roles', function($q) {
                    $q->where('name', 'like', '%admin%');
                })->count(),
                'regular_users' => User::whereHas('roles', function($q) {
                    $q->where('name', 'not like', '%admin%');
                })->count(),
            ];
            
            // System health indicators
            $systemHealth = [
                'user_activation_rate' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0,
                'role_coverage' => $totalUsers > 0 ? round(($securityMetrics['users_with_roles'] / $totalUsers) * 100, 1) : 0,
                'department_coverage' => $totalUsers > 0 ? round((User::whereNotNull('department_id')->count() / $totalUsers) * 100, 1) : 0,
            ];
            
            // Compile comprehensive user management stats
            $stats = [
                // Basic overview
                'overview' => [
                    'total_users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'inactive_users' => $inactiveUsers,
                    'deleted_users' => $deletedUsers,
                    'total_roles' => $roleCount,
                    'total_departments' => Department::count(),
                ],
                
                // Distribution analytics
                'distribution' => [
                    'by_role' => $rolesWithUsers,
                    'by_department' => $departmentStats,
                    'by_status' => [
                        ['name' => 'Active', 'count' => $activeUsers, 'percentage' => $statusRatio['active_percentage']],
                        ['name' => 'Inactive', 'count' => $inactiveUsers, 'percentage' => $statusRatio['inactive_percentage']],
                        ['name' => 'Deleted', 'count' => $deletedUsers, 'percentage' => $statusRatio['deleted_percentage']],
                    ],
                ],
                
                // Activity and engagement
                'activity' => [
                    'recent_registrations' => $recentActivity,
                    'user_growth_rate' => $userGrowthRate,
                    'current_month_registrations' => $currentMonthUsers,
                ],
                
                // Security and access control
                'security' => [
                    'access_metrics' => $securityMetrics,
                    'role_distribution' => $rolesWithUsers,
                ],
                
                // System health
                'health' => [
                    'status_ratio' => $statusRatio,
                    'system_metrics' => $systemHealth,
                ],
                
                // Quick dashboard metrics
                'quick_metrics' => [
                    'total_users' => $totalUsers,
                    'active_ratio' => $statusRatio['active_percentage'],
                    'role_diversity' => $roleCount,
                    'department_diversity' => Department::count(),
                    'recent_activity' => $recentActivity['new_users_30_days'],
                    'system_health_score' => round(($systemHealth['user_activation_rate'] + $systemHealth['role_coverage'] + $systemHealth['department_coverage']) / 3, 1),
                ]
            ];

            return response()->json([
                'stats' => $stats,
                'meta' => [
                    'generated_at' => now()->toISOString(),
                    'currency' => 'users',
                    'period' => 'current'
                ]
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while retrieving user statistics.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Paginate employees for the employee list page
     */
    public function paginateEmployees(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Extract filter parameters
            $perPage = $request->input('perPage', 10);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            $department = $request->input('department');
            $designation = $request->input('designation');
            $attendanceType = $request->input('attendanceType');

            // Start building the query - use withTrashed to include inactive employees
            $query = User::with(['department', 'designation', 'attendanceType']);
            
            // Apply filters
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%");
                });
            }

            if (!empty($department) && $department !== 'all') {
                $query->where('department', $department);
            }

            if (!empty($designation) && $designation !== 'all') {
                $query->where('designation', $designation);
            }

            if (!empty($attendanceType) && $attendanceType !== 'all') {
                $query->where('attendance_type_id', $attendanceType);
            }

            // Execute query with pagination
            $employees = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform employee data to include department and designation names
            $transformedEmployees = $employees->map(function($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'phone' => $employee->phone,
                    'employee_id' => $employee->employee_id,
                    'profile_image' => $employee->profile_image,
                    'active' => $employee->active,
                    // Include both ID and full name for department
                    'department' => $employee->department,
                    // Include both ID and name for designation
                    'designation' => $employee->designation,
                    
                    // Include attendance type
                    'attendance_type_id' => $employee->attendance_type_id,
                    'attendance_type' => $employee->attendanceType ? $employee->attendanceType->name : null,
                    'created_at' => $employee->created_at,
                    'updated_at' => $employee->updated_at,
                ];
            });

            // Replace the items in the paginator with the transformed items
            $employees->setCollection($transformedEmployees);

            // Get stats
            $stats = [
                'total' => User::count(),
                'active' => User::where('active', 1)->count(),
                'inactive' => User::where('active', 0)->count(),
                'departments' => Department::count(),
                'designations' => Designation::count(),
            ];

            return response()->json([
                'employees' => $employees, // This includes pagination metadata
                'stats' => $stats,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while retrieving employee data.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get employee statistics - Industry standard HR metrics
     */
    public function employeeStats(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Basic employee counts
            $totalEmployees = User::count();
            $activeEmployees = User::where('active', 1)->count();
            $inactiveEmployees = User::where('active', 0)->count();
            
            // Department and designation counts
            $departmentCount = Department::count();
            $designationCount = Designation::count();
            
            // Attendance type distribution
            $attendanceTypeStats = AttendanceType::withCount('users')
                ->where('is_active', true)
                ->get()
                ->map(function ($type) {
                    return [
                        'name' => $type->name,
                        'count' => $type->users_count,
                        'percentage' => $type->users_count > 0 ? round(($type->users_count / User::count()) * 100, 1) : 0
                    ];
                });
            
            // Department-wise employee distribution
            $departmentStats = Department::withCount('users')
                ->get()
                ->map(function ($dept) {
                    return [
                        'name' => $dept->name,
                        'count' => $dept->users_count,
                        'percentage' => $dept->users_count > 0 ? round(($dept->users_count / User::count()) * 100, 1) : 0
                    ];
                });
            
            // Designation-wise employee distribution
            $designationStats = Designation::withCount('users')
                ->get()
                ->map(function ($desig) {
                    return [
                        'name' => $desig->title,
                        'count' => $desig->users_count,
                        'percentage' => $desig->users_count > 0 ? round(($desig->users_count / User::count()) * 100, 1) : 0
                    ];
                });
            
            // Recent hiring trends (last 30, 90, 365 days)
            $now = now();
            $recentHires = [
                'last_30_days' => User::where('created_at', '>=', $now->copy()->subDays(30))->count(),
                'last_90_days' => User::where('created_at', '>=', $now->copy()->subDays(90))->count(),
                'last_year' => User::where('created_at', '>=', $now->copy()->subYear())->count(),
            ];
            
            // Employee status ratios
            $statusRatio = [
                'active_percentage' => $totalEmployees > 0 ? round(($activeEmployees / $totalEmployees) * 100, 1) : 0,
                'inactive_percentage' => $totalEmployees > 0 ? round(($inactiveEmployees / $totalEmployees) * 100, 1) : 0,
                'retention_rate' => $totalEmployees > 0 ? round(($activeEmployees / $totalEmployees) * 100, 1) : 0,
            ];
            
            // Growth metrics
            $previousMonthCount = User::where('created_at', '<', $now->copy()->startOfMonth())->count();
            $currentMonthHires = User::where('created_at', '>=', $now->copy()->startOfMonth())->count();
            $growthRate = $previousMonthCount > 0 ? round((($currentMonthHires / $previousMonthCount) * 100), 1) : 0;
            
            // Compile comprehensive stats
            $stats = [
                // Basic counts
                'overview' => [
                    'total_employees' => $totalEmployees,
                    'active_employees' => $activeEmployees,
                    'inactive_employees' => $inactiveEmployees,
                    'total_departments' => $departmentCount,
                    'total_designations' => $designationCount,
                    'total_attendance_types' => AttendanceType::where('is_active', true)->count(),
                ],
                
                // Distribution analytics
                'distribution' => [
                    'by_department' => $departmentStats,
                    'by_designation' => $designationStats,
                    'by_attendance_type' => $attendanceTypeStats,
                ],
                
                // Hiring trends
                'hiring_trends' => [
                    'recent_hires' => $recentHires,
                    'monthly_growth_rate' => $growthRate,
                    'current_month_hires' => $currentMonthHires,
                ],
                
                // Status and retention metrics
                'workforce_health' => [
                    'status_ratio' => $statusRatio,
                    'retention_rate' => $statusRatio['retention_rate'],
                    'turnover_rate' => 100 - $statusRatio['retention_rate'],
                ],
                
                // Quick metrics for dashboard
                'quick_metrics' => [
                    'headcount' => $totalEmployees,
                    'active_ratio' => $statusRatio['active_percentage'],
                    'department_diversity' => $departmentCount,
                    'role_diversity' => $designationCount,
                    'recent_activity' => $recentHires['last_30_days'],
                ]
            ];

            return response()->json([
                'stats' => $stats,
                'meta' => [
                    'generated_at' => now()->toISOString(),
                    'currency' => 'employees',
                    'period' => 'current'
                ]
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while retrieving employee statistics.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
