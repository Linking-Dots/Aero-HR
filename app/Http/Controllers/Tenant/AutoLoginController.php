<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Services\TenantLoginTokenService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AutoLoginController extends Controller
{
    public function __construct(
        private TenantLoginTokenService $tokenService
    ) {}

    /**
     * Handle auto-login with token from registration flow
     */
    public function autoLogin(Request $request)
    {
        $token = $request->input('token');
        
        if (!$token) {
            Log::warning('Auto-login attempted without token', [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            return redirect()->route('tenant.login')->withErrors([
                'error' => 'Invalid login link. Please log in manually.'
            ]);
        }

        // Validate and consume the token
        $tokenData = $this->tokenService->validateAndConsumeToken($token);
        
        if (!$tokenData) {
            return redirect()->route('tenant.login')->withErrors([
                'error' => 'This login link has expired or is invalid. Please log in manually.'
            ]);
        }

        try {
            // Find user in tenant database by email
            $user = User::where('email', $tokenData['user_email'])->first();
            
            if (!$user) {
                Log::error('Auto-login user not found in tenant database', [
                    'tenant_id' => $tokenData['tenant_id'],
                    'user_email' => $tokenData['user_email'],
                ]);
                
                return redirect()->route('tenant.login')->withErrors([
                    'error' => 'Account not found. Please contact support.'
                ]);
            }

            // Log the user in
            Auth::login($user, true); // Remember the user

            Log::info('Auto-login successful', [
                'tenant_id' => $tokenData['tenant_id'],
                'user_id' => $user->id,
                'user_email' => $user->email,
                'original_ip' => $tokenData['ip_address'],
                'current_ip' => $request->ip(),
            ]);

            // Redirect to dashboard with welcome message
            return redirect()->route('dashboard')->with([
                'success' => 'Welcome to your new HR platform! Your account has been set up successfully.',
                'show_onboarding' => true, // Flag to trigger onboarding tour
                'is_first_login' => true,
            ]);

        } catch (\Exception $e) {
            Log::error('Auto-login failed', [
                'error' => $e->getMessage(),
                'token_data' => $tokenData,
                'trace' => $e->getTraceAsString(),
            ]);
            
            return redirect()->route('tenant.login')->withErrors([
                'error' => 'Login failed. Please try logging in manually.'
            ]);
        }
    }

    /**
     * Handle token validation for AJAX requests (optional)
     */
    public function validateToken(Request $request)
    {
        $token = $request->input('token');
        
        if (!$token) {
            return response()->json(['valid' => false, 'message' => 'Token required']);
        }

        // Just validate without consuming
        $cacheKey = 'tenant_login_token:' . $token;
        $tokenData = cache()->get($cacheKey);
        
        return response()->json([
            'valid' => !!$tokenData,
            'expires_in' => $tokenData ? cache()->getStore()->ttl($cacheKey) : 0,
        ]);
    }
}
