<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\LeaveSetting;
use Illuminate\Http\Request;
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
