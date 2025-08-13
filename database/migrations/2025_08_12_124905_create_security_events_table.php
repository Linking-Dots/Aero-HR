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
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('event_type', 100); // login_success, login_failed, 2fa_enabled, etc.
            $table->string('severity', 20)->default('info'); // info, warning, critical
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('location')->nullable();
            $table->json('metadata')->nullable(); // Additional event data
            $table->string('risk_score', 10)->nullable(); // low, medium, high
            $table->boolean('investigated')->default(false);
            $table->text('investigation_notes')->nullable();
            $table->timestamp('investigated_at')->nullable();
            $table->foreignId('investigated_by')->nullable()->constrained('users');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['user_id', 'event_type']);
            $table->index(['severity', 'created_at']);
            $table->index(['ip_address', 'created_at']);
            $table->index('risk_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};
