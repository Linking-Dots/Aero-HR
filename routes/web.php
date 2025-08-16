<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\BulkLeaveController;
use App\Http\Controllers\DailyWorkController;
use App\Http\Controllers\DailyWorkSummaryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\FMSController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\IMSController;
use App\Http\Controllers\JurisdictionController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\PicnicController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\Settings\AttendanceSettingController;
use App\Http\Controllers\Settings\CompanySettingController;
use App\Http\Controllers\Settings\LeaveSettingController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\SystemMonitoringController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Import all controllers for consolidated routes
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Analytics\ReportController as AnalyticsReportController;
use App\Http\Controllers\Analytics\DashboardController as AnalyticsDashboardController;
use App\Http\Controllers\Analytics\KPIController;
use App\Http\Controllers\Compliance\DocumentController;
use App\Http\Controllers\Compliance\AuditController;
use App\Http\Controllers\ProjectManagement\ProjectController;
use App\Http\Controllers\ProjectManagement\MilestoneController;
use App\Http\Controllers\ProjectManagement\TaskController as PMTaskController;
use App\Http\Controllers\ProjectManagement\IssueController;
use App\Http\Controllers\ProjectManagement\ResourceController;
use App\Http\Controllers\ProjectManagement\TimeTrackingController;
use App\Http\Controllers\ProjectManagement\BudgetController;
use App\Http\Controllers\ProjectManagement\GanttController;
use App\Http\Controllers\Quality\InspectionController;
use App\Http\Controllers\Quality\NCRController;
use App\Http\Controllers\Quality\CalibrationController;
use App\Http\Controllers\HR\PerformanceReviewController;
use App\Http\Controllers\HR\TrainingController;
use App\Http\Controllers\HR\RecruitmentController;
use App\Http\Controllers\HR\OnboardingController;
use App\Http\Controllers\HR\SkillsController;
use App\Http\Controllers\HR\BenefitsController;
use App\Http\Controllers\HR\TimeOffController;
use App\Http\Controllers\HR\TimeOffManagementController;
use App\Http\Controllers\HR\WorkplaceSafetyController;
use App\Http\Controllers\HR\HrAnalyticsController;
use App\Http\Controllers\HR\HrDocumentController;
use App\Http\Controllers\HR\EmployeeSelfServiceController;
use App\Http\Controllers\HR\PayrollController;
use App\Http\Controllers\Central\TenantRegistrationController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group.
|
*/

// ============================================================================
// HOME/LANDING PAGE ROUTE
// ============================================================================

Route::get('/', [LandingController::class, 'index'])->name('home');

// Additional landing page routes
Route::get('/features', [LandingController::class, 'features'])->name('features');
Route::get('/landing-pricing', [LandingController::class, 'pricing'])->name('landing.pricing');

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

Route::middleware('guest')->group(function () {
    // Note: Authentication routes are now handled in central.php for central domain
    // and tenant.php for tenant domains to avoid conflicts
    
    // Central registration is handled in central.php
});

Route::middleware('auth')->group(function () {
    // Note: Auth routes are now handled in respective domain-specific route files
    // (central.php for central domain, tenant.php for tenant domains)
});

// ============================================================================
// CENTRAL DOMAIN ROUTES (SaaS/Multi-tenant)
// ============================================================================

// Public SaaS routes
Route::get('/pricing', [BillingController::class, 'pricing'])->name('pricing');
Route::post('/subscribe/{plan}', [BillingController::class, 'subscribe'])->name('subscribe');
Route::get('/billing/complete', [BillingController::class, 'complete'])->name('billing.complete');
Route::get('/payment/success', [BillingController::class, 'paymentSuccess'])->name('payment.success');
Route::get('/payment/cancel', [BillingController::class, 'paymentCancel'])->name('payment.cancel');

// Success pages
Route::get('/registration-success', function () {
    return inertia('Auth/RegistrationSuccess');
})->name('registration.success');

// Static pages
Route::get('/pricing', function () {
    $plans = \App\Models\Plan::where('is_active', true)->orderBy('price')->get();
    return inertia('Pages/Pricing', ['plans' => $plans]);
})->name('pricing');

// Stripe webhook (no auth required)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])->name('stripe.webhook');

// ============================================================================
// API ROUTES
// ============================================================================

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
            'user_id' => Auth::id(),
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
            'user_id' => Auth::id(),
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
        ]);
    }
});

// Notification token endpoint
Route::post('/notification-token', [NotificationController::class, 'storeToken'])->middleware(['auth:sanctum']);

// Session and CSRF token endpoints
Route::get('/session-check', function () {
    return response()->json(['authenticated' => Auth::check()]);
});

Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// ============================================================================
// AUTHENTICATED USER ROUTES
// ============================================================================

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/picnic', [PicnicController::class, 'index'])->name('picnic');

    // Dashboard routes - require dashboard permission
    Route::middleware(['permission:core.dashboard.view'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/stats', [DashboardController::class, 'stats'])->name('stats');
    });

    // Security Dashboard route - available to authenticated users
    Route::get('/security/dashboard', function () {
        return inertia('Security/Dashboard');
    })->name('security.dashboard');

    // Updates route - require updates permission
    Route::middleware(['permission:core.updates.view'])->get('/updates', [DashboardController::class, 'updates'])->name('updates');

    // Employee self-service routes
    Route::middleware(['permission:leave.own.view'])->group(function () {
        Route::get('/leaves-employee', [LeaveController::class, 'index1'])->name('leaves-employee');
        Route::post('/leave-add', [LeaveController::class, 'create'])->name('leave-add');
        Route::post('/leave-update', [LeaveController::class, 'update'])->name('leave-update');
        Route::delete('/leave-delete', [LeaveController::class, 'delete'])->name('leave-delete');
        Route::get('/leaves-paginate', [LeaveController::class, 'paginate'])->name('leaves.paginate');
        Route::get('/leaves-stats', [LeaveController::class, 'stats'])->name('leaves.stats');
    });

    // Attendance self-service routes
    Route::middleware(['permission:attendance.own.view'])->group(function () {
        Route::get('/attendance-employee', [AttendanceController::class, 'index2'])->name('attendance-employee');
        Route::get('/attendance/attendance-today', [AttendanceController::class, 'getCurrentUserPunch'])->name('attendance.current-user-punch');
        Route::get('/get-current-user-attendance-for-date', [AttendanceController::class, 'getCurrentUserAttendanceForDate'])->name('getCurrentUserAttendanceForDate');
    });

    // Punch routes - require punch permission
    Route::middleware(['permission:attendance.own.punch'])->group(function () {
        Route::post('/punchIn', [AttendanceController::class, 'punchIn'])->name('punchIn');
        Route::post('/punchOut', [AttendanceController::class, 'punchOut'])->name('punchOut');
        Route::post('/attendance/punch', [AttendanceController::class, 'punch'])->name('attendance.punch');
    });

    // General access routes (available to all authenticated users)
    Route::get('/attendance/export/excel', [AttendanceController::class, 'exportExcel'])->name('attendance.exportExcel');
    Route::get('/admin/attendance/export/excel', [AttendanceController::class, 'exportAdminExcel'])->name('attendance.exportAdminExcel');
    Route::get('/admin/attendance/export/pdf', [AttendanceController::class, 'exportAdminPdf'])->name('attendance.exportAdminPdf');
    Route::get('/attendance/export/pdf', [AttendanceController::class, 'exportPdf'])->name('attendance.exportPdf');
    Route::get('/get-all-users-attendance-for-date', [AttendanceController::class, 'getAllUsersAttendanceForDate'])->name('getAllUsersAttendanceForDate');
    Route::get('/get-present-users-for-date', [AttendanceController::class, 'getPresentUsersForDate'])->name('getPresentUsersForDate');
    Route::get('/get-absent-users-for-date', [AttendanceController::class, 'getAbsentUsersForDate'])->name('getAbsentUsersForDate');
    Route::get('/get-client-ip', [AttendanceController::class, 'getClientIp'])->name('getClientIp');

    // Daily works routes
    Route::middleware(['permission:daily-works.view'])->group(function () {
        Route::get('/daily-works', [DailyWorkController::class, 'index'])->name('daily-works');
        Route::get('/daily-works-paginate', [DailyWorkController::class, 'paginate'])->name('dailyWorks.paginate');
        Route::get('/daily-works-all', [DailyWorkController::class, 'all'])->name('dailyWorks.all');
        Route::get('/daily-works-summary', [DailyWorkSummaryController::class, 'index'])->name('daily-works-summary');
    });

    Route::middleware(['permission:daily-works.create'])->group(function () {
        Route::post('/add-daily-work', [DailyWorkController::class, 'add'])->name('dailyWorks.add');
    });

    Route::middleware(['permission:daily-works.update'])->group(function () {
        Route::post('/update-daily-work', [DailyWorkController::class, 'update'])->name('dailyWorks.update');
        Route::post('/update-rfi-file', [DailyWorkController::class, 'uploadRFIFile'])->name('dailyWorks.uploadRFI');
    });

    // Holiday routes (Legacy - redirects to Time Off Management)
    Route::middleware(['permission:holidays.view'])->group(function () {
        Route::get('/holidays', [HolidayController::class, 'index'])->name('holidays');
        Route::post('/holidays-add', [HolidayController::class, 'create'])->name('holidays-add');
        Route::delete('/holidays-delete', [HolidayController::class, 'delete'])->name('holidays-delete');
        
        // Legacy redirect for old holiday routes
        Route::get('/holidays-legacy', [HolidayController::class, 'index'])->name('holidays-legacy');
    });

    //Profile Routes - own profile access
    Route::middleware(['permission:profile.own.view'])->group(function () {
        Route::get('/profile/{user}', [ProfileController::class, 'index'])->name('profile');
        Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile/delete', [ProfileController::class, 'delete'])->name('profile.delete');
        
        // New API endpoints for enhanced profile functionality (consistent with other modules)
        Route::get('/profile/{user}/stats', [ProfileController::class, 'stats'])->name('profile.stats');
        Route::get('/profile/{user}/export', [ProfileController::class, 'export'])->name('profile.export');
        Route::post('/profile/{user}/track-view', [ProfileController::class, 'trackView'])->name('profile.trackView');

        //Education Routes:
        Route::post('/education/update', [EducationController::class, 'update'])->name('education.update');
        Route::delete('/education/delete', [EducationController::class, 'delete'])->name('education.delete');

        //Experience Routes:
        Route::post('/experience/update', [ExperienceController::class, 'update'])->name('experience.update');
        Route::delete('/experience/delete', [ExperienceController::class, 'delete'])->name('experience.delete');
    });

    // Communications routes
    Route::middleware(['permission:communications.own.view'])->get('/emails', [EmailController::class, 'index'])->name('emails');

    // Leave summary route
    Route::middleware(['permission:leaves.view,leaves.own.view'])->get('/leave-summary', [LeaveController::class, 'summary'])->name('leave.summary');
});


