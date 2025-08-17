<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;
use App\Models\PlatformUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SuperAdminDashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display the super admin dashboard
     */
    public function index()
    {
        $user = Auth::user();
        
        // Ensure user is super admin (either PlatformUser or User with is_super_admin)
        if (!$user) {
            abort(403, 'Access denied. Authentication required.');
        }
        
        $isSuperAdmin = false;
        if ($user instanceof PlatformUser) {
            $isSuperAdmin = $user->isSuperAdmin();
        } elseif (isset($user->is_super_admin)) {
            $isSuperAdmin = $user->is_super_admin;
        }
        
        if (!$isSuperAdmin) {
            abort(403, 'Access denied. Super Admin privileges required.');
        }

        // Get platform statistics
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'total_platform_users' => DB::table('platform_users')->count(),
            'recent_tenants' => Tenant::latest()->take(5)->get(['id', 'name', 'created_at']),
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_super_admin' => true,
                ],
                'roles' => ['Super Administrator'],
                'permissions' => $this->getSuperAdminPermissions(),
            ]
        ]);
    }

    /**
     * Get super admin permissions for the layout
     */
    private function getSuperAdminPermissions()
    {
        return [
            'admin.dashboard.view',
            'admin.tenants.view',
            'admin.tenants.create',
            'admin.tenants.edit',
            'admin.tenants.delete',
            'admin.users.view',
            'admin.users.create', 
            'admin.users.edit',
            'admin.users.delete',
            'admin.settings.view',
            'admin.settings.edit',
            'admin.analytics.view',
            'admin.system.view',
        ];
    }

    /**
     * Display analytics page
     */
    public function analytics()
    {
        $user = Auth::user();
        
        if (!$user) {
            abort(403, 'Access denied. Authentication required.');
        }
        
        $isSuperAdmin = false;
        if ($user instanceof PlatformUser) {
            $isSuperAdmin = $user->isSuperAdmin();
        } elseif (isset($user->is_super_admin)) {
            $isSuperAdmin = $user->is_super_admin;
        }
        
        if (!$isSuperAdmin) {
            abort(403, 'Access denied. Super Admin privileges required.');
        }

        return Inertia::render('SuperAdmin/Analytics', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_super_admin' => true,
                ],
                'roles' => ['Super Administrator'],
                'permissions' => $this->getSuperAdminPermissions(),
            ]
        ]);
    }

    /**
     * Display system status page
     */
    public function systemStatus()
    {
        $user = Auth::user();
        
        if (!$user) {
            abort(403, 'Access denied. Authentication required.');
        }
        
        $isSuperAdmin = false;
        if ($user instanceof PlatformUser) {
            $isSuperAdmin = $user->isSuperAdmin();
        } elseif (isset($user->is_super_admin)) {
            $isSuperAdmin = $user->is_super_admin;
        }
        
        if (!$isSuperAdmin) {
            abort(403, 'Access denied. Super Admin privileges required.');
        }

        return Inertia::render('SuperAdmin/SystemStatus', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_super_admin' => true,
                ],
                'roles' => ['Super Administrator'],
                'permissions' => $this->getSuperAdminPermissions(),
            ]
        ]);
    }
}
