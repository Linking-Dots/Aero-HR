<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\JobHiringStage;
use App\Models\JobInterview;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RecruitmentController extends Controller
{
    /**
     * Display a listing of the jobs.
     */
    public function index(Request $request)
    {
        $jobs = Job::with(['department', 'hiringManager'])
            ->withCount('applications')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->department_id, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($request->job_type, function ($query, $jobType) {
                $query->where('type', $jobType);
            })
            ->orderBy($request->input('sort_by', 'posting_date'), $request->input('sort_order', 'desc'))
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('HR/Recruitment/Index', [
            'jobs' => $jobs,
            'filters' => $request->only(['search', 'status', 'department_id', 'job_type', 'sort_by', 'sort_order']),
            'departments' => Department::select('id', 'name')->get(),
            'jobTypes' => [
                ['id' => 'full_time', 'name' => 'Full Time'],
                ['id' => 'part_time', 'name' => 'Part Time'],
                ['id' => 'contract', 'name' => 'Contract'],
                ['id' => 'temporary', 'name' => 'Temporary'],
                ['id' => 'internship', 'name' => 'Internship'],
                ['id' => 'volunteer', 'name' => 'Volunteer'],
            ],
            'statuses' => [
                ['id' => 'draft', 'name' => 'Draft'],
                ['id' => 'open', 'name' => 'Open'],
                ['id' => 'closed', 'name' => 'Closed'],
                ['id' => 'on_hold', 'name' => 'On Hold'],
                ['id' => 'cancelled', 'name' => 'Cancelled'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new job.
     */
    public function create()
    {
        return Inertia::render('HR/Recruitment/Create', [
            'departments' => Department::all(['id', 'name']),
            'managers' => User::role(['HR Manager', 'Department Manager', 'Team Lead'])->get(['id', 'name']),
            'jobTypes' => [
                ['id' => 'full_time', 'name' => 'Full Time'],
                ['id' => 'part_time', 'name' => 'Part Time'],
                ['id' => 'contract', 'name' => 'Contract'],
                ['id' => 'temporary', 'name' => 'Temporary'],
                ['id' => 'internship', 'name' => 'Internship'],
                ['id' => 'volunteer', 'name' => 'Volunteer'],
            ],
            'currencies' => [
                'USD',
                'EUR',
                'GBP',
                'CAD',
                'AUD',
                'JPY',
                'INR',
                'CNY'
            ],
        ]);
    }

    /**
     * Store a newly created job in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'type' => 'required|string',
            'location' => 'nullable|string|max:255',
            'is_remote_allowed' => 'boolean',
            'description' => 'required|string',
            'responsibilities' => 'nullable|array',
            'requirements' => 'nullable|array',
            'qualifications' => 'nullable|array',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency' => 'required|string|max:10',
            'salary_visible' => 'boolean',
            'benefits' => 'nullable|array',
            'posting_date' => 'nullable|date',
            'closing_date' => 'nullable|date|after_or_equal:posting_date',
            'status' => 'required|in:draft,open,closed,on_hold,cancelled',
            'hiring_manager_id' => 'required|exists:users,id',
            'positions' => 'required|integer|min:1',
            'is_featured' => 'boolean',
        ]);

        // Set posting date to today if not provided and status is open
        if ($validated['status'] === 'open' && !isset($validated['posting_date'])) {
            $validated['posting_date'] = now();
        }

        $job = Job::create($validated);

        // Create default hiring stages
        $defaultStages = [
            ['name' => 'Application Review', 'sequence' => 1, 'is_active' => true, 'is_final' => false],
            ['name' => 'Phone Screening', 'sequence' => 2, 'is_active' => true, 'is_final' => false],
            ['name' => 'Technical Interview', 'sequence' => 3, 'is_active' => true, 'is_final' => false],
            ['name' => 'Final Interview', 'sequence' => 4, 'is_active' => true, 'is_final' => false],
            ['name' => 'Offer', 'sequence' => 5, 'is_active' => true, 'is_final' => false],
            ['name' => 'Hired', 'sequence' => 6, 'is_active' => true, 'is_final' => true],
        ];

        foreach ($defaultStages as $stage) {
            JobHiringStage::create([
                'job_id' => $job->id,
                'name' => $stage['name'],
                'description' => 'Default stage: ' . $stage['name'],
                'sequence' => $stage['sequence'],
                'is_active' => $stage['is_active'],
                'is_final' => $stage['is_final']
            ]);
        }

        return redirect()->route('hr.recruitment.show', $job->id)
            ->with('success', 'Job position created successfully.');
    }

    /**
     * Display the specified job.
     */
    public function show($id)
    {
        $job = Job::with([
            'department',
            'hiringManager',
            'hiringStages',
        ])->findOrFail($id);

        $applicationsByStage = [];
        $hiringStages = $job->hiringStages()->orderBy('sequence')->get();

        foreach ($hiringStages as $stage) {
            $applications = JobApplication::where('job_id', $job->id)
                ->where('current_stage_id', $stage->id)
                ->with('applicant')
                ->get();

            $applicationsByStage[$stage->id] = [
                'stage' => $stage,
                'applications' => $applications,
            ];
        }

        return Inertia::render('HR/Recruitment/Show', [
            'job' => $job,
            'hiringStages' => $hiringStages,
            'applicationsByStage' => $applicationsByStage,
            'totalApplications' => $job->applications()->count(),
            'isActive' => $job->isOpen(),
            'daysUntilClosing' => $job->daysUntilClosing(),
        ]);
    }

    /**
     * Show the form for editing the specified job.
     */
    public function edit($id)
    {
        $job = Job::with([
            'department',
            'hiringManager',
            'hiringStages' => function ($query) {
                $query->orderBy('sequence');
            },
        ])->findOrFail($id);

        return Inertia::render('HR/Recruitment/Edit', [
            'job' => $job,
            'departments' => Department::all(['id', 'name']),
            'managers' => User::role(['HR Manager', 'Department Manager', 'Team Lead'])->get(['id', 'name']),
            'jobTypes' => [
                ['id' => 'full_time', 'name' => 'Full Time'],
                ['id' => 'part_time', 'name' => 'Part Time'],
                ['id' => 'contract', 'name' => 'Contract'],
                ['id' => 'temporary', 'name' => 'Temporary'],
                ['id' => 'internship', 'name' => 'Internship'],
                ['id' => 'volunteer', 'name' => 'Volunteer'],
            ],
            'currencies' => [
                'USD',
                'EUR',
                'GBP',
                'CAD',
                'AUD',
                'JPY',
                'INR',
                'CNY'
            ],
        ]);
    }

    /**
     * Update the specified job in storage.
     */
    public function update(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'type' => 'required|string',
            'location' => 'nullable|string|max:255',
            'is_remote_allowed' => 'boolean',
            'description' => 'required|string',
            'responsibilities' => 'nullable|array',
            'requirements' => 'nullable|array',
            'qualifications' => 'nullable|array',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0|gte:salary_min',
            'salary_currency' => 'required|string|max:10',
            'salary_visible' => 'boolean',
            'benefits' => 'nullable|array',
            'posting_date' => 'nullable|date',
            'closing_date' => 'nullable|date|after_or_equal:posting_date',
            'status' => 'required|in:draft,open,closed,on_hold,cancelled',
            'hiring_manager_id' => 'required|exists:users,id',
            'positions' => 'required|integer|min:1',
            'is_featured' => 'boolean',
        ]);

        // If status changed from draft to open, set posting date to today if not provided
        if ($job->status === 'draft' && $validated['status'] === 'open' && !isset($validated['posting_date'])) {
            $validated['posting_date'] = now();
        }

        $job->update($validated);

        return redirect()->route('hr.recruitment.show', $job->id)
            ->with('success', 'Job position updated successfully.');
    }

    /**
     * Remove the specified job from storage.
     */
    public function destroy($id)
    {
        $job = Job::findOrFail($id);

        // Check if there are applications for this job
        if ($job->applications()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete job with existing applications.');
        }

        $job->delete();

        return redirect()->route('hr.recruitment.index')
            ->with('success', 'Job position deleted successfully.');
    }

    /**
     * Display a listing of applications for a job.
     */
    public function applications($id)
    {
        $job = Job::findOrFail($id);

        $applications = JobApplication::where('job_id', $id)
            ->with(['applicant', 'currentStage'])
            ->orderBy('applied_date', 'desc')
            ->paginate(15);

        $hiringStages = $job->hiringStages()->orderBy('order')->get();

        return Inertia::render('HR/Recruitment/Applications/Index', [
            'job' => $job,
            'applications' => $applications,
            'hiringStages' => $hiringStages,
            'statusOptions' => [
                ['id' => 'new', 'name' => 'New'],
                ['id' => 'in_review', 'name' => 'In Review'],
                ['id' => 'interview', 'name' => 'Interview'],
                ['id' => 'offer', 'name' => 'Offer'],
                ['id' => 'hired', 'name' => 'Hired'],
                ['id' => 'rejected', 'name' => 'Rejected'],
                ['id' => 'withdrawn', 'name' => 'Withdrawn'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new application.
     */
    public function createApplication($id)
    {
        $job = Job::with(['department', 'designation'])->findOrFail($id);

        // Check if the job is open for applications
        if (!$job->isOpen()) {
            return redirect()->route('hr.recruitment.show', $job->id)
                ->with('error', 'This job is not open for applications.');
        }

        return Inertia::render('HR/Recruitment/Applications/Create', [
            'job' => $job,
            'existingUsers' => User::select('id', 'name', 'email', 'phone')->get(),
            'sources' => [
                ['id' => 'internal', 'name' => 'Internal'],
                ['id' => 'referral', 'name' => 'Employee Referral'],
                ['id' => 'website', 'name' => 'Company Website'],
                ['id' => 'linkedin', 'name' => 'LinkedIn'],
                ['id' => 'indeed', 'name' => 'Indeed'],
                ['id' => 'glassdoor', 'name' => 'Glassdoor'],
                ['id' => 'job_board', 'name' => 'Job Board'],
                ['id' => 'university', 'name' => 'University/College'],
                ['id' => 'recruiting_agency', 'name' => 'Recruiting Agency'],
                ['id' => 'other', 'name' => 'Other'],
            ],
        ]);
    }

    /**
     * Store a newly created application in storage.
     */
    public function storeApplication(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        // Check if the job is open for applications
        if (!$job->isOpen()) {
            return redirect()->route('hr.recruitment.show', $job->id)
                ->with('error', 'This job is not open for applications.');
        }

        $validated = $request->validate([
            'applicant_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'cover_letter' => 'nullable|string',
            'source' => 'required|string',
            'referral_source' => 'nullable|string',
            'referrer_id' => 'nullable|exists:users,id',
            'expected_salary' => 'nullable|numeric|min:0',
            'notice_period' => 'nullable|integer|min:0',
            'experience_years' => 'nullable|numeric|min:0',
            'application_notes' => 'nullable|string',
        ]);

        // Get the first stage for this job
        $firstStage = $job->hiringStages()->orderBy('order')->first();
        if (!$firstStage) {
            return redirect()->route('hr.recruitment.show', $job->id)
                ->with('error', 'No hiring stages defined for this job.');
        }

        $validated['job_id'] = $job->id;
        $validated['status'] = 'new';
        $validated['current_stage_id'] = $firstStage->id;
        $validated['applied_date'] = now();
        $validated['last_status_change'] = now();
        $validated['application_ip'] = $request->ip();

        $application = JobApplication::create($validated);

        if ($request->hasFile('resume')) {
            $application->addMedia($request->file('resume'))->toMediaCollection('resumes');
        }

        return redirect()->route('hr.recruitment.applications.show', [$job->id, $application->id])
            ->with('success', 'Application submitted successfully.');
    }

    /**
     * Display the specified application.
     */
    public function showApplication($id, $applicationId)
    {
        $application = JobApplication::where('job_id', $id)
            ->with([
                'job',
                'applicant',
                'currentStage',
                'stageHistory.stage',
                'interviews' => function ($query) {
                    $query->orderBy('interview_date');
                }
            ])
            ->findOrFail($applicationId);

        $job = Job::with('hiringStages')->findOrFail($id);

        return Inertia::render('HR/Recruitment/Applications/Show', [
            'job' => $job,
            'application' => $application,
            'resume' => $application->getFirstMedia('resumes'),
            'hiringStages' => $job->hiringStages()->orderBy('order')->get(),
            'nextStage' => $application->currentStage ? $application->currentStage->nextStage() : null,
            'previousStage' => $application->currentStage ? $application->currentStage->previousStage() : null,
        ]);
    }

    /**
     * Update the specified application in storage.
     */
    public function updateApplication(Request $request, $id, $applicationId)
    {
        $application = JobApplication::where('job_id', $id)->findOrFail($applicationId);

        $validated = $request->validate([
            'status' => 'required|string',
            'rating' => 'nullable|numeric|min:1|max:5',
            'current_stage_id' => 'nullable|exists:job_hiring_stages,id',
            'application_notes' => 'nullable|string',
            'expected_salary' => 'nullable|numeric|min:0',
            'notice_period' => 'nullable|integer|min:0',
            'experience_years' => 'nullable|numeric|min:0',
        ]);

        // If stage is changing, create a stage history entry
        if (isset($validated['current_stage_id']) && $validated['current_stage_id'] != $application->current_stage_id) {
            $previousStageId = $application->current_stage_id;

            // Create stage history entry
            $application->stageHistory()->create([
                'stage_id' => $validated['current_stage_id'],
                'previous_stage_id' => $previousStageId,
                'changed_by' => Auth::id(),
                'changed_at' => now(),
                'notes' => $request->stage_change_notes ?? 'Stage updated',
            ]);

            $validated['last_status_change'] = now();
        }

        $application->update($validated);

        if ($request->hasFile('resume')) {
            $application->clearMediaCollection('resumes');
            $application->addMedia($request->file('resume'))->toMediaCollection('resumes');
        }

        return redirect()->back()
            ->with('success', 'Application updated successfully.');
    }

    /**
     * Remove the specified application from storage.
     */
    public function destroyApplication($id, $applicationId)
    {
        $application = JobApplication::where('job_id', $id)->findOrFail($applicationId);
        $application->delete();

        return redirect()->route('hr.recruitment.applications.index', $id)
            ->with('success', 'Application deleted successfully.');
    }

    /**
     * Display a listing of interviews for an application.
     */
    public function interviews($id, $applicationId)
    {
        $application = JobApplication::where('job_id', $id)
            ->with(['job', 'applicant'])
            ->findOrFail($applicationId);

        $interviews = JobInterview::where('job_application_id', $applicationId)
            ->orderBy('interview_date')
            ->get();

        return Inertia::render('HR/Recruitment/Applications/Interviews/Index', [
            'job' => Job::findOrFail($id),
            'application' => $application,
            'interviews' => $interviews,
            'interviewers' => User::role(['HR Manager', 'Department Manager', 'Team Lead', 'Senior Employee'])->get(['id', 'name']),
            'interviewTypes' => [
                ['id' => 'phone', 'name' => 'Phone Interview'],
                ['id' => 'video', 'name' => 'Video Interview'],
                ['id' => 'in_person', 'name' => 'In-Person Interview'],
                ['id' => 'technical', 'name' => 'Technical Interview'],
                ['id' => 'panel', 'name' => 'Panel Interview'],
                ['id' => 'group', 'name' => 'Group Interview'],
                ['id' => 'assessment', 'name' => 'Assessment Interview'],
            ],
        ]);
    }

    /**
     * Store a newly created interview in storage.
     */
    public function storeInterview(Request $request, $id, $applicationId)
    {
        $application = JobApplication::where('job_id', $id)->findOrFail($applicationId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'interview_date' => 'required|date',
            'duration_minutes' => 'required|integer|min:10',
            'location' => 'nullable|string|max:255',
            'is_online' => 'boolean',
            'meeting_link' => 'nullable|string|max:255',
            'interview_type' => 'required|string',
            'status' => 'required|in:scheduled,completed,cancelled,no_show',
            'interviewer_ids' => 'required|array|min:1',
            'interview_notes' => 'nullable|string',
        ]);

        $validated['job_application_id'] = $application->id;
        $validated['scheduled_by'] = Auth::id();

        $interview = JobInterview::create($validated);

        return redirect()->back()
            ->with('success', 'Interview scheduled successfully.');
    }

    /**
     * Update the specified interview in storage.
     */
    public function updateInterview(Request $request, $id, $applicationId, $interviewId)
    {
        $interview = JobInterview::where('job_application_id', $applicationId)->findOrFail($interviewId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'interview_date' => 'required|date',
            'duration_minutes' => 'required|integer|min:10',
            'location' => 'nullable|string|max:255',
            'is_online' => 'boolean',
            'meeting_link' => 'nullable|string|max:255',
            'interview_type' => 'required|string',
            'status' => 'required|in:scheduled,completed,cancelled,no_show',
            'interviewer_ids' => 'required|array|min:1',
            'interview_notes' => 'nullable|string',
            'feedback' => 'nullable|string',
            'rating' => 'nullable|numeric|min:1|max:5',
            'recommendation' => 'nullable|in:hire,reject,consider,next_round',
        ]);

        $interview->update($validated);

        return redirect()->back()
            ->with('success', 'Interview updated successfully.');
    }

    /**
     * Remove the specified interview from storage.
     */
    public function destroyInterview($id, $applicationId, $interviewId)
    {
        $interview = JobInterview::where('job_application_id', $applicationId)->findOrFail($interviewId);
        $interview->delete();

        return redirect()->back()
            ->with('success', 'Interview deleted successfully.');
    }
}
