<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UsageTrackingService
{
    /**
     * Get current usage for tenant
     */
    public function getCurrentUsage(Tenant $tenant): array
    {
        return [
            'employees' => $this->getEmployeeCount(),
            'storage_used' => $this->getStorageUsage(),
            'api_calls' => $this->getApiCallsThisMonth(),
            'projects' => $this->getProjectCount(),
            'departments' => $this->getDepartmentCount(),
        ];
    }

    /**
     * Get usage percentages against plan limits
     */
    public function getUsagePercentages(Tenant $tenant, ?Plan $plan): array
    {
        if (!$plan || !$plan->limits) {
            return [];
        }

        $usage = $this->getCurrentUsage($tenant);
        $percentages = [];

        foreach ($plan->limits as $limitType => $limitValue) {
            if (isset($usage[$limitType]) && $limitValue > 0) {
                $percentages[$limitType] = min(100, ($usage[$limitType] / $limitValue) * 100);
            }
        }

        return $percentages;
    }

    /**
     * Check if tenant is within plan limits
     */
    public function isWithinLimits(Tenant $tenant, Plan $plan, string $limitType, int $additionalUsage = 1): bool
    {
        $limit = $plan->getLimit($limitType);
        
        // No limit means unlimited
        if ($limit === null) {
            return true;
        }

        $currentUsage = $this->getCurrentUsageByType($limitType);
        return ($currentUsage + $additionalUsage) <= $limit;
    }

    /**
     * Get employee count
     */
    private function getEmployeeCount(): int
    {
        try {
            return User::where('status', 'active')
                ->whereHas('roles', function ($query) {
                    $query->where('name', '!=', 'Super Admin');
                })
                ->count();
        } catch (\Exception $e) {
            Log::warning("Could not count employees: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get storage usage in bytes
     */
    private function getStorageUsage(): int
    {
        try {
            $storageSize = 0;
            
            // Calculate media library storage if exists
            if (class_exists(\Spatie\MediaLibrary\MediaCollections\Models\Media::class)) {
                $storageSize = \Spatie\MediaLibrary\MediaCollections\Models\Media::sum('size');
            }
            
            // Add document storage if applicable
            if (class_exists(\App\Models\DMS\Document::class)) {
                $storageSize += \App\Models\DMS\Document::sum('file_size');
            }
            
            return $storageSize ?: 0;
        } catch (\Exception $e) {
            Log::warning("Could not calculate storage usage: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get API calls this month
     */
    private function getApiCallsThisMonth(): int
    {
        try {
            // This would typically come from an API usage tracking table
            // For now, return a placeholder or implement based on your API logging
            if (DB::getSchemaBuilder()->hasTable('api_usage_logs')) {
                return DB::table('api_usage_logs')
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->count();
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::warning("Could not count API calls: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get project count
     */
    private function getProjectCount(): int
    {
        try {
            if (class_exists(\App\Models\Project::class)) {
                return \App\Models\Project::where('status', '!=', 'archived')->count();
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::warning("Could not count projects: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get department count
     */
    private function getDepartmentCount(): int
    {
        try {
            if (class_exists(\App\Models\HRM\Department::class)) {
                return \App\Models\HRM\Department::where('status', 'active')->count();
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::warning("Could not count departments: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get current usage by type
     */
    private function getCurrentUsageByType(string $type): int
    {
        switch ($type) {
            case 'employees':
                return $this->getEmployeeCount();
            case 'storage':
                return $this->getStorageUsage();
            case 'api_calls':
                return $this->getApiCallsThisMonth();
            case 'projects':
                return $this->getProjectCount();
            case 'departments':
                return $this->getDepartmentCount();
            default:
                return 0;
        }
    }

    /**
     * Track API usage
     */
    public function trackApiUsage(string $endpoint, string $method, ?User $user = null): void
    {
        try {
            if (DB::getSchemaBuilder()->hasTable('api_usage_logs')) {
                DB::table('api_usage_logs')->insert([
                    'endpoint' => $endpoint,
                    'method' => $method,
                    'user_id' => $user?->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'created_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            Log::warning("Could not track API usage: " . $e->getMessage());
        }
    }

    /**
     * Get usage summary for dashboard
     */
    public function getUsageSummary(Tenant $tenant): array
    {
        $usage = $this->getCurrentUsage($tenant);
        
        return [
            'total_employees' => $usage['employees'],
            'active_projects' => $this->getActiveProjectCount(),
            'total_departments' => $usage['departments'],
            'storage_used_mb' => round($usage['storage_used'] / (1024 * 1024), 2),
            'api_calls_this_month' => $usage['api_calls'],
            'attendance_today' => $this->getTodayAttendanceCount(),
            'pending_leave_requests' => $this->getPendingLeaveRequestsCount(),
        ];
    }

    /**
     * Get active project count
     */
    private function getActiveProjectCount(): int
    {
        try {
            if (class_exists(\App\Models\Project::class)) {
                return \App\Models\Project::where('status', 'active')->count();
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::warning("Could not count active projects: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get today's attendance count
     */
    private function getTodayAttendanceCount(): int
    {
        try {
            if (class_exists(\App\Models\HRM\Attendance::class)) {
                return \App\Models\HRM\Attendance::whereDate('date', today())->count();
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::warning("Could not count today's attendance: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get pending leave requests count
     */
    private function getPendingLeaveRequestsCount(): int
    {
        try {
            if (class_exists(\App\Models\HRM\Leave::class)) {
                return \App\Models\HRM\Leave::where('status', 'pending')->count();
            }
            
            return 0;
        } catch (\Exception $e) {
            Log::warning("Could not count pending leave requests: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get recent activity for tenant
     */
    public function getRecentActivity(Tenant $tenant, int $limit = 10): array
    {
        $activities = [];

        try {
            // Get recent user logins
            if (DB::getSchemaBuilder()->hasTable('activity_log')) {
                $recentLogins = DB::table('activity_log')
                    ->where('description', 'logged in')
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get()
                    ->map(function ($activity) {
                        return [
                            'description' => 'User logged in',
                            'created_at' => $activity->created_at,
                            'type' => 'login'
                        ];
                    });
                    
                $activities = array_merge($activities, $recentLogins->toArray());
            }

            // Get recent project activities
            if (class_exists(\App\Models\Project::class)) {
                $recentProjects = \App\Models\Project::latest()
                    ->limit(5)
                    ->get()
                    ->map(function ($project) {
                        return [
                            'description' => "Project '{$project->name}' was created",
                            'created_at' => $project->created_at,
                            'type' => 'project'
                        ];
                    });
                    
                $activities = array_merge($activities, $recentProjects->toArray());
            }

            // Sort by created_at and limit
            usort($activities, function ($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            return array_slice($activities, 0, $limit);
        } catch (\Exception $e) {
            Log::warning("Could not fetch recent activity: " . $e->getMessage());
            return [];
        }
    }
}
