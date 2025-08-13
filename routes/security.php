<?php

use App\Http\Controllers\Security\AuthenticationSecurityController;
use App\Http\Controllers\Security\SessionManagerController;
use App\Http\Controllers\Security\TwoFactorSecurityController;
use App\Http\Controllers\Security\SecurityDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Security Routes
|--------------------------------------------------------------------------
|
| Here are the security-related routes for authentication monitoring,
| session management, and security dashboard functionality.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Security Dashboard
    Route::prefix('security')->name('security.')->group(function () {
        
        // Main Security Dashboard
        Route::get('/dashboard', [SecurityDashboardController::class, 'index'])
            ->name('dashboard');
        
        Route::post('/refresh', [SecurityDashboardController::class, 'refresh'])
            ->name('refresh');
        
        Route::get('/metrics', [SecurityDashboardController::class, 'getMetrics'])
            ->name('metrics');
        
        // Authentication Security Events
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::get('/events', [AuthenticationSecurityController::class, 'getAuthEvents'])
                ->name('events');
            
            Route::get('/statistics', [AuthenticationSecurityController::class, 'getStatistics'])
                ->name('statistics');
            
            Route::post('/verify-location', [AuthenticationSecurityController::class, 'verifyLocation'])
                ->name('verify-location');
            
            Route::post('/report-suspicious', [AuthenticationSecurityController::class, 'reportSuspicious'])
                ->name('report-suspicious');
        });
        
        // Session Management
        Route::prefix('sessions')->name('sessions.')->group(function () {
            Route::get('/', [SessionManagerController::class, 'index'])
                ->name('index');
            
            Route::get('/active', [SessionManagerController::class, 'getActiveSessionsAPI'])
                ->name('active');
            
            Route::post('/revoke/{sessionId}', [SessionManagerController::class, 'revokeSession'])
                ->name('revoke');
            
            Route::delete('/revoke-all', [SessionManagerController::class, 'revokeAllSessions'])
                ->name('revoke-all');
            
            Route::post('/bulk-revoke', [SessionManagerController::class, 'bulkRevokeSessions'])
                ->name('bulk-revoke');
            
            Route::get('/{sessionId}/details', [SessionManagerController::class, 'getSessionDetails'])
                ->name('details');
            
            Route::post('/verify-device', [SessionManagerController::class, 'verifyDevice'])
                ->name('verify-device');
        });
        
        // Enhanced Two-Factor Authentication
        Route::prefix('two-factor')->name('two-factor.')->group(function () {
            Route::get('/setup', [TwoFactorSecurityController::class, 'showSetup'])
                ->name('setup');
            
            Route::post('/enable', [TwoFactorSecurityController::class, 'enable'])
                ->name('enable');
            
            Route::post('/confirm', [TwoFactorSecurityController::class, 'confirm'])
                ->name('confirm');
            
            Route::delete('/disable', [TwoFactorSecurityController::class, 'disable'])
                ->name('disable');
            
            Route::get('/recovery-codes', [TwoFactorSecurityController::class, 'getRecoveryCodes'])
                ->name('recovery-codes');
            
            Route::post('/recovery-codes/regenerate', [TwoFactorSecurityController::class, 'regenerateRecoveryCodes'])
                ->name('recovery-codes.regenerate');
            
            Route::post('/backup-methods', [TwoFactorSecurityController::class, 'addBackupMethod'])
                ->name('backup-methods');
        });
        
        // Security Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SecurityDashboardController::class, 'getSettings'])
                ->name('index');
            
            Route::put('/notifications', [SecurityDashboardController::class, 'updateNotificationSettings'])
                ->name('notifications');
            
            Route::put('/monitoring', [SecurityDashboardController::class, 'updateMonitoringSettings'])
                ->name('monitoring');
            
            Route::put('/session-timeout', [SecurityDashboardController::class, 'updateSessionTimeout'])
                ->name('session-timeout');
            
            Route::post('/export-report', [SecurityDashboardController::class, 'exportSecurityReport'])
                ->name('export-report');
        });
        
        // Security Incidents
        Route::prefix('incidents')->name('incidents.')->group(function () {
            Route::get('/', [AuthenticationSecurityController::class, 'getIncidents'])
                ->name('index');
            
            Route::post('/', [AuthenticationSecurityController::class, 'createIncident'])
                ->name('create');
            
            Route::put('/{incident}/resolve', [AuthenticationSecurityController::class, 'resolveIncident'])
                ->name('resolve');
            
            Route::get('/{incident}', [AuthenticationSecurityController::class, 'getIncidentDetails'])
                ->name('details');
        });
    });
    
    // Enhanced Password Reset Routes
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::get('/password/reset/enhanced', [AuthenticationSecurityController::class, 'showEnhancedPasswordReset'])
            ->name('password.reset.enhanced');
        
        Route::post('/password/reset/send-otp', [AuthenticationSecurityController::class, 'sendSecureOtp'])
            ->name('password.reset.send-otp');
        
        Route::post('/password/reset/verify-otp', [AuthenticationSecurityController::class, 'verifySecureOtp'])
            ->name('password.reset.verify-otp');
        
        Route::post('/password/reset/complete', [AuthenticationSecurityController::class, 'completePasswordReset'])
            ->name('password.reset.complete');
    });
});

