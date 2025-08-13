<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Authentication audit logs table
        Schema::create('auth_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // login, logout, password_change, role_change, etc.
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('email')->nullable(); // For failed login attempts
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->string('session_id')->nullable();
            $table->json('metadata')->nullable(); // Additional context data
            $table->string('risk_level')->default('low'); // low, medium, high, critical
            $table->string('status'); // success, failure, suspicious
            $table->string('location_country')->nullable();
            $table->string('location_city')->nullable();
            $table->decimal('location_latitude', 10, 8)->nullable();
            $table->decimal('location_longitude', 11, 8)->nullable();
            $table->string('device_fingerprint')->nullable();
            $table->boolean('is_anomaly')->default(false);
            $table->timestamp('detected_at')->useCurrent();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['user_id', 'event_type']);
            $table->index(['ip_address', 'detected_at']);
            $table->index(['event_type', 'status']);
            $table->index(['is_anomaly', 'risk_level']);
            $table->index('detected_at');
            
            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        // Security incidents table
        Schema::create('security_incidents', function (Blueprint $table) {
            $table->id();
            $table->string('incident_id')->unique(); // SEC-2025-001
            $table->string('type'); // brute_force, suspicious_login, account_takeover, etc.
            $table->string('severity'); // low, medium, high, critical
            $table->string('status'); // open, investigating, resolved, false_positive
            $table->text('description');
            $table->json('evidence'); // Related log entries, IP addresses, etc.
            $table->json('affected_users')->nullable();
            $table->json('mitigation_actions')->nullable();
            $table->unsignedBigInteger('reported_by')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->timestamp('detected_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['type', 'severity']);
            $table->index(['status', 'detected_at']);
            $table->index('incident_id');
            
            // Foreign keys
            $table->foreign('reported_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });

        // User sessions tracking table
        Schema::create('user_sessions_tracking', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique();
            $table->unsignedBigInteger('user_id');
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->string('device_fingerprint')->nullable();
            $table->string('location_country')->nullable();
            $table->string('location_city')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_suspicious')->default(false);
            $table->json('security_flags')->nullable(); // anomaly_detected, new_device, etc.
            $table->timestamp('last_activity')->useCurrent();
            $table->timestamp('login_at')->useCurrent();
            $table->timestamp('logout_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index(['session_id', 'is_active']);
            $table->index('last_activity');
            
            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Failed login attempts table
        Schema::create('failed_login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->string('failure_reason'); // invalid_email, invalid_password, account_locked, etc.
            $table->integer('consecutive_failures')->default(1);
            $table->boolean('is_blocked')->default(false);
            $table->timestamp('blocked_until')->nullable();
            $table->timestamp('attempted_at')->useCurrent();
            $table->timestamps();
            
            // Indexes
            $table->index(['email', 'attempted_at']);
            $table->index(['ip_address', 'attempted_at']);
            $table->index(['is_blocked', 'blocked_until']);
        });

        // Password reset audit table
        Schema::create('password_reset_audit', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->string('action'); // request_otp, verify_otp, reset_password
            $table->string('status'); // success, failure, suspicious
            $table->string('otp_hash')->nullable(); // For tracking OTP usage
            $table->json('metadata')->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
            
            // Indexes
            $table->index(['email', 'action']);
            $table->index(['ip_address', 'performed_at']);
            $table->index('performed_at');
        });

        // Two-factor authentication audit table
        Schema::create('two_factor_audit', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('action'); // enable, disable, verify, backup_code_used
            $table->string('method'); // totp, sms, email
            $table->string('status'); // success, failure
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->string('backup_code_used')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'action']);
            $table->index('performed_at');
            
            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Security configuration table
        Schema::create('security_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->string('category'); // auth, session, rate_limiting, etc.
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['category', 'is_active']);
            
            // Foreign key
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        // Insert default security configurations
        $this->insertDefaultSecurityConfig();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('two_factor_audit');
        Schema::dropIfExists('password_reset_audit');
        Schema::dropIfExists('failed_login_attempts');
        Schema::dropIfExists('user_sessions_tracking');
        Schema::dropIfExists('security_incidents');
        Schema::dropIfExists('auth_audit_logs');
        Schema::dropIfExists('security_configurations');
    }

    /**
     * Insert default security configurations
     */
    private function insertDefaultSecurityConfig(): void
    {
        $configs = [
            [
                'key' => 'max_concurrent_sessions',
                'value' => json_encode(['limit' => 3, 'enforce' => true]),
                'category' => 'session',
                'description' => 'Maximum concurrent sessions per user'
            ],
            [
                'key' => 'login_rate_limit',
                'value' => json_encode(['attempts' => 5, 'window_minutes' => 15, 'lockout_minutes' => 30]),
                'category' => 'auth',
                'description' => 'Login attempt rate limiting configuration'
            ],
            [
                'key' => 'password_reset_rate_limit',
                'value' => json_encode(['attempts' => 3, 'window_minutes' => 60]),
                'category' => 'auth',
                'description' => 'Password reset rate limiting'
            ],
            [
                'key' => 'geo_anomaly_detection',
                'value' => json_encode(['enabled' => true, 'distance_threshold_km' => 500]),
                'category' => 'security',
                'description' => 'Geographic anomaly detection settings'
            ],
            [
                'key' => 'mandatory_2fa_roles',
                'value' => json_encode(['Super Administrator', 'Administrator', 'Security Officer']),
                'category' => 'auth',
                'description' => 'Roles requiring mandatory 2FA'
            ],
            [
                'key' => 'security_headers',
                'value' => json_encode([
                    'strict_transport_security' => 'max-age=31536000; includeSubDomains',
                    'content_security_policy' => "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
                    'x_frame_options' => 'DENY',
                    'x_content_type_options' => 'nosniff'
                ]),
                'category' => 'security',
                'description' => 'Security headers configuration'
            ],
            [
                'key' => 'incident_thresholds',
                'value' => json_encode([
                    'failed_logins_critical' => 10,
                    'failed_logins_high' => 5,
                    'suspicious_locations' => true,
                    'new_device_admin' => true
                ]),
                'category' => 'security',
                'description' => 'Security incident detection thresholds'
            ]
        ];

        foreach ($configs as $config) {
            DB::table('security_configurations')->insert(array_merge($config, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }
    }
};
