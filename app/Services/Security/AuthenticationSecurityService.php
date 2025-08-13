<?php

namespace App\Services\Security;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

/**
 * Enhanced Authentication Security Service
 * 
 * Provides comprehensive authentication monitoring, audit logging,
 * and security incident detection for enterprise-grade security.
 */
class AuthenticationSecurityService
{
    /**
     * Log authentication event with comprehensive context
     */
    public function logAuthEvent(string $eventType, array $context = []): void
    {
        $request = request();
        $user = Auth::user();
        
        // Get location data
        $locationData = $this->getLocationData($request->ip());
        
        // Get device fingerprint
        $deviceFingerprint = $this->generateDeviceFingerprint($request);
        
        // Detect anomalies
        $isAnomaly = $this->detectAnomalies($eventType, $user, $request, $locationData);
        
        // Determine risk level
        $riskLevel = $this->calculateRiskLevel($eventType, $context, $isAnomaly);
        
        // Create audit log entry
        DB::table('auth_audit_logs')->insert([
            'event_type' => $eventType,
            'user_id' => $user?->id,
            'email' => $context['email'] ?? $user?->email,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
            'metadata' => json_encode(array_merge($context, [
                'route' => $request->route()?->getName(),
                'method' => $request->method(),
                'referrer' => $request->header('referer'),
            ])),
            'risk_level' => $riskLevel,
            'status' => $context['status'] ?? 'success',
            'location_country' => $locationData['country'] ?? null,
            'location_city' => $locationData['city'] ?? null,
            'location_latitude' => $locationData['latitude'] ?? null,
            'location_longitude' => $locationData['longitude'] ?? null,
            'device_fingerprint' => $deviceFingerprint,
            'is_anomaly' => $isAnomaly,
            'detected_at' => now(),
            'created_at' => now()
        ]);
        
        // Log to Laravel log system for immediate visibility
        Log::channel('security')->info("AUTH_EVENT: {$eventType}", [
            'user_id' => $user?->id,
            'email' => $context['email'] ?? $user?->email,
            'ip' => $request->ip(),
            'risk_level' => $riskLevel,
            'is_anomaly' => $isAnomaly,
            'status' => $context['status'] ?? 'success'
        ]);
        
        // Create security incident if high risk
        if ($riskLevel === 'critical' || $riskLevel === 'high') {
            $this->createSecurityIncident($eventType, $context, $riskLevel);
        }
        
        // Real-time alerting for critical events
        if ($riskLevel === 'critical') {
            $this->sendSecurityAlert($eventType, $context);
        }
    }

    /**
     * Track user session with security monitoring
     */
    public function trackUserSession(User $user, Request $request): void
    {
        $sessionId = session()->getId();
        $deviceFingerprint = $this->generateDeviceFingerprint($request);
        $locationData = $this->getLocationData($request->ip());
        
        // Check for concurrent sessions
        $this->enforceConcurrentSessionLimits($user);
        
        // Check for suspicious patterns
        $securityFlags = $this->analyzeSessionSecurity($user, $request, $locationData);
        
        // Create or update session tracking
        DB::table('user_sessions_tracking')->updateOrInsert(
            ['session_id' => $sessionId],
            [
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'device_fingerprint' => $deviceFingerprint,
                'location_country' => $locationData['country'] ?? null,
                'location_city' => $locationData['city'] ?? null,
                'is_active' => true,
                'is_suspicious' => !empty($securityFlags),
                'security_flags' => json_encode($securityFlags),
                'last_activity' => now(),
                'login_at' => now(),
                'updated_at' => now()
            ]
        );
        
        // Log session creation
        $this->logAuthEvent('session_created', [
            'device_fingerprint' => $deviceFingerprint,
            'security_flags' => $securityFlags,
            'concurrent_sessions' => $this->getActiveSessions($user)->count()
        ]);
    }

