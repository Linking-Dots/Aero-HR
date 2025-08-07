<?php
require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;

// Initialize Laravel app
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

echo "=== CHECKING USER RELATIONSHIP DATA ===\n";

try {
    $user = \App\Models\User::first();
    
    echo "User: {$user->name}\n";
    echo "Department field value: {$user->department} (type: " . gettype($user->department) . ")\n";
    echo "Designation field value: {$user->designation} (type: " . gettype($user->designation) . ")\n";
    
    // Test relationship calls
    echo "\nTesting relationships:\n";
    
    $departmentRelation = $user->department();
    echo "Department relation type: " . get_class($departmentRelation) . "\n";
    
    $departmentModel = $user->department()->first();
    if ($departmentModel) {
        echo "Department model found: {$departmentModel->name}\n";
    } else {
        echo "❌ No department model found\n";
    }
    
    $designationRelation = $user->designation();
    echo "Designation relation type: " . get_class($designationRelation) . "\n";
    
    $designationModel = $user->designation()->first();
    if ($designationModel) {
        echo "Designation model found: {$designationModel->title}\n";
    } else {
        echo "❌ No designation model found\n";
    }
    
    // Test accessing the relationship directly as property
    echo "\nTesting relationship as property:\n";
    try {
        $userWithRelations = \App\Models\User::with(['department', 'designation'])->first();
        echo "Loading with eager loading...\n";
        $dept = $userWithRelations->department;
        if (is_object($dept)) {
            echo "✅ Department loaded: {$dept->name}\n";
        } else {
            echo "❌ Department is not an object: " . var_export($dept, true) . "\n";
        }
    } catch (\Exception $e) {
        echo "❌ Error with eager loading: " . $e->getMessage() . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
