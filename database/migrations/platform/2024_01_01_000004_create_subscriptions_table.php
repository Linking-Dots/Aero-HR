<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // String to match tenants.id (UUID)
            $table->foreignId('plan_id')->constrained('plans');
            
            // Stripe subscription details
            $table->string('stripe_subscription_id')->unique();
            $table->string('stripe_status');
            $table->string('billing_cycle'); // monthly, yearly
            $table->integer('quantity')->default(1);
            
            // Subscription periods
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            
            // Billing
            $table->integer('amount')->nullable(); // in cents
            $table->string('currency', 3)->default('usd');
            $table->timestamp('last_payment_at')->nullable();
            $table->timestamp('next_payment_at')->nullable();
            
            // Subscription metadata
            $table->json('metadata')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            // Indexes
            $table->index(['tenant_id', 'stripe_status']);
            $table->index('stripe_subscription_id');
            $table->index(['current_period_end', 'stripe_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
