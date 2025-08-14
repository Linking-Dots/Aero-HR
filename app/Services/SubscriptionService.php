<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Subscription as StripeSubscription;
use Stripe\PaymentMethod;
use Carbon\Carbon;

class SubscriptionService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create subscription for tenant
     */
    public function createSubscription(Tenant $tenant, Plan $plan, array $paymentData): Subscription
    {
        DB::beginTransaction();
        
        try {
            // Create or get Stripe customer
            $stripeCustomer = $this->createOrGetStripeCustomer($tenant, $paymentData);
            
            // Create Stripe subscription
            $stripeSubscription = StripeSubscription::create([
                'customer' => $stripeCustomer->id,
                'items' => [
                    ['price' => $plan->stripe_price_id]
                ],
                'trial_period_days' => $plan->trial_days ?? 14,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plan->id
                ]
            ]);

            // Create local subscription record
            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'stripe_customer_id' => $stripeCustomer->id,
                'stripe_subscription_id' => $stripeSubscription->id,
                'status' => $stripeSubscription->status,
                'current_period_start' => Carbon::createFromTimestamp($stripeSubscription->current_period_start),
                'current_period_end' => Carbon::createFromTimestamp($stripeSubscription->current_period_end),
                'trial_ends_at' => $stripeSubscription->trial_end ? 
                    Carbon::createFromTimestamp($stripeSubscription->trial_end) : null,
                'metadata' => [
                    'payment_method' => $paymentData['payment_method'] ?? null
                ]
            ]);

            // Update tenant subscription reference
            $tenant->update(['subscription_id' => $subscription->id]);

            DB::commit();
            return $subscription;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to create subscription for tenant {$tenant->id}: " . $e->getMessage());
            throw new \Exception("Failed to create subscription: " . $e->getMessage());
        }
    }

    /**
     * Change subscription plan
     */
    public function changePlan(Subscription $subscription, Plan $newPlan): bool
    {
        try {
            // Update Stripe subscription
            $stripeSubscription = StripeSubscription::retrieve($subscription->stripe_subscription_id);
            
            StripeSubscription::update($subscription->stripe_subscription_id, [
                'items' => [
                    [
                        'id' => $stripeSubscription->items->data[0]->id,
                        'price' => $newPlan->stripe_price_id,
                    ]
                ],
                'proration_behavior' => 'create_prorations',
            ]);

            // Update local subscription
            $subscription->update([
                'plan_id' => $newPlan->id,
                'status' => $stripeSubscription->status,
            ]);

            Log::info("Plan changed for subscription {$subscription->id} to plan {$newPlan->name}");
            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to change plan for subscription {$subscription->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Subscription $subscription, bool $immediately = false): bool
    {
        try {
            if ($immediately) {
                // Cancel immediately
                StripeSubscription::update($subscription->stripe_subscription_id, [
                    'cancel_at_period_end' => false
                ]);
                StripeSubscription::retrieve($subscription->stripe_subscription_id)->cancel();
                
                $subscription->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'ends_at' => now()
                ]);
            } else {
                // Cancel at period end
                StripeSubscription::update($subscription->stripe_subscription_id, [
                    'cancel_at_period_end' => true
                ]);
                
                $subscription->update([
                    'status' => 'cancel_at_period_end',
                    'cancelled_at' => now(),
                    'ends_at' => $subscription->current_period_end
                ]);
            }

            Log::info("Subscription {$subscription->id} cancelled" . ($immediately ? " immediately" : " at period end"));
            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to cancel subscription {$subscription->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Resume cancelled subscription
     */
    public function resumeSubscription(Subscription $subscription): bool
    {
        try {
            // Resume in Stripe
            StripeSubscription::update($subscription->stripe_subscription_id, [
                'cancel_at_period_end' => false
            ]);

            // Update local subscription
            $subscription->update([
                'status' => 'active',
                'cancelled_at' => null,
                'ends_at' => null
            ]);

            Log::info("Subscription {$subscription->id} resumed");
            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to resume subscription {$subscription->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update payment method
     */
    public function updatePaymentMethod(Subscription $subscription, string $paymentMethodId): bool
    {
        try {
            // Attach payment method to customer
            $paymentMethod = PaymentMethod::retrieve($paymentMethodId);
            $paymentMethod->attach(['customer' => $subscription->stripe_customer_id]);

            // Set as default payment method
            Customer::update($subscription->stripe_customer_id, [
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId
                ]
            ]);

            // Update subscription metadata
            $metadata = $subscription->metadata ?? [];
            $metadata['payment_method'] = $paymentMethodId;
            
            $subscription->update(['metadata' => $metadata]);

            Log::info("Payment method updated for subscription {$subscription->id}");
            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to update payment method for subscription {$subscription->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Sync subscription from Stripe
     */
    public function syncSubscription(Subscription $subscription): bool
    {
        try {
            $stripeSubscription = StripeSubscription::retrieve($subscription->stripe_subscription_id);
            
            $subscription->update([
                'status' => $stripeSubscription->status,
                'current_period_start' => Carbon::createFromTimestamp($stripeSubscription->current_period_start),
                'current_period_end' => Carbon::createFromTimestamp($stripeSubscription->current_period_end),
                'trial_ends_at' => $stripeSubscription->trial_end ? 
                    Carbon::createFromTimestamp($stripeSubscription->trial_end) : null,
            ]);

            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to sync subscription {$subscription->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if tenant has active subscription
     */
    public function hasActiveSubscription(Tenant $tenant): bool
    {
        return $tenant->subscription && $tenant->subscription->isActive();
    }

    /**
     * Get subscription usage for current period
     */
    public function getUsageForPeriod(Subscription $subscription): array
    {
        $tenant = $subscription->tenant;
        
        if (!$tenant) {
            return [];
        }

        // Switch to tenant context to get usage data
        \Stancl\Tenancy\Facades\Tenancy::initialize($tenant);
        
        $usage = [
            'employees' => \App\Models\User::count(),
            'departments' => class_exists(\App\Models\HRM\Department::class) ? 
                \App\Models\HRM\Department::count() : 0,
            'projects' => class_exists(\App\Models\Project::class) ? 
                \App\Models\Project::count() : 0,
            'storage_used' => $this->calculateStorageUsage(),
        ];
        
        \Stancl\Tenancy\Facades\Tenancy::end();
        
        return $usage;
    }

    /**
     * Create or get Stripe customer
     */
    private function createOrGetStripeCustomer(Tenant $tenant, array $paymentData): Customer
    {
        // Check if customer already exists
        if ($tenant->subscription && $tenant->subscription->stripe_customer_id) {
            return Customer::retrieve($tenant->subscription->stripe_customer_id);
        }

        // Create new customer
        return Customer::create([
            'name' => $tenant->name,
            'email' => $paymentData['email'],
            'metadata' => [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name
            ]
        ]);
    }

    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(array $event): void
    {
        try {
            switch ($event['type']) {
                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event['data']['object']);
                    break;
                    
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event['data']['object']);
                    break;
                    
                case 'invoice.payment_succeeded':
                    $this->handlePaymentSucceeded($event['data']['object']);
                    break;
                    
                case 'invoice.payment_failed':
                    $this->handlePaymentFailed($event['data']['object']);
                    break;
                    
                default:
                    Log::info('Unhandled webhook event: ' . $event['type']);
            }
        } catch (\Exception $e) {
            Log::error('Webhook handling failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle subscription updated webhook
     */
    private function handleSubscriptionUpdated(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => $stripeSubscription['status'],
                'current_period_start' => now()->createFromTimestamp($stripeSubscription['current_period_start']),
                'current_period_end' => now()->createFromTimestamp($stripeSubscription['current_period_end']),
                'trial_ends_at' => $stripeSubscription['trial_end'] ? now()->createFromTimestamp($stripeSubscription['trial_end']) : null,
            ]);
        }
    }

    /**
     * Handle subscription deleted webhook
     */
    private function handleSubscriptionDeleted(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'canceled',
                'ends_at' => now(),
            ]);
        }
    }

    /**
     * Handle payment succeeded webhook
     */
    private function handlePaymentSucceeded(array $invoice): void
    {
        if (isset($invoice['subscription'])) {
            $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
            
            if ($subscription && $subscription->status !== 'active') {
                $subscription->update(['status' => 'active']);
            }
        }
    }

    /**
     * Handle payment failed webhook
     */
    private function handlePaymentFailed(array $invoice): void
    {
        if (isset($invoice['subscription'])) {
            $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
            
            if ($subscription) {
                $subscription->update(['status' => 'past_due']);
            }
        }
    }

    /**
     * Get customer payment methods
     */
    public function getPaymentMethods(string $customerId): array
    {
        try {
            $paymentMethods = PaymentMethod::all([
                'customer' => $customerId,
                'type' => 'card',
            ]);

            return array_map(function ($pm) {
                return [
                    'id' => $pm->id,
                    'brand' => $pm->card->brand,
                    'last4' => $pm->card->last4,
                    'exp_month' => $pm->card->exp_month,
                    'exp_year' => $pm->card->exp_year,
                    'is_default' => false,
                ];
            }, $paymentMethods->data);
        } catch (\Exception $e) {
            Log::error('Failed to fetch payment methods: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get customer invoices
     */
    public function getInvoices(string $customerId): array
    {
        try {
            $invoices = \Stripe\Invoice::all([
                'customer' => $customerId,
                'limit' => 10,
            ]);

            return array_map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'number' => $invoice->number,
                    'amount' => $invoice->amount_paid,
                    'status' => $invoice->status,
                    'created_at' => now()->createFromTimestamp($invoice->created)->toISOString(),
                    'pdf_url' => $invoice->invoice_pdf,
                ];
            }, $invoices->data);
        } catch (\Exception $e) {
            Log::error('Failed to fetch invoices: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get upcoming invoice
     */
    public function getUpcomingInvoice(string $subscriptionId): ?array
    {
        try {
            $invoice = \Stripe\Invoice::upcoming([
                'subscription' => $subscriptionId,
            ]);

            return [
                'amount' => $invoice->amount_due,
                'currency' => $invoice->currency,
                'period_start' => now()->createFromTimestamp($invoice->period_start)->toISOString(),
                'period_end' => now()->createFromTimestamp($invoice->period_end)->toISOString(),
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get specific invoice
     */
    public function getInvoice(string $invoiceId): ?\Stripe\Invoice
    {
        try {
            return \Stripe\Invoice::retrieve($invoiceId);
        } catch (\Exception $e) {
            Log::error('Failed to fetch invoice: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate storage usage for tenant
     */
    private function calculateStorageUsage(): int
    {
        // This is a simplified calculation
        // In production, you might want to query actual file sizes
        try {
            $storageSize = 0;
            
            // Calculate media library storage if exists
            if (class_exists(\Spatie\MediaLibrary\MediaCollections\Models\Media::class)) {
                $storageSize = \Spatie\MediaLibrary\MediaCollections\Models\Media::sum('size');
            }
            
            return $storageSize;
        } catch (\Exception $e) {
            Log::warning("Could not calculate storage usage: " . $e->getMessage());
            return 0;
        }
    }
}
