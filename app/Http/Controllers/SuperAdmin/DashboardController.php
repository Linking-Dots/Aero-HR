<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:Super Administrator']);
    }

    /**
     * Display the super admin dashboard
     */
    public function index()
    {
        // Get key metrics
        $stats = $this->getDashboardStats();
        
        // Get recent activities
        $recentTenants = Tenant::with(['plan'])->latest()->take(5)->get();
        $recentUsers = TenantUser::with(['tenant'])->latest()->take(5)->get();
        
        // Get chart data
        $chartData = $this->getChartData();
        
        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'recentUsers' => $recentUsers,
            'chartData' => $chartData,
            'user' => Auth::user()
        ]);
    }

    /**
     * Get dashboard statistics
     */
    private function getDashboardStats()
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('status', 'active')->count();
        $trialTenants = Tenant::where('trial_ends_at', '>', now())->count();
        $suspendedTenants = Tenant::where('status', 'suspended')->count();
        
        $totalUsers = TenantUser::count();
        $activeUsers = TenantUser::where('status', 'active')->count();
        
        $totalPlans = Plan::where('is_active', true)->count();
        $totalSubscriptions = Subscription::where('status', 'active')->count();
        
        // Revenue calculations (mock data - implement based on your payment system)
        $monthlyRevenue = $this->calculateMonthlyRevenue();
        $totalRevenue = $this->calculateTotalRevenue();
        
        return [
            'tenants' => [
                'total' => $totalTenants,
                'active' => $activeTenants,
                'trial' => $trialTenants,
                'suspended' => $suspendedTenants,
                'growth' => $this->calculateGrowthRate('tenants')
            ],
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'growth' => $this->calculateGrowthRate('users')
            ],
            'plans' => [
                'total' => $totalPlans,
                'subscriptions' => $totalSubscriptions
            ],
            'revenue' => [
                'monthly' => $monthlyRevenue,
                'total' => $totalRevenue,
                'growth' => $this->calculateGrowthRate('revenue')
            ]
        ];
    }

    /**
     * Get chart data for dashboard
     */
    private function getChartData()
    {
        // Get last 12 months data
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months->push([
                'month' => $date->format('M Y'),
                'tenants' => Tenant::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'users' => TenantUser::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'revenue' => $this->getMonthlyRevenue($date)
            ]);
        }

        // Plan distribution
        $planDistribution = Plan::withCount('tenants')->get()->map(function ($plan) {
            return [
                'name' => $plan->name,
                'count' => $plan->tenants_count,
                'percentage' => $plan->tenants_count > 0 ? 
                    round(($plan->tenants_count / Tenant::count()) * 100, 1) : 0
            ];
        });

        return [
            'monthly' => $months,
            'planDistribution' => $planDistribution
        ];
    }

    /**
     * Calculate growth rate for a metric
     */
    private function calculateGrowthRate($metric)
    {
        $currentMonth = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();

        switch ($metric) {
            case 'tenants':
                $current = Tenant::whereYear('created_at', $currentMonth->year)
                    ->whereMonth('created_at', $currentMonth->month)
                    ->count();
                $previous = Tenant::whereYear('created_at', $lastMonth->year)
                    ->whereMonth('created_at', $lastMonth->month)
                    ->count();
                break;
            
            case 'users':
                $current = TenantUser::whereYear('created_at', $currentMonth->year)
                    ->whereMonth('created_at', $currentMonth->month)
                    ->count();
                $previous = TenantUser::whereYear('created_at', $lastMonth->year)
                    ->whereMonth('created_at', $lastMonth->month)
                    ->count();
                break;
            
            case 'revenue':
                $current = $this->getMonthlyRevenue($currentMonth);
                $previous = $this->getMonthlyRevenue($lastMonth);
                break;
            
            default:
                return 0;
        }

        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Calculate monthly revenue (implement based on your payment system)
     */
    private function calculateMonthlyRevenue()
    {
        // This is a placeholder - implement based on your actual payment/subscription system
        return Subscription::where('status', 'active')
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('amount') ?? 0;
    }

    /**
     * Calculate total revenue (implement based on your payment system)
     */
    private function calculateTotalRevenue()
    {
        // This is a placeholder - implement based on your actual payment/subscription system
        return Subscription::where('status', 'active')->sum('amount') ?? 0;
    }

    /**
     * Get revenue for a specific month
     */
    private function getMonthlyRevenue($date)
    {
        // This is a placeholder - implement based on your actual payment/subscription system
        return Subscription::where('status', 'active')
            ->whereYear('created_at', $date->year)
            ->whereMonth('created_at', $date->month)
            ->sum('amount') ?? 0;
    }

    /**
     * Get system analytics
     */
    public function analytics()
    {
        return response()->json([
            'stats' => $this->getDashboardStats(),
            'chartData' => $this->getChartData()
        ]);
    }

    /**
     * Get real-time system status
     */
    public function systemStatus()
    {
        return response()->json([
            'database' => $this->checkDatabaseStatus(),
            'cache' => $this->checkCacheStatus(),
            'storage' => $this->checkStorageStatus(),
            'tenants' => $this->getTenantsStatus()
        ]);
    }

    private function checkDatabaseStatus()
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'healthy', 'message' => 'Database connection is working'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Database connection failed'];
        }
    }

    private function checkCacheStatus()
    {
        try {
            cache()->put('health_check', 'ok', 60);
            $value = cache()->get('health_check');
            return ['status' => $value === 'ok' ? 'healthy' : 'error', 'message' => 'Cache is working'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Cache system failed'];
        }
    }

    private function checkStorageStatus()
    {
        try {
            $freeSpace = disk_free_space(storage_path());
            $totalSpace = disk_total_space(storage_path());
            $usagePercent = round((($totalSpace - $freeSpace) / $totalSpace) * 100, 1);
            
            return [
                'status' => $usagePercent < 90 ? 'healthy' : 'warning',
                'usage' => $usagePercent,
                'message' => "Storage usage: {$usagePercent}%"
            ];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Unable to check storage'];
        }
    }

    private function getTenantsStatus()
    {
        $total = Tenant::count();
        $active = Tenant::where('status', 'active')->count();
        $issues = Tenant::where('status', '!=', 'active')->count();
        
        return [
            'total' => $total,
            'active' => $active,
            'issues' => $issues,
            'status' => $issues === 0 ? 'healthy' : 'warning'
        ];
    }
}
