php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middlewareGroups = [
        'web' => [
            // ...other middleware
            \App\Http\Middleware\Cors::class, // Add your CORS middleware
        ],
        // ...other middleware groups
    ];
}
