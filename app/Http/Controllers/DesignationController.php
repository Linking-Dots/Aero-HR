<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DesignationController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = Designation::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }
}
