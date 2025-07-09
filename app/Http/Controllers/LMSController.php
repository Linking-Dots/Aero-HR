    /**
    * LMS Reports
    */
    public function reports()
    {
    $reportData = $this->lmsService->getReportsData();

    return Inertia::render('LMS/Reports/Index', [
    'reportData' => $reportData
    ]);
    }

    /**
    * LMS Settings
    */
    public function settings()
    {
    $settings = $this->lmsService->getSettings();

    return Inertia::render('LMS/Settings/Index', [
    'settings' => $settings
    ]);
    }

    public function updateSettings(Request $request)
    {
    $request->validate([
    'auto_enrollment' => 'boolean',
    'certificate_auto_generation' => 'boolean',
    'course_approval_required' => 'boolean',
    'default_course_duration' => 'integer|min:1',
    'max_attempts_per_assessment' => 'integer|min:1',
    'passing_grade_percentage' => 'integer|min:0|max:100',
    'notification_settings' => 'array'
    ]);

    $this->lmsService->updateSettings($request->all());

    return redirect()->back()->with('success', 'LMS settings updated successfully.');
    }
    }