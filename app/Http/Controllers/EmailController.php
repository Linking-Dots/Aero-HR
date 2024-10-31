<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailController extends Controller
{
    public function index(): \Inertia\Response
    {
        return Inertia::render('Emails', [
            'title' => 'Emails',
        ]);
    }
}
