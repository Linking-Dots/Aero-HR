<?php

namespace App\Services\Attendance\Validators;

use App\Services\Attendance\Contracts\AttendanceValidatorInterface;

class WifiIpValidator implements AttendanceValidatorInterface
{
    protected array $config;
    protected string $message = '';

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function validate(array $context): bool
    {
        $userIp = $context['ip'] ?? null;

        if (!$userIp) {
            $this->message = 'IP address could not be determined.';
            return false;
        }

        // Check IP whitelist
        if (isset($this->config['allowed_ips'])) {
            $allowedIps = $this->config['allowed_ips'];

            foreach ($allowedIps as $allowedIp) {
                if ($this->matchesIpPattern($userIp, $allowedIp)) {
                    return true;
                }
            }
        }

        // Check IP ranges (CIDR notation)
        if (isset($this->config['allowed_ranges'])) {
            foreach ($this->config['allowed_ranges'] as $range) {
                if ($this->ipInRange($userIp, $range)) {
                    return true;
                }
            }
        }

        $this->message = 'Access denied: You must be connected to the office network.';
        return false;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    private function matchesIpPattern(string $userIp, string $pattern): bool
    {
        if ($pattern === $userIp) {
            return true;
        }

        // Support wildcard patterns like 192.168.1.*
        $pattern = str_replace('*', '.*', $pattern);
        return preg_match("/^{$pattern}$/", $userIp);
    }

    private function ipInRange(string $ip, string $range): bool
    {
        if (!str_contains($range, '/')) {
            return $ip === $range;
        }

        list($subnet, $bits) = explode('/', $range);
        $ip = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask = -1 << (32 - $bits);
        $subnet &= $mask;

        return ($ip & $mask) === $subnet;
    }
}
