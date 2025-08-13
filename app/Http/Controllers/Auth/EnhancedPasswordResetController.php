<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Security\AuthenticationSecurityService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Enhanced Password Reset Controller
 * 
 * Provides secure password reset functionality with comprehensive
 * security measures including timing attack protection, rate limiting,
 * and audit logging.
 */
class EnhancedPasswordResetController extends Controller
{
    private AuthenticationSecurityService $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset OTP request with enhanced security.
     */
    public function sendOtp(Request $request): \Illuminate\Http\JsonResponse
    {
        // Rate limiting check
        $rateLimitKey = 'password-reset:' . $request->ip();
        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $this->securityService->auditPasswordReset(
                $request->input('email', 'unknown'),
                $request,
                'request_otp',
                'rate_limited',
                ['rate_limit_key' => $rateLimitKey]
            );

            $seconds = RateLimiter::availableIn($rateLimitKey);
            return response()->json([
                'errors' => ['email' => ['Too many password reset attempts. Try again in ' . ceil($seconds / 60) . ' minutes.']]
            ], 429);
        }

        // Validate the request
        $validatedData = $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'The email field is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.exists' => 'There is no account associated with this email.',
        ]);

        $email = $validatedData['email'];

        // Check for existing recent reset attempts
        $recentAttempt = DB::table('password_reset_audit')
            ->where('email', $email)
            ->where('action', 'request_otp')
            ->where('performed_at', '>=', now()->subMinutes(5))
            ->first();

        if ($recentAttempt) {
            $this->securityService->auditPasswordReset(
                $email,
                $request,
                'request_otp',
                'too_frequent',
                ['last_attempt' => $recentAttempt->performed_at]
            );

            return response()->json([
                'errors' => ['email' => ['A password reset was recently requested. Please check your email or wait 5 minutes before requesting again.']]
            ], 429);
        }

        // Generate a cryptographically secure 6-digit OTP
        $otp = $this->generateSecureOtp();
        $otpHash = Hash::make($otp);

        // Store OTP securely with expiration
        $resetData = [
            'email' => $email,
            'token' => $otpHash,
            'created_at' => now(),
            'expires_at' => now()->addMinutes(15), // 15-minute expiration
            'attempts' => 0,
            'max_attempts' => 3,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ];

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            $resetData
        );

        // Send OTP via email with security notice
        $this->sendSecureOtpEmail($email, $otp, $request);

        // Audit the OTP request
        $this->securityService->auditPasswordReset(
            $email,
            $request,
            'request_otp',
            'success',
            ['otp_hash' => $otpHash, 'expires_at' => now()->addMinutes(15)]
        );

        // Hit rate limiter
        RateLimiter::hit($rateLimitKey, 3600); // 1 hour decay

        return response()->json([
            'status' => 'success',
            'message' => 'Security code sent to your email address.',
            'expires_in_minutes' => 15
        ]);
    }

    /**
     * Verify OTP with timing attack protection.
     */
    public function verifyOtp(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $email = $request->input('email');
        $providedOtp = $request->input('otp');

        // Rate limiting for OTP verification
        $rateLimitKey = 'otp-verify:' . $request->ip() . ':' . $email;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            $this->securityService->auditPasswordReset(
                $email,
                $request,
                'verify_otp',
                'rate_limited'
            );

            return response()->json([
                'errors' => ['otp' => ['Too many verification attempts. Please request a new code.']]
            ], 429);
        }

        // Retrieve reset record
        $resetRecord = DB::table('password_reset_tokens')->where('email', $email)->first();

        // Timing attack protection: always perform operations even if record doesn't exist
        $isValidEmail = !is_null($resetRecord);
        $isNotExpired = $isValidEmail && Carbon::parse($resetRecord->expires_at ?? now()->subDay())->isFuture();
        $hasAttemptsLeft = $isValidEmail && ($resetRecord->attempts ?? 0) < ($resetRecord->max_attempts ?? 0);
        $isValidOtp = false;

        // Always hash the provided OTP to prevent timing attacks
        $dummyHash = '$2y$10$' . str_repeat('a', 53); // Dummy bcrypt hash
        $hashToCheck = $isValidEmail ? $resetRecord->token : $dummyHash;

        // Perform constant-time comparison
        $isValidOtp = $this->constantTimeOtpVerification($providedOtp, $hashToCheck);

        // Final validation combining all checks
        $isValid = $isValidEmail && $isNotExpired && $hasAttemptsLeft && $isValidOtp;

        if (!$isValid) {
            // Update attempt counter for valid email
            if ($isValidEmail) {
                DB::table('password_reset_tokens')
                    ->where('email', $email)
                    ->increment('attempts');
            }

            // Audit failed verification
            $this->securityService->auditPasswordReset(
                $email,
                $request,
                'verify_otp',
                'failure',
                [
                    'failure_reason' => !$isValidEmail ? 'invalid_email' : 
                                      (!$isNotExpired ? 'expired' : 
                                      (!$hasAttemptsLeft ? 'max_attempts' : 'invalid_otp')),
                    'attempts' => ($resetRecord->attempts ?? 0) + 1
                ]
            );

            RateLimiter::hit($rateLimitKey, 1800); // 30 minutes

            return response()->json([
                'errors' => ['otp' => ['The provided security code is invalid or has expired.']]
            ], 422);
        }

        // Mark OTP as verified
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->update([
                'verified_at' => now(),
                'verification_ip' => $request->ip()
            ]);

        // Audit successful verification
        $this->securityService->auditPasswordReset(
            $email,
            $request,
            'verify_otp',
            'success'
        );

        // Clear rate limiting
        RateLimiter::clear($rateLimitKey);

        return response()->json([
            'status' => 'success',
            'message' => 'Security code verified successfully.'
        ]);
    }

    /**
     * Reset the user's password with enhanced security.
     */
    public function resetPassword(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'newPassword' => [
                'required',
                'string',
                'min:12',
                'regex:/[a-z]/',      // at least one lowercase
                'regex:/[A-Z]/',      // at least one uppercase
                'regex:/[0-9]/',      // at least one digit
                'regex:/[@$!%*?&#]/', // at least one special character
                'confirmed'
            ],
            'newPassword_confirmation' => 'required|string|min:12'
        ]);

        $email = $request->input('email');

        // Verify that OTP was recently verified
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$resetRecord || 
            !$resetRecord->verified_at || 
            Carbon::parse($resetRecord->verified_at)->addMinutes(15)->isPast()) {
            
            $this->securityService->auditPasswordReset(
                $email,
                $request,
                'reset_password',
                'failure',
                ['failure_reason' => 'otp_not_verified']
            );

            return response()->json([
                'errors' => ['email' => ['Security verification expired. Please start the reset process again.']]
            ], 422);
        }

        // Find the user
        $user = \App\Models\User::where('email', $email)->first();

        if (!$user) {
            $this->securityService->auditPasswordReset(
                $email,
                $request,
                'reset_password',
                'failure',
                ['failure_reason' => 'user_not_found']
            );

            return response()->json([
                'errors' => ['email' => ['No user found with this email address.']]
            ], 422);
        }

        // Check if new password is different from current
        if (Hash::check($request->input('newPassword'), $user->password)) {
            $this->securityService->auditPasswordReset(
                $email,
                $request,
                'reset_password',
                'failure',
                ['failure_reason' => 'same_password']
            );

            return response()->json([
                'errors' => ['newPassword' => ['New password must be different from your current password.']]
            ], 422);
        }

        // Update the user's password
        $user->password = Hash::make($request->input('newPassword'));
        $user->password_changed_at = now();
        $user->save();

        // Invalidate all user sessions except current
        $this->securityService->invalidateOtherSessions($user);

        // Clean up password reset tokens
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Audit successful password reset
        $this->securityService->auditPasswordReset(
            $email,
            $request,
            'reset_password',
            'success',
            ['user_id' => $user->id]
        );

        // Log authentication event
        $this->securityService->logAuthEvent('password_reset_completed', [
            'user_id' => $user->id,
            'email' => $email,
            'status' => 'success'
        ]);

        // Send security notification email
        $this->sendPasswordChangeNotification($user, $request);

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully. Please log in with your new password.'
        ]);
    }

    /**
     * Private helper methods
     */

    private function generateSecureOtp(): string
    {
        // Use cryptographically secure random number generation
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function constantTimeOtpVerification(string $providedOtp, string $storedHash): bool
    {
        // Use Laravel's Hash::check which is resistant to timing attacks
        return Hash::check($providedOtp, $storedHash);
    }

    private function sendSecureOtpEmail(string $email, string $otp, Request $request): void
    {
        $locationData = $this->getLocationFromIp($request->ip());
        
        $emailData = [
            'otp' => $otp,
            'expires_in' => 15,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'location' => $locationData['city'] ?? 'Unknown Location',
            'timestamp' => now()->format('Y-m-d H:i:s T')
        ];

        Mail::send('emails.password-reset-otp', $emailData, function ($message) use ($email) {
            $message->to($email)
                    ->subject('Security Code for Password Reset - Aero-HR');
        });
    }

    private function sendPasswordChangeNotification($user, Request $request): void
    {
        $locationData = $this->getLocationFromIp($request->ip());
        
        $emailData = [
            'user_name' => $user->name,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'location' => $locationData['city'] ?? 'Unknown Location',
            'timestamp' => now()->format('Y-m-d H:i:s T')
        ];

        Mail::send('emails.password-changed-notification', $emailData, function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Password Changed Successfully - Aero-HR');
        });
    }

    private function getLocationFromIp(string $ipAddress): array
    {
        // Simple IP geolocation - in production, use a reliable service
        if ($ipAddress === '127.0.0.1' || $ipAddress === '::1') {
            return ['city' => 'Local Development', 'country' => 'Local'];
        }

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(3)
                ->get("http://ip-api.com/json/{$ipAddress}");
            
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'city' => $data['city'] ?? 'Unknown',
                    'country' => $data['country'] ?? 'Unknown'
                ];
            }
        } catch (\Exception $e) {
            // Fail silently for location lookup
        }

        return ['city' => 'Unknown Location', 'country' => 'Unknown'];
    }
}
