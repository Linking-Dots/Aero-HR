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
        Schema::create('tenants', function (Blueprint $table) {
            // Use UUID as primary key for stancl/tenancy compatibility
            $table->string('id')->primary(); // This will store UUID
            $table->string('slug')->unique()->index();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            
            // Database connection details (encrypted) - nullable until provisioned
            $table->string('db_name')->nullable();
            $table->text('db_username')->nullable(); // encrypted
            $table->text('db_password')->nullable(); // encrypted
            $table->string('db_host')->default('127.0.0.1');
            $table->integer('db_port')->default(3306);
            
            // Tenant status and metadata
            $table->enum('status', ['pending', 'provisioning', 'active', 'suspended', 'terminated', 'failed'])
                  ->default('pending');
            $table->json('settings')->nullable();
            $table->string('storage_prefix')->nullable();
            
            // Billing and subscription
            $table->string('stripe_customer_id')->nullable();
            $table->boolean('trial_ends_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('terminated_at')->nullable();
            
            // Required by stancl/tenancy
            $table->json('data')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['status', 'created_at']);
            $table->index('stripe_customer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
