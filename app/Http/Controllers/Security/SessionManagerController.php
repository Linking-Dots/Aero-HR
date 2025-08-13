<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Services\AuthenticationSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Carbon\Carbon;

class SessionManagerController extends Controller
{
    protected AuthenticationSecurityService $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Display session management page
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $sessions = $this->getUserActiveSessions($user);
        $securityMetrics = $this->getSessionSecurityMetrics($user);
        
        return Inertia::render('Auth/EnhancedSessionManager', [
            'auth' => [
                'user' => $user
            ],
            'sessions' => $sessions,
            'securityMetrics' => $securityMetrics
        ]);
    }

    /**
     * Get active sessions for API endpoint
     */
    public function getActiveSessionsAPI(Request $request)
    {
        $user = Auth::user();
        $sessions = $this->getUserActiveSessions($user);
        
        return response()->json([
            'sessions' => $sessions,
            'total' => count($sessions),
            'last_updated' => now()->toISOString()
        ]);
    }

    /**
     * Revoke a specific session
     */
    public function revokeSession(Request $request, $sessionId)
    {
        $user = Auth::user();
        $currentSessionId = session()->getId();
        
        // Prevent users from revoking their current session
        if ($sessionId === $currentSessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot revoke current session'
            ], 400);
        }

        try {
            // Find the session
            $session = DB::table('user_sessions_tracking')
                ->where('id', $sessionId)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }

            // Mark session as revoked
            DB::table('user_sessions_tracking')
                ->where('id', $sessionId)
                ->update([
                    'is_active' => false,
                    'ended_at' => now(),
                    'end_reason' => 'manually_revoked',
                    'updated_at' => now()
                ]);

            // Also remove from Laravel sessions table if it exists
            DB::table('sessions')
                ->where('id', $session->session_id)
                ->delete();

            // Log the action
            $this->securityService->logSecurityEvent('session_revoked', [
                'user_id' => $user->id,
                'revoked_session_id' => $sessionId,
                'session_ip' => $session->ip_address,
                'session_device' => $session->device_name,
                'revoked_by' => 'user'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Session revoked successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to revoke session', [
                'session_id' => $sessionId,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke session'
            ], 500);
        }
    }

    /**
     * Revoke all sessions except current
     */
    public function revokeAllSessions(Request $request)
    {
        $user = Auth::user();
        $currentSessionId = session()->getId();

        try {
            // Get all active sessions except current
            $sessionsToRevoke = DB::table('user_sessions_tracking')
                ->where('user_id', $user->id)
                ->where('session_id', '!=', $currentSessionId)
                ->where('is_active', true)
                ->get();

            $revokedCount = 0;

            foreach ($sessionsToRevoke as $session) {
                // Mark session as revoked
                DB::table('user_sessions_tracking')
                    ->where('id', $session->id)
                    ->update([
                        'is_active' => false,
                        'ended_at' => now(),
                        'end_reason' => 'bulk_revoked',
                        'updated_at' => now()
                    ]);

                // Remove from Laravel sessions table
                DB::table('sessions')
                    ->where('id', $session->session_id)
                    ->delete();

                $revokedCount++;
            }

            // Log the action
            $this->securityService->logSecurityEvent('all_sessions_revoked', [
                'user_id' => $user->id,
                'revoked_count' => $revokedCount,
                'revoked_by' => 'user'
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully revoked {$revokedCount} sessions",
                'revoked_count' => $revokedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to revoke all sessions', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke sessions'
            ], 500);
        }
    }

    /**
     * Bulk revoke selected sessions
     */
    public function bulkRevokeSessions(Request $request)
    {
        $request->validate([
            'session_ids' => 'required|array|min:1',
            'session_ids.*' => 'required|string'
        ]);

        $user = Auth::user();
        $currentSessionId = session()->getId();
        $sessionIds = $request->session_ids;

        // Remove current session from the list
        $sessionIds = array_filter($sessionIds, fn($id) => $id !== $currentSessionId);

        if (empty($sessionIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No valid sessions to revoke'
            ], 400);
        }

        try {
            $revokedCount = 0;

            foreach ($sessionIds as $sessionId) {
                $session = DB::table('user_sessions_tracking')
                    ->where('id', $sessionId)
                    ->where('user_id', $user->id)
                    ->where('is_active', true)
                    ->first();

                if ($session) {
                    // Mark session as revoked
                    DB::table('user_sessions_tracking')
                        ->where('id', $sessionId)
                        ->update([
                            'is_active' => false,
                            'ended_at' => now(),
                            'end_reason' => 'bulk_revoked',
                            'updated_at' => now()
                        ]);

                    // Remove from Laravel sessions table
                    DB::table('sessions')
                        ->where('id', $session->session_id)
                        ->delete();

                    $revokedCount++;
                }
            }

            // Log the action
            $this->securityService->logSecurityEvent('bulk_sessions_revoked', [
                'user_id' => $user->id,
                'session_ids' => $sessionIds,
                'revoked_count' => $revokedCount,
                'revoked_by' => 'user'
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully revoked {$revokedCount} sessions",
                'revoked_count' => $revokedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to bulk revoke sessions', [
                'user_id' => $user->id,
                'session_ids' => $sessionIds,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke sessions'
            ], 500);
        }
    }

    /**
     * Get detailed session information
     */
    public function getSessionDetails(Request $request, $sessionId)
    {
        $user = Auth::user();

        $session = DB::table('user_sessions_tracking')
            ->where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found'
            ], 404);
        }

        // Get additional session analytics
        $sessionAnalytics = $this->getSessionAnalytics($sessionId);

        $sessionDetails = [
            'id' => $session->id,
            'session_id' => $session->session_id,
            'ip_address' => $session->ip_address,
            'user_agent' => $session->user_agent,
            'device_name' => $session->device_name,
            'device_type' => $session->device_type,
            'browser' => $session->browser,
            'platform' => $session->platform,
            'location' => json_decode($session->location_data, true),
            'is_current' => $session->session_id === session()->getId(),
            'is_active' => $session->is_active,
            'is_verified' => $session->is_verified,
            'is_2fa_verified' => $session->is_2fa_verified,
            'created_at' => $session->created_at,
            'last_activity' => $session->last_activity,
            'ended_at' => $session->ended_at,
            'end_reason' => $session->end_reason,
            'risk_score' => $session->risk_score ?? 0,
            'security_flags' => json_decode($session->security_flags, true) ?? [],
            'device_fingerprint' => $session->device_fingerprint,
            'request_count' => $session->request_count ?? 0,
            'failed_attempts' => $session->failed_attempts ?? 0,
            'concurrent_sessions' => $session->concurrent_sessions ?? 1,
            'analytics' => $sessionAnalytics
        ];

        return response()->json([
            'success' => true,
            'session' => $sessionDetails
        ]);
    }

    /**
     * Verify a device for trusted access
     */
    public function verifyDevice(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'verification_code' => 'required|string|size:6'
        ]);

        $user = Auth::user();
        $sessionId = $request->session_id;
        $verificationCode = $request->verification_code;

        // Verify the code (this would typically involve checking a sent SMS/email code)
        if (!$this->verifyDeviceCode($user, $verificationCode)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code'
            ], 400);
        }

        try {
            // Mark device as verified
            DB::table('user_sessions_tracking')
                ->where('id', $sessionId)
                ->where('user_id', $user->id)
                ->update([
                    'is_verified' => true,
                    'verified_at' => now(),
                    'updated_at' => now()
                ]);

            // Log the verification
            $this->securityService->logSecurityEvent('device_verified', [
                'user_id' => $user->id,
                'session_id' => $sessionId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Device verified successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to verify device', [
                'session_id' => $sessionId,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to verify device'
            ], 500);
        }
    }

    /**
     * Record device fingerprint for security tracking
     */
    public function recordDeviceFingerprint(Request $request)
    {
        $request->validate([
            'fingerprint' => 'required|string|max:255',
            'screen_resolution' => 'nullable|string|max:50',
            'timezone' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:10',
            'plugins' => 'nullable|array'
        ]);

        $user = Auth::user();
        $sessionId = session()->getId();

        try {
            // Update current session with fingerprint data
            DB::table('user_sessions_tracking')
                ->where('session_id', $sessionId)
                ->where('user_id', $user->id)
                ->update([
                    'device_fingerprint' => $request->fingerprint,
                    'fingerprint_data' => json_encode($request->except('fingerprint')),
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Device fingerprint recorded'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to record device fingerprint', [
                'user_id' => $user->id,
                'fingerprint' => $request->fingerprint,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to record fingerprint'
            ], 500);
        }
    }

    /**
     * Trust a device for future logins
     */
    public function trustDevice(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'trust_duration' => 'required|integer|min:1|max:90' // days
        ]);

        $user = Auth::user();
        $sessionId = $request->session_id;
        $trustDuration = $request->trust_duration;

        try {
            $session = DB::table('user_sessions_tracking')
                ->where('id', $sessionId)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session not found'
                ], 404);
            }

            // Create trusted device entry
            DB::table('trusted_devices')->updateOrInsert([
                'user_id' => $user->id,
                'device_fingerprint' => $session->device_fingerprint
            ], [
                'device_name' => $session->device_name,
                'browser' => $session->browser,
                'platform' => $session->platform,
                'trusted_until' => now()->addDays($trustDuration),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Log the action
            $this->securityService->logSecurityEvent('device_trusted', [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'device_fingerprint' => $session->device_fingerprint,
                'trust_duration' => $trustDuration
            ]);

            return response()->json([
                'success' => true,
                'message' => "Device trusted for {$trustDuration} days"
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to trust device', [
                'session_id' => $sessionId,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to trust device'
            ], 500);
        }
    }

    /**
     * Session heartbeat for real-time activity tracking
     */
    public function sessionHeartbeat(Request $request)
    {
        $user = Auth::user();
        $sessionId = session()->getId();

        try {
            // Update session activity
            DB::table('user_sessions_tracking')
                ->where('session_id', $sessionId)
                ->where('user_id', $user->id)
                ->update([
                    'last_activity' => now(),
                    'request_count' => DB::raw('request_count + 1'),
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update heartbeat'
            ], 500);
        }
    }

    /**
     * Get live session data for real-time updates
     */
    public function getLiveSessions(Request $request)
    {
        $user = Auth::user();
        
        $sessions = $this->getUserActiveSessions($user);
        
        return response()->json([
            'sessions' => $sessions,
            'active_count' => count(array_filter($sessions, fn($s) => $s['is_active'])),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Force logout a user (admin only)
     */
    public function forceUserLogout(Request $request, $userId)
    {
        $this->authorize('manage-security');

        try {
            // Revoke all sessions for the user
            $revokedCount = DB::table('user_sessions_tracking')
                ->where('user_id', $userId)
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'ended_at' => now(),
                    'end_reason' => 'admin_forced_logout',
                    'updated_at' => now()
                ]);

            // Remove from Laravel sessions table
            $sessionIds = DB::table('user_sessions_tracking')
                ->where('user_id', $userId)
                ->pluck('session_id');

            DB::table('sessions')
                ->whereIn('id', $sessionIds)
                ->delete();

            // Log the admin action
            $this->securityService->logSecurityEvent('admin_forced_logout', [
                'target_user_id' => $userId,
                'admin_user_id' => Auth::id(),
                'revoked_sessions' => $revokedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => "Forced logout successful. {$revokedCount} sessions terminated.",
                'revoked_count' => $revokedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to force user logout', [
                'target_user_id' => $userId,
                'admin_user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to force logout'
            ], 500);
        }
    }

    /**
     * Get device usage analytics (admin only)
     */
    public function getDeviceAnalytics(Request $request)
    {
        $this->authorize('manage-security');

        $analytics = [
            'device_types' => DB::table('user_sessions_tracking')
                ->select('device_type', DB::raw('count(*) as count'))
                ->groupBy('device_type')
                ->get(),
            'browsers' => DB::table('user_sessions_tracking')
                ->select('browser', DB::raw('count(*) as count'))
                ->groupBy('browser')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'platforms' => DB::table('user_sessions_tracking')
                ->select('platform', DB::raw('count(*) as count'))
                ->groupBy('platform')
                ->get(),
            'geographic_distribution' => DB::table('user_sessions_tracking')
                ->select(DB::raw('JSON_EXTRACT(location_data, "$.country") as country'), DB::raw('count(*) as count'))
                ->whereNotNull('location_data')
                ->groupBy('country')
                ->orderBy('count', 'desc')
                ->limit(15)
                ->get()
        ];

        return response()->json($analytics);
    }

    // Private helper methods

    private function getUserActiveSessions($user)
    {
        return Cache::remember("user_sessions_{$user->id}", 300, function () use ($user) {
            return DB::table('user_sessions_tracking')
                ->where('user_id', $user->id)
                ->orderBy('last_activity', 'desc')
                ->get()
                ->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'session_id' => $session->session_id,
                        'ip_address' => $session->ip_address,
                        'user_agent' => $session->user_agent,
                        'device_name' => $session->device_name ?? 'Unknown Device',
                        'device_type' => $session->device_type ?? 'unknown',
                        'device_info' => $session->device_type ?? 'unknown',
                        'browser' => $session->browser ?? 'Unknown',
                        'platform' => $session->platform ?? 'Unknown',
                        'location' => json_decode($session->location_data ?? '{}', true),
                        'is_current' => $session->session_id === session()->getId(),
                        'is_active' => $session->is_active,
                        'is_verified' => $session->is_verified ?? false,
                        'is_2fa_verified' => $session->is_2fa_verified ?? false,
                        'created_at' => $session->created_at,
                        'last_activity' => $session->last_activity,
                        'ended_at' => $session->ended_at,
                        'end_reason' => $session->end_reason,
                        'risk_score' => $session->risk_score ?? 0,
                        'security_flags' => json_decode($session->security_flags ?? '[]', true),
                        'request_count' => $session->request_count ?? 0,
                        'failed_attempts' => $session->failed_attempts ?? 0,
                        'concurrent_sessions' => $session->concurrent_sessions ?? 1,
                        'is_anomalous' => $this->isSessionAnomalous($session)
                    ];
                })
                ->toArray();
        });
    }

    private function getSessionSecurityMetrics($user)
    {
        return [
            'total_sessions' => DB::table('user_sessions_tracking')->where('user_id', $user->id)->count(),
            'active_sessions' => DB::table('user_sessions_tracking')->where('user_id', $user->id)->where('is_active', true)->count(),
            'suspicious_sessions' => DB::table('user_sessions_tracking')->where('user_id', $user->id)->where('risk_score', '>', 60)->count(),
            'verified_sessions' => DB::table('user_sessions_tracking')->where('user_id', $user->id)->where('is_verified', true)->count(),
            'trusted_devices' => DB::table('trusted_devices')->where('user_id', $user->id)->where('trusted_until', '>', now())->count()
        ];
    }

    private function getSessionAnalytics($sessionId)
    {
        // This would include detailed analytics for a specific session
        return [
            'duration' => 0, // Calculate session duration
            'page_views' => 0, // Count of page views in this session
            'api_calls' => 0, // Count of API calls
            'suspicious_activities' => [] // List of suspicious activities
        ];
    }

    private function verifyDeviceCode($user, $code)
    {
        // This would verify the device verification code
        // For now, return true for demonstration
        return true;
    }

    private function isSessionAnomalous($session)
    {
        return $session->risk_score > 60 || 
               !empty(json_decode($session->security_flags ?? '[]', true)) ||
               ($session->failed_attempts ?? 0) > 3;
    }
}
