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
        Schema::create('leave_settings', function (Blueprint $table) {
            $table->id();
            $table->string('leave_type');
            $table->integer('days');
            $table->boolean('carry_forward')->default(false);
            $table->boolean('earned_leave')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_settings');
    }
};
