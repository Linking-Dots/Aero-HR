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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->integer('client_id')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('rate', 10, 2)->nullable(); // Adjust precision as needed
            $table->string('rate_type')->nullable();
            $table->string('priority')->nullable();
            $table->foreignId('project_leader_id')->constrained('users')->nullable(); // Adjust column name if needed
            $table->foreignId('team_leader_id')->constrained('users')->nullable(); // Adjust column name if needed
            $table->text('description')->nullable();
            $table->json('files')->nullable();
            $table->integer('open_tasks')->default(0);
            $table->integer('completed_tasks')->default(0);
            $table->integer('progress')->default(0);
            
            // Basic project management fields (from project management migration)
            $table->enum('status', ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'])->default('pending');
            $table->decimal('budget', 15, 2)->default(0.00);
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->string('color')->nullable();
            $table->text('notes')->nullable();
            
            // Enhanced project fields (from enhanced project fields migration)
            // ISO 21500 & PMBOK Performance Metrics
            $table->decimal('spi', 5, 2)->default(1.00)->comment('Schedule Performance Index');
            $table->decimal('cpi', 5, 2)->default(1.00)->comment('Cost Performance Index');
            $table->decimal('budget_utilization', 5, 2)->default(0.00)->comment('Budget utilization percentage');

            // Health and Risk Management
            $table->enum('health_status', ['good', 'at_risk', 'critical', 'unknown'])->default('unknown');
            $table->enum('risk_level', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('risk_factors')->nullable()->comment('Risk assessment details');

            // Project Management Methodology
            $table->enum('methodology', ['waterfall', 'agile', 'scrum', 'prince2', 'kanban', 'hybrid', 'other'])->default('agile');
            $table->string('project_type')->nullable()->comment('digital, enhancement, analytics, integration, security, marketing');

            // Enhanced Timeline Management
            $table->date('planned_start_date')->nullable();
            $table->date('planned_end_date')->nullable();
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();

            // Budget Tracking
            $table->decimal('budget_allocated', 15, 2)->default(0.00);
            $table->decimal('budget_spent', 15, 2)->default(0.00);
            $table->decimal('budget_committed', 15, 2)->default(0.00);
            $table->decimal('expected_roi', 8, 2)->nullable()->comment('Expected Return on Investment percentage');

            // Strategic Alignment
            $table->integer('strategic_importance')->default(50)->comment('Strategic importance score 0-100');
            $table->integer('business_impact')->default(50)->comment('Business impact score 0-100');
            $table->string('business_unit')->nullable();

            // Team and Resource Management
            $table->integer('team_size')->default(0);
            $table->decimal('resource_utilization', 5, 2)->default(0.00)->comment('Resource utilization percentage');
            $table->json('skill_requirements')->nullable()->comment('Required skills and competencies');

            // Quality Management
            $table->decimal('quality_score', 5, 2)->default(0.00)->comment('Quality assessment score');
            $table->integer('defect_count')->default(0);
            $table->decimal('customer_satisfaction', 5, 2)->default(0.00)->comment('Customer satisfaction score');

            // Milestone and Progress Tracking
            $table->string('current_phase')->nullable();
            $table->string('next_milestone')->nullable();
            $table->date('next_milestone_date')->nullable();
            $table->json('milestones')->nullable()->comment('Milestone tracking data');

            // Compliance and Governance
            $table->boolean('iso_compliant')->default(false);
            $table->boolean('pmbok_compliant')->default(false);
            $table->json('compliance_checklist')->nullable();

            // Audit and Change Management
            $table->json('change_log')->nullable()->comment('Project change history');
            $table->timestamp('last_health_check')->nullable();
            $table->string('last_modified_by')->nullable();

            // Portfolio Management
            $table->string('portfolio_category')->nullable();
            $table->integer('portfolio_priority')->default(50)->comment('Portfolio priority ranking');
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->string('archived_by')->nullable();
            $table->text('archive_reason')->nullable();

            // Integration and External References
            $table->string('external_project_id')->nullable()->comment('External system project ID');
            $table->json('external_integrations')->nullable()->comment('External system integrations');
            $table->string('jira_project_key')->nullable();
            $table->string('confluence_space')->nullable();

            $table->timestamps();
            
            // Add indexes for performance
            $table->index(['status', 'priority']);
            $table->index(['health_status', 'risk_level']);
            $table->index(['methodology', 'project_type']);
            $table->index(['is_archived', 'archived_at']);
            $table->index(['business_unit', 'portfolio_category']);
        });


    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('projects');
    }
};

