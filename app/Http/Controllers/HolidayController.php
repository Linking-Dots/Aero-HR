<?php

namespace App\Http\Controllers;

use App\Models\HRM\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public function index(): \Inertia\Response
    {
        $holidays = Holiday::all();
        return Inertia::render('Holidays', [
            'title' => 'Holidays',
            'holidays' => $holidays,
        ]);
    }

    public function create(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'id' => 'nullable|exists:holidays,id',
            'title' => 'required|string',
            'fromDate' => 'required|date',
            'toDate' => 'required|date|after_or_equal:fromDate',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = [
                'title' => $request->input('title'),
                'from_date' => $request->input('fromDate'),
                'to_date' => $request->input('toDate'),
            ];

            if ($request->has('id')) {
                // Update existing holiday record
                $holiday = Holiday::find($request->input('id'));

                $holiday->update($data);

                $message = 'Holiday updated successfully';
            } else {
                // Create new holiday record
                Holiday::create($data);
                $message = 'Holiday added successfully';
            }


            $holidays = Holiday::all();


            return response()->json([
                'message' => $message,
                'holidays' => $holidays
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add holiday. Please try again later.'
            ], 500);
        }
    }

    public function delete(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Validate the incoming request
            $request->validate([
                'id' => 'required|exists:holidays,id',
                'route' => 'required',
            ]);

            // Find the daily work by ID
            $holiday = Holiday::find($request->query('id'));


            if (!$holiday) {
                return response()->json(['error' => 'Holiday not found'], 404);
            }

            // Delete the daily work
            $holiday->delete();

            $holidays = Holiday::all();

            // Return a success response
            return response()->json([
                'message' => 'Holiday deleted successfully',
                'holidays' => $holidays
            ], 200);

        } catch (\Exception $e) {
            // Catch any exceptions and return an error response
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
