<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('letters', function (Blueprint $table) {
            $table->id();
            $table->string('from');
            $table->enum('status', ['Closed', 'Open'])->default('Open');
            $table->date('received_date');
            $table->string('memo_number', 191)->unique();
            $table->string('handling_memo', 191)->unique();
            $table->text('subject');
            $table->text('action_taken')->nullable();
            $table->date('response_date')->nullable();
            $table->string('handling_link')->nullable();
            $table->string('handling_status')->nullable();
            $table->boolean('need_reply')->default(false);
            $table->boolean('replied_status')->default(false);
            $table->boolean('need_forward')->default(false);
            $table->boolean('forwarded_status')->default(false);
            // Foreign key for the User model
            $table->foreignId('dealt_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('letters');
    }
};
