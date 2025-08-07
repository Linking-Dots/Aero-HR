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
        Schema::table('leaves', function (Blueprint $table) {
            // Fix column name inconsistency
            if (Schema::hasColumn('leaves', 'user') && !Schema::hasColumn('leaves', 'user_id')) {
                $table->renameColumn('user', 'user_id');
            }
            
            // Add approved_by field if it doesn't exist
            if (!Schema::hasColumn('leaves', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            if (Schema::hasColumn('leaves', 'approved_by')) {
                $table->dropForeign(['approved_by']);
                $table->dropColumn('approved_by');
            }
        });
    }
};
