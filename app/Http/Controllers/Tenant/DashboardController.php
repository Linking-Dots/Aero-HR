<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use App\Services\UsageTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stancl\Tenancy\Facades\Tenancy;

class DashboardController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService,
        private UsageTrackingService $usageService
    ) {}

    /**
     * Show tenant dashboard
     */
    public function index()
    {
        $tenant = Tenancy::tenant();
        $subscription = $tenant->subscription()->with('plan')->first();
        
        // Get usage statistics
        $usage = $this->usageService->getCurrentUsage($tenant);
        $usagePercentages = $this->usageService->getUsagePercentages($tenant, $subscription?->plan);
        
        // Get plan limits
        $planLimits = $subscription && $subscription->plan ? [
            'max_employees' => $subscription->plan->getLimit('employees'),
            'max_storage' => $subscription->plan->getLimit('storage') ? 
                round($subscription->plan->getLimit('storage') / (1024 * 1024)) . ' MB' : 'Unlimited',
            'max_projects' => $subscription->plan->getLimit('projects'),
            'max_api_calls' => $subscription->plan->getLimit('api_calls')
        ] : null;

        // Get quick stats for dashboard
        $quickStats = $this->usageService->getUsageSummary($tenant);
        
        // Get recent activity
        $recentActivity = $this->usageService->getRecentActivity($tenant, 10);

        return Inertia::render('Dashboard/Index', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'domain' => $tenant->domain,
                'status' => $tenant->status,
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at?->toISOString(),
                'current_period_end' => $subscription->current_period_end?->toISOString(),
                'plan' => $subscription->plan ? [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'price' => $subscription->plan->price,
                    'billing_cycle' => $subscription->plan->billing_cycle
                ] : null
            ] : null,
            'usage' => $usage,
            'planLimits' => $planLimits,
            'usagePercentages' => $usagePercentages,
            'quickStats' => $quickStats,
            'recentActivity' => $recentActivity
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        $tenant = Tenancy::tenant();
        $subscription = $tenant->subscription;
        
        return response()->json([
            'usage' => $this->usageService->getCurrentUsage($tenant),
            'quick_stats' => $this->usageService->getUsageSummary($tenant),
            'subscription_status' => $subscription?->status,
        ]);
    }
}
