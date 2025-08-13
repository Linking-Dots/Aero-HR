<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Services\AuthenticationSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Carbon\Carbon;

class AuthenticationSecurityController extends Controller
{
    protected AuthenticationSecurityService $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Show enhanced password reset page
     */
    public function showEnhancedPasswordReset(Request $request)
    {
        return Inertia::render('Auth/EnhancedPasswordReset');
    }

    /**
     * Send secure OTP for password reset
     */
    public function sendSecureOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $email = $request->email;
        $key = 'password_reset_otp:' . $email;

        // Rate limiting - 3 attempts per 15 minutes
        $rateLimitKey = 'password_reset_attempts:' . $request->ip() . ':' . $email;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            throw ValidationException::withMessages([
                'email' => ['Too many password reset attempts. Please try again in 15 minutes.'],
            ]);
        }

        RateLimiter::hit($rateLimitKey, 900); // 15 minutes

        try {
            // Generate secure OTP with timing attack protection
            $otp = $this->generateSecureOTP();
            $hashedOtp = Hash::make($otp);
            
            // Store OTP with expiration
            Cache::put($key, [
                'hashed_otp' => $hashedOtp,
                'attempts' => 0,
                'expires_at' => now()->addMinutes(10),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ], 600); // 10 minutes

            // Get user for logging
            $user = DB::table('users')->where('email', $email)->first();

            // Log the OTP request
            $this->securityService->logSecurityEvent('password_reset_otp_sent', [
                'user_id' => $user->id,
                'email' => $email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Send OTP via email (implement your email service)
            $this->sendOTPEmail($email, $otp, $user);

            return response()->json([
                'success' => true,
                'message' => 'OTP sent to your email address',
                'expires_in' => 600 // 10 minutes in seconds
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send password reset OTP', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.'
            ], 500);
        }
    }

    /**
     * Verify secure OTP with timing attack protection
     */
    public function verifySecureOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $email = $request->email;
        $otp = $request->otp;
        $key = 'password_reset_otp:' . $email;

        // Get stored OTP data
        $otpData = Cache::get($key);
        
        if (!$otpData) {
            throw ValidationException::withMessages([
                'otp' => ['OTP has expired or is invalid. Please request a new one.'],
            ]);
        }

        // Check expiration
        if (now()->gt($otpData['expires_at'])) {
            Cache::forget($key);
            throw ValidationException::withMessages([
                'otp' => ['OTP has expired. Please request a new one.'],
            ]);
        }

        // Rate limiting for OTP verification
        $otpData['attempts']++;
        if ($otpData['attempts'] > 3) {
            Cache::forget($key);
            throw ValidationException::withMessages([
                'otp' => ['Too many failed attempts. Please request a new OTP.'],
            ]);
        }

        // Timing attack protection - use hash_equals for constant time comparison
        $isValid = $this->verifyOTPWithTimingProtection($otp, $otpData['hashed_otp']);

        if (!$isValid) {
            // Update attempts count
            Cache::put($key, $otpData, $otpData['expires_at']->diffInSeconds(now()));
            
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP. Please check and try again.'],
            ]);
        }

        // OTP is valid - generate password reset token
        $resetToken = $this->generateSecureResetToken();
        $tokenKey = 'password_reset_token:' . $email;
        
        Cache::put($tokenKey, [
            'token' => Hash::make($resetToken),
            'verified_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ], 1800); // 30 minutes

        // Clear the OTP
        Cache::forget($key);

        // Get user for logging
        $user = DB::table('users')->where('email', $email)->first();

        // Log successful verification
        $this->securityService->logSecurityEvent('password_reset_otp_verified', [
            'user_id' => $user->id,
            'email' => $email,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully',
            'reset_token' => $resetToken,
            'expires_in' => 1800 // 30 minutes
        ]);
    }

    /**
     * Complete password reset
     */
    public function completePasswordReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:12|confirmed',
        ]);

        $email = $request->email;
        $token = $request->token;
        $tokenKey = 'password_reset_token:' . $email;

        // Get stored token data
        $tokenData = Cache::get($tokenKey);
        
        if (!$tokenData) {
            throw ValidationException::withMessages([
                'token' => ['Reset token is invalid or has expired.'],
            ]);
        }

        // Verify token with timing protection
        if (!Hash::check($token, $tokenData['token'])) {
            Cache::forget($tokenKey);
            throw ValidationException::withMessages([
                'token' => ['Invalid reset token.'],
            ]);
        }

        try {
            // Update user password
            $user = DB::table('users')->where('email', $email)->first();
            
            DB::table('users')
                ->where('email', $email)
                ->update([
                    'password' => Hash::make($request->password),
                    'password_changed_at' => now(),
                    'updated_at' => now()
                ]);

            // Clear the reset token
            Cache::forget($tokenKey);

            // Revoke all existing sessions for security
            DB::table('user_sessions_tracking')
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'ended_at' => now(),
                    'end_reason' => 'password_reset',
                    'updated_at' => now()
                ]);

            // Log successful password reset
            $this->securityService->logSecurityEvent('password_reset_completed', [
                'user_id' => $user->id,
                'email' => $email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'sessions_revoked' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully. All sessions have been logged out for security.'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to complete password reset', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password. Please try again.'
            ], 500);
        }
    }

    /**
     * Get authentication events for the user
     */
    public function getAuthEvents(Request $request)
    {
        $user = Auth::user();
        $limit = $request->query('limit', 50);
        $eventType = $request->query('type');

        $query = DB::table('auth_audit_logs')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($eventType) {
            $query->where('event_type', $eventType);
        }

        $events = $query->get()->map(function ($event) {
            return [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'description' => $event->description,
                'ip_address' => $event->ip_address,
                'user_agent' => $event->user_agent,
                'location' => json_decode($event->location_data, true),
                'risk_level' => $event->risk_level,
                'success' => $event->success,
                'created_at' => $event->created_at,
                'metadata' => json_decode($event->metadata, true)
            ];
        });

        return response()->json([
            'events' => $events,
            'total' => $events->count()
        ]);
    }

    /**
     * Get authentication statistics
     */
    public function getStatistics(Request $request)
    {
        $user = Auth::user();
        $period = $request->query('period', 30); // days

        $startDate = now()->subDays($period);

        $statistics = [
            'total_logins' => DB::table('auth_audit_logs')
                ->where('user_id', $user->id)
                ->where('event_type', 'login')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'failed_logins' => DB::table('auth_audit_logs')
                ->where('user_id', $user->id)
                ->where('event_type', 'login_failed')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'unique_locations' => DB::table('auth_audit_logs')
                ->where('user_id', $user->id)
                ->where('created_at', '>=', $startDate)
                ->whereNotNull('location_data')
                ->distinct()
                ->count('location_data'),
            'security_events' => DB::table('security_incidents')
                ->where('user_id', $user->id)
                ->where('created_at', '>=', $startDate)
                ->count(),
            'password_changes' => DB::table('auth_audit_logs')
                ->where('user_id', $user->id)
                ->where('event_type', 'password_changed')
                ->where('created_at', '>=', $startDate)
                ->count()
        ];

        return response()->json($statistics);
    }

    /**
     * Verify user location
     */
    public function verifyLocation(Request $request)
    {
        $request->validate([
            'verification_method' => 'required|in:email,sms',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric'
        ]);

        $user = Auth::user();
        $method = $request->verification_method;

        try {
            // Generate verification code
            $verificationCode = random_int(100000, 999999);
            
            // Store verification data
            Cache::put("location_verification:{$user->id}", [
                'code' => Hash::make($verificationCode),
                'method' => $method,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'expires_at' => now()->addMinutes(10)
            ], 600);

            // Send verification code
            if ($method === 'email') {
                $this->sendLocationVerificationEmail($user, $verificationCode);
            } else {
                $this->sendLocationVerificationSMS($user, $verificationCode);
            }

            // Log the verification request
            $this->securityService->logSecurityEvent('location_verification_requested', [
                'user_id' => $user->id,
                'method' => $method,
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Verification code sent via {$method}"
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send location verification', [
                'user_id' => $user->id,
                'method' => $method,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code'
            ], 500);
        }
    }

    /**
     * Report suspicious activity
     */
    public function reportSuspicious(Request $request)
    {
        $request->validate([
            'activity_type' => 'required|string',
            'description' => 'required|string|max:1000',
            'session_id' => 'nullable|string'
        ]);

        $user = Auth::user();

        try {
            // Create security incident
            $incidentId = DB::table('security_incidents')->insertGetId([
                'user_id' => $user->id,
                'type' => 'user_reported',
                'severity' => 'medium',
                'title' => "User reported: {$request->activity_type}",
                'description' => $request->description,
                'status' => 'open',
                'metadata' => json_encode([
                    'activity_type' => $request->activity_type,
                    'session_id' => $request->session_id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Log the report
            $this->securityService->logSecurityEvent('suspicious_activity_reported', [
                'user_id' => $user->id,
                'incident_id' => $incidentId,
                'activity_type' => $request->activity_type,
                'description' => $request->description
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Suspicious activity reported successfully',
                'incident_id' => $incidentId
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to report suspicious activity', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to report activity'
            ], 500);
        }
    }

    /**
     * Get security incidents
     */
    public function getIncidents(Request $request)
    {
        $this->authorize('manage-security');

        $status = $request->query('status', 'all');
        $severity = $request->query('severity', 'all');
        $limit = $request->query('limit', 50);

        $query = DB::table('security_incidents')
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($severity !== 'all') {
            $query->where('severity', $severity);
        }

        $incidents = $query->get();

        return response()->json([
            'incidents' => $incidents,
            'total' => $incidents->count()
        ]);
    }

    /**
     * Create security incident
     */
    public function createIncident(Request $request)
    {
        $this->authorize('manage-security');

        $request->validate([
            'type' => 'required|string',
            'severity' => 'required|in:low,medium,high,critical',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'user_id' => 'nullable|exists:users,id'
        ]);

        try {
            $incidentId = DB::table('security_incidents')->insertGetId([
                'type' => $request->type,
                'severity' => $request->severity,
                'title' => $request->title,
                'description' => $request->description,
                'user_id' => $request->user_id,
                'status' => 'open',
                'created_by' => Auth::id(),
                'metadata' => json_encode($request->except(['type', 'severity', 'title', 'description', 'user_id'])),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Security incident created successfully',
                'incident_id' => $incidentId
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create security incident', [
                'admin_user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create incident'
            ], 500);
        }
    }

    // Private helper methods

    private function generateSecureOTP(): string
    {
        return str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function generateSecureResetToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    private function verifyOTPWithTimingProtection(string $otp, string $hashedOtp): bool
    {
        // Use Hash::check for timing attack protection
        return Hash::check($otp, $hashedOtp);
    }

    private function sendOTPEmail(string $email, string $otp, $user): void
    {
        // Implement email sending logic
        // For now, just log the OTP (remove in production)
        Log::info("Password reset OTP for {$email}: {$otp}");
    }

    private function sendLocationVerificationEmail($user, string $code): void
    {
        // Implement email sending logic
        Log::info("Location verification code for {$user->email}: {$code}");
    }

    private function sendLocationVerificationSMS($user, string $code): void
    {
        // Implement SMS sending logic
        Log::info("Location verification SMS for {$user->phone}: {$code}");
    }
}
