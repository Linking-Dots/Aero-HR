<?php

namespace App\Http\Middleware;

use App\Services\Security\AuthenticationSecurityService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enhanced Authentication Security Middleware
 * 
 * Provides comprehensive security monitoring for authenticated users
 * including session validation, anomaly detection, and audit logging.
 */
class EnhancedAuthenticationSecurity
{
    private AuthenticationSecurityService $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for guest users or auth routes
        if (!Auth::check() || $this->isAuthRoute($request)) {
            return $next($request);
        }

        $user = Auth::user();

        // 1. Validate session security
        if (!$this->validateSessionSecurity($user, $request)) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            $this->securityService->logAuthEvent('session_invalidated', [
                'reason' => 'security_validation_failed',
                'status' => 'security_action'
            ]);
            
            return redirect('/login')->with('error', 'Session invalidated for security reasons.');
        }

        // 2. Check for account lockout
        if ($this->isAccountLocked($user)) {
            Auth::logout();
            return redirect('/login')->with('error', 'Account temporarily locked due to security concerns.');
        }

        // 3. Enforce 2FA for mandatory roles
        if ($this->shouldEnforce2FA($user, $request)) {
            return redirect('/two-factor-challenge');
        }

        // 4. Update session activity
        $this->updateSessionActivity($user, $request);

        // 5. Log access for sensitive routes
        if ($this->isSensitiveRoute($request)) {
            $this->securityService->logAuthEvent('sensitive_access', [
                'route' => $request->route()?->getName(),
                'path' => $request->path(),
                'method' => $request->method()
            ]);
        }

        $response = $next($request);

        // 6. Add security headers to response
        $this->addSecurityHeaders($response);

        return $response;
    }

    /**
     * Validate session security
     */
    private function validateSessionSecurity($user, Request $request): bool
    {
        $sessionId = session()->getId();
        
        // Check if session exists in our tracking table
        $sessionTrack = DB::table('user_sessions_tracking')
            ->where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if (!$sessionTrack) {
            return false; // Session not properly tracked
        }

        // Check for session hijacking indicators
        if ($this->detectSessionHijacking($sessionTrack, $request)) {
            return false;
        }

        // Check session timeout
        if ($this->isSessionExpired($sessionTrack)) {
            return false;
        }

        return true;
    }

    /**
     * Detect potential session hijacking
     */
    private function detectSessionHijacking($sessionTrack, Request $request): bool
    {
        // IP address change detection
        if ($sessionTrack->ip_address !== $request->ip()) {
            // Allow for reasonable IP changes (same subnet, etc.)
            if (!$this->isReasonableIpChange($sessionTrack->ip_address, $request->ip())) {
                $this->securityService->logAuthEvent('session_hijacking_detected', [
                    'original_ip' => $sessionTrack->ip_address,
                    'new_ip' => $request->ip(),
                    'session_id' => $sessionTrack->session_id,
                    'risk_level' => 'high',
                    'status' => 'suspicious'
                ]);
                return true;
            }
        }

        // User agent change detection
        $currentFingerprint = $this->generateDeviceFingerprint($request);
        if ($sessionTrack->device_fingerprint !== $currentFingerprint) {
            // Minor user agent changes are acceptable, major changes are suspicious
            if (!$this->isReasonableUserAgentChange($sessionTrack->user_agent, $request->userAgent())) {
                $this->securityService->logAuthEvent('device_fingerprint_changed', [
                    'original_fingerprint' => $sessionTrack->device_fingerprint,
                    'new_fingerprint' => $currentFingerprint,
                    'session_id' => $sessionTrack->session_id,
                    'risk_level' => 'medium',
                    'status' => 'suspicious'
                ]);
                return true;
            }
        }

        return false;
    }

    /**
     * Check if session has expired
     */
    private function isSessionExpired($sessionTrack): bool
    {
        $sessionLifetime = config('session.lifetime', 120); // minutes
        $lastActivity = \Carbon\Carbon::parse($sessionTrack->last_activity);
        
        return $lastActivity->addMinutes($sessionLifetime)->isPast();
    }

    /**
     * Check if account is locked
     */
    private function isAccountLocked($user): bool
    {
        // Check for active lockout due to failed attempts
        $lockout = DB::table('failed_login_attempts')
            ->where('email', $user->email)
            ->where('is_blocked', true)
            ->where(function ($query) {
                $query->whereNull('blocked_until')
                      ->orWhere('blocked_until', '>', now());
            })
            ->exists();

        // Check for security incident lockout
        $securityLockout = DB::table('security_incidents')
            ->whereJsonContains('affected_users', $user->email)
            ->whereIn('status', ['open', 'investigating'])
            ->whereIn('severity', ['high', 'critical'])
            ->exists();

        return $lockout || $securityLockout;
    }

    /**
     * Check if 2FA should be enforced
     */
    private function shouldEnforce2FA($user, Request $request): bool
    {
        // Skip 2FA routes
        if ($this->is2FARoute($request)) {
            return false;
        }

        // Check if user requires 2FA but doesn't have it enabled
        if ($this->securityService->shouldEnforce2FA($user)) {
            return true;
        }

        // Check if 2FA is required due to suspicious activity
        $sessionTrack = DB::table('user_sessions_tracking')
            ->where('session_id', session()->getId())
            ->where('user_id', $user->id)
            ->first();

        if ($sessionTrack && $sessionTrack->is_suspicious) {
            $securityFlags = json_decode($sessionTrack->security_flags, true) ?? [];
            
            // Require 2FA for geographic anomalies or new devices for admin users
            if (in_array('geographic_anomaly', $securityFlags) || 
                (in_array('new_device', $securityFlags) && $user->hasAnyRole(['Super Administrator', 'Administrator']))) {
                return !session('2fa_verified_at') || 
                       \Carbon\Carbon::parse(session('2fa_verified_at'))->addMinutes(30)->isPast();
            }
        }

        return false;
    }

    /**
     * Update session activity
     */
    private function updateSessionActivity($user, Request $request): void
    {
        DB::table('user_sessions_tracking')
            ->where('session_id', session()->getId())
            ->where('user_id', $user->id)
            ->update([
                'last_activity' => now(),
                'updated_at' => now()
            ]);
    }

    /**
     * Add security headers to response
     */
    private function addSecurityHeaders(Response $response): void
    {
        $securityHeaders = $this->securityService->getSecurityConfig('security_headers', []);
        
        // Default security headers
        $headers = array_merge([
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'X-XSS-Protection' => '1; mode=block',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=()',
        ], $securityHeaders);

        // Add HSTS only on HTTPS
        if (request()->isSecure()) {
            $headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
        }

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }
    }

    /**
     * Helper methods
     */
    
    private function isAuthRoute(Request $request): bool
    {
        $authRoutes = [
            'login', 'register', 'password.request', 'password.email',
            'password.reset', 'password.update', 'verification.notice',
            'verification.verify', 'verification.send'
        ];
        
        return in_array($request->route()?->getName(), $authRoutes);
    }

    private function is2FARoute(Request $request): bool
    {
        $twoFactorRoutes = [
            'two-factor.login', 'two-factor.enable', 'two-factor.confirm',
            'two-factor.disable', 'two-factor.recovery-codes'
        ];
        
        return in_array($request->route()?->getName(), $twoFactorRoutes) ||
               str_contains($request->path(), 'two-factor');
    }

    private function isSensitiveRoute(Request $request): bool
    {
        $sensitivePatterns = [
            'admin/', 'roles/', 'users/', 'permissions/', 'settings/',
            'security/', 'audit/', 'compliance/', 'reports/'
        ];
        
        $path = $request->path();
        
        foreach ($sensitivePatterns as $pattern) {
            if (str_contains($path, $pattern)) {
                return true;
            }
        }
        
        return false;
    }

    private function isReasonableIpChange(string $originalIp, string $newIp): bool
    {
        // Allow localhost/private IP changes
        if ($originalIp === '127.0.0.1' || $newIp === '127.0.0.1' ||
            preg_match('/^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./', $originalIp) ||
            preg_match('/^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\./', $newIp)) {
            return true;
        }

        // Check if IPs are in the same subnet (simplified)
        $originalParts = explode('.', $originalIp);
        $newParts = explode('.', $newIp);
        
        // Same /16 subnet might be reasonable for mobile users
        return $originalParts[0] === $newParts[0] && $originalParts[1] === $newParts[1];
    }

    private function isReasonableUserAgentChange(string $originalUA, string $newUA): bool
    {
        // Extract browser and version info
        $originalBrowser = $this->extractBrowserInfo($originalUA);
        $newBrowser = $this->extractBrowserInfo($newUA);
        
        // Same browser family is usually OK
        return $originalBrowser['family'] === $newBrowser['family'];
    }

    private function extractBrowserInfo(string $userAgent): array
    {
        $browsers = [
            'Chrome' => '/Chrome\/([0-9.]+)/',
            'Firefox' => '/Firefox\/([0-9.]+)/',
            'Safari' => '/Version\/([0-9.]+).*Safari/',
            'Edge' => '/Edge\/([0-9.]+)/',
            'Opera' => '/Opera\/([0-9.]+)/'
        ];
        
        foreach ($browsers as $browser => $pattern) {
            if (preg_match($pattern, $userAgent, $matches)) {
                return [
                    'family' => $browser,
                    'version' => $matches[1] ?? 'unknown'
                ];
            }
        }
        
        return ['family' => 'unknown', 'version' => 'unknown'];
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
}
