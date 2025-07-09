<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Jobs in Database ===\n";

$jobs = \App\Models\Job::with(['department', 'hiringManager'])->withCount('applications')->get();

echo "Jobs found: " . $jobs->count() . "\n\n";

foreach($jobs as $job) {
    echo "ID: " . $job->id . "\n";
    echo "Title: " . $job->title . "\n";
    echo "Status: " . $job->status . "\n";
    echo "Type: " . $job->type . "\n";
    echo "Department: " . ($job->department ? $job->department->name : 'None') . "\n";
    echo "Applications: " . $job->applications_count . "\n";
    echo "Created: " . $job->created_at . "\n";
    echo "---\n";
}

echo "\n=== Testing Controller Logic ===\n";

// Simulate the controller query
$controllerJobs = \App\Models\Job::with(['department', 'hiringManager'])
    ->withCount('applications')
    ->orderBy('posting_date', 'desc')
    ->paginate(10);

echo "Controller paginated jobs: " . $controllerJobs->count() . "\n";
echo "Total: " . $controllerJobs->total() . "\n";
echo "Per page: " . $controllerJobs->perPage() . "\n";
echo "Current page: " . $controllerJobs->currentPage() . "\n";

?>
