<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Central Routes
|--------------------------------------------------------------------------
|
| These routes are loaded for the central domain (main application domain).
| They handle registration, marketing pages, billing, and other central
| functionality that's not tenant-specific.
|
| For development (127.0.0.1:8000): All central routes work normally
| For production: Routes work on the main domain (aero-hr.com)
|
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Central\TenantRegistrationController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\BillingController;

// Landing and marketing pages
Route::get('/', [LandingController::class, 'index'])->name('landing.home');
Route::get('/pricing', [LandingController::class, 'pricing'])->name('landing.pricing');
Route::get('/features', [LandingController::class, 'features'])->name('landing.features');
Route::get('/about', [LandingController::class, 'about'])->name('landing.about');
Route::get('/contact', [LandingController::class, 'contact'])->name('landing.contact');

// Guest routes (registration)
Route::middleware('guest')->group(function () {
    // Authentication Routes for Central/Superadmin
    Route::get('login', [\App\Http\Controllers\Auth\LoginController::class, 'create'])->name('central.login');
    Route::post('login', [\App\Http\Controllers\Auth\LoginController::class, 'store'])->name('central.login.store');
    Route::get('forgot-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'create'])->name('central.password.request');
    Route::post('forgot-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'store'])->name('central.password.email');
    Route::get('reset-password/{token}', [\App\Http\Controllers\Auth\PasswordResetController::class, 'edit'])->name('central.password.reset');
    Route::post('reset-password', [\App\Http\Controllers\Auth\PasswordResetController::class, 'update'])->name('central.password.update');

    // Multi-Tenant Registration Routes
    Route::get('register', [TenantRegistrationController::class, 'showRegistrationForm'])->name('register');
    Route::post('register', [TenantRegistrationController::class, 'register'])
        ->name('register.store')
        ->middleware('throttle:5,1'); // Allow 5 registration attempts per minute per IP
    
    // Domain availability checking
    Route::post('/check-domain', [TenantRegistrationController::class, 'checkDomain'])
        ->name('check-domain')
        ->middleware('throttle:30,1'); // Allow 30 domain checks per minute per IP

    // User type checking for smart login - moved to web routes
    Route::post('/check-user-type', function (Illuminate\Http\Request $request) {
        $request->validate(['email' => 'required|email']);
        
        $email = $request->email;
        
        // Check central users first
        $centralUser = \App\Models\User::where('email', $email)->first();
        if ($centralUser) {
            return response()->json([
                'type' => 'central',
                'user' => ['name' => $centralUser->name, 'email' => $centralUser->email],
                'tenant' => null
            ]);
        }
        
        // Check tenant users
        $tenantUser = \App\Models\TenantUser::where('email', $email)->with('tenant')->first();
        if ($tenantUser && $tenantUser->tenant) {
            return response()->json([
                'type' => 'tenant',
                'user' => ['name' => $tenantUser->name, 'email' => $tenantUser->email],
                'tenant' => [
                    'name' => $tenantUser->tenant->name,
                    'domain' => $tenantUser->tenant->domain
                ]
            ]);
        }
        
        return response()->json([
            'type' => 'unknown',
            'user' => null,
            'tenant' => null
        ]);
    })->name('check-user-type')->middleware('throttle:60,1');
    
    // Plan and payment related routes - moved to web routes
    Route::get('/plans/{plan}', [TenantRegistrationController::class, 'getPlan'])->name('plan');
    Route::post('/create-payment-intent', [TenantRegistrationController::class, 'createPaymentIntent'])
        ->name('create-payment-intent');
});

// Success pages
Route::get('/registration-success', function () {
    return inertia('Auth/RegistrationSuccess');
})->name('registration.success');

// Development: Add a simple route to list tenants for testing
if (app()->environment('local')) {
    Route::get('/dev/tenants', function () {
        $tenants = \App\Models\Tenant::all();
        return response()->json($tenants->map(function ($tenant) {
            return [
                'domain' => $tenant->domain,
                'name' => $tenant->name,
                'url' => url("/tenant/{$tenant->domain}/login"),
                'created_at' => $tenant->created_at
            ];
        }));
    })->name('dev.tenants');
}

// Billing and subscription management (for existing tenants)
Route::middleware(['auth', 'verified'])->group(function () {
    // Logout route
    Route::post('logout', [\App\Http\Controllers\Auth\LoginController::class, 'destroy'])->name('logout');
    
    // Central Admin Dashboard (Superadmin)
    Route::get('/admin', function () {
        return inertia('Admin/Dashboard', [
            'tenants' => \App\Models\Tenant::with('plan')->orderBy('created_at', 'desc')->paginate(10),
            'stats' => [
                'total_tenants' => \App\Models\Tenant::count(),
                'active_tenants' => \App\Models\Tenant::where('status', 'active')->count(),
                'trial_tenants' => \App\Models\Tenant::where('trial_ends_at', '>', now())->count(),
                'revenue_this_month' => 0, // Implement based on your billing system
            ]
        ]);
    })->name('admin.dashboard');
    
    // Tenant Management Routes
    Route::prefix('admin/tenants')->name('admin.tenants.')->group(function () {
        Route::get('/', function () {
            return inertia('Admin/Tenants/Index', [
                'tenants' => \App\Models\Tenant::with('plan')->orderBy('created_at', 'desc')->paginate(20)
            ]);
        })->name('index');
        
        Route::get('/{tenant}', function (\App\Models\Tenant $tenant) {
            return inertia('Admin/Tenants/Show', [
                'tenant' => $tenant->load('plan', 'tenantUsers'),
                'stats' => [
                    'users_count' => $tenant->tenantUsers()->count(),
                    'last_login' => $tenant->tenantUsers()->latest('updated_at')->first()?->updated_at,
                ]
            ]);
        })->name('show');
    });

    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('index');
        Route::get('/plans', [BillingController::class, 'plans'])->name('plans');
        Route::post('/subscribe', [BillingController::class, 'subscribe'])->name('subscribe');
        Route::post('/cancel', [BillingController::class, 'cancel'])->name('cancel');
        Route::get('/invoices', [BillingController::class, 'invoices'])->name('invoices');
        Route::get('/payment-methods', [BillingController::class, 'paymentMethods'])->name('payment-methods');
        Route::post('/payment-methods', [BillingController::class, 'addPaymentMethod'])->name('add-payment-method');
        Route::delete('/payment-methods/{method}', [BillingController::class, 'removePaymentMethod'])->name('remove-payment-method');
    });
});

// Webhook routes (no auth required)
Route::post('/stripe/webhook', [BillingController::class, 'webhook'])->name('stripe.webhook');

// Static/legal pages
Route::get('/terms', function () {
    return inertia('Legal/Terms');
})->name('terms');

Route::get('/privacy', function () {
    return inertia('Legal/Privacy');
})->name('privacy');

Route::get('/cookies', function () {
    return inertia('Legal/Cookies');
})->name('cookies');
