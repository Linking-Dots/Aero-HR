<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\SubscriptionController;
use App\Http\Controllers\Tenant\SettingsController;
use App\Http\Controllers\Tenant\ApiKeyController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| These routes are available to all tenants and will be served from their
| subdomains. Each tenant has their own isolated instance of the application.
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    
    // Redirect root to dashboard
    Route::get('/', function () {
        return redirect('/dashboard');
    });

    // Dashboard routes
    Route::get('/tenant-dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
    
    // Subscription management routes
    Route::prefix('subscription')->name('subscription.')->group(function () {
        Route::get('/', [SubscriptionController::class, 'index'])->name('index');
        Route::post('/change-plan', [SubscriptionController::class, 'changePlan'])->name('change-plan');
        Route::post('/cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
        Route::post('/resume', [SubscriptionController::class, 'resume'])->name('resume');
        Route::post('/payment-method', [SubscriptionController::class, 'updatePaymentMethod'])->name('update-payment-method');
        Route::get('/invoice/{invoice}', [SubscriptionController::class, 'downloadInvoice'])->name('download-invoice');
    });
    
    // Settings routes
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::post('/update', [SettingsController::class, 'update'])->name('update');
    });
    
    // API Key management routes
    Route::prefix('api-keys')->name('api-keys.')->group(function () {
        Route::post('/generate', [ApiKeyController::class, 'generate'])->name('generate');
        Route::delete('/{apiKey}', [ApiKeyController::class, 'revoke'])->name('revoke');
        Route::put('/{apiKey}/permissions', [ApiKeyController::class, 'updatePermissions'])->name('update-permissions');
    });


    
    Route::get('/settings', [DashboardController::class, 'settings'])
        ->name('settings');
    
    Route::put('/settings', [DashboardController::class, 'updateSettings'])
        ->name('settings.update');

    // Include existing tenant routes if they exist
    Route::middleware(['auth:sanctum'])->group(function () {
        // Your existing application routes will be included here
        // This allows gradual migration to multi-tenancy
        
        // Example: Include existing routes with tenant context
        if (file_exists(base_path('routes/hr.php'))) {
            include base_path('routes/hr.php');
        }
        if (file_exists(base_path('routes/project-management.php'))) {
            include base_path('routes/project-management.php');
        }
        if (file_exists(base_path('routes/quality.php'))) {
            include base_path('routes/quality.php');
        }
        if (file_exists(base_path('routes/compliance.php'))) {
            include base_path('routes/compliance.php');
        }
        if (file_exists(base_path('routes/dms.php'))) {
            include base_path('routes/dms.php');
        }
        if (file_exists(base_path('routes/analytics.php'))) {
            include base_path('routes/analytics.php');
        }
    });

    // API routes for tenant
    Route::prefix('api')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/tenant-info', function () {
            $tenant = tenancy()->tenant;
            return response()->json([
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'domain' => $tenant->domain,
                    'status' => $tenant->status,
                    'plan' => $tenant->plan?->name,
                    'settings' => $tenant->settings,
                ]
            ]);
        });

        Route::get('/subscription-status', function () {
            $tenant = tenancy()->tenant;
            $subscription = $tenant->subscription;
            
            return response()->json([
                'subscription' => $subscription ? [
                    'status' => $subscription->status,
                    'plan' => $subscription->plan->name,
                    'current_period_end' => $subscription->current_period_end,
                    'trial_ends_at' => $subscription->trial_ends_at,
                ] : null
            ]);
        });
    });
});
