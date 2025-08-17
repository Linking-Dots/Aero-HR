<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Domain;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Services\TenantService;
use App\Services\SubscriptionService;
use App\Services\TenantLoginTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class TenantRegistrationController extends Controller
{
    public function __construct(
        private TenantService $tenantService,
        private SubscriptionService $subscriptionService,
        private TenantLoginTokenService $loginTokenService
    ) {}

    /**
     * Show registration form with plans
     */
    public function showRegistrationForm()
    {
        $basePlans = Plan::where('is_active', true)
            ->orderBy('price_monthly')
            ->get();

        // Transform plans to include monthly and yearly variants
        // Frontend expects separate entries for each billing cycle but needs consistent plan identification
        $plans = collect();
        
        foreach ($basePlans as $plan) {
            // Monthly plan
            $plans->push([
                'id' => $plan->id,
                'base_plan_id' => $plan->id, // Reference to the base plan
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => $plan->price_monthly / 100, // Convert cents to dollars
                'billing_cycle' => 'monthly',
                'features' => $plan->features,
                'max_users' => $plan->max_users,
                'max_storage_gb' => $plan->max_storage_gb,
                'is_featured' => $plan->is_featured,
                'stripe_price_id' => $plan->stripe_price_id_monthly,
                'sort_order' => $plan->sort_order ?? 0,
            ]);
            
            // Yearly plan - use different ID to ensure uniqueness
            $plans->push([
                'id' => $plan->id * 1000 + 1, // Unique ID for yearly (e.g., 1001, 2001, 3001)
                'base_plan_id' => $plan->id, // Reference to the base plan
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => $plan->price_yearly / 100, // Convert cents to dollars
                'billing_cycle' => 'yearly',
                'features' => $plan->features,
                'max_users' => $plan->max_users,
                'max_storage_gb' => $plan->max_storage_gb,
                'is_featured' => $plan->is_featured,
                'stripe_price_id' => $plan->stripe_price_id_yearly,
                'sort_order' => $plan->sort_order ?? 0,
            ]);
        }

        return Inertia::render('Auth/Register', [
            'plans' => $plans->sortBy('sort_order')->values()->toArray(),
            'features' => $this->getPlanFeatures()
        ]);
    }

    /**
     * Handle tenant registration
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => ['required', 'string', 'max:255'],
            'domain' => [
                'required', 
                'string', 
                'max:63', 
                'unique:domains,domain', 
                'alpha_dash', 
                'regex:/^[a-z0-9-]+$/',
                new \App\Rules\ReservedDomainRule()
            ],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'string', 'email', 'max:255', 'unique:tenant_users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'plan_id' => ['required', 'string'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'timezone' => ['nullable', 'string', 'max:255'],
            'currency' => ['nullable', 'string', 'max:3'],
            'terms' => ['accepted'],
        ], [
            'domain.unique' => 'This domain is already taken. Please choose a different one.',
            'domain.alpha_dash' => 'Domain can only contain letters, numbers, and hyphens.',
            'domain.regex' => 'Domain must be lowercase and contain only letters, numbers, and hyphens.',
            'owner_email.unique' => 'An account with this email already exists.',
            'terms.accepted' => 'You must accept the terms and conditions.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Get the selected plan and billing cycle
            $planId = $request->plan_id;
            $billingCycle = $request->billing_cycle; // This will be 'monthly' or 'yearly'
            
            // If plan ID is > 1000, it's a yearly plan, extract the base plan ID
            if ($planId > 1000) {
                $basePlanId = intval($planId / 1000);
                $billingCycle = 'yearly';
            } else {
                $basePlanId = $planId;
                $billingCycle = $billingCycle ?: 'monthly';
            }
            
            $plan = Plan::findOrFail($basePlanId);
            
            // Validate domain format
            $domain = strtolower(trim($request->domain));
            if (strlen($domain) < 3 || strlen($domain) > 63) {
                return back()->withErrors(['domain' => 'Domain must be between 3 and 63 characters.'])->withInput();
            }
            
            // Wrap entire registration process in transaction
            DB::transaction(function () use ($request, $plan, $domain, $billingCycle, &$tenant, &$owner, &$subscription) {
                // Create tenant
                $tenant = $this->tenantService->createTenant([
                    'name' => $request->company_name,
                    'domain' => $domain,
                    'plan_id' => $plan->id,
                    'settings' => [
                        'timezone' => $request->timezone ?? 'UTC',
                        'currency' => $request->currency ?? 'USD',
                        'billing_cycle' => $billingCycle,
                        'registration_ip' => $request->ip(),
                        'registered_at' => now()->toDateTimeString(),
                    ]
                ]);

                // Create owner user
                $owner = $this->tenantService->createTenantOwner($tenant, [
                    'name' => $request->owner_name,
                    'email' => $request->owner_email,
                    'password' => $request->password,
                ]);

                // Create subscription if plan is not free
                if ($plan->price > 0) {
                    $subscription = $this->subscriptionService->createSubscription($tenant, $plan, [
                        'email' => $request->owner_email,
                        'billing_cycle' => $request->billing_cycle
                    ]);
                }

                // Seed default data
                $this->tenantService->seedTenantDefaults($tenant);
            });

            // Send welcome email (implement as needed)
            // $this->sendWelcomeEmail($tenant, $owner);

            // Log successful registration
            Log::info('Tenant registration successful', [
                'tenant_id' => $tenant->id,
                'domain' => $tenant->domain,
                'owner_email' => $owner->email,
                'plan' => $plan->name,
                'registration_ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Generate auto-login URL for seamless redirect
            $autoLoginUrl = $this->loginTokenService->generateLoginUrl($tenant, $owner);

            // Redirect to success page with auto-login URL
            return redirect()->route('registration.success')->with([
                'tenant' => $tenant,
                'loginUrl' => $autoLoginUrl,
                'domain' => $tenant->domain,
                'company_name' => $tenant->name,
                'owner_name' => $owner->name,
                'plan_name' => $plan->name
            ]);

        } catch (\Illuminate\Database\QueryException $e) {
            // Handle database-specific errors
            Log::error('Database error during tenant registration', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);
            
            $errorMessage = 'Registration failed due to a database error. Please try again.';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                if (str_contains($e->getMessage(), 'domain')) {
                    $errorMessage = 'This domain is already taken. Please choose a different one.';
                } elseif (str_contains($e->getMessage(), 'email')) {
                    $errorMessage = 'An account with this email already exists.';
                }
            }
            
            return back()
                ->withErrors(['error' => $errorMessage])
                ->withInput();
                
        } catch (\Exception $e) {
            Log::error('Tenant registration failed: ' . $e->getMessage(), [
                'request_data' => $request->except(['password', 'password_confirmation']),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'registration_ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            return back()
                ->withErrors(['error' => 'Registration failed. Please check your information and try again. If the problem persists, please contact support.'])
                ->withInput();
        }
    }

    /**
     * Get tenant login URL based on domain and environment
     */
    private function getTenantLoginUrl(string $domain): string
    {
        // For development server (127.0.0.1:8000 or localhost:8000)
        if (app()->environment('local') && 
            (request()->getHost() === '127.0.0.1' || request()->getHost() === 'localhost')) {
            $port = request()->getPort();
            $portSuffix = ($port && $port != 80 && $port != 443) ? ":{$port}" : '';
            return "http://127.0.0.1{$portSuffix}/tenant/{$domain}/login";
        }
        
        // For production with subdomains
        $appDomain = config('app.domain', 'aero-hr.local');
        
        if (app()->environment('local')) {
            return "http://{$domain}.{$appDomain}/login";
        }
        
        return "https://{$domain}.{$appDomain}/login";
    }

    /**
     * Check domain availability
     */
    public function checkDomain(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domain' => [
                'required', 
                'string', 
                'min:3', 
                'max:63',
                'regex:/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/',
                new \App\Rules\ReservedDomainRule()
            ]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'available' => false,
                'message' => $validator->errors()->first('domain'),
                'errors' => $validator->errors()
            ], 422);
        }

        $domain = strtolower(trim($request->domain));
        
        // Check if domain exists in domains table
        $exists = Domain::where('domain', $domain)->exists();
        
        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Domain is already taken' : 'Domain is available',
            'domain' => $domain
        ]);
    }

    /**
     * Get plan with pricing details
     */
    public function getPlan(Plan $plan)
    {
        return response()->json([
            'plan' => $plan,
            'features' => $this->getPlanFeatures()[$plan->name] ?? []
        ]);
    }

    /**
     * Get Stripe payment intent for plan
     */
    public function createPaymentIntent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => ['required', 'exists:plans,id'],
            'billing_cycle' => ['required', 'in:monthly,yearly']
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid plan or billing cycle'], 400);
        }

        try {
            $plan = Plan::findOrFail($request->plan_id);
            
            // Create payment intent with Stripe
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
            
            $intent = \Stripe\PaymentIntent::create([
                'amount' => $plan->price * 100, // Convert to cents
                'currency' => strtolower($plan->currency),
                'metadata' => [
                    'plan_id' => $plan->id,
                    'billing_cycle' => $request->billing_cycle
                ]
            ]);

            return response()->json([
                'client_secret' => $intent->client_secret,
                'amount' => $plan->price,
                'currency' => $plan->currency
            ]);

        } catch (\Exception $e) {
            Log::error('Payment intent creation failed: ' . $e->getMessage());
            
            return response()->json(['error' => 'Payment setup failed'], 500);
        }
    }

    /**
     * Get plan features configuration
     */
    private function getPlanFeatures(): array
    {
        return [
            'Starter' => [
                'Max Employees' => '10',
                'Storage' => '1GB',
                'Email Support' => true,
                'Basic Reports' => true,
                'Mobile App' => true,
                'Custom Branding' => false,
                'API Access' => false,
                'Advanced Reports' => false,
                'Priority Support' => false,
            ],
            'Professional' => [
                'Max Employees' => '100',
                'Storage' => '10GB',
                'Email Support' => true,
                'Basic Reports' => true,
                'Mobile App' => true,
                'Custom Branding' => true,
                'API Access' => true,
                'Advanced Reports' => true,
                'Priority Support' => false,
            ],
            'Enterprise' => [
                'Max Employees' => 'Unlimited',
                'Storage' => '100GB',
                'Email Support' => true,
                'Basic Reports' => true,
                'Mobile App' => true,
                'Custom Branding' => true,
                'API Access' => true,
                'Advanced Reports' => true,
                'Priority Support' => true,
                'Custom Integrations' => true,
                'Dedicated Account Manager' => true,
            ]
        ];
    }
}
