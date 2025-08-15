<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'register', 'login', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], // Allow all origins for local development

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Inertia'],

    'max_age' => 0,

    'supports_credentials' => true,
];
