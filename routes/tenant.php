<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Tenant Routes
|----------------------------------            // Attendance Management  
            Route::resource('attendance', AttendanceController::class)->only(['index', 'store', 'update'])->names([
                'index' => 'tenant.attendance.index',
                'store' => 'tenant.attendance.store',
                'update' => 'tenant.attendance.update'
            ]);--------------------------------------
|
| These routes handle tenant-specific functionality.
| For development (127.0.0.1:8000): Uses path-based routing /tenant/{domain}/
| For production: Uses subdomain routing {domain}.app.com/
|
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\Settings\CompanySettingController;
use App\Http\Controllers\Settings\LeaveSettingController;
use App\Http\Controllers\Settings\AttendanceSettingController;
use App\Http\Controllers\Tenant\AutoLoginController;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Middleware\InitializeTenancyByDomainPath;

// Check if we're in development mode (127.0.0.1:8000)
$isDevelopment = app()->environment('local') && 
    (request()->getHost() === '127.0.0.1' || request()->getHost() === 'localhost');

// Define the tenant routes
$tenantRoutes = function () {
    /*
    |--------------------------------------------------------------------------
    | Guest Routes (Authentication)
    |--------------------------------------------------------------------------
    */
    Route::middleware('guest')->group(function () {
        // Auto-login from registration flow (before regular login routes)
        Route::get('/auto-login', [AutoLoginController::class, 'autoLogin'])->name('auto-login');
        Route::post('/auto-login/validate', [AutoLoginController::class, 'validateToken'])->name('auto-login.validate');
        
        // Login routes
        Route::get('/login', [LoginController::class, 'create'])->name('tenant.login');
        Route::post('/login', [LoginController::class, 'store'])->name('tenant.login.store');
        
        // Password reset routes
        Route::get('/forgot-password', [PasswordResetController::class, 'create'])
            ->name('tenant.password.request');
        Route::post('/forgot-password', [PasswordResetController::class, 'store'])
            ->name('tenant.password.email');
        Route::get('/reset-password/{token}', [PasswordResetController::class, 'edit'])
            ->name('tenant.password.reset');
        Route::post('/reset-password', [PasswordResetController::class, 'update'])
            ->name('tenant.password.update');
    });

    /*
    |--------------------------------------------------------------------------
    | Authenticated Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('auth')->group(function () {
        
        // Logout
        Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
        
        // Email verification routes
        Route::get('/email/verify', [EmailVerificationController::class, 'prompt'])
            ->name('verification.notice');
        Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');
        Route::post('/email/verification-notification', [EmailVerificationController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('verification.send');

        // Root redirect to dashboard
        Route::get('/', function () {
            return redirect()->route('dashboard');
        });

        /*
        |--------------------------------------------------------------------------
        | Verified User Routes
        |--------------------------------------------------------------------------
        */
        Route::middleware('verified')->group(function () {
            
            // Dashboard
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
            
            // Profile Management
            Route::prefix('profile')->name('tenant.profile.')->group(function () {
                Route::get('/', [ProfileController::class, 'edit'])->name('edit');
                Route::patch('/', [ProfileController::class, 'update'])->name('update');
                Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
                Route::post('/photo', [ProfileController::class, 'updatePhoto'])->name('photo.update');
                Route::delete('/photo', [ProfileController::class, 'deletePhoto'])->name('photo.delete');
            });

            /*
            |--------------------------------------------------------------------------
            | HR Management Routes
            |--------------------------------------------------------------------------
            */
            
            // Employee Management
            Route::resource('employees', UserController::class)->names([
                'index' => 'employees.index',
                'create' => 'employees.create',
                'store' => 'employees.store',
                'show' => 'employees.show',
                'edit' => 'employees.edit',
                'update' => 'employees.update',
                'destroy' => 'employees.destroy',
            ]);
            
            // Department Management
            Route::resource('departments', DepartmentController::class)->names([
                'index' => 'tenant.departments.index',
                'create' => 'tenant.departments.create', 
                'store' => 'tenant.departments.store',
                'show' => 'tenant.departments.show',
                'edit' => 'tenant.departments.edit',
                'update' => 'tenant.departments.update',
                'destroy' => 'tenant.departments.destroy'
            ]);
            
            // Designation Management
            Route::resource('designations', DesignationController::class)->names([
                'index' => 'tenant.designations.index',
                'create' => 'tenant.designations.create', 
                'store' => 'tenant.designations.store',
                'show' => 'tenant.designations.show',
                'edit' => 'tenant.designations.edit',
                'update' => 'tenant.designations.update',
                'destroy' => 'tenant.designations.destroy'
            ]);
            
            // Leave Management
            Route::resource('leaves', LeaveController::class)->names([
                'index' => 'tenant.leaves.index',
                'create' => 'tenant.leaves.create', 
                'store' => 'tenant.leaves.store',
                'show' => 'tenant.leaves.show',
                'edit' => 'tenant.leaves.edit',
                'update' => 'tenant.leaves.update',
                'destroy' => 'tenant.leaves.destroy'
            ]);
            Route::prefix('leaves')->name('leaves.')->group(function () {
                Route::post('/{leave}/approve', [LeaveController::class, 'approve'])->name('approve');
                Route::post('/{leave}/reject', [LeaveController::class, 'reject'])->name('reject');
                Route::get('/calendar', [LeaveController::class, 'calendar'])->name('calendar');
                Route::get('/balance', [LeaveController::class, 'balance'])->name('balance');
            });
            
            // Attendance Management
            Route::resource('attendance', AttendanceController::class)->only(['index', 'store', 'update']);
            Route::prefix('attendance')->name('attendance.')->group(function () {
                Route::post('/check-in', [AttendanceController::class, 'checkIn'])->name('check-in');
                Route::post('/check-out', [AttendanceController::class, 'checkOut'])->name('check-out');
                Route::get('/report', [AttendanceController::class, 'report'])->name('report');
                Route::get('/summary', [AttendanceController::class, 'summary'])->name('summary');
            });
            
            // Holiday Management
            Route::resource('holidays', HolidayController::class)->names([
                'index' => 'tenant.holidays.index',
                'create' => 'tenant.holidays.create', 
                'store' => 'tenant.holidays.store',
                'show' => 'tenant.holidays.show',
                'edit' => 'tenant.holidays.edit',
                'update' => 'tenant.holidays.update',
                'destroy' => 'tenant.holidays.destroy'
            ]);
            
            // Task Management
            Route::resource('tasks', TaskController::class)->names([
                'index' => 'tenant.tasks.index',
                'create' => 'tenant.tasks.create', 
                'store' => 'tenant.tasks.store',
                'show' => 'tenant.tasks.show',
                'edit' => 'tenant.tasks.edit',
                'update' => 'tenant.tasks.update',
                'destroy' => 'tenant.tasks.destroy'
            ]);
            Route::prefix('tasks')->name('tasks.')->group(function () {
                Route::post('/{task}/complete', [TaskController::class, 'complete'])->name('complete');
                Route::post('/{task}/assign', [TaskController::class, 'assign'])->name('assign');
            });
            
            // Reports
            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', [ReportController::class, 'index'])->name('index');
                Route::get('/attendance', [ReportController::class, 'attendance'])->name('attendance');
                Route::get('/leaves', [ReportController::class, 'leaves'])->name('leaves');
                Route::get('/employees', [ReportController::class, 'employees'])->name('employees');
                Route::get('/payroll', [ReportController::class, 'payroll'])->name('payroll');
                Route::post('/generate', [ReportController::class, 'generate'])->name('generate');
                Route::get('/export/{type}', [ReportController::class, 'export'])->name('export');
            });

            /*
            |--------------------------------------------------------------------------
            | Administration Routes (Role-based access)
            |--------------------------------------------------------------------------
            */
            Route::middleware(['role:owner|admin'])->group(function () {
                
                // Role and Permission Management
                Route::resource('roles', RoleController::class)->names([
                    'index' => 'tenant.roles.index',
                    'create' => 'tenant.roles.create', 
                    'store' => 'tenant.roles.store',
                    'show' => 'tenant.roles.show',
                    'edit' => 'tenant.roles.edit',
                    'update' => 'tenant.roles.update',
                    'destroy' => 'tenant.roles.destroy'
                ]);
                Route::prefix('roles')->name('roles.')->group(function () {
                    Route::post('/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('permissions');
                    Route::get('/permissions', [RoleController::class, 'permissions'])->name('permissions.index');
                });
                
                // Settings
                Route::prefix('settings')->name('settings.')->group(function () {
                    // Company Settings
                    Route::get('/company', [CompanySettingController::class, 'index'])->name('company.index');
                    Route::post('/company', [CompanySettingController::class, 'update'])->name('company.update');
                    Route::post('/company/logo', [CompanySettingController::class, 'updateLogo'])->name('company.logo');
                    
                    // Leave Settings
                    Route::get('/leaves', [LeaveSettingController::class, 'index'])->name('leaves.index');
                    Route::post('/leaves', [LeaveSettingController::class, 'update'])->name('leaves.update');
                    
                    // Attendance Settings
                    Route::get('/attendance', [AttendanceSettingController::class, 'index'])->name('attendance.index');
                    Route::post('/attendance', [AttendanceSettingController::class, 'update'])->name('attendance.update');
                });
                
                // Employee invitation and management
                Route::prefix('employees')->name('employees.')->group(function () {
                    Route::post('/invite', [UserController::class, 'invite'])->name('invite');
                    Route::post('/{user}/activate', [UserController::class, 'activate'])->name('activate');
                    Route::post('/{user}/deactivate', [UserController::class, 'deactivate'])->name('deactivate');
                    Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
                });
            });

            /*
            |--------------------------------------------------------------------------
            | API Routes for AJAX requests
            |--------------------------------------------------------------------------
            */
            Route::prefix('api')->name('api.')->group(function () {
                // Dashboard data
                Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');
                Route::get('/dashboard/recent-activities', [DashboardController::class, 'recentActivities'])->name('dashboard.activities');
                
                // User search and lookup
                Route::get('/users/search', [UserController::class, 'search'])->name('users.search');
                Route::get('/users/{user}/details', [UserController::class, 'details'])->name('users.details');
                
                // Department and designation data
                Route::get('/departments', [DepartmentController::class, 'apiIndex'])->name('departments.api');
                Route::get('/designations', [DesignationController::class, 'apiIndex'])->name('designations.api');
                
                // Attendance quick actions
                Route::get('/attendance/status', [AttendanceController::class, 'status'])->name('attendance.status');
                Route::get('/attendance/today', [AttendanceController::class, 'today'])->name('attendance.today');
                
                // Leave balance and history
                Route::get('/leaves/balance/{user?}', [LeaveController::class, 'apiBalance'])->name('leaves.balance');
                Route::get('/leaves/history/{user?}', [LeaveController::class, 'apiHistory'])->name('leaves.history');
                
                // Task updates
                Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
                
                // Report data
                Route::post('/reports/data', [ReportController::class, 'getData'])->name('reports.data');
            });
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Public tenant routes (no auth required)
    |--------------------------------------------------------------------------
    */
    
    // Employee invitation acceptance
    Route::get('/accept-invitation/{token}', [UserController::class, 'acceptInvitation'])
        ->name('invitation.accept');
    Route::post('/accept-invitation/{token}', [UserController::class, 'processInvitation'])
        ->name('invitation.process');
    
    // Public company page (if enabled)
    Route::get('/company', function () {
        $tenant = tenant();
        return inertia('Public/Company', [
            'tenant' => $tenant,
            'settings' => $tenant->settings ?? []
        ]);
    })->name('company.public');
};

/*
|--------------------------------------------------------------------------
| Apply Routes Based on Environment
|--------------------------------------------------------------------------
*/

if ($isDevelopment) {
    // Development: Use domain-based path routing (127.0.0.1:8000/tenant/company/...)
    Route::prefix('{tenant}')->middleware([
        'web',
        InitializeTenancyByDomainPath::class,
    ])->group($tenantRoutes);
} else {
    // Production: Use subdomain routing (company.domain.com/...)
    Route::middleware([
        'web',
        InitializeTenancyByDomain::class,
        PreventAccessFromCentralDomains::class,
    ])->group($tenantRoutes);
}
