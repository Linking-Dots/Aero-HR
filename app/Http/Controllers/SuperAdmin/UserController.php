<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\TenantUser;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:Super Administrator']);
    }

    /**
     * Display a listing of users across all tenants
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $tenant = $request->get('tenant');
        $status = $request->get('status');
        
        $users = TenantUser::with(['tenant'])
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($tenant, function ($query, $tenant) {
                return $query->where('tenant_id', $tenant);
            })
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        
        $stats = [
            'total' => TenantUser::count(),
            'active' => TenantUser::where('status', 'active')->count(),
            'owners' => TenantUser::where('is_owner', true)->count(),
            'recent_logins' => TenantUser::where('last_login_at', '>=', now()->subDays(7))->count(),
        ];

        return Inertia::render('SuperAdmin/Users/Index', [
            'users' => $users,
            'tenants' => $tenants,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'tenant' => $tenant,
                'status' => $status,
            ]
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        $tenants = Tenant::where('status', 'active')->orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('SuperAdmin/Users/Create', [
            'tenants' => $tenants
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:tenant_users,email',
            'password' => 'required|string|min:8|confirmed',
            'status' => 'required|in:active,inactive,suspended',
            'is_owner' => 'boolean'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $user = TenantUser::create([
                'tenant_id' => $request->tenant_id,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
                'status' => $request->status,
                'is_owner' => $request->boolean('is_owner', false)
            ]);

            return redirect()->route('superadmin.users.show', $user)
                ->with('success', 'User created successfully!');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['general' => 'Failed to create user: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified user
     */
    public function show(TenantUser $user)
    {
        $user->load(['tenant']);
        
        $stats = [
            'last_login' => $user->last_login_at,
            'total_logins' => $user->login_count ?? 0,
            'account_age' => $user->created_at->diffForHumans(),
            'password_updated' => $user->password_updated_at ?? $user->created_at,
        ];

        // Get recent activity (placeholder - implement based on your logging system)
        $recentActivity = collect([
            [
                'action' => 'login',
                'timestamp' => now()->subHours(2),
                'ip_address' => '192.168.1.1'
            ],
            [
                'action' => 'profile_updated',
                'timestamp' => now()->subDays(1),
                'details' => 'Updated profile information'
            ]
        ]);

        return Inertia::render('SuperAdmin/Users/Show', [
            'user' => $user,
            'stats' => $stats,
            'recentActivity' => $recentActivity
        ]);
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(TenantUser $user)
    {
        $user->load(['tenant']);
        $tenants = Tenant::where('status', 'active')->orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('SuperAdmin/Users/Edit', [
            'user' => $user,
            'tenants' => $tenants
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, TenantUser $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:tenant_users,email,' . $user->id,
            'status' => 'required|in:active,inactive,suspended',
            'is_owner' => 'boolean',
            'password' => 'nullable|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'status' => $request->status,
                'is_owner' => $request->boolean('is_owner', false)
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
                $updateData['password_updated_at'] = now();
            }

            $user->update($updateData);

            return redirect()->route('superadmin.users.show', $user)
                ->with('success', 'User updated successfully!');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['general' => 'Failed to update user: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy(TenantUser $user)
    {
        try {
            // Check if user is the only owner of their tenant
            if ($user->is_owner) {
                $ownerCount = TenantUser::where('tenant_id', $user->tenant_id)
                    ->where('is_owner', true)
                    ->count();
                
                if ($ownerCount === 1) {
                    return back()->withErrors([
                        'general' => 'Cannot delete the only owner of a tenant. Please assign ownership to another user first.'
                    ]);
                }
            }

            $user->delete();

            return redirect()->route('superadmin.users.index')
                ->with('success', 'User deleted successfully!');

        } catch (\Exception $e) {
            return back()->withErrors([
                'general' => 'Failed to delete user: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Suspend a user
     */
    public function suspend(TenantUser $user)
    {
        try {
            $user->update(['status' => 'suspended']);
            
            return response()->json([
                'success' => true,
                'message' => 'User suspended successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to suspend user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate a user
     */
    public function activate(TenantUser $user)
    {
        try {
            $user->update(['status' => 'active']);
            
            return response()->json([
                'success' => true,
                'message' => 'User activated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Force password reset for a user
     */
    public function forcePasswordReset(TenantUser $user)
    {
        try {
            // Generate a temporary password
            $tempPassword = Str::random(12);
            
            $user->update([
                'password' => Hash::make($tempPassword),
                'password_updated_at' => now(),
                'force_password_change' => true
            ]);
            
            // In a real application, you would send this via email
            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully',
                'temporary_password' => $tempPassword
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user analytics
     */
    public function analytics()
    {
        // User registration trends
        $registrationData = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = TenantUser::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $registrationData->push([
                'month' => $date->format('M Y'),
                'registrations' => $count
            ]);
        }

        // Activity statistics
        $activityStats = [
            'daily_active' => TenantUser::where('last_login_at', '>=', now()->subDay())->count(),
            'weekly_active' => TenantUser::where('last_login_at', '>=', now()->subWeek())->count(),
            'monthly_active' => TenantUser::where('last_login_at', '>=', now()->subMonth())->count(),
        ];

        // Status distribution
        $statusDistribution = TenantUser::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'count' => $item->count,
                    'percentage' => round(($item->count / TenantUser::count()) * 100, 1)
                ];
            });

        return response()->json([
            'registration_trend' => $registrationData,
            'activity_stats' => $activityStats,
            'status_distribution' => $statusDistribution
        ]);
    }

    /**
     * Export users data
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        
        $users = TenantUser::with(['tenant'])
            ->select([
                'name', 'email', 'status', 'is_owner', 
                'created_at', 'last_login_at', 'tenant_id'
            ])
            ->get()
            ->map(function ($user) {
                return [
                    'Name' => $user->name,
                    'Email' => $user->email,
                    'Status' => ucfirst($user->status),
                    'Is Owner' => $user->is_owner ? 'Yes' : 'No',
                    'Tenant' => $user->tenant->name ?? 'N/A',
                    'Created At' => $user->created_at->format('Y-m-d H:i:s'),
                    'Last Login' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Never'
                ];
            });

        if ($format === 'csv') {
            $filename = 'users_export_' . now()->format('Y_m_d_H_i_s') . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ];

            $callback = function () use ($users) {
                $file = fopen('php://output', 'w');
                
                // Add CSV headers
                if ($users->isNotEmpty()) {
                    fputcsv($file, array_keys($users->first()));
                }
                
                // Add data rows
                foreach ($users as $user) {
                    fputcsv($file, $user);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json(['error' => 'Unsupported export format'], 400);
    }
}
