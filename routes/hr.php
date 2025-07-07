<?php

use App\Http\Controllers\HR\PerformanceReviewController;
use App\Http\Controllers\HR\TrainingController;
use App\Http\Controllers\HR\RecruitmentController;
use Illuminate\Support\Facades\Route;

// Human Resources Module Routes
Route::middleware(['auth', 'verified'])->prefix('hr')->name('hr.')->group(function () {
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
        Route::get('/recruitment/create', [RecruitmentController::class, 'create'])->name('recruitment.create');
        Route::post('/recruitment', [RecruitmentController::class, 'store'])->name('recruitment.store');
        Route::get('/recruitment/{id}', [RecruitmentController::class, 'show'])->name('recruitment.show');
        Route::get('/recruitment/{id}/edit', [RecruitmentController::class, 'edit'])->name('recruitment.edit');
        Route::put('/recruitment/{id}', [RecruitmentController::class, 'update'])->name('recruitment.update');
        Route::delete('/recruitment/{id}', [RecruitmentController::class, 'destroy'])->name('recruitment.destroy');

        // Job Applications
        Route::get('/recruitment/{id}/applications', [RecruitmentController::class, 'applications'])->name('recruitment.applications.index');
        Route::get('/recruitment/{id}/applications/create', [RecruitmentController::class, 'createApplication'])->name('recruitment.applications.create');
        Route::post('/recruitment/{id}/applications', [RecruitmentController::class, 'storeApplication'])->name('recruitment.applications.store');
        Route::get('/recruitment/{id}/applications/{applicationId}', [RecruitmentController::class, 'showApplication'])->name('recruitment.applications.show');
        Route::put('/recruitment/{id}/applications/{applicationId}', [RecruitmentController::class, 'updateApplication'])->name('recruitment.applications.update');
        Route::delete('/recruitment/{id}/applications/{applicationId}', [RecruitmentController::class, 'destroyApplication'])->name('recruitment.applications.destroy');

        // Interviews
        Route::get('/recruitment/{id}/applications/{applicationId}/interviews', [RecruitmentController::class, 'interviews'])->name('recruitment.interviews.index');
        Route::post('/recruitment/{id}/applications/{applicationId}/interviews', [RecruitmentController::class, 'storeInterview'])->name('recruitment.interviews.store');
        Route::put('/recruitment/{id}/applications/{applicationId}/interviews/{interviewId}', [RecruitmentController::class, 'updateInterview'])->name('recruitment.interviews.update');
        Route::delete('/recruitment/{id}/applications/{applicationId}/interviews/{interviewId}', [RecruitmentController::class, 'destroyInterview'])->name('recruitment.interviews.destroy');
    });
});
