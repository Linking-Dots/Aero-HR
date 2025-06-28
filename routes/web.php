<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DailyWorkController;
use App\Http\Controllers\DailyWorkSummaryController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\JurisdictionController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\PicnicController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Settings\LeaveSettingController;
use App\Http\Controllers\Settings\CompanySettingController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Settings\AttendanceSettingController;
use App\Http\Controllers\SystemMonitoringController;
use Illuminate\Support\Facades\Route;


Route::redirect('/', '/dashboard');

Route::get('/session-check', function () {
    return response()->json(['authenticated' => auth()->check()]);
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/picnic', [PicnicController::class, 'index'])->name('picnic');

    // Dashboard routes - require dashboard permission
    Route::middleware(['permission:dashboard.view'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/stats', [DashboardController::class, 'stats'])->name('stats');
    });

    // Updates route - require updates permission
    Route::middleware(['permission:updates.view'])->get('/updates', [DashboardController::class, 'updates'])->name('updates');

    // Employee self-service routes
    Route::middleware(['permission:leave.own.view'])->group(function () {
        Route::get('/leaves-employee', [LeaveController::class, 'index1'])->name('leaves-employee');
        Route::post('/leave-add', [LeaveController::class, 'create'])->name('leave-add');
        Route::post('/leave-update', [LeaveController::class, 'update'])->name('leave-update');
        Route::delete('/leave-delete', [LeaveController::class, 'delete'])->name('leave-delete');
        Route::get('/leaves-paginate', [LeaveController::class, 'paginate'])->name('leaves.paginate');
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
    });    // General access routes (available to all authenticated users)
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

    // Holiday routes
    Route::middleware(['permission:holidays.view'])->get('/holidays', [HolidayController::class, 'index'])->name('holidays');

    //Profile Routes - own profile access
    Route::middleware(['permission:profile.own.view'])->group(function () {
        Route::get('/profile/{user}', [ProfileController::class, 'index'])->name('profile');
        Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile/delete', [ProfileController::class, 'delete'])->name('profile.delete');

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

    // Leave settings routes
    Route::middleware(['permission:leave-settings.update'])->group(function () {
        Route::get('/leave-settings', [LeaveSettingController::class, 'index'])->name('leave-settings');
        Route::post('/add-leave-type', [LeaveSettingController::class, 'store'])->name('add-leave-type');
        Route::put('/update-leave-type/{id}', [LeaveSettingController::class, 'update'])->name('update-leave-type');
        Route::delete('/delete-leave-type/{id}', [LeaveSettingController::class, 'destroy'])->name('delete-leave-type');
    });

    // HR Management routes
    Route::middleware(['permission:employees.view'])->get('/employees', [UserController::class, 'index1'])->name('employees');
    Route::middleware(['permission:departments.view'])->get('/departments', [DepartmentController::class, 'index'])->name('departments');
    Route::middleware(['permission:designations.view'])->get('/designations', [DesignationController::class, 'index'])->name('designations');
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
        Route::post('/update-fcm-token', [UserController::class, 'updateFcmToken'])->name('updateFcmToken');
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
Route::middleware(['auth', 'verified', 'permission:roles.view'])->group(function () {
    // Role Management Interface
    Route::get('/admin/roles-management', [RoleController::class, 'index'])->name('admin.roles-management');
    Route::get('/admin/roles/audit', [RoleController::class, 'getEnhancedRoleAudit'])->name('admin.roles.audit');
    Route::get('/admin/roles/export', [RoleController::class, 'exportRoles'])->name('admin.roles.export');
    Route::get('/admin/roles/metrics', [RoleController::class, 'getRoleMetrics'])->name('admin.roles.metrics');
});

Route::middleware(['auth', 'verified', 'permission:roles.create'])->group(function () {
    Route::post('/admin/roles', [RoleController::class, 'storeRole'])->name('admin.roles.store');
    Route::post('/admin/roles/clone', [RoleController::class, 'cloneRole'])->name('admin.roles.clone');
});

Route::middleware(['auth', 'verified', 'permission:roles.update'])->group(function () {
    Route::put('/admin/roles/{id}', [RoleController::class, 'updateRole'])->name('admin.roles.update');
    Route::post('/admin/roles/update-permission', [RoleController::class, 'updateRolePermission'])->name('admin.roles.update-permission');
    Route::post('/admin/roles/update-module', [RoleController::class, 'updateRoleModule'])->name('admin.roles.update-module');
    Route::post('/admin/roles/bulk-operation', [RoleController::class, 'bulkOperation'])->name('admin.roles.bulk-operation');
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

// System Monitoring Routes (Super Administrator only)
Route::middleware(['auth', 'verified', 'role:Super Administrator'])->group(function () {
    Route::get('/admin/system-monitoring', [SystemMonitoringController::class, 'index'])->name('admin.system-monitoring');
    Route::post('/admin/errors/{errorId}/resolve', [SystemMonitoringController::class, 'resolveError'])->name('admin.errors.resolve');
    Route::get('/admin/system-report', [SystemMonitoringController::class, 'exportReport'])->name('admin.system-report');
    Route::get('/admin/optimization-report', [SystemMonitoringController::class, 'getOptimizationReport'])->name('admin.optimization-report');
});

Route::post('/user/{id}/update-attendance-type', [UserController::class, 'updateUserAttendanceType'])->name('user.updateAttendanceType');

require __DIR__ . '/auth.php';

Route::middleware(['security_headers'])->group(function () {
    // Your routes
});

Route::middleware(['enhanced_rate_limit:100,1'])->group(function () {
    // API routes that need rate limiting
});
