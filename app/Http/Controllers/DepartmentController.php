<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = Department::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }
}
