<?php


namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ReservedDomainRule implements ValidationRule
{
    /**
     * List of reserved domain names that cannot be used by tenants
     */
    private const RESERVED_DOMAINS = [
        // System domains
        'www', 'app', 'api', 'admin', 'dashboard', 'central', 'system',
        'support', 'help', 'docs', 'blog', 'mail', 'email', 'cdn',
        'assets', 'static', 'files', 'uploads', 'download', 'media',
        
        // Security domains
        'security', 'ssl', 'secure', 'auth', 'login', 'register', 'signup',
        'ftp', 'sftp', 'ssh', 'vpn', 'proxy',
        
        // Common services
        'billing', 'payment', 'invoice', 'stripe', 'paypal', 'checkout',
        'webhook', 'callback', 'notifications', 'alerts',
        
        // Development/Technical
        'dev', 'test', 'staging', 'demo', 'preview', 'localhost',
        'git', 'svn', 'ci', 'cd', 'jenkins', 'docker',
        
        // Marketing/Business
        'sales', 'marketing', 'pricing', 'about', 'contact', 'legal',
        'privacy', 'terms', 'policy', 'careers', 'jobs',
        
        // Social/Communication
        'chat', 'forum', 'community', 'social', 'share', 'feedback',
        
        // Common words that might cause confusion
        'application', 'service', 'platform', 'software', 'saas',
        'cloud', 'enterprise', 'business', 'company', 'corp', 'inc',
        
        // Potential conflicts with subdomains
        'pop', 'imap', 'smtp', 'webmail', 'mx', 'ns', 'dns',
        'cpanel', 'whm', 'plesk', 'hosting',
        
        // Brand protection
        'aero', 'aero-hr', 'aerohr'
    ];

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $domain = strtolower(trim($value));
        
        // Check against reserved domains
        if (in_array($domain, self::RESERVED_DOMAINS, true)) {
            $fail("The {$attribute} '{$domain}' is reserved and cannot be used.");
            return;
        }
        
        // Check for domain patterns that are reserved
        $reservedPatterns = [
            '/^admin/', // Any domain starting with 'admin'
            '/^test/', // Any domain starting with 'test'
            '/^dev/', // Any domain starting with 'dev'
            '/^api/', // Any domain starting with 'api'
            '/-admin$/', // Any domain ending with '-admin'
            '/-api$/', // Any domain ending with '-api'
            '/-test$/', // Any domain ending with '-test'
        ];
        
        foreach ($reservedPatterns as $pattern) {
            if (preg_match($pattern, $domain)) {
                $fail("The {$attribute} pattern is reserved and cannot be used.");
                return;
            }
        }
        
        // Check for domains that are too similar to the main brand
        $brandSimilar = ['aero', 'aerohr', 'aero-hr', 'hr-aero'];
        foreach ($brandSimilar as $brand) {
            if (levenshtein($domain, $brand) <= 2 && strlen($domain) >= 3) {
                $fail("The {$attribute} is too similar to our brand name and cannot be used.");
                return;
            }
        }
    }
    
    /**
     * Get the list of reserved domains (for documentation or display purposes)
     */
    public static function getReservedDomains(): array
    {
        return self::RESERVED_DOMAINS;
    }
}