// Administrative routes - require specific permissions
Route::middleware(['auth', 'verified'])->group(function () {

    // Document management routes
    Route::middleware(['permission:letters.view'])->group(function () {
        Route::get('/letters', [LetterController::class, 'index'])->name('letters');
        Route::get('/letters-paginate', [LetterController::class, 'paginate'])->name('letters.paginate');
    });

    Route::middleware(['permission:letters.update'])->put('/letters-update', [LetterController::class, 'update'])->name('letters.update');    // Leave management routes
    Route::middleware(['permission:leaves.view'])->group(function () {
        Route::get('/leaves', [LeaveController::class, 'index2'])->name('leaves');
        Route::get('/leave-summary', [LeaveController::class, 'leaveSummary'])->name('leave-summary');
        Route::post('/leave-update-status', [LeaveController::class, 'updateStatus'])->name('leave-update-status');
    });

    // Leave bulk operations (admin only)
    Route::middleware(['permission:leaves.approve'])->group(function () {
        Route::post('/leaves/bulk-approve', [LeaveController::class, 'bulkApprove'])->name('leaves.bulk-approve');
        Route::post('/leaves/bulk-reject', [LeaveController::class, 'bulkReject'])->name('leaves.bulk-reject');
    });

    // Bulk leave creation routes
    Route::middleware(['permission:leaves.create'])->group(function () {
        Route::post('/leaves/bulk/validate', [BulkLeaveController::class, 'validateDates'])->name('leaves.bulk.validate');
        Route::post('/leaves/bulk', [BulkLeaveController::class, 'store'])->name('leaves.bulk.store');
        Route::get('/leaves/bulk/leave-types', [BulkLeaveController::class, 'getLeaveTypes'])->name('leaves.bulk.leave-types');
        Route::get('/leaves/bulk/calendar-data', [BulkLeaveController::class, 'getCalendarData'])->name('leaves.bulk.calendar-data');
    });

    // Bulk leave deletion route
    Route::middleware(['permission:leaves.delete'])->group(function () {
        Route::delete('/leaves/bulk', [BulkLeaveController::class, 'bulkDelete'])->name('leaves.bulk.delete');
    });

    // Leave settings routes
    Route::middleware(['permission:leave-settings.update'])->group(function () {
        Route::get('/leave-settings', [LeaveSettingController::class, 'index'])->name('leave-settings');
        Route::post('/add-leave-type', [LeaveSettingController::class, 'store'])->name('add-leave-type');
        Route::put('/update-leave-type/{id}', [LeaveSettingController::class, 'update'])->name('update-leave-type');
        Route::delete('/delete-leave-type/{id}', [LeaveSettingController::class, 'destroy'])->name('delete-leave-type');
    });

    // HR Management routes
    Route::middleware(['permission:employees.view'])->group(function () {
        Route::get('/employees', [\App\Http\Controllers\EmployeeController::class, 'index'])->name('employees');
        Route::get('/employees/paginate', [\App\Http\Controllers\EmployeeController::class, 'paginate'])->name('employees.paginate');
        Route::get('/employees/stats', [\App\Http\Controllers\EmployeeController::class, 'stats'])->name('employees.stats');
    });
    
    // Department management routes
    Route::middleware(['permission:departments.view'])->get('/departments', [DepartmentController::class, 'index'])->name('departments');
    Route::middleware(['permission:departments.view'])->get('/api/departments', [DepartmentController::class, 'getDepartments'])->name('api.departments');
    Route::middleware(['permission:departments.view'])->get('/departments/stats', [DepartmentController::class, 'getStats'])->name('departments.stats');
    Route::middleware(['permission:departments.create'])->post('/departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::middleware(['permission:departments.view'])->get('/departments/{id}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::middleware(['permission:departments.update'])->put('/departments/{id}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::middleware(['permission:departments.delete'])->delete('/departments/{id}', [DepartmentController::class, 'destroy'])->name('departments.delete');
    Route::middleware(['permission:departments.update'])->put('/users/{id}/department', [DepartmentController::class, 'updateUserDepartment'])->name('users.update-department');
    
    Route::middleware(['permission:jurisdiction.view'])->get('/jurisdiction', [JurisdictionController::class, 'index'])->name('jurisdiction');

    // Daily works management routes
    Route::middleware(['permission:daily-works.import'])->post('/import-daily-works/', [DailyWorkController::class, 'import'])->name('dailyWorks.import');
    Route::middleware(['permission:daily-works.delete'])->delete('/delete-daily-work', [DailyWorkController::class, 'delete'])->name('dailyWorks.delete');

    // Holiday management routes
    Route::middleware(['permission:holidays.create'])->post('/holiday-add', [HolidayController::class, 'create'])->name('holiday-add');
    Route::middleware(['permission:holidays.delete'])->delete('/holiday-delete', [HolidayController::class, 'delete'])->name('holiday-delete');

    // User management routes
    Route::middleware(['permission:users.view'])->group(function () {
        Route::get('/users', [UserController::class, 'index2'])->name('users');
        Route::get('/users/paginate', [UserController::class, 'paginate'])->name('users.paginate');
        Route::get('/users/stats', [UserController::class, 'stats'])->name('users.stats');
        
        // Profile search for admin usage (consistent with other modules)
        Route::get('/profiles/search', [ProfileController::class, 'search'])->name('profiles.search');
    });

    Route::middleware(['permission:users.create'])->post('/users', [ProfileController::class, 'store'])->name('addUser');

    Route::middleware(['permission:users.update'])->group(function () {
        Route::post('/user/{id}/update-department', [DepartmentController::class, 'updateUserDepartment'])->name('user.updateDepartment');
        Route::post('/user/{id}/update-designation', [DesignationController::class, 'updateUserDesignation'])->name('user.updateDesignation');
        Route::post('/user/{id}/update-role', [UserController::class, 'updateUserRole'])->name('user.updateRole');
        Route::put('/user/toggle-status/{id}', [UserController::class, 'toggleStatus'])->name('user.toggleStatus');
        Route::post('/user/{id}/update-attendance-type', [UserController::class, 'updateUserAttendanceType'])->name('user.updateAttendanceType');
    });

    // Company settings routes
    Route::middleware(['permission:company.settings'])->group(function () {
        Route::put('/update-company-settings', [CompanySettingController::class, 'update'])->name('update-company-settings');
        Route::get('/company-settings', [CompanySettingController::class, 'index'])->name('admin.settings.company');
    });    // Legacy role routes (maintained for backward compatibility)
    Route::middleware(['permission:roles.view'])->get('/roles-permissions', [RoleController::class, 'getRolesAndPermissions'])->name('roles-settings');

    // Document management routes
    Route::middleware(['permission:letters.view'])->get('/letters', [LetterController::class, 'index'])->name('letters');    // Attendance management routes
    Route::middleware(['permission:attendance.view'])->group(function () {
        Route::get('/attendances', [AttendanceController::class, 'index1'])->name('attendances');
        Route::get('/attendances-admin-paginate', [AttendanceController::class, 'paginate'])->name('attendancesAdmin.paginate');
        Route::get('/attendance/locations-today', [AttendanceController::class, 'getUserLocationsForDate'])->name('getUserLocationsForDate');
        Route::get('/admin/get-present-users-for-date', [AttendanceController::class, 'getPresentUsersForDate'])->name('admin.getPresentUsersForDate');
        Route::get('/admin/get-absent-users-for-date', [AttendanceController::class, 'getAbsentUsersForDate'])->name('admin.getAbsentUsersForDate');
        Route::get('/attendance/monthly-stats', [AttendanceController::class, 'getMonthlyAttendanceStats'])->name('attendance.monthlyStats');
        // Location and timesheet update check routes
        Route::get('check-user-locations-updates/{date}', [AttendanceController::class, 'checkForLocationUpdates'])
            ->name('check-user-locations-updates');
        Route::get('check-timesheet-updates/{date}/{month?}', [AttendanceController::class, 'checkTimesheetUpdates'])
            ->name('check-timesheet-updates');
    });

    // Employee attendance stats route
    Route::middleware(['permission:attendance.own.view'])->group(function () {
        Route::get('/attendance/my-monthly-stats', [AttendanceController::class, 'getMonthlyAttendanceStats'])->name('attendance.myMonthlyStats');
    });

    Route::middleware(['permission:attendance.settings'])->group(function () {
        Route::get('/settings/attendance', [AttendanceSettingController::class, 'index'])->name('attendance-settings.index');
        Route::post('/settings/attendance', [AttendanceSettingController::class, 'updateSettings'])->name('attendance-settings.update');
        Route::post('settings/attendance-type', [AttendanceSettingController::class, 'storeType'])->name('attendance-types.store');
        Route::post('settings/attendance-type/{id}', [AttendanceSettingController::class, 'updateType'])->name('attendance-types.update');
        Route::delete('settings/attendance-type/{id}', [AttendanceSettingController::class, 'destroyType'])->name('attendance-types.destroy');
    });

    // HR Module Settings
    Route::prefix('settings/hr')->middleware(['auth', 'verified'])->group(function () {
        Route::middleware(['permission:hr.onboarding.view'])->get('/onboarding', [\App\Http\Controllers\Settings\HrmSettingController::class, 'index'])->name('settings.hr.onboarding');
        Route::middleware(['permission:hr.skills.view'])->get('/skills', [\App\Http\Controllers\Settings\HrmSettingController::class, 'index'])->name('settings.hr.skills');
        Route::middleware(['permission:hr.benefits.view'])->get('/benefits', [\App\Http\Controllers\Settings\HrmSettingController::class, 'index'])->name('settings.hr.benefits');
        Route::middleware(['permission:hr.safety.view'])->get('/safety', [\App\Http\Controllers\Settings\HrmSettingController::class, 'index'])->name('settings.hr.safety');
        Route::middleware(['permission:hr.documents.view'])->get('/documents', [\App\Http\Controllers\Settings\HrmSettingController::class, 'index'])->name('settings.hr.documents');

        // Update routes
        Route::middleware(['permission:hr.onboarding.update'])->post('/onboarding', [\App\Http\Controllers\Settings\HrmSettingController::class, 'updateOnboardingSettings'])->name('settings.hr.onboarding.update');
        Route::middleware(['permission:hr.skills.update'])->post('/skills', [\App\Http\Controllers\Settings\HrmSettingController::class, 'updateSkillsSettings'])->name('settings.hr.skills.update');
        Route::middleware(['permission:hr.benefits.update'])->post('/benefits', [\App\Http\Controllers\Settings\HrmSettingController::class, 'updateBenefitsSettings'])->name('settings.hr.benefits.update');
        Route::middleware(['permission:hr.safety.update'])->post('/safety', [\App\Http\Controllers\Settings\HrmSettingController::class, 'updateSafetySettings'])->name('settings.hr.safety.update');
        Route::middleware(['permission:hr.documents.update'])->post('/documents', [\App\Http\Controllers\Settings\HrmSettingController::class, 'updateDocumentSettings'])->name('settings.hr.documents.update');
    });

    // Task management routes
    Route::middleware(['permission:tasks.view'])->group(function () {
        Route::get('/tasks-all', [TaskController::class, 'allTasks'])->name('allTasks');
        Route::post('/tasks-filtered', [TaskController::class, 'filterTasks'])->name('filterTasks');
    });

    Route::middleware(['permission:tasks.create'])->post('/task/add', [TaskController::class, 'addTask'])->name('addTask');

    // Jurisdiction/Work location routes
    Route::middleware(['permission:jurisdiction.view'])->group(function () {
        Route::get('/work-location', [JurisdictionController::class, 'showWorkLocations'])->name('showWorkLocations');
        Route::get('/work-location_json', [JurisdictionController::class, 'allWorkLocations'])->name('allWorkLocations');
    });

    Route::middleware(['permission:jurisdiction.create'])->post('/work-locations/add', [JurisdictionController::class, 'addWorkLocation'])->name('addWorkLocation');
    Route::middleware(['permission:jurisdiction.delete'])->post('/work-locations/delete', [JurisdictionController::class, 'deleteWorkLocation'])->name('deleteWorkLocation');
    Route::middleware(['permission:jurisdiction.update'])->post('/work-locations/update', [JurisdictionController::class, 'updateWorkLocation'])->name('updateWorkLocation');
});


Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/tasks-all-se', [TaskController::class, 'allTasks'])->name('allTasksSE');
    Route::post('/tasks-filtered-se', [TaskController::class, 'filterTasks'])->name('filterTasksSE');
    Route::get('/tasks/se', [TaskController::class, 'showTasks'])->name('showTasksSE');
    Route::post('/task/add-se', [TaskController::class, 'addTask'])->name('addTaskSE');
    Route::post('/task/update-inspection-details', [TaskController::class, 'updateInspectionDetails'])->name('updateInspectionDetails');
    Route::post('/task/update-status', [TaskController::class, 'updateTaskStatus'])->name('updateTaskStatus');
    Route::post('/task/assign', [TaskController::class, 'assignTask'])->name('assignTask');
    Route::post('/task/update-completion-date-time-se', [TaskController::class, 'updateCompletionDateTime'])->name('updateCompletionDateTimeSE');
    Route::get('/tasks/daily-summary-se', [DailyWorkSummaryController::class, 'showDailySummary', 'title' => 'Daily Summary'])->name('showDailySummarySE');
    Route::post('/tasks/daily-summary-filtered-se', [DailyWorkSummaryController::class, 'filterSummary'])->name('filterSummarySE');
    Route::get('/get-latest-timestamp', [TaskController::class, 'getLatestTimestamp'])->name('getLatestTimestamp');
    Route::get('/tasks/daily-summary-json', [DailyWorkSummaryController::class, 'dailySummary'])->name('dailySummaryJSON');



    Route::get('/reports', [ReportController::class, 'showReports'])->name('showReports');
    Route::get('/reports-json', [ReportController::class, 'allReports'])->name('allReports');
    Route::post('/reports/add', [ReportController::class, 'addReport'])->name('addReport');
    Route::post('/reports/delete', [ReportController::class, 'deleteReport'])->name('deleteReport');
    Route::post('/reports/update', [ReportController::class, 'updateReport'])->name('updateReport');
    Route::post('/tasks/attach-report', [TaskController::class, 'attachReport'])->name('attachReport');
    Route::post('/tasks/detach-report', [TaskController::class, 'detachReport'])->name('detachReport');
});

