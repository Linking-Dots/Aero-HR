<?php

namespace App\Console\Commands;

use App\Jobs\SendAttendanceReminder;
use App\Models\User;
use App\Models\AttendanceSetting;
use Illuminate\Console\Command;

class SendAttendanceReminders extends Command
{
    protected $signature = 'attendance:reminders';
    protected $description = 'Send attendance reminders to all eligible users';

    public function handle()
    {
        $this->info('Starting attendance reminders...');

        // Get the active attendance setting
        $attendanceSetting = AttendanceSetting::first();

        if (!$attendanceSetting) {
            $this->warn('No attendance setting found');
            return;
        }

        // Get all active users
        $users = User::where('status', 'active')->get();

        foreach ($users as $user) {
            SendAttendanceReminder::dispatch($user, $attendanceSetting);
        }

        $this->info('Attendance reminders dispatched successfully');
    }
}
