<?php

namespace App\Http\Controllers;

use App\Imports\DailyWorkImport;
use App\Models\DailySummary;
use App\Models\DailyWork;
use App\Models\Jurisdiction;
use App\Models\Report;
use App\Models\User;
use ErrorException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class DailyWorkController extends Controller
{

    public function index()
    {
        $user = Auth::user();
        $dailyWorksData = $user->hasRole('se')
            ? [
                'dailyWorks' => DailyWork::with('reports')->where('incharge', $user->id)->get(),
                'allInCharges' => [],
                'juniors' => User::where('report_to', $user->id)->get(),

            ]
            : ($user->hasRole('qci') || $user->hasRole('aqci')
                ? ['dailyWorks' => DailyWork::with('reports')->where('assigned', $user->id)->get()]
                : ($user->hasRole('admin') || $user->hasRole('manager')
                    ? [
                        'dailyWorks' => DailyWork::with('reports')->get(),
                        'allInCharges' => User::role('se')->get(),
                        'juniors' => [],
                    ]
                    : ['dailyWorks' => []]
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

        return Inertia::render('Project/DailyWorks', [
            'dailyWorksData' => $dailyWorksData,
            'jurisdictions' => Jurisdiction::all(),
            'users' => $users,
            'title' => 'Daily Works',
            'reports' => $reports,
            'reports_with_daily_works' => $reports_with_daily_works
        ]);
    }




    public function import(Request $request)
    {
        try {
            $request->validate([
                        'file' => 'required|file|mimes:xlsx,csv',
                    ]);

            $path = $request->file('file')->store('temp'); // Store uploaded file temporarily

            $importedDailyWorks = Excel::toArray(new DailyWorkImport, $path)[0];
            $newlyCreatedDailyWorks = [];
            $date = $importedDailyWorks[0][0];

            // Initialize summary variables
            $inChargeSummary = [];// Import data using TaskImport

            // Validate imported tasks with custom messages
            $validator = Validator::make($importedDailyWorks, [
                '*.0' => 'required|date_format:Y-m-d',
                '*.1' => 'required|string',
                '*.2' => 'required|string|in:Embankment,Structure,Pavement',
                '*.3' => 'required|string',
                '*.4' => 'required|string|custom_location',
            ], [
                '*.0.required' => 'DailyWork number :taskNumber must have a valid date.',
                '*.0.date_format' => 'DailyWork number :taskNumber must be a date in the format Y-m-d.',
                '*.1.required' => 'DailyWork number :taskNumber must have a value for field 1.',
                '*.2.required' => 'DailyWork number :taskNumber must have a value for field 2.',
                '*.2.in' => 'DailyWork number :taskNumber must have a value for field 2 that is either Embankment, Structure, or Pavement.',
                '*.3.required' => 'DailyWork number :taskNumber must have a value for field 3.',
                '*.4.required' => 'DailyWork number :taskNumber must have a value for field 4.',
                '*.4.custom_location' => 'DailyWork number :taskNumber has an invalid custom location: :value',
            ]);

            // Validate the data
            $validator->validate();




            foreach ($importedDailyWorks as $importedDailyWork) {

                $k = intval(substr($importedDailyWork[4], 1)); // Extracting the numeric part after 'K'

                $jurisdiction = Jurisdiction::where('start_chainage', '<=', $k)
                    ->where('end_chainage', '>=', $k)
                    ->first();

                $inCharge = $jurisdiction->incharge;
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
                $inChargeSummary[$inChargeName]['totalDailyWorks']++;

                $existingDailyWork = DailyWork::where('number', $importedDailyWork[1])->first();

                // Update incharge summary variables based on task type
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

                if ($existingDailyWork) {
                    $inChargeSummary[$inChargeName]['resubmissions']++;

                     // Get resubmission count (handling potential null value)
                    $resubmissionCount = $existingDailyWork->resubmission_count ?? 0;

                    // Update imported task data with incremented resubmission
                    $resubmissionCount = $resubmissionCount + 1;
                    $resubmissionDate = ($existingDailyWork->resubmission_date ? $existingDailyWork->resubmission_date . "\n" : '') . $this->getOrdinalNumber($resubmissionCount) . " Submission date: " . $existingDailyWork->date;

                    // Create a new task record with updated data
                    $createdDailyWork = DailyWork::create([
                        'date' => ($existingDailyWork->status === 'completed' ? $existingDailyWork->date : $importedDailyWork[0]),
                        'number' => $importedDailyWork[1],
                        'status' => ($existingDailyWork->status === 'completed' ? 'completed' : 'resubmission'),
                        'type' => $importedDailyWork[2],
                        'description' => $importedDailyWork[3],
                        'location' => $importedDailyWork[4],
                        'side' => $importedDailyWork[5],
                        'qty_layer' => $importedDailyWork[6],
                        'planned_time' => $importedDailyWork[7],
                        'incharge' => $inCharge,
                        'resubmission_count' => $resubmissionCount,
                        'resubmission_date' => $resubmissionDate,
                    ]);


                    // Delete the existing task
                    $existingDailyWork->delete();
                } else {
                    // Create a new task for non-duplicates
                    $createdDailyWork = DailyWork::create([
                        'date' => $importedDailyWork[0],
                        'number' => $importedDailyWork[1],
                        'status' => 'new',
                        'type' => $importedDailyWork[2],
                        'description' => $importedDailyWork[3],
                        'location' => $importedDailyWork[4],
                        'side' => $importedDailyWork[5],
                        'qty_layer' => $importedDailyWork[6],
                        'planned_time' => $importedDailyWork[7],
                        'incharge' => $inCharge,
                    ]);

                }
            }


            // Store summary data in DailySummary model for each incharge
            foreach ($inChargeSummary as $inChargeName => $summaryData) {
                $user = User::where('user_name', $inChargeName)->first();

                 DailySummary::create([
                    'date' => $date,
                    'incharge' => $user->id,
                    'totalDailyWorks' => $summaryData['totalDailyWorks'],
                    'resubmissions' => $summaryData['resubmissions'],
                    'embankment' => $summaryData['embankment'],
                    'structure' => $summaryData['structure'],
                    'pavement' => $summaryData['pavement'],
                ]);


            }


            $user = Auth::user();
            $updatedDailyWorks = $user->hasRole('se')
                ? [
                    'dailyWorks' => DailyWork::with('reports')->where('incharge', $user->id)->get(),
                    'allInCharges' => [],
                    'juniors' => User::where('report_to', $user->id)->get(),

                ]
                : ($user->hasRole('qci') || $user->hasRole('aqci')
                    ? ['dailyWorks' => DailyWork::with('reports')->where('assigned', $user->id)->get()]
                    : ($user->hasRole('admin') || $user->hasRole('manager')
                        ? [
                            'dailyWorks' => DailyWork::with('reports')->get(),
                            'allInCharges' => User::role('se')->get(),
                            'juniors' => [],
                        ]
                        : ['dailyWorks' => []]
                    )
                );


            // Redirect to tasks route with success message
            return response()->json([
                        'message' => 'Daily work imported successfully.',
                        'updatedDailyWorks' => $updatedDailyWorks,
                    ], 200);
        } catch (ValidationException $e) {

            return response()->json(['errors' => $e->errors()], 422);
        } catch (ErrorException $e) {
            return response()->json(['message' => 'An error occurred while processing your request.', 'error' => $e->getMessage(). ' on line '.$e->getLine(). ' at '.$e->getFile()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An unexpected error occurred.', 'error' => $e->getMessage(). ' on line '.$e->getLine(). ' at '.$e->getFile() ], 500);
        }
    }

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
                    'type' => 'required|string',
                    'description' => 'nullable|string',
                    'location' => 'required|string',
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
                $request->validate(['assigned' => 'required|exists:users,id']);
                $dailyWork->assigned = $request->assigned;
                $messages[] = 'Daily work assigned to ' . User::find($request->assigned)->name;
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

            // Return a success response
            return response()->json(['message' => 'Daily work deleted successfully'], 200);

        } catch (\Exception $e) {
            // Catch any exceptions and return an error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



    public function getLatestTimestamp()
    {
        $latestTimestamp = DailyWork::max('updated_at'); // Assuming 'updated_at' is the timestamp field

        return response()->json(['timestamp' => $latestTimestamp]);
    }


    public function addTask(Request $request)
    {
        $user = Auth::user();

        $inchargeName = '';

        try {
            // Validate incoming request data
            $validatedData = $request->validate([
                'date' => 'required|date',
                'number' => 'required|string',
                'time' => 'required|string',
                'status' => 'required|string',
                'type' => 'required|string',
                'description' => 'required|string',
                'location' => 'required|string|custom_location',
                'side' => 'required|string',
                'qty_layer' => $request->input('type') === 'Embankment' ? 'required|string' : '',
                'completion_time' => $request->input('status') === 'completed' ? 'required|string' : '',
                'inspection_details' => 'nullable|string',
            ],[
                'date.required' => 'RFI Date is required.',
                'number.required' => 'RFI Number is required.',
                'time.required' => 'RFI Time is required.',
                'time.string' => 'RFI Time is not string.',
                'status.required' => 'Status is required.',
                'type.required' => 'Type is required.',
                'description.required' => 'Description is required.',
                'location.required' => 'Location is required.',
                'location.custom_location' => 'The :attribute must start with \'K\' and be in the range K0 to K48.',
                'side.required' => 'Road Type is required.',
                'qty_layer.required' => $request->input('type') === 'Embankment' ? 'Layer No. is required when the type is Embankment.' : '',
                'completion_time.required' => 'Completion time is required.',
                'qty_layer.string' => 'Quantity/Layer No. is not string'
            ]);

            // Check if a task with the same number already exists
            $existingTask = Tasks::where('number', $validatedData['number'])->first();
            if ($existingTask) {
                return response()->json(['error' => 'A task with the same RFI number already exists.'], 422);
            }

            $k = intval(substr($validatedData['location'], 1)); // Extracting the numeric part after 'K'

            $workLocation = WorkLocation::where('start_chainage', '<=', $k)
                ->where('end_chainage', '>=', $k)
                ->first();

            $inchargeName = $workLocation->incharge;

            // Create a new DailyWork instance
            $task = new Tasks();
            $task->date = $validatedData['date'];
            $task->number = $validatedData['number'];
            $task->planned_time = $validatedData['time'];
            $task->status = $validatedData['status'];
            $task->type = $validatedData['type'];
            $task->description = $validatedData['description'];
            $task->location = $validatedData['location'];
            $task->side = $validatedData['side'];
            $task->qty_layer = $validatedData['qty_layer'];
            $task->incharge = $user && $user->hasRole('admin') ? $inchargeName : ($user?->user_name);
            $task->completion_time = $validatedData['completion_time'];
            $task->inspection_details = $validatedData['inspection_details'];

            // Save the task to the database
            $task->save();

            $tasks = $user->hasRole('se')
                ? [
                    'tasks' => Tasks::with('ncrs')->where('incharge', $user->user_name)->get(),
                    'juniors' => User::where('incharge', $user->user_name)->get(),
                    'message' => 'DailyWork added successfully',
                ] : ($user->hasRole('qci') || $user->hasRole('aqci')
                    ? [
                        'tasks' => Tasks::with('ncrs')->where('assigned', $user->user_name)->get(),
                        'message' => 'DailyWork added successfully'
                    ]
                    : ($user->hasRole('admin') || $user->hasRole('manager')
                        ? [
                            'tasks' => Tasks::with('ncrs')->get(),
                            'incharges' => User::role('se')->get(),
                            'message' => 'DailyWork added successfully'
                        ]
                        : ['tasks' => [],
                            'message' => 'DailyWork added successfully'
                        ]
                    )
                );

            // Return a response
            return response()->json($tasks);
        } catch (ValidationException $e) {
            // Validation failed, return error response
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Other exceptions occurred, return error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



    public function importTasks()
    {
        $title = 'Import Tasks';
        $user = Auth::user();
        return view('task/import',compact('user','title'));
    }



    private function handleDuplicate(DailyWork $existingTask, array $importedTask, string $inchargeName): void
    {

    }

    public function exportTasks()
    {
//        $settings = [
//            'title' => 'All Tasks',
//        ];
//        $team = Auth::team();
//        return view('task/add',compact('team', 'settings'));
    }




    /**
     * Update the status of a task via AJAX request.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateTaskStatus(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Find task by ID
            $task = DailyWork::find($request->id);

            // If task not found, return 404 error response
            if (!$task) {
                return response()->json(['error' => 'DailyWork not found'], 404);
            }

            // Validate status field
            $request->validate([
                'status' => 'required|string', // Add your validation rules here
            ]);

            // Update task status
            $task->status = $request->status;
            $task->save();

            // Return JSON response with success message
            return response()->json(['message' => 'DailyWork status updated to ']);
        } catch (ValidationException $e) {
            // Validation failed, return error response
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Other exceptions occurred, return error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function assignTask(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Find task by ID
            $task = Tasks::find($request->task_id);

            // If task not found, return 404 error response
            if (!$task) {
                return response()->json(['error' => 'DailyWork not found'], 404);
            }

            $user = User::where('user_name', $request->user_name)->first();

            // Update task status
            $task->assigned = $request->user_name;
            $task->save();

            // Return JSON response with success message
            return response()->json(['message' => 'DailyWork assigned to '.$user->first_name]);
        } catch (ValidationException $e) {
            // Validation failed, return error response
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Other exceptions occurred, return error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function assignIncharge(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Find task by ID
            $task = Tasks::find($request->task_id);

            // If task not found, return 404 error response
            if (!$task) {
                return response()->json(['error' => 'DailyWork not found'], 404);
            }

            $user = User::where('user_name', $request->user_name)->first();

            // Update task status
            $task->incharge = $request->user_name;
            $task->save();

            // Return JSON response with success message
            return response()->json(['message' => 'DailyWork incharge updated to '.$user->first_name]);
        } catch (ValidationException $e) {
            // Validation failed, return error response
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Other exceptions occurred, return error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function updateInspectionDetails(Request $request): \Illuminate\Http\JsonResponse
    {
        $task = Tasks::findOrFail($request->id);
        $task->inspection_details = $request->inspection_details;
        $task->save();

        return response()->json(['message' => 'Inspection details updated successfully']);
    }

    public function updateRfiSubmissionDate(Request $request): \Illuminate\Http\JsonResponse
    {
        $task = Tasks::findOrFail($request->id);
        $task->rfi_submission_date = $request->date;
        $task->save();

        return response()->json(['message' => 'RFI Submission date updated to ']);
    }

    public function updateCompletionDateTime(Request $request): \Illuminate\Http\JsonResponse
    {
        $task = Tasks::findOrFail($request->id);
        $task->completion_time = $request->dateTime;
        $task->save();
        return response()->json(['message' => 'Completion date-time updated to ']);
    }

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



}