// Enhanced Role Management Routes (with proper permission-based access control)
Route::middleware(['auth', 'verified', 'permission:roles.view', 'role_permission_sync'])->group(function () {
    // Role Management Interface
    Route::get('/admin/roles-management', [RoleController::class, 'index'])->name('admin.roles-management');
    Route::get('/admin/roles/audit', [RoleController::class, 'getEnhancedRoleAudit'])->name('admin.roles.audit');
    Route::get('/admin/roles/export', [RoleController::class, 'exportRoles'])->name('admin.roles.export');
    Route::get('/admin/roles/metrics', [RoleController::class, 'getRoleMetrics'])->name('admin.roles.metrics');
    Route::get('/admin/roles/snapshot', [RoleController::class, 'snapshot'])->name('admin.roles.snapshot');
});

Route::middleware(['auth', 'verified', 'permission:roles.create'])->group(function () {
    Route::post('/admin/roles', [RoleController::class, 'storeRole'])->name('admin.roles.store');
    Route::post('/admin/roles/clone', [RoleController::class, 'cloneRole'])->name('admin.roles.clone');
});

Route::middleware(['auth', 'verified', 'permission:roles.update'])->group(function () {
    Route::put('/admin/roles/{id}', [RoleController::class, 'updateRole'])->name('admin.roles.update');
    Route::post('/admin/roles/update-permission', [RoleController::class, 'updateRolePermission'])->name('admin.roles.update-permission');
    Route::post('/admin/roles/toggle-permission', [RoleController::class, 'togglePermission'])->name('admin.roles.toggle-permission');
    Route::post('/admin/roles/update-module', [RoleController::class, 'updateRoleModule'])->name('admin.roles.update-module');
    Route::post('/admin/roles/bulk-operation', [RoleController::class, 'bulkOperation'])->name('admin.roles.bulk-operation');
    Route::patch('/admin/roles/{role}/permissions', [RoleController::class, 'batchUpdatePermissions'])->name('admin.roles.batch-permissions');
});

