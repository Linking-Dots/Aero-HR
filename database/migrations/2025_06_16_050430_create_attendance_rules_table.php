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
        Schema::create('attendance_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_type_id')->constrained();
            $table->foreignId('attendance_location_id')->nullable()->constrained()->after('attendance_type_id');

            $table->string('applicable_to_type', 100);
            $table->unsignedBigInteger('applicable_to_id');
            $table->index(['applicable_to_type', 'applicable_to_id']);

            $table->json('time_restrictions')->nullable(); // Work hours, days
            $table->json('user_groups')->nullable(); // Departments, roles, specific users
            $table->boolean('is_mandatory')->default(true);
            $table->integer('validation_order')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_rules');
    }
};
