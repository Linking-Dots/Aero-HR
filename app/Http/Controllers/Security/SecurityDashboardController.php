<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthenticationSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class SecurityDashboardController extends Controller
{
    protected AuthenticationSecurityService $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Display the security dashboard
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get security metrics
        $securityData = $this->getSecurityMetrics($user);
        $activeSessions = $this->getActiveSessions($user);
        $recentActivity = $this->getRecentActivity($user);
        
        return Inertia::render('Auth/SecurityDashboard', [
            'auth' => [
                'user' => $user
            ],
            'securityData' => $securityData,
            'activeSessions' => $activeSessions,
            'recentActivity' => $recentActivity
        ]);
    }

    /**
     * Refresh security data
     */
    public function refresh(Request $request)
    {
        $user = Auth::user();
        
        // Clear cached security data
        Cache::forget("security_metrics_{$user->id}");
        Cache::forget("active_sessions_{$user->id}");
        Cache::forget("recent_activity_{$user->id}");
        
        // Log refresh action
        $this->securityService->logSecurityEvent('security_dashboard_refresh', [
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Security data refreshed successfully',
            'data' => [
                'securityData' => $this->getSecurityMetrics($user),
                'activeSessions' => $this->getActiveSessions($user),
                'recentActivity' => $this->getRecentActivity($user)
            ]
        ]);
    }

    /**
     * Get security metrics for API calls
     */
    public function getMetrics(Request $request)
    {
        $user = Auth::user();
        
        return response()->json([
            'metrics' => $this->getSecurityMetrics($user),
            'last_updated' => now()->toISOString()
        ]);
    }

    /**
     * Get security settings
     */
    public function getSettings(Request $request)
    {
        $user = Auth::user();
        
        return response()->json([
            'settings' => [
                'emailNotifications' => $user->security_email_notifications ?? true,
                'realTimeMonitoring' => $user->real_time_monitoring ?? true,
                'sessionTimeout' => $user->session_timeout ?? 120,
                'geoLocationTracking' => $user->geo_location_tracking ?? true,
                'deviceFingerprinting' => $user->device_fingerprinting ?? true,
                'suspiciousActivityAlerts' => $user->suspicious_activity_alerts ?? true
            ]
        ]);
    }

    /**
     * Update notification settings
     */
    public function updateNotificationSettings(Request $request)
    {
        $request->validate([
            'emailNotifications' => 'boolean',
            'pushNotifications' => 'boolean',
            'smsNotifications' => 'boolean',
            'alertThreshold' => 'in:low,medium,high'
        ]);

        $user = User::find(Auth::id());
        $user->forceFill([
            'security_email_notifications' => $request->emailNotifications,
            'security_push_notifications' => $request->pushNotifications,
            'security_sms_notifications' => $request->smsNotifications,
            'security_alert_threshold' => $request->alertThreshold
        ])->save();

        $this->securityService->logSecurityEvent('notification_settings_updated', [
            'user_id' => $user->id,
            'changes' => $request->only(['emailNotifications', 'pushNotifications', 'smsNotifications', 'alertThreshold'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification settings updated successfully'
        ]);
    }

    /**
     * Update monitoring settings
     */
    public function updateMonitoringSettings(Request $request)
    {
        $request->validate([
            'realTimeMonitoring' => 'boolean',
            'geoLocationTracking' => 'boolean',
            'deviceFingerprinting' => 'boolean',
            'behavioralAnalysis' => 'boolean'
        ]);

        $user = User::find(Auth::id());
        $user->forceFill([
            'real_time_monitoring' => $request->realTimeMonitoring,
            'geo_location_tracking' => $request->geoLocationTracking,
            'device_fingerprinting' => $request->deviceFingerprinting,
            'behavioral_analysis' => $request->behavioralAnalysis
        ])->save();

        $this->securityService->logSecurityEvent('monitoring_settings_updated', [
            'user_id' => $user->id,
            'changes' => $request->only(['realTimeMonitoring', 'geoLocationTracking', 'deviceFingerprinting', 'behavioralAnalysis'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Monitoring settings updated successfully'
        ]);
    }

    /**
     * Update session timeout settings
     */
    public function updateSessionTimeout(Request $request)
    {
        $request->validate([
            'timeout' => 'integer|min:15|max:480' // 15 minutes to 8 hours
        ]);

        $user = User::find(Auth::id());
        $user->forceFill([
            'session_timeout' => $request->timeout
        ])->save();

        $this->securityService->logSecurityEvent('session_timeout_updated', [
            'user_id' => $user->id,
            'old_timeout' => $user->session_timeout,
            'new_timeout' => $request->timeout
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session timeout updated successfully'
        ]);
    }

    /**
     * Export security report
     */
    public function exportSecurityReport(Request $request)
    {
        $request->validate([
            'format' => 'in:pdf,csv,json',
            'period' => 'in:7,30,90,365',
            'includePersonalData' => 'boolean'
        ]);

        $user = Auth::user();
        $format = $request->format ?? 'pdf';
        $period = $request->period ?? 30;
        $includePersonalData = $request->includePersonalData ?? false;

        // Generate report data
        $reportData = $this->generateSecurityReport($user, $period, $includePersonalData);

        // Log export action
        $this->securityService->logSecurityEvent('security_report_exported', [
            'user_id' => $user->id,
            'format' => $format,
            'period' => $period,
            'include_personal_data' => $includePersonalData
        ]);

        switch ($format) {
            case 'pdf':
                return $this->generatePDFReport($reportData, $user);
            case 'csv':
                return $this->generateCSVReport($reportData, $user);
            case 'json':
                return response()->json($reportData);
            default:
                return response()->json(['error' => 'Invalid format'], 400);
        }
    }

    /**
     * Admin overview (for admin users only)
     */
    public function adminOverview(Request $request)
    {
        $this->authorize('manage-security');

        $overview = [
            'totalUsers' => DB::table('users')->count(),
            'activeUsers' => DB::table('user_sessions_tracking')
                ->where('last_activity', '>', now()->subMinutes(15))
                ->distinct('user_id')
                ->count(),
            'suspiciousActivities' => DB::table('security_incidents')
                ->where('status', 'open')
                ->where('created_at', '>', now()->subDay())
                ->count(),
            'failedLogins' => DB::table('failed_login_attempts')
                ->where('created_at', '>', now()->subDay())
                ->count(),
            'twoFactorAdoption' => $this->getTwoFactorAdoptionRate(),
            'securityAlerts' => $this->getActiveSecurityAlerts(),
            'complianceScore' => $this->calculateComplianceScore()
        ];

        return Inertia::render('Admin/Security/Overview', [
            'overview' => $overview
        ]);
    }

    /**
     * Get user security details (admin only)
     */
    public function getUserSecurity(Request $request, $userId)
    {
        $this->authorize('manage-security');

        $user = DB::table('users')->where('id', $userId)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $securityData = [
            'user' => $user,
            'securityMetrics' => $this->getSecurityMetrics($user),
            'activeSessions' => $this->getActiveSessions($user),
            'recentActivity' => $this->getRecentActivity($user),
            'securityIncidents' => $this->getUserSecurityIncidents($userId),
            'riskAssessment' => $this->getUserRiskAssessment($userId)
        ];

        return response()->json($securityData);
    }

    /**
     * Get security status for API
     */
    public function getSecurityStatus(Request $request)
    {
        $user = Auth::user();
        
        $status = [
            'overall_score' => $this->calculateSecurityScore($user),
            'two_factor_enabled' => !is_null($user->two_factor_confirmed_at),
            'active_sessions' => DB::table('user_sessions_tracking')
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->count(),
            'recent_suspicious_activity' => DB::table('security_incidents')
                ->where('user_id', $user->id)
                ->where('created_at', '>', now()->subHours(24))
                ->exists(),
            'password_age' => $user->password_changed_at ? 
                now()->diffInDays($user->password_changed_at) : null,
            'last_login' => $user->last_login_at,
            'risk_level' => $this->calculateUserRiskLevel($user)
        ];

        return response()->json($status);
    }

    /**
     * Get ISO 27001 compliance report
     */
    public function getISO27001Report(Request $request)
    {
        $this->authorize('manage-security');

        $report = [
            'compliance_score' => $this->calculateISO27001Score(),
            'controls' => $this->getISO27001Controls(),
            'gaps' => $this->getComplianceGaps(),
            'recommendations' => $this->getComplianceRecommendations(),
            'generated_at' => now()->toISOString()
        ];

        return response()->json($report);
    }

    /**
     * Get GDPR compliance report
     */
    public function getGDPRReport(Request $request)
    {
        $this->authorize('manage-security');

        $report = [
            'data_processing_activities' => $this->getDataProcessingActivities(),
            'user_consents' => $this->getUserConsents(),
            'data_retention_compliance' => $this->getDataRetentionCompliance(),
            'breach_notifications' => $this->getBreachNotifications(),
            'user_rights_requests' => $this->getUserRightsRequests(),
            'generated_at' => now()->toISOString()
        ];

        return response()->json($report);
    }

    // Private helper methods

    private function getSecurityMetrics($user)
    {
        return Cache::remember("security_metrics_{$user->id}", 300, function () use ($user) {
            return [
                'passwordStrength' => $this->calculatePasswordStrength($user),
                'passwordAge' => $user->password_changed_at ? 
                    now()->diffInDays($user->password_changed_at) : null,
                'twoFactorEnabled' => !is_null($user->two_factor_confirmed_at),
                'suspiciousActivity' => $this->hasSuspiciousActivity($user),
                'suspiciousActivityCount' => $this->getSuspiciousActivityCount($user),
                'secureSessionsCount' => $this->getSecureSessionsCount($user),
                'profileCompleteness' => $this->calculateProfileCompleteness($user),
                'lastSecurityUpdate' => $this->getLastSecurityUpdate($user),
                'riskScore' => $this->calculateUserRiskLevel($user),
                'complianceScore' => $this->calculateUserComplianceScore($user)
            ];
        });
    }

    private function getActiveSessions($user)
    {
        return Cache::remember("active_sessions_{$user->id}", 300, function () use ($user) {
            return DB::table('user_sessions_tracking')
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->orderBy('last_activity', 'desc')
                ->get()
                ->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'ip_address' => $session->ip_address,
                        'user_agent' => $session->user_agent,
                        'device_name' => $session->device_name,
                        'device_type' => $session->device_type,
                        'browser' => $session->browser,
                        'platform' => $session->platform,
                        'location' => json_decode($session->location_data, true),
                        'is_current' => $session->session_id === session()->getId(),
                        'last_activity' => $session->last_activity,
                        'created_at' => $session->created_at,
                        'risk_score' => $session->risk_score ?? 0,
                        'is_verified' => $session->is_verified ?? false,
                        'security_flags' => json_decode($session->security_flags, true) ?? [],
                        'request_count' => $session->request_count ?? 0,
                        'failed_login_attempts' => $session->failed_attempts ?? 0,
                        'concurrent_sessions' => $session->concurrent_sessions ?? 1
                    ];
                })
                ->toArray();
        });
    }

    private function getRecentActivity($user)
    {
        return Cache::remember("recent_activity_{$user->id}", 300, function () use ($user) {
            return DB::table('auth_audit_logs')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'type' => $activity->event_type,
                        'description' => $activity->description,
                        'ip_address' => $activity->ip_address,
                        'location' => json_decode($activity->location_data, true),
                        'risk_level' => $activity->risk_level,
                        'created_at' => $activity->created_at,
                        'user_agent' => $activity->user_agent,
                        'success' => $activity->success ?? true
                    ];
                })
                ->toArray();
        });
    }

    private function calculateSecurityScore($user)
    {
        $factors = [
            'two_factor' => !is_null($user->two_factor_confirmed_at) ? 25 : 0,
            'password_strength' => min($this->calculatePasswordStrength($user) / 10 * 20, 20),
            'recent_activity' => $this->hasSuspiciousActivity($user) ? 0 : 15,
            'session_security' => min($this->getSecureSessionsCount($user) * 10, 20),
            'profile_completeness' => min($this->calculateProfileCompleteness($user) / 100 * 20, 20)
        ];

        return min(array_sum($factors), 100);
    }

    private function calculatePasswordStrength($user)
    {
        // This would implement actual password strength calculation
        // For now, return a mock value
        return 8;
    }

    private function hasSuspiciousActivity($user)
    {
        return DB::table('security_incidents')
            ->where('user_id', $user->id)
            ->where('created_at', '>', now()->subDays(7))
            ->where('status', 'open')
            ->exists();
    }

    private function getSuspiciousActivityCount($user)
    {
        return DB::table('security_incidents')
            ->where('user_id', $user->id)
            ->where('created_at', '>', now()->subDays(30))
            ->count();
    }

    private function getSecureSessionsCount($user)
    {
        return DB::table('user_sessions_tracking')
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->where('is_verified', true)
            ->count();
    }

    private function calculateProfileCompleteness($user)
    {
        $fields = ['name', 'email', 'phone', 'address'];
        $completed = 0;
        
        foreach ($fields as $field) {
            if (!empty($user->$field)) {
                $completed++;
            }
        }
        
        return ($completed / count($fields)) * 100;
    }

    private function getLastSecurityUpdate($user)
    {
        return DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->where('event_type', 'LIKE', '%security%')
            ->orderBy('created_at', 'desc')
            ->value('created_at');
    }

    private function calculateUserRiskLevel($user)
    {
        $riskFactors = 0;
        
        // Check various risk factors
        if (is_null($user->two_factor_confirmed_at)) $riskFactors += 20;
        if ($this->hasSuspiciousActivity($user)) $riskFactors += 30;
        if ($user->password_changed_at && now()->diffInDays($user->password_changed_at) > 90) $riskFactors += 15;
        
        if ($riskFactors >= 50) return 'high';
        if ($riskFactors >= 25) return 'medium';
        return 'low';
    }

    private function calculateUserComplianceScore($user)
    {
        // Implementation for user-specific compliance scoring
        return 85; // Mock value
    }

    private function getTwoFactorAdoptionRate()
    {
        $total = DB::table('users')->count();
        $withTwoFactor = DB::table('users')->whereNotNull('two_factor_confirmed_at')->count();
        
        return $total > 0 ? ($withTwoFactor / $total) * 100 : 0;
    }

    private function getActiveSecurityAlerts()
    {
        return DB::table('security_incidents')
            ->where('status', 'open')
            ->where('severity', 'high')
            ->count();
    }

    private function calculateComplianceScore()
    {
        // Implementation for overall compliance scoring
        return 78; // Mock value
    }

    private function getUserSecurityIncidents($userId)
    {
        return DB::table('security_incidents')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
    }

    private function getUserRiskAssessment($userId)
    {
        // Implementation for detailed user risk assessment
        return [
            'overall_risk' => 'medium',
            'factors' => [
                'login_patterns' => 'normal',
                'device_diversity' => 'high',
                'geographic_spread' => 'low',
                'time_patterns' => 'normal'
            ]
        ];
    }

    private function calculateISO27001Score()
    {
        // Implementation for ISO 27001 compliance scoring
        return 85; // Mock value
    }

    private function getISO27001Controls()
    {
        // Implementation for ISO 27001 controls assessment
        return []; // Mock value
    }

    private function getComplianceGaps()
    {
        // Implementation for compliance gap analysis
        return []; // Mock value
    }

    private function getComplianceRecommendations()
    {
        // Implementation for compliance recommendations
        return []; // Mock value
    }

    private function getDataProcessingActivities()
    {
        // Implementation for GDPR data processing activities
        return []; // Mock value
    }

    private function getUserConsents()
    {
        // Implementation for user consent tracking
        return []; // Mock value
    }

    private function getDataRetentionCompliance()
    {
        // Implementation for data retention compliance
        return []; // Mock value
    }

    private function getBreachNotifications()
    {
        // Implementation for breach notification tracking
        return []; // Mock value
    }

    private function getUserRightsRequests()
    {
        // Implementation for user rights request tracking
        return []; // Mock value
    }

    private function generateSecurityReport($user, $period, $includePersonalData)
    {
        // Implementation for security report generation
        return [
            'user_id' => $user->id,
            'period' => $period,
            'generated_at' => now()->toISOString()
        ];
    }

    private function generatePDFReport($data, $user)
    {
        // Implementation for PDF report generation
        return response()->json(['message' => 'PDF generation not implemented yet']);
    }

    private function generateCSVReport($data, $user)
    {
        // Implementation for CSV report generation
        return response()->json(['message' => 'CSV generation not implemented yet']);
    }
}
