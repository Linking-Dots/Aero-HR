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
        Schema::create('user_sessions_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('session_id', 100)->unique();
            $table->ipAddress('ip_address');
            $table->text('user_agent');
            $table->string('device_type', 50)->nullable(); // desktop, mobile, tablet
            $table->string('device_name', 100)->nullable();
            $table->string('browser', 50)->nullable();
            $table->string('platform', 50)->nullable();
            $table->string('location', 255)->nullable();
            $table->json('device_fingerprint')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_activity')->useCurrent();
            $table->timestamp('login_at')->useCurrent();
            $table->timestamp('logout_at')->nullable();
            $table->enum('logout_type', ['manual', 'timeout', 'forced', 'admin'])->nullable();
            $table->json('security_flags')->nullable(); // suspicious activity markers
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index(['session_id', 'is_active']);
            $table->index(['ip_address', 'created_at']);
            $table->index('last_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions_tracking');
    }
};
