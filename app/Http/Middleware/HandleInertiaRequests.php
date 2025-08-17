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
        $user = $request->user();
        $userWithDesignation = null;
        $companySettings = null;
        $companyName = config('app.name', 'Aero Enterprise Suite');

        // Only fetch tenant-specific data if we're in tenant context
        $isTenantContext = $this->isTenantContext($request);
        
        if ($isTenantContext && $user) {
            // In tenant context, fetch user with designation
            $userWithDesignation = \App\Models\User::with('designation')->find($user->id);
            
            // Get company settings for tenant
            try {
                $companySettings = \App\Models\CompanySetting::first();
                $companyName = $companySettings?->companyName ?? tenant()?->name ?? config('app.name', 'Aero-HR');
            } catch (\Exception $e) {
                // If CompanySetting table doesn't exist in tenant, use tenant name
                $companyName = tenant()?->name ?? 'Tenant Company';
            }
        } else {
            // In central context, use default settings
            $userWithDesignation = $user;
            $companyName = 'Aero-HR Enterprise Suite';
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userWithDesignation ?: '',
                'roles' => $user ? $user->roles->pluck('name')->toArray() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name')->toArray() : [],
                'designation' => $userWithDesignation?->designation?->title ?? null,
            ],
            
            // Company Settings (only for tenant context)
            'companySettings' => $isTenantContext ? $companySettings : null,
            
            // Tenant information for route generation
            'tenant' => function () use ($request) {
                if (function_exists('tenant') && tenant()) {
                    return tenant()->domain;
                }
                // For development with path-based routing, extract from URL
                if (app()->environment('local')) {
                    $path = $request->path();
                    if (preg_match('/^tenant\/([^\/]+)/', $path, $matches)) {
                        return $matches[1];
                    }
                }
                return null;
            },
            
            // Context information (central vs tenant)
            'isTenant' => $isTenantContext,
            
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
            'csrfToken' => csrf_token(),
        ];
    }

    /**
     * Check if we're in tenant context
     */
    private function isTenantContext(Request $request): bool
    {
        // Check if we're in tenant context using stancl/tenancy
        if (function_exists('tenant') && tenant()) {
            return true;
        }
        
        // For development, check if URL starts with /tenant/
        if (app()->environment('local')) {
            return str_starts_with($request->path(), 'tenant/');
        }
        
        return false;
    }
}
