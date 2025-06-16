<?php
namespace App\Services\Attendance\Contracts;

interface AttendanceValidatorInterface {
    public function validate(array $context): bool;
    public function getMessage(): string;
}
