<?php

namespace App\Services;

use App\Models\User;
use App\Models\SecurityEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthenticationSecurityService
{
    /**
     * Log authentication events with enhanced security monitoring
     */
    public function logAuthEvent(string $eventType, Request $request, ?User $user = null, array $metadata = []): void
    {
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();
        $sessionId = session()->getId();
        
        // Enhanced metadata
        $enhancedMetadata = array_merge([
            'request_id' => Str::uuid(),
            'route' => $request->route()?->getName(),
            'method' => $request->method(),
            'referer' => $request->header('referer'),
            'accept_language' => $request->header('accept-language'),
            'device_info' => $this->extractDeviceInfo($userAgent),
        ], $metadata);

        // Risk assessment
        $riskLevel = $this->assessRiskLevel($eventType, $ipAddress, $user, $enhancedMetadata);
        
        // Anomaly detection
        $isAnomaly = $this->detectAnomalies($eventType, $ipAddress, $user, $enhancedMetadata);
        
        // Location data
        $locationData = $this->getLocationData($ipAddress);
        
        // Device fingerprinting
        $deviceFingerprint = $this->generateDeviceFingerprint($request);

        DB::table('auth_audit_logs')->insert([
            'event_type' => $eventType,
            'user_id' => $user?->id,
            'email' => $user?->email ?? $request->input('email'),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'session_id' => $sessionId,
            'metadata' => json_encode($enhancedMetadata),
            'risk_level' => $riskLevel,
            'status' => $this->determineEventStatus($eventType, $metadata),
            'location_country' => $locationData['country'] ?? null,
            'location_city' => $locationData['city'] ?? null,
            'location_latitude' => $locationData['latitude'] ?? null,
            'location_longitude' => $locationData['longitude'] ?? null,
            'device_fingerprint' => $deviceFingerprint,
            'is_anomaly' => $isAnomaly,
            'detected_at' => now(),
            'created_at' => now(),
        ]);

        // Real-time monitoring and alerting
        if ($riskLevel === 'critical' || $riskLevel === 'high') {
            $this->triggerSecurityAlert($eventType, $user, $enhancedMetadata, $riskLevel);
        }

        // Update session tracking
        if ($user && $eventType === 'login_success') {
            $this->updateSessionTracking($user, $request, $locationData, $deviceFingerprint);
        }
    }

    /**
     * Assess risk level for authentication events
     */
    private function assessRiskLevel(string $eventType, string $ipAddress, ?User $user, array $metadata): string
    {
        $score = 0;

        // Base risk by event type
        $eventRisks = [
            'login_failed' => 2,
            'login_success' => 1,
            'password_reset_requested' => 3,
            'password_changed' => 4,
            'role_changed' => 5,
            'two_factor_disabled' => 5,
            'account_locked' => 3,
            'suspicious_activity' => 4,
        ];

        $score += $eventRisks[$eventType] ?? 1;

        // IP-based risk assessment
        if ($this->isKnownMaliciousIP($ipAddress)) {
            $score += 5;
        }

        if ($this->isNewIPForUser($ipAddress, $user)) {
            $score += 2;
        }

        // Geographic risk
        if ($user && $this->isGeographicAnomaly($ipAddress, $user)) {
            $score += 3;
        }

        // Time-based risk (access outside business hours)
        if ($this->isOutsideBusinessHours()) {
            $score += 1;
        }

        // Device risk
        if (isset($metadata['device_info']['is_new_device']) && $metadata['device_info']['is_new_device']) {
            $score += 2;
        }

        // Admin user access
        if ($user && $user->hasRole(['Super Administrator', 'Administrator'])) {
            $score += 2;
        }

        // Determine risk level
        if ($score >= 8) return 'critical';
        if ($score >= 6) return 'high';
        if ($score >= 4) return 'medium';
        return 'low';
    }

    /**
     * Detect security anomalies
     */
    private function detectAnomalies(string $eventType, string $ipAddress, ?User $user, array $metadata): bool
    {
        // Check for rapid successive attempts
        if ($this->hasRapidAttempts($ipAddress, $user)) {
            return true;
        }

        // Check for impossible travel
        if ($user && $this->hasImpossibleTravel($user, $ipAddress)) {
            return true;
        }

        // Check for suspicious user agent patterns
        if ($this->hasSuspiciousUserAgent($metadata['device_info'] ?? [])) {
            return true;
        }

        // Check for password reset followed by immediate login
        if ($eventType === 'login_success' && $this->hasRecentPasswordReset($user)) {
            return true;
        }

        return false;
    }

    /**
     * Generate device fingerprint
     */
    private function generateDeviceFingerprint(Request $request): string
    {
        $components = [
            $request->userAgent(),
            $request->header('accept'),
            $request->header('accept-language'),
            $request->header('accept-encoding'),
            $request->ip(), // Note: IP can change, but useful for tracking
        ];

        return hash('sha256', implode('|', array_filter($components)));
    }

    /**
     * Track user sessions with security monitoring
     */
    private function updateSessionTracking(User $user, Request $request, array $locationData, string $deviceFingerprint): void
    {
        $sessionId = session()->getId();
        
        // Check for concurrent sessions
        $activeSessions = DB::table('user_sessions_tracking')
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->count();

        $maxSessions = $this->getMaxConcurrentSessions();
        
        if ($activeSessions >= $maxSessions) {
            // Terminate oldest session
            $oldestSession = DB::table('user_sessions_tracking')
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->orderBy('last_activity')
                ->first();
                
            if ($oldestSession) {
                DB::table('user_sessions_tracking')
                    ->where('id', $oldestSession->id)
                    ->update([
                        'is_active' => false,
                        'logout_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                // Log the forced logout
                $this->logAuthEvent('session_terminated_concurrent', $request, $user, [
                    'reason' => 'max_concurrent_sessions_exceeded',
                    'terminated_session_id' => $oldestSession->session_id,
                ]);
            }
        }

        // Create new session tracking record
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
                'is_suspicious' => $this->isSessionSuspicious($user, $request),
                'security_flags' => json_encode($this->getSecurityFlags($user, $request, $locationData)),
                'last_activity' => now(),
                'login_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Enhanced OTP verification with timing attack protection
     */
    public function verifyOTPSecure(string $email, string $providedOTP): bool
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();
        
        if (!$record) {
            // Always perform hash operation to prevent timing attacks
            Hash::check('dummy_otp', '$2y$10$dummy.hash.to.prevent.timing.attacks');
            return false;
        }

        // Check if OTP is expired (10 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(10)->isPast()) {
            // Clean up expired token
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            // Still perform hash operation
            Hash::check('dummy_otp', '$2y$10$dummy.hash.to.prevent.timing.attacks');
            return false;
        }

        // Constant-time comparison
        $isValid = Hash::check($providedOTP, $record->token);
        
        // Log the attempt
        $this->logPasswordResetAttempt($email, 'verify_otp', $isValid ? 'success' : 'failure');
        
        // If valid, clean up the token
        if ($isValid) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
        }
        
        return $isValid;
    }

    /**
     * Rate-limited OTP generation
     */
    public function generateOTPWithRateLimit(string $email): array
    {
        $key = "otp_rate_limit:{$email}";
        $attempts = Cache::get($key, 0);
        
        // Rate limiting: 3 attempts per hour
        if ($attempts >= 3) {
            $this->logPasswordResetAttempt($email, 'request_otp', 'rate_limited');
            
            return [
                'success' => false,
                'message' => 'Too many OTP requests. Please try again later.',
                'retry_after' => Cache::get($key . ':expires', now()->addHour()),
            ];
        }
        
        // Generate secure OTP
        $otp = $this->generateSecureOTP();
        
        // Store with expiration
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($otp),
                'created_at' => now(),
            ]
        );
        
        // Update rate limiting
        Cache::put($key, $attempts + 1, now()->addHour());
        Cache::put($key . ':expires', now()->addHour(), now()->addHour());
        
        // Log the successful generation
        $this->logPasswordResetAttempt($email, 'request_otp', 'success');
        
        return [
            'success' => true,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10),
        ];
    }

    /**
     * Log password reset attempts
     */
    private function logPasswordResetAttempt(string $email, string $action, string $status, array $metadata = []): void
    {
        DB::table('password_reset_audit')->insert([
            'email' => $email,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'action' => $action,
            'status' => $status,
            'metadata' => json_encode($metadata),
            'performed_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Generate cryptographically secure OTP
     */
    private function generateSecureOTP(): string
    {
        // Use random_int for cryptographically secure random numbers
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Helper methods for risk assessment
     */
    private function isKnownMaliciousIP(string $ipAddress): bool
    {
        // In production, integrate with threat intelligence feeds
        $maliciousIPs = Cache::remember('malicious_ips', now()->addHours(6), function () {
            // This would typically fetch from external threat intelligence
            return [];
        });
        
        return in_array($ipAddress, $maliciousIPs);
    }

    private function isNewIPForUser(string $ipAddress, ?User $user): bool
    {
        if (!$user) return true;
        
        return !DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->where('ip_address', $ipAddress)
            ->where('status', 'success')
            ->where('detected_at', '>', now()->subDays(30))
            ->exists();
    }

    private function isGeographicAnomaly(string $ipAddress, User $user): bool
    {
        // Get user's typical locations
        $recentLocations = DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->where('status', 'success')
            ->where('detected_at', '>', now()->subDays(30))
            ->whereNotNull('location_latitude')
            ->whereNotNull('location_longitude')
            ->get(['location_latitude', 'location_longitude']);
            
        if ($recentLocations->isEmpty()) {
            return false;
        }
        
        $currentLocation = $this->getLocationData($ipAddress);
        if (!isset($currentLocation['latitude']) || !isset($currentLocation['longitude'])) {
            return false;
        }
        
        // Check if current location is more than 500km from any recent location
        foreach ($recentLocations as $location) {
            $distance = $this->calculateDistance(
                $currentLocation['latitude'],
                $currentLocation['longitude'],
                $location->location_latitude,
                $location->location_longitude
            );
            
            if ($distance <= 500) { // 500km threshold
                return false;
            }
        }
        
        return true;
    }

    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c;
    }

    private function isOutsideBusinessHours(): bool
    {
        $hour = now()->hour;
        return $hour < 6 || $hour > 22; // Outside 6 AM - 10 PM
    }

    private function hasRapidAttempts(string $ipAddress, ?User $user): bool
    {
        $recentAttempts = DB::table('auth_audit_logs')
            ->where('ip_address', $ipAddress)
            ->where('detected_at', '>', now()->subMinutes(5))
            ->count();
            
        return $recentAttempts > 10;
    }

    private function hasImpossibleTravel(?User $user, string $ipAddress): bool
    {
        if (!$user) return false;
        
        $lastLocation = DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->where('status', 'success')
            ->whereNotNull('location_latitude')
            ->whereNotNull('location_longitude')
            ->orderBy('detected_at', 'desc')
            ->first();
            
        if (!$lastLocation) return false;
        
        $currentLocation = $this->getLocationData($ipAddress);
        if (!isset($currentLocation['latitude']) || !isset($currentLocation['longitude'])) {
            return false;
        }
        
        $timeDiff = Carbon::parse($lastLocation->detected_at)->diffInHours(now());
        $distance = $this->calculateDistance(
            $currentLocation['latitude'],
            $currentLocation['longitude'],
            $lastLocation->location_latitude,
            $lastLocation->location_longitude
        );
        
        // Impossible if speed > 1000 km/h (commercial flight speed)
        return $timeDiff > 0 && ($distance / $timeDiff) > 1000;
    }

    private function hasSuspiciousUserAgent(array $deviceInfo): bool
    {
        $suspiciousPatterns = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python'
        ];
        
        $userAgent = strtolower(request()->userAgent() ?? '');
        
        foreach ($suspiciousPatterns as $pattern) {
            if (str_contains($userAgent, $pattern)) {
                return true;
            }
        }
        
        return false;
    }

    private function hasRecentPasswordReset(?User $user): bool
    {
        if (!$user) return false;
        
        return DB::table('password_reset_audit')
            ->where('email', $user->email)
            ->where('action', 'reset_password')
            ->where('status', 'success')
            ->where('performed_at', '>', now()->subMinutes(10))
            ->exists();
    }

    private function extractDeviceInfo(?string $userAgent): array
    {
        // Simple device detection (in production, use a proper library)
        $info = [
            'browser' => 'unknown',
            'os' => 'unknown',
            'device_type' => 'unknown',
            'is_mobile' => false,
            'is_new_device' => false,
        ];
        
        if (!$userAgent) return $info;
        
        // Browser detection
        if (str_contains($userAgent, 'Chrome')) $info['browser'] = 'Chrome';
        elseif (str_contains($userAgent, 'Firefox')) $info['browser'] = 'Firefox';
        elseif (str_contains($userAgent, 'Safari')) $info['browser'] = 'Safari';
        elseif (str_contains($userAgent, 'Edge')) $info['browser'] = 'Edge';
        
        // OS detection
        if (str_contains($userAgent, 'Windows')) $info['os'] = 'Windows';
        elseif (str_contains($userAgent, 'Mac')) $info['os'] = 'macOS';
        elseif (str_contains($userAgent, 'Linux')) $info['os'] = 'Linux';
        elseif (str_contains($userAgent, 'Android')) $info['os'] = 'Android';
        elseif (str_contains($userAgent, 'iOS')) $info['os'] = 'iOS';
        
        // Mobile detection
        $info['is_mobile'] = str_contains($userAgent, 'Mobile') || str_contains($userAgent, 'Android');
        
        return $info;
    }

    private function getLocationData(string $ipAddress): array
    {
        // In production, integrate with a GeoIP service
        // For now, return mock data or use a free service
        return Cache::remember("location_{$ipAddress}", now()->addHours(24), function () use ($ipAddress) {
            // This would call a real GeoIP service
            return [
                'country' => 'Unknown',
                'city' => 'Unknown',
                'latitude' => null,
                'longitude' => null,
            ];
        });
    }

    private function determineEventStatus(string $eventType, array $metadata): string
    {
        $successEvents = ['login_success', 'logout', 'password_changed'];
        $failureEvents = ['login_failed', 'otp_failed'];
        
        if (in_array($eventType, $successEvents)) return 'success';
        if (in_array($eventType, $failureEvents)) return 'failure';
        if (isset($metadata['is_suspicious']) && $metadata['is_suspicious']) return 'suspicious';
        
        return 'success';
    }

    private function triggerSecurityAlert(string $eventType, ?User $user, array $metadata, string $riskLevel): void
    {
        // Create security incident
        $incidentId = 'SEC-' . date('Y') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        
        DB::table('security_incidents')->insert([
            'incident_id' => $incidentId,
            'type' => $eventType,
            'severity' => $riskLevel,
            'status' => 'open',
            'description' => $this->generateIncidentDescription($eventType, $user, $metadata),
            'evidence' => json_encode($metadata),
            'affected_users' => $user ? json_encode([$user->id]) : null,
            'detected_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        // Log to security channel
        Log::channel('security')->critical("Security Alert: {$eventType}", [
            'incident_id' => $incidentId,
            'user_id' => $user?->id,
            'risk_level' => $riskLevel,
            'metadata' => $metadata,
        ]);
        
        // In production, send real-time notifications (Slack, email, SMS)
    }

    private function generateIncidentDescription(string $eventType, ?User $user, array $metadata): string
    {
        $userName = $user ? $user->name : 'Unknown User';
        $ipAddress = $metadata['ip_address'] ?? 'Unknown IP';
        
        return match($eventType) {
            'login_failed' => "Multiple failed login attempts for {$userName} from {$ipAddress}",
            'suspicious_activity' => "Suspicious authentication activity detected for {$userName}",
            'geographic_anomaly' => "Login from unusual geographic location for {$userName}",
            default => "Security event {$eventType} detected for {$userName}",
        };
    }

    private function getMaxConcurrentSessions(): int
    {
        $config = DB::table('security_configurations')
            ->where('key', 'max_concurrent_sessions')
            ->where('is_active', true)
            ->first();
            
        return $config ? json_decode($config->value, true)['limit'] : 3;
    }

    private function isSessionSuspicious(User $user, Request $request): bool
    {
        // Check various suspicious indicators
        return $this->isNewIPForUser($request->ip(), $user) ||
               $this->isGeographicAnomaly($request->ip(), $user) ||
               $this->isOutsideBusinessHours();
    }

    private function getSecurityFlags(User $user, Request $request, array $locationData): array
    {
        return [
            'new_ip' => $this->isNewIPForUser($request->ip(), $user),
            'new_location' => $this->isGeographicAnomaly($request->ip(), $user),
            'outside_hours' => $this->isOutsideBusinessHours(),
            'admin_user' => $user->hasRole(['Super Administrator', 'Administrator']),
            'location_data_available' => isset($locationData['latitude'], $locationData['longitude']),
        ];
    }

    /**
     * Log security events for audit purposes
     */
    public function logSecurityEvent(string $eventType, array $context = []): void
    {
        try {
            $ipAddress = $context['ip_address'] ?? request()->ip();
            $userAgent = $context['user_agent'] ?? request()->userAgent();
            $userId = $context['user_id'] ?? (Auth::check() ? Auth::id() : null);
            
            // Get location data if not provided
            $locationData = $context['location'] ?? $this->getLocationData($ipAddress);
            
            DB::table('auth_audit_logs')->insert([
                'event_type' => $eventType,
                'user_id' => $userId,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'session_id' => $context['session_id'] ?? session()->getId(),
                'location_data' => json_encode($locationData),
                'risk_level' => $context['risk_level'] ?? 'low',
                'description' => $context['description'] ?? "Security event: {$eventType}",
                'metadata' => json_encode($context),
                'success' => $context['success'] ?? true,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Log to Laravel logs for additional tracking
            Log::channel('security')->info("SECURITY_EVENT: {$eventType}", $context);

        } catch (\Exception $e) {
            Log::error('Failed to log security event', [
                'event_type' => $eventType,
                'context' => $context,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Monitor login attempt and detect anomalies
     */
    public function monitorLoginAttempt(Request $request, $user = null): array
    {
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();
        $timestamp = now();

        // Get geographic location
        $location = $this->getLocationData($ipAddress);
        
        // Calculate risk score
        $riskLevel = $this->assessRiskLevel('login_attempt', $ipAddress, $user, [
            'user_agent' => $userAgent,
            'timestamp' => $timestamp
        ]);
        
        // Convert risk level to numeric score
        $riskScore = $this->convertRiskLevelToScore($riskLevel);
        
        // Check for anomalies - this returns boolean, so let's collect them differently
        $anomalyChecks = [
            'geographic_anomaly' => $user ? $this->isGeographicAnomaly($ipAddress, $user) : false,
            'new_device' => $user ? $this->isNewDeviceForUser($userAgent, $user) : false,
            'outside_hours' => $this->isOutsideBusinessHours(),
            'high_risk_ip' => $this->isHighRiskIP($ipAddress)
        ];
        
        $anomalies = array_keys(array_filter($anomalyChecks));
        
        // Log the attempt
        $this->logSecurityEvent('login_attempt_monitored', [
            'user_id' => $user?->id,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'location' => $location,
            'risk_score' => $riskScore,
            'anomalies' => $anomalies,
            'timestamp' => $timestamp
        ]);
        
        // Determine if login should be allowed
        $blocked = $this->isHighRiskIP($ipAddress) || $riskScore >= 90;
        
        return [
            'allowed' => !$blocked,
            'message' => $blocked ? 'Login blocked due to security concerns. Please contact support.' : null,
            'risk_score' => $riskScore,
            'anomalies' => $anomalies,
            'location' => $location,
            'requires_additional_verification' => $riskScore >= 70,
            'recommended_actions' => $this->getRecommendedActions($riskScore, $anomalies)
        ];
    }

    private function isNewDeviceForUser(string $userAgent, User $user): bool
    {
        return !DB::table('user_sessions_tracking')
            ->where('user_id', $user->id)
            ->where('user_agent', $userAgent)
            ->exists();
    }

    private function isHighRiskIP(string $ipAddress): bool
    {
        // Check against known high-risk IP ranges or blacklists
        return DB::table('security_blacklisted_ips')
            ->where('ip_address', $ipAddress)
            ->orWhere('ip_range', 'LIKE', $this->getIPRange($ipAddress))
            ->exists();
    }

    private function getIPRange(string $ipAddress): string
    {
        $parts = explode('.', $ipAddress);
        return $parts[0] . '.' . $parts[1] . '.' . $parts[2] . '.%';
    }

    private function getRecommendedActions(int $riskScore, array $anomalies): array
    {
        $actions = [];
        
        if ($riskScore >= 80) {
            $actions[] = 'require_2fa_verification';
            $actions[] = 'notify_security_team';
        }
        
        if ($riskScore >= 60) {
            $actions[] = 'require_email_verification';
            $actions[] = 'monitor_session_closely';
        }
        
        if (in_array('geographic_anomaly', $anomalies)) {
            $actions[] = 'verify_location';
        }
        
        if (in_array('new_device', $anomalies)) {
            $actions[] = 'verify_device';
        }
        
        return $actions;
    }

    /**
     * Monitor registration attempt with rate limiting
     */
    public function monitorRegistrationAttempt(Request $request): array
    {
        $ipAddress = $request->ip();
        $email = $request->input('email');
        
        // Check rate limiting for registrations (max 3 per hour per IP)
        $recentAttempts = SecurityEvent::where('ip_address', $ipAddress)
            ->where('event_type', 'registration_attempt')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentAttempts >= 3) {
            $this->logSecurityEvent('registration_rate_limit_exceeded', [
                'ip_address' => $ipAddress,
                'email' => $email,
                'attempts_count' => $recentAttempts
            ]);
            
            return [
                'allowed' => false,
                'message' => 'Too many registration attempts. Please try again later.'
            ];
        }

        // Log the registration attempt
        $this->logSecurityEvent('registration_attempt', [
            'ip_address' => $ipAddress,
            'email' => $email,
            'user_agent' => $request->userAgent()
        ]);

        return ['allowed' => true];
    }

    /**
     * Monitor password reset attempt with rate limiting
     */
    public function monitorPasswordResetAttempt(Request $request): array
    {
        $ipAddress = $request->ip();
        $email = $request->input('email');
        
        // Check rate limiting for password resets (max 5 per hour per IP)
        $recentAttempts = SecurityEvent::where('ip_address', $ipAddress)
            ->where('event_type', 'password_reset_attempt')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentAttempts >= 5) {
            $this->logSecurityEvent('password_reset_rate_limit_exceeded', [
                'ip_address' => $ipAddress,
                'email' => $email,
                'attempts_count' => $recentAttempts
            ]);
            
            return [
                'allowed' => false,
                'message' => 'Too many password reset attempts. Please try again later.'
            ];
        }

        // Log the password reset attempt
        $this->logSecurityEvent('password_reset_attempt', [
            'ip_address' => $ipAddress,
            'email' => $email,
            'user_agent' => $request->userAgent()
        ]);

        return ['allowed' => true];
    }

    /**
     * Convert risk level string to numeric score
     */
    private function convertRiskLevelToScore(string $riskLevel): int
    {
        return match($riskLevel) {
            'critical' => 90,
            'high' => 70,
            'medium' => 50,
            'low' => 30,
            default => 0
        };
    }
}
