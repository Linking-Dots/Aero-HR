<?php

namespace App\Http\Controllers;

use App\Models\LeaveSetting;
use Inertia\Inertia;

class LeaveSettingController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = LeaveSetting::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }
}
