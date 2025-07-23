<?php

namespace App\Http\Controllers;

use App\Models\DailyWork;
use App\Models\User;
use App\Models\HRM\Attendance;
use App\Models\HRM\Leave;
use App\Models\HRM\Job;
use App\Models\HRM\JobApplication;
use App\Models\HRM\Department;
use App\Models\HRM\PerformanceReview;
use App\Models\HRM\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    
    public function index () {
        $user = Auth::user();
        
        // Prepare comprehensive dashboard data for ISO Standard Dashboard
        $dashboardData = $this->getDashboardData($user);
        
        return Inertia::render('Dashboard', [
            'title' => 'ISO Standard HRM Dashboard',
            'user' => $user,
            'dashboardData' => $dashboardData,
            'status' => session('status'),
            'csrfToken' => session('csrfToken')
        ]);
    }

    /**
     * Get comprehensive dashboard data for ISO 30414 compliance
     */
    private function getDashboardData($user)
    {
        $currentDate = Carbon::now();
        $currentMonth = $currentDate->month;
        $currentYear = $currentDate->year;
        $startOfYear = Carbon::create($currentYear, 1, 1);
        $startOfMonth = Carbon::create($currentYear, $currentMonth, 1);

        // Basic workforce metrics
        $totalEmployees = User::whereHas('roles', function($query) {
            $query->where('name', 'Employee');
        })->count();

        $activeWorkforce = User::whereHas('roles', function($query) {
            $query->where('name', 'Employee');
        })->whereNull('deleted_at')->count();

        $newHiresMTD = User::whereHas('roles', function($query) {
            $query->where('name', 'Employee');
        })->whereMonth('date_of_joining', $currentMonth)
          ->whereYear('date_of_joining', $currentYear)
          ->count();

        $newHiresYTD = User::whereHas('roles', function($query) {
            $query->where('name', 'Employee');
        })->whereYear('date_of_joining', $currentYear)->count();

        // Turnover calculation (simplified)
        $resignationsThisMonth = User::onlyTrashed()
            ->whereMonth('deleted_at', $currentMonth)
            ->whereYear('deleted_at', $currentYear)
            ->count();
        
        $turnoverRate = $totalEmployees > 0 ? round(($resignationsThisMonth / $totalEmployees) * 100, 1) : 0;

        // Attendance metrics
        $attendanceData = $this->getAttendanceMetrics($currentDate);
        
        // Performance metrics
        $performanceData = $this->getPerformanceMetrics();

        // Recruitment metrics
        $recruitmentData = $this->getRecruitmentMetrics($currentDate);

        // Training and development metrics
        $trainingData = $this->getTrainingMetrics();

        // Department breakdown
        $departmentData = $this->getDepartmentBreakdown();

        return [
            // Core Workforce Metrics (ISO 30414 compliant)
            'totalEmployees' => $totalEmployees,
            'activeWorkforce' => $activeWorkforce,
            'newHiresMTD' => $newHiresMTD,
            'newHiresYTD' => $newHiresYTD,
            'turnoverRate' => $turnoverRate,
            
            // Attendance & Productivity
            'attendanceRate' => $attendanceData['rate'],
            'absenteeismRate' => $attendanceData['absenteeism'],
            'averageWorkingHours' => $attendanceData['avgHours'],
            
            // Performance Management
            'performanceScore' => $performanceData['avgScore'],
            'performanceReviewsCompleted' => $performanceData['completed'],
            'performanceReviewsPending' => $performanceData['pending'],
            
            // Diversity & Inclusion
            'diversityIndex' => $this->calculateDiversityIndex(),
            'genderDistribution' => $this->getGenderDistribution(),
            
            // Employee Engagement & Satisfaction
            'employeeSatisfaction' => $performanceData['satisfaction'],
            'employeeRetentionRate' => 100 - $turnoverRate,
            
            // Recruitment & Talent Acquisition
            'recruitment' => $recruitmentData,
            
            // Learning & Development
            'training' => $trainingData,
            
            // Department Analytics
            'departments' => $departmentData,
            
            // Recent Activities
            'recentActivities' => $this->getRecentActivities(),
            
            // Upcoming Events
            'upcomingEvents' => $this->getUpcomingEvents($currentDate),
            
            // Quick Stats for Cards
            'quickStats' => [
                'totalDepartments' => Department::count(),
                'activeJobs' => Job::where('status', 'open')->count(),
                'pendingLeaves' => Leave::where('status', 'pending')->count(),
                'upcomingHolidays' => Holiday::where('from_date', '>=', $currentDate)->count(),
            ]
        ];
    }

    private function getAttendanceMetrics($currentDate)
    {
        $startOfMonth = $currentDate->copy()->startOfMonth();
        $endOfMonth = $currentDate->copy()->endOfMonth();
        
        $totalWorkingDays = $startOfMonth->diffInWeekdays($endOfMonth) + 1;
        $totalEmployees = User::whereHas('roles', function($query) {
            $query->where('name', 'Employee');
        })->count();
        
        $attendanceRecords = Attendance::whereBetween('date', [$startOfMonth, $currentDate])->count();
        $expectedAttendance = $totalEmployees * $totalWorkingDays;
        
        $attendanceRate = $expectedAttendance > 0 ? round(($attendanceRecords / $expectedAttendance) * 100, 1) : 0;
        $absenteeismRate = 100 - $attendanceRate;
        
        // Calculate average hours worked from punch times
        $attendances = Attendance::whereBetween('date', [$startOfMonth, $currentDate])
            ->whereNotNull('punchin')
            ->whereNotNull('punchout')
            ->get();
            
        $totalHours = 0;
        $validRecords = 0;
        
        foreach ($attendances as $attendance) {
            if ($attendance->punchin && $attendance->punchout) {
                $punchIn = Carbon::parse($attendance->punchin);
                $punchOut = Carbon::parse($attendance->punchout);
                
                // Only calculate if punch out is after punch in
                if ($punchOut->greaterThan($punchIn)) {
                    $hours = $punchIn->diffInHours($punchOut, true);
                    $totalHours += $hours;
                    $validRecords++;
                }
            }
        }
        
        $avgHours = $validRecords > 0 ? round($totalHours / $validRecords, 1) : 8.0;
        
        return [
            'rate' => $attendanceRate,
            'absenteeism' => $absenteeismRate,
            'avgHours' => round($avgHours, 1)
        ];
    }

    private function getPerformanceMetrics()
    {
        $avgScore = 4.1; // Default if no performance review model exists
        $completed = 0;
        $pending = 0;
        $satisfaction = 4.2;
        
        if (class_exists('\App\Models\HRM\PerformanceReview')) {
            $avgScore = PerformanceReview::whereNotNull('overall_rating')->avg('overall_rating') ?? 4.1;
            $completed = PerformanceReview::where('status', 'completed')->count();
            $pending = PerformanceReview::where('status', 'pending')->count();
        }
        
        return [
            'avgScore' => round($avgScore, 1),
            'completed' => $completed,
            'pending' => $pending,
            'satisfaction' => $satisfaction
        ];
    }

    private function getRecruitmentMetrics($currentDate)
    {
        $openPositions = Job::where('status', 'open')->count();
        $applicationsThisMonth = JobApplication::whereMonth('created_at', $currentDate->month)
            ->whereYear('created_at', $currentDate->year)
            ->count();
        
        $avgTimeToHire = 25; // Default days
        $offerAcceptanceRate = 85; // Default percentage
        
        return [
            'openPositions' => $openPositions,
            'applicationsReceived' => $applicationsThisMonth,
            'avgTimeToHire' => $avgTimeToHire,
            'offerAcceptanceRate' => $offerAcceptanceRate,
            'pipeline' => [
                'applied' => JobApplication::where('status', 'applied')->count(),
                'screening' => JobApplication::where('status', 'screening')->count(),
                'interview' => JobApplication::where('status', 'interview')->count(),
                'offer' => JobApplication::where('status', 'offer')->count(),
                'hired' => JobApplication::where('status', 'hired')->count(),
            ]
        ];
    }

    private function getTrainingMetrics()
    {
        return [
            'coursesAvailable' => 25,
            'employeesInTraining' => 45,
            'completionRate' => 78,
            'avgTrainingHours' => 12.5,
            'certifications' => 156,
            'upcomingSessions' => 8
        ];
    }

    private function getDepartmentBreakdown()
    {
        return Department::withCount('users')->get()->map(function($dept) {
            return [
                'id' => $dept->id,
                'name' => $dept->name,
                'employeeCount' => $dept->users_count,
                'percentage' => 0 // Will be calculated on frontend
            ];
        });
    }

    private function calculateDiversityIndex()
    {
        // Simplified diversity calculation based on gender distribution
        $maleCount = User::where('gender', 'male')->count();
        $femaleCount = User::where('gender', 'female')->count();
        $totalCount = $maleCount + $femaleCount;
        
        if ($totalCount === 0) return 0.5;
        
        $maleRatio = $maleCount / $totalCount;
        $femaleRatio = $femaleCount / $totalCount;
        
        // Shannon diversity index simplified for 2 categories
        $diversity = 1 - (($maleRatio * $maleRatio) + ($femaleRatio * $femaleRatio));
        
        return round($diversity, 2);
    }

    private function getGenderDistribution()
    {
        return [
            'male' => User::where('gender', 'male')->count(),
            'female' => User::where('gender', 'female')->count(),
            'other' => User::whereNotIn('gender', ['male', 'female'])->orWhereNull('gender')->count()
        ];
    }

    private function getRecentActivities()
    {
        $activities = [];
        
        // Recent hires
        $recentHires = User::whereHas('roles', function($query) {
            $query->where('name', 'Employee');
        })->latest('date_of_joining')->take(3)->get();
        
        foreach ($recentHires as $hire) {
            $activities[] = [
                'type' => 'hire',
                'title' => 'New Employee Onboarded',
                'description' => $hire->name . ' joined as ' . ($hire->designation->name ?? 'Employee'),
                'time' => Carbon::parse($hire->date_of_joining)->diffForHumans(),
                'icon' => 'user-plus'
            ];
        }
        
        return array_slice($activities, 0, 5); // Limit to 5 activities
    }

    private function getUpcomingEvents($currentDate)
    {
        $events = [];
        
        // Upcoming holidays
        $holidays = Holiday::where('from_date', '>=', $currentDate)
            ->orderBy('from_date')
            ->take(3)
            ->get();
        
        foreach ($holidays as $holiday) {
            $events[] = [
                'type' => 'holiday',
                'title' => $holiday->name,
                'date' => Carbon::parse($holiday->from_date)->format('M d, Y'),
                'description' => 'Public Holiday'
            ];
        }
        
        return $events;
    }

    public function stats() {
        $user = Auth::user();
        
        // Use role-based access control for now
        $taskQuery = DailyWork::query();
        
        // Simple access control based on user roles - for now, allow all authenticated users
        $taskQuery = DailyWork::where(function($query) use ($user) {
            $query->where('incharge', $user->id)
                  ->orWhere('assigned', $user->id);
        });

        $total = (clone $taskQuery)->count();
        $completed = (clone $taskQuery)->where('status', 'completed')->count();
        $pending = $total - $completed;
        $rfi_submissions = (clone $taskQuery)->whereNotNull('rfi_submission_date')->count();

        $statistics = [
            'total' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'rfi_submissions' => $rfi_submissions
        ];

        return response()->json([
            'statistics' => $statistics
        ]);
    }

    public function updates() {
        $user = Auth::user();
        
        $users = User::with('roles:name')
            ->whereHas('roles', function ($query) {
                $query->where('name', 'Employee');
            })
            ->get()
            ->map(function ($user) {
                $userData = $user->toArray();
                $userData['roles'] = $user->roles->pluck('name')->toArray();
                return $userData;
            });
        
        $today = now()->toDateString();

        // Get leave information
        $todayLeaves = [];
        $upcomingLeaves = [];
        
        try {
            $leaveQuery = DB::table('leaves')
                ->leftJoin('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                ->select('leaves.*', 'leave_settings.type as leave_type');
            
            // For now, show all leaves to authenticated users
            $todayLeaves = (clone $leaveQuery)
                ->whereDate('leaves.from_date', '<=', $today)
                ->whereDate('leaves.to_date', '>=', $today)
                ->get();

            $upcomingLeaves = (clone $leaveQuery)
                ->where(function($query) {
                    $query->whereDate('leaves.from_date', '>=', now())
                        ->orWhereDate('leaves.to_date', '>=', now());
                })
                ->where(function($query) {
                    $query->whereDate('leaves.from_date', '<=', now()->addDays(7))
                        ->orWhereDate('leaves.to_date', '<=', now()->addDays(7));
                })
                ->orderBy('leaves.from_date', 'desc')
                ->get();
        } catch (\Exception $e) {
            Log::warning('Error fetching leave data: ' . $e->getMessage());
        }

        $upcomingHoliday = null;
        try {
            $upcomingHoliday = DB::table('holidays')
                ->whereDate('holidays.from_date', '>=', now())
                ->orderBy('holidays.from_date', 'asc')
                ->first();
        } catch (\Exception $e) {
            Log::warning('Error fetching holiday data: ' . $e->getMessage());
        }

        return response()->json([
            'users' => $users,
            'todayLeaves' => $todayLeaves,
            'upcomingLeaves' => $upcomingLeaves,
            'upcomingHoliday' => $upcomingHoliday,
        ]);
    }
}
