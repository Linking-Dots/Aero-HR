<?php

namespace App\Http\Controllers;

use App\Models\Education;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EducationController extends Controller
{
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'educations.*.id' => 'nullable|exists:education,id',
                'educations.*.institution' => 'required|string|max:255',
                'educations.*.subject' => 'required|string|max:255',
                'educations.*.degree' => 'required|string|max:255',
                'educations.*.starting_date' => 'required|date',
                'educations.*.complete_date' => 'required|date',
                'educations.*.grade' => 'required|string|max:255',
                'educations.*.user_id' => 'required|exists:users,id',
            ], [
                'educations.*.id.exists' => 'The specified education ID does not exist.',
                'educations.*.institution.required' => 'Institution is required.',
                'educations.*.subject.required' => 'Subject is required.',
                'educations.*.degree.required' => 'Degree is required.',
                'educations.*.starting_date.required' => 'Starting date is required.',
                'educations.*.starting_date.date' => 'Starting date must be a valid date.',
                'educations.*.complete_date.required' => 'Complete date is required.',
                'educations.*.complete_date.date' => 'Complete date must be a valid date.',
                'educations.*.grade.required' => 'Grade is required.',
                'educations.*.user_id.exists' => 'The specified user ID does not exist.',
            ]);

            foreach ($validated['educations'] as $educationData) {
                if (isset($educationData['id'])) {
                    $education = Education::find($educationData['id']);
                    if ($education) {
                        $education->update($educationData);
                    } else {
                        return response()->json(['error' => 'Education record not found.'], 404);
                    }
                } else {
                    Education::create($educationData);
                }
            }

            return response()->json(['message' => 'Education records updated successfully.']);
        } catch (\Exception $e) {
            Log::error('Update Education Error: '.$e->getMessage());
            return response()->json(['error' => 'Update Education Error: '.$e->getMessage()], 500);
        }
    }



    // Delete education records
    public function delete(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|exists:education,id',
            ], [
                'id.required' => 'Education ID is required.',
                'id.exists' => 'The specified education ID does not exist.',
            ]);

            $education = Education::find($validated['id']);
            if ($education) {
                $education->delete();
                return response()->json(['message' => 'Education record deleted successfully.']);
            } else {
                return response()->json(['error' => 'Education record not found.'], 404);
            }
        } catch (\Exception $e) {
            // Log the exception or handle it
            Log::error('Delete Education Error: '.$e->getMessage());
            return response()->json(['error' => 'Delete Education Error: '.$e->getMessage()], 500);
        }
    }

}
