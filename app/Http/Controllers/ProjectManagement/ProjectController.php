<?php

namespace App\Http\Controllers\ProjectManagement;

use App\Http\Controllers\Controller;
use App\Models\HRM\Department;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('ProjectManagement/Projects/Index', [
            'projects' => Project::with(['projectLeader', 'teamLeader', 'department'])
                ->latest()
                ->paginate(10),
            'status' => session('status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('ProjectManagement/Projects/Create', [
            'departments' => Department::all(),
            'users' => User::all(['id', 'name']),
            'statusOptions' => [
                ['id' => 'not_started', 'name' => 'Not Started'],
                ['id' => 'in_progress', 'name' => 'In Progress'],
                ['id' => 'on_hold', 'name' => 'On Hold'],
                ['id' => 'completed', 'name' => 'Completed'],
                ['id' => 'cancelled', 'name' => 'Cancelled'],
            ],
            'priorityOptions' => [
                ['id' => 'low', 'name' => 'Low'],
                ['id' => 'medium', 'name' => 'Medium'],
                ['id' => 'high', 'name' => 'High'],
                ['id' => 'critical', 'name' => 'Critical'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_name' => 'required|string|max:255',
            'client_id' => 'nullable|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'rate' => 'nullable|numeric',
            'rate_type' => 'nullable|string',
            'priority' => 'required|string',
            'project_leader_id' => 'required|exists:users,id',
            'team_leader_id' => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'required|string',
            'files' => 'nullable|array',
            'color' => 'nullable|string',
        ]);

        $project = Project::create($validated);

        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $project->addMedia($file)->toMediaCollection('project-files');
            }
        }

        return redirect()->route('project-management.projects.index')->with('status', 'Project created successfully');
    }

    public function show(Project $project)
    {
        $project->load(['projectLeader', 'teamLeader', 'department', 'milestones', 'resources.user']);

        return Inertia::render('ProjectManagement/Projects/Show', [
            'project' => $project,
            'statusOptions' => [
                ['id' => 'not_started', 'name' => 'Not Started'],
                ['id' => 'in_progress', 'name' => 'In Progress'],
                ['id' => 'on_hold', 'name' => 'On Hold'],
                ['id' => 'completed', 'name' => 'Completed'],
                ['id' => 'cancelled', 'name' => 'Cancelled'],
            ],
            'priorityOptions' => [
                ['id' => 'low', 'name' => 'Low'],
                ['id' => 'medium', 'name' => 'Medium'],
                ['id' => 'high', 'name' => 'High'],
                ['id' => 'critical', 'name' => 'Critical'],
            ],
        ]);
    }

    public function edit(Project $project)
    {
        return Inertia::render('ProjectManagement/Projects/Edit', [
            'project' => $project,
            'departments' => Department::all(),
            'users' => User::all(['id', 'name']),
            'statusOptions' => [
                ['id' => 'not_started', 'name' => 'Not Started'],
                ['id' => 'in_progress', 'name' => 'In Progress'],
                ['id' => 'on_hold', 'name' => 'On Hold'],
                ['id' => 'completed', 'name' => 'Completed'],
                ['id' => 'cancelled', 'name' => 'Cancelled'],
            ],
            'priorityOptions' => [
                ['id' => 'low', 'name' => 'Low'],
                ['id' => 'medium', 'name' => 'Medium'],
                ['id' => 'high', 'name' => 'High'],
                ['id' => 'critical', 'name' => 'Critical'],
            ],
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'project_name' => 'required|string|max:255',
            'client_id' => 'nullable|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'rate' => 'nullable|numeric',
            'rate_type' => 'nullable|string',
            'priority' => 'required|string',
            'project_leader_id' => 'required|exists:users,id',
            'team_leader_id' => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'required|string',
            'color' => 'nullable|string',
        ]);

        $project->update($validated);

        // Handle file uploads
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $project->addMedia($file)->toMediaCollection('project-files');
            }
        }

        return redirect()->route('project-management.projects.index')->with('status', 'Project updated successfully');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('project-management.projects.index')->with('status', 'Project deleted successfully');
    }

    public function dashboard()
    {
        $projects = Project::with(['projectLeader', 'teamLeader'])
            ->latest()
            ->get();

        $projectsByStatus = $projects->groupBy('status')->map->count();
        $projectsByPriority = $projects->groupBy('priority')->map->count();

        return Inertia::render('ProjectManagement/Dashboard', [
            'projects' => $projects->take(5),
            'projectStats' => [
                'total' => $projects->count(),
                'in_progress' => $projects->where('status', 'in_progress')->count(),
                'completed' => $projects->where('status', 'completed')->count(),
                'overdue' => $projects->where('end_date', '<', now())->where('status', '!=', 'completed')->count(),
            ],
            'projectsByStatus' => $projectsByStatus,
            'projectsByPriority' => $projectsByPriority,
        ]);
    }
}
