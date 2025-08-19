<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Tenant;
use App\Services\TenantLoginTokenService;
use Stancl\Tenancy\Facades\Tenancy;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== AUTO-LOGIN URL GENERATION TEST ===\n\n";

try {
    // Get tenant
    $tenant = Tenant::find('2b35d3b9-73de-4efd-ad09-f55049d53470');
    if (!$tenant) {
        echo "❌ Tenant not found!\n";
        exit(1);
    }
    echo "✅ Tenant found: {$tenant->id}\n";

    // Initialize tenancy
    Tenancy::initialize($tenant);
    echo "✅ Tenancy initialized\n";

    // Check current database connection
    $currentDb = DB::connection()->getDatabaseName();
    echo "✅ Current database: {$currentDb}\n";

    // Try to find user
    $user = \App\Models\User::where('email', 'admin@completetest.com')->first();
    if (!$user) {
        echo "❌ User not found! Available users:\n";
        $users = \App\Models\User::all();
        foreach ($users as $u) {
            echo "   - {$u->name} ({$u->email})\n";
        }
        exit(1);
    }
    
    echo "✅ User found: {$user->name} ({$user->email})\n";

    // Generate auto-login URL
    $tokenService = app(TenantLoginTokenService::class);
    $autoLoginUrl = $tokenService->generateLoginUrl($tenant, $user);
    echo "✅ Auto-login URL generated: {$autoLoginUrl}\n\n";

    // Parse the URL to analyze structure
    $parsedUrl = parse_url($autoLoginUrl);
    echo "=== URL ANALYSIS ===\n";
    echo "Scheme: " . ($parsedUrl['scheme'] ?? 'None') . "\n";
    echo "Host: " . ($parsedUrl['host'] ?? 'None') . "\n";
    echo "Port: " . ($parsedUrl['port'] ?? 'None') . "\n";
    echo "Path: " . ($parsedUrl['path'] ?? 'None') . "\n";
    echo "Query: " . ($parsedUrl['query'] ?? 'None') . "\n";

    // Test if the URL structure is correct for path-based routing
    if (strpos($parsedUrl['path'], '/completetest1755624865/') !== false) {
        echo "✅ URL uses correct path-based routing format\n";
    } else {
        echo "❌ URL does not use expected path-based routing format\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
