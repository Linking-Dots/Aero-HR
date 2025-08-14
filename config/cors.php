<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'register', 'login', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175','http://127.0.0.1:8000',  'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', 'http://[::1]:5173', 'http://[::1]:5174', 'http://[::1]:5175', 'http://[::1]:5176'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Inertia'],

    'max_age' => 0,

    'supports_credentials' => true,
];