Route::middleware(['auth', 'verified', 'permission:roles.delete'])->group(function () {
    Route::delete('/admin/roles/{id}', [RoleController::class, 'deleteRole'])->name('admin.roles.delete');
});

// Super Administrator only routes
Route::middleware(['auth', 'verified', 'role:Super Administrator'])->group(function () {
    Route::post('/admin/roles/initialize-enterprise', [RoleController::class, 'initializeEnterpriseSystem'])->name('admin.roles.initialize-enterprise');
});

// Test route for role controller
Route::middleware(['auth', 'verified'])->get('/admin/roles-test', [RoleController::class, 'test'])->name('admin.roles.test');

// Role Debug Routes (for troubleshooting live server issues)
Route::middleware(['auth', 'verified', 'role:Super Administrator'])->group(function () {
    Route::get('/admin/roles/debug', [App\Http\Controllers\RoleDebugController::class, 'debug'])->name('admin.roles.debug');
    Route::post('/admin/roles/debug/refresh-cache', [App\Http\Controllers\RoleDebugController::class, 'refreshCache'])->name('admin.roles.debug.refresh-cache');
    Route::get('/admin/roles/debug/test-role', [App\Http\Controllers\RoleDebugController::class, 'testRole'])->name('admin.roles.debug.test-role');
    Route::post('/admin/roles/debug/test-permission', [App\Http\Controllers\RoleDebugController::class, 'testPermissionAssignment'])->name('admin.roles.debug.test-permission');
});

// System Monitoring Routes (Super Administrator only)
Route::middleware(['auth', 'verified', 'role:Super Administrator'])->group(function () {
    Route::get('/admin/system-monitoring', [SystemMonitoringController::class, 'index'])->name('admin.system-monitoring');
    Route::post('/admin/errors/{errorId}/resolve', [SystemMonitoringController::class, 'resolveError'])->name('admin.errors.resolve');
    Route::get('/admin/system-report', [SystemMonitoringController::class, 'exportReport'])->name('admin.system-report');
    Route::get('/admin/optimization-report', [SystemMonitoringController::class, 'getOptimizationReport'])->name('admin.optimization-report');
    // CRM Module routes
    Route::middleware(['permission:view_crm'])->prefix('crm')->group(function () {
        Route::get('/', [App\Http\Controllers\CRMController::class, 'index'])->name('crm.index');
        Route::get('/leads', [App\Http\Controllers\CRMController::class, 'leads'])->name('crm.leads');
        Route::post('/leads', [App\Http\Controllers\CRMController::class, 'storeLeads'])->name('crm.leads.store')->middleware('permission:create_leads');
        Route::get('/customers', [App\Http\Controllers\CRMController::class, 'customers'])->name('crm.customers')->middleware('permission:view_customers');
        Route::get('/opportunities', [App\Http\Controllers\CRMController::class, 'opportunities'])->name('crm.opportunities')->middleware('permission:view_opportunities');
        Route::get('/pipeline', [App\Http\Controllers\CRMController::class, 'pipeline'])->name('crm.pipeline')->middleware('permission:view_sales_pipeline');
        Route::get('/reports', [App\Http\Controllers\CRMController::class, 'reports'])->name('crm.reports')->middleware('permission:view_crm_reports');
        Route::get('/settings', [App\Http\Controllers\CRMController::class, 'settings'])->name('crm.settings')->middleware('permission:manage_crm_settings');
    });

    // FMS Module routes
    Route::middleware(['permission:financial-reports.view'])->prefix('fms')->group(function () {
        Route::get('/', [FMSController::class, 'index'])->name('fms.index');

        // Accounts Payable
        Route::get('/accounts-payable', [FMSController::class, 'accountsPayable'])->name('fms.accounts-payable')->middleware('permission:accounts-payable.view');
        Route::post('/accounts-payable', [FMSController::class, 'storeAccountsPayable'])->name('fms.accounts-payable.store')->middleware('permission:accounts-payable.manage');

        // Accounts Receivable
        Route::get('/accounts-receivable', [FMSController::class, 'accountsReceivable'])->name('fms.accounts-receivable')->middleware('permission:accounts-receivable.view');
        Route::post('/accounts-receivable', [FMSController::class, 'storeAccountsReceivable'])->name('fms.accounts-receivable.store')->middleware('permission:accounts-receivable.manage');

        // General Ledger
        Route::get('/general-ledger', [FMSController::class, 'generalLedger'])->name('fms.general-ledger')->middleware('permission:ledger.view');
        Route::post('/general-ledger', [FMSController::class, 'storeLedgerEntry'])->name('fms.general-ledger.store')->middleware('permission:ledger.manage');

        // Reports
        Route::get('/reports', [FMSController::class, 'reports'])->name('fms.reports')->middleware('permission:financial-reports.view');
        Route::post('/reports/generate', [FMSController::class, 'generateReport'])->name('fms.reports.generate')->middleware('permission:financial-reports.create');

        // Budgets
        Route::get('/budgets', [FMSController::class, 'budgets'])->name('fms.budgets')->middleware('permission:ledger.view');
        Route::post('/budgets', [FMSController::class, 'storeBudget'])->name('fms.budgets.store')->middleware('permission:ledger.manage');

        // Expenses
        Route::get('/expenses', [FMSController::class, 'expenses'])->name('fms.expenses')->middleware('permission:ledger.view');
        Route::post('/expenses', [FMSController::class, 'storeExpense'])->name('fms.expenses.store')->middleware('permission:ledger.manage');

        // Invoices
        Route::get('/invoices', [FMSController::class, 'invoices'])->name('fms.invoices')->middleware('permission:financial-reports.view');
        Route::post('/invoices', [FMSController::class, 'storeInvoice'])->name('fms.invoices.store')->middleware('permission:financial-reports.create');

        // Settings
        Route::get('/settings', [FMSController::class, 'settings'])->name('fms.settings')->middleware('permission:ledger.manage');
        Route::put('/settings', [FMSController::class, 'updateSettings'])->name('fms.settings.update')->middleware('permission:ledger.manage');
    });

    // POS Module routes
    Route::middleware(['permission:retail.view'])->prefix('pos')->group(function () {
        Route::get('/', [POSController::class, 'index'])->name('pos.index');

        // POS Terminal
        Route::get('/terminal', [POSController::class, 'terminal'])->name('pos.terminal')->middleware('permission:pos.access');

        // Sales Management
        Route::get('/sales', [POSController::class, 'sales'])->name('pos.sales')->middleware('permission:retail.view');
        Route::post('/sales/process', [POSController::class, 'processSale'])->name('pos.sales.process')->middleware('permission:pos.access');

        // Product Management
        Route::get('/products', [POSController::class, 'products'])->name('pos.products')->middleware('permission:retail.view');
        Route::get('/products/barcode/{barcode}', [POSController::class, 'getProductByBarcode'])->name('pos.products.barcode')->middleware('permission:pos.access');

        // Customer Management
        Route::get('/customers', [POSController::class, 'customers'])->name('pos.customers')->middleware('permission:retail.view');

        // Payment Management
        Route::get('/payments', [POSController::class, 'payments'])->name('pos.payments')->middleware('permission:retail.view');

        // Reports
        Route::get('/reports', [POSController::class, 'reports'])->name('pos.reports')->middleware('permission:retail.view');

        // Settings
        Route::get('/settings', [POSController::class, 'settings'])->name('pos.settings')->middleware('permission:retail.manage');
        Route::put('/settings', [POSController::class, 'updateSettings'])->name('pos.settings.update')->middleware('permission:retail.manage');
    });

    // IMS Module routes (Inventory Management System)
    Route::middleware(['permission:inventory.view'])->prefix('ims')->group(function () {
        Route::get('/', [IMSController::class, 'index'])->name('ims.index');

        // Products Management
        Route::get('/products', [IMSController::class, 'products'])->name('ims.products')->middleware('permission:inventory.view');
        Route::post('/products', [IMSController::class, 'storeProduct'])->name('ims.products.store')->middleware('permission:inventory.create');

        // Warehouse Management
        Route::get('/warehouse', [IMSController::class, 'warehouse'])->name('ims.warehouse')->middleware('permission:inventory.view');
        Route::post('/warehouse', [IMSController::class, 'storeWarehouse'])->name('ims.warehouse.store')->middleware('permission:warehousing.manage');

        // Stock Movements
        Route::get('/stock-movements', [IMSController::class, 'stockMovements'])->name('ims.stock-movements')->middleware('permission:inventory.view');
        Route::post('/stock-movements', [IMSController::class, 'createMovement'])->name('ims.stock-movements.store')->middleware('permission:inventory.update');

        // Suppliers
        Route::get('/suppliers', [IMSController::class, 'suppliers'])->name('ims.suppliers')->middleware('permission:suppliers.view');
        Route::post('/suppliers', [IMSController::class, 'storeSupplier'])->name('ims.suppliers.store')->middleware('permission:suppliers.create');

        // Purchase Orders
        Route::get('/purchase-orders', [IMSController::class, 'purchaseOrders'])->name('ims.purchase-orders')->middleware('permission:purchase-orders.view');
        Route::post('/purchase-orders', [IMSController::class, 'storePurchaseOrder'])->name('ims.purchase-orders.store')->middleware('permission:purchase-orders.create');

        // Reports
        Route::get('/reports', [IMSController::class, 'reports'])->name('ims.reports')->middleware('permission:inventory.view');

        // Settings
        Route::get('/settings', [IMSController::class, 'settings'])->name('ims.settings')->middleware('permission:warehousing.manage');
        Route::put('/settings', [IMSController::class, 'updateSettings'])->name('ims.settings.update')->middleware('permission:warehousing.manage');
    });



    // Designation Management
    Route::middleware(['permission:hr.designations.view'])->group(function () {
        // Initial page render (Inertia)
        Route::get('/designations', [\App\Http\Controllers\DesignationController::class, 'index'])->name('designations.index');
        // API data fetch (JSON)
        Route::get('/designations/json', [\App\Http\Controllers\DesignationController::class, 'getDesignations'])->name('designations.json');
        // Stats endpoint for frontend analytics
        Route::get('/designations/stats', [\App\Http\Controllers\DesignationController::class, 'stats'])->name('designations.stats');
        Route::post('/designations', [\App\Http\Controllers\DesignationController::class, 'store'])->name('designations.store');
        Route::get('/designations/{id}', [\App\Http\Controllers\DesignationController::class, 'show'])->name('designations.show');
        Route::put('/designations/{id}', [\App\Http\Controllers\DesignationController::class, 'update'])->name('designations.update');
        Route::delete('/designations/{id}', [\App\Http\Controllers\DesignationController::class, 'destroy'])->name('designations.destroy');
        // For dropdowns and API
        Route::get('/designations/list', [\App\Http\Controllers\DesignationController::class, 'list'])->name('designations.list');
    });
});

