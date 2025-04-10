<?php

namespace App\Http\Controllers;

use App\Imports\DailyWorkImport;
use App\Models\DailySummary;
use App\Models\DailyWork;
use App\Models\DailyWorkSummary;
use App\Models\Jurisdiction;
use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use ErrorException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DailyWorkController extends Controller
{

    public function index()
    {
        $user = Auth::user();
        $allData = $user->hasRole('Supervision Engineer')
            ? [
                'allInCharges' => [],
                'juniors' => User::where('report_to', $user->id)->get(),

            ]
            : ($user->hasRole('Quality Control Inspector') || $user->hasRole('Asst. Quality Control Inspector')
                ? []
                : ($user->hasRole('Administrator')
                    ? [
                        'allInCharges' => User::role('Supervision Engineer')->get(),
                        'juniors' => [],
                    ]
                    : []
                )
            );
        $reports = Report::all();
        $reports_with_daily_works = Report::with('daily_works')->has('daily_works')->get();
        $users = User::with('roles')->get();

        // Loop through each user and add a new field 'role' with the role name
        $users->transform(function ($user) {
            $user->role = $user->roles->first()->name;
            return $user;
        });

        $overallStartDate = DailyWork::min('date'); // Earliest date from all records
        $overallEndDate = DailyWork::max('date'); // Latest date from all records

        return Inertia::render('Project/DailyWorks', [
            'allData' => $allData,
            'jurisdictions' => Jurisdiction::all(),
            'users' => $users,
            'title' => 'Daily Works',
            'reports' => $reports,
            'reports_with_daily_works' => $reports_with_daily_works,
            'overallStartDate' => $overallStartDate,
            'overallEndDate' => $overallEndDate,
        ]);
    }


    public function paginate(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('perPage', 30); // Default to 10 items per page
        $page = $request->get('search') != '' ? 1 : $request->get('page', 1);
        $search = $request->get('search'); // Search query
        $statusFilter = $request->get('status'); // Filter by status
        $inChargeFilter = $request->get('inCharge'); // Filter by inCharge
        $startDate = $request->get('startDate'); // Filter by start date
        $endDate = $request->get('endDate'); // Filter by end date

        // Base query depending on user's role
        $query = $user->hasRole('Supervision Engineer')
            ? DailyWork::with('reports')->where('incharge', $user->id)
            : ($user->hasRole('Quality Control Inspector') || $user->hasRole('Asst. Quality Control Inspector')
                ? DailyWork::with('reports')->where('assigned', $user->id)
                : ($user->hasRole('Administrator')
                    ? DailyWork::with('reports')
                    : DailyWork::query()
                )
            );

        // Apply search if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%");
            });
        }

        // Apply status filter if provided
        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }

        // Apply in-charge filter if provided
        if ($inChargeFilter) {
            $query->where('incharge', $inChargeFilter);
        }

        // Apply date range filter if provided
        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('date', '>=', $startDate);
        }

        // Order by 'date' in descending order
        $paginatedDailyWorks = $query->orderBy('date', 'desc')->paginate($perPage, ['*'], 'page', $page);


        // Return the paginated response as JSON
        return response()->json($paginatedDailyWorks);
    }


    public function all(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        $search = $request->get('search'); // Search query
        $statusFilter = $request->get('status'); // Filter by status
        $inChargeFilter = $request->get('inCharge'); // Filter by inCharge
        $startDate = $request->get('startDate'); // Filter by start date
        $endDate = $request->get('endDate'); // Filter by end date

        // Base query depending on user's role
        $query = $user->hasRole('Supervision Engineer')
            ? DailyWork::with('reports')->where('incharge', $user->id)
            : ($user->hasRole('Quality Control Inspector') || $user->hasRole('Asst. Quality Control Inspector')
                ? DailyWork::with('reports')->where('assigned', $user->id)
                : ($user->hasRole('Administrator')
                    ? DailyWork::with('reports')
                    : DailyWork::query()
                )
            );

        // Apply search if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%");
            });
        }

        // Apply status filter if provided
        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }

        // Apply in-charge filter if provided
        if ($inChargeFilter) {
            $query->where('incharge', $inChargeFilter);
        }

        // Apply date range filter if provided
        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('date', '>=', $startDate);
        }

        // Order by 'date' in descending order
        $allDailyWorks = $query->orderBy('date', 'desc')->get();


        // Return the paginated response as JSON
        return response()->json($allDailyWorks);
    }

    public function import(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:xlsx,csv',
            ]);

            $path = $request->file('file')->store('temp');
            $importedSheets = Excel::toArray(new DailyWorkImport, $path); // Retrieve all sheets

            foreach ($importedSheets as $sheetIndex => $importedDailyWorks) {

                // Skip empty sheets
                if (empty($importedDailyWorks)) {
                    continue;
                }

                $index = $sheetIndex + 1; // Increment index for display
                $customAttributes = [];
                $referenceDate = $importedDailyWorks[0][0] ?? null; // First date of the sheet

                if (!$referenceDate) {
                    return response()->json(["errors" => "Sheet {$index} is missing a reference date."], 422);
                }

                foreach ($importedDailyWorks as $rowIndex => $importedDailyWork) {
                    $taskNumber = $importedDailyWork[1] ?? 'unknown';
                    $date = $importedDailyWork[0] ?? 'unknown';

                    $customAttributes["$rowIndex.0"] = "Sheet {$index} - Daily Work number {$taskNumber}'s date {$date}";
                    $customAttributes["$rowIndex.1"] = "Sheet {$index} - Daily Work number {$taskNumber}'s RFI number";
                    $customAttributes["$rowIndex.2"] = "Sheet {$index} - Daily Work number {$taskNumber}'s type";
                    $customAttributes["$rowIndex.3"] = "Sheet {$index} - Daily Work number {$taskNumber}'s description";
                    $customAttributes["$rowIndex.4"] = "Sheet {$index} - Daily Work number {$taskNumber}'s location";
                }

                $validator = Validator::make($importedDailyWorks, [
                    '*.0' => [
                        'required',
                        'date_format:Y-m-d',
                        function ($attribute, $value, $fail) use ($referenceDate) {
                            if ($value !== $referenceDate) {
                                $fail("The $attribute must match the reference date {$referenceDate}.");
                            }
                        },
                    ],
                    '*.1' => 'required|string',
                    '*.2' => 'required|string|in:Embankment,Structure,Pavement',
                    '*.3' => 'required|string',
                    '*.4' => 'required|string|custom_location', // Assuming custom validation rule exists for location
                ], [
                    '*.0.required' => ":attribute must have a valid date.",
                    '*.0.date_format' => ":attribute must be in the format Y-m-d.",
                    '*.1.required' => ":attribute must have a value.",
                    '*.2.required' => ":attribute must have a value.",
                    '*.2.in' => ":attribute must be either Embankment, Structure, or Pavement.",
                    '*.3.required' => ":attribute must have a value.",
                    '*.4.required' => ":attribute must have a value.",
                ], $customAttributes);

                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
            }


            foreach ($importedSheets as $sheetIndex => $importedDailyWorks) {
                // Skip empty sheets
                if (empty($importedDailyWorks)) {
                    continue;
                }

                $date = $importedDailyWorks[0][0];

                // Initialize summary variables
                $inChargeSummary = [];



                // Regex for extracting start and end chainages
                $chainageRegex = '/([A-Z]*K[A-Z]*(?:\+[0-9]+(?:\.[0-9]+)?)?)-([A-Z]*K[A-Z]*(?:\+[0-9]+(?:\.[0-9]+)?)?)|([A-Z]*K[A-Z]*(?:\+[0-9]+(?:\.[0-9]+)?)?)(.*)/';


                foreach ($importedDailyWorks as $importedDailyWork) {
                    // Extract chainages from location field
                    if (preg_match($chainageRegex, $importedDailyWork[4], $matches)) {
                        // Extract start and end chainages, if available
                        $startChainage = $matches[1] === "" ? $matches[0] : $matches[1]; // e.g., K05+900 or K30
                        $endChainage = $matches[2] === "" ? null : $matches[2]; // e.g., K06+400 (optional)

                        // Convert chainages to a comparable string format for jurisdiction check
                        $startChainageFormatted = $this->formatChainage($startChainage);
                        $endChainageFormatted = $endChainage ? $this->formatChainage($endChainage) : null;

                        // Retrieve all jurisdictions and compare chainages as strings
                        $jurisdictions = Jurisdiction::all();


                        $jurisdictionFound = false; // Set to false initially

                        foreach ($jurisdictions as $jurisdiction) {
                            $formattedStartJurisdiction = $this->formatChainage($jurisdiction->start_chainage);
                            $formattedEndJurisdiction = $this->formatChainage($jurisdiction->end_chainage);

                            // Check if the start chainage is within the jurisdiction's range
                            if ($startChainageFormatted >= $formattedStartJurisdiction && $startChainageFormatted <= $formattedEndJurisdiction) {
                                Log::info('Jurisdiction Match Found: ' . $formattedStartJurisdiction . "-" . $formattedEndJurisdiction);
                                $jurisdictionFound = $jurisdiction; // Set the found jurisdiction
                                break; // Stop checking once a match is found
                            }

                            // If an end chainage exists, check if it's within the jurisdiction's range
                            if ($endChainageFormatted &&
                                $endChainageFormatted >= $formattedStartJurisdiction &&
                                $endChainageFormatted <= $formattedEndJurisdiction) {
                                Log::info('Jurisdiction Match Found for End Chainage: ' . $formattedStartJurisdiction . "-" . $formattedEndJurisdiction);
                                $jurisdictionFound = $jurisdiction; // Set the found jurisdiction
                                break; // Stop checking once a match is found
                            }
                        }

                        // After loop, check if a jurisdiction was found
                        if ($jurisdictionFound) {
                            $inCharge = $jurisdictionFound->incharge;
                            $inChargeName = User::find($inCharge)->user_name;

                            // Initialize incharge summary if not exists
                            if (!isset($inChargeSummary[$inChargeName])) {
                                $inChargeSummary[$inChargeName] = [
                                    'totalDailyWorks' => 0,
                                    'resubmissions' => 0,
                                    'embankment' => 0,
                                    'structure' => 0,
                                    'pavement' => 0,
                                ];
                            }

                            // Update incharge summary
                            $inChargeSummary[$inChargeName]['totalDailyWorks']++;

                            // Handle task type
                            switch ($importedDailyWork[2]) {
                                case 'Embankment':
                                    $inChargeSummary[$inChargeName]['embankment']++;
                                    break;
                                case 'Structure':
                                    $inChargeSummary[$inChargeName]['structure']++;
                                    break;
                                case 'Pavement':
                                    $inChargeSummary[$inChargeName]['pavement']++;
                                    break;
                            }

                            $existingDailyWork = DailyWork::where('number', $importedDailyWork[1])->first();
                            if ($existingDailyWork) {
                                $inChargeSummary[$inChargeName]['resubmissions']++;
                                $resubmissionCount = $existingDailyWork->resubmission_count ?? 0;
                                $resubmissionCount++;
                                $resubmissionDate = $this->getResubmissionDate($existingDailyWork, $resubmissionCount);

                                // Create updated resubmission record
                                DailyWork::create([
                                    'date' => ($existingDailyWork->status === 'completed' ? $existingDailyWork->date : $importedDailyWork[0]),
                                    'number' => $importedDailyWork[1],
                                    'status' => ($existingDailyWork->status === 'completed' ? 'completed' : 'resubmission'),
                                    'type' => $importedDailyWork[2],
                                    'description' => $importedDailyWork[3],
                                    'location' => $importedDailyWork[4],
                                    'side' => $importedDailyWork[5],
                                    'qty_layer' => $importedDailyWork[6],
                                    'planned_time' => $importedDailyWork[7],
                                    'incharge' => $jurisdictionFound->incharge,
                                    'resubmission_count' => $resubmissionCount,
                                    'resubmission_date' => $resubmissionDate,
                                ]);

                                // Delete old record
                                $existingDailyWork->delete();
                            } else {
                                // Create new task
                                DailyWork::create([
                                    'date' => $importedDailyWork[0],
                                    'number' => $importedDailyWork[1],
                                    'status' => 'new',
                                    'type' => $importedDailyWork[2],
                                    'description' => $importedDailyWork[3],
                                    'location' => $importedDailyWork[4],
                                    'side' => $importedDailyWork[5],
                                    'qty_layer' => $importedDailyWork[6],
                                    'planned_time' => $importedDailyWork[7],
                                    'incharge' => $jurisdictionFound->incharge,
                                ]);
                            }
                        }
                    } else {
                        return response()->json(['error' => 'Invalid chainage format for location: ' . $importedDailyWork[4]]);
                    }
                }

                // Store summary data in DailySummary model for each incharge
                $this->storeSummaryData($inChargeSummary, $date);
            }

            $user = Auth::user();
            $perPage = $request->get('perPage', 30); // Default to 10 items per page
            $page = $request->get('page', 1);

            // Base query depending on user's role
            $query = $user->hasRole('Supervision Engineer')
                ? DailyWork::with('reports')->where('incharge', $user->id)
                : ($user->hasRole('Quality Control Inspector') || $user->hasRole('Asst. Quality Control Inspector')
                    ? DailyWork::with('reports')->where('assigned', $user->id)
                    : ($user->hasRole('Administrator')
                        ? DailyWork::with('reports')
                        : DailyWork::query()
                    )
                );
            $paginatedDailyWorks = $query->orderBy('date', 'desc')->paginate($perPage, ['*'], 'page', $page);

            return response()->json($paginatedDailyWorks);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (ErrorException $e) {
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 500);
        }
    }

