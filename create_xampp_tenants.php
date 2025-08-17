<?php

/**
 * XAMPP Tenant Creation Script for Aero-HR
 * 
 * This script creates test tenants for local XAMPP development
 * Run: php create_xampp_tenants.php
 */

require_once 'vendor/autoload.php';

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\Domain;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🚀 Creating test tenants for XAMPP local development...\n\n";

// Test tenants data
$testTenants = [
    [
        'domain' => 'dbedc',
        'name' => 'DBEDC Company',
        'description' => 'Development & Business Excellence Consulting'
    ],
    [
        'domain' => 'acme',
        'name' => 'Acme Corporation',
        'description' => 'Technology Solutions Provider'
    ],
    [
        'domain' => 'techstart',
        'name' => 'TechStart Inc',
        'description' => 'Startup Technology Company'
    ],
    [
        'domain' => 'globalhr',
        'name' => 'Global HR Solutions',
        'description' => 'International HR Consulting'
    ],
    [
        'domain' => 'innovate',
        'name' => 'Innovate Labs',
        'description' => 'Research and Development'
    ]
];

try {
    // Check if we have any plans, create a default one if needed
    $plan = Plan::first();
    if (!$plan) {
        echo "📋 Creating default plan...\n";
        $plan = Plan::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'price' => 29.99,
            'billing_cycle' => 'monthly',
            'features' => [
                'users' => 50,
                'storage' => '10GB',
                'support' => 'email',
                'modules' => ['hrm', 'attendance', 'leave', 'payroll']
            ],
            'is_active' => true
        ]);
        echo "✅ Default plan created: {$plan->name}\n\n";
    }

    echo "📁 Creating test tenants...\n";
    echo "-----------------------------------\n";

    foreach ($testTenants as $tenantData) {
        // Check if tenant already exists
        $existing = Tenant::where('domain', $tenantData['domain'])->first();
        
        if ($existing) {
            echo "⚠️  Tenant '{$tenantData['domain']}' already exists, skipping...\n";
            continue;
        }

        // Create new tenant
        $tenant = Tenant::create([
            'id' => (string) Str::uuid(),
            'name' => $tenantData['name'],
            'slug' => Str::slug($tenantData['name']),
            'domain' => $tenantData['domain'],
            'database_name' => 'tenant_' . $tenantData['domain'],
            'plan_id' => $plan->id,
            'status' => 'active',
            'trial_ends_at' => now()->addDays(30),
            'settings' => [
                'description' => $tenantData['description'],
                'timezone' => 'UTC',
                'currency' => 'USD',
                'created_via' => 'xampp_script'
            ]
        ]);

        // Create domain records for the tenant
        Domain::create([
            'domain' => $tenantData['domain'] . '.aero-hr.local',
            'tenant_id' => $tenant->id
        ]);
        
        Domain::create([
            'domain' => '127.0.0.1:8000/tenant/' . $tenantData['domain'],
            'tenant_id' => $tenant->id
        ]);

        echo "✅ Created: {$tenantData['domain']}.aero-hr.local ({$tenantData['name']})\n";
        echo "   💾 Database: {$tenant->database_name}\n";
        echo "   🆔 ID: {$tenant->id}\n";
        echo "   📅 Trial ends: {$tenant->trial_ends_at->format('Y-m-d')}\n\n";
    }

    echo "🎉 Tenant creation completed!\n\n";
    echo "📋 Summary:\n";
    echo "-----------------------------------\n";
    
    $allTenants = Tenant::all();
    foreach ($allTenants as $tenant) {
        echo "🏢 {$tenant->name}\n";
        echo "   🌐 URL: http://{$tenant->domain}.aero-hr.local\n";
        echo "   🔑 Login: http://{$tenant->domain}.aero-hr.local/login\n\n";
    }

    echo "🔧 Next Steps:\n";
    echo "1. Add these domains to your Windows hosts file:\n";
    echo "   C:\\Windows\\System32\\drivers\\etc\\hosts\n\n";
    
    foreach ($allTenants as $tenant) {
        echo "   127.0.0.1    {$tenant->domain}.aero-hr.local\n";
    }
    
    echo "\n2. Configure Apache virtual hosts in XAMPP\n";
    echo "3. Restart Apache in XAMPP Control Panel\n";
    echo "4. Test the domains in your browser\n\n";
    
    echo "📚 For detailed setup instructions, see:\n";
    echo "   docs/xampp-setup-guide.md\n\n";

} catch (\Exception $e) {
    echo "❌ Error creating tenants: " . $e->getMessage() . "\n";
    echo "📝 Stack trace:\n" . $e->getTraceAsString() . "\n";
}
