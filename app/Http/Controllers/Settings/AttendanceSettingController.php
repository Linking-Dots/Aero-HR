<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AttendanceSetting;
use App\Models\AttendanceType;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceSettingController extends Controller
{
    public function index(): Response
    {
        $attendanceSettings = AttendanceSetting::first();
        $attendanceTypes = AttendanceType::all();

        return Inertia::render('Settings/AttendanceSettings', [
            'title' => 'Attendance Settings',
            'attendanceSettings' => $attendanceSettings,
            'attendanceTypes' => $attendanceTypes,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'office_start_time' => 'required',
            'office_end_time' => 'required',
            // ... add all other validation rules as needed
        ]);
        $settings = AttendanceSetting::first();
        if (!$settings) {
            $settings = AttendanceSetting::create($data);
        } else {
            $settings->update($data);
        }
        return response()->json([
            'message' => 'Attendance settings updated successfully.',
            'attendanceSettings' => $settings,
        ]);
    }

    public function storeType(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:attendance_types,slug',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'config' => 'nullable|array',
            'is_active' => 'boolean',
            'priority' => 'integer',
            'required_permissions' => 'nullable|array',
        ]);
        $data['config'] = $data['config'] ?? [];
        $data['required_permissions'] = $data['required_permissions'] ?? [];
        $type = AttendanceType::create($data);
        return response()->json([
            'message' => 'Attendance type created.',
            'attendanceType' => $type,
        ]);
    }

    public function updateType(Request $request, $id)
    {
        $type = AttendanceType::findOrFail($id);
        
        // Check if only config is being updated (for waypoint updates)
        if ($request->has('config') && count($request->all()) === 1) {
            // Only update config field
            $data = $request->validate([
                'config' => 'required|array',
                'config.tolerance' => 'sometimes|integer|min:1|max:10000',
                'config.waypoints' => 'sometimes|array',
                'config.waypoints.*.lat' => 'required_with:config.waypoints|numeric|between:-90,90',
                'config.waypoints.*.lng' => 'required_with:config.waypoints|numeric|between:-180,180',
            ]);
            
            $type->update([
                'config' => $data['config']
            ]);
            
            return response()->json([
                'message' => 'Attendance type config updated successfully.',
                'attendanceType' => $type->fresh(),
            ]);
        }
        
        // Full update for all fields
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'slug' => 'sometimes|required|string|unique:attendance_types,slug,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'config' => 'nullable|array',
            'config.tolerance' => 'sometimes|integer|min:1|max:10000',
            'config.waypoints' => 'sometimes|array',
            'config.waypoints.*.lat' => 'required_with:config.waypoints|numeric|between:-90,90',
            'config.waypoints.*.lng' => 'required_with:config.waypoints|numeric|between:-180,180',
            'is_active' => 'sometimes|boolean',
            'priority' => 'sometimes|integer',
            'required_permissions' => 'nullable|array',
        ]);
        
        // Ensure config and required_permissions are arrays
        if (isset($data['config'])) {
            $data['config'] = $data['config'] ?? [];
        }
        if (isset($data['required_permissions'])) {
            $data['required_permissions'] = $data['required_permissions'] ?? [];
        }
        
        $type->update($data);
        
        return response()->json([
            'message' => 'Attendance type updated successfully.',
            'attendanceType' => $type->fresh(),
        ]);
    }
}