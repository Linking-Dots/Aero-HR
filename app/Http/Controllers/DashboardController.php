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
        $users = User::all();
        $tasks = $user->hasRole('se')
            ? DailyWork::where('incharge', $user->id)->get()
            : ($user->hasRole('qci') || $user->hasRole('aqci')
                ? DailyWork::where('assigned', $user->id)->get()
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

        $today = now()->toDateString(); // Get today's date in 'Y-m-d' format

        $todayLeaves = DB::table('leaves')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->whereDate('leaves.from_date', '<=', $today)  // Check that today's date is after or on the start date
            ->whereDate('leaves.to_date', '>=', $today)    // Check that today's date is before or on the end date
            ->get();

        $upcomingLeaves = DB::table('leaves')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select('leaves.*', 'leave_settings.type as leave_type')
            ->whereDate('leaves.from_date', '>=', now())
            ->whereDate('leaves.from_date', '<=', now()->addDays(7)) // Within the next seven days
            ->get();

        Log::info($todayLeaves);

        return Inertia::render('Dashboard', [
            'title' => 'Dashboard',
            'user' => $user,
            'users' => $users,
            'todayLeaves' => $todayLeaves, // Updated to pass today's leaves
            'upcomingLeaves' => $upcomingLeaves, // Updated to pass today's leaves
            'statistics' => $statistics,
            'status' => session('status')
        ]);

    }
}