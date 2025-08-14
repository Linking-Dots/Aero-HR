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
        Schema::create('tenant_users', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // UUID from tenants table
            $table->string('name');
            $table->string('email');
            $table->enum('role', ['owner', 'admin', 'invited'])->default('invited');
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->string('invitation_token')->nullable();
            $table->timestamps();
            
            $table->unique(['tenant_id', 'email']);
            $table->index(['tenant_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_users');
    }
};