    /**
     * Handle failed login attempt
     */
    public function handleFailedLogin(string $email, Request $request, string $reason): void
    {
        // Track failed attempt
        $failedAttempt = DB::table('failed_login_attempts')->where([
            'email' => $email,
            'ip_address' => $request->ip()
        ])->whereDate('attempted_at', today())->first();
        
        $consecutiveFailures = $failedAttempt ? $failedAttempt->consecutive_failures + 1 : 1;
        
        // Update or create failed attempt record
        DB::table('failed_login_attempts')->updateOrInsert(
            [
                'email' => $email,
                'ip_address' => $request->ip(),
                'attempted_at' => now()
            ],
            [
                'user_agent' => $request->userAgent(),
                'failure_reason' => $reason,
                'consecutive_failures' => $consecutiveFailures,
                'is_blocked' => $consecutiveFailures >= 5,
                'blocked_until' => $consecutiveFailures >= 5 ? now()->addMinutes(30) : null,
                'updated_at' => now()
            ]
        );
        
        // Log failed login
        $this->logAuthEvent('login_failed', [
            'email' => $email,
            'reason' => $reason,
            'consecutive_failures' => $consecutiveFailures,
            'status' => 'failure'
        ]);
        
        // Check for brute force attack
        if ($consecutiveFailures >= 5) {
            $this->handleBruteForceDetection($email, $request);
        }
    }

