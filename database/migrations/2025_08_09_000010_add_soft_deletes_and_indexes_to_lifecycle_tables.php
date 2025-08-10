<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Soft deletes & indexes for onboarding related tables
        if (Schema::hasTable('onboardings')) {
            Schema::table('onboardings', function (Blueprint $table) {
                if (!Schema::hasColumn('onboardings', 'deleted_at')) {
                    $table->softDeletes();
                }
                $table->index(['employee_id', 'status'], 'onboardings_employee_status_idx');
            });
        }
        if (Schema::hasTable('onboarding_tasks')) {
            Schema::table('onboarding_tasks', function (Blueprint $table) {
                if (!Schema::hasColumn('onboarding_tasks', 'deleted_at')) {
                    $table->softDeletes();
                }
                $table->index(['onboarding_id', 'status'], 'onboarding_tasks_parent_status_idx');
                $table->index(['assigned_to', 'status'], 'onboarding_tasks_assignee_status_idx');
            });
        }
        // Soft deletes & indexes for offboarding related tables
        if (Schema::hasTable('offboardings')) {
            Schema::table('offboardings', function (Blueprint $table) {
                if (!Schema::hasColumn('offboardings', 'deleted_at')) {
                    $table->softDeletes();
                }
                $table->index(['employee_id', 'status'], 'offboardings_employee_status_idx');
            });
        }
        if (Schema::hasTable('offboarding_tasks')) {
            Schema::table('offboarding_tasks', function (Blueprint $table) {
                if (!Schema::hasColumn('offboarding_tasks', 'deleted_at')) {
                    $table->softDeletes();
                }
                $table->index(['offboarding_id', 'status'], 'offboarding_tasks_parent_status_idx');
                $table->index(['assigned_to', 'status'], 'offboarding_tasks_assignee_status_idx');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('onboardings')) {
            Schema::table('onboardings', function (Blueprint $table) {
                if (Schema::hasColumn('onboardings', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
                $table->dropIndex('onboardings_employee_status_idx');
            });
        }
        if (Schema::hasTable('onboarding_tasks')) {
            Schema::table('onboarding_tasks', function (Blueprint $table) {
                if (Schema::hasColumn('onboarding_tasks', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
                $table->dropIndex('onboarding_tasks_parent_status_idx');
                $table->dropIndex('onboarding_tasks_assignee_status_idx');
            });
        }
        if (Schema::hasTable('offboardings')) {
            Schema::table('offboardings', function (Blueprint $table) {
                if (Schema::hasColumn('offboardings', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
                $table->dropIndex('offboardings_employee_status_idx');
            });
        }
        if (Schema::hasTable('offboarding_tasks')) {
            Schema::table('offboarding_tasks', function (Blueprint $table) {
                if (Schema::hasColumn('offboarding_tasks', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
                $table->dropIndex('offboarding_tasks_parent_status_idx');
                $table->dropIndex('offboarding_tasks_assignee_status_idx');
            });
        }
    }
};
