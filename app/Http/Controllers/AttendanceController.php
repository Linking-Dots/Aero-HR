<?php

namespace App\Http\Controllers;
use App\Models\AttendanceRule;
use App\Services\Attendance\AttendanceValidatorFactory;
use App\Models\Attendance;
use App\Models\Designation;
use App\Models\Holiday;
use App\Models\LeaveSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class AttendanceController extends Controller
{
    public function index1(): \Inertia\Response
    {
        return Inertia::render('AttendanceAdmin', [
            'allUsers' => User::role('Employee')->get(),
            'title' => 'Attendances of Employees',
        ]);
    }

    public function index2(): \Inertia\Response
    {
        return Inertia::render('AttendanceEmployee', [
            'title' => 'Attendances',
        ]);
    }

    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 30);
            $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
            $employee = $request->get('employee');
            $currentMonth = $request->get('currentMonth');
            $currentYear = $request->get('currentYear');

            $users = $this->getEmployeeUsersWithAttendanceAndLeaves($currentYear, $currentMonth);

            $leaveTypes = LeaveSetting::all();
            $holidays = $this->getHolidaysForMonth($currentYear, $currentMonth);
            $leaveCountsArray = $this->getLeaveCountsArray($currentYear, $currentMonth);

            $attendances = $users->map(function ($user) use ($currentYear, $currentMonth, $holidays, $leaveTypes) {
                return $this->getUserAttendanceData($user, $currentYear, $currentMonth, $holidays, $leaveTypes);
            });

            $sortedAttendances = $attendances->sortBy('user_id');
            $paginatedAttendances = $sortedAttendances->slice(($page - 1) * $perPage, $perPage)->values();

            if ($employee) {
                $paginatedAttendances = $paginatedAttendances->filter(function ($attendance) use ($employee) {
                    return stripos($attendance['name'], $employee) !== false;
                })->values();
            }

            return response()->json([
                'data' => $paginatedAttendances,
                'total' => $sortedAttendances->count(),
                'page' => $page,
                'last_page' => ceil($sortedAttendances->count() / $perPage),
                'leaveTypes' => $leaveTypes,
                'leaveCounts' => $leaveCountsArray,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in paginate method: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching attendance data.'], 500);
        }
    }

    private function getEmployeeUsersWithAttendanceAndLeaves($year, $month)
    {
        return User::whereHas('roles', function ($query) {
                $query->where('name', 'Employee');
            })->with([
                'attendances' => function ($query) use ($year, $month) {
                    $query->whereYear('date', $year)
                        ->whereMonth('date', $month);
                },
                'leaves' => function ($query) use ($year, $month) {
                    $query->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                        ->select('leaves.*', 'leave_settings.type as leave_type')
                        ->where(function ($query) use ($year, $month) {
                            $query->whereYear('leaves.from_date', $year)
                                ->whereMonth('leaves.from_date', $month)
                                ->orWhereYear('leaves.to_date', $year)
                                ->whereMonth('leaves.to_date', $month);
                        })
                        ->orderBy('leaves.from_date', 'desc');
                }
            ])->get();
    }

    private function getHolidaysForMonth($year, $month)
    {
        return Holiday::where(function ($query) use ($year, $month) {
                $query->whereYear('from_date', $year)
                    ->whereMonth('from_date', $month)
                    ->orWhereYear('to_date', $year)
                    ->whereMonth('to_date', $month);
            })->get();
    }

    private function getLeaveCountsArray($year, $month)
    {
        $leaveCounts = DB::table('leaves')
            ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
            ->select(
                'leaves.user_id',
                'leave_settings.type as leave_type',
                DB::raw('SUM(DATEDIFF(leaves.to_date, leaves.from_date) + 1) as total_days')
            )
            ->where(function ($query) use ($year, $month) {
                $query->whereYear('leaves.from_date', $year)
                    ->whereMonth('leaves.from_date', $month)
                    ->orWhereYear('leaves.to_date', $year)
                    ->whereMonth('leaves.to_date', $month);
            })
            ->groupBy('leaves.user_id', 'leave_settings.type')
            ->get();

        $leaveCountsArray = [];
        foreach ($leaveCounts as $leave) {
            $userId = $leave->user_id;
            $leaveType = $leave->leave_type;
            $totalDays = $leave->total_days;

            if (!isset($leaveCountsArray[$userId])) {
                $leaveCountsArray[$userId] = [
                    'Casual' => 0,
                    'Sick' => 0,
                    'Weekend' => 0,
                    'Earned' => 0
                ];
            }
            $leaveCountsArray[$userId][$leaveType] = $totalDays;
        }
        return $leaveCountsArray;
    }

    private function getUserAttendanceData($user, $year, $month, $holidays, $leaveTypes)
    {
        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
        $attendanceData = ['user_id' => $user->id, 'name' => $user->name, 'profile_image' => $user->profile_image];

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day)->toDateString();
            $attendance = $user->attendances->firstWhere('date', $date);
            $holiday = $holidays->first(function ($holiday) use ($date) {
                return Carbon::parse($date)->between($holiday->from_date, $holiday->to_date);
            });

            if ($holiday && $attendance && $attendance->punchin) {
                $attendanceData[$date] = '√';
            } elseif ($holiday) {
                $attendanceData[$date] = '#';
            } else {
                $leave = $user->leaves->first(function ($leave) use ($date) {
                    return Carbon::parse($date)->between($leave->from_date, $leave->to_date);
                });

                if ($leave) {
                    $leaveType = $leaveTypes->firstWhere('type', $leave->leave_type);
                    $attendanceData[$date] = $leaveType ? $leaveType->symbol : '√';
                } else {
                    $attendanceData[$date] = $attendance && $attendance->punchin ? '√' : '▼';
                }
            }
        }
        return $attendanceData;
    }

    public function updateAttendance(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate the incoming request data
            $validatedData = $request->validate([
                'user_id' => 'required|integer',
                'date' => 'required|date',
                'symbol' => 'required|string|max:255' // Add appropriate validation rules
            ]);

            // Extract validated data
            $userId = $validatedData['user_id'];
            $date = $validatedData['date'];
            $symbol = $validatedData['symbol'];

            // Check if the attendance record already exists
            $attendance = Attendance::where('user_id', $userId)->whereDate('date', $date)->first();

            // If the record doesn't exist, create a new one
            if (!$attendance) {
                $attendance = new Attendance();
                $attendance->user_id = $userId;
                $attendance->date = $date;
            }

            // Update the symbol
            $attendance->symbol = $symbol;
            $attendance->save();

            // Return a success response
            return response()->json(['message' => 'Attendance updated successfully']);
        } catch (\Exception $e) {
            // Handle exceptions
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function punch(Request $request)
    {
        $user = auth()->user();

        // 1. Get the user's attendance type (with config)
        $attendanceType = $user->attendanceType; // Eloquent relation

        if (!$attendanceType || !$attendanceType->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active attendance type assigned to user.',
            ], 422);
        }

        // 2. Switch based on attendance type slug
        switch ($attendanceType->slug) {
            case 'geo_polygon':
                // Example: Check if user's location is inside allowed polygon
                $polygon = $attendanceType->config['polygon'] ?? [];
                $lat = $request->input('lat');
                $lng = $request->input('lng');
                if (!$this->isPointInPolygon($lat, $lng, $polygon)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'You are not within the allowed location boundary.',
                    ], 403);
                }
                break;

            case 'wifi_ip':
                // Example: Check if user's IP is allowed
                $allowedIps = $attendanceType->config['allowed_ips'] ?? [];
                $ip = $request->ip();
                if (!in_array($ip, $allowedIps)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Your network is not authorized for attendance.',
                    ], 403);
                }
                break;

            case 'route-waypoint':
            case 'route_waypoint':
                $waypoints = $attendanceType->config['waypoints'] ?? [];
                $tolerance = $attendanceType->config['tolerance'] ?? 100;
                $userLat = $request->input('lat');
                $userLng = $request->input('lng');

                if (!$userLat || !$userLng) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Location data is required for route waypoint validation.',
                    ], 422);
                }

                if (empty($waypoints)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'No waypoints configured for this attendance type.',
                    ], 422);
                }

                // Check if user is within route using OSRM
                $routeValidation = $this->validateUserLocationWithRoute($userLat, $userLng, $waypoints, $tolerance);
                
                if (!$routeValidation['is_valid']) {
                    return response()->json([
                        'status' => 'error',
                        'message' => $routeValidation['message']
                        
                    ], 403);
                }
                break;

            case 'qr_code':
                // Example: Validate QR code (implement as needed)
                // $maxDistance = $attendanceType->config['max_distance'] ?? 50;
                // ...custom logic...
                break;

            default:
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unknown attendance type.',
                ], 422);
        }

        // 3. If validation passes, record the punch
        try {
            $today = Carbon::today();
            
            // Check if user already has a punch in today
            $existingAttendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->latest()
                ->first();

            if ($existingAttendance && !$existingAttendance->punchout) {
                // Punch out
                $existingAttendance->update([
                    'punchout' => Carbon::now(),
                    'punchout_location' => $this->formatLocation($request),
                ]);
                
                $message = 'Successfully punched out!';
            } else {
                // Punch in - create new attendance record
                $attendance = Attendance::create([
                    'user_id' => $user->id,
                    'date' => $today,
                    'punchin' => Carbon::now(),
                    'punchin_location' => $this->formatLocation($request),
                ]);
                
                $message = 'Successfully punched in!';
            }

            return response()->json([
                'status' => 'success',
                'message' => $message,
            ]);

        } catch (\Exception $e) {
            Log::error('Attendance punch error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to record attendance. Please try again.',
            ], 500);
        }
    }

    /**
     * Validate user location against route waypoints using OSRM
     */
    private function validateUserLocationWithRoute($userLat, $userLng, $waypoints, $tolerance)
    {
        try {
            // Build coordinates string for OSRM (lng,lat format)
            $coordinates = [];
            foreach ($waypoints as $waypoint) {
                if (isset($waypoint['lat']) && isset($waypoint['lng'])) {
                    $coordinates[] = $waypoint['lng'] . ',' . $waypoint['lat'];
                }
            }

            if (count($coordinates) < 2) {
                return [
                    'is_valid' => false,
                    'message' => 'At least 2 waypoints are required for route validation.',
                ];
            }

            // OSRM API endpoint (you can use public demo server or your own)
            $osrmBaseUrl = config('services.osrm.url', 'http://router.project-osrm.org');
            $coordinatesString = implode(';', $coordinates);
            
            // Get route information
            $routeUrl = "{$osrmBaseUrl}/route/v1/driving/{$coordinatesString}?overview=full&geometries=geojson";
            
            $routeResponse = Http::timeout(10)->get($routeUrl);
            
            if (!$routeResponse->successful()) {
                Log::warning('OSRM route request failed', [
                    'url' => $routeUrl,
                    'status' => $routeResponse->status(),
                    'response' => $routeResponse->body()
                ]);
                
                // Fallback to simple distance checking
                return $this->fallbackDistanceValidation($userLat, $userLng, $waypoints, $tolerance);
            }

            $routeData = $routeResponse->json();
            
            if (!isset($routeData['routes'][0]['geometry']['coordinates'])) {
                return $this->fallbackDistanceValidation($userLat, $userLng, $waypoints, $tolerance);
            }

            // Get route coordinates
            $routeCoordinates = $routeData['routes'][0]['geometry']['coordinates'];
            
            // Check if user is within tolerance distance of the route
            $minDistance = $this->calculateMinDistanceToRoute($userLat, $userLng, $routeCoordinates);
            
            $isValid = $minDistance <= $tolerance;
            
            return [
                'is_valid' => $isValid,
                'message' => $isValid 
                    ? "Location verified within {$tolerance}m of the route (distance: " . round($minDistance, 2) . "m)."
                    : "You are " . round($minDistance, 2) . "m away from the route. Maximum distance: {$tolerance}m.",
                'route_data' => [
                    'distance_to_route' => round($minDistance, 2),
                    'tolerance' => $tolerance,
                    'route_distance' => $routeData['routes'][0]['distance'] ?? null,
                    'route_duration' => $routeData['routes'][0]['duration'] ?? null,
                ]
            ];

        } catch (\Exception $e) {
            Log::error('OSRM validation error: ' . $e->getMessage());
            
            // Fallback to simple distance checking
            return $this->fallbackDistanceValidation($userLat, $userLng, $waypoints, $tolerance);
        }
    }

    /**
     * Fallback validation using simple distance to waypoints
     */
    private function fallbackDistanceValidation($userLat, $userLng, $waypoints, $tolerance)
    {
        $minDistance = null;
        $nearestWaypoint = null;

        foreach ($waypoints as $index => $waypoint) {
            if (isset($waypoint['lat']) && isset($waypoint['lng'])) {
                $distance = $this->calculateDistance(
                    $userLat, 
                    $userLng, 
                    $waypoint['lat'], 
                    $waypoint['lng']
                );
                
                if ($minDistance === null || $distance < $minDistance) {
                    $minDistance = $distance;
                    $nearestWaypoint = $index + 1;
                }
            }
        }

        $isValid = $minDistance !== null && $minDistance <= $tolerance;

        return [
            'is_valid' => $isValid,
            'message' => $isValid 
                ? "Location verified within {$tolerance}m of waypoint {$nearestWaypoint} (distance: " . round($minDistance, 2) . "m)."
                : "You are " . round($minDistance, 2) . "m away from the nearest waypoint. Required distance: {$tolerance}m.",
            'route_data' => [
                'distance_to_nearest_waypoint' => round($minDistance, 2),
                'nearest_waypoint' => $nearestWaypoint,
                'tolerance' => $tolerance,
                'validation_method' => 'fallback_waypoint_distance'
            ]
        ];
    }

    /**
     * Calculate minimum distance from user location to route line
     */
    private function calculateMinDistanceToRoute($userLat, $userLng, $routeCoordinates)
    {
        $minDistance = null;

        // Check distance to each segment of the route
        for ($i = 0; $i < count($routeCoordinates) - 1; $i++) {
            $segmentStart = $routeCoordinates[$i];
            $segmentEnd = $routeCoordinates[$i + 1];
            
            // Calculate distance from point to line segment
            $distance = $this->distanceFromPointToLineSegment(
                $userLat, 
                $userLng,
                $segmentStart[1], // lat
                $segmentStart[0], // lng
                $segmentEnd[1],   // lat
                $segmentEnd[0]    // lng
            );
            
            if ($minDistance === null || $distance < $minDistance) {
                $minDistance = $distance;
            }
        }

        return $minDistance ?? $this->calculateDistance(
            $userLat, 
            $userLng, 
            $routeCoordinates[0][1], 
            $routeCoordinates[0][0]
        );
    }

    /**
     * Calculate distance from a point to a line segment
     */
    private function distanceFromPointToLineSegment($px, $py, $x1, $y1, $x2, $y2)
    {
        // Convert to Cartesian coordinates for easier calculation
        $A = $px - $x1;
        $B = $py - $y1;
        $C = $x2 - $x1;
        $D = $y2 - $y1;

        $dot = $A * $C + $B * $D;
        $lenSq = $C * $C + $D * $D;
        
        if ($lenSq == 0) {
            // Point is same as line start
            return $this->calculateDistance($px, $py, $x1, $y1);
        }

        $param = $dot / $lenSq;

        if ($param < 0) {
            // Closest point is line start
            return $this->calculateDistance($px, $py, $x1, $y1);
        } elseif ($param > 1) {
            // Closest point is line end
            return $this->calculateDistance($px, $py, $x2, $y2);
        } else {
            // Closest point is on the line segment
            $xx = $x1 + $param * $C;
            $yy = $y1 + $param * $D;
            return $this->calculateDistance($px, $py, $xx, $yy);
        }
    }

    /**
     * Calculate distance between two geographic points using Haversine formula
     */
    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371000; // Earth's radius in meters
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        
        $lat1 = deg2rad($lat1);
        $lat2 = deg2rad($lat2);
        
        $a = sin($dLat/2) * sin($dLat/2) +
             sin($dLng/2) * sin($dLng/2) * cos($lat1) * cos($lat2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c; // Distance in meters
    }

    /**
     * Format location string from request data
     */
    private function formatLocation($request)
    {
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $accuracy = $request->input('accuracy');
        
        if ($lat && $lng) {
            $location = "{$lat}, {$lng}";
            if ($accuracy) {
                $location .= " (±{$accuracy}m)";
            }
            return $location;
        }
        
        return 'Location not available';
    }

    // Example helper for geo_polygon
    protected function isPointInPolygon($lat, $lng, $polygon)
    {
        // Implement point-in-polygon algorithm or use a package
        // For now, always return true for demo
        return true;
    }

    public function punchIn(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate incoming request data
            $request->validate([
                'user_id' => 'required|integer',
                'location' => 'required',
            ]);

            // Get the current user
            $currentUser = Auth::user();
            $today = Carbon::today();

            // Attempt to create or update the attendance record
            Attendance::create([
                'user_id' => $request->user_id,
                'date' => Carbon::today(),
                'punchin' => Carbon::now(),
                'punchin_location' => $request->location
            ]);

            // Return success response with no punches if there are none
            return response()->json([
                'success' => true,
                'message' => 'Successfully punched in!',
            ]);
        } catch (\Exception $e) {
            // Handle exceptions
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function punchOut(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate incoming request data
            $request->validate([
                'user_id' => 'required|integer', // Assuming user_id should be an integer
                'location' => 'required',
            ]);

            // Find the attendance record for the user and date
            $attendance = Attendance::where('user_id', $request->user_id)
                ->where('date', Carbon::today())
                ->latest()
                ->firstOrFail();

            // Update punchout and punchout_location fields
            $attendance->punchout = Carbon::now();
            $attendance->punchout_location = $request->location;
            $attendance->save();

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Successfully punched out!'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle the case where the attendance record is not found
            return response()->json(['error' => 'Attendance record not found.'], 404);
        } catch (\Exception $e) {
            // Handle other exceptions
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getUserLocationsForDate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $selectedDate = Carbon::parse($request->query('date'))->format('Y-m-d');

            $userLocations = Attendance::whereNotNull('punchin')
                ->whereDate('date', $selectedDate)
                ->get()
                ->map(function ($location) {
                    $user = User::find($location->user_id);

                    return [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'profile_image' => $user->profile_image,
                        'designation' => Designation::find($user->designation)->title,
                        'punchin_location' => $location->punchin_location,
                        'punchout_location' => $location->punchout_location,
                        'punchin_time' => $location->punchin,
                        'punchout_time' => $location->punchout,
                    ];
                });

            return response()->json([
                'locations' => $userLocations,
                'date' => $selectedDate
            ]);

        } catch (\Exception $e) {
            // Return a standardized error response
            return response()->json([
                'error' => 'Unable to fetch user locations. Please try again later.'
            ], 500);
        }
    }
    public function getCurrentUserPunch(): \Illuminate\Http\JsonResponse
    {
        $today = Carbon::today();

        try {
            $currentUser = Auth::user();

            // Efficiently check if the user is on leave today
            $userLeave = DB::table('leaves')
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                ->select('leaves.*', 'leave_settings.type as leave_type')
                ->where('leaves.user_id', $currentUser->id)
                ->whereDate('leaves.from_date', '<=', $today)
                ->whereDate('leaves.to_date', '>=', $today)
                ->first();

            $userAttendances = Attendance::with('user:id,name')
                ->whereNotNull('punchin')
                ->whereDate('date', $today)
                ->where('user_id', $currentUser->id)
                ->orderBy('punchin')
                ->get();

            $punches = [];
            $totalProductionTime = 0;

            if ($userAttendances->isNotEmpty()) {
                $now = Carbon::now();
                $punches = $userAttendances->map(function ($attendance) use (&$totalProductionTime, $now) {
                    $punchInTime = Carbon::parse($attendance->punchin);
                    $punchOutTime = $attendance->punchout ? Carbon::parse($attendance->punchout) : $now;
                    $duration = $punchInTime->diffInSeconds($punchOutTime);
                    $totalProductionTime += $duration;

                    return [
                        'date' => $attendance->date,
                        'punchin_time' => $attendance->punchin,
                        'punchin_location' => $attendance->punchin_location,
                        'punchout_time' => $attendance->punchout,
                        'punchout_location' => $attendance->punchout_location,
                        'duration' => gmdate('H:i:s', $duration)
                    ];
                });
            }

            return response()->json([
                'punches' => $punches,
                'total_production_time' => gmdate('H:i:s', $totalProductionTime),
                'isUserOnLeave' => $userLeave // null if not on leave, or leave object if on leave
            ]);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json('An error occurred while retrieving attendance data.', 500);
        }
    }

    public function getAllUsersAttendanceForDate(Request $request): \Illuminate\Http\JsonResponse
    {
        // Get the date from the query parameter, defaulting to today's date if none is provided
        $selectedDate = Carbon::parse($request->query('date'))->format('Y-m-d');
        $perPage = $request->get('perPage', 10); // Default to 10 users per page
        $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
        $employee = $request->get('employee', '');


        try {
            // Get all users with Employee role
            $allUsers = User::role('Employee')->get();

            // Get users who have attendance for the selected date
            $usersWithAttendanceQuery = User::role('Employee')
                ->whereHas('attendances', function ($query) use ($selectedDate) {
                    $query->whereNotNull('punchin')
                          ->whereDate('date', $selectedDate);
                });

            // Apply employee search filter if provided
            if ($employee !== '') {
                $usersWithAttendanceQuery->where('name', 'like', '%' . $employee . '%');
            }

            // Get users with attendance (for pagination)
            $usersWithAttendance = $usersWithAttendanceQuery->get();

            // Paginate users (not attendance records)
            $paginatedUsers = $usersWithAttendance->forPage($page, $perPage);

            // Get user IDs for the current page
            $userIds = $paginatedUsers->pluck('id');

            // Get ALL attendance records for these users on the selected date
            $attendanceRecords = Attendance::with('user')
                ->whereNotNull('punchin')
                ->whereDate('date', $selectedDate)
                ->whereIn('user_id', $userIds)
                ->orderBy('user_id')
                ->orderBy('punchin')
                ->get();

            // Identify absent users: filter out users who don't have any attendance record
            $absentUsers = $allUsers->filter(function ($user) use ($usersWithAttendance) {
                return !$usersWithAttendance->contains('id', $user->id);
            });

            if ($attendanceRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No attendance records found for the selected date.',
                    'attendances' => [],
                    'absent_users' => $allUsers->values(), // All users are absent if no attendance is recorded
                    'leaves' => [],
                    'current_page' => $page,
                    'last_page' => 1,
                    'total' => 0,
                ]);
            }

            // Transform the attendance records into a response-friendly format
            $formattedRecords = $attendanceRecords->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => Carbon::parse($record->date)->toIso8601String(),
                    'user' => $record->user,
                    'punchin_time' => $record->punchin,
                    'punchin_location' => $record->punchin_location,
                    'punchout_time' => $record->punchout,
                    'punchout_location' => $record->punchout_location,
                ];
            });



            // Get today's leaves
            $todayLeaves = DB::table('leaves')
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                ->select('leaves.*', 'leave_settings.type as leave_type')
                ->whereDate('leaves.from_date', '<=', $selectedDate)
                ->whereDate('leaves.to_date', '>=', $selectedDate)
                ->get();

            // Calculate pagination info based on users, not attendance records
            $totalUsers = $usersWithAttendance->count();
            $lastPage = ceil($totalUsers / $perPage);

            // Return paginated data for attendances, absent users, and leave data
            return response()->json([
                'attendances' => $formattedRecords,
                'absent_users' => $absentUsers->values(),
                'leaves' => $todayLeaves,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $totalUsers, // Total number of users with attendance, not total records
            ]);

        } catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception); // Report the exception for debugging or logging
            return response()->json([
                'error' => 'An error occurred while retrieving attendance data.',
                'details' => $exception->getMessage() // Return the error message for debugging
            ], 500);
        }
    }
    public function getCurrentUserAttendanceForDate(Request $request): \Illuminate\Http\JsonResponse
    {
        $perPage = $request->get('perPage', 10); // Default to 30 items per page
        $page = $request->get('employee') != '' ? 1 : $request->get('page', 1);
        $currentMonth = $request->get('currentMonth'); // Filter by start date
        $currentYear = $request->get('currentYear'); // Filter by end date

        try {

            $attendanceQuery = Attendance::whereNotNull('punchin')
                ->where('user_id', Auth::id())
                ->whereYear('date', $currentYear)
                ->whereMonth('date', $currentMonth);


            $attendanceRecords = $attendanceQuery->paginate($perPage, ['*'], 'page', $page);

            if ($attendanceRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No attendance records found for the selected month.',
                    'absent_users' => [] // All users are absent if no attendance is recorded
                ], 404);
            }

            // Transform the attendance records into a response-friendly format
            $formattedRecords = $attendanceRecords->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => Carbon::parse($record->date)->toIso8601String(),
                    'punchin_time' => $record->punchin,
                    'punchin_location' => $record->punchin_location,
                    'punchout_time' => $record->punchout,
                    'punchout_location' => $record->punchout_location,
                ];
            });




            // Return paginated data for attendances, absent users, and leave data
            return response()->json([
                'attendances' => $formattedRecords,
                'absent_users' => [], // Return absent users in array format
                'leaves' => [],
                'current_page' => $attendanceRecords->currentPage(),
                'last_page' => $attendanceRecords->lastPage(),
                'total' => $attendanceRecords->total(),
            ]);

        } catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception); // Report the exception for debugging or logging
            return response()->json([
                'error' => 'An error occurred while retrieving attendance data.',
                'details' => $exception->getMessage() // Return the error message for debugging
            ], 500);
        }
    }
}
