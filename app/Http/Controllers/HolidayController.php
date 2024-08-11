<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = Holiday::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }
}
