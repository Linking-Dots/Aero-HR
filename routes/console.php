<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use App\Console\Commands\SendPunchOutReminder;


Schedule::command(SendPunchOutReminder::class)->dailyAt('18:00');
