<?php

namespace App\Http\Controllers;

use App\Models\DailyWork;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    
    public function index () {
        $user = Auth::user();
        

        

        $today = now()->toDateString();

        $todayLeaves = DB::table('leaves')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->whereDate('leaves.from_date', '<=', $today)
            ->whereDate('leaves.to_date', '>=', $today)
            ->get();

        $upcomingLeaves = DB::table('leaves')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
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

        $upcomingHoliday = DB::table('holidays')
            ->whereDate('holidays.from_date', '>=', now())
            ->orderBy('holidays.from_date', 'asc')
            ->first();

        return Inertia::render('Dashboard', [
            'title' => 'Dashboard',
            'user' => $user,
            
            'todayLeaves' => $todayLeaves,
            'upcomingLeaves' => $upcomingLeaves,
            'upcomingHoliday' => $upcomingHoliday,
            
            'status' => session('status')
        ]);
    }

    public function stats() {
        $user = Auth::user();
        // Optimize: Use query builder for counts instead of loading all tasks
        if ($user->hasRole('Supervision Engineer')) {
            $taskQuery = DailyWork::where('incharge', $user->id);
        } elseif ($user->hasRole('Quality Control Inspector') || $user->hasRole('Asst. Quality Control Inspector')) {
            $taskQuery = DailyWork::where('assigned', $user->id);
        } else {
            $taskQuery = DailyWork::query();
        }

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

    
}
