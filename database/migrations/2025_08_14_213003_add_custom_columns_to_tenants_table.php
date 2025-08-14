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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('slug')->unique()->after('name');
            $table->string('domain')->unique()->nullable()->after('slug');
            $table->string('database_name')->after('domain');
            $table->foreignId('plan_id')->nullable()->after('database_name');
            $table->enum('status', ['active', 'suspended', 'cancelled'])->default('active')->after('plan_id');
            $table->timestamp('trial_ends_at')->nullable()->after('status');
            $table->json('settings')->nullable()->after('trial_ends_at');
            
            $table->index(['status', 'trial_ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex(['status', 'trial_ends_at']);
            $table->dropColumn([
                'name', 'slug', 'domain', 'database_name', 
                'plan_id', 'status', 'trial_ends_at', 'settings'
            ]);
        });
    }
};
