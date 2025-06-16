<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 191)->unique(); // Limit to 191 characters
            $table->enum('type', ['office', 'construction_zone', 'expressway_route', 'field_site']);
            $table->json('coordinates')->nullable(); // For polygons, routes, points
            $table->json('allowed_ips')->nullable();
            $table->string('wifi_ssid')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_locations');
    }
};