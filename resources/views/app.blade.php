<!DOCTYPE html>
<html>


<head>

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta content="Multipurpose Tasks Management Application for DBEDC" name="description" />
    <meta content="Emam Hosen" name="author" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Cache-Control" content="max-age=86400" />
    <link rel="manifest" href="{{ asset('/manifest.json') }}">
    <!-- App favicon -->
    <link rel="shortcut icon" href="{{ asset('assets/images/favicon.ico') }}" />

    <link rel="shortcut icon" href="{{ asset('assets/images/favicon.ico') }}">
    <title inertia>{{ config('app.name', 'DBEDC ERP') }}</title>

    <script>
        window.app_base_url = '<?php echo (config('app.url')) ?>';
    </script>


</head>

@routes
@viteReactRefresh
@vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
@inertiaHead
@inertia

</html>

