<?php


namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateAttendanceSettingRequest;
use App\Services\Settings\AttendanceSettingService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class AttendanceSettingController extends Controller
{
    public function __construct(
        private AttendanceSettingService $attendanceSettingService
    ) {}

    public function index(): Response
    {
        $attendanceSettings = $this->attendanceSettingService->getSettings();
        
        return Inertia::render('Settings/AttendanceSettings', [
            'title' => 'Attendance Settings',
            'attendanceSettings' => $attendanceSettings,
        ]);
    }

    public function update(UpdateAttendanceSettingRequest $request): JsonResponse
    {
        try {
            $attendanceSettings = $this->attendanceSettingService->updateSettings(
                $request->validated()
            );

            return response()->json([
                'message' => 'Attendance settings updated successfully.',
                'attendanceSettings' => $attendanceSettings,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating attendance settings.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}