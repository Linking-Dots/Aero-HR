<?php

namespace App\Services\Attendance;

/**
 * QR Code validation service
 */
class QrCodeValidator extends BaseAttendanceValidator
{
    public function validate(): array
    {
        $validQrCodes = $this->attendanceType->config['qr_codes'] ?? [];
        $qrCode = $this->request->input('qr_code');
        
        if (!$qrCode) {
            return $this->errorResponse('QR code is required for validation.');
        }

        if (empty($validQrCodes)) {
            return $this->errorResponse('No QR codes configured for this attendance type.');
        }
        
        // Check if the provided QR code is valid and not expired
        $validCode = $this->findValidQrCode($qrCode, $validQrCodes);
        
        if (!$validCode) {
            return $this->errorResponse('Invalid or expired QR code.', 403);
        }
        
        return $this->successResponse('QR code validated successfully.', [
            'qr_code_id' => $validCode['id'] ?? null,
            'location' => $validCode['location'] ?? null
        ]);
    }

    /**
     * Find and validate QR code
     */
    private function findValidQrCode(string $qrCode, array $validQrCodes): ?array
    {
        foreach ($validQrCodes as $code) {
            if ($code['code'] === $qrCode) {
                // Check if QR code has expiration
                if (isset($code['expires_at'])) {
                    $expiresAt = \Carbon\Carbon::parse($code['expires_at']);
                    if ($expiresAt->isPast()) {
                        continue; // Skip expired codes
                    }
                }
                
                // Check if QR code is active
                if (isset($code['is_active']) && !$code['is_active']) {
                    continue; // Skip inactive codes
                }
                
                return $code;
            }
        }
        
        return null;
    }
}
