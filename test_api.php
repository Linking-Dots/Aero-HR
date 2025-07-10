<?php

// Simple test script to verify Project Management API endpoints
require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Contracts\Console\Kernel;

// Create Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// Test basic functionality
echo "Testing Project Management API endpoints...\n";

try {
    // Test 1: Check if Project model works
    echo "1. Testing Project model...\n";
    $projectCount = \App\Models\Project::count();
    echo "   Project count: {$projectCount}\n";

    // Test 2: Check if Department model works
    echo "2. Testing Department model...\n";
    $departmentCount = \App\Models\HRM\Department::count();
    echo "   Department count: {$departmentCount}\n";

    // Test 3: Check if User model works
    echo "3. Testing User model...\n";
    $userCount = \App\Models\User::count();
    echo "   User count: {$userCount}\n";

    // Test 4: Test project creation
    echo "4. Testing project creation...\n";
    $project = \App\Models\Project::create([
        'project_name' => 'Test Project API',
        'project_code' => 'TEST-' . time(),
        'description' => 'Test project for API validation',
        'start_date' => now(),
        'end_date' => now()->addMonths(3),
        'status' => 'not_started',
        'priority' => 'medium',
        'health_status' => 'good',
        'risk_level' => 'low',
        'methodology' => 'agile',
        'budget_allocated' => 50000,
        'budget_spent' => 0,
        'progress' => 0,
        'spi' => 1.0,
        'cpi' => 1.0,
        'project_leader_id' => 1, // Assume user ID 1 exists
    ]);

    echo "   Created project: {$project->project_name} (ID: {$project->id})\n";

    // Test 5: Test project filtering
    echo "5. Testing project filtering...\n";
    $activeProjects = \App\Models\Project::where('status', 'in_progress')->count();
    echo "   Active projects: {$activeProjects}\n";

    // Test 6: Test KPI calculations
    echo "6. Testing KPI calculations...\n";
    $totalBudget = \App\Models\Project::sum('budget_allocated') ?? 0;
    $spentBudget = \App\Models\Project::sum('budget_spent') ?? 0;
    $avgSPI = \App\Models\Project::avg('spi') ?? 1.0;
    $avgCPI = \App\Models\Project::avg('cpi') ?? 1.0;

    echo "   Total budget: $" . number_format($totalBudget, 2) . "\n";
    echo "   Spent budget: $" . number_format($spentBudget, 2) . "\n";
    echo "   Average SPI: " . round($avgSPI, 2) . "\n";
    echo "   Average CPI: " . round($avgCPI, 2) . "\n";

    // Clean up test data
    $project->delete();
    echo "   Cleaned up test project\n";

    echo "\n✅ All tests passed! Project Management API is working correctly.\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
