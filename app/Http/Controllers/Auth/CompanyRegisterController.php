<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\ProvisionTenantJob;
use App\Models\Domain;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CompanyRegisterController extends Controller
{
    /**
     * Display the company registration view.
     */
    public function create(): Response
    {
        // Get available plans for display
        $plans = Plan::where('is_active', true)
            ->orderBy('price_monthly')
            ->get(['id', 'name', 'slug', 'price', 'features', 'max_users', 'description']);

        return Inertia::render('Auth/CompanyRegister', [
            'plans' => $plans
        ]);
    }

    /**
     * Handle an incoming company registration request.
     */
    public function store(Request $request)
    {
        // Rate limiting for registration
        $key = 'company_register.' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'email' => "Too many registration attempts. Please try again in {$seconds} seconds."
            ]);
        }

        RateLimiter::hit($key, 300); // 5 minutes

        // Validate the request
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255', 'min:2'],
            'company_slug' => [
                'required', 
                'string', 
                'max:50', 
                'min:2',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('tenants', 'slug')
            ],
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'plan_id' => ['required', 'exists:plans,id'],
            'terms' => ['required', 'accepted'],
            'phone' => ['nullable', 'string', 'max:20'],
            'timezone' => ['required', 'string', 'max:50'],
        ]);

        // Additional validation for unique subdomain
        $existingDomain = Domain::where('domain', $validated['company_slug'] . '.' . config('app.main_domain'))
            ->exists();
            
        if ($existingDomain) {
            throw ValidationException::withMessages([
                'company_slug' => 'This subdomain is already taken.'
            ]);
        }

        try {
            DB::beginTransaction();

            // Create the tenant
            $tenant = $this->createTenant($validated);
            
            // Create the domain
            $this->createDomain($tenant, $validated['company_slug']);
            
            // Create subscription (if using Stripe)
            $subscription = $this->createSubscription($tenant, $validated['plan_id']);
            
            // Clear rate limiting on success
            RateLimiter::clear($key);

            DB::commit();

            // Dispatch tenant provisioning job
            ProvisionTenantJob::dispatch($tenant, [
                'admin_name' => $validated['admin_name'],
                'admin_email' => $validated['admin_email'],
                'admin_password' => $validated['password'],
                'timezone' => $validated['timezone'],
                'phone' => $validated['phone'] ?? null,
            ]);

            Log::info('Company registration initiated', [
                'tenant_id' => $tenant->id,
                'company_name' => $validated['company_name'],
                'slug' => $validated['company_slug'],
                'admin_email' => $validated['admin_email'],
                'plan_id' => $validated['plan_id'],
                'ip' => $request->ip()
            ]);

            return redirect()->route('company.registration.success', ['tenant' => $tenant->id])
                ->with('success', 'Your company is being set up! You will receive an email when it\'s ready.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Company registration failed', [
                'error' => $e->getMessage(),
                'company_name' => $validated['company_name'] ?? null,
                'slug' => $validated['company_slug'] ?? null,
                'admin_email' => $validated['admin_email'] ?? null,
                'ip' => $request->ip()
            ]);

            throw ValidationException::withMessages([
                'email' => 'Registration failed. Please try again or contact support.'
            ]);
        }
    }

    /**
     * Create a new tenant.
     */
    protected function createTenant(array $data): Tenant
    {
        return Tenant::create([
            'id' => (string) Str::uuid(),
            'slug' => $data['company_slug'],
            'name' => $data['company_name'],
            'email' => $data['admin_email'],
            'phone' => $data['phone'] ?? null,
            'status' => 'provisioning',
            'data' => [
                'timezone' => $data['timezone'],
                'registered_at' => now()->toISOString(),
                'registration_ip' => request()->ip(),
            ],
        ]);
    }

    /**
     * Create a domain for the tenant.
     */
    protected function createDomain(Tenant $tenant, string $slug): Domain
    {
        return Domain::create([
            'domain' => $slug . '.' . config('app.main_domain', 'mysoftwaredomain.com'),
            'tenant_id' => $tenant->id,
        ]);
    }

    /**
     * Create a subscription for the tenant.
     */
    protected function createSubscription(Tenant $tenant, int $planId)
    {
        $plan = Plan::findOrFail($planId);
        
        // For now, create a basic subscription record
        // In production, this would integrate with Stripe
        return DB::table('subscriptions')->insert([
            'tenant_id' => $tenant->id,
            'plan_id' => $planId,
            'status' => 'trialing', // Start with trial
            'trial_ends_at' => now()->addDays($plan->trial_days ?? 14),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Show registration success page.
     */
    public function success(Request $request, string $tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);
        
        return Inertia::render('Auth/RegistrationSuccess', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'status' => $tenant->status,
                'domain' => $tenant->slug . '.' . config('app.main_domain', 'mysoftwaredomain.com'),
            ]
        ]);
    }

    /**
     * Check registration status (AJAX endpoint).
     */
    public function checkStatus(Request $request, string $tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);
        
        return response()->json([
            'status' => $tenant->status,
            'message' => $this->getStatusMessage($tenant->status),
            'redirect_url' => $tenant->status === 'active' 
                ? 'https://' . $tenant->slug . '.' . config('app.main_domain', 'mysoftwaredomain.com') . '/dashboard'
                : null
        ]);
    }

    /**
     * Get user-friendly status message.
     */
    protected function getStatusMessage(string $status): string
    {
        return match($status) {
            'provisioning' => 'Setting up your company workspace...',
            'active' => 'Your company is ready! Redirecting...',
            'failed' => 'Setup failed. Please contact support.',
            'suspended' => 'Account is temporarily suspended.',
            default => 'Processing...'
        };
    }

    /**
     * Validate company slug availability (AJAX endpoint).
     */
    public function checkSlug(Request $request)
    {
        $request->validate([
            'slug' => ['required', 'string', 'max:50', 'min:2', 'regex:/^[a-z0-9-]+$/']
        ]);

        $slug = $request->input('slug');
        
        // Check if slug is available
        $slugTaken = Tenant::where('slug', $slug)->exists();
        $domainTaken = Domain::where('domain', $slug . '.' . config('app.main_domain'))->exists();
        
        // Check against reserved subdomains
        $reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'help', 'support', 'docs'];
        $isReserved = in_array($slug, $reserved);
        
        return response()->json([
            'available' => !$slugTaken && !$domainTaken && !$isReserved,
            'message' => $slugTaken || $domainTaken 
                ? 'This subdomain is already taken.'
                : ($isReserved ? 'This subdomain is reserved.' : 'Subdomain is available!')
        ]);
    }
}
