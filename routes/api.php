<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\SystemMonitoringController;
use App\Http\Controllers\NotificationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Error logging endpoint
Route::post('/log-error', function (Request $request) {
    try {
        $validated = $request->validate([
            'error_id' => 'required|string',
            'message' => 'required|string',
            'stack' => 'nullable|string',
            'component_stack' => 'nullable|string',
            'url' => 'required|string',
            'user_agent' => 'nullable|string',
            'timestamp' => 'required|string'
        ]);

        DB::table('error_logs')->insert([
            'error_id' => $validated['error_id'],
            'message' => $validated['message'],
            'stack_trace' => $validated['stack'] ?? null,
            'component_stack' => $validated['component_stack'] ?? null,
            'url' => $validated['url'],
            'user_agent' => $validated['user_agent'] ?? null,
            'user_id' => auth()->id(),
            'ip_address' => $request->ip(),
            'metadata' => json_encode([
                'timestamp' => $validated['timestamp'],
                'session_id' => session()->getId()
            ]),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        Log::error('Failed to log frontend error: ' . $e->getMessage());
        return response()->json(['success' => false], 500);
    }
})->middleware(['web']);

// Performance logging endpoint

// Notification token endpoint
Route::post('/notification-token', [NotificationController::class, 'storeToken'])->middleware(['auth:sanctum']);
Route::post('/log-performance', function (Request $request) {
    try {
        $validated = $request->validate([
            'metric_type' => 'required|string|in:page_load,api_response,query_execution,render_time',
            'identifier' => 'required|string',
            'execution_time_ms' => 'required|numeric',
            'metadata' => 'nullable|array'
        ]);

        DB::table('performance_metrics')->insert([
            'metric_type' => $validated['metric_type'],
            'identifier' => $validated['identifier'],
            'execution_time_ms' => $validated['execution_time_ms'],
            'metadata' => json_encode($validated['metadata'] ?? []),
            'user_id' => auth()->id(),
            'ip_address' => $request->ip(),
            'created_at' => now()
        ]);

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        Log::error('Failed to log performance metric: ' . $e->getMessage());
        return response()->json(['success' => false], 500);
    }
})->middleware(['web']);

// Domain availability check for registration
Route::post('/check-domain', function (Request $request) {
    try {
        $request->validate([
            'domain' => 'required|string|min:3|max:50|regex:/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/'
        ]);

        $domain = strtolower(trim($request->domain));
        
        // Check if domain already exists
        $exists = DB::table('tenants')->where('id', $domain)->exists();
        
        return response()->json([
            'available' => !$exists,
            'domain' => $domain
        ]);
    } catch (\Exception $e) {
        Log::error('Domain check failed: ' . $e->getMessage());
        return response()->json([
            'available' => false,
            'error' => 'Domain check failed'
        ], 500);
    }
})->middleware(['web']);

// System monitoring API routes
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/system-monitoring/metrics', [SystemMonitoringController::class, 'getMetrics'])->name('api.system-monitoring.metrics');
    Route::get('/system-monitoring/overview', [SystemMonitoringController::class, 'getSystemOverview'])->name('api.system-monitoring.overview');
});
