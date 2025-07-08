<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Onboarding;
use App\Models\OnboardingTask;
use App\Models\Offboarding;
use App\Models\OffboardingTask;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OnboardingController extends Controller
{
    /**
     * Display a listing of onboarding processes.
     */
    public function index()
    {
        $this->authorize('viewAny', Onboarding::class);
        
        $onboardings = Onboarding::with('employee')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return Inertia::render('HR/Onboarding/Index', [
            'title' => 'Employee Onboarding',
            'onboardings' => $onboardings
        ]);
    }
    
    /**
     * Show the form for creating a new onboarding process.
     */
    public function create()
    {
        $this->authorize('create', Onboarding::class);
        
        $employees = User::select('id', 'name')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
            
        return Inertia::render('HR/Onboarding/Create', [
            'title' => 'Create Onboarding Process',
            'employees' => $employees
        ]);
    }
    
    /**
     * Store a newly created onboarding process.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Onboarding::class);
        
        $validated = $request->validate([
            'employee_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'expected_completion_date' => 'required|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
            'tasks' => 'array',
            'tasks.*.task' => 'required|string',
            'tasks.*.description' => 'nullable|string',
            'tasks.*.due_date' => 'nullable|date',
            'tasks.*.assigned_to' => 'nullable|exists:users,id',
        ]);
        
        DB::beginTransaction();
        
        try {
            $onboarding = Onboarding::create([
                'employee_id' => $validated['employee_id'],
                'start_date' => $validated['start_date'],
                'expected_completion_date' => $validated['expected_completion_date'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);
            
            if (isset($validated['tasks']) && count($validated['tasks']) > 0) {
                foreach ($validated['tasks'] as $taskData) {
                    OnboardingTask::create([
                        'onboarding_id' => $onboarding->id,
                        'task' => $taskData['task'],
                        'description' => $taskData['description'] ?? null,
                        'due_date' => $taskData['due_date'] ?? null,
                        'assigned_to' => $taskData['assigned_to'] ?? null,
                        'status' => 'pending',
                    ]);
                }
            }
            
            DB::commit();
            
            return redirect()->route('hr.onboarding.show', $onboarding->id)
                ->with('success', 'Onboarding process created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create onboarding process: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Failed to create onboarding process. Please try again.')
                ->withInput();
        }
    }
    
    /**
     * Display the specified onboarding process.
     */
    public function show($id)
    {
        $onboarding = Onboarding::with(['employee', 'tasks.assignee'])
            ->findOrFail($id);
            
        $this->authorize('view', $onboarding);
        
        return Inertia::render('HR/Onboarding/Show', [
            'title' => 'Onboarding Details',
            'onboarding' => $onboarding
        ]);
    }
    
    /**
     * Show the form for editing the specified onboarding process.
     */
    public function edit($id)
    {
        $onboarding = Onboarding::with(['employee', 'tasks'])
            ->findOrFail($id);
            
        $this->authorize('update', $onboarding);
        
        $employees = User::select('id', 'name')
            ->orderBy('name')
            ->get();
            
        $assignees = User::select('id', 'name')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
            
        return Inertia::render('HR/Onboarding/Edit', [
            'title' => 'Edit Onboarding Process',
            'onboarding' => $onboarding,
            'employees' => $employees,
            'assignees' => $assignees
        ]);
    }
    
    /**
     * Update the specified onboarding process.
     */
    public function update(Request $request, $id)
    {
        $onboarding = Onboarding::findOrFail($id);
        
        $this->authorize('update', $onboarding);
        
        $validated = $request->validate([
            'start_date' => 'required|date',
            'expected_completion_date' => 'required|date|after_or_equal:start_date',
            'actual_completion_date' => 'nullable|date',
            'status' => 'required|in:pending,in-progress,completed,cancelled',
            'notes' => 'nullable|string',
            'tasks' => 'array',
            'tasks.*.id' => 'nullable|exists:onboarding_tasks,id',
            'tasks.*.task' => 'required|string',
            'tasks.*.description' => 'nullable|string',
            'tasks.*.due_date' => 'nullable|date',
            'tasks.*.completed_date' => 'nullable|date',
            'tasks.*.status' => 'required|in:pending,in-progress,completed,not-applicable',
            'tasks.*.assigned_to' => 'nullable|exists:users,id',
            'tasks.*.notes' => 'nullable|string',
        ]);
        
        DB::beginTransaction();
        
        try {
            $onboarding->update([
                'start_date' => $validated['start_date'],
                'expected_completion_date' => $validated['expected_completion_date'],
                'actual_completion_date' => $validated['actual_completion_date'] ?? null,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
                'updated_by' => Auth::id(),
            ]);
            
            // Track existing task IDs to determine which ones to delete
            $existingTaskIds = $onboarding->tasks->pluck('id')->toArray();
            $updatedTaskIds = [];
            
            if (isset($validated['tasks']) && count($validated['tasks']) > 0) {
                foreach ($validated['tasks'] as $taskData) {
                    if (isset($taskData['id'])) {
                        // Update existing task
                        $task = OnboardingTask::findOrFail($taskData['id']);
                        $task->update([
                            'task' => $taskData['task'],
                            'description' => $taskData['description'] ?? null,
                            'due_date' => $taskData['due_date'] ?? null,
                            'completed_date' => $taskData['completed_date'] ?? null,
                            'status' => $taskData['status'],
                            'assigned_to' => $taskData['assigned_to'] ?? null,
                            'notes' => $taskData['notes'] ?? null,
                        ]);
                        $updatedTaskIds[] = $task->id;
                    } else {
                        // Create new task
                        $task = OnboardingTask::create([
                            'onboarding_id' => $onboarding->id,
                            'task' => $taskData['task'],
                            'description' => $taskData['description'] ?? null,
                            'due_date' => $taskData['due_date'] ?? null,
                            'completed_date' => $taskData['completed_date'] ?? null,
                            'status' => $taskData['status'],
                            'assigned_to' => $taskData['assigned_to'] ?? null,
                            'notes' => $taskData['notes'] ?? null,
                        ]);
                        $updatedTaskIds[] = $task->id;
                    }
                }
            }
            
            // Delete tasks that weren't updated
            $tasksToDelete = array_diff($existingTaskIds, $updatedTaskIds);
            if (!empty($tasksToDelete)) {
                OnboardingTask::whereIn('id', $tasksToDelete)->delete();
            }
            
            DB::commit();
            
            return redirect()->route('hr.onboarding.show', $onboarding->id)
                ->with('success', 'Onboarding process updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update onboarding process: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Failed to update onboarding process. Please try again.')
                ->withInput();
        }
    }
    
    /**
     * Remove the specified onboarding process.
     */
    public function destroy($id)
    {
        $onboarding = Onboarding::findOrFail($id);
        
        $this->authorize('delete', $onboarding);
        
        try {
            $onboarding->delete();
            
            return redirect()->route('hr.onboarding.index')
                ->with('success', 'Onboarding process deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete onboarding process: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Failed to delete onboarding process.');
        }
    }
    
    /**
     * Display a listing of offboarding processes.
     */
    public function offboardingIndex()
    {
        $this->authorize('viewAny', Offboarding::class);
        
        $offboardings = Offboarding::with('employee')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return Inertia::render('HR/Offboarding/Index', [
            'title' => 'Employee Offboarding',
            'offboardings' => $offboardings
        ]);
    }
    
    // Additional methods for offboarding would follow the same pattern as the onboarding methods above
    
    /**
     * Show checklist templates.
     */
    public function checklists()
    {
        // This would be implemented based on your checklist model structure
        return Inertia::render('HR/Checklists/Index', [
            'title' => 'Onboarding & Offboarding Checklists'
        ]);
    }
}
