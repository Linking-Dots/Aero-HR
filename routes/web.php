<?php

use App\Http\Controllers\AttendanceController;
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
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\LMSController;
use App\Http\Controllers\PicnicController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\Settings\AttendanceSettingController;
use App\Http\Controllers\Settings\CompanySettingController;
use App\Http\Controllers\Settings\LeaveSettingController;
use App\Http\Controllers\SystemMonitoringController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Include authentication routes
require __DIR__.'/auth.php';

Route::redirect('/', '/dashboard');

Route::get('/session-check', function () {
    return response()->json(['authenticated' => auth()->check()]);
});

Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

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

    // LMS Module routes (Learning Management System)
    Route::middleware(['permission:lms.view'])->prefix('lms')->group(function () {
        Route::get('/', [LMSController::class, 'index'])->name('lms.index');

        // Course Management
        Route::get('/courses', [LMSController::class, 'courses'])->name('lms.courses')->middleware('permission:lms.courses.view');
        Route::post('/courses', [LMSController::class, 'storeCourse'])->name('lms.courses.store')->middleware('permission:lms.courses.create');


        // Student Management
        Route::get('/students', [LMSController::class, 'students'])->name('lms.students')->middleware('permission:lms.students.view');
        Route::post('/students', [LMSController::class, 'storeStudent'])->name('lms.students.store')->middleware('permission:lms.students.create');
        Route::put('/students/{id}', [LMSController::class, 'updateStudent'])->name('lms.students.update')->middleware('permission:lms.students.update');
        Route::delete('/students/{id}', [LMSController::class, 'destroyStudent'])->name('lms.students.destroy')->middleware('permission:lms.students.delete');

        // Instructor Management
        Route::get('/instructors', [LMSController::class, 'instructors'])->name('lms.instructors')->middleware('permission:lms.instructors.view');
        Route::post('/instructors', [LMSController::class, 'storeInstructor'])->name('lms.instructors.store')->middleware('permission:lms.instructors.create');
        Route::put('/instructors/{id}', [LMSController::class, 'updateInstructor'])->name('lms.instructors.update')->middleware('permission:lms.instructors.update');
        Route::delete('/instructors/{id}', [LMSController::class, 'destroyInstructor'])->name('lms.instructors.destroy')->middleware('permission:lms.instructors.delete');

        // Assessment Management
        Route::get('/assessments', [LMSController::class, 'assessments'])->name('lms.assessments')->middleware('permission:lms.assessments.view');
        Route::post('/assessments', [LMSController::class, 'storeAssessment'])->name('lms.assessments.store')->middleware('permission:lms.assessments.create');


        // Certificate Management
        Route::get('/certificates', [LMSController::class, 'certificates'])->name('lms.certificates')->middleware('permission:lms.certificates.view');
        Route::post('/certificates', [LMSController::class, 'storeCertificate'])->name('lms.certificates.store')->middleware('permission:lms.certificates.create');
        Route::put('/certificates/{id}', [LMSController::class, 'updateCertificate'])->name('lms.certificates.update')->middleware('permission:lms.certificates.update');
        Route::delete('/certificates/{id}', [LMSController::class, 'destroyCertificate'])->name('lms.certificates.destroy')->middleware('permission:lms.certificates.delete');

        // Reports
        Route::get('/reports', [LMSController::class, 'reports'])->name('lms.reports')->middleware('permission:lms.reports.view');
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

// Include all module routes
require __DIR__ . '/modules.php';
require __DIR__ . '/compliance.php';
require __DIR__ . '/quality.php';
require __DIR__ . '/analytics.php';
require __DIR__ . '/project-management.php';
require __DIR__ . '/hr.php';
require __DIR__ . '/dms.php';

require __DIR__ . '/auth.php';