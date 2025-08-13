<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthenticationSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Inertia\Inertia;

class TwoFactorSecurityController extends Controller
{
    protected AuthenticationSecurityService $securityService;
    protected TwoFactorAuthenticationProvider $twoFactorProvider;

    public function __construct(
        AuthenticationSecurityService $securityService,
        TwoFactorAuthenticationProvider $twoFactorProvider
    ) {
        $this->securityService = $securityService;
        $this->twoFactorProvider = $twoFactorProvider;
    }

    /**
     * Show two-factor authentication setup page
     */
    public function showSetup(Request $request)
    {
        $user = User::find(Auth::id());
        
        $twoFactorData = null;
        if ($user->two_factor_secret) {
            $twoFactorData = [
                'qr' => $this->generateQrCodeUrl($user),
                'secret' => decrypt($user->two_factor_secret),
                'recoveryCodes' => $user->two_factor_confirmed_at ? 
                    json_decode(decrypt($user->two_factor_recovery_codes), true) : null
            ];
        }

        return Inertia::render('Auth/EnhancedTwoFactorSetup', [
            'auth' => [
                'user' => $user
            ],
            'twoFactorData' => $twoFactorData
        ]);
    }

    /**
     * Enable two-factor authentication
     */
    public function enable(Request $request)
    {
        $user = User::find(Auth::id());

        try {
            // Enable 2FA using Fortify action
            app(EnableTwoFactorAuthentication::class)($user);

            // Log the enablement
            $this->securityService->logSecurityEvent('two_factor_enabled', [
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Two-factor authentication enabled',
                'qr' => $this->generateQrCodeUrl($user),
                'secret' => decrypt($user->two_factor_secret)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to enable 2FA', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to enable two-factor authentication'
            ], 500);
        }
    }

