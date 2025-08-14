<?php

use App\Http\Controllers\Central\TenantRegistrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Central Routes
|--------------------------------------------------------------------------
|
| These routes are served from the central application domain and are
| used for tenant registration, billing management, and admin functions.
|
*/

// Public routes
Route::get('/', function () {
    return redirect('/register');
});

Route::get('/register', [TenantRegistrationController::class, 'showRegistrationForm'])
    ->name('register');

Route::post('/register', [TenantRegistrationController::class, 'register'])
    ->name('register.store');

// API routes for registration process
Route::prefix('api')->group(function () {
    Route::post('/check-domain', [TenantRegistrationController::class, 'checkDomain'])
        ->name('api.check-domain');
    
    Route::get('/plans/{plan}', [TenantRegistrationController::class, 'getPlan'])
        ->name('api.plan');
    
    Route::post('/create-payment-intent', [TenantRegistrationController::class, 'createPaymentIntent'])
        ->name('api.create-payment-intent');
});

// Success pages
Route::get('/registration-success', function () {
    return inertia('Auth/RegistrationSuccess');
})->name('registration.success');

// Static pages
Route::get('/pricing', function () {
    $plans = \App\Models\Plan::where('is_active', true)->orderBy('price')->get();
    return inertia('Pages/Pricing', ['plans' => $plans]);
})->name('pricing');

Route::get('/about', function () {
    return inertia('Pages/About');
})->name('about');

Route::get('/contact', function () {
    return inertia('Pages/Contact');
})->name('contact');

Route::get('/terms', function () {
    return inertia('Pages/Terms');
})->name('terms');

Route::get('/privacy', function () {
    return inertia('Pages/Privacy');
})->name('privacy');
