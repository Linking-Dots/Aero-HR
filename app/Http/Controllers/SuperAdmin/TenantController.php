<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class TenantController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:Super Administrator']);
    }

    /**
     * Display a listing of tenants
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        $plan = $request->get('plan');
        
        $tenants = Tenant::with(['plan'])
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('domain', 'like', "%{$search}%")
                      ->orWhere('id', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($plan, function ($query, $plan) {
                return $query->where('plan_id', $plan);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $plans = Plan::where('is_active', true)->get();
        
        $stats = [
            'total' => Tenant::count(),
            'active' => Tenant::where('status', 'active')->count(),
            'trial' => Tenant::where('trial_ends_at', '>', now())->count(),
            'suspended' => Tenant::where('status', 'suspended')->count(),
        ];

        return Inertia::render('SuperAdmin/Tenants/Index', [
            'tenants' => $tenants,
            'plans' => $plans,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'plan' => $plan,
            ]
        ]);
    }

    /**
     * Show the form for creating a new tenant
     */
    public function create()
    {
        $plans = Plan::where('is_active', true)->get();
        
        return Inertia::render('SuperAdmin/Tenants/Create', [
            'plans' => $plans
        ]);
    }

    /**
     * Store a newly created tenant
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:63|regex:/^[a-zA-Z0-9-]+$/|unique:tenants,domain',
            'plan_id' => 'required|exists:plans,id',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:tenant_users,email',
            'owner_password' => 'required|string|min:8|confirmed',
            'status' => 'required|in:active,suspended,trial',
            'trial_days' => 'nullable|integer|min:0|max:365'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();
        
        try {
            $plan = Plan::findOrFail($request->plan_id);
            
            // Create tenant
            $tenant = Tenant::create([
                'id' => Str::uuid(),
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'domain' => $request->domain,
                'database_name' => 'tenant_' . $request->domain,
                'plan_id' => $request->plan_id,
                'status' => $request->status,
                'trial_ends_at' => $request->trial_days ? 
                    Carbon::now()->addDays($request->trial_days) : null,
                'settings' => [
                    'created_by_admin' => true,
                    'created_at' => now()
                ]
            ]);

            // Create domain
            $tenant->domains()->create([
                'domain' => $request->domain . '.' . config('app.domain_suffix', 'aero-hr.com')
            ]);

            // Create tenant owner
            $tenantUser = TenantUser::create([
                'tenant_id' => $tenant->id,
                'name' => $request->owner_name,
                'email' => $request->owner_email,
                'password' => Hash::make($request->owner_password),
                'email_verified_at' => now(),
                'status' => 'active',
                'is_owner' => true
            ]);

            // Initialize tenant database and default data
            $this->initializeTenantDatabase($tenant);

            DB::commit();

            return redirect()->route('superadmin.tenants.show', $tenant)
                ->with('success', 'Tenant created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()
                ->withErrors(['general' => 'Failed to create tenant: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified tenant
     */
    public function show(Tenant $tenant)
    {
        $tenant->load(['plan']);
        
        $users = TenantUser::where('tenant_id', $tenant->id)
            ->latest()
            ->paginate(10);
        
        $stats = [
            'users_count' => TenantUser::where('tenant_id', $tenant->id)->count(),
            'active_users' => TenantUser::where('tenant_id', $tenant->id)
                ->where('status', 'active')->count(),
            'last_login' => TenantUser::where('tenant_id', $tenant->id)
                ->latest('last_login_at')->first()?->last_login_at,
            'storage_used' => $this->getTenantStorageUsage($tenant),
            'database_size' => $this->getTenantDatabaseSize($tenant)
        ];

        return Inertia::render('SuperAdmin/Tenants/Show', [
            'tenant' => $tenant,
            'users' => $users,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for editing the specified tenant
     */
    public function edit(Tenant $tenant)
    {
        $plans = Plan::where('is_active', true)->get();
        
        return Inertia::render('SuperAdmin/Tenants/Edit', [
            'tenant' => $tenant,
            'plans' => $plans
        ]);
    }

    /**
     * Update the specified tenant
     */
    public function update(Request $request, Tenant $tenant)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'plan_id' => 'required|exists:plans,id',
            'status' => 'required|in:active,suspended,trial',
            'trial_ends_at' => 'nullable|date|after:today'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $tenant->update([
                'name' => $request->name,
                'plan_id' => $request->plan_id,
                'status' => $request->status,
                'trial_ends_at' => $request->trial_ends_at
            ]);

            return redirect()->route('superadmin.tenants.show', $tenant)
                ->with('success', 'Tenant updated successfully!');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['general' => 'Failed to update tenant: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified tenant
     */
    public function destroy(Tenant $tenant)
    {
        try {
            DB::beginTransaction();

            // Delete tenant users
            TenantUser::where('tenant_id', $tenant->id)->delete();
            
            // Delete tenant database
            $this->deleteTenantDatabase($tenant);
            
            // Delete tenant
            $tenant->delete();

            DB::commit();

            return redirect()->route('superadmin.tenants.index')
                ->with('success', 'Tenant deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'general' => 'Failed to delete tenant: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Suspend a tenant
     */
    public function suspend(Tenant $tenant)
    {
        try {
            $tenant->update(['status' => 'suspended']);
            
            return response()->json([
                'success' => true,
                'message' => 'Tenant suspended successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to suspend tenant: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate a tenant
     */
    public function activate(Tenant $tenant)
    {
        try {
            $tenant->update(['status' => 'active']);
            
            return response()->json([
                'success' => true,
                'message' => 'Tenant activated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate tenant: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tenant activity logs
     */
    public function activityLogs(Tenant $tenant)
    {
        // Implementation depends on your logging system
        // This is a placeholder
        $logs = collect([
            [
                'type' => 'login',
                'user' => 'admin@company.com',
                'timestamp' => now()->subHours(2),
                'ip' => '192.168.1.1'
            ],
            [
                'type' => 'user_created',
                'user' => 'admin@company.com',
                'timestamp' => now()->subHours(5),
                'details' => 'Created new employee: John Doe'
            ]
        ]);

        return response()->json($logs);
    }

    /**
     * Initialize tenant database with default data
     */
    private function initializeTenantDatabase($tenant)
    {
        // Switch to tenant context
        tenancy()->initialize($tenant);

        try {
            // Run migrations
            Artisan::call('migrate', [
                '--database' => 'tenant',
                '--force' => true
            ]);

            // Seed default data
            Artisan::call('db:seed', [
                '--database' => 'tenant',
                '--class' => 'TenantSeeder',
                '--force' => true
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to initialize tenant database: ' . $e->getMessage());
            throw $e;
        } finally {
            // End tenant context
            tenancy()->end();
        }
    }

    /**
     * Delete tenant database
     */
    private function deleteTenantDatabase($tenant)
    {
        try {
            $databaseName = $tenant->database_name;
            
            // Drop the database
            DB::statement("DROP DATABASE IF EXISTS `{$databaseName}`");
            
        } catch (\Exception $e) {
            Log::error('Failed to delete tenant database: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get tenant storage usage
     */
    private function getTenantStorageUsage($tenant)
    {
        // Implementation depends on your storage system
        // This is a placeholder
        return rand(10, 500) . ' MB';
    }

    /**
     * Get tenant database size
     */
    private function getTenantDatabaseSize($tenant)
    {
        try {
            $result = DB::select("
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.tables 
                WHERE table_schema = ?
            ", [$tenant->database_name]);

            return ($result[0]->size_mb ?? 0) . ' MB';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }
}