// Convert chainage like K05+900 to a comparable format (e.g., K005.900)


    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Find task by ID
            $dailyWork = DailyWork::find($request->id);

            // If task not found, return 404 error response
            if (!$dailyWork) {
                return response()->json(['error' => 'Daily work not found'], 404);
            }

            $messages = [];  // Initialize an empty array to hold success messages

            // Check if the 'ruleSet' is 'details' and perform validation
            if ($request->has('ruleSet') && $request->input('ruleSet') === 'details') {
                $validatedData = $request->validate([
                    'date' => 'required|date',
                    'number' => 'required|string',
                    'type' => 'required|string|in:Embankment,Structure,Pavement',
                    'description' => 'nullable|string',
                    'location' => 'required|string|custom_location',
                    'side' => 'nullable|string',
                    'qty_layer' => 'nullable|string',
                    'planned_time' => 'required|string',
                ]);

                // Update the daily work fields with the validated data
                $fields = [
                    'date' => 'Date',
                    'number' => 'Number',
                    'type' => 'Type',
                    'description' => 'Description',
                    'location' => 'Location',
                    'side' => 'Side',
                    'qty_layer' => 'Quantity Layer',
                    'planned_time' => 'Planned Time',
                ];

                foreach ($fields as $key => $label) {
                    if (array_key_exists($key, $validatedData) && $dailyWork->$key !== $validatedData[$key]) {
                        $dailyWork->$key = $validatedData[$key];
                        $messages[] = "{$label} updated successfully to '{$validatedData[$key]}'";
                    }
                }
            }


            // Additional fields update checks
            if ($request->has('status')) {
                $request->validate(['status' => 'required|string']);
                $dailyWork->status = $request->status;
                $messages[] = 'Daily work status updated to ' . $dailyWork->status;
            }
            if ($request->has('assigned')) {
                if (!empty($request->assigned)) {
                    $request->validate(['assigned' => 'required|exists:users,id']);
                    $dailyWork->assigned = $request->assigned;
                    $messages[] = 'Daily work assigned to ' . User::find($request->assigned)->name;
                } else {
                    $dailyWork->assigned = null;
                    $messages[] = 'Daily work assignee removed';
                }

            }

            if ($request->has('incharge')) {
                $request->validate(['incharge' => 'required|exists:users,id']);
                $dailyWork->incharge = $request->incharge;
                $messages[] = 'Daily work incharge updated to ' . User::find($request->incharge)->name;
            }
            if ($request->has('inspection_details')) {
                $dailyWork->inspection_details = $request->inspection_details;
                $messages[] = 'Inspection details updated successfully';
            }
            if ($request->has('rfi_submission_date')) {
                $dailyWork->rfi_submission_date = $request->rfi_submission_date;
                $messages[] = 'RFI Submission date updated';
            }
            if ($request->has('completion_time')) {
                $dailyWork->completion_time = $request->completion_time;
                $messages[] = 'Completion date-time updated';
            }

            // Save the daily work with the updated fields
            $dailyWork->save();

            // Return JSON response with the success messages
            return response()->json(['messages' => $messages]);

        } catch (ValidationException $e) {
            // Validation failed, return error response
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Session\TokenMismatchException) {
                return response()->json(['error' => 'CSRF token mismatch'], 419);
            }
            // Other exceptions occurred, return error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function delete(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate the incoming request
            $request->validate([
                'id' => 'required|exists:daily_works,id',
            ]);

            // Find the daily work by ID
            $dailyWork = DailyWork::find($request->id);

            if (!$dailyWork) {
                return response()->json(['error' => 'Daily work not found'], 404);
            }

            // Delete the daily work
            $dailyWork->delete();

            $user = Auth::user();
            $perPage = $request->get('perPage', 30); // Default to 10 items per page
            $page = $request->get('page', 1);
            $search = $request->get('search'); // Search query
            $statusFilter = $request->get('status'); // Filter by status
            $inChargeFilter = $request->get('inCharge'); // Filter by inCharge
            $startDate = $request->get('startDate'); // Filter by start date
            $endDate = $request->get('endDate'); // Filter by end date

            // Base query depending on user's role
            $query = $user->hasRole('Supervision Engineer')
                ? DailyWork::with('reports')->where('incharge', $user->id)
                : ($user->hasRole('Quality Control Inspector') || $user->hasRole('Asst. Quality Control Inspector')
                    ? DailyWork::with('reports')->where('assigned', $user->id)
                    : ($user->hasRole('Administrator')
                        ? DailyWork::with('reports')
                        : DailyWork::query()
                    )
                );

            // Apply search if provided
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%")
                        ->orWhere('date', 'LIKE', "%{$search}%");
                });
            }

            // Apply status filter if provided
            if ($statusFilter) {
                $query->where('status', $statusFilter);
            }

            // Apply in-charge filter if provided
            if ($inChargeFilter) {
                $query->where('incharge', $inChargeFilter);
            }

            // Apply date range filter if provided
            if ($startDate && $endDate) {
                $query->whereBetween('date', [$startDate, $endDate]);
            }

            // Order by 'date' in descending order
            $paginatedDailyWorks = $query->orderBy('date', 'desc')->paginate($perPage, ['*'], 'page', $page);

            // Return the paginated response as JSON
            return response()->json($paginatedDailyWorks);

        } catch (\Exception $e) {
            // Catch any exceptions and return an error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function add(Request $request)
    {
        try {
            // Initialize an empty array to hold success messages
            $messages = [];

            // Validate input data
            $validatedData = $request->validate([
                'date' => 'required|date',
                'number' => 'required|string',
                'planned_time' => 'required|string',
                'type' => 'required|string|in:Embankment,Structure,Pavement',
                'location' => 'required|string|custom_location',
                'description' => 'required|string',
                'side' => 'nullable|string',
                'qty_layer' => 'nullable|string',
            ]);

            // Create a new DailyWork instance


            $chainageRegex = '/([A-Z]*K[0-9]+(?:\+[0-9]+(?:\.[0-9]+)?)?)-([A-Z]*K[0-9]+(?:\+[0-9]+(?:\.[0-9]+)?)?)|([A-Z]*K[0-9]+)(.*)/';
            $jurisdictions = Jurisdiction::all();
            $jurisdictionFound = false; // Set to false initially

            if (preg_match($chainageRegex, $validatedData['location'], $matches)) {
                // Extract start and end chainages, if available
                $startChainage = $matches[1] === "" ? $matches[0] : $matches[1]; // e.g., K05+900 or K30
                $endChainage = $matches[2] === "" ? null : $matches[2]; // e.g., K06+400 (optional)

                // Convert chainages to a comparable string format for jurisdiction check
                $startChainageFormatted = $this->formatChainage($startChainage);
                $endChainageFormatted = $endChainage ? $this->formatChainage($endChainage) : null;

                foreach ($jurisdictions as $jurisdiction) {
                    $formattedStartJurisdiction = $this->formatChainage($jurisdiction->start_chainage);
                    $formattedEndJurisdiction = $this->formatChainage($jurisdiction->end_chainage);

                    // Check if the start chainage is within the jurisdiction's range
                    if ($startChainageFormatted >= $formattedStartJurisdiction && $startChainageFormatted <= $formattedEndJurisdiction) {
                        Log::info('Jurisdiction Match Found: ' . $formattedStartJurisdiction . "-" . $formattedEndJurisdiction);
                        $jurisdictionFound = $jurisdiction; // Set the found jurisdiction
                        break; // Stop checking once a match is found
                    }

                    // If an end chainage exists, check if it's within the jurisdiction's range
                    if ($endChainageFormatted &&
                        $endChainageFormatted >= $formattedStartJurisdiction &&
                        $endChainageFormatted <= $formattedEndJurisdiction) {
                        Log::info('Jurisdiction Match Found for End Chainage: ' . $formattedStartJurisdiction . "-" . $formattedEndJurisdiction);
                        $jurisdictionFound = $jurisdiction; // Set the found jurisdiction
                        break; // Stop checking once a match is found
                    }
                }
            }

            $inCharge = $jurisdictionFound->incharge;

            $dailyWork = new DailyWork($validatedData);

            $dailyWork->incharge = $inCharge;
            $dailyWork->date = $validatedData['date'];
            $dailyWork->number = $validatedData['number'];
            $dailyWork->planned_time = $validatedData['planned_time'];
            $dailyWork->type = $validatedData['type'];
            $dailyWork->location = $validatedData['location'];
            $dailyWork->side = $validatedData['side'];
            $dailyWork->qty_layer = $validatedData['qty_layer'];
            $dailyWork->status = 'new';
            $messages[] = 'Daily work added successfully';

            // Save the new daily work entry
            $dailyWork->save();

            // Return JSON response with success messages
            return response()->json(['messages' => $messages]);

        } catch (ValidationException $e) {
            // Validation failed, return error response
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Session\TokenMismatchException) {
                return response()->json(['error' => 'CSRF token mismatch'], 419);
            }
            // Other exceptions occurred, return error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



    public function uploadRFIFile(Request $request)
    {
        try {
            // Validate the input data
            $request->validate([
                'taskId' => 'required|exists:daily_works,id',
                'file' => 'required|mimes:pdf|max:5120', // Validates a PDF file up to 5 MB
            ]);

            $task = DailyWork::find($request->taskId);

            if ($request->hasFile('file')) {
                $newRfiFile = $request->file('file');

                // Clear old file from 'rfi_files' collection if it exists
                $task->clearMediaCollection('rfi_files');

                // Add the new RFI file to the 'rfi_files' collection
                $task->addMediaFromRequest('file')->toMediaCollection('rfi_files');

                // Get the new file URL
                $newRfiFileUrl = $task->getFirstMediaUrl('rfi_files');

                // Optionally, you can store this URL in a specific field if needed
                $task->file = $newRfiFileUrl;
                $task->save();

                return response()->json(['message' => 'RFI file uploaded successfully', 'url' => $newRfiFileUrl]);
            }

            return response()->json(['message' => 'No file uploaded'], 400);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while uploading the RFI file.'], 500);
        }
    }


    /**
     * Update the status of a task via AJAX request.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrdinalNumber($number): string
    {
        $number = (int) $number; // Ensure integer type
        $suffix = array('th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th');
        if ($number % 100 >= 11 && $number % 100 <= 19) {
            $suffix = "th";
        } else {
            $lastDigit = $number % 10;
            $suffix = $suffix[$lastDigit];
        }
        return $number . $suffix;
    }

    public function attachReport(Request $request)
    {
        $taskId = $request->input('task_id');
        $selectedReport = $request->input('selected_report');

        // Find the task by ID
        $task = Tasks::findOrFail($taskId);

        // Split the selected option into type and id
        list($type, $id) = explode('_', $selectedReport);

        // Check the type and handle accordingly
        if ($type === 'ncr') {
            // Handle NCRs
            $ncr = NCR::where('ncr_no', $id)->firstOrFail();
            // Check if the NCR is already attached to the task
            if (!$task->ncrs()->where('ncr_no', $ncr->ncr_no)->exists()) {
                $task->ncrs()->attach($ncr->id);
            }
        } elseif ($type === 'obj') {
            // Handle Objections
            $objection = Objection::where('obj_no', $id)->firstOrFail();
            // Check if the Objection is already attached to the task
            if (!$task->objections()->where('obj_no', $objection->obj_no)->exists()) {
                $task->objections()->attach($objection->id);
            }
        }

        // Update the timestamp of the task
        $task->touch();

        // Retrieve the updated task data
        $updatedTask = Tasks::with('ncrs', 'objections')->findOrFail($taskId);

        // Return response with success message and updated row data
        return response()->json(['message' => $type . " " . $id . ' attached to ' . $updatedTask->number . ' successfully.', 'updatedRowData' => $updatedTask]);
    }



    public function detachReport(Request $request)
    {
        $taskId = $request->input('task_id');

        // Find the task by ID
        $task = Tasks::findOrFail($taskId);

        // If selected option starts with 'ncr_', detach all NCRs
        if ($task->ncrs->count() > 0) {
            $detachedNCRs = $task->ncrs()->detach();
            $message = $detachedNCRs > 0 ? 'NCR detached from task ' . $task->number . ' successfully.' : 'No NCRs were attached to task ' . $task->number . '.';
        }
        // If selected option starts with 'obj_', detach all Objections
        elseif ($task->objections->count() > 0) {
            $detachedObjections = $task->objections()->detach();
            $message = $detachedObjections > 0 ? 'Objection detached from task ' . $task->number . ' successfully.' : 'No Objections were attached to task ' . $task->number . '.';
        }
        // Otherwise, handle as an invalid selection
        else {
            return response()->json(['error' => 'Invalid selection format.']);
        }

        // Update the timestamp of the task
        $task->touch();

        // Retrieve the updated task data
        $updatedTask = Tasks::with('ncrs', 'objections')->findOrFail($taskId);

        // Return response with success message and updated row data
        return response()->json(['message' => $message, 'updatedRowData' => $updatedTask]);
    }



    private function formatChainage($chainage)
    {
        // Check if the chainage includes a range or just a single chainage
        if (preg_match('/([A-Z]*K)([0-9]+)(?:\+([0-9]+(?:\.[0-9]+)?))?/', $chainage, $matches)) {
            $kilometers = $matches[2]; // e.g., '14' from 'K14'
            $meters = $matches[3] ?? '000'; // Default to '0' if no meters are provided

            // Return a numeric format: kilometers and meters (with decimal if present)
            return $kilometers . $meters; // Remove decimal for sorting
        }

        // If the chainage is just a single K and number (e.g., 'K30'), format accordingly
        if (preg_match('/([A-Z]*K)([0-9]+)/', $chainage, $matches)) {
            $kilometers = $matches[2]; // e.g., '30'
            return $kilometers . '000'; // Assume no meters are present
        }

        return $chainage; // Return the chainage unchanged if it doesn't match the expected format
    }


    // Calculate the resubmission date based on resubmission count
    private function getResubmissionDate($existingDailyWork, $resubmissionCount)
    {
        // Assuming that each resubmission happens one day after the previous one.
        // You can adjust the logic to calculate the resubmission date in a different way if needed.

        // If there's an existing date, calculate the next resubmission date
        $initialDate = Carbon::parse($existingDailyWork->date);

        // Add the resubmission count as days to the initial date
        $resubmissionDate = $initialDate->addDays($resubmissionCount);

        return $resubmissionDate->format('Y-m-d');
    }


// Store summary data in the DailySummary model
    private function storeSummaryData($inChargeSummary, $date)
    {
        foreach ($inChargeSummary as $inChargeName => $summaryData) {
            $user = User::where('user_name', $inChargeName)->first();
            DailyWorkSummary::create([
                'date' => $date,
                'incharge' => $user->id,
                'totalDailyWorks' => $summaryData['totalDailyWorks'],
                'resubmissions' => $summaryData['resubmissions'],
                'embankment' => $summaryData['embankment'],
                'structure' => $summaryData['structure'],
                'pavement' => $summaryData['pavement'],
            ]);
        }
    }

}

