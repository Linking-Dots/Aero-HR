<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            if (!Schema::hasColumn('roles', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            if (!Schema::hasColumn('roles', 'hierarchy_level')) {
                $table->integer('hierarchy_level')->default(10)->after('description');
            }
            if (!Schema::hasColumn('roles', 'is_system_role')) {
                $table->boolean('is_system_role')->default(false)->after('hierarchy_level');
            }
            if (!Schema::hasColumn('roles', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (!Schema::hasColumn('roles', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        // Add indexes in a separate statement
        try {
            DB::statement('CREATE INDEX IF NOT EXISTS roles_hierarchy_level_index ON roles (hierarchy_level)');
            DB::statement('CREATE INDEX IF NOT EXISTS roles_is_system_role_index ON roles (is_system_role)');
        } catch (\Exception $e) {
            // Indexes may already exist, which is fine
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex(['hierarchy_level']);
            $table->dropIndex(['is_system_role']);
            $table->dropColumn(['description', 'hierarchy_level', 'is_system_role', 'created_at', 'updated_at']);
        });
    }
};
