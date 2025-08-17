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
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Fixed from 'user'
            $table->foreignId('leave_type')->constrained('leave_settings')->onDelete('cascade');
            $table->date('from_date');
            $table->date('to_date');
            $table->integer('no_of_days');
            $table->text('reason');
            $table->string('status');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // Added from fix migration
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
