<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index(Request $request, User $user): Response
    {
        $reportTo = User::find($user->report_to);

        return Inertia::render('Profile/UserProfile', [
            'title' => 'Profile',
            'user' => $user,
            'report_to' => $reportTo,
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }


    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:users,id',
            'employee_id' => 'nullable|integer',
            'user_name' => 'nullable|string',
            'phone' => 'nullable|string|unique:users,phone,' . $request->id,
            'email' => 'nullable|string|email|unique:users,email,' . $request->id,
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'about' => 'nullable|string',
            'report_to' => 'nullable|exists:users,id',
            'password' => 'nullable|string',
            'designation' => 'nullable|exists:designations,id',
            'nid' => 'nullable|string',
            'name' => 'nullable|string',
            'profile_image' => 'nullable|string',
            'department' => 'nullable|exists:departments,id',
            'date_of_joining' => 'nullable|date',
            'birthday' => 'nullable|date',
            'gender' => 'nullable|string',
            'passport_no' => 'nullable|string',
            'passport_exp_date' => 'nullable|date',
            'nationality' => 'nullable|string',
            'religion' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'employment_of_spouse' => 'nullable|string',
            'number_of_children' => 'nullable|integer',
            'emergency_contact_primary_name' => 'nullable|string',
            'emergency_contact_primary_relationship' => 'nullable|string',
            'emergency_contact_primary_phone' => 'nullable|string',
            'emergency_contact_secondary_name' => 'nullable|string',
            'emergency_contact_secondary_relationship' => 'nullable|string',
            'emergency_contact_secondary_phone' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_no' => 'nullable|string',
            'ifsc_code' => 'nullable|string',
            'pan_no' => 'nullable|string',
            'family_member_name' => 'nullable|string',
            'family_member_relationship' => 'nullable|string',
            'family_member_dob' => 'nullable|date',
            'family_member_phone' => 'nullable|string',
            'education_ug_institution' => 'nullable|string',
            'education_ug_degree' => 'nullable|string',
            'education_ug_start_year' => 'nullable|integer',
            'education_ug_end_year' => 'nullable|integer',
            'education_pg_institution' => 'nullable|string',
            'education_pg_degree' => 'nullable|string',
            'education_pg_start_year' => 'nullable|integer',
            'education_pg_end_year' => 'nullable|integer',
            'experience_1_company' => 'nullable|string',
            'experience_1_position' => 'nullable|string',
            'experience_1_start_date' => 'nullable|date',
            'experience_1_end_date' => 'nullable|date',
            'experience_2_company' => 'nullable|string',
            'experience_2_position' => 'nullable|string',
            'experience_2_start_date' => 'nullable|date',
            'experience_2_end_date' => 'nullable|date',
            'experience_3_company' => 'nullable|string',
            'experience_3_position' => 'nullable|string',
            'experience_3_start_date' => 'nullable|date',
            'experience_3_end_date' => 'nullable|date',
            'salary_basis' => 'nullable|string',
            'salary_amount' => 'nullable|numeric',
            'payment_type' => 'nullable|string',
            'pf_contribution' => 'nullable|boolean',
            'pf_no' => 'nullable|string',
            'employee_pf_rate' => 'nullable|string',
            'additional_pf_rate' => 'nullable|string',
            'total_pf_rate' => 'nullable|string',
            'esi_contribution' => 'nullable|boolean',
            'esi_no' => 'nullable|string',
            'employee_esi_rate' => 'nullable|string',
            'additional_esi_rate' => 'nullable|string',
            'total_esi_rate' => 'nullable|string',
            'email_verified_at' => 'nullable|date',
        ]);

        $user = User::find($validated['id']);

        $messages = [];

        if (array_key_exists('department', $validated) && $user->department !== $validated['department']) {
            $user->designation = null;
            $messages[] = 'User designation set to null due to department change';
        }

        // Update user attributes only if they are present in the request
        foreach ($validated as $key => $value) {
            if ($key !== 'id' && $value !== null) {
                if ($key === 'department') {
                    $messages[] = 'User department updated successfully to ' . Department::find($value)->name;
                    $user->department = $value;
                } elseif ($key === 'designation') {
                    $messages[] = 'User designation updated successfully to ' . Designation::find($value)->title;
                    $user->designation = $value;
                } else {
                    $messages[] = 'User ' . $key . ' updated successfully to ' . $value;
                    $user->{$key} = $value;
                }
            }
        }



        $user->save();

        return response()->json(['messages' => $messages]);
    }


    public function delete(Request $request)
    {
        $userId = $request->input('user_id');
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        try {
            $user->delete();
            return response()->json(['message' => 'User deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete user.'], 500);
        }
    }


    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
