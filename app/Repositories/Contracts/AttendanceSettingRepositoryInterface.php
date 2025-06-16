<?php

namespace App\Repositories\Contracts;

interface AttendanceSettingRepositoryInterface
{
    public function getFirst();
    public function create(array $data);
    public function update(int $id, array $data);
}