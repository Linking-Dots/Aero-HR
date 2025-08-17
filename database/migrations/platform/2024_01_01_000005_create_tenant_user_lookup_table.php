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
        Schema::create('tenant_user_lookup', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('tenant_id'); // String to match tenants.id (UUID)
            $table->boolean('is_admin')->default(false);
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            // Unique constraint to prevent duplicate email->tenant mappings
            $table->unique(['email', 'tenant_id']);
            
            // Index for fast lookup
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_user_lookup');
    }
};
