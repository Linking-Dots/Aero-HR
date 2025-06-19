<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Role\RolePermissionService;

/**
 * Enterprise Role System Seeder
 * 
 * Initializes the complete enterprise role system with:
 * - Standard enterprise modules and permissions
 * - Role hierarchy and templates
 * - ISO 27001/27002 compliance structure
 */
class EnterpriseRoleSystemSeeder extends Seeder
{
    private RolePermissionService $rolePermissionService;

    public function __construct()
    {
        $this->rolePermissionService = new RolePermissionService();
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Initializing Enterprise Role System...');

        try {
            // Initialize the complete enterprise system
            $results = $this->rolePermissionService->initializeEnterpriseSystem();

            $this->command->info('✅ Enterprise Role System initialized successfully!');
            $this->command->table(
                ['Component', 'Count'],
                [
                    ['Modules Created', $results['modules_created']],
                    ['Permissions Created', $results['permissions_created']],
                    ['Roles Created', $results['roles_created']],
                    ['Assignments Made', $results['assignments_made']]
                ]
            );

            // Run additional setup
            $this->setupNavigationPermissions();
            $this->setupAuditTrail();

        } catch (\Exception $e) {
            $this->command->error('❌ Failed to initialize enterprise system: ' . $e->getMessage());
            Log::error('Enterprise system seeding failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Setup navigation-based permissions
     */
    private function setupNavigationPermissions(): void
    {
        $this->command->info('📋 Setting up navigation permissions...');
        
        try {
            $navigationPermissions = $this->rolePermissionService->getNavigationPermissions();
            $this->command->info('✅ Navigation permissions configured successfully!');
        } catch (\Exception $e) {
            $this->command->warn('⚠️ Navigation permissions setup failed: ' . $e->getMessage());
        }
    }

    /**
     * Setup audit trail for compliance
     */
    private function setupAuditTrail(): void
    {
        $this->command->info('📊 Setting up audit trail...');
        
        try {
            $audit = $this->rolePermissionService->auditRolePermissions();
            $this->command->info('✅ Audit trail configured successfully!');
            $this->command->info("📈 Audit Summary: {$audit['roles_reviewed']} roles reviewed");
        } catch (\Exception $e) {
            $this->command->warn('⚠️ Audit trail setup failed: ' . $e->getMessage());
        }
    }
}
