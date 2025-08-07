<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== TESTING EMPLOYEE CONTROLLER ENDPOINTS ===\n\n";

// Test the EmployeeController directly
echo "1. Testing EmployeeController paginate method directly:\n";
try {
    $request = new Illuminate\Http\Request();
    $request->merge([
        'page' => 1,
        'perPage' => 3,
        'search' => '',
        'department' => 'all',
        'designation' => 'all',
        'attendanceType' => 'all'
    ]);
    
    $controller = new App\Http\Controllers\EmployeeController();
    $response = $controller->paginate($request);
    
    echo "Response Status: " . $response->status() . "\n";
    
    $data = json_decode($response->content(), true);
    
    if (isset($data['employees']['data']) && !empty($data['employees']['data'])) {
        $firstEmployee = $data['employees']['data'][0];
        echo "✅ EmployeeController working!\n";
        echo "First Employee Structure:\n";
        echo "  - ID: " . ($firstEmployee['id'] ?? 'missing') . "\n";
        echo "  - Name: " . ($firstEmployee['name'] ?? 'missing') . "\n";
        echo "  - Department ID: " . ($firstEmployee['department_id'] ?? 'missing') . "\n";
        echo "  - Department Name: " . ($firstEmployee['department_name'] ?? 'missing') . "\n";
        echo "  - Designation ID: " . ($firstEmployee['designation_id'] ?? 'missing') . "\n";
        echo "  - Designation Name: " . ($firstEmployee['designation_name'] ?? 'missing') . "\n";
        echo "  - Attendance Type ID: " . ($firstEmployee['attendance_type_id'] ?? 'missing') . "\n";
        echo "  - Attendance Type Name: " . ($firstEmployee['attendance_type_name'] ?? 'missing') . "\n";
    } else {
        echo "❌ No employee data returned\n";
        echo "Response data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n2. Testing route resolution:\n";
try {
    // Test if the route resolves correctly
    $route = Route::getRoutes()->getByName('employees.paginate');
    if ($route) {
        echo "✅ Route 'employees.paginate' found\n";
        echo "  - URI: " . $route->uri() . "\n";
        echo "  - Action: " . $route->getActionName() . "\n";
        echo "  - Methods: " . implode(', ', $route->methods()) . "\n";
    } else {
        echo "❌ Route 'employees.paginate' not found\n";
    }
} catch (Exception $e) {
    echo "Error checking route: " . $e->getMessage() . "\n";
}

echo "\n3. Checking if departments/designations have proper relationships:\n";

// Test department->users relationship
$dept = App\Models\HRM\Department::find(11); // Quality Control
if ($dept) {
    $userCount = $dept->users()->count();
    echo "Department 'Quality Control' has {$userCount} users\n";
    
    if ($userCount > 0) {
        $users = $dept->users()->take(3)->get(['id', 'name']);
        foreach ($users as $user) {
            echo "  - User: {$user->name} (ID: {$user->id})\n";
        }
    }
} else {
    echo "❌ Department 11 not found\n";
}

// Test designation->users relationship  
$designation = App\Models\HRM\Designation::find(19); // Quality Control Manager
if ($designation) {
    $userCount = $designation->users()->count();
    echo "Designation 'Quality Control Manager' has {$userCount} users\n";
    
    if ($userCount > 0) {
        $users = $designation->users()->take(3)->get(['id', 'name']);
        foreach ($users as $user) {
            echo "  - User: {$user->name} (ID: {$user->id})\n";
        }
    }
} else {
    echo "❌ Designation 19 not found\n";
}
