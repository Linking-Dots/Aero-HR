<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use Illuminate\Http\Request;
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
