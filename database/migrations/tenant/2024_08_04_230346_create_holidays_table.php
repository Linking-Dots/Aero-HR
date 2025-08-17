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
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable(); // Industry standard enhancement
            $table->date('from_date');
            $table->date('to_date');
            $table->enum('type', ['public', 'religious', 'national', 'company', 'optional'])->default('company'); // Industry standard enhancement
            $table->boolean('is_recurring')->default(false); // Industry standard enhancement
            $table->string('recurrence_pattern')->nullable(); // Industry standard enhancement
            $table->boolean('is_active')->default(true); // Industry standard enhancement
            $table->unsignedBigInteger('created_by')->nullable(); // Industry standard enhancement
            $table->unsignedBigInteger('updated_by')->nullable(); // Industry standard enhancement
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};

