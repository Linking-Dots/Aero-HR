<?php

namespace App\Jobs;

use App\Models\AttendanceSetting;
use App\Models\Leave;
use App\Models\Holiday;
use App\Models\User;
use App\Services\Notification\FcmNotificationService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendAttendanceReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $attendanceSetting;

    public function __construct(User $user, AttendanceSetting $attendanceSetting)
    {
        $this->user = $user;
        $this->attendanceSetting = $attendanceSetting;
    }

    public function handle(FcmNotificationService $fcmService)
    {
        $today = Carbon::today();

        // Check if today is a holiday
        $isHoliday = Holiday::whereDate('date', $today)->exists();

        // Check if user is on leave today
        $isOnLeave = Leave::where('user_id', $this->user->id)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->exists();

        // Skip if holiday or user is on leave
        if ($isHoliday || $isOnLeave) {
            return;
        }

        // Skip if user doesn't have device token
        if (empty($this->user->device_token)) {
            return;
        }

        // Format the notification message
        $message = sprintf(
            "Reminder: Office starts at %s. Please ensure you're present on time!",
            $this->attendanceSetting->office_start_time->format('H:i')
        );

        // Send notification
        $fcmService->sendNotification(
            $this->user->device_token,
            'Office Attendance Reminder',
            $message
        );
    }
}
