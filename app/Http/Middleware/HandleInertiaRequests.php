<?php


namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\CompanySetting;

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
        $user = $request->user();
        $userWithDesignation = $user ? \App\Models\User::with('designation')->find($user->id) : null;
        
        // Get company settings for global use
        $companySettings = CompanySetting::first();
        $companyName = $companySettings?->companyName ?? config('app.name', 'DBEDC ERP');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userWithDesignation ?: '',
                'roles' => $user ? $user->roles->pluck('name')->toArray() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name')->toArray() : [],
                'designation' => $userWithDesignation?->designation?->title,
            ],
            
            // Company Settings
            'companySettings' => $companySettings,
            
            // Theme and UI Configuration
            'theme' => [
                'defaultTheme' => 'OCEAN',
                'defaultBackground' => 'pattern-1',
                'darkMode' => false,
                'animations' => true,
            ],
            
            // Application Configuration
            'app' => [
                'name' => $companyName,
                'version' => config('app.version', '1.0.0'),
                'debug' => config('app.debug', false),
                'environment' => config('app.env', 'production'),
            ],
            
            'url' => $request->getPathInfo(),
            'csrfToken' => session('csrfToken')
        ];
    }
}
