<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class TenantLoginTokenService
{
    private const TOKEN_EXPIRY = 600; // 10 minutes
    private const TOKEN_PREFIX = 'tenant_login_token:';

    /**
     * Generate a secure one-time login token for tenant user
     */
    public function generateLoginToken(Tenant $tenant, User $user): string
    {
        $token = Str::random(64);
        $cacheKey = self::TOKEN_PREFIX . $token;
        
        // Get tenant domain
        $domain = $tenant->domains()->first();
        
        $tokenData = [
            'tenant_id' => $tenant->id,
            'tenant_domain' => $domain ? $domain->domain : null,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'created_at' => now()->toDateTimeString(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];

        Cache::put($cacheKey, $tokenData, self::TOKEN_EXPIRY);

        Log::info('Tenant login token generated', [
            'tenant_id' => $tenant->id,
            'domain' => $domain ? $domain->domain : 'No domain',
            'user_email' => $user->email,
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
     * Validate token without consuming it
     */
    public function validateToken(string $token): ?array
    {
        $cacheKey = self::TOKEN_PREFIX . $token;
        $tokenData = Cache::get($cacheKey);

        if (!$tokenData) {
            return null;
        }

        return $tokenData;
    }

    /**
     * Generate tenant login URL with auto-login token
     */
    public function generateLoginUrl(Tenant $tenant, User $user): string
    {
        $token = $this->generateLoginToken($tenant, $user);
        $domain = $tenant->domains()->first();
        $baseUrl = $this->getTenantBaseUrl($domain ? $domain->domain : null);
        
        return "{$baseUrl}/auto-login?token={$token}";
    }

    /**
     * Get tenant base URL based on environment using package standards
     */
    private function getTenantBaseUrl(?string $domain): string
    {
        if (!$domain) {
            throw new \Exception('No domain configured for tenant');
        }

        if (app()->environment('local')) {
            // Development: path-based routing
            $port = request()->getPort();
            $portSuffix = ($port && $port != 80 && $port != 443) ? ":{$port}" : '';
            return "http://127.0.0.1{$portSuffix}/{$domain}";
        } else {
            // Production: subdomain-based routing
            $appDomain = config('app.domain', 'aero-hr.local');
            return "https://{$domain}.{$appDomain}";
        }
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
