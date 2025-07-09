<?php

require_once 'vendor/autoload.php';

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Job;

echo "Testing Jobs in Database:\n";
echo "========================\n\n";

$jobs = Job::with(['department', 'hiringManager'])->get();

echo "Total jobs found: " . $jobs->count() . "\n\n";

foreach ($jobs as $job) {
    echo "Job ID: {$job->id}\n";
    echo "Title: {$job->title}\n";
    echo "Status: {$job->status}\n";
    echo "Type: {$job->type}\n";
    echo "Department: " . ($job->department ? $job->department->name : 'N/A') . "\n";
    echo "Posted: {$job->posting_date}\n";
    echo "---\n";
}

// Test the controller method
echo "\nTesting Controller Index Method:\n";
echo "===============================\n";

use App\Http\Controllers\HR\RecruitmentController;
use Illuminate\Http\Request;

$controller = new RecruitmentController();
$request = new Request();

// Test with JSON request
$request->headers->set('Accept', 'application/json');
$request->headers->set('X-Requested-With', 'XMLHttpRequest');

try {
    $response = $controller->index($request);
    echo "Controller response type: " . get_class($response) . "\n";
    
    if (method_exists($response, 'getData')) {
        $data = $response->getData(true);
        echo "Jobs returned: " . count($data['jobs']['data'] ?? []) . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
