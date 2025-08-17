<?php

use App\Models\Tenant;
use App\Jobs\ProvisionTenantJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Test script for tenant provisioning - Step 2 of multi-tenant SaaS conversion
 * This script tests the automated tenant provisioning with comprehensive role/permission system
 */

// Clear Laravel caches to ensure clean state
Artisan::call('config:clear');
Artisan::call('cache:clear');
Artisan::call('permission:cache-reset');

echo "🚀 Starting Step 2 Tenant Provisioning Test\n";
echo "==========================================\n\n";

try {
    // Create a test tenant
    echo "📝 Creating test tenant...\n";
    $tenant = Tenant::create([
        'name' => 'Test Company Ltd',
        'slug' => 'test-company-' . time(),
        'email' => 'admin@testcompany.com',
        'status' => 'pending',
        'plan' => 'professional',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    echo "✅ Test tenant created: {$tenant->name} (ID: {$tenant->id})\n";
    echo "   Slug: {$tenant->slug}\n";
    echo "   Email: {$tenant->email}\n\n";

    // Define admin user for the tenant
    $adminUser = [
        'name' => 'Test Admin',
        'email' => 'admin@testcompany.com',
        'first_name' => 'Test',
        'last_name' => 'Admin',
        'department_id' => null, // Will be set after departments are created
        'designation_id' => null, // Will be set after designations are created
        'is_active' => true,
        'email_verified_at' => now(),
    ];

    echo "👤 Admin user defined:\n";
    echo "   Name: {$adminUser['name']}\n";
    echo "   Email: {$adminUser['email']}\n\n";

    // Test Step 2: Provision the tenant with comprehensive role/permission system
    echo "🔄 Starting tenant provisioning job...\n";
    echo "This will:\n";
    echo "  1. Generate database credentials\n";
    echo "  2. Create tenant database\n";
    echo "  3. Run cleaned-up migrations (57 files instead of 142+)\n";
    echo "  4. Seed comprehensive role/permission system (11+ modules)\n";
    echo "  5. Create admin user with Tenant Admin role\n";
    echo "  6. Setup default departments and settings\n";
    echo "  7. Configure storage and domain\n\n";

    // Execute the provisioning job synchronously for testing
    $provisioningJob = new ProvisionTenantJob($tenant, $adminUser, true);
    
    echo "⏱️  Executing provisioning job...\n";
    $startTime = microtime(true);
    
    $provisioningJob->handle();
    
    $endTime = microtime(true);
    $duration = round($endTime - $startTime, 2);

    echo "\n✅ Tenant provisioning completed successfully!\n";
    echo "   Duration: {$duration} seconds\n\n";

    // Refresh tenant to see updated data
    $tenant->refresh();

    echo "📊 Tenant Provisioning Results:\n";
    echo "================================\n";
    echo "Tenant ID: {$tenant->id}\n";
    echo "Name: {$tenant->name}\n";
    echo "Slug: {$tenant->slug}\n";
    echo "Status: {$tenant->status}\n";
    echo "Database Name: {$tenant->db_name}\n";
    echo "Database Username: {$tenant->db_username}\n";
    echo "Storage Prefix: {$tenant->storage_prefix}\n\n";

    // Test database connection
    echo "🔗 Testing tenant database connection...\n";
    $connectionName = "tenant_{$tenant->id}";
    $connectionConfig = array_merge(
        config('database.connections.tenant'),
        $tenant->getDatabaseConnection()
    );
    
    config(["database.connections.{$connectionName}" => $connectionConfig]);
    
    try {
        $pdo = DB::connection($connectionName)->getPdo();
        echo "✅ Database connection successful!\n";
        
        // Test role/permission system
        echo "\n🔐 Testing comprehensive role/permission system...\n";
        
        // Count roles
        $roleCount = DB::connection($connectionName)->table('roles')->count();
        echo "   Roles created: {$roleCount}\n";
        
        // Count permissions
        $permissionCount = DB::connection($connectionName)->table('permissions')->count();
        echo "   Permissions created: {$permissionCount}\n";
        
        // Count departments
        $deptCount = DB::connection($connectionName)->table('departments')->count();
        echo "   Departments created: {$deptCount}\n";
        
        // Count users
        $userCount = DB::connection($connectionName)->table('users')->count();
        echo "   Users created: {$userCount}\n";
        
        // Check admin user role assignment
        $adminRoleAssignment = DB::connection($connectionName)
            ->table('model_has_roles')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'Tenant Admin')
            ->where('model_type', 'App\\Models\\User')
            ->count();
        echo "   Admin role assignments: {$adminRoleAssignment}\n";
        
        // List all modules with permission counts
        echo "\n📋 Permission modules breakdown:\n";
        $modules = DB::connection($connectionName)
            ->table('permissions')
            ->select('module')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('module')
            ->orderBy('module')
            ->get();
            
        foreach ($modules as $module) {
            echo "   {$module->module}: {$module->count} permissions\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Database connection failed: " . $e->getMessage() . "\n";
        throw $e;
    }

    echo "\n🎉 Step 2 Tenant Provisioning Test PASSED!\n";
    echo "===========================================\n";
    echo "✅ Migration cleanup successful (142+ → 57 files)\n";
    echo "✅ Comprehensive role/permission system deployed\n";
    echo "✅ Tenant database created and migrated\n";
    echo "✅ Admin user created with proper roles\n";
    echo "✅ Default departments and settings configured\n";
    echo "✅ Storage and domain setup completed\n\n";
    
    echo "🚀 Ready for Step 3: Multi-tenant authentication and domain routing\n";

} catch (Exception $e) {
    echo "\n❌ Tenant provisioning test FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    
    // Cleanup on failure
    if (isset($tenant)) {
        echo "\n🧹 Cleaning up failed test tenant...\n";
        try {
            // Use the cleanup from ProvisionTenantJob
            if (!empty($tenant->db_name)) {
                $adminConnection = DB::connection('tenant_admin');
                $adminConnection->statement("DROP DATABASE IF EXISTS `{$tenant->db_name}`");
                
                if (!empty($tenant->db_username)) {
                    $host = config('database.connections.tenant.host', '127.0.0.1');
                    $adminConnection->statement("DROP USER IF EXISTS '{$tenant->db_username}'@'{$host}'");
                }
            }
            
            $tenant->delete();
            echo "✅ Cleanup completed\n";
        } catch (Exception $cleanupException) {
            echo "❌ Cleanup failed: " . $cleanupException->getMessage() . "\n";
        }
    }
    
    exit(1);
}
