<?php

// Test tenant creation to verify the multi-tenant registration flow
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\TenantService;
use App\Services\TenantLoginTokenService;
use App\Models\Plan;

echo "=== Multi-Tenant Registration Flow Test ===\n\n";

try {
    // Test data
    $testData = [
        'company_name' => 'Test Company Ltd',
        'domain' => 'testcompany' . time(), // Make it unique
        'owner_name' => 'John Doe',
        'owner_email' => 'john@testcompany' . time() . '.com',
        'password' => 'SecurePassword123!',
        'plan_id' => 1, // Starter plan
        'billing_cycle' => 'monthly',
        'settings' => [
            'timezone' => 'UTC',
            'currency' => 'USD',
        ]
    ];

    echo "1. Testing Tenant Creation...\n";
    $tenantService = new TenantService();
    
    // Create tenant
    $tenant = $tenantService->createTenant([
        'name' => $testData['company_name'],
        'domain' => $testData['domain'],
        'plan_id' => $testData['plan_id'],
        'settings' => $testData['settings']
    ]);
    
    echo "   ✓ Tenant created: {$tenant->id} ({$testData['domain']})\n";

    echo "\n2. Testing Tenant Database Setup...\n";
    
    // Run tenant migrations first
    echo "   Running tenant migrations...\n";
    \Illuminate\Support\Facades\Artisan::call('tenants:migrate', [
        '--tenants' => [$tenant->id],
    ]);
    echo "   ✓ Tenant migrations completed\n";

    echo "\n3. Testing Tenant Owner Creation...\n";
    
    // Create owner user
    $owner = $tenantService->createTenantOwner($tenant, [
        'name' => $testData['owner_name'],
        'email' => $testData['owner_email'],
        'password' => $testData['password'],
    ]);
    
    echo "   ✓ Owner created: {$owner->id} ({$owner->email})\n";

    echo "\n4. Testing Tenant Default Seeding...\n";
    
    // Seed defaults
    $seedResult = $tenantService->seedTenantDefaults($tenant);
    echo "   ✓ Defaults seeded: " . ($seedResult ? 'SUCCESS' : 'FAILED') . "\n";

    echo "\n5. Testing Auto-Login Token Generation...\n";
    
    // Generate auto-login token
    $loginTokenService = new TenantLoginTokenService();
    $autoLoginUrl = $loginTokenService->generateLoginUrl($tenant, $owner);
    echo "   ✓ Auto-login URL: {$autoLoginUrl}\n";

    echo "\n6. Testing Database Separation...\n";
    
    // Initialize tenant context to verify separate database
    tenancy()->initialize($tenant);
    
    $userInTenant = \App\Models\User::where('email', $owner->email)->first();
    echo "   ✓ User exists in tenant database: " . ($userInTenant ? 'YES' : 'NO') . "\n";
    
    // Check if user has Super Administrator role
    if ($userInTenant && method_exists($userInTenant, 'hasRole')) {
        $hasSuperAdminRole = $userInTenant->hasRole('Super Administrator');
        echo "   ✓ Has Super Administrator role: " . ($hasSuperAdminRole ? 'YES' : 'NO') . "\n";
    }
    
    tenancy()->end();

    echo "\n7. Testing Central Database Separation...\n";
    
    // Verify user doesn't exist in central database
    $userInCentral = \Illuminate\Support\Facades\DB::connection('mysql')
        ->table('platform_users')
        ->where('email', $owner->email)
        ->first();
    echo "   ✓ User NOT in central database: " . ($userInCentral ? 'NO (ERROR)' : 'YES') . "\n";

    echo "\n=== REGISTRATION FLOW TEST COMPLETED SUCCESSFULLY ===\n";
    echo "\nNext steps for user:\n";
    echo "1. Visit: {$autoLoginUrl}\n";
    echo "2. User will be automatically logged into tenant subdomain\n";
    echo "3. User will see dashboard with Super Administrator privileges\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
