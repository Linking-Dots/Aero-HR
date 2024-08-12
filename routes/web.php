<?php

use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LeaveSettingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Models\DailyWork;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DailySummaryController;
use App\Http\Controllers\JurisdictionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
use App\Http\Middleware\CheckRole;


Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        $user = Auth::user();
        $tasks = $user->hasRole('se')
            ? DailyWork::where('incharge', $user->user_name)->get()
            : ($user->hasRole('qci') || $user->hasRole('aqci')
                ? DailyWork::where('assigned', $user->user_name)->get()
                : DailyWork::all()
            );

        $total = $tasks->count();
        $completed = $tasks->where('status', 'completed')->count();
        $pending = $total - $completed;
        $rfi_submissions = $tasks->whereNotNull('rfi_submission_date')->count();

        $statistics = [
            'total' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'rfi_submissions' => $rfi_submissions
        ];
        return Inertia::render('Dashboard', [
            'title' => 'Dashboard',
            'user' => $user,
            'statistics' => $statistics,
            'status' => session('status')
        ]);
    })->name('dashboard');

    Route::get('/leaves-employee', [LeaveController::class, 'index'])->name('leaves-employee');
    Route::get('/attendance-employee', [AttendanceController::class, 'index'])->name('attendance-employee');

    //Employees Routes:
    Route::get('/employees', [UserController::class, 'index'])->name('employees');
    Route::get('/holidays', [HolidayController::class, 'index'])->name('holidays');
    Route::get('/leaves', [LeaveController::class, 'index'])->name('leaves');
    Route::get('/leave-settings', [LeaveSettingController::class, 'index'])->name('leave-settings');
    Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances');
    Route::get('/departments', [DepartmentController::class, 'index'])->name('departments');
    Route::get('/designations', [DesignationController::class, 'index'])->name('designations');
    Route::get('/timesheet', [AttendanceController::class, 'index'])->name('timesheet');
    Route::get('/jurisdiction', [JurisdictionController::class, 'index'])->name('jurisdiction');


    //Profile Routes:
    Route::get('/profile/{user}', [ProfileController::class, 'index'])->name('profile');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/delete', [ProfileController::class, 'delete'])->name('profile.delete');

    //Education Routes:
    Route::post('/education/update', [EducationController::class, 'update'])->name('education.update');
    Route::delete('/education/delete', [EducationController::class, 'delete'])->name('education.delete');



});


Route::middleware([CheckRole::class . ':admin','auth', 'verified'])->group(function () {

    // Routes accessible only to users with the 'admin' role
    Route::get('/tasks-all', [TaskController::class, 'allTasks'])->name('allTasks');
    Route::post('/tasks-filtered', [TaskController::class, 'filterTasks'])->name('filterTasks');
    Route::get('/tasks', [TaskController::class, 'tasks'])->name('tasks');
    Route::get('/settings', [TaskController::class, 'settings'])->name('settings');
    Route::post('/task/add', [TaskController::class, 'addTask'])->name('addTask');
    Route::get('/task/import', [TaskController::class, 'importTasks'])->name('importTasks');
    Route::get('/export-tasks', [TaskController::class, 'exportTasks'])->name('exportTasks');
    Route::post('/task/import', [TaskController::class, 'importCSV'])->name('importCSV');
    Route::post('/task/update-rfi-submission-date', [TaskController::class, 'updateRfiSubmissionDate'])->name('updateRfiSubmissionDate');
    Route::post('/task/update-completion-date-time', [TaskController::class, 'updateCompletionDateTime'])->name('updateCompletionDateTime');
    Route::get('/tasks/daily-summary', [DailySummaryController::class, 'showDailySummary','title' => 'Daily Summary'])->name('showDailySummary');
    Route::get('/tasks/daily-summary-get', [DailySummaryController::class, 'dailySummary'])->name('dailySummary');
    Route::post('/tasks/daily-summary-filtered', [DailySummaryController::class, 'filterSummary'])->name('filterSummary');
    Route::get('/tasks/daily-summary-export', [DailySummaryController::class, 'exportDailySummary'])->name('exportDailySummary');
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
    Route::get('/tasks/daily-summary-se', [DailySummaryController::class, 'showDailySummary','title' => 'Daily Summary'])->name('showDailySummarySE');
    Route::post('/tasks/daily-summary-filtered-se', [DailySummaryController::class, 'filterSummary'])->name('filterSummarySE');
    Route::get('/get-latest-timestamp', [TaskController::class, 'getLatestTimestamp'])->name('getLatestTimestamp');
    Route::get('/tasks/daily-summary-json', [DailySummaryController::class, 'dailySummary'])->name('dailySummaryJSON');



    Route::get('/reports', [ReportController::class, 'showReports'])->name('showReports');
    Route::get('/reports-json', [ReportController::class, 'allReports'])->name('allReports');
    Route::post('/reports/add', [ReportController::class, 'addReport'])->name('addReport');
    Route::post('/reports/delete', [ReportController::class, 'deleteReport'])->name('deleteReport');
    Route::post('/reports/update', [ReportController::class, 'updateReport'])->name('updateReport');

    Route::post('/tasks/attach-report', [TaskController::class, 'attachReport'])->name('attachReport');
    Route::post('/tasks/detach-report', [TaskController::class, 'detachReport'])->name('detachReport');

    Route::post('/punchin', [AttendanceController::class, 'punchIn'])->name('punchin');
    Route::post('/punchout', [AttendanceController::class, 'punchOut'])->name('punchout');
    Route::get('/attendance/locations-today', [AttendanceController::class, 'getUserLocationsForToday'])->name('getUserLocationsForToday');
    Route::get('/attendance/attendance-today', [AttendanceController::class, 'getCurrentUserPunch'])->name('getCurrentUserPunch');
    Route::get('/attendance/attendances-today', [AttendanceController::class, 'getAllUsersAttendanceForToday'])->name('getAllUsersAttendanceForToday');
});


require __DIR__.'/auth.php';
