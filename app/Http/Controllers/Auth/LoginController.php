<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ModernAuthenticationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    protected ModernAuthenticationService $authService;

    public function __construct(ModernAuthenticationService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $email = $request->email;
        $password = $request->password;
        $remember = $request->boolean('remember');

        // Check rate limiting
        $key = 'login.' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            $this->authService->logAuthenticationEvent(
                null,
                'login_rate_limited',
                'failure',
                $request,
                ['email' => $email, 'retry_after' => $seconds]
            );

            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        // Check if account is locked
        if ($this->authService->isAccountLocked($email)) {
            $this->authService->logAuthenticationEvent(
                null,
                'login_account_locked',
                'failure',
                $request,
                ['email' => $email]
            );

            throw ValidationException::withMessages([
                'email' => 'This account has been temporarily locked due to multiple failed login attempts.',
            ]);
        }

        // Find user
        $user = User::where('email', $email)->first();

        // Validate credentials
        if (!$user || !Hash::check($password, $user->password)) {
            RateLimiter::hit($key, 60); // 1 minute decay

            $this->authService->recordFailedAttempt(
                $email,
                $request,
                $user ? 'invalid_password' : 'invalid_email'
            );

            $this->authService->logAuthenticationEvent(
                $user,
                'login_failed',
                'failure',
                $request,
                ['email' => $email, 'reason' => 'invalid_credentials']
            );

            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        // Check if user account is active
        if (!$user->is_active) {
            $this->authService->logAuthenticationEvent(
                $user,
                'login_inactive_account',
                'failure',
                $request
            );

            throw ValidationException::withMessages([
                'email' => 'This account has been deactivated. Please contact your administrator.',
            ]);
        }

        // Clear rate limiting on successful login
        RateLimiter::clear($key);

        // Login user
        Auth::login($user, $remember);

        // Update login statistics
        $this->authService->updateLoginStats($user, $request);

        // Track session
        $this->authService->trackUserSession($user, $request);

        // Log successful login
        $this->authService->logAuthenticationEvent(
            $user,
            'login_success',
            'success',
            $request
        );

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();

        if ($user) {
            // Log logout event
            $this->authService->logAuthenticationEvent(
                $user,
                'logout',
                'success',
                $request
            );

            // Update session tracking
            $sessionId = session()->getId();
            DB::table('user_sessions')
                ->where('session_id', $sessionId)
                ->update([
                    'is_current' => false,
                    'updated_at' => now(),
                ]);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
