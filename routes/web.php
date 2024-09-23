<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DailyWorkController;
use App\Http\Controllers\DailyWorkSummaryController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\JurisdictionController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Settings\LeaveSettingController;
use App\Http\Controllers\Settings\CompanySettingController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Route;


Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/leaves-employee', [LeaveController::class, 'index1'])->name('leaves-employee');
    Route::post('/leave-add', [LeaveController::class, 'create'])->name('leave-add');
    Route::delete('/leave-delete', [LeaveController::class, 'delete'])->name('leave-delete');

    Route::get('/attendance-employee', [AttendanceController::class, 'index'])->name('attendance-employee');


    Route::get('/daily-works', [DailyWorkController::class, 'index'])->name('dailyWorks');
    Route::get('/daily-works-paginate', [DailyWorkController::class, 'paginate'])->name('dailyWorks.paginate');
    Route::get('/daily-works-summary', [DailyWorkSummaryController::class, 'index'])->name('dailyWorkSummary');
    Route::post('/update-daily-work', [DailyWorkController::class, 'update'])->name('dailyWorks.update');


    //Employees Routes:

    Route::get('/holidays', [HolidayController::class, 'index'])->name('holidays');
    Route::post('/holiday-add', [HolidayController::class, 'create'])->name('holiday-add');
    Route::delete('/holiday-delete', [HolidayController::class, 'delete'])->name('holiday-delete');



    Route::post('/punchIn', [AttendanceController::class, 'punchIn'])->name('punchIn');
    Route::post('/punchOut', [AttendanceController::class, 'punchOut'])->name('punchOut');


    //Profile Routes:
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


Route::middleware([CheckRole::class . ':Administrator','auth', 'verified'])->group(function () {

    Route::get('/leaves', [LeaveController::class, 'index2'])->name('leaves');
    Route::post('/add-leave-type', [LeaveSettingController::class, 'store'])->name('add-leave-type');
    Route::put('/update-leave-type/{id}', [LeaveSettingController::class, 'update'])->name('update-leave-type');
    Route::delete('/delete-leave-type/{id}', [LeaveSettingController::class, 'destroy'])->name('delete-leave-type');
    Route::get('/leave-settings', [LeaveSettingController::class, 'index'])->name('leave-settings');

    Route::get('/employees', [UserController::class, 'index1'])->name('employees');
    Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances');
    Route::get('/attendance/locations-today', [AttendanceController::class, 'getUserLocationsForToday'])->name('getUserLocationsForToday');
    Route::get('/departments', [DepartmentController::class, 'index'])->name('departments');
    Route::get('/designations', [DesignationController::class, 'index'])->name('designations');
    Route::get('/timesheet', [AttendanceController::class, 'index'])->name('timesheet');
    Route::get('/jurisdiction', [JurisdictionController::class, 'index'])->name('jurisdiction');


    Route::post('/import-daily-works/', [DailyWorkController::class, 'import'])->name('dailyWorks.import');
    Route::delete('/delete-daily-work', [DailyWorkController::class, 'delete'])->name('dailyWorks.delete');


    Route::get('/users', [UserController::class, 'index2'])->name('users');
    Route::post('/user/{id}/update-department', [DepartmentController::class, 'updateUserDepartment'])->name('user.updateDepartment');
    Route::post('/user/{id}/update-designation', [DesignationController::class, 'updateUserDesignation'])->name('user.updateDesignation');
    Route::post('/user/{id}/update-role', [UserController::class, 'updateUserRole'])->name('user.updateRole');
    Route::put('/user/toggle-status/{id}', [UserController::class, 'toggleStatus'])->name('user.toggleStatus');
    Route::post('/update-role-module', [RoleController::class, 'updateRoleModule'])->name('updateRoleModule');



    Route::put('/update-company-settings', [CompanySettingController::class, 'update'])->name('update-company-settings');
    Route::get('/company-settings', [CompanySettingController::class, 'index'])->name('company-settings');

    Route::get('/roles-permissions', [RoleController::class, 'getRolesAndPermissions'])->name('roles-settings');
    Route::post('/roles', [RoleController::class, 'storeRole']);
    Route::put('/roles/{id}', [RoleController::class, 'updateRole']);
    Route::delete('/roles/{id}', [RoleController::class, 'deleteRole']);











    // Routes accessible only to users with the 'admin' role
    Route::get('/tasks-all', [TaskController::class, 'allTasks'])->name('allTasks');
    Route::post('/tasks-filtered', [TaskController::class, 'filterTasks'])->name('filterTasks');

    Route::post('/task/add', [TaskController::class, 'addTask'])->name('addTask');

    Route::get('/export-tasks', [TaskController::class, 'exportTasks'])->name('exportTasks');
    Route::post('/task/import', [TaskController::class, 'importCSV'])->name('importCSV');
    Route::post('/task/update-rfi-submission-date', [TaskController::class, 'updateRfiSubmissionDate'])->name('updateRfiSubmissionDate');
    Route::post('/task/update-completion-date-time', [TaskController::class, 'updateCompletionDateTime'])->name('updateCompletionDateTime');
    Route::get('/tasks/daily-summary', [DailyWorkSummaryController::class, 'showDailySummary','title' => 'Daily Summary'])->name('showDailySummary');
    Route::get('/tasks/daily-summary-get', [DailyWorkSummaryController::class, 'dailySummary'])->name('dailySummary');
    Route::post('/tasks/daily-summary-filtered', [DailyWorkSummaryController::class, 'filterSummary'])->name('filterSummary');
    Route::get('/tasks/daily-summary-export', [DailyWorkSummaryController::class, 'exportDailySummary'])->name('exportDailySummary');
    Route::post('/task/incharge', [TaskController::class, 'assignIncharge'])->name('assignIncharge');


    Route::get('/team-members', [ProfileController::class, 'members'])->name('members');
    Route::post('/user/update-role', [ProfileController::class, 'updateUserRole'])->name('updateUserRole');
    Route::post('/user/update-incharge', [ProfileController::class, 'updateUserIncharge'])->name('updateUserIncharge');


    Route::get('/attendance-json', [AttendanceController::class, 'allAttendance'])->name('allAttendance');
    Route::post('/attendance-update', [AttendanceController::class, 'updateAttendance'])->name('updateAttendance');

    Route::get('/work-location', [JurisdictionController::class, 'showWorkLocations'])->name('showWorkLocations');
    Route::get('/work-location-json', [JurisdictionController::class, 'allWorkLocations'])->name('allWorkLocations');
    Route::post('/work-locations/add', [JurisdictionController::class, 'addWorkLocation'])->name('addWorkLocation');
    Route::post('/work-locations/delete', [JurisdictionController::class, 'deleteWorkLocation'])->name('deleteWorkLocation');
    Route::post('/work-locations/update', [JurisdictionController::class, 'updateWorkLocation'])->name('updateWorkLocation');
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
    Route::get('/tasks/daily-summary-se', [DailyWorkSummaryController::class, 'showDailySummary','title' => 'Daily Summary'])->name('showDailySummarySE');
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



    Route::get('/attendance/attendance-today', [AttendanceController::class, 'getCurrentUserPunch'])->name('getCurrentUserPunch');
    Route::get('/get-all-users-attendance-for-date', [AttendanceController::class, 'getAllUsersAttendanceForDate'])->name('getAllUsersAttendanceForDate');
});


require __DIR__.'/auth.php';
