<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:Super Administrator']);
    }

    /**
     * Display a listing of plans
     */
    public function index()
    {
        $plans = Plan::withCount('tenants')->orderBy('price_monthly')->get();
        
        $stats = [
            'total_plans' => Plan::count(),
            'active_plans' => Plan::where('is_active', true)->count(),
            'total_subscriptions' => Tenant::whereNotNull('plan_id')->count(),
        ];

        return Inertia::render('SuperAdmin/Plans/Index', [
            'plans' => $plans,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for creating a new plan
     */
    public function create()
    {
        return Inertia::render('SuperAdmin/Plans/Create');
    }

    /**
     * Store a newly created plan
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:plans',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'max_users' => 'required|integer|min:1',
            'max_storage_gb' => 'required|integer|min:1',
            'features' => 'required|array',
            'features.*' => 'string',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'stripe_price_id' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            Plan::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'billing_cycle' => $request->billing_cycle,
                'max_users' => $request->max_users,
                'max_storage_gb' => $request->max_storage_gb,
                'features' => $request->features,
                'is_active' => $request->boolean('is_active', true),
                'is_popular' => $request->boolean('is_popular', false),
                'stripe_price_id' => $request->stripe_price_id
            ]);

            return redirect()->route('superadmin.plans.index')
                ->with('success', 'Plan created successfully!');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['general' => 'Failed to create plan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified plan
     */
    public function show(Plan $plan)
    {
        $plan->load('tenants');
        
        $stats = [
            'subscribers' => $plan->tenants()->count(),
            'active_subscribers' => $plan->tenants()->where('status', 'active')->count(),
            'trial_subscribers' => $plan->tenants()->where('trial_ends_at', '>', now())->count(),
            'monthly_revenue' => $plan->price * $plan->tenants()->where('status', 'active')->count()
        ];

        return Inertia::render('SuperAdmin/Plans/Show', [
            'plan' => $plan,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for editing the specified plan
     */
    public function edit(Plan $plan)
    {
        return Inertia::render('SuperAdmin/Plans/Edit', [
            'plan' => $plan
        ]);
    }

    /**
     * Update the specified plan
     */
    public function update(Request $request, Plan $plan)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:plans,name,' . $plan->id,
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'max_users' => 'required|integer|min:1',
            'max_storage_gb' => 'required|integer|min:1',
            'features' => 'required|array',
            'features.*' => 'string',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'stripe_price_id' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $plan->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'billing_cycle' => $request->billing_cycle,
                'max_users' => $request->max_users,
                'max_storage_gb' => $request->max_storage_gb,
                'features' => $request->features,
                'is_active' => $request->boolean('is_active'),
                'is_popular' => $request->boolean('is_popular'),
                'stripe_price_id' => $request->stripe_price_id
            ]);

            return redirect()->route('superadmin.plans.show', $plan)
                ->with('success', 'Plan updated successfully!');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['general' => 'Failed to update plan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified plan
     */
    public function destroy(Plan $plan)
    {
        try {
            // Check if plan has active subscriptions
            if ($plan->tenants()->count() > 0) {
                return back()->withErrors([
                    'general' => 'Cannot delete plan with active subscriptions. Please migrate tenants to another plan first.'
                ]);
            }

            $plan->delete();

            return redirect()->route('superadmin.plans.index')
                ->with('success', 'Plan deleted successfully!');

        } catch (\Exception $e) {
            return back()->withErrors([
                'general' => 'Failed to delete plan: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Toggle plan active status
     */
    public function toggleStatus(Plan $plan)
    {
        try {
            $plan->update(['is_active' => !$plan->is_active]);
            
            return response()->json([
                'success' => true,
                'message' => 'Plan status updated successfully',
                'is_active' => $plan->is_active
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update plan status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle plan popular status
     */
    public function togglePopular(Plan $plan)
    {
        try {
            // If setting this plan as popular, unset others
            if (!$plan->is_popular) {
                Plan::where('id', '!=', $plan->id)->update(['is_popular' => false]);
            }
            
            $plan->update(['is_popular' => !$plan->is_popular]);
            
            return response()->json([
                'success' => true,
                'message' => 'Plan popularity updated successfully',
                'is_popular' => $plan->is_popular
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update plan popularity: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get plan analytics
     */
    public function analytics(Plan $plan)
    {
        $subscribersData = collect();
        
        // Get last 12 months subscription data
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = $plan->tenants()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $subscribersData->push([
                'month' => $date->format('M Y'),
                'subscribers' => $count,
                'revenue' => $count * $plan->price
            ]);
        }

        return response()->json([
            'subscribers_trend' => $subscribersData,
            'current_stats' => [
                'total_subscribers' => $plan->tenants()->count(),
                'active_subscribers' => $plan->tenants()->where('status', 'active')->count(),
                'monthly_revenue' => $plan->price * $plan->tenants()->where('status', 'active')->count(),
                'churn_rate' => $this->calculateChurnRate($plan)
            ]
        ]);
    }

    /**
     * Calculate churn rate for a plan
     */
    private function calculateChurnRate($plan)
    {
        $currentMonth = $plan->tenants()->where('status', 'active')->count();
        $lastMonth = $plan->tenants()
            ->where('created_at', '<', now()->startOfMonth())
            ->count();
        
        if ($lastMonth == 0) {
            return 0;
        }
        
        $churned = $lastMonth - $currentMonth;
        return round(($churned / $lastMonth) * 100, 2);
    }
}
