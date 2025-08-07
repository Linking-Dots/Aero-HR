<?php
require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Initialize Laravel app
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

// Test the EmployeeController paginate method step by step
echo "=== DETAILED EMPLOYEE CONTROLLER DEBUGGING ===\n";

try {
    // First, let's test if we can even access the User model
    echo "1. Testing User model access:\n";
    $userCount = \App\Models\User::count();
    echo "✅ Total users in database: $userCount\n";

    // Test with relationships
    echo "\n2. Testing User model with relationships:\n";
    $userWithRelations = \App\Models\User::with(['department', 'designation', 'attendanceType'])->first();
    if ($userWithRelations) {
        echo "✅ Successfully loaded user with relationships\n";
        echo "  - User: {$userWithRelations->name}\n";
        echo "  - Department: " . ($userWithRelations->department ? $userWithRelations->department->name : 'NULL') . "\n";
        echo "  - Designation: " . ($userWithRelations->designation ? $userWithRelations->designation->title : 'NULL') . "\n";
        echo "  - Attendance Type: " . ($userWithRelations->attendanceType ? $userWithRelations->attendanceType->name : 'NULL') . "\n";
    } else {
        echo "❌ No users found\n";
    }

    // Test pagination directly
    echo "\n3. Testing User pagination:\n";
    $paginated = \App\Models\User::with(['department', 'designation', 'attendanceType'])->paginate(10);
    echo "✅ Paginated users count: " . $paginated->count() . "\n";
    echo "✅ Total users: " . $paginated->total() . "\n";

    // Test the controller instantiation
    echo "\n4. Testing EmployeeController instantiation:\n";
    $controller = new \App\Http\Controllers\EmployeeController();
    echo "✅ EmployeeController instantiated successfully\n";

    // Create a mock request
    echo "\n5. Testing paginate method with mock request:\n";
    $request = Request::create('/employees/paginate', 'GET', [
        'perPage' => 5,
        'page' => 1
    ]);
    
    $response = $controller->paginate($request);
    echo "✅ Controller method called\n";
    echo "Response status: " . $response->getStatusCode() . "\n";
    
    $responseData = json_decode($response->getContent(), true);
    if (isset($responseData['employees'])) {
        echo "✅ Employees data found\n";
        echo "Number of employees: " . count($responseData['employees']['data']) . "\n";
        
        if (count($responseData['employees']['data']) > 0) {
            $firstEmployee = $responseData['employees']['data'][0];
            echo "First employee sample data:\n";
            echo "  - Name: " . ($firstEmployee['name'] ?? 'NULL') . "\n";
            echo "  - Department ID: " . ($firstEmployee['department_id'] ?? 'NULL') . "\n";
            echo "  - Department Name: " . ($firstEmployee['department_name'] ?? 'NULL') . "\n";
            echo "  - Designation ID: " . ($firstEmployee['designation_id'] ?? 'NULL') . "\n";
            echo "  - Designation Name: " . ($firstEmployee['designation_name'] ?? 'NULL') . "\n";
        }
    } else {
        echo "❌ No employees data in response\n";
        echo "Response content: " . $response->getContent() . "\n";
    }

} catch (\Exception $e) {
    echo "❌ Error occurred: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
