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
        Schema::table('users', function (Blueprint $table) {
            // Security notification preferences
            $table->boolean('security_email_notifications')->default(true);
            $table->boolean('security_push_notifications')->default(true);
            $table->boolean('security_sms_notifications')->default(false);
            $table->enum('security_alert_threshold', ['low', 'medium', 'high'])->default('medium');
            
            // Monitoring preferences
            $table->boolean('real_time_monitoring')->default(true);
            $table->boolean('geo_location_tracking')->default(true);
            $table->boolean('device_fingerprinting')->default(true);
            $table->boolean('behavioral_analysis')->default(true);
            
            // Session preferences
            $table->integer('session_timeout')->default(60); // minutes
            
            // Two-factor authentication backup methods
            $table->json('backup_2fa_methods')->nullable();
            
            // Security metadata
            $table->timestamp('last_security_audit')->nullable();
            $table->json('security_preferences')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'security_email_notifications',
                'security_push_notifications', 
                'security_sms_notifications',
                'security_alert_threshold',
                'real_time_monitoring',
                'geo_location_tracking',
                'device_fingerprinting',
                'behavioral_analysis',
                'session_timeout',
                'backup_2fa_methods',
                'last_security_audit',
                'security_preferences'
            ]);
        });
    }
};
