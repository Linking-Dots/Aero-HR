<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Services\TenantService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class TenantRegistrationController extends Controller
{
    public function __construct(
        private TenantService $tenantService,
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Show registration form with plans
     */
    public function showRegistrationForm()
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('price')
            ->get();

        return Inertia::render('Auth/Register', [
            'plans' => $plans,
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
            'domain' => ['required', 'string', 'max:255', 'unique:tenants,domain', 'alpha_dash'],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'plan_id' => ['required', 'exists:plans,id'],
            'payment_method' => ['required_unless:trial,true', 'string'],
            'trial' => ['boolean'],
            'terms' => ['accepted'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $plan = Plan::findOrFail($request->plan_id);
            
            // Create tenant
            $tenant = $this->tenantService->createTenant([
                'name' => $request->company_name,
                'domain' => $request->domain,
                'plan_id' => $plan->id,
                'settings' => [
                    'timezone' => $request->timezone ?? 'UTC',
                    'currency' => $request->currency ?? 'USD',
                    'registration_ip' => $request->ip(),
                ]
            ]);

            // Create owner user
            $owner = $this->tenantService->createTenantOwner($tenant, [
                'name' => $request->owner_name,
                'email' => $request->owner_email,
                'password' => $request->password,
            ]);

            // Create subscription if not trial
            if (!$request->trial && $request->payment_method) {
                $subscription = $this->subscriptionService->createSubscription($tenant, $plan, [
                    'email' => $request->owner_email,
                    'payment_method' => $request->payment_method
                ]);
            }

            // Seed default data
            $this->tenantService->seedTenantDefaults($tenant);

            // Send welcome email (implement as needed)
            // $this->sendWelcomeEmail($tenant, $owner);

            return Inertia::render('Auth/RegistrationSuccess', [
                'tenant' => $tenant,
                'domain' => $tenant->domain,
                'loginUrl' => "https://{$tenant->domain}." . config('app.domain')
            ]);

        } catch (\Exception $e) {
            Log::error('Tenant registration failed: ' . $e->getMessage());
            
            return back()
                ->withErrors(['error' => 'Registration failed. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Check domain availability
     */
    public function checkDomain(Request $request)
    {
        $domain = $request->input('domain');
        
        if (!$domain) {
            return response()->json(['available' => false, 'message' => 'Domain is required']);
        }

        $exists = Tenant::where('domain', $domain)->exists();
        
        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Domain is already taken' : 'Domain is available'
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
