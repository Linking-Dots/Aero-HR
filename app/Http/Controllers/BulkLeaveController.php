<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkLeaveRequest;
use App\Http\Resources\LeaveResource;
use App\Http\Resources\LeaveResourceCollection;
use App\Models\HRM\Department;
use App\Services\Leave\BulkLeaveService;
use App\Services\Leave\LeaveQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulkLeaveController extends Controller
{
    public function __construct(
        private BulkLeaveService $bulkLeaveService,
        private LeaveQueryService $queryService
    ) {}

    /**
     * Validate bulk leave dates before submission
     */
    public function validateDates(BulkLeaveRequest $request): JsonResponse
    {
        try {
            $results = $this->bulkLeaveService->validateDates($request->validated());
            
            return response()->json([
                'success' => true,
                'validation_results' => $results['validation_results'],
                'estimated_balance_impact' => $results['estimated_balance_impact']
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'An error occurred during validation.',
                'details' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Create bulk leave records
     */
    public function store(BulkLeaveRequest $request): JsonResponse
    {
        try {
            $result = $this->bulkLeaveService->processBulkLeave($request->validated());
            
            // Get updated leave records for the response
            $leaveData = $this->queryService->getLeaveRecords($request);
            
            $response = [
                'success' => $result['success'],
                'message' => $result['message'],
                'created_leaves' => collect($result['created_leaves'])->map(function ($leave) use ($request) {
                    return (new LeaveResource($leave->load('employee')))->toArray($request);
                }),
                'failed_dates' => $result['failed_dates'],
                'summary' => $result['summary'],
                'leaves' => new LeaveResourceCollection($leaveData['leaveRecords']),
                'leavesData' => $leaveData['leavesData'],
                'departments' => Department::all('id', 'name'),
            ];

            $statusCode = $result['success'] ? 201 : 422;
            
            return response()->json($response, $statusCode);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'An error occurred while processing bulk leave request.',
                'details' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get available leave types for the user
     */
    public function getLeaveTypes(Request $request): JsonResponse
    {
        try {
            $leaveTypes = \App\Models\HRM\LeaveSetting::all();
            
            return response()->json([
                'success' => true,
                'leave_types' => $leaveTypes
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve leave types.',
                'details' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
