<?php
require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Initialize Laravel app
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

echo "=== TESTING CORRECTED EMPLOYEE CONTROLLER ===\n";

try {
    // Test the controller
    $controller = new \App\Http\Controllers\EmployeeController();
    
    // Create a mock request
    $request = Request::create('/employees/paginate', 'GET', [
        'perPage' => 5,
        'page' => 1
    ]);
    
    echo "Calling EmployeeController paginate method...\n";
    $response = $controller->paginate($request);
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    
    if ($response->getStatusCode() === 200) {
        $responseData = json_decode($response->getContent(), true);
        
        if (isset($responseData['employees'])) {
            echo "✅ SUCCESS! Employees data retrieved\n";
            echo "Number of employees: " . count($responseData['employees']['data']) . "\n";
            echo "Total employees: " . $responseData['employees']['total'] . "\n";
            
            if (count($responseData['employees']['data']) > 0) {
                $firstEmployee = $responseData['employees']['data'][0];
                echo "\nFirst employee data structure:\n";
                echo "  - ID: " . ($firstEmployee['id'] ?? 'NULL') . "\n";
                echo "  - Name: " . ($firstEmployee['name'] ?? 'NULL') . "\n";
                echo "  - Email: " . ($firstEmployee['email'] ?? 'NULL') . "\n";
                echo "  - Department ID: " . ($firstEmployee['department_id'] ?? 'NULL') . "\n";
                echo "  - Department Name: " . ($firstEmployee['department_name'] ?? 'NULL') . "\n";
                echo "  - Designation ID: " . ($firstEmployee['designation_id'] ?? 'NULL') . "\n";
                echo "  - Designation Name: " . ($firstEmployee['designation_name'] ?? 'NULL') . "\n";
                echo "  - Attendance Type ID: " . ($firstEmployee['attendance_type_id'] ?? 'NULL') . "\n";
                echo "  - Attendance Type Name: " . ($firstEmployee['attendance_type_name'] ?? 'NULL') . "\n";
                
                // Check if we have proper names now
                if (!empty($firstEmployee['department_name']) && !empty($firstEmployee['designation_name'])) {
                    echo "\n🎉 SUCCESS! Department and designation names are now properly resolved!\n";
                } else {
                    echo "\n⚠️  WARNING: Some names are still missing\n";
                }
            }
            
            // Check if stats are included
            if (isset($responseData['stats'])) {
                echo "\n✅ Stats data included\n";
                echo "Total employees: " . $responseData['stats']['overview']['total_employees'] . "\n";
                echo "Active employees: " . $responseData['stats']['overview']['active_employees'] . "\n";
            }
        } else {
            echo "❌ No employees data in response\n";
        }
    } else {
        echo "❌ Error response\n";
        echo "Response content: " . $response->getContent() . "\n";
    }

} catch (\Exception $e) {
    echo "❌ Error occurred: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
