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
        // Security blacklisted IPs table
        if (!Schema::hasTable('security_blacklisted_ips')) {
            Schema::create('security_blacklisted_ips', function (Blueprint $table) {
                $table->id();
                $table->string('ip_address', 45)->nullable();
                $table->string('ip_range', 50)->nullable(); // For CIDR notation
                $table->string('reason')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('blocked_at')->useCurrent();
                $table->timestamp('expires_at')->nullable();
                $table->unsignedBigInteger('blocked_by')->nullable();
                $table->timestamps();
                
                $table->index(['ip_address', 'is_active']);
                $table->index(['ip_range', 'is_active']);
                $table->foreign('blocked_by')->references('id')->on('users')->onDelete('set null');
            });
        }

        // Authentication audit logs table
        if (!Schema::hasTable('auth_audit_logs')) {
            Schema::create('auth_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('event_type');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('email')->nullable();
                $table->string('ip_address', 45);
                $table->text('user_agent')->nullable();
                $table->string('session_id')->nullable();
                $table->json('metadata')->nullable();
                $table->string('risk_level')->default('low');
                $table->string('status');
                $table->string('location_country')->nullable();
                $table->string('location_city')->nullable();
                $table->decimal('location_latitude', 10, 8)->nullable();
                $table->decimal('location_longitude', 11, 8)->nullable();
                $table->string('device_fingerprint')->nullable();
                $table->boolean('is_anomaly')->default(false);
                $table->timestamp('detected_at')->useCurrent();
                $table->timestamps();
                
                $table->index(['user_id', 'event_type']);
                $table->index(['ip_address', 'detected_at']);
                $table->index(['event_type', 'status']);
                $table->index(['is_anomaly', 'risk_level']);
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Security incidents table
        if (!Schema::hasTable('security_incidents')) {
            Schema::create('security_incidents', function (Blueprint $table) {
                $table->id();
                $table->string('type'); // brute_force, anomaly_detected, suspicious_login, etc.
                $table->string('severity'); // low, medium, high, critical
                $table->string('status')->default('open'); // open, investigating, resolved, false_positive
                $table->text('description');
                $table->json('evidence');
                $table->json('affected_users')->nullable();
                $table->json('mitigation_actions')->nullable();
                $table->unsignedBigInteger('reported_by')->nullable();
                $table->unsignedBigInteger('assigned_to')->nullable();
                $table->timestamp('detected_at')->useCurrent();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();
                
                $table->index(['type', 'severity']);
                $table->index(['status', 'detected_at']);
                $table->foreign('reported_by')->references('id')->on('users')->onDelete('set null');
                $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            });
        }

        // Login failures tracking table
        if (!Schema::hasTable('login_failures_tracking')) {
            Schema::create('login_failures_tracking', function (Blueprint $table) {
                $table->id();
                $table->string('email');
                $table->string('ip_address', 45);
                $table->text('user_agent')->nullable();
                $table->string('failure_reason');
                $table->integer('consecutive_failures')->default(1);
                $table->boolean('is_blocked')->default(false);
                $table->timestamp('blocked_until')->nullable();
                $table->timestamp('attempted_at')->useCurrent();
                $table->timestamps();
                
                $table->index(['email', 'attempted_at']);
                $table->index(['ip_address', 'attempted_at']);
                $table->index(['is_blocked', 'blocked_until']);
            });
        }

        // Password reset audit table
        if (!Schema::hasTable('password_reset_audit')) {
            Schema::create('password_reset_audit', function (Blueprint $table) {
                $table->id();
                $table->string('email');
                $table->string('ip_address', 45);
                $table->text('user_agent')->nullable();
                $table->string('action');
                $table->string('status');
                $table->string('otp_hash')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('performed_at')->useCurrent();
                $table->timestamps();
                
                $table->index(['email', 'action']);
                $table->index(['ip_address', 'performed_at']);
            });
        }

        // Two factor authentication audit table
        if (!Schema::hasTable('two_factor_auth_audit')) {
            Schema::create('two_factor_auth_audit', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('action');
                $table->string('status');
                $table->string('ip_address', 45);
                $table->text('user_agent')->nullable();
                $table->string('backup_code_used')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamp('performed_at')->useCurrent();
                $table->timestamps();
                
                $table->index(['user_id', 'action']);
                $table->index('performed_at');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Device fingerprints table
        if (!Schema::hasTable('device_fingerprints')) {
            Schema::create('device_fingerprints', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('fingerprint_hash')->unique();
                $table->json('fingerprint_data');
                $table->string('device_name')->nullable();
                $table->boolean('is_trusted')->default(false);
                $table->timestamp('first_seen')->useCurrent();
                $table->timestamp('last_seen')->useCurrent();
                $table->timestamps();
                
                $table->index(['user_id', 'is_trusted']);
                $table->index('fingerprint_hash');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_fingerprints');
        Schema::dropIfExists('two_factor_auth_audit');
        Schema::dropIfExists('password_reset_audit');
        Schema::dropIfExists('login_failures_tracking');
        Schema::dropIfExists('security_incidents');
        Schema::dropIfExists('auth_audit_logs');
        Schema::dropIfExists('security_blacklisted_ips');
    }
};
