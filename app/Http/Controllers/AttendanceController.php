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
    }    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $perPage = (int) $request->get('perPage', 30);
            $page = $request->get('employee') != '' ? 1 : (int) $request->get('page', 1);
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
            }            return response()->json([
                'data' => $paginatedAttendances,
                'total' => (int) $sortedAttendances->count(),
                'page' => (int) $page,
                'last_page' => (int) ceil($sortedAttendances->count() / $perPage),
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
        $attendanceData = ['user_id' => $user->id, 'employee_id' => $user->employee_id, 'name' => $user->name, 'profile_image' => $user->profile_image];

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

        // 2. Validate attendance based on type configuration
        $validation = $this->validateAttendanceType($attendanceType, $request);
        if ($validation['status'] === 'error') {
            return response()->json($validation, $validation['code']);
        }

        // 3. Process the punch using the service
        $punchService = new \App\Services\Attendance\AttendancePunchService();
        $result = $punchService->processPunch($user, $request);

        if ($result['status'] === 'error') {
            return response()->json($result, $result['code']);
        }

        return response()->json($result);
    }

    /**
     * Validate attendance based on type configuration
     */
    private function validateAttendanceType($attendanceType, Request $request)
    {
        try {
            $validator = \App\Services\Attendance\AttendanceValidatorFactory::create($attendanceType, $request);
            return $validator->validate();
        } catch (\InvalidArgumentException $e) {
            return [
                'status' => 'error',
                'message' => 'Invalid attendance type configuration: ' . $e->getMessage(),
                'code' => 422
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Attendance validation error: ' . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Validation failed. Please try again.',
                'code' => 500
            ];
        }
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
                    $user = User::find($location->user_id);                    return [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'profile_image' => $user->profile_image,
                        'designation' => Designation::find($user->designation)->title,
                        'punchin_location' => $location->punchin_location_array,
                        'punchout_location' => $location->punchout_location_array,
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
                    $totalProductionTime += $duration;                    return [
                        'date' => $attendance->date,
                        'punchin_time' => $attendance->punchin,
                        'punchin_location' => $attendance->punchin_location_array,
                        'punchout_time' => $attendance->punchout,
                        'punchout_location' => $attendance->punchout_location_array,
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
    }    public function getAllUsersAttendanceForDate(Request $request): \Illuminate\Http\JsonResponse
    {        // Get the date from the query parameter, defaulting to today's date if none is provided
        $selectedDate = Carbon::parse($request->query('date'))->format('Y-m-d');
        $perPage = (int) $request->get('perPage', 10); // Default to 10 users per page
        $page = $request->get('employee') != '' ? 1 : (int) $request->get('page', 1);
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
            });            if ($attendanceRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No attendance records found for the selected date.',
                    'attendances' => [],
                    'absent_users' => $allUsers->values(), // All users are absent if no attendance is recorded
                    'leaves' => [],
                    'current_page' => (int) $page,
                    'last_page' => 1,
                    'total' => 0,
                ]);
            }

            // Group attendance records by user (Admin view logic)
            $groupedByUser = $attendanceRecords->groupBy('user_id')->map(function ($userAttendances) {
                $firstRecord = $userAttendances->first();
                $user = $firstRecord->user;
                
                // Sort punches by time
                $sortedPunches = $userAttendances->sortBy('punchin');
                
                // Calculate totals for this user
                $totalWorkMinutes = 0;
                $completePunches = 0;
                $hasIncompletePunch = false;
                
                $punches = $sortedPunches->map(function ($record) use (&$totalWorkMinutes, &$completePunches, &$hasIncompletePunch) {
                    if ($record->punchin && $record->punchout) {
                        $punchIn = Carbon::parse($record->punchin);
                        $punchOut = Carbon::parse($record->punchout);
                        $workMinutes = $punchIn->diffInMinutes($punchOut);
                        $totalWorkMinutes += $workMinutes;
                        $completePunches++;
                    } elseif ($record->punchin && !$record->punchout) {
                        $hasIncompletePunch = true;
                    }
                    
                    return [
                        'punch_in' => $record->punchin,
                        'punch_out' => $record->punchout,
                        'id' => $record->id,
                        'date' => $record->date,
                        'punchin_location' => $record->punchin_location_array,
                        'punchout_location' => $record->punchout_location_array,
                    ];
                })->values();
                
                // Get first punch and last complete punch
                $firstPunch = $sortedPunches->first();
                $lastCompletePunch = $sortedPunches->where('punchout', '!=', null)->last();
                
                return [
                    'id' => 'user-' . $user->id, // Unique ID for user grouping
                    'user_id' => $user->id,
                    'user' => $user,
                    'date' => $firstRecord->date,
                    'punchin_time' => $firstPunch->punchin,
                    'punchout_time' => $lastCompletePunch ? $lastCompletePunch->punchout : null,
                    'punchin_location' => $firstPunch->punchin_location_array,
                    'punchout_location' => $lastCompletePunch ? $lastCompletePunch->punchout_location_array : null,
                    'total_work_minutes' => round($totalWorkMinutes, 2),
                    'punch_count' => $userAttendances->count(),
                    'complete_punches' => $completePunches,
                    'has_incomplete_punch' => $hasIncompletePunch,
                    'first_punch_date' => $firstRecord->date,
                    'last_punch_date' => $sortedPunches->last()->date,
                    'punches' => $punches
                ];
            })->values();

            // Get today's leaves
            $todayLeaves = DB::table('leaves')
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                ->select('leaves.*', 'leave_settings.type as leave_type')
                ->whereDate('leaves.from_date', '<=', $selectedDate)
                ->whereDate('leaves.to_date', '>=', $selectedDate)
                ->get();            // Calculate pagination info based on users, not attendance records
            $totalUsers = $usersWithAttendance->count();
            $lastPage = (int) ceil($totalUsers / $perPage);

            // Return paginated data for attendances, absent users, and leave data
            return response()->json([
                'attendances' => $groupedByUser,
                'absent_users' => $absentUsers->values(),
                'leaves' => $todayLeaves,
                'current_page' => (int) $page,
                'last_page' => $lastPage,
                'total' => (int) $totalUsers, // Total number of users with attendance, not total records
            ]);

        } catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception); // Report the exception for debugging or logging
            return response()->json([
                'error' => 'An error occurred while retrieving attendance data.',
                'details' => $exception->getMessage() // Return the error message for debugging
            ], 500);
        }
    }    public function getCurrentUserAttendanceForDate(Request $request): \Illuminate\Http\JsonResponse
    {
        $perPage = (int) $request->get('perPage', 10); // Default to 10 items per page
        $page = $request->get('employee') != '' ? 1 : (int) $request->get('page', 1);
        $currentMonth = $request->get('currentMonth'); // Filter by month
        $currentYear = $request->get('currentYear'); // Filter by year

        try {
            // Get all attendance records for the current user for the specified month/year
            $attendanceRecords = Attendance::with('user')
                ->whereNotNull('punchin')
                ->where('user_id', Auth::id())
                ->whereYear('date', $currentYear)
                ->whereMonth('date', $currentMonth)
                ->orderBy('date')
                ->orderBy('punchin')
                ->get();            if ($attendanceRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No attendance records found for the selected month.',
                    'attendances' => [],
                    'absent_users' => [],
                    'leaves' => [],
                    'current_page' => (int) $page,
                    'last_page' => 1,
                    'total' => 0,
                ]);
            }

            // Group attendance records by date (Employee view logic)
            $groupedByDate = $attendanceRecords->groupBy(function ($record) {
                return Carbon::parse($record->date)->format('Y-m-d');
            })->map(function ($dateAttendances, $date) {
                $firstRecord = $dateAttendances->first();
                $user = $firstRecord->user;
                
                // Sort punches by time for this date
                $sortedPunches = $dateAttendances->sortBy('punchin');
                
                // Calculate totals for this date
                $totalWorkMinutes = 0;
                $completePunches = 0;
                $hasIncompletePunch = false;
                
                $punches = $sortedPunches->map(function ($record) use (&$totalWorkMinutes, &$completePunches, &$hasIncompletePunch) {
                    if ($record->punchin && $record->punchout) {
                        $punchIn = Carbon::parse($record->punchin);
                        $punchOut = Carbon::parse($record->punchout);
                        $workMinutes = $punchIn->diffInMinutes($punchOut);
                        $totalWorkMinutes += $workMinutes;
                        $completePunches++;
                    } elseif ($record->punchin && !$record->punchout) {
                        $hasIncompletePunch = true;
                    }
                    
                    return [
                        'punch_in' => $record->punchin,
                        'punch_out' => $record->punchout,
                        'id' => $record->id,
                        'date' => $record->date,
                        'punchin_location' => $record->punchin_location_array,
                        'punchout_location' => $record->punchout_location_array,
                    ];
                })->values();
                
                // Get first punch and last complete punch for this date
                $firstPunch = $sortedPunches->first();
                $lastCompletePunch = $sortedPunches->where('punchout', '!=', null)->last();
                
                return [
                    'id' => $firstRecord->id, // Use first record ID for the date
                    'user_id' => $user->id,
                    'user' => $user,
                    'date' => $date,
                    'punchin_time' => $firstPunch->punchin,
                    'punchout_time' => $lastCompletePunch ? $lastCompletePunch->punchout : null,
                    'punchin_location' => $firstPunch->punchin_location_array,
                    'punchout_location' => $lastCompletePunch ? $lastCompletePunch->punchout_location_array : null,
                    'total_work_minutes' => round($totalWorkMinutes, 2),
                    'punch_count' => $dateAttendances->count(),
                    'complete_punches' => $completePunches,
                    'has_incomplete_punch' => $hasIncompletePunch,
                    'first_punch_date' => $date,
                    'last_punch_date' => $date,
                    'punches' => $punches
                ];
            })->values();

            // Sort by date descending (newest first)
            $sortedByDate = $groupedByDate->sortByDesc('date')->values();            // Apply pagination to the grouped data
            $paginatedData = $sortedByDate->forPage($page, $perPage)->values();
            $totalRecords = $sortedByDate->count();
            $lastPage = (int) ceil($totalRecords / $perPage);

            // Return paginated data for attendances
            return response()->json([
                'attendances' => $paginatedData,
                'absent_users' => [], // No absent users for employee view
                'leaves' => [],
                'current_page' => (int) $page,
                'last_page' => $lastPage,
                'total' => (int) $totalRecords,
            ]);} catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception); // Report the exception for debugging or logging
              return response()->json([
                'error' => 'An error occurred while retrieving attendance data.',
                'details' => $exception->getMessage() // Return the error message for debugging
            ], 500);
        }
    }

    /**
     * Get the client's IP address
     */
    public function getClientIp(Request $request): \Illuminate\Http\JsonResponse
    {
        $ip = $request->ip();
        
        // Try to get the real IP if behind proxy
        if ($request->hasHeader('X-Forwarded-For')) {
            $ip = $request->header('X-Forwarded-For');
            // If multiple IPs, get the first one
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
        } elseif ($request->hasHeader('X-Real-IP')) {
            $ip = $request->header('X-Real-IP');
        }
        
        return response()->json([
            'ip' => $ip,
            'timestamp' => now()->toISOString()
        ]);
    }
}
