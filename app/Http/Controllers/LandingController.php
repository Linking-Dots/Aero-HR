<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Display the landing page.
     */
    public function index()
    {
        return Inertia::render('Landing/Home', [
            'title' => 'Welcome to Aero-HR',
        ]);
    }

    /**
     * Display the pricing page.
     */
    public function pricing()
    {
        return Inertia::render('Landing/Pricing', [
            'title' => 'Pricing | Aero-HR',
        ]);
    }

    /**
     * Display the features page.
     */
    public function features()
    {
        return Inertia::render('Landing/Features', [
            'title' => 'Features | Aero-HR',
        ]);
    }
}
