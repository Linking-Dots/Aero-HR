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
        Schema::table('roles', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->boolean('is_system_role')->default(false)->after('description');
            $table->integer('hierarchy_level')->default(10)->after('is_system_role');
            $table->json('module_config')->nullable()->after('hierarchy_level');
            $table->timestamp('last_modified_at')->nullable()->after('module_config');
            $table->string('created_by')->nullable()->after('last_modified_at');
            $table->string('modified_by')->nullable()->after('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'is_system_role',
                'hierarchy_level',
                'module_config',
                'last_modified_at',
                'created_by',
                'modified_by'
            ]);
        });
    }
};
