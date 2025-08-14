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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2);
            $table->enum('billing_cycle', ['monthly', 'yearly']);
            $table->json('features');
            $table->json('limits');
            $table->string('stripe_price_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('trial_days')->default(14);
            $table->timestamps();
            
            $table->index(['is_active', 'billing_cycle']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
