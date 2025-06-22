<?php


namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user() : '',
                'roles' => $request->user() ? $request->user()->roles->pluck('name')->toArray() : [],
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name')->toArray() : [],
            ],
            
            // Theme and UI Configuration
            'theme' => [
                'defaultTheme' => 'OCEAN',
                'defaultBackground' => 'pattern-1',
                'darkMode' => false,
                'animations' => true,
            ],
            
            // Application Configuration
            'app' => [
                'name' => config('app.name', 'DBEDC ERP'),
                'version' => config('app.version', '1.0.0'),
                'debug' => config('app.debug', false),
                'environment' => config('app.env', 'production'),
            ],
            
            'url' => $request->getPathInfo(),
        ];
    }
}