    /**
     * Audit password reset attempt
     */
    public function auditPasswordReset(string $email, Request $request, string $action, string $status, array $metadata = []): void
    {
        DB::table('password_reset_audit')->insert([
            'email' => $email,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'action' => $action,
            'status' => $status,
            'otp_hash' => $metadata['otp_hash'] ?? null,
            'metadata' => json_encode($metadata),
            'performed_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        // Log the password reset event
        $this->logAuthEvent('password_reset_' . $action, array_merge($metadata, [
            'email' => $email,
            'action' => $action,
            'status' => $status
        ]));
    }

    /**
     * Audit 2FA events
     */
    public function audit2FA(User $user, string $action, string $method, string $status, array $metadata = []): void
    {
        $request = request();
        
        DB::table('two_factor_audit')->insert([
            'user_id' => $user->id,
            'action' => $action,
            'method' => $method,
            'status' => $status,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'backup_code_used' => $metadata['backup_code_used'] ?? null,
            'metadata' => json_encode($metadata),
            'performed_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        // Log 2FA event
        $this->logAuthEvent('2fa_' . $action, array_merge($metadata, [
            'method' => $method,
            'status' => $status
        ]));
    }

    /**
     * Check if user should be forced to use 2FA
     */
    public function shouldEnforce2FA(User $user): bool
    {
        $mandatory2FARoles = $this->getSecurityConfig('mandatory_2fa_roles', []);
        
        return $user->hasAnyRole($mandatory2FARoles) && !$user->two_factor_secret;
    }

    /**
     * Detect geographic anomalies
     */
    public function detectGeographicAnomaly(User $user, array $currentLocation): bool
    {
        if (empty($currentLocation['latitude']) || empty($currentLocation['longitude'])) {
            return false;
        }
        
        // Get user's recent login locations
        $recentLocations = DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->where('event_type', 'login_success')
            ->whereNotNull('location_latitude')
            ->whereNotNull('location_longitude')
            ->where('detected_at', '>=', now()->subDays(30))
            ->orderBy('detected_at', 'desc')
            ->limit(10)
            ->get();
        
        if ($recentLocations->isEmpty()) {
            return false; // No historical data
        }
        
        $distanceThreshold = $this->getSecurityConfig('geo_anomaly_detection.distance_threshold_km', 500);
        
        foreach ($recentLocations as $location) {
            $distance = $this->calculateDistance(
                $currentLocation['latitude'],
                $currentLocation['longitude'],
                $location->location_latitude,
                $location->location_longitude
            );
            
            if ($distance <= $distanceThreshold) {
                return false; // Within normal range
            }
        }
        
        return true; // All recent locations are far away
    }

    /**
     * Invalidate all user sessions except current
     */
    public function invalidateOtherSessions(User $user, string $currentSessionId = null): int
    {
        $currentSessionId = $currentSessionId ?? session()->getId();
        
        // Mark sessions as inactive in tracking table
        $invalidatedCount = DB::table('user_sessions_tracking')
            ->where('user_id', $user->id)
            ->where('session_id', '!=', $currentSessionId)
            ->where('is_active', true)
            ->update([
                'is_active' => false,
                'logout_at' => now(),
                'updated_at' => now()
            ]);
        
        // Invalidate sessions in Laravel's session table
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();
        
        // Log session invalidation
        $this->logAuthEvent('sessions_invalidated', [
            'invalidated_count' => $invalidatedCount,
            'reason' => 'security_measure'
        ]);
        
        return $invalidatedCount;
    }

    /**
     * Get security configuration value
     */
    public function getSecurityConfig(string $key, $default = null)
    {
        return Cache::remember("security_config_{$key}", 300, function () use ($key, $default) {
            $config = DB::table('security_configurations')
                ->where('key', $key)
                ->where('is_active', true)
                ->first();
            
            return $config ? json_decode($config->value, true) : $default;
        });
    }

    /**
     * Generate security metrics for monitoring
     */
    public function getSecurityMetrics(array $timeframe = []): array
    {
        $startDate = $timeframe['start'] ?? now()->subDays(7);
        $endDate = $timeframe['end'] ?? now();
        
        return [
            'authentication_events' => $this->getAuthEventMetrics($startDate, $endDate),
            'failed_attempts' => $this->getFailedAttemptMetrics($startDate, $endDate),
            'security_incidents' => $this->getSecurityIncidentMetrics($startDate, $endDate),
            'anomaly_detection' => $this->getAnomalyMetrics($startDate, $endDate),
            'geographic_analysis' => $this->getGeographicMetrics($startDate, $endDate),
            '2fa_adoption' => $this->get2FAMetrics(),
            'session_analysis' => $this->getSessionMetrics($startDate, $endDate)
        ];
    }

    /**
     * Private helper methods
     */
    
    private function getLocationData(string $ipAddress): array
    {
        // Skip for localhost/private IPs
        if ($ipAddress === '127.0.0.1' || $ipAddress === '::1' || 
            preg_match('/^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./', $ipAddress)) {
            return ['country' => 'Local', 'city' => 'Local'];
        }
        
        try {
            // Use a free IP geolocation service (in production, use a paid service)
            $response = Http::timeout(5)->get("http://ip-api.com/json/{$ipAddress}");
            
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'country' => $data['country'] ?? null,
                    'city' => $data['city'] ?? null,
                    'latitude' => $data['lat'] ?? null,
                    'longitude' => $data['lon'] ?? null
                ];
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get location data', ['ip' => $ipAddress, 'error' => $e->getMessage()]);
        }
        
        return [];
    }
    
    private function generateDeviceFingerprint(Request $request): string
    {
        $components = [
            $request->userAgent(),
            $request->header('accept-language'),
            $request->header('accept-encoding'),
            $request->header('accept'),
        ];
        
        return hash('sha256', implode('|', array_filter($components)));
    }
    
    private function detectAnomalies(string $eventType, ?User $user, Request $request, array $locationData): bool
    {
        if (!$user) {
            return false;
        }
        
        $anomalies = [];
        
        // Geographic anomaly
        if ($eventType === 'login_success' && !empty($locationData)) {
            $anomalies[] = $this->detectGeographicAnomaly($user, $locationData);
        }
        
        // New device anomaly
        $deviceFingerprint = $this->generateDeviceFingerprint($request);
        $isNewDevice = !DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->where('device_fingerprint', $deviceFingerprint)
            ->exists();
        
        if ($isNewDevice && $user->hasAnyRole(['Super Administrator', 'Administrator'])) {
            $anomalies[] = true;
        }
        
        // Time-based anomaly (accessing outside normal hours)
        $currentHour = now()->hour;
        if ($currentHour < 6 || $currentHour > 22) {
            $anomalies[] = true;
        }
        
        return in_array(true, $anomalies, true);
    }
    
    private function calculateRiskLevel(string $eventType, array $context, bool $isAnomaly): string
    {
        $riskScore = 0;
        
        // Base risk by event type
        $eventRisks = [
            'login_failed' => 2,
            'login_success' => 1,
            'password_reset_request' => 3,
            'password_changed' => 4,
            'role_changed' => 5,
            '2fa_disabled' => 5,
            'admin_login' => 3,
        ];
        
        $riskScore += $eventRisks[$eventType] ?? 1;
        
        // Add risk for anomalies
        if ($isAnomaly) {
            $riskScore += 3;
        }
        
        // Add risk for failed status
        if (($context['status'] ?? 'success') === 'failure') {
            $riskScore += 2;
        }
        
        // Add risk for consecutive failures
        if (isset($context['consecutive_failures']) && $context['consecutive_failures'] >= 5) {
            $riskScore += 5;
        }
        
        // Convert score to level
        if ($riskScore >= 8) return 'critical';
        if ($riskScore >= 6) return 'high';
        if ($riskScore >= 3) return 'medium';
        return 'low';
    }
    
    private function createSecurityIncident(string $eventType, array $context, string $riskLevel): void
    {
        $incidentId = 'SEC-' . date('Y-m-d') . '-' . strtoupper(substr(uniqid(), -6));
        
        DB::table('security_incidents')->insert([
            'incident_id' => $incidentId,
            'type' => $this->mapEventToIncidentType($eventType),
            'severity' => $riskLevel,
            'status' => 'open',
            'description' => $this->generateIncidentDescription($eventType, $context),
            'evidence' => json_encode([
                'event_type' => $eventType,
                'context' => $context,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]),
            'detected_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        Log::critical("Security incident created: {$incidentId}", [
            'type' => $this->mapEventToIncidentType($eventType),
            'severity' => $riskLevel
        ]);
    }
    
    private function sendSecurityAlert(string $eventType, array $context): void
    {
        // In a real implementation, this would send notifications
        // via email, Slack, SMS, or other alerting systems
        Log::emergency("SECURITY ALERT: {$eventType}", $context);
    }
    
    private function enforceConcurrentSessionLimits(User $user): void
    {
        $maxSessions = $this->getSecurityConfig('max_concurrent_sessions.limit', 3);
        
        $activeSessions = $this->getActiveSessions($user);
        
        if ($activeSessions->count() >= $maxSessions) {
            // Invalidate oldest sessions
            $sessionsToInvalidate = $activeSessions->sortBy('last_activity')->take($activeSessions->count() - $maxSessions + 1);
            
            foreach ($sessionsToInvalidate as $session) {
                DB::table('user_sessions_tracking')
                    ->where('id', $session->id)
                    ->update(['is_active' => false, 'logout_at' => now()]);
                
                DB::table('sessions')->where('id', $session->session_id)->delete();
            }
            
            $this->logAuthEvent('session_limit_enforced', [
                'invalidated_sessions' => $sessionsToInvalidate->count(),
                'max_sessions' => $maxSessions
            ]);
        }
    }
    
    private function getActiveSessions(User $user)
    {
        return DB::table('user_sessions_tracking')
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->get();
    }
    
    private function analyzeSessionSecurity(User $user, Request $request, array $locationData): array
    {
        $flags = [];
        
        // Check for geographic anomaly
        if ($this->detectGeographicAnomaly($user, $locationData)) {
            $flags[] = 'geographic_anomaly';
        }
        
        // Check for new device
        $deviceFingerprint = $this->generateDeviceFingerprint($request);
        $isNewDevice = !DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->where('device_fingerprint', $deviceFingerprint)
            ->exists();
        
        if ($isNewDevice) {
            $flags[] = 'new_device';
        }
        
        // Check for admin login outside business hours
        if ($user->hasAnyRole(['Super Administrator', 'Administrator'])) {
            $currentHour = now()->hour;
            if ($currentHour < 6 || $currentHour > 22) {
                $flags[] = 'off_hours_admin_access';
            }
        }
        
        return $flags;
    }
    
    private function handleBruteForceDetection(string $email, Request $request): void
    {
        $this->createSecurityIncident('brute_force_attack', [
            'email' => $email,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ], 'high');
    }
    
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c;
    }
    
    private function mapEventToIncidentType(string $eventType): string
    {
        $mapping = [
            'login_failed' => 'authentication_failure',
            'password_reset_request' => 'password_reset_anomaly',
            'role_changed' => 'privilege_escalation',
            '2fa_disabled' => 'security_control_bypass',
        ];
        
        return $mapping[$eventType] ?? 'general_security_event';
    }
    
    private function generateIncidentDescription(string $eventType, array $context): string
    {
        $templates = [
            'authentication_failure' => 'Multiple failed authentication attempts detected',
            'password_reset_anomaly' => 'Suspicious password reset activity detected',
            'privilege_escalation' => 'User role modification detected',
            'security_control_bypass' => 'Security control was disabled or bypassed',
        ];
        
        $type = $this->mapEventToIncidentType($eventType);
        return $templates[$type] ?? "Security event of type {$eventType} detected";
    }
    
    // Metric calculation methods
    private function getAuthEventMetrics($startDate, $endDate): array
    {
        return DB::table('auth_audit_logs')
            ->where('detected_at', '>=', $startDate)
            ->where('detected_at', '<=', $endDate)
            ->selectRaw('event_type, status, COUNT(*) as count')
            ->groupBy('event_type', 'status')
            ->get()
            ->groupBy('event_type')
            ->toArray();
    }
    
    private function getFailedAttemptMetrics($startDate, $endDate): array
    {
        return [
            'total_failures' => DB::table('failed_login_attempts')
                ->where('attempted_at', '>=', $startDate)
                ->where('attempted_at', '<=', $endDate)
                ->sum('consecutive_failures'),
            'unique_emails' => DB::table('failed_login_attempts')
                ->where('attempted_at', '>=', $startDate)
                ->where('attempted_at', '<=', $endDate)
                ->distinct('email')
                ->count(),
            'blocked_accounts' => DB::table('failed_login_attempts')
                ->where('is_blocked', true)
                ->where('attempted_at', '>=', $startDate)
                ->where('attempted_at', '<=', $endDate)
                ->count()
        ];
    }
    
    private function getSecurityIncidentMetrics($startDate, $endDate): array
    {
        return DB::table('security_incidents')
            ->where('detected_at', '>=', $startDate)
            ->where('detected_at', '<=', $endDate)
            ->selectRaw('type, severity, status, COUNT(*) as count')
            ->groupBy('type', 'severity', 'status')
            ->get()
            ->groupBy(['type', 'severity'])
            ->toArray();
    }
    
    private function getAnomalyMetrics($startDate, $endDate): array
    {
        return [
            'total_anomalies' => DB::table('auth_audit_logs')
                ->where('is_anomaly', true)
                ->where('detected_at', '>=', $startDate)
                ->where('detected_at', '<=', $endDate)
                ->count(),
            'anomaly_rate' => DB::table('auth_audit_logs')
                ->where('detected_at', '>=', $startDate)
                ->where('detected_at', '<=', $endDate)
                ->selectRaw('(SUM(CASE WHEN is_anomaly = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as rate')
                ->value('rate') ?? 0
        ];
    }
    
    private function getGeographicMetrics($startDate, $endDate): array
    {
        return DB::table('auth_audit_logs')
            ->where('detected_at', '>=', $startDate)
            ->where('detected_at', '<=', $endDate)
            ->whereNotNull('location_country')
            ->selectRaw('location_country, location_city, COUNT(*) as count')
            ->groupBy('location_country', 'location_city')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }
    
    private function get2FAMetrics(): array
    {
        $totalUsers = User::count();
        $users2FA = User::whereNotNull('two_factor_secret')->count();
        
        return [
            'total_users' => $totalUsers,
            'users_with_2fa' => $users2FA,
            'adoption_rate' => $totalUsers > 0 ? round(($users2FA / $totalUsers) * 100, 2) : 0,
            'mandatory_compliance' => $this->check2FACompliance()
        ];
    }
    
    private function getSessionMetrics($startDate, $endDate): array
    {
        return [
            'total_sessions' => DB::table('user_sessions_tracking')
                ->where('login_at', '>=', $startDate)
                ->where('login_at', '<=', $endDate)
                ->count(),
            'suspicious_sessions' => DB::table('user_sessions_tracking')
                ->where('is_suspicious', true)
                ->where('login_at', '>=', $startDate)
                ->where('login_at', '<=', $endDate)
                ->count(),
            'avg_session_duration' => DB::table('user_sessions_tracking')
                ->whereNotNull('logout_at')
                ->where('login_at', '>=', $startDate)
                ->where('login_at', '<=', $endDate)
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, login_at, logout_at)) as avg_duration')
                ->value('avg_duration') ?? 0
        ];
    }
    
    private function check2FACompliance(): array
    {
        $mandatory2FARoles = $this->getSecurityConfig('mandatory_2fa_roles', []);
        
        $usersRequiring2FA = User::whereHas('roles', function ($query) use ($mandatory2FARoles) {
            $query->whereIn('name', $mandatory2FARoles);
        })->get();
        
        $compliantUsers = $usersRequiring2FA->filter(function ($user) {
            return !is_null($user->two_factor_secret);
        });
        
        return [
            'users_requiring_2fa' => $usersRequiring2FA->count(),
            'compliant_users' => $compliantUsers->count(),
            'compliance_rate' => $usersRequiring2FA->count() > 0 
                ? round(($compliantUsers->count() / $usersRequiring2FA->count()) * 100, 2) 
                : 100,
            'non_compliant_users' => $usersRequiring2FA->filter(function ($user) {
                return is_null($user->two_factor_secret);
            })->pluck('email')->toArray()
        ];
    }
}
