<?php

use App\Http\Controllers\ProjectManagement\ProjectController;
use App\Http\Controllers\ProjectManagement\MilestoneController;
use App\Http\Controllers\ProjectManagement\TaskController;
use App\Http\Controllers\ProjectManagement\IssueController;
use App\Http\Controllers\ProjectManagement\ResourceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Project Management Routes
|--------------------------------------------------------------------------
|
| Here is where you can register project management routes for your application.
|
*/

Route::middleware(['auth', 'verified'])->prefix('project-management')->name('project-management.')->group(function () {
    // Dashboard
    Route::middleware(['permission:project-management.dashboard.view'])->get('/dashboard', [ProjectController::class, 'dashboard'])->name('dashboard');

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
        Route::get('/projects/{project}/tasks', [TaskController::class, 'index'])->name('tasks.index');
        Route::get('/projects/{project}/tasks/create', [TaskController::class, 'create'])->name('tasks.create');
        Route::get('/projects/{project}/tasks/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
        Route::get('/projects/{project}/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    });

    Route::middleware(['permission:project-management.tasks.create'])->post('/projects/{project}/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::middleware(['permission:project-management.tasks.update'])->put('/projects/{project}/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::middleware(['permission:project-management.tasks.delete'])->delete('/projects/{project}/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::middleware(['permission:project-management.tasks.assign'])->post('/projects/{project}/tasks/{task}/assign', [TaskController::class, 'assign'])->name('tasks.assign');

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
});
