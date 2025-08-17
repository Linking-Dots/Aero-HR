<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\PlatformUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Stancl\Tenancy\Facades\Tenancy;

class LoginController extends Controller
{

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/dashboard';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    /**
     * Show the application's login form.
     */
    public function showLoginForm()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Show the application's login form (alias for route compatibility).
     */
    public function create()
    {
        return $this->showLoginForm();
    }

    /**
     * Handle a login request to the application.
     * This method implements context-aware authentication:
     * - Central domain: Only allow platform users (super admin, support, billing)
     * - Tenant domain: Only allow tenant users
     */
    public function login(Request $request)
    {
        $this->validateLogin($request);

        // Determine context based on current domain/route
        $isTenantContext = $this->isTenantContext($request);

        if ($isTenantContext) {
            // On tenant domain - only allow tenant users
            return $this->attemptTenantUserLogin($request);
        } else {
            // On central domain - only allow platform users
            return $this->attemptPlatformUserLogin($request);
        }
    }

    /**
     * Determine if we're in a tenant context
     */
    protected function isTenantContext($request)
    {
        // Check if we have an active tenant context
        if (tenant()) {
            return true;
        }

        // Check route name patterns
        $routeName = $request->route()->getName();
        if (str_starts_with($routeName, 'tenant.')) {
            return true;
        }

        // Check domain patterns
        $host = $request->getHost();
        $centralDomains = ['127.0.0.1', 'localhost', 'aero-hr.com', 'platform.aero-hr.com'];
        
        return !in_array($host, $centralDomains);
    }

    /**
     * Attempt platform user login (super admin, support, billing)
     */
    protected function attemptPlatformUserLogin(Request $request)
    {
        $credentials = $this->credentials($request);

        // Use PlatformUser model for authentication
        $platformUser = PlatformUser::where('email', $credentials['email'])
            ->where('is_active', true)
            ->first();

        if ($platformUser && Hash::check($credentials['password'], $platformUser->password)) {
            Auth::login($platformUser, $request->filled('remember'));
            $request->session()->regenerate();

            Log::info('Platform user logged in', [
                'email' => $credentials['email'],
                'role' => $platformUser->role,
                'ip' => $request->ip()
            ]);

            return $this->sendPlatformLoginResponse($request, $platformUser->role);
        }

        // If platform authentication fails, show error
        return back()->withErrors([
            'email' => 'These credentials do not match our platform records.',
        ])->onlyInput('email');
    }

    /**
     * Send the response after platform user authentication
     */
    protected function sendPlatformLoginResponse(Request $request, $role)
    {
        $this->clearLoginAttempts($request);

        if ($response = $this->authenticated($request, $this->guard()->user())) {
            return $response;
        }

        // Redirect based on role
        $redirectPath = match($role) {
            'super_admin' => '/admin',
            'support' => '/support',
            'billing' => '/billing',
            default => '/dashboard'
        };

        return redirect()->intended($redirectPath)
            ->with('success', 'Welcome to the platform dashboard!');
    }

    /**
     * Handle a login request (alias for route compatibility).
     */
    public function store(Request $request)
    {
        return $this->login($request);
    }

    /**
     * Validate the user login request.
     */
    protected function validateLogin(Request $request)
    {
        $request->validate([
            $this->username() => 'required|string|email',
            'password' => 'required|string',
        ]);
    }

    /**
     * Attempt to log the user into their tenant.
     */
    protected function attemptTenantUserLogin(Request $request)
    {
        $credentials = $this->credentials($request);
        $email = $credentials['email'];

        // First, find which tenant this user belongs to
        $tenant = $this->findUserTenant($email);

        if (!$tenant) {
            $this->incrementLoginAttempts($request);
            throw ValidationException::withMessages([
                $this->username() => [trans('auth.failed')],
            ]);
        }

        // Initialize the tenant context
        try {
            Tenancy::initialize($tenant);

            // Attempt authentication in the tenant database
            if (Auth::attempt($credentials, $request->filled('remember'))) {
                $request->session()->regenerate();
                $this->clearLoginAttempts($request);

                $user = Auth::user();
                
                Log::info('Tenant user logged in', [
                    'tenant_id' => $tenant->id,
                    'user_id' => $user->id,
                    'email' => $email,
                    'ip' => $request->ip()
                ]);

                return $this->sendTenantLoginResponse($request, $tenant);
            }

            // Authentication failed
            $this->incrementLoginAttempts($request);
            throw ValidationException::withMessages([
                $this->username() => [trans('auth.failed')],
            ]);

        } catch (\Exception $e) {
            Log::error('Tenant login error', [
                'tenant_id' => $tenant->id,
                'email' => $email,
                'error' => $e->getMessage()
            ]);

            throw ValidationException::withMessages([
                $this->username() => ['Login failed. Please try again.'],
            ]);
        } finally {
            // Always end tenancy context
            Tenancy::end();
        }
    }

