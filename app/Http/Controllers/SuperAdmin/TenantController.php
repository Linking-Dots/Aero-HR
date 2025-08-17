<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Domain;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TenantController extends Controller
{
    protected TenantService $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->middleware(['auth', 'role:Super Administrator']);
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of tenants
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        
        $tenants = Tenant::with(['domains'])
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('id', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();
        
        $stats = [
            'total' => Tenant::count(),
            'active' => Tenant::where('status', 'active')->count(),
            'suspended' => Tenant::where('status', 'suspended')->count(),
        ];

        return Inertia::render('SuperAdmin/Tenants/Index', [
            'tenants' => $tenants,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status
            ]
        ]);
    }

    /**
     * Show the form for creating a new tenant
     */
    public function create()
    {
        return Inertia::render('SuperAdmin/Tenants/Create');
    }

    /**
     * Store a newly created tenant
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:domains,domain',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email', // Check in central database
            'owner_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Create tenant using service
            $tenant = $this->tenantService->createTenant([
                'name' => $request->name,
                'domain' => $request->domain,
                'settings' => []
            ]);

            DB::commit();

            return redirect()->route('superadmin.tenants.show', $tenant)
                ->with('success', 'Tenant created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Tenant creation failed: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Failed to create tenant: ' . $e->getMessage()])
                        ->withInput();
        }
    }

    /**
     * Display the specified tenant
     */
    public function show(Tenant $tenant)
    {
        $tenant->load(['domains']);
        
        $stats = $this->tenantService->getTenantStats($tenant);

        return Inertia::render('SuperAdmin/Tenants/Show', [
            'tenant' => $tenant,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for editing the specified tenant
     */
    public function edit(Tenant $tenant)
    {
        $tenant->load(['domains']);

        return Inertia::render('SuperAdmin/Tenants/Edit', [
            'tenant' => $tenant
        ]);
    }

    /**
     * Update the specified tenant
     */
    public function update(Request $request, Tenant $tenant)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,suspended,inactive',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $updated = $this->tenantService->updateTenant($tenant, [
                'name' => $request->name,
                'status' => $request->status,
                'settings' => $request->settings ?? []
            ]);

            if ($updated) {
                return redirect()->route('superadmin.tenants.show', $tenant)
                    ->with('success', 'Tenant updated successfully!');
            } else {
                return back()->withErrors(['error' => 'Failed to update tenant']);
            }

        } catch (\Exception $e) {
            Log::error('Tenant update failed: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Failed to update tenant: ' . $e->getMessage()])
                        ->withInput();
        }
    }

    /**
     * Remove the specified tenant
     */
    public function destroy(Tenant $tenant)
    {
        try {
            $deleted = $this->tenantService->deleteTenant($tenant);

            if ($deleted) {
                return redirect()->route('superadmin.tenants.index')
                    ->with('success', 'Tenant deleted successfully!');
            } else {
                return back()->withErrors(['error' => 'Failed to delete tenant']);
            }

        } catch (\Exception $e) {
            Log::error('Tenant deletion failed: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Failed to delete tenant: ' . $e->getMessage()]);
        }
    }

    /**
     * Suspend tenant
     */
    public function suspend(Tenant $tenant)
    {
        try {
            $updated = $this->tenantService->updateTenant($tenant, [
                'status' => 'suspended'
            ]);

            if ($updated) {
                return back()->with('success', 'Tenant suspended successfully!');
            } else {
                return back()->withErrors(['error' => 'Failed to suspend tenant']);
            }

        } catch (\Exception $e) {
            Log::error('Tenant suspension failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to suspend tenant']);
        }
    }

    /**
     * Reactivate tenant
     */
    public function reactivate(Tenant $tenant)
    {
        try {
            $updated = $this->tenantService->updateTenant($tenant, [
                'status' => 'active'
            ]);

            if ($updated) {
                return back()->with('success', 'Tenant reactivated successfully!');
            } else {
                return back()->withErrors(['error' => 'Failed to reactivate tenant']);
            }

        } catch (\Exception $e) {
            Log::error('Tenant reactivation failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to reactivate tenant']);
        }
    }
}