// API routes for dropdown data
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/api/designations/list', function () {
        return response()->json(\App\Models\HRM\Designation::select('id', 'title as name')->get());
    })->name('designations.list');

    Route::get('/api/departments/list', function () {
        return response()->json(\App\Models\HRM\Department::select('id', 'name')->get());
    })->name('departments.list');

    Route::get('/api/users/managers/list', function () {
        return response()->json(\App\Models\User::whereHas('roles', function ($query) {
            $query->whereIn('name', [
                'Super Administrator',
                'Administrator',
                'HR Manager',
                'Project Manager',
                'Department Manager',
                'Team Lead'
            ]);
        })
            ->select('id', 'name')
            ->get());
    })->name('users.managers.list');
});

Route::post('/update-fcm-token', [UserController::class, 'updateFcmToken'])->name('updateFcmToken');

    // ============================================================================
    // ANALYTICS MODULE ROUTES
    // ============================================================================
    Route::prefix('analytics')->name('analytics.')->group(function () {
        // Reports routes
        Route::middleware(['permission:analytics.reports.view'])->group(function () {
            Route::get('/reports', [AnalyticsReportController::class, 'index'])->name('reports.index');
            Route::get('/reports/create', [AnalyticsReportController::class, 'create'])->name('reports.create');
            Route::get('/reports/{report}/edit', [AnalyticsReportController::class, 'edit'])->name('reports.edit');
            Route::get('/reports/{report}', [AnalyticsReportController::class, 'show'])->name('reports.show');
            Route::get('/reports/{report}/schedule', [AnalyticsReportController::class, 'scheduleForm'])->name('reports.schedule.form');
            Route::get('/reports/{report}/export', [AnalyticsReportController::class, 'export'])->name('reports.export');
        });

        Route::middleware(['permission:analytics.reports.create'])->post('/reports', [AnalyticsReportController::class, 'store'])->name('reports.store');
        Route::middleware(['permission:analytics.reports.update'])->put('/reports/{report}', [AnalyticsReportController::class, 'update'])->name('reports.update');
        Route::middleware(['permission:analytics.reports.delete'])->delete('/reports/{report}', [AnalyticsReportController::class, 'destroy'])->name('reports.destroy');
        Route::middleware(['permission:analytics.reports.schedule'])->post('/reports/{report}/schedule', [AnalyticsReportController::class, 'schedule'])->name('reports.schedule');

        // Dashboards routes
        Route::middleware(['permission:analytics.dashboards.view'])->group(function () {
            Route::get('/dashboards', [AnalyticsDashboardController::class, 'index'])->name('dashboards.index');
            Route::get('/dashboards/create', [AnalyticsDashboardController::class, 'create'])->name('dashboards.create');
            Route::get('/dashboards/{dashboard}/edit', [AnalyticsDashboardController::class, 'edit'])->name('dashboards.edit');
            Route::get('/dashboards/{dashboard}', [AnalyticsDashboardController::class, 'show'])->name('dashboards.show');
        });

        Route::middleware(['permission:analytics.dashboards.create'])->post('/dashboards', [AnalyticsDashboardController::class, 'store'])->name('dashboards.store');
        Route::middleware(['permission:analytics.dashboards.update'])->put('/dashboards/{dashboard}', [AnalyticsDashboardController::class, 'update'])->name('dashboards.update');
        Route::middleware(['permission:analytics.dashboards.delete'])->delete('/dashboards/{dashboard}', [AnalyticsDashboardController::class, 'destroy'])->name('dashboards.destroy');

        // KPI routes
        Route::middleware(['permission:analytics.kpi.view'])->group(function () {
            Route::get('/kpi', [KPIController::class, 'index'])->name('kpi.index');
            Route::get('/kpi/create', [KPIController::class, 'create'])->name('kpi.create');
            Route::get('/kpi/{kpi}/edit', [KPIController::class, 'edit'])->name('kpi.edit');
            Route::get('/kpi/{kpi}', [KPIController::class, 'show'])->name('kpi.show');
        });

        Route::middleware(['permission:analytics.kpi.create'])->post('/kpi', [KPIController::class, 'store'])->name('kpi.store');
        Route::middleware(['permission:analytics.kpi.update'])->put('/kpi/{kpi}', [KPIController::class, 'update'])->name('kpi.update');
        Route::middleware(['permission:analytics.kpi.delete'])->delete('/kpi/{kpi}', [KPIController::class, 'destroy'])->name('kpi.destroy');
        Route::middleware(['permission:analytics.kpi.log'])->post('/kpi/{kpi}/log-value', [KPIController::class, 'logValue'])->name('kpi.log-value');
    });

    // ============================================================================
    // COMPLIANCE MODULE ROUTES
    // ============================================================================
    Route::prefix('compliance')->name('compliance.')->group(function () {
        // Documents
        Route::middleware(['permission:compliance.documents.view'])->group(function () {
            Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
            Route::get('/documents/create', [DocumentController::class, 'create'])->name('documents.create');
            Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
            Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])->name('documents.edit');
            Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
        });

        Route::middleware(['permission:compliance.documents.create'])->post('/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::middleware(['permission:compliance.documents.update'])->put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
        Route::middleware(['permission:compliance.documents.delete'])->delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

        // Audits
        Route::middleware(['permission:compliance.audits.view'])->group(function () {
            Route::get('/audits', [AuditController::class, 'index'])->name('audits.index');
            Route::get('/audits/create', [AuditController::class, 'create'])->name('audits.create');
            Route::get('/audits/{audit}', [AuditController::class, 'show'])->name('audits.show');
            Route::get('/audits/{audit}/edit', [AuditController::class, 'edit'])->name('audits.edit');
        });

        Route::middleware(['permission:compliance.audits.create'])->post('/audits', [AuditController::class, 'store'])->name('audits.store');
        Route::middleware(['permission:compliance.audits.update'])->group(function () {
            Route::put('/audits/{audit}', [AuditController::class, 'update'])->name('audits.update');
            Route::post('/audits/{audit}/findings', [AuditController::class, 'storeFinding'])->name('audits.findings.store');
            Route::put('/findings/{finding}', [AuditController::class, 'updateFinding'])->name('findings.update');
            Route::delete('/findings/{finding}', [AuditController::class, 'destroyFinding'])->name('findings.destroy');
        });
        Route::middleware(['permission:compliance.audits.delete'])->delete('/audits/{audit}', [AuditController::class, 'destroy'])->name('audits.destroy');
     });

    // ============================================================================
    // PROJECT MANAGEMENT MODULE ROUTES
    // ============================================================================
    Route::prefix('project-management')->name('project-management.')->group(function () {
        // Dashboard
        Route::middleware(['permission:project-management.dashboard.view'])->get('/dashboard', [ProjectController::class, 'dashboard'])->name('dashboard');

        // Global Views (All items across all projects)
        Route::middleware(['permission:project-management.tasks.view'])->get('/tasks', [PMTaskController::class, 'globalIndex'])->name('tasks.global');
        Route::middleware(['permission:project-management.milestones.view'])->get('/milestones', [MilestoneController::class, 'globalIndex'])->name('milestones.global');
        Route::middleware(['permission:project-management.issues.view'])->get('/issues', [IssueController::class, 'globalIndex'])->name('issues.global');
        Route::middleware(['permission:project-management.resources.view'])->get('/resources', [ResourceController::class, 'globalIndex'])->name('resources.global');

        // Projects
        Route::middleware(['permission:project-management.projects.view'])->group(function () {
            Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
            Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
            Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
            Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
        });

        Route::middleware(['permission:project-management.projects.create'])->post('/projects', [ProjectController::class, 'store'])->name('projects.store');
        Route::middleware(['permission:project-management.projects.update'])->put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
        Route::middleware(['permission:project-management.projects.delete'])->delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

        // Project Milestones
        Route::middleware(['permission:project-management.milestones.view'])->group(function () {
            Route::get('/projects/{project}/milestones', [MilestoneController::class, 'index'])->name('milestones.index');
            Route::get('/projects/{project}/milestones/create', [MilestoneController::class, 'create'])->name('milestones.create');
            Route::get('/projects/{project}/milestones/{milestone}/edit', [MilestoneController::class, 'edit'])->name('milestones.edit');
        });

        Route::middleware(['permission:project-management.milestones.create'])->post('/projects/{project}/milestones', [MilestoneController::class, 'store'])->name('milestones.store');
        Route::middleware(['permission:project-management.milestones.update'])->put('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'update'])->name('milestones.update');
        Route::middleware(['permission:project-management.milestones.delete'])->delete('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'destroy'])->name('milestones.destroy');

        // Project Tasks
        Route::middleware(['permission:project-management.tasks.view'])->group(function () {
            Route::get('/projects/{project}/tasks', [PMTaskController::class, 'index'])->name('tasks.index');
            Route::get('/projects/{project}/tasks/create', [PMTaskController::class, 'create'])->name('tasks.create');
            Route::get('/projects/{project}/tasks/{task}/edit', [PMTaskController::class, 'edit'])->name('tasks.edit');
            Route::get('/projects/{project}/tasks/{task}', [PMTaskController::class, 'show'])->name('tasks.show');
        });

        Route::middleware(['permission:project-management.tasks.create'])->post('/projects/{project}/tasks', [PMTaskController::class, 'store'])->name('tasks.store');
        Route::middleware(['permission:project-management.tasks.update'])->put('/projects/{project}/tasks/{task}', [PMTaskController::class, 'update'])->name('tasks.update');
        Route::middleware(['permission:project-management.tasks.delete'])->delete('/projects/{project}/tasks/{task}', [PMTaskController::class, 'destroy'])->name('tasks.destroy');
        Route::middleware(['permission:project-management.tasks.assign'])->post('/projects/{project}/tasks/{task}/assign', [PMTaskController::class, 'assign'])->name('tasks.assign');

        // Project Issues
        Route::middleware(['permission:project-management.issues.view'])->group(function () {
            Route::get('/projects/{project}/issues', [IssueController::class, 'index'])->name('issues.index');
            Route::get('/projects/{project}/issues/create', [IssueController::class, 'create'])->name('issues.create');
            Route::get('/projects/{project}/issues/{issue}/edit', [IssueController::class, 'edit'])->name('issues.edit');
            Route::get('/projects/{project}/issues/{issue}', [IssueController::class, 'show'])->name('issues.show');
        });

        Route::middleware(['permission:project-management.issues.create'])->post('/projects/{project}/issues', [IssueController::class, 'store'])->name('issues.store');
        Route::middleware(['permission:project-management.issues.update'])->put('/projects/{project}/issues/{issue}', [IssueController::class, 'update'])->name('issues.update');
        Route::middleware(['permission:project-management.issues.delete'])->delete('/projects/{project}/issues/{issue}', [IssueController::class, 'destroy'])->name('issues.destroy');

        // Project Resources
        Route::middleware(['permission:project-management.resources.view'])->get('/projects/{project}/resources', [ResourceController::class, 'index'])->name('resources.index');
        Route::middleware(['permission:project-management.resources.assign'])->post('/projects/{project}/resources', [ResourceController::class, 'store'])->name('resources.store');
        Route::middleware(['permission:project-management.resources.assign'])->put('/projects/{project}/resources/{resource}', [ResourceController::class, 'update'])->name('resources.update');
        Route::middleware(['permission:project-management.resources.assign'])->delete('/projects/{project}/resources/{resource}', [ResourceController::class, 'destroy'])->name('resources.destroy');

        // Time Tracking
        Route::middleware(['permission:project-management.time-tracking.view'])->group(function () {
            Route::get('/time-tracking', [TimeTrackingController::class, 'index'])->name('time-tracking.index');
            Route::get('/time-tracking/create', [TimeTrackingController::class, 'create'])->name('time-tracking.create');
            Route::get('/time-tracking/{timeEntry}/edit', [TimeTrackingController::class, 'edit'])->name('time-tracking.edit');
            Route::get('/time-tracking/{timeEntry}', [TimeTrackingController::class, 'show'])->name('time-tracking.show');
            Route::get('/time-tracking/reports', [TimeTrackingController::class, 'reports'])->name('time-tracking.reports');
        });

        Route::middleware(['permission:project-management.time-tracking.create'])->post('/time-tracking', [TimeTrackingController::class, 'store'])->name('time-tracking.store');
        Route::middleware(['permission:project-management.time-tracking.update'])->put('/time-tracking/{timeEntry}', [TimeTrackingController::class, 'update'])->name('time-tracking.update');
        Route::middleware(['permission:project-management.time-tracking.delete'])->delete('/time-tracking/{timeEntry}', [TimeTrackingController::class, 'destroy'])->name('time-tracking.destroy');
        Route::middleware(['permission:project-management.time-tracking.approve'])->post('/time-tracking/{timeEntry}/approve', [TimeTrackingController::class, 'approve'])->name('time-tracking.approve');
        Route::middleware(['permission:project-management.time-tracking.approve'])->post('/time-tracking/{timeEntry}/unapprove', [TimeTrackingController::class, 'unapprove'])->name('time-tracking.unapprove');
        Route::middleware(['permission:project-management.time-tracking.approve'])->post('/time-tracking/bulk-approve', [TimeTrackingController::class, 'bulkApprove'])->name('time-tracking.bulk-approve');

        // Budget Management
        Route::middleware(['permission:project-management.budgets.view'])->group(function () {
            Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
            Route::get('/budgets/create', [BudgetController::class, 'create'])->name('budgets.create');
            Route::get('/budgets/{budget}/edit', [BudgetController::class, 'edit'])->name('budgets.edit');
            Route::get('/budgets/{budget}', [BudgetController::class, 'show'])->name('budgets.show');
        });

        Route::middleware(['permission:project-management.budgets.create'])->post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
        Route::middleware(['permission:project-management.budgets.update'])->put('/budgets/{budget}', [BudgetController::class, 'update'])->name('budgets.update');
        Route::middleware(['permission:project-management.budgets.delete'])->delete('/budgets/{budget}', [BudgetController::class, 'destroy'])->name('budgets.destroy');

        // Gantt Charts
        Route::middleware(['permission:project-management.gantt.view'])->group(function () {
            Route::get('/gantt', [GanttController::class, 'index'])->name('gantt.index');
            Route::get('/gantt/{project}', [GanttController::class, 'show'])->name('gantt.show');
            Route::get('/gantt/{project}/data', [GanttController::class, 'getData'])->name('gantt.data');
        });

        Route::middleware(['permission:project-management.gantt.update'])->post('/gantt/{project}/update', [GanttController::class, 'update'])->name('gantt.update');
    });

    // ============================================================================
    // QUALITY MODULE ROUTES
    // ============================================================================
    Route::prefix('quality')->name('quality.')->group(function () {
        // Quality Dashboard
        Route::middleware(['permission:quality.dashboard.view'])->get('/dashboard', [InspectionController::class, 'dashboard'])->name('dashboard');

        // Inspections
        Route::middleware(['permission:quality.inspections.view'])->group(function () {
            Route::get('/inspections', [InspectionController::class, 'index'])->name('inspections.index');
            Route::get('/inspections/create', [InspectionController::class, 'create'])->name('inspections.create');
            Route::get('/inspections/{inspection}', [InspectionController::class, 'show'])->name('inspections.show');
            Route::get('/inspections/{inspection}/edit', [InspectionController::class, 'edit'])->name('inspections.edit');
        });

        Route::middleware(['permission:quality.inspections.create'])->post('/inspections', [InspectionController::class, 'store'])->name('inspections.store');
        Route::middleware(['permission:quality.inspections.update'])->put('/inspections/{inspection}', [InspectionController::class, 'update'])->name('inspections.update');
        Route::middleware(['permission:quality.inspections.delete'])->delete('/inspections/{inspection}', [InspectionController::class, 'destroy'])->name('inspections.destroy');

        // Non-Conformance Reports (NCRs)
        Route::middleware(['permission:quality.ncr.view'])->group(function () {
            Route::get('/ncrs', [NCRController::class, 'index'])->name('ncrs.index');
            Route::get('/ncrs/create', [NCRController::class, 'create'])->name('ncrs.create');
            Route::get('/ncrs/{ncr}', [NCRController::class, 'show'])->name('ncrs.show');
            Route::get('/ncrs/{ncr}/edit', [NCRController::class, 'edit'])->name('ncrs.edit');
        });

        Route::middleware(['permission:quality.ncr.create'])->post('/ncrs', [NCRController::class, 'store'])->name('ncrs.store');
        Route::middleware(['permission:quality.ncr.update'])->put('/ncrs/{ncr}', [NCRController::class, 'update'])->name('ncrs.update');
        Route::middleware(['permission:quality.ncr.delete'])->delete('/ncrs/{ncr}', [NCRController::class, 'destroy'])->name('ncrs.destroy');

        // Calibrations
        Route::middleware(['permission:quality.calibrations.view'])->group(function () {
            Route::get('/calibrations', [CalibrationController::class, 'index'])->name('calibrations.index');
            Route::get('/calibrations/create', [CalibrationController::class, 'create'])->name('calibrations.create');
            Route::get('/calibrations/{calibration}', [CalibrationController::class, 'show'])->name('calibrations.show');
            Route::get('/calibrations/{calibration}/edit', [CalibrationController::class, 'edit'])->name('calibrations.edit');
        });

        Route::middleware(['permission:quality.calibrations.create'])->post('/calibrations', [CalibrationController::class, 'store'])->name('calibrations.store');
        Route::middleware(['permission:quality.calibrations.update'])->put('/calibrations/{calibration}', [CalibrationController::class, 'update'])->name('calibrations.update');
        Route::middleware(['permission:quality.calibrations.delete'])->delete('/calibrations/{calibration}', [CalibrationController::class, 'destroy'])->name('calibrations.destroy');
    });

    // ============================================================================
    // HR MODULE ROUTES
    // ============================================================================
    Route::prefix('hr')->name('hr.')->group(function () {
        // HR Dashboard
        Route::middleware(['permission:hr.dashboard.view'])->get('/dashboard', [PerformanceReviewController::class, 'dashboard'])->name('dashboard');

        // Performance Management
        Route::middleware(['permission:hr.performance.view'])->group(function () {
            Route::get('/performance', [PerformanceReviewController::class, 'index'])->name('performance.index');
            Route::get('/performance/create', [PerformanceReviewController::class, 'create'])->name('performance.create');
            Route::post('/performance', [PerformanceReviewController::class, 'store'])->name('performance.store');
            Route::get('/performance/{id}', [PerformanceReviewController::class, 'show'])->name('performance.show');
            Route::get('/performance/{id}/edit', [PerformanceReviewController::class, 'edit'])->name('performance.edit');
            Route::put('/performance/{id}', [PerformanceReviewController::class, 'update'])->name('performance.update');
            Route::delete('/performance/{id}', [PerformanceReviewController::class, 'destroy'])->name('performance.destroy');

            // Performance Templates
            Route::get('/performance/templates', [PerformanceReviewController::class, 'templates'])->name('performance.templates.index');
            Route::get('/performance/templates/create', [PerformanceReviewController::class, 'createTemplate'])->name('performance.templates.create');
            Route::post('/performance/templates', [PerformanceReviewController::class, 'storeTemplate'])->name('performance.templates.store');
            Route::get('/performance/templates/{id}', [PerformanceReviewController::class, 'showTemplate'])->name('performance.templates.show');
            Route::get('/performance/templates/{id}/edit', [PerformanceReviewController::class, 'editTemplate'])->name('performance.templates.edit');
            Route::put('/performance/templates/{id}', [PerformanceReviewController::class, 'updateTemplate'])->name('performance.templates.update');
            Route::delete('/performance/templates/{id}', [PerformanceReviewController::class, 'destroyTemplate'])->name('performance.templates.destroy');
        });

        // Training Management
        Route::middleware(['permission:hr.training.view'])->group(function () {
            Route::get('/training', [TrainingController::class, 'index'])->name('training.index');
            Route::get('/training/create', [TrainingController::class, 'create'])->name('training.create');
            Route::post('/training', [TrainingController::class, 'store'])->name('training.store');
            Route::get('/training/{id}', [TrainingController::class, 'show'])->name('training.show');
            Route::get('/training/{id}/edit', [TrainingController::class, 'edit'])->name('training.edit');
            Route::put('/training/{id}', [TrainingController::class, 'update'])->name('training.update');
            Route::delete('/training/{id}', [TrainingController::class, 'destroy'])->name('training.destroy');

            // Training Categories
            Route::get('/training/categories', [TrainingController::class, 'categories'])->name('training.categories.index');
            Route::post('/training/categories', [TrainingController::class, 'storeCategory'])->name('training.categories.store');
            Route::put('/training/categories/{id}', [TrainingController::class, 'updateCategory'])->name('training.categories.update');
            Route::delete('/training/categories/{id}', [TrainingController::class, 'destroyCategory'])->name('training.categories.destroy');

            // Training Materials
            Route::get('/training/{id}/materials', [TrainingController::class, 'materials'])->name('training.materials.index');
            Route::post('/training/{id}/materials', [TrainingController::class, 'storeMaterial'])->name('training.materials.store');
            Route::put('/training/{id}/materials/{materialId}', [TrainingController::class, 'updateMaterial'])->name('training.materials.update');
            Route::delete('/training/{id}/materials/{materialId}', [TrainingController::class, 'destroyMaterial'])->name('training.materials.destroy');

            // Training Enrollment
            Route::get('/training/{id}/enrollments', [TrainingController::class, 'enrollments'])->name('training.enrollments.index');
            Route::post('/training/{id}/enrollments', [TrainingController::class, 'storeEnrollment'])->name('training.enrollments.store');
            Route::put('/training/{id}/enrollments/{enrollmentId}', [TrainingController::class, 'updateEnrollment'])->name('training.enrollments.update');
            Route::delete('/training/{id}/enrollments/{enrollmentId}', [TrainingController::class, 'destroyEnrollment'])->name('training.enrollments.destroy');
        });

        // Recruitment Management
        Route::middleware(['permission:hr.recruitment.view'])->group(function () {
            Route::get('/recruitment', [RecruitmentController::class, 'index'])->name('recruitment.index');
            Route::post('/recruitment', [RecruitmentController::class, 'store'])->name('recruitment.store');
            Route::get('/recruitment/{id}', [RecruitmentController::class, 'show'])->name('recruitment.show');
            Route::get('/recruitment/{id}/edit', [RecruitmentController::class, 'edit'])->name('recruitment.edit');
            Route::put('/recruitment/{id}', [RecruitmentController::class, 'update'])->name('recruitment.update');
            Route::delete('/recruitment/{id}', [RecruitmentController::class, 'destroy'])->name('recruitment.destroy');

            // AJAX API routes for modal operations
            Route::put('/recruitment/{id}/ajax', [RecruitmentController::class, 'updateAjax'])->name('recruitment.update.ajax');
            Route::post('/recruitment/ajax', [RecruitmentController::class, 'storeAjax'])->name('recruitment.store.ajax');

            // AJAX/Data Routes for SPA refreshes
            Route::get('/recruitment/data', [RecruitmentController::class, 'indexData'])->name('recruitment.data.index');
            Route::get('/recruitment/{id}/data', [RecruitmentController::class, 'showData'])->name('recruitment.data.show');
            Route::get('/recruitment/{id}/applications/data', [RecruitmentController::class, 'applicationsData'])->name('recruitment.data.applications');

            // Job status management
            Route::post('/recruitment/{id}/publish', [RecruitmentController::class, 'publish'])->name('recruitment.publish');
            Route::post('/recruitment/{id}/unpublish', [RecruitmentController::class, 'unpublish'])->name('recruitment.unpublish');
            Route::post('/recruitment/{id}/close', [RecruitmentController::class, 'close'])->name('recruitment.close');

            // Statistics and Reports
            Route::get('/recruitment/statistics', [RecruitmentController::class, 'getStatistics'])->name('recruitment.statistics');
            Route::get('/recruitment/{id}/report', [RecruitmentController::class, 'generateJobReport'])->name('recruitment.report');
            Route::get('/recruitment/{id}/applications/export', [RecruitmentController::class, 'exportApplications'])->name('recruitment.applications.export');
        });

        // Onboarding Management
        Route::middleware(['permission:hr.onboarding.view'])->group(function () {
            Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding.index');
            Route::get('/onboarding/create', [OnboardingController::class, 'create'])->name('onboarding.create');
            Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
            Route::get('/onboarding/{id}', [OnboardingController::class, 'show'])->name('onboarding.show');
            Route::get('/onboarding/{id}/edit', [OnboardingController::class, 'edit'])->name('onboarding.edit');
            Route::put('/onboarding/{id}', [OnboardingController::class, 'update'])->name('onboarding.update');
            Route::delete('/onboarding/{id}', [OnboardingController::class, 'destroy'])->name('onboarding.destroy');
        });

        // Skills Management
        Route::middleware(['permission:hr.skills.view'])->group(function () {
            Route::get('/skills', [SkillsController::class, 'index'])->name('skills.index');
            Route::get('/skills/create', [SkillsController::class, 'create'])->name('skills.create');
            Route::post('/skills', [SkillsController::class, 'store'])->name('skills.store');
            Route::get('/skills/{id}', [SkillsController::class, 'show'])->name('skills.show');
            Route::get('/skills/{id}/edit', [SkillsController::class, 'edit'])->name('skills.edit');
            Route::put('/skills/{id}', [SkillsController::class, 'update'])->name('skills.update');
            Route::delete('/skills/{id}', [SkillsController::class, 'destroy'])->name('skills.destroy');
        });

        // Benefits Management
        Route::middleware(['permission:hr.benefits.view'])->group(function () {
            Route::get('/benefits', [BenefitsController::class, 'index'])->name('benefits.index');
            Route::get('/benefits/create', [BenefitsController::class, 'create'])->name('benefits.create');
            Route::post('/benefits', [BenefitsController::class, 'store'])->name('benefits.store');
            Route::get('/benefits/{id}', [BenefitsController::class, 'show'])->name('benefits.show');
            Route::get('/benefits/{id}/edit', [BenefitsController::class, 'edit'])->name('benefits.edit');
            Route::put('/benefits/{id}', [BenefitsController::class, 'update'])->name('benefits.update');
            Route::delete('/benefits/{id}', [BenefitsController::class, 'destroy'])->name('benefits.destroy');
        });

        // Time Off Management
        Route::middleware(['permission:hr.time-off.view'])->group(function () {
            Route::get('/time-off', [TimeOffController::class, 'index'])->name('time-off.index');
            Route::get('/time-off/create', [TimeOffController::class, 'create'])->name('time-off.create');
            Route::post('/time-off', [TimeOffController::class, 'store'])->name('time-off.store');
            Route::get('/time-off/{id}', [TimeOffController::class, 'show'])->name('time-off.show');
            Route::get('/time-off/{id}/edit', [TimeOffController::class, 'edit'])->name('time-off.edit');
            Route::put('/time-off/{id}', [TimeOffController::class, 'update'])->name('time-off.update');
            Route::delete('/time-off/{id}', [TimeOffController::class, 'destroy'])->name('time-off.destroy');
        });

        // Workplace Safety
        Route::middleware(['permission:hr.safety.view'])->group(function () {
            Route::get('/safety', [WorkplaceSafetyController::class, 'index'])->name('safety.index');
            Route::get('/safety/create', [WorkplaceSafetyController::class, 'create'])->name('safety.create');
            Route::post('/safety', [WorkplaceSafetyController::class, 'store'])->name('safety.store');
            Route::get('/safety/{id}', [WorkplaceSafetyController::class, 'show'])->name('safety.show');
            Route::get('/safety/{id}/edit', [WorkplaceSafetyController::class, 'edit'])->name('safety.edit');
            Route::put('/safety/{id}', [WorkplaceSafetyController::class, 'update'])->name('safety.update');
            Route::delete('/safety/{id}', [WorkplaceSafetyController::class, 'destroy'])->name('safety.destroy');
        });

        // HR Analytics
        Route::middleware(['permission:hr.analytics.view'])->group(function () {
            Route::get('/analytics', [HrAnalyticsController::class, 'index'])->name('analytics.index');
            Route::get('/analytics/reports', [HrAnalyticsController::class, 'reports'])->name('analytics.reports');
            Route::get('/analytics/export', [HrAnalyticsController::class, 'export'])->name('analytics.export');
        });

        // HR Documents
        Route::middleware(['permission:hr.documents.view'])->group(function () {
            Route::get('/documents', [HrDocumentController::class, 'index'])->name('documents.index');
            Route::get('/documents/create', [HrDocumentController::class, 'create'])->name('documents.create');
            Route::post('/documents', [HrDocumentController::class, 'store'])->name('documents.store');
            Route::get('/documents/{id}', [HrDocumentController::class, 'show'])->name('documents.show');
            Route::get('/documents/{id}/edit', [HrDocumentController::class, 'edit'])->name('documents.edit');
            Route::put('/documents/{id}', [HrDocumentController::class, 'update'])->name('documents.update');
            Route::delete('/documents/{id}', [HrDocumentController::class, 'destroy'])->name('documents.destroy');
        });

        // Employee Self Service
        Route::middleware(['permission:hr.self-service.view'])->group(function () {
            Route::get('/self-service', [EmployeeSelfServiceController::class, 'index'])->name('self-service.index');
            Route::get('/self-service/profile', [EmployeeSelfServiceController::class, 'profile'])->name('self-service.profile');
            Route::put('/self-service/profile', [EmployeeSelfServiceController::class, 'updateProfile'])->name('self-service.profile.update');
        });

        // Payroll Management
        Route::middleware(['permission:hr.payroll.view'])->group(function () {
            Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
            Route::get('/payroll/create', [PayrollController::class, 'create'])->name('payroll.create');
            Route::post('/payroll', [PayrollController::class, 'store'])->name('payroll.store');
            Route::get('/payroll/{id}', [PayrollController::class, 'show'])->name('payroll.show');
            Route::get('/payroll/{id}/edit', [PayrollController::class, 'edit'])->name('payroll.edit');
            Route::put('/payroll/{id}', [PayrollController::class, 'update'])->name('payroll.update');
            Route::delete('/payroll/{id}', [PayrollController::class, 'destroy'])->name('payroll.destroy');
        });
    });

    Route::post('/update-fcm-token', [UserController::class, 'updateFcmToken'])->name('updateFcmToken');

    // ============================================================================
    // UTILITY API ROUTES
    // ============================================================================
    Route::get('/api/designations/list', function () {
        return response()->json(\App\Models\HRM\Designation::select('id', 'title as name')->get());
    })->name('api.designations.list');

    Route::get('/api/departments/list', function () {
        return response()->json(\App\Models\HRM\Department::select('id', 'name')->get());
    })->name('api.departments.list');

    Route::get('/api/users/managers/list', function () {
        return response()->json(\App\Models\User::whereHas('roles', function ($query) {
            $query->whereIn('name', [
                'Super Administrator',
                'Administrator',
                'HR Manager',
                'Project Manager',
                'Department Manager',
                'Team Lead'
            ]);
        })
            ->select('id', 'name')
            ->get());
    })->name('api.users.managers.list');