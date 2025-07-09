<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Job Model Test ===\n";

try {
    $job = new \App\Models\Job();
    echo "✓ Job model loaded successfully!\n";
    echo "✓ Table name: " . $job->getTable() . "\n";
    echo "✓ Fillable fields: " . implode(', ', $job->getFillable()) . "\n";
    
    // Test database connection
    $count = \App\Models\Job::count();
    echo "✓ Jobs in database: " . $count . "\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== JobApplication Model Test ===\n";

try {
    $app = new \App\Models\JobApplication();
    echo "✓ JobApplication model loaded successfully!\n";
    echo "✓ Table name: " . $app->getTable() . "\n";
    echo "✓ Fillable fields: " . implode(', ', $app->getFillable()) . "\n";
    
    // Test database connection
    $count = \App\Models\JobApplication::count();
    echo "✓ Job applications in database: " . $count . "\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Field Mapping Test ===\n";

// Test the key field mappings
$testFields = [
    'type' => 'Job type field',
    'posting_date' => 'Posting date field', 
    'positions' => 'Positions field',
    'is_remote_allowed' => 'Remote allowed field',
    'status' => 'Status field'
];

foreach ($testFields as $field => $description) {
    if (in_array($field, $job->getFillable())) {
        echo "✓ $description ($field) is correctly mapped\n";
    } else {
        echo "✗ $description ($field) is missing from fillable\n";
    }
}

echo "\nTest completed!\n";
