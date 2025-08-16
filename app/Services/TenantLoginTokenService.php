<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class TenantLoginTokenService
{
    private const TOKEN_EXPIRY = 600; // 10 minutes
    private const TOKEN_PREFIX = 'tenant_login_token:';

    /**
     * Generate a secure one-time login token for tenant owner
     */
    public function generateLoginToken(Tenant $tenant, TenantUser $tenantUser): string
    {
        $token = Str::random(64);
        $cacheKey = self::TOKEN_PREFIX . $token;
        
        $tokenData = [
            'tenant_id' => $tenant->id,
            'tenant_domain' => $tenant->domain,
            'user_id' => $tenantUser->id,
            'user_email' => $tenantUser->email,
            'created_at' => now()->toDateTimeString(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];

        Cache::put($cacheKey, $tokenData, self::TOKEN_EXPIRY);

        Log::info('Tenant login token generated', [
            'tenant_id' => $tenant->id,
            'domain' => $tenant->domain,
            'user_email' => $tenantUser->email,
            'token_expires_at' => now()->addSeconds(self::TOKEN_EXPIRY),
        ]);

        return $token;
    }

    /**
     * Validate and consume a login token
     */
    public function validateAndConsumeToken(string $token): ?array
    {
        $cacheKey = self::TOKEN_PREFIX . $token;
        $tokenData = Cache::get($cacheKey);

        if (!$tokenData) {
            Log::warning('Invalid or expired tenant login token used', [
                'token' => substr($token, 0, 8) . '...',
                'ip_address' => request()->ip(),
            ]);
            return null;
        }

        // Remove token from cache (one-time use)
        Cache::forget($cacheKey);

        Log::info('Tenant login token consumed successfully', [
            'tenant_id' => $tokenData['tenant_id'],
            'domain' => $tokenData['tenant_domain'],
            'user_email' => $tokenData['user_email'],
        ]);

        return $tokenData;
    }

    /**
     * Generate tenant login URL with auto-login token
     */
    public function generateLoginUrl(Tenant $tenant, TenantUser $tenantUser): string
    {
        $token = $this->generateLoginToken($tenant, $tenantUser);
        $baseUrl = $this->getTenantBaseUrl($tenant->domain);
        
        return "{$baseUrl}/auto-login?token={$token}";
    }

    /**
     * Get tenant base URL based on environment
     */
    private function getTenantBaseUrl(string $domain): string
    {
        // For development server (path-based routing)
        if (app()->environment('local') && 
            (request()->getHost() === '127.0.0.1' || request()->getHost() === 'localhost')) {
            $port = request()->getPort();
            $portSuffix = ($port && $port != 80 && $port != 443) ? ":{$port}" : '';
            return "http://127.0.0.1{$portSuffix}/tenant/{$domain}";
        }
        
        // For production (subdomain-based routing)
        $appDomain = config('app.domain', 'aero-hr.local');
        
        if (app()->environment('local')) {
            return "http://{$domain}.{$appDomain}";
        }
        
        return "https://{$domain}.{$appDomain}";
    }

    /**
     * Clean up expired tokens (can be called via scheduled task)
     */
    public function cleanupExpiredTokens(): int
    {
        // This is handled automatically by Cache TTL, but can be implemented
        // for additional cleanup if using database-based cache
        return 0;
    }
}
