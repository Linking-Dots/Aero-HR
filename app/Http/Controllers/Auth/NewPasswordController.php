<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthenticationSecurityService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    protected $securityService;

    public function __construct(AuthenticationSecurityService $securityService)
    {
        $this->securityService = $securityService;
    }
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Check password reset rate limiting
        $result = $this->securityService->monitorPasswordResetAttempt($request);
        
        if (!$result['allowed']) {
            return back()->withErrors([
                'email' => 'Too many password reset attempts. Please try again later.'
            ]);
        }

        // Log password reset attempt
        $this->logPasswordResetAudit($request, 'attempt', 'pending');

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Log successful password reset
                $this->securityService->logSecurityEvent('password_reset', [
                    'user_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'email' => $user->email
                ]);

                // Log in audit table
                $this->logPasswordResetAudit($request, 'reset', 'success');

                event(new PasswordReset($user));
            }
        );

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', __($status));
        }

        // Log failed password reset
        $this->logPasswordResetAudit($request, 'reset', 'failed');

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    /**
     * Log password reset audit trail
     */
    private function logPasswordResetAudit(Request $request, string $action, string $status): void
    {
        try {
            DB::table('password_reset_audit')->insert([
                'email' => $request->email,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'action' => $action,
                'status' => $status,
                'metadata' => json_encode([
                    'token_provided' => !empty($request->token),
                    'timestamp' => now()->toISOString()
                ]),
                'performed_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log password reset audit: ' . $e->getMessage());
        }
    }
}
