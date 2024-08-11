<!DOCTYPE html>
<html>

<title inertia>{{ config('app.name', 'DBEDC ERP') }}</title>
@include('layouts.head')

@routes
@viteReactRefresh
@vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
@inertiaHead
@inertia

</html>

