<?php


namespace App\Services\Settings;

use App\Models\AttendanceSetting;
use App\Repositories\Contracts\AttendanceSettingRepositoryInterface;

class AttendanceSettingService
{
    public function __construct(
        private AttendanceSettingRepositoryInterface $attendanceSettingRepository
    ) {}

    public function getSettings(): ?AttendanceSetting
    {
        return $this->attendanceSettingRepository->getFirst();
    }

    public function updateSettings(array $data): AttendanceSetting
    {
        $settings = $this->attendanceSettingRepository->getFirst();
        
        if ($settings) {
            return $this->attendanceSettingRepository->update($settings->id, $data);
        }
        
        return $this->attendanceSettingRepository->create($data);
    }
}