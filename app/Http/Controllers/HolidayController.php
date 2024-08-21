<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
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
