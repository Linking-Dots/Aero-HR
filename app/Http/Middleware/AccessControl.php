/**
 * Backend Middleware for Role and Permission Management
 * 
 * This PHP middleware provides server-side access control
 * to complement the frontend permission system.
 */

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Super administrators have all permissions
        if ($user->hasRole('Super Administrator')) {
            return $next($request);
        }

        // Check if user has any of the required permissions
        $hasPermission = false;
        foreach ($permissions as $permission) {
            if ($user->hasPermissionTo($permission)) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Insufficient permissions to access this resource.',
                    'required_permissions' => $permissions
                ], 403);
            }

            abort(403, 'Insufficient permissions to access this resource.');
        }

        return $next($request);
    }
}

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user has any of the required roles
        $hasRole = false;
        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Insufficient role privileges to access this resource.',
                    'required_roles' => $roles
                ], 403);
            }

            abort(403, 'Insufficient role privileges to access this resource.');
        }

        return $next($request);
    }
}

class CheckModule
{
    /**
     * Handle an incoming request for module access.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Super administrators have access to all modules
        if ($user->hasRole('Super Administrator')) {
            return $next($request);
        }

        // Check module-specific permissions
        $modulePermissions = [
            "view {$module}",
            "access {$module}",
            "read {$module}",
            "manage {$module}"
        ];

        $hasAccess = false;
        foreach ($modulePermissions as $permission) {
            if ($user->hasPermissionTo($permission)) {
                $hasAccess = true;
                break;
            }
        }

        if (!$hasAccess) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => "Access denied to {$module} module.",
                    'module' => $module
                ], 403);
            }

            abort(403, "Access denied to {$module} module.");
        }

        return $next($request);
    }
}

class CheckHierarchy
{
    /**
     * Handle hierarchy-based access control.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, int $minimumLevel): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Super administrators bypass hierarchy checks
        if ($user->hasRole('Super Administrator')) {
            return $next($request);
        }

        // Get user's highest hierarchy level
        $userLevel = $user->roles()->max('hierarchy_level') ?? 1;

        if ($userLevel < $minimumLevel) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Insufficient hierarchy level to access this resource.',
                    'user_level' => $userLevel,
                    'required_level' => $minimumLevel
                ], 403);
            }

            abort(403, 'Insufficient hierarchy level to access this resource.');
        }

        return $next($request);
    }
}
