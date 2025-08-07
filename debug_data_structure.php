<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DEBUGGING DEPARTMENT/DESIGNATION DISPLAY ===\n\n";

// Check User data structure
echo "1. Checking User data structure:\n";
$user = App\Models\User::with(['department', 'designation'])->first();
if ($user) {
    echo "User ID: {$user->id}\n";
    echo "User Name: {$user->name}\n";
    echo "Department Column Value: " . ($user->department ?? 'NULL') . "\n";
    echo "Designation Column Value: " . ($user->designation ?? 'NULL') . "\n";
    
    // Check relationship loading
    try {
        $deptRelation = $user->getRelation('department');
        if ($deptRelation) {
            echo "Department Relationship: {$deptRelation->name} (ID: {$deptRelation->id})\n";
        } else {
            echo "Department Relationship: NULL\n";
        }
    } catch (Exception $e) {
        echo "Department Relationship Error: " . $e->getMessage() . "\n";
    }
    
    try {
        $desigRelation = $user->getRelation('designation');
        if ($desigRelation) {
            echo "Designation Relationship: {$desigRelation->title} (ID: {$desigRelation->id})\n";
        } else {
            echo "Designation Relationship: NULL\n";
        }
    } catch (Exception $e) {
        echo "Designation Relationship Error: " . $e->getMessage() . "\n";
    }
}

echo "\n2. Testing UserController paginate method:\n";
try {
    $request = new Illuminate\Http\Request();
    $request->merge(['page' => 1, 'perPage' => 5]);
    
    $controller = new App\Http\Controllers\UserController();
    $response = $controller->paginateEmployees($request);
    $data = json_decode($response->content(), true);
    
    if (isset($data['employees']['data'][0])) {
        $firstEmployee = $data['employees']['data'][0];
        echo "First Employee Data Structure:\n";
        echo "- ID: " . ($firstEmployee['id'] ?? 'missing') . "\n";
        echo "- Name: " . ($firstEmployee['name'] ?? 'missing') . "\n";
        echo "- Department: " . json_encode($firstEmployee['department'] ?? 'missing') . "\n";
        echo "- Designation: " . json_encode($firstEmployee['designation'] ?? 'missing') . "\n";
        
        if (isset($firstEmployee['department'])) {
            echo "- Department Type: " . gettype($firstEmployee['department']) . "\n";
        }
        if (isset($firstEmployee['designation'])) {
            echo "- Designation Type: " . gettype($firstEmployee['designation']) . "\n";
        }
    }
} catch (Exception $e) {
    echo "Error testing UserController: " . $e->getMessage() . "\n";
}

echo "\n3. Testing EmployeeController paginate method:\n";
try {
    $request = new Illuminate\Http\Request();
    $request->merge(['page' => 1, 'perPage' => 5]);
    
    $controller = new App\Http\Controllers\EmployeeController();
    $response = $controller->paginate($request);
    $data = json_decode($response->content(), true);
    
    if (isset($data['employees']['data'][0])) {
        $firstEmployee = $data['employees']['data'][0];
        echo "First Employee Data Structure (EmployeeController):\n";
        echo "- ID: " . ($firstEmployee['id'] ?? 'missing') . "\n";
        echo "- Name: " . ($firstEmployee['name'] ?? 'missing') . "\n";
        echo "- Department ID: " . ($firstEmployee['department_id'] ?? 'missing') . "\n";
        echo "- Department Name: " . ($firstEmployee['department_name'] ?? 'missing') . "\n";
        echo "- Designation ID: " . ($firstEmployee['designation_id'] ?? 'missing') . "\n";
        echo "- Designation Name: " . ($firstEmployee['designation_name'] ?? 'missing') . "\n";
    }
} catch (Exception $e) {
    echo "Error testing EmployeeController: " . $e->getMessage() . "\n";
}

echo "\n4. Checking available departments and designations:\n";
echo "Departments:\n";
$departments = App\Models\HRM\Department::take(5)->get(['id', 'name']);
foreach ($departments as $dept) {
    echo "  ID: {$dept->id}, Name: {$dept->name}\n";
}

echo "\nDesignations:\n";
$designations = App\Models\HRM\Designation::take(5)->get(['id', 'title']);
foreach ($designations as $desig) {
    echo "  ID: {$desig->id}, Title: {$desig->title}\n";
}

echo "\n5. Checking route being used:\n";
try {
    // Check which route the frontend is actually calling
    echo "Available employee-related routes:\n";
    $routes = Route::getRoutes();
    foreach ($routes as $route) {
        $name = $route->getName();
        if ($name && (strpos($name, 'employee') !== false || strpos($name, 'user') !== false)) {
            echo "  - {$name}: {$route->uri()}\n";
        }
    }
} catch (Exception $e) {
    echo "Error checking routes: " . $e->getMessage() . "\n";
}
