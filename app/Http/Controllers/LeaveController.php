<?php

namespace App\Http\Controllers;

use App\Http\Resources\LeaveResource;
use App\Http\Resources\LeaveResourceCollection;
use App\Models\HRM\Leave;
use App\Models\HRM\LeaveSetting;
use App\Models\User;
use App\Services\Leave\LeaveCrudService;
use App\Services\Leave\LeaveOverlapService;
use App\Services\Leave\LeaveQueryService;
use App\Services\Leave\LeaveSummaryService;
use App\Services\Leave\LeaveValidationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\HRM\Department;

class LeaveController extends Controller
{
    protected LeaveValidationService $validationService;
    protected LeaveOverlapService $overlapService;
    protected LeaveCrudService $crudService;
    protected LeaveQueryService $queryService;
    protected LeaveSummaryService $summaryService;

    public function __construct(
        LeaveValidationService $validationService,
        LeaveOverlapService $overlapService,
        LeaveCrudService $crudService,
        LeaveQueryService $queryService,
        LeaveSummaryService $summaryService
    ) {
        $this->validationService = $validationService;
        $this->overlapService = $overlapService;
        $this->crudService = $crudService;
        $this->queryService = $queryService;
        $this->summaryService = $summaryService;
    }
    public function index1(): \Inertia\Response
    {
        return Inertia::render('LeavesEmployee', [
            'title' => 'Leaves',
            'allUsers' => User::all(),
            
        ]);
    }

    public function index2(): \Inertia\Response
    {
        return Inertia::render('LeavesAdmin', [
            'title' => 'Leaves',
            'allUsers' => User::all(),
        ]);
    }

    public function paginate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $leaveData = $this->queryService->getLeaveRecords($request);
            
            $response = [
                'leaves' => new LeaveResourceCollection($leaveData['leaveRecords']),
                'leavesData' => $leaveData['leavesData'],
                'departments' => Department::all('id', 'name'),
                'success' => true,
            ];

            // Add message if provided by the service
            if (isset($leaveData['message'])) {
                $response['message'] = $leaveData['message'];
            }

            return response()->json($response, 200);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'An error occurred while retrieving leave data.',
                'details' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function stats(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $stats = $this->queryService->getLeaveStatistics($request);

            return response()->json([
                'stats' => $stats,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while retrieving leave data.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function create(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = $this->validationService->validateLeaveRequest($request);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $fromDate = Carbon::parse($request->input('fromDate'));
            $toDate = Carbon::parse($request->input('toDate'));
            $userId = $request->input('user_id');

            // Check for overlapping leaves
            $overlapError = $this->overlapService->getOverlapErrorMessage($userId, $fromDate, $toDate);
            if ($overlapError) {
                return response()->json([
                    'success' => false,
                    'error' => $overlapError,
                    'message' => 'Leave dates overlap with existing leave or holiday'
                ], 422);
            }

            // Create new leave
            $newLeave = $this->crudService->createLeave($request->all());

            // Get updated leave records using the same service as paginate method
            $leaveData = $this->queryService->getLeaveRecords($request);

            return response()->json([
                'success' => true,
                'message' => 'Leave application submitted successfully',
                'leave' => array_merge(
                    (new LeaveResource($newLeave->load('employee')))->toArray($request),
                    [
                        'month' => is_string($newLeave->from_date)
                            ? date('F', strtotime($newLeave->from_date))
                            : $newLeave->from_date->format('F'),
                        'year' => is_string($newLeave->from_date)
                            ? date('Y', strtotime($newLeave->from_date))
                            : $newLeave->from_date->year,
                        'leave_type' => LeaveSetting::find($newLeave->leave_type)?->type,
                    ]
                ),
                'leaves' => new LeaveResourceCollection($leaveData['leaveRecords']),
                'leavesData' => $leaveData['leavesData'],
                'departments' => Department::all('id', 'name'),
            ], 201);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'An error occurred while submitting the leave data.',
                'details' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $updatedLeave = $this->crudService->updateLeave($request->input('id'), $request->all());

            // Get updated leave records using the same service as paginate method
            $leaveData = $this->queryService->getLeaveRecords($request);

            return response()->json([
                'success' => true,
                'message' => 'Leave application updated successfully',
                'leave' => array_merge(
                    (new LeaveResource($updatedLeave->load('employee')))->toArray($request),
                    [
                        'month' => is_string($updatedLeave->from_date)
                            ? date('F', strtotime($updatedLeave->from_date))
                            : $updatedLeave->from_date->format('F'),
                        'year' => is_string($updatedLeave->from_date)
                            ? date('Y', strtotime($updatedLeave->from_date))
                            : $updatedLeave->from_date->year,
                        'leave_type' => LeaveSetting::find($updatedLeave->leave_type)?->type,
                    ]
                ),
                'leaves' => new LeaveResourceCollection($leaveData['leaveRecords']),
                'leavesData' => $leaveData['leavesData'],
                'departments' => Department::all('id', 'name'),
            ], 200);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while updating the leave.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        $result = $this->crudService->updateLeaveStatus(
            $request->input('id'),
            $request->input('status'),
            Auth::id()
        );

        return response()->json(['message' => $result['message']]);
    }

    public function delete(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $this->validationService->validateDeleteRequest($request);
            $this->crudService->deleteLeave($request->query('id'));

            $leaveData = $this->queryService->getLeaveRecords($request);

            return response()->json([
                'success' => true,
                'message' => 'Leave application deleted successfully',
                'leaves' => new LeaveResourceCollection($leaveData['leaveRecords']),
                'leavesData' => $leaveData['leavesData'],
                'departments' => Department::all('id', 'name'),
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while deleting the leave.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function leaveSummary(Request $request)
    {
        $year = $request->input('year', now()->year);
        $summaryData = $this->summaryService->generateLeaveSummary($year);

        return Inertia::render('LeaveSummary', [
            'title' => 'Leave Summary',
            'allUsers' => $summaryData['users'],
            'columns' => $summaryData['columns'],
            'data' => $summaryData['data'],
            'year' => $summaryData['year'],
        ]);
    }

    public function bulkApprove(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $request->validate([
                'leave_ids' => 'required|array',
                'leave_ids.*' => 'integer|exists:leave_applications,id'
            ]);

            $leaveIds = $request->input('leave_ids');
            $updatedCount = 0;

            foreach ($leaveIds as $leaveId) {
                $result = $this->crudService->updateLeaveStatus($leaveId, 'Approved', Auth::id());
                if ($result['updated']) {
                    $updatedCount++;
                }
            }

            return response()->json([
                'message' => "{$updatedCount} leave(s) approved successfully",
                'updated_count' => $updatedCount,
                'total_requested' => count($leaveIds)
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while approving leaves.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function bulkReject(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $request->validate([
                'leave_ids' => 'required|array',
                'leave_ids.*' => 'integer|exists:leave_applications,id'
            ]);

            $leaveIds = $request->input('leave_ids');
            $updatedCount = 0;

            foreach ($leaveIds as $leaveId) {
                $result = $this->crudService->updateLeaveStatus($leaveId, 'Declined', Auth::id());
                if ($result['updated']) {
                    $updatedCount++;
                }
            }

            return response()->json([
                'message' => "{$updatedCount} leave(s) rejected successfully",
                'updated_count' => $updatedCount,
                'total_requested' => count($leaveIds)
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while rejecting leaves.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
