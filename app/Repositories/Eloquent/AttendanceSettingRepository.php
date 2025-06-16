<?php

namespace App\Repositories\Eloquent;

use App\Models\AttendanceSetting;
use App\Repositories\Contracts\AttendanceSettingRepositoryInterface;

class AttendanceSettingRepository implements AttendanceSettingRepositoryInterface
{
    public function getFirst()
    {
        return AttendanceSetting::first();
    }

    public function create(array $data)
    {
        return AttendanceSetting::create($data);
    }

    public function update(int $id, array $data)
    {
        $setting = AttendanceSetting::findOrFail($id);
        $setting->update($data);
        return $setting;
    }
}