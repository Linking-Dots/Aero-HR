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
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('stripe_subscription_id');
            $table->timestamp('current_period_start')->nullable()->after('trial_ends_at');
            $table->timestamp('current_period_end')->nullable()->after('current_period_start');
            $table->json('metadata')->nullable()->after('auto_renew');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id',
                'current_period_start', 
                'current_period_end',
                'metadata'
            ]);
        });
    }
};