    /**
     * Find which tenant a user belongs to based on their email.
     */
    protected function findUserTenant(string $email)
    {
        // Look up user in all active tenants
        $tenants = Tenant::where('status', 'active')->get();

        foreach ($tenants as $tenant) {
            try {
                Tenancy::initialize($tenant);
                
                $userExists = DB::table('users')
                    ->where('email', $email)
                    ->exists();

                if ($userExists) {
                    Tenancy::end();
                    return $tenant;
                }

                Tenancy::end();
            } catch (\Exception $e) {
                Tenancy::end();
                Log::warning('Error checking user in tenant', [
                    'tenant_id' => $tenant->id,
                    'email' => $email,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }

        return null;
    }

    /**
     * Send the response after the tenant user was authenticated.
     */
    protected function sendTenantLoginResponse(Request $request, Tenant $tenant)
    {
        // Check if we're already on the correct subdomain
        $currentHost = $request->getHost();
        $expectedSubdomain = $tenant->slug . '.' . config('app.main_domain', 'mysoftwaredomain.com');

        if ($currentHost !== $expectedSubdomain) {
            // Redirect to the tenant's subdomain
            $protocol = $request->isSecure() ? 'https' : 'http';
            $redirectUrl = "{$protocol}://{$expectedSubdomain}/dashboard";

            // Store authentication token for seamless transition
            $token = $this->generateTenantLoginToken($tenant, Auth::user());
            $redirectUrl .= "?token={$token}";

            return redirect()->away($redirectUrl);
        }

        // Already on correct subdomain, redirect to dashboard
        return redirect()->intended('/dashboard')
            ->with('success', 'Welcome back!');
    }

    /**
     * Generate a secure token for tenant login transition.
     */
    protected function generateTenantLoginToken(Tenant $tenant, User $user)
    {
        $payload = [
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(5)->timestamp,
        ];

        return encrypt($payload);
    }

    /**
     * Handle token-based login for tenant transitions.
     */
    public function loginWithToken(Request $request)
    {
        $token = $request->get('token');
        
        if (!$token) {
            return redirect('/')->with('error', 'Invalid login token.');
        }

        try {
            $payload = decrypt($token);
            
            // Check if token is expired
            if ($payload['expires_at'] < now()->timestamp) {
                return redirect('/')->with('error', 'Login token has expired.');
            }

            // Find the tenant
            $tenant = Tenant::find($payload['tenant_id']);
            if (!$tenant || $tenant->status !== 'active') {
                return redirect('/')->with('error', 'Tenant not found or inactive.');
            }

            // Initialize tenant context and find user
            Tenancy::initialize($tenant);
            
            $user = User::find($payload['user_id']);
            if (!$user) {
                Tenancy::end();
                return redirect('/')->with('error', 'User not found.');
            }

            // Log the user in
            Auth::login($user);
            $request->session()->regenerate();

            Log::info('User logged in via token', [
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'ip' => $request->ip()
            ]);

            return redirect('/dashboard')->with('success', 'Welcome back!');

        } catch (\Exception $e) {
            Log::error('Token login failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);

            return redirect('/')->with('error', 'Invalid login token.');
        }
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user && $user->is_super_admin;

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect super admins to main site, tenant users to their landing
        if ($isSuperAdmin) {
            return redirect('/')->with('success', 'You have been logged out.');
        }

        // For tenant users, redirect to main domain
        $protocol = $request->isSecure() ? 'https' : 'http';
        $mainDomain = config('app.main_domain', 'mysoftwaredomain.com');
        
        return redirect()->away("{$protocol}://{$mainDomain}")
            ->with('success', 'You have been logged out.');
    }

    /**
     * Get the login username to be used by the controller.
     */
    public function username()
    {
        return 'email';
    }

    /**
     * Get the needed authorization credentials from the request.
     */
    protected function credentials(Request $request)
    {
        return $request->only($this->username(), 'password');
    }

    /**
     * Get the guard to be used during authentication.
     */
    protected function guard()
    {
        return Auth::guard();
    }

    /**
     * Determine if the user has too many failed login attempts.
     */
    protected function hasTooManyLoginAttempts(Request $request)
    {
        return RateLimiter::tooManyAttempts(
            $this->throttleKey($request),
            5 // max attempts
        );
    }

    /**
     * Increment the login attempts for the user.
     */
    protected function incrementLoginAttempts(Request $request)
    {
        RateLimiter::hit(
            $this->throttleKey($request),
            60 * 5 // 5 minutes
        );
    }

    /**
     * Clear the login attempts for the user.
     */
    protected function clearLoginAttempts(Request $request)
    {
        RateLimiter::clear($this->throttleKey($request));
    }

    /**
     * Get the throttle key for the given request.
     */
    protected function throttleKey(Request $request)
    {
        return Str::transliterate(Str::lower($request->input($this->username())) . '|' . $request->ip());
    }

    /**
     * The user has been authenticated.
     */
    protected function authenticated(Request $request, $user)
    {
        return null;
    }

    /**
     * Log the user out (alias for route compatibility).
     */
    public function destroy(Request $request)
    {
        return $this->logout($request);
    }
}
