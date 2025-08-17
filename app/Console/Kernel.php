<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\SendAttendanceReminders::class,
        \App\Console\Commands\TestTenantProvisioning::class,
        \App\Console\Commands\CreateTenantCommand::class,
        \App\Console\Commands\CleanupEmptyTenantDatabases::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule)
    {
        // Test scheduler command runs every minute (for testing only)
        if (config('app.env') === 'local') {
            $schedule->command('test:scheduler')
                ->everyMinute()
                ->onFailure(function () {
                    Log::error('Test scheduler failed');
                });
        }

        // Send attendance reminders daily at 8:00 AM
        $schedule->command('attendance:reminders')
            ->dailyAt('22:17')
            ->timezone(config('app.timezone', 'UTC'))
            ->before(function () {
                Log::info('Starting attendance reminder job');
            })
            ->onSuccess(function () {
                Log::info('Attendance reminders sent successfully');
            })
            ->onFailure(function () {
                Log::error('Failed to send attendance reminders');
                // Optionally send an alert to admins here
            })
            ->withoutOverlapping()
            ->runInBackground()
            ->appendOutputTo(storage_path('logs/attendance-reminders.log'));

        // Clean up old notification logs (keep 30 days)
        $schedule->command('model:prune', [
            '--model' => [
                \App\Models\NotificationLog::class,
            ]
        ])->daily();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
