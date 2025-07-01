<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Leave\LeaveValidationService;
use App\Services\Leave\LeaveOverlapService;
use App\Services\Leave\LeaveCrudService;
use App\Services\Leave\LeaveQueryService;
use App\Services\Leave\LeaveSummaryService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\LeaveSetting;

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
            $stats = $this->queryService->getLeaveStatistics($request);

            if ($leaveData['leaveRecords']->isEmpty()) {
                return response()->json([
                    'message' => 'No leave records found for the selected period.',
                    'leavesData' => $leaveData['leavesData'],
                    'stats' => $stats,
                ], 404);
            }

            return response()->json([
                'leaves' => $leaveData['leaveRecords'],
                'current_page' => $leaveData['leaveRecords']->currentPage(),
                'last_page' => $leaveData['leaveRecords']->lastPage(),
                'total' => $leaveData['leaveRecords']->total(),
                'leavesData' => $leaveData['leavesData'],
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
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $fromDate = Carbon::parse($request->input('fromDate'));
            $toDate = Carbon::parse($request->input('toDate'));
            $userId = $request->input('user_id');

            // Check for overlapping leaves
            $overlapError = $this->overlapService->getOverlapErrorMessage($userId, $fromDate, $toDate);
            if ($overlapError) {
                return response()->json(['error' => $overlapError], 422);
            }

            // Create new leave
            $newLeave = $this->crudService->createLeave($request->all());

            $leaveData = $this->queryService->getLeaveRecords(
                $request,
                $request->get('perPage', 30),
                $request->get('page', 1),
                $request->get('employee', ''),
                null,
                $request->get('month', null)
            );

            return response()->json([
                'message' => 'Leave application submitted successfully',
                'leave' => array_merge(
                    $newLeave->load('employee')->toArray(),
                    [
                        'month' => $newLeave->from_date->format('F'),
                        'year' => $newLeave->from_date->year,
                        'leave_type' => LeaveSetting::find($newLeave->leave_type)?->type,
                    ]
                ),

                'leavesData' => $leaveData['leavesData'],
                'leaves' => $leaveData['leaveRecords'],
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'error' => 'An error occurred while submitting the leave data.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $updatedLeave = $this->crudService->updateLeave($request->input('id'), $request->all());

            $leaveData = $this->queryService->getLeaveRecords(
                $request,
                $request->get('perPage', 30),
                $request->get('page', 1),
                $request->get('employee', ''),
                $request->get('year', null),
                $request->get('month', null),
            );

            return response()->json([
                'message' => 'Leave application updated successfully',
                'leave' => array_merge(
                    $updatedLeave->load('employee')->toArray(),
                    [
                        'month' => $updatedLeave->from_date->format('F'),
                        'year' => $updatedLeave->from_date->year,
                        'leave_type' => LeaveSetting::find($updatedLeave->leave_type)?->type,
                    ]
                ),
                'leaves' => $leaveData['leaveRecords'],
                'leavesData' => $leaveData['leavesData'],
            ]);
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
                'message' => 'Leave application deleted successfully',
                'leavesData' => $leaveData['leavesData'],
                'leaves' => $leaveData['leaveRecords'],
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
