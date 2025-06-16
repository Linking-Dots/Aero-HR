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
        Schema::create('attendance_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 191)->unique(); // 'geo_polygon', 'wifi_ip'
            $table->json('config');           // polygons, allowed IPs, etc
            $table->timestamps();
        });

        Schema::table('attendance_types', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('name');
            $table->text('description')->nullable()->after('slug');
            $table->integer('priority')->default(100)->after('description');
            $table->boolean('is_active')->default(true)->after('priority'); // Add this line
            $table->json('required_permissions')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_types', function (Blueprint $table) {
            $table->dropColumn(['icon', 'description', 'priority', 'is_active', 'required_permissions']); // Add 'is_active' here
        });

        Schema::dropIfExists('attendance_types');
    }
};
