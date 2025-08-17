<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Tenant;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class BillingController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Show pricing page
     */
    public function pricing()
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('price_monthly')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description ?? '',
                    'monthly_price' => $plan->billing_cycle === 'monthly' ? $plan->price : round($plan->price / 12, 2),
                    'yearly_price' => $plan->billing_cycle === 'yearly' ? $plan->price : round($plan->price * 12 * 0.8, 2), // 20% discount
                    'features' => $plan->features['modules'] ?? [],
                    'limits' => $plan->limits ?? [],
                    'trial_days' => $plan->trial_days,
                    'popular' => $plan->slug === 'professional', // Mark professional as popular
                    'billing_cycle' => $plan->billing_cycle
                ];
            });

        return Inertia::render('Pages/Pricing', [
            'plans' => $plans
        ]);
    }

    /**
     * Start subscription process
     */
    public function subscribe(Request $request, Plan $plan)
    {
        $request->validate([
            'billing_cycle' => 'required|in:monthly,yearly',
            'tenant_data' => 'required|array',
            'tenant_data.name' => 'required|string|max:255',
            'tenant_data.domain' => 'required|string|max:255|unique:tenants,domain',
            'tenant_data.email' => 'required|email|max:255',
        ]);

        try {
            // Create payment intent
            $amount = $request->billing_cycle === 'yearly' ? 
                round($plan->price * 12 * 0.8) : // 20% yearly discount
                $plan->price;

            $paymentIntent = PaymentIntent::create([
                'amount' => $amount * 100, // Convert to cents
                'currency' => 'usd',
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'plan_id' => $plan->id,
                    'billing_cycle' => $request->billing_cycle,
                    'tenant_name' => $request->tenant_data['name'],
                    'tenant_domain' => $request->tenant_data['domain'],
                    'tenant_email' => $request->tenant_data['email'],
                ]
            ]);

            // Store tenant data in session for completion
            session([
                'pending_subscription' => [
                    'plan_id' => $plan->id,
                    'billing_cycle' => $request->billing_cycle,
                    'tenant_data' => $request->tenant_data,
                    'payment_intent_id' => $paymentIntent->id
                ]
            ]);

            return Inertia::render('Billing/StripePayment', [
                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description ?? '',
                    'monthly_price' => $plan->price,
                    'yearly_price' => round($plan->price * 12 * 0.8),
                    'trial_days' => $plan->trial_days
                ],
                'billingCycle' => $request->billing_cycle,
                'tenant' => $request->tenant_data,
                'clientSecret' => $paymentIntent->client_secret,
                'returnUrl' => route('billing.complete')
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription initiation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to start subscription process. Please try again.');
        }
    }

    /**
     * Complete subscription after payment
     */
    public function complete(Request $request)
    {
        $pendingSubscription = session('pending_subscription');
        
        if (!$pendingSubscription) {
            return redirect()->route('pricing')->with('error', 'Invalid subscription session.');
        }

        try {
            // Verify payment intent
            $paymentIntent = PaymentIntent::retrieve($pendingSubscription['payment_intent_id']);
            
            if ($paymentIntent->status !== 'succeeded') {
                return redirect()->route('pricing')->with('error', 'Payment was not completed successfully.');
            }

            // Create tenant
            $tenant = Tenant::create([
                'id' => $pendingSubscription['tenant_data']['domain'],
                'name' => $pendingSubscription['tenant_data']['name'],
                'domain' => $pendingSubscription['tenant_data']['domain'],
                'email' => $pendingSubscription['tenant_data']['email'],
                'plan_id' => $pendingSubscription['plan_id'],
                'status' => 'active'
            ]);

            // Create subscription
            $plan = Plan::findOrFail($pendingSubscription['plan_id']);
            $subscription = $this->subscriptionService->createSubscription(
                $tenant,
                $plan,
                [
                    'email' => $pendingSubscription['tenant_data']['email'],
                    'payment_method' => $paymentIntent->payment_method
                ]
            );

            // Clear session
            session()->forget('pending_subscription');

            // Redirect to success page
            return Inertia::render('Auth/RegistrationSuccess', [
                'tenant' => [
                    'name' => $tenant->name,
                    'domain' => $tenant->domain,
                    'subdomain' => $tenant->domain . '.aero-hr.com'
                ],
                'subscription' => [
                    'plan' => $plan->name,
                    'trial_ends_at' => $subscription->trial_ends_at?->toDateString()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription completion failed: ' . $e->getMessage());
            return redirect()->route('pricing')->with('error', 'Failed to complete subscription. Please contact support.');
        }
    }

    /**
     * Handle successful payment (called by Stripe webhook or redirect)
     */
    public function paymentSuccess(Request $request)
    {
        $paymentIntentId = $request->query('payment_intent');
        
        if (!$paymentIntentId) {
            return redirect()->route('pricing');
        }

        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            
            if ($paymentIntent->status === 'succeeded') {
                // Find tenant by payment intent metadata
                $tenantDomain = $paymentIntent->metadata->tenant_domain ?? null;
                
                if ($tenantDomain) {
                    $tenant = Tenant::where('domain', $tenantDomain)->first();
                    
                    if ($tenant) {
                        return redirect()->route('tenant.dashboard', ['tenant' => $tenant->domain]);
                    }
                }
            }
            
            return redirect()->route('pricing')->with('success', 'Payment completed successfully!');
        } catch (\Exception $e) {
            Log::error('Payment success handling failed: ' . $e->getMessage());
            return redirect()->route('pricing')->with('error', 'Payment verification failed.');
        }
    }

    /**
     * Handle payment cancellation
     */
    public function paymentCancel()
    {
        session()->forget('pending_subscription');
        
        return redirect()->route('pricing')->with('info', 'Payment was cancelled. You can try again anytime.');
    }
}
