<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Subscription;
use App\Models\Plan;
use App\Services\SubscriptionService;
use App\Services\UsageTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stancl\Tenancy\Facades\Tenancy;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService,
        private UsageTrackingService $usageService
    ) {}

    /**
     * Show subscription management page
     */
    public function index()
    {
        $tenant = Tenancy::tenant();
        $subscription = $tenant->subscription()->with('plan')->first();
        
        // Get available plans for upgrade/downgrade
        $availablePlans = Plan::where('is_active', true)
            ->with('features', 'limits')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'monthly_price' => $plan->billing_cycle === 'monthly' ? $plan->price * 100 : ($plan->price * 10) * 100, // Convert to cents for frontend
                    'yearly_price' => $plan->billing_cycle === 'yearly' ? $plan->price * 100 : ($plan->price * 12 * 0.8) * 100, // 20% discount for yearly
                    'features' => $plan->features['modules'] ?? [],
                    'billing_cycle' => $plan->billing_cycle,
                    'trial_days' => $plan->trial_days,
                    'description' => $plan->description ?? ''
                ];
            });

        // Get payment methods from Stripe
        $paymentMethods = [];
        if ($subscription && $subscription->stripe_customer_id) {
            try {
                $paymentMethods = $this->subscriptionService->getPaymentMethods($subscription->stripe_customer_id);
            } catch (\Exception $e) {
                Log::error('Failed to fetch payment methods: ' . $e->getMessage());
            }
        }

        // Get recent invoices
        $invoices = [];
        if ($subscription && $subscription->stripe_subscription_id) {
            try {
                $invoices = $this->subscriptionService->getInvoices($subscription->stripe_customer_id);
            } catch (\Exception $e) {
                Log::error('Failed to fetch invoices: ' . $e->getMessage());
            }
        }

        // Get current usage
        $usage = $this->usageService->getCurrentUsage($tenant);
        $usagePercentages = $this->usageService->getUsagePercentages($tenant, $subscription?->plan);

        // Get upcoming invoice if exists
        $upcomingInvoice = null;
        if ($subscription && $subscription->stripe_subscription_id) {
            try {
                $upcomingInvoice = $this->subscriptionService->getUpcomingInvoice($subscription->stripe_subscription_id);
            } catch (\Exception $e) {
                Log::error('Failed to fetch upcoming invoice: ' . $e->getMessage());
            }
        }

        return Inertia::render('Dashboard/Subscription', [
            'tenant' => $tenant,
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'trial_ends_at' => $subscription->trial_ends_at?->toISOString(),
                'current_period_end' => $subscription->current_period_end?->toISOString(),
                'plan' => $subscription->plan ? [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'price' => $subscription->plan->price * 100, // Convert to cents
                    'billing_cycle' => $subscription->plan->billing_cycle
                ] : null
            ] : null,
            'availablePlans' => $availablePlans,
            'paymentMethods' => $paymentMethods,
            'invoices' => $invoices,
            'usage' => $usage,
            'usagePercentages' => $usagePercentages,
            'upcomingInvoice' => $upcomingInvoice
        ]);
    }

    /**
     * Change subscription plan
     */
    public function changePlan(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly'
        ]);

        $tenant = Tenancy::tenant();
        $newPlan = Plan::findOrFail($request->plan_id);

        try {
            $subscription = $this->subscriptionService->changePlan(
                $tenant,
                $newPlan,
                $request->billing_cycle
            );

            return redirect()->back()->with('success', 'Plan changed successfully!');
        } catch (\Exception $e) {
            Log::error('Plan change failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to change plan. Please try again.');
        }
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request)
    {
        $tenant = Tenancy::tenant();
        $subscription = $tenant->subscription;

        if (!$subscription) {
            return redirect()->back()->with('error', 'No active subscription found.');
        }

        try {
            $this->subscriptionService->cancelSubscription($subscription);
            
            return redirect()->back()->with('success', 'Subscription cancelled. Access will continue until the end of your billing period.');
        } catch (\Exception $e) {
            Log::error('Subscription cancellation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to cancel subscription. Please try again.');
        }
    }

    /**
     * Resume cancelled subscription
     */
    public function resume(Request $request)
    {
        $tenant = Tenancy::tenant();
        $subscription = $tenant->subscription;

        if (!$subscription || $subscription->status !== 'canceled') {
            return redirect()->back()->with('error', 'No cancelled subscription found.');
        }

        try {
            $this->subscriptionService->resumeSubscription($subscription);
            
            return redirect()->back()->with('success', 'Subscription resumed successfully!');
        } catch (\Exception $e) {
            Log::error('Subscription resume failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to resume subscription. Please try again.');
        }
    }

    /**
     * Update payment method
     */
    public function updatePaymentMethod(Request $request)
    {
        $request->validate([
            'payment_method_id' => 'required|string'
        ]);

        $tenant = Tenancy::tenant();
        $subscription = $tenant->subscription;

        if (!$subscription) {
            return redirect()->back()->with('error', 'No active subscription found.');
        }

        try {
            $this->subscriptionService->updatePaymentMethod(
                $subscription,
                $request->payment_method_id
            );
            
            return redirect()->back()->with('success', 'Payment method updated successfully!');
        } catch (\Exception $e) {
            Log::error('Payment method update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update payment method. Please try again.');
        }
    }

    /**
     * Download invoice
     */
    public function downloadInvoice($invoiceId)
    {
        $tenant = Tenancy::tenant();
        $subscription = $tenant->subscription;

        if (!$subscription) {
            abort(404);
        }

        try {
            $invoice = $this->subscriptionService->getInvoice($invoiceId);
            
            if (!$invoice || $invoice->customer !== $subscription->stripe_customer_id) {
                abort(404);
            }

            return response()->stream(
                function () use ($invoice) {
                    echo $invoice->invoice_pdf;
                },
                200,
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="invoice-' . $invoice->number . '.pdf"',
                ]
            );
        } catch (\Exception $e) {
            Log::error('Invoice download failed: ' . $e->getMessage());
            abort(404);
        }
    }
}
