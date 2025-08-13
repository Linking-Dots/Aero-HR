<?php

namespace App\Listeners;

use App\Services\Security\AuthenticationSecurityService;
use Illuminate\Auth\Events\Attempting;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Laravel\Fortify\Events\TwoFactorAuthenticationChallenged;
use Laravel\Fortify\Events\TwoFactorAuthenticationEnabled;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;

/**
 * Enhanced Authentication Event Listener
 * 
 * Automatically logs all authentication-related events with comprehensive
 * context and security analysis for audit trails and incident detection.
 */
class EnhancedAuthenticationEventListener implements ShouldQueue
{
    use InteractsWithQueue;

    private AuthenticationSecurityService $securityService;

    /**
     * Create the event listener.
     */
    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Handle login attempt events.
     */
    public function handleAttempting(Attempting $event): void
    {
        $this->securityService->logAuthEvent('login_attempting', [
            'email' => $event->credentials['email'] ?? 'unknown',
            'guard' => $event->guard,
            'remember' => $event->remember ?? false,
            'status' => 'attempting'
        ]);
    }

    /**
     * Handle successful login events.
     */
    public function handleLogin(Login $event): void
    {
        $user = $event->user;
        $request = request();

        // Track user session
        $this->securityService->trackUserSession($user, $request);

        // Log successful login
        $this->securityService->logAuthEvent('login_success', [
            'user_id' => $user->id,
            'email' => $user->email,
            'guard' => $event->guard,
            'user_roles' => $user->roles->pluck('name')->toArray(),
            'last_login' => $user->updated_at?->toISOString(),
            'status' => 'success'
        ]);

        // Check for admin login and create high-priority log
        if ($user->hasAnyRole(['Super Administrator', 'Administrator'])) {
            $this->securityService->logAuthEvent('admin_login', [
                'user_id' => $user->id,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
                'status' => 'success'
            ]);
        }

        // Update user's last login timestamp
        $user->update(['last_login_at' => now()]);
    }

    /**
     * Handle failed login events.
     */
    public function handleFailed(Failed $event): void
    {
        $credentials = $event->credentials;
        $email = $credentials['email'] ?? 'unknown';
        
        // Determine failure reason
        $user = \App\Models\User::where('email', $email)->first();
        $failureReason = $user ? 'invalid_password' : 'invalid_email';

        // Handle failed login attempt
        $this->securityService->handleFailedLogin($email, request(), $failureReason);
    }

    /**
     * Handle logout events.
     */
    public function handleLogout(Logout $event): void
    {
        $user = $event->user;
        $request = request();
        $sessionId = session()->getId();

        // Mark session as inactive
        \Illuminate\Support\Facades\DB::table('user_sessions_tracking')
            ->where('session_id', $sessionId)
            ->where('user_id', $user->id)
            ->update([
                'is_active' => false,
                'logout_at' => now(),
                'updated_at' => now()
            ]);

        // Log logout event
        $this->securityService->logAuthEvent('logout', [
            'user_id' => $user->id,
            'email' => $user->email,
            'session_duration_minutes' => $this->calculateSessionDuration($sessionId),
            'logout_type' => $this->determineLogoutType($request),
            'status' => 'success'
        ]);
    }

    /**
     * Handle user registration events.
     */
    public function handleRegistered(Registered $event): void
    {
        $user = $event->user;

        $this->securityService->logAuthEvent('user_registered', [
            'user_id' => $user->id,
            'email' => $user->email,
            'registration_method' => 'web',
            'requires_verification' => !$user->hasVerifiedEmail(),
            'status' => 'success'
        ]);
    }

    /**
     * Handle email verification events.
     */
    public function handleVerified(Verified $event): void
    {
        $user = $event->user;

        $this->securityService->logAuthEvent('email_verified', [
            'user_id' => $user->id,
            'email' => $user->email,
            'verified_at' => now()->toISOString(),
            'status' => 'success'
        ]);
    }

    /**
     * Handle 2FA challenge events.
     */
    public function handleTwoFactorChallenged(TwoFactorAuthenticationChallenged $event): void
    {
        $user = $event->user;

        $this->securityService->audit2FA($user, 'challenged', 'totp', 'success', [
            'challenge_type' => 'login',
            'has_recovery_codes' => !empty($user->two_factor_recovery_codes)
        ]);
    }

    /**
     * Handle 2FA enabled events.
     */
    public function handleTwoFactorEnabled(TwoFactorAuthenticationEnabled $event): void
    {
        $user = $event->user;

        $this->securityService->audit2FA($user, 'enabled', 'totp', 'success', [
            'recovery_codes_generated' => !empty($user->two_factor_recovery_codes),
            'enabled_at' => now()->toISOString()
        ]);

        // Log as high-priority security event
        $this->securityService->logAuthEvent('2fa_enabled', [
            'user_id' => $user->id,
            'email' => $user->email,
            'method' => 'totp',
            'status' => 'success'
        ]);
    }

    /**
     * Handle 2FA disabled events.
     */
    public function handleTwoFactorDisabled(TwoFactorAuthenticationDisabled $event): void
    {
        $user = $event->user;

        $this->securityService->audit2FA($user, 'disabled', 'totp', 'success', [
            'disabled_at' => now()->toISOString(),
            'reason' => request()->input('reason', 'user_request')
        ]);

        // Log as critical security event (disabling 2FA is risky)
        $this->securityService->logAuthEvent('2fa_disabled', [
            'user_id' => $user->id,
            'email' => $user->email,
            'method' => 'totp',
            'reason' => request()->input('reason', 'user_request'),
            'status' => 'success'
        ]);
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe($events): void
    {
        $events->listen(
            Attempting::class,
            [self::class, 'handleAttempting']
        );

        $events->listen(
            Login::class,
            [self::class, 'handleLogin']
        );

        $events->listen(
            Failed::class,
            [self::class, 'handleFailed']
        );

        $events->listen(
            Logout::class,
            [self::class, 'handleLogout']
        );

        $events->listen(
            Registered::class,
            [self::class, 'handleRegistered']
        );

        $events->listen(
            Verified::class,
            [self::class, 'handleVerified']
        );

        $events->listen(
            TwoFactorAuthenticationChallenged::class,
            [self::class, 'handleTwoFactorChallenged']
        );

        $events->listen(
            TwoFactorAuthenticationEnabled::class,
            [self::class, 'handleTwoFactorEnabled']
        );

        $events->listen(
            TwoFactorAuthenticationDisabled::class,
            [self::class, 'handleTwoFactorDisabled']
        );
    }

    /**
     * Private helper methods
     */

    private function calculateSessionDuration(string $sessionId): ?int
    {
        $session = \Illuminate\Support\Facades\DB::table('user_sessions_tracking')
            ->where('session_id', $sessionId)
            ->first();

        if (!$session || !$session->login_at) {
            return null;
        }

        return \Carbon\Carbon::parse($session->login_at)->diffInMinutes(now());
    }

    private function determineLogoutType($request): string
    {
        // Check if it's a forced logout (security action)
        if ($request->has('security_logout')) {
            return 'security_forced';
        }

        // Check if it's a session timeout
        if ($request->has('session_timeout')) {
            return 'session_timeout';
        }

        // Check if it's from an admin action
        if ($request->has('admin_logout')) {
            return 'admin_forced';
        }

        return 'user_initiated';
    }
}