    /**
     * Confirm two-factor authentication setup
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6'
        ]);

        $user = User::find(Auth::id());
        $code = $request->code;

        if (!$user->two_factor_secret) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor authentication is not enabled.'],
            ]);
        }

        try {
            // Verify the TOTP code
            if (!$this->twoFactorProvider->verify(decrypt($user->two_factor_secret), $code)) {
                throw ValidationException::withMessages([
                    'code' => ['The provided two-factor authentication code is invalid.'],
                ]);
            }

            // Confirm 2FA
            $user->forceFill([
                'two_factor_confirmed_at' => now(),
            ])->save();

            // Generate recovery codes
            $recoveryCodes = collect(range(1, 8))->map(function () {
                return strtoupper(substr(md5(random_bytes(16)), 0, 10));
            })->toArray();

            $user->update([
                'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            ]);

            // Log the confirmation
            $this->securityService->logSecurityEvent('two_factor_confirmed', [
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Two-factor authentication confirmed successfully',
                'recoveryCodes' => $recoveryCodes
            ]);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Failed to confirm 2FA', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm two-factor authentication'
            ], 500);
        }
    }

    /**
     * Disable two-factor authentication
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
            'confirmation_code' => 'required|string|size:6'
        ]);

        $user = User::find(Auth::id());

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        // Verify 2FA code
        if (!$this->twoFactorProvider->verify(decrypt($user->two_factor_secret), $request->confirmation_code)) {
            throw ValidationException::withMessages([
                'confirmation_code' => ['The provided two-factor authentication code is invalid.'],
            ]);
        }

        try {
            // Disable 2FA using Fortify action
            app(DisableTwoFactorAuthentication::class)($user);

            // Log the disabling
            $this->securityService->logSecurityEvent('two_factor_disabled', [
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Two-factor authentication disabled successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to disable 2FA', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to disable two-factor authentication'
            ], 500);
        }
    }

    /**
     * Get recovery codes
     */
    public function getRecoveryCodes(Request $request)
    {
        $user = User::find(Auth::id());

        if (!$user->two_factor_confirmed_at) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled'
            ], 400);
        }

        $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);

        // Log access to recovery codes
        $this->securityService->logSecurityEvent('recovery_codes_accessed', [
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'success' => true,
            'recoveryCodes' => $recoveryCodes
        ]);
    }

    /**
     * Regenerate recovery codes
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $request->validate([
            'password' => 'required|string'
        ]);

        $user = User::find(Auth::id());

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        if (!$user->two_factor_confirmed_at) {
            return response()->json([
                'success' => false,
                'message' => 'Two-factor authentication is not enabled'
            ], 400);
        }

        try {
            // Generate new recovery codes
            app(GenerateNewRecoveryCodes::class)($user);

            $newRecoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);

            // Log recovery codes regeneration
            $this->securityService->logSecurityEvent('recovery_codes_regenerated', [
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Recovery codes regenerated successfully',
                'recoveryCodes' => $newRecoveryCodes
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to regenerate recovery codes', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to regenerate recovery codes'
            ], 500);
        }
    }

    /**
     * Add backup authentication method
     */
    public function addBackupMethod(Request $request)
    {
        $request->validate([
            'method' => 'required|in:sms,email,hardware_key',
            'value' => 'required|string'
        ]);

        $user = User::find(Auth::id());
        $method = $request->method;
        $value = $request->value;

        try {
            // Store backup method
            $backupMethods = json_decode($user->backup_2fa_methods ?? '[]', true);
            
            // Check if method already exists
            $existingIndex = array_search($method, array_column($backupMethods, 'method'));
            
            if ($existingIndex !== false) {
                $backupMethods[$existingIndex]['value'] = $value;
                $backupMethods[$existingIndex]['updated_at'] = now()->toISOString();
            } else {
                $backupMethods[] = [
                    'method' => $method,
                    'value' => $value,
                    'verified' => false,
                    'created_at' => now()->toISOString(),
                    'updated_at' => now()->toISOString()
                ];
            }

            $user->backup_2fa_methods = json_encode($backupMethods);
            $user->save();

            // Send verification for the backup method
            $this->sendBackupMethodVerification($user, $method, $value);

            // Log the addition
            $this->securityService->logSecurityEvent('backup_2fa_method_added', [
                'user_id' => $user->id,
                'method' => $method,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Backup {$method} method added. Please check for verification instructions."
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add backup 2FA method', [
                'user_id' => $user->id,
                'method' => $method,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add backup method'
            ], 500);
        }
    }

    /**
     * Bulk enforce 2FA for admin users (admin only)
     */
    public function bulkEnforce2FA(Request $request)
    {
        $this->authorize('manage-security');

        $request->validate([
            'role_names' => 'required|array|min:1',
            'role_names.*' => 'required|string',
            'deadline' => 'required|date|after:today',
            'notify_users' => 'boolean'
        ]);

        $roleNames = $request->role_names;
        $deadline = $request->deadline;
        $notifyUsers = $request->notify_users ?? true;

        try {
            // Get users with specified roles
            $users = DB::table('users')
                ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->whereIn('roles.name', $roleNames)
                ->whereNull('users.two_factor_confirmed_at')
                ->select('users.*')
                ->distinct()
                ->get();

            $enforcementCount = 0;

            foreach ($users as $user) {
                // Create 2FA enforcement record
                DB::table('two_factor_enforcements')->updateOrInsert([
                    'user_id' => $user->id
                ], [
                    'enforced_by' => Auth::id(),
                    'deadline' => $deadline,
                    'status' => 'pending',
                    'notification_sent' => false,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                if ($notifyUsers) {
                    $this->sendTwoFactorEnforcementNotification($user, $deadline);
                }

                $enforcementCount++;
            }

            // Log the bulk enforcement
            $this->securityService->logSecurityEvent('bulk_2fa_enforcement', [
                'admin_user_id' => Auth::id(),
                'affected_users' => $enforcementCount,
                'roles' => $roleNames,
                'deadline' => $deadline
            ]);

            return response()->json([
                'success' => true,
                'message' => "2FA enforcement applied to {$enforcementCount} users",
                'affected_users' => $enforcementCount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to enforce bulk 2FA', [
                'admin_user_id' => Auth::id(),
                'roles' => $roleNames,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to enforce 2FA'
            ], 500);
        }
    }

    // Private helper methods

    private function sendBackupMethodVerification($user, string $method, string $value): void
    {
        switch ($method) {
            case 'sms':
                $this->sendSMSVerification($user, $value);
                break;
            case 'email':
                $this->sendEmailVerification($user, $value);
                break;
            case 'hardware_key':
                // Hardware key verification would be handled differently
                break;
        }
    }

    private function sendSMSVerification($user, string $phoneNumber): void
    {
        // Implement SMS verification logic
        $code = random_int(100000, 999999);
        Log::info("SMS verification code for {$phoneNumber}: {$code}");
    }

    private function sendEmailVerification($user, string $email): void
    {
        // Implement email verification logic
        $code = random_int(100000, 999999);
        Log::info("Email verification code for {$email}: {$code}");
    }

    private function sendTwoFactorEnforcementNotification($user, $deadline): void
    {
        // Implement notification logic for 2FA enforcement
        Log::info("2FA enforcement notification sent to {$user->email} with deadline {$deadline}");
    }

    /**
     * Generate QR code URL for 2FA setup
     */
    private function generateQrCodeUrl($user, $secret = null): string
    {
        if (!$secret) {
            $secret = decrypt($user->two_factor_secret);
        }

        $companyName = config('app.name', 'Aero-HR');
        $accountName = $user->email;
        
        $qrCodeUrl = 'otpauth://totp/' . urlencode($companyName . ':' . $accountName) 
                   . '?secret=' . $secret 
                   . '&issuer=' . urlencode($companyName);

        return $qrCodeUrl;
    }
}
