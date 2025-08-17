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
        // First create attendance_types table if it doesn't exist (needed for foreign key)
        if (!Schema::hasTable('attendance_types')) {
            Schema::create('attendance_types', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug', 191)->unique();
                $table->json('config');
                $table->string('icon')->nullable();
                $table->text('description')->nullable();
                $table->integer('priority')->default(100);
                $table->boolean('is_active')->default(true);
                $table->json('required_permissions')->nullable();
                $table->timestamps();
            });
        }

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->integer('employee_id')->nullable();
            $table->string('user_name');
            $table->string('phone')->unique()->nullable();
            $table->string('email')->unique();
            $table->text('address')->nullable();
            $table->text('about')->nullable();
            $table->foreignId('report_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('password');
            
            // Two-factor authentication columns (merged from multiple migrations)
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            
            $table->foreignId('designation_id')->nullable()->constrained('designations')->nullOnDelete();
            $table->string('nid')->nullable();
            $table->string('name');
            $table->string('profile_image')->nullable();
            $table->string('profile_photo_path')->nullable();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->date('date_of_joining')->nullable();
            $table->date('birthday')->nullable();
            $table->string('gender')->nullable();
            $table->string('passport_no')->nullable();
            $table->date('passport_exp_date')->nullable();
            $table->string('nationality')->nullable();
            $table->string('religion')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('employment_of_spouse')->nullable();
            $table->integer('number_of_children')->nullable();
            $table->string('emergency_contact_primary_name')->nullable();
            $table->string('emergency_contact_primary_relationship')->nullable();
            $table->string('emergency_contact_primary_phone')->nullable();
            $table->string('emergency_contact_secondary_name')->nullable();
            $table->string('emergency_contact_secondary_relationship')->nullable();
            $table->string('emergency_contact_secondary_phone')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('pan_no')->nullable();
            $table->string('family_member_name')->nullable();
            $table->string('family_member_relationship')->nullable();
            $table->date('family_member_dob')->nullable();
            $table->string('family_member_phone')->nullable();

            $table->string('salary_basis')->nullable();
            $table->decimal('salary_amount', 10, 2)->nullable();
            $table->string('payment_type')->nullable();
            $table->boolean('pf_contribution')->nullable();
            $table->string('pf_no')->nullable();
            $table->string('employee_pf_rate')->nullable();
            $table->string('additional_pf_rate')->nullable();
            $table->string('total_pf_rate')->nullable();
            $table->boolean('esi_contribution')->nullable();
            $table->string('esi_no')->nullable();
            $table->string('employee_esi_rate')->nullable();
            $table->string('additional_esi_rate')->nullable();
            $table->string('total_esi_rate')->nullable();
            $table->timestamp('email_verified_at')->nullable();

            // Security tracking columns (merged from enhance users migration)
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->integer('login_count')->default(0);
            
            // User status columns (merged from multiple migrations)
            $table->boolean('active')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('account_locked_at')->nullable();
            $table->string('locked_reason')->nullable();
            
            // Notification and security preferences
            $table->json('notification_preferences')->nullable();
            $table->boolean('security_notifications')->default(true);
            $table->json('preferences')->nullable();
            
            // Attendance configuration (moved from separate table alter)
            $table->foreignId('attendance_type_id')->nullable()->constrained('attendance_types')->nullOnDelete();
            $table->json('attendance_config')->nullable();

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes(); // Merged from separate migration
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Enhanced security tables (merged from enhance users migration)
        Schema::create('authentication_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('event_type', 50);
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->string('status', 20);
            $table->string('risk_level', 20)->default('low');
            $table->timestamp('occurred_at');
            $table->timestamps();
            
            $table->index(['user_id', 'event_type']);
            $table->index(['ip_address', 'occurred_at']);
            $table->index(['event_type', 'status']);
        });

        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 191)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->string('device_fingerprint', 191)->nullable();
            $table->json('device_info')->nullable();
            $table->json('location_info')->nullable();
            $table->boolean('is_current')->default(true);
            $table->timestamp('last_activity');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_current']);
            $table->index(['session_id', 'is_current']);
            $table->index('last_activity');
        });

        Schema::create('failed_login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->string('failure_reason', 100);
            $table->json('metadata')->nullable();
            $table->timestamp('attempted_at');
            $table->timestamps();
            
            $table->index(['email', 'attempted_at']);
            $table->index(['ip_address', 'attempted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('failed_login_attempts');
        Schema::dropIfExists('user_sessions');
        Schema::dropIfExists('authentication_events');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('attendance_types');
    }
};