// Admin-only security routes
Route::middleware(['auth', 'verified', 'can:manage-security'])->group(function () {
    Route::prefix('admin/security')->name('admin.security.')->group(function () {
        
        // System-wide security monitoring
        Route::get('/overview', [SecurityDashboardController::class, 'adminOverview'])
            ->name('overview');
        
        Route::get('/users/{user}/security', [SecurityDashboardController::class, 'getUserSecurity'])
            ->name('user-security');
        
        Route::post('/users/{user}/force-logout', [SessionManagerController::class, 'forceUserLogout'])
            ->name('force-logout');
        
        Route::post('/users/{user}/lock-account', [AuthenticationSecurityController::class, 'lockUserAccount'])
            ->name('lock-account');
        
        Route::post('/users/{user}/unlock-account', [AuthenticationSecurityController::class, 'unlockUserAccount'])
            ->name('unlock-account');
        
        // Bulk security operations
        Route::post('/bulk/force-2fa', [TwoFactorSecurityController::class, 'bulkEnforce2FA'])
            ->name('bulk.force-2fa');
        
        Route::post('/bulk/revoke-sessions', [SessionManagerController::class, 'bulkRevokeSessions'])
            ->name('bulk.revoke-sessions');
        
        // Security analytics
        Route::get('/analytics/failed-logins', [AuthenticationSecurityController::class, 'getFailedLoginAnalytics'])
            ->name('analytics.failed-logins');
        
        Route::get('/analytics/geographic', [AuthenticationSecurityController::class, 'getGeographicAnalytics'])
            ->name('analytics.geographic');
        
        Route::get('/analytics/device-usage', [SessionManagerController::class, 'getDeviceAnalytics'])
            ->name('analytics.device-usage');
        
        // Compliance reports
        Route::get('/compliance/iso27001', [SecurityDashboardController::class, 'getISO27001Report'])
            ->name('compliance.iso27001');
        
        Route::get('/compliance/gdpr', [SecurityDashboardController::class, 'getGDPRReport'])
            ->name('compliance.gdpr');
        
        Route::post('/compliance/export', [SecurityDashboardController::class, 'exportComplianceReport'])
            ->name('compliance.export');
    });
});

// API routes for real-time updates
Route::middleware(['auth:sanctum', 'throttle:120,1'])->prefix('api/security')->name('api.security.')->group(function () {
    
    // Real-time security events
    Route::get('/events/stream', [AuthenticationSecurityController::class, 'streamEvents'])
        ->name('events.stream');
    
    Route::get('/sessions/live', [SessionManagerController::class, 'getLiveSessions'])
        ->name('sessions.live');
    
    Route::post('/heartbeat', [SessionManagerController::class, 'sessionHeartbeat'])
        ->name('heartbeat');
    
    // Security status checks
    Route::get('/status', [SecurityDashboardController::class, 'getSecurityStatus'])
        ->name('status');
    
    Route::get('/threats/active', [AuthenticationSecurityController::class, 'getActiveThreats'])
        ->name('threats.active');
    
    // Device fingerprinting
    Route::post('/device/fingerprint', [SessionManagerController::class, 'recordDeviceFingerprint'])
        ->name('device.fingerprint');
    
    Route::post('/device/trust', [SessionManagerController::class, 'trustDevice'])
        ->name('device.trust');
});

// Webhook routes for external security services
Route::middleware(['throttle:10,1'])->prefix('webhooks/security')->name('webhooks.security.')->group(function () {
    
    // HaveIBeenPwned webhook
    Route::post('/hibp', [AuthenticationSecurityController::class, 'handleHIBPNotification'])
        ->name('hibp');
    
    // Geographic IP service webhooks
    Route::post('/geolocation', [AuthenticationSecurityController::class, 'handleGeolocationUpdate'])
        ->name('geolocation');
    
    // Threat intelligence feeds
    Route::post('/threat-intel', [AuthenticationSecurityController::class, 'handleThreatIntelligence'])
        ->name('threat-intel');
});
