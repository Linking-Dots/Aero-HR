<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Designation;
use App\Models\Jurisdiction;
use App\Models\LeaveSetting;
use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Throwable;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function index()
    {
        return Inertia::render('AttendanceAdmin', [
            'title' => 'Attendances of Employees',
        ]);
    }

    public function paginate(Request $request)
    {
        try {
            $perPage = $request->get('perPage', 30); // Default to 10 items per page
            $page = $request->get('search') != '' ? 1 : $request->get('page', 1);
            $employee = $request->get('employee'); // Search query
            $currentMonth = $request->get('currentMonth'); // Filter by start date
            $currentYear = $request->get('currentYear'); // Filter by end date

            $users = User::whereHas('roles', function($query) {
                $query->where('name', 'Employee');
            })->with([
                'attendances' => function ($query) use ($currentYear, $currentMonth) {
                    $query->whereYear('date', $currentYear)
                        ->whereMonth('date', $currentMonth);
                },
                'leaves' => function ($query) use ($currentYear, $currentMonth) {
                    $query->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                        ->select('leaves.*', 'leave_settings.type as leave_type')
                        ->where(function ($query) use ($currentYear, $currentMonth) {
                            $query->whereYear('leaves.from_date', $currentYear)
                                ->whereMonth('leaves.from_date', $currentMonth)
                                ->orWhereYear('leaves.to_date', $currentYear)
                                ->whereMonth('leaves.to_date', $currentMonth);
                        })
                        ->orderBy('leaves.from_date', 'desc');
                }
            ]);

            $users = $users->get();

            $leaveTypes = LeaveSetting::all();

            $leaveCounts = DB::table('leaves')
                ->join('leave_settings', 'leaves.leave_type', '=', 'leave_settings.id')
                ->select(
                    'leaves.user_id',
                    'leave_settings.type as leave_type',
                    DB::raw('SUM(DATEDIFF(leaves.to_date, leaves.from_date) + 1) as total_days')
                )
                ->where(function ($query) use ($currentYear, $currentMonth) {
                    $query->whereYear('leaves.from_date', $currentYear)
                        ->whereMonth('leaves.from_date', $currentMonth)
                        ->orWhereYear('leaves.to_date', $currentYear)
                        ->whereMonth('leaves.to_date', $currentMonth);
                })
                ->groupBy('leaves.user_id', 'leave_settings.type') // Ensure leave type is included
                ->get();


            $leaveCountsArray = [];

            foreach ($leaveCounts as $leave) {
                $userId = $leave->user_id;
                $leaveType = $leave->leave_type;
                $totalDays = $leave->total_days;

                // Initialize user and leave types if not set
                if (!isset($leaveCountsArray[$userId])) {
                    $leaveCountsArray[$userId] = [
                        'Casual' => 0,
                        'Sick' => 0,
                        'Weekend' => 0,
                        'Earned' => 0
                    ];
                }

                // Add the leave days to the respective leave type
                $leaveCountsArray[$userId][$leaveType] = $totalDays;
            }

            $attendances = $users->map(function ($user) use ($currentYear, $currentMonth) {
                $daysInMonth = Carbon::create($currentYear, $currentMonth)->daysInMonth;
                $attendanceData = ['user_id' => $user->id, 'name' => $user->name, 'profile_image' => $user->profile_image];
                $leaveTypes = LeaveSetting::all();

                // Loop through each day of the month
                for ($day = 1; $day <= $daysInMonth; $day++) {
                    $date = Carbon::create($currentYear, $currentMonth, $day)->toDateString();

                    // Check if the user has leave on this date
                    $leave = $user->leaves->first(function ($leave) use ($date) {
                        return Carbon::parse($date)->between($leave->from_date, $leave->to_date);
                    });

                    if ($leave) {
                        $leaveType = $leaveTypes->firstWhere('type', $leave->leave_type);
                        $attendanceData[$date] = $leaveType ? $leaveType->symbol : '√';
                    } else {
                        // Check if the user was present on this date
                        $attendance = $user->attendances->firstWhere('date', $date);
                        $attendanceData[$date] = $attendance && $attendance->punchin ? '√' : '▼'; // Present or Absent
                    }
                }

                return $attendanceData;
            });



            // Sort the collection by 'user_id'
            $sortedAttendances = $attendances->sortBy('user_id');

            // Paginate manually
            $paginatedAttendances = $sortedAttendances->slice(($page - 1) * $perPage, $perPage)->values();

            if ($employee) {
                $paginatedAttendances = $paginatedAttendances->filter(function ($attendance) use ($employee) {
                    return stripos($attendance['name'], $employee) !== false;
                })->values();
            }

            // Return the paginated response as JSON
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

    public function updateAttendance(Request $request)
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

    public function punchIn(Request $request)
    {
        try {
            // Validate incoming request data
            $request->validate([
                'user_id' => 'required|integer',
                'location' => 'required',
            ]);

            // Attempt to create or update the attendance record
            $attendance = Attendance::updateOrCreate(
                ['user_id' => $request->user_id, 'date' => Carbon::today()],
                [
                    'punchin' => Carbon::now(),
                    'punchin_location' => $request->location
                ]
            );

            // Update punchin and punchin_location in case they were not set during creation
            $attendance->punchin_location = $request->location;
            $attendance->save();

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Successfully punched in!'
            ]);
        } catch (\Exception $e) {
            // Handle exceptions
            // You can log the error, return a custom error message, or handle it in any other way you prefer
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function punchOut(Request $request)
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


    public function getUserLocationsForToday()
    {
        try {
            $today = Carbon::today();

            $userLocations = Attendance::whereNotNull('punchin')
                ->whereDate('date', $today)
                ->get()
                ->map(function ($location) {
                    $user = User::find($location->user_id);

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'profile_image' => $user->profile_image,
                        'designation' => Designation::find($user->designation)->title,
                        'punchin_location' => $location->punchin_location,
                        'punchout_location' => $location->punchout_location,
                        'punchin_time' => $location->punchin,
                        'punchout_time' => $location->punchout,
                    ];
                });

            return response()->json($userLocations);

        } catch (\Exception $e) {
            // Return a standardized error response
            return response()->json([
                'error' => 'Unable to fetch user locations. Please try again later.'
            ], 500);
        }
    }



    public function getCurrentUserPunch()
    {
        $today = Carbon::today();

        try {
            // Get the currently authenticated user (replace with your authentication method)
            $currentUser = Auth::user();

            $userAttendance = Attendance::with('user:id,name')  // Include user data, specifically the first_name
            ->whereNotNull('punchin')
                ->whereDate('date', $today)
                ->where('user_id', $currentUser->id)  // Filter for current user
                ->first();  // Retrieve only the first matching record (assuming there's only one)

            if ($userAttendance) {
                return response()->json([
                    'date' => $userAttendance->date,
                    'punchin_time' => $userAttendance->punchin,
                    'punchin_location' => $userAttendance->punchin_location,
                    'punchout_time' => $userAttendance->punchout,
                    'punchout_location' => $userAttendance->punchout_location,
                ]);
            } else {
                // Handle the case where no punch-in data is found for the current user on today's date
                return response()->json('Not punched in yet'); // Example: Return a 404 Not Found response
            }
        } catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception);  // Report the exception for debugging or logging
            return response()->json('An error occurred while retrieving attendance data.', 500);  // Example: Return a 500 Internal Server Error response
        }
    }

    public function getAllUsersAttendanceForDate(Request $request)
    {

        // Get the date from the query parameter, defaulting to today's date if none is provided
        $selectedDate = Carbon::parse($request->query('date'))->format('Y-m-d');



        try {
            // Get attendance records for all users for the selected date
            $attendanceRecords = Attendance::with('user')  // Include user data with first_name and avatar
            ->whereNotNull('punchin')
                ->whereDate('date', $selectedDate)
                ->get();  // Retrieve all matching records



            if ($attendanceRecords->isEmpty()) {
                // Handle the case where no punch-in data is found for any user on the selected date
                return response()->json(['message' => 'No attendance records found for the selected date.'], 404);
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

            return response()->json($formattedRecords);

        } catch (Throwable $exception) {
            // Handle unexpected exceptions during data retrieval
            report($exception);  // Report the exception for debugging or logging
            return response()->json([
                'error' => 'An error occurred while retrieving attendance data.',
                'details' => $exception->getMessage() // Return the error message for debugging
            ], 500);
        }
    }



}
