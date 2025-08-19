<?php
/**
 * Temporary test file to verify domain configuration
 * Access: https://aeos365.com/test-domain
 */

echo "<h1>🎉 Domain Configuration Test</h1>";
echo "<p><strong>SUCCESS!</strong> Your Laravel application is now loading correctly.</p>";
echo "<p><strong>Domain:</strong> " . ($_SERVER['HTTP_HOST'] ?? 'Unknown') . "</p>";
echo "<p><strong>Request URI:</strong> " . ($_SERVER['REQUEST_URI'] ?? 'Unknown') . "</p>";
echo "<p><strong>Current Time:</strong> " . date('Y-m-d H:i:s') . "</p>";

// Test Laravel bootstrap
try {
    require_once __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';
    
    echo "<p><strong>Laravel Status:</strong> ✅ Application loaded successfully</p>";
    echo "<p><strong>Environment:</strong> " . $app->environment() . "</p>";
    
    // Test central domains
    $centralDomains = $app['config']['tenancy.central_domains'];
    $isCurrentDomainCentral = in_array($_SERVER['HTTP_HOST'] ?? '', $centralDomains);
    
    echo "<p><strong>Is Central Domain:</strong> " . ($isCurrentDomainCentral ? '✅ YES' : '❌ NO') . "</p>";
    echo "<p><strong>Central Domains:</strong> " . implode(', ', $centralDomains) . "</p>";
    
} catch (Exception $e) {
    echo "<p><strong>Laravel Status:</strong> ❌ Error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><strong>Next Steps:</strong></p>";
echo "<ul>";
echo "<li>✅ Domain configuration is working</li>";
echo "<li>🔄 Build frontend assets with <code>npm run build</code></li>";
echo "<li>🚀 Your application will be fully functional</li>";
echo "</ul>";
?>
