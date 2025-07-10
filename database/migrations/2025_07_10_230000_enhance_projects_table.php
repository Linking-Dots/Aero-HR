<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('projects', function (Blueprint $table) {
            // ISO/PMBOK/Agile/PRINCE2/ERP-aligned fields
            $table->string('project_name')->nullable()->after('id');
            $table->string('project_code')->nullable()->after('project_name');
            $table->string('status')->nullable()->after('priority');
            $table->string('health_status')->nullable()->after('status');
            $table->string('risk_level')->nullable()->after('health_status');
            $table->string('methodology')->nullable()->after('risk_level');
            $table->decimal('budget_allocated', 15, 2)->nullable()->after('description');
            $table->decimal('budget_spent', 15, 2)->nullable()->after('budget_allocated');
            $table->float('spi', 5, 2)->nullable()->after('progress');
            $table->float('cpi', 5, 2)->nullable()->after('spi');
            $table->string('phase')->nullable()->after('cpi');
            $table->string('next_milestone')->nullable()->after('phase');
            $table->string('department_name')->nullable()->after('team_leader_id');
            $table->string('type')->nullable()->after('department_name');
            $table->json('custom_fields')->nullable()->after('type');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'project_name',
                'project_code',
                'status',
                'health_status',
                'risk_level',
                'methodology',
                'budget_allocated',
                'budget_spent',
                'spi',
                'cpi',
                'phase',
                'next_milestone',
                'department_name',
                'type',
                'custom_fields',
                'deleted_at',
            ]);
        });
    }
};
