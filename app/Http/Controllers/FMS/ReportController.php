<?php

namespace App\Http\Controllers\FMS;

use App\Http\Controllers\Controller;

class ReportController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'FMS Reports coming soon']);
    }
}
