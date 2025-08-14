<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Handle Stripe webhook events
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpoint_secret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid Stripe webhook payload: ' . $e->getMessage());
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Invalid Stripe webhook signature: ' . $e->getMessage());
            return response('Invalid signature', 400);
        }

        try {
            $this->subscriptionService->handleWebhook($event->toArray());
            
            Log::info('Stripe webhook processed successfully: ' . $event->type);
            return response('Webhook handled', 200);
        } catch (\Exception $e) {
            Log::error('Stripe webhook processing failed: ' . $e->getMessage());
            return response('Webhook processing failed', 500);
        }
    }
}
