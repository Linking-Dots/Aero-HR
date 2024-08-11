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
            'allUsers' => User::all(),
            'departments' => Department::all(),
            'designations' => Designation::all(),
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
        try {
            // Validate the request
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
            ]);

            // Find the user
            $user = User::findOrFail($validated['id']);

            $messages = [];

            // Check if department changed
            if (array_key_exists('department', $validated) && $user->department !== $validated['department']) {
                $user->designation = null;
                $messages[] = 'User designation set to null due to department change';
            }

            // Update user attributes only if they are present in the request
            foreach ($validated as $key => $value) {
                if ($key !== 'id' && $value !== null) {
                    switch ($key) {
                        case 'department':
                            $messages[] = 'Department updated successfully to ' . Department::find($value)->name;
                            $user->department = $value;
                            break;

                        case 'designation':
                            $messages[] = 'Designation updated successfully to ' . Designation::find($value)->title;
                            $user->designation = $value;
                            break;

                        case 'report_to':
                            $messages[] = 'Report to updated successfully to ' . User::find($value)->name;
                            $user->report_to = $value;
                            break;

                        // Handle other specific cases here if needed

                        default:
                            $fieldNames = [
                                'employee_id' => 'Employee ID',
                                'user_name' => 'User Name',
                                'phone' => 'Phone Number',
                                'dob' => 'Date of Birth',
                                'address' => 'Address',
                                'about' => 'About',
                                'password' => 'Password',
                                'nid' => 'National ID',
                                'name' => 'Full Name',
                                'profile_image' => 'Profile Image',
                                'date_of_joining' => 'Date of Joining',
                                'birthday' => 'Birthday',
                                'gender' => 'Gender',
                                'passport_no' => 'Passport Number',
                                'passport_exp_date' => 'Passport Expiry Date',
                                'nationality' => 'Nationality',
                                'religion' => 'Religion',
                                'marital_status' => 'Marital Status',
                                'employment_of_spouse' => 'Employment of Spouse',
                                'number_of_children' => 'Number of Children',
                                'emergency_contact_primary_name' => 'Primary Emergency Contact Name',
                                'emergency_contact_primary_relationship' => 'Primary Emergency Contact Relationship',
                                'emergency_contact_primary_phone' => 'Primary Emergency Contact Phone',
                                'emergency_contact_secondary_name' => 'Secondary Emergency Contact Name',
                                'emergency_contact_secondary_relationship' => 'Secondary Emergency Contact Relationship',
                                'emergency_contact_secondary_phone' => 'Secondary Emergency Contact Phone',
                                'bank_name' => 'Bank Name',
                                'bank_account_no' => 'Bank Account Number',
                                'ifsc_code' => 'IFSC Code',
                                'pan_no' => 'PAN Number',
                                'family_member_name' => 'Family Member Name',
                                'family_member_relationship' => 'Family Member Relationship',
                                'family_member_dob' => 'Family Member Date of Birth',
                                'family_member_phone' => 'Family Member Phone Number',
                                'education_ug_institution' => 'Undergraduate Institution',
                                'education_ug_degree' => 'Undergraduate Degree',
                                'education_ug_start_year' => 'Undergraduate Start Year',
                                'education_ug_end_year' => 'Undergraduate End Year',
                                'education_pg_institution' => 'Postgraduate Institution',
                                'education_pg_degree' => 'Postgraduate Degree',
                                'education_pg_start_year' => 'Postgraduate Start Year',
                                'education_pg_end_year' => 'Postgraduate End Year',
                                'experience_1_company' => 'Experience 1 Company',
                                'experience_1_position' => 'Experience 1 Position',
                                'experience_1_start_date' => 'Experience 1 Start Date',
                                'experience_1_end_date' => 'Experience 1 End Date',
                                'experience_2_company' => 'Experience 2 Company',
                                'experience_2_position' => 'Experience 2 Position',
                                'experience_2_start_date' => 'Experience 2 Start Date',
                                'experience_2_end_date' => 'Experience 2 End Date',
                                'experience_3_company' => 'Experience 3 Company',
                                'experience_3_position' => 'Experience 3 Position',
                                'experience_3_start_date' => 'Experience 3 Start Date',
                                'experience_3_end_date' => 'Experience 3 End Date',
                                'salary_basis' => 'Salary Basis',
                                'salary_amount' => 'Salary Amount',
                                'payment_type' => 'Payment Type',
                                'pf_contribution' => 'PF Contribution',
                                'pf_no' => 'PF Number',
                                'employee_pf_rate' => 'Employee PF Rate',
                                'additional_pf_rate' => 'Additional PF Rate',
                                'total_pf_rate' => 'Total PF Rate',
                                'esi_contribution' => 'ESI Contribution',
                                'esi_no' => 'ESI Number',
                                'employee_esi_rate' => 'Employee ESI Rate',
                                'additional_esi_rate' => 'Additional ESI Rate',
                                'total_esi_rate' => 'Total ESI Rate',
                            ];

                            $humanReadableKey = $fieldNames[$key] ?? str_replace('_', ' ', ucfirst($key));
                            $messages[] = $humanReadableKey . ' updated successfully to ' . $value;
                            $user->{$key} = $value;
                            break;
                    }
                }
            }

            // Save the user
            $user->save();

            return response()->json(['messages' => $messages]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation errors if any
            return response()->json(['errors' => $e->errors()], 422);
        }
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
