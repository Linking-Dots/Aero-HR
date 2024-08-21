<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = Leave::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }
}
