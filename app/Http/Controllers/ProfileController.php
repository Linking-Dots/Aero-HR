<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Designation;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        $userDetails = User::with(['educations', 'experiences'])->where('id', $user->id)->first();

        if ($userDetails) {
            foreach ($userDetails->educations as $education) {
                $education->starting_date = date('Y-m', strtotime($education->starting_date));
                $education->complete_date = date('Y-m', strtotime($education->complete_date));
            }
        }


        return Inertia::render('Profile/UserProfile', [
            'title' => 'Profile',
            'user' => $userDetails,
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
        $user = User::find($request->id);
        try {
            $rules = [
                'id' => 'required|exists:users,id',
            ];

            $messages = [
                'id.required' => 'The user ID is required.',
                'id.exists' => 'The selected user ID does not exist.',

                'name.required' => 'The name field is required.',
                'name.string' => 'The name must be a string.',

                'gender.required' => 'The gender field is required.',
                'gender.string' => 'The gender must be a string.',

                'birthday.date' => 'The birthday must be a valid date.',
                'date_of_joining.date' => 'The date of joining must be a valid date.',
                'address.string' => 'The address must be a string.',
                'employee_id.required' => 'The employee ID is required.',
                'employee_id.integer' => 'The employee ID must be an integer.',
                'phone.required' => 'The phone number is required.',
                'phone.string' => 'The phone number must be a string.',
                'phone.unique' => 'The phone number has already been taken.',
                'email.required' => 'The email field is required.',
                'email.string' => 'The email must be a string.',
                'email.email' => 'The email must be a valid email address.',
                'email.unique' => 'The email has already been taken.',
                'department.required' => 'The department field is required.',
                'department.exists' => 'The selected department does not exist.',
                'designation.required' => 'The designation field is required.',
                'designation.exists' => 'The selected designation does not exist.',
                'profile_image.string' => 'The profile image must be a string.',
                'report_to.required' => 'The report to field is required.',
                'report_to.exists' => 'The selected report to user does not exist.',

                'nid.required' => 'The NID field is required.',
                'nid.string' => 'The NID must be a string.',
                'passport_no.string' => 'The passport number must be a string.',
                'passport_exp_date.date' => 'The passport expiration date must be a valid date.',
                'nationality.required' => 'The nationality field is required.',
                'nationality.string' => 'The nationality must be a string.',
                'religion.required' => 'The religion field is required.',
                'religion.string' => 'The religion must be a string.',
                'marital_status.required' => 'The marital status field is required.',
                'marital_status.string' => 'The marital status must be a string.',
                'employment_of_spouse.string' => 'The employment of spouse must be a string.',
                'number_of_children.integer' => 'The number of children must be an integer.',

                'emergency_contact_primary_name.required' => 'The primary emergency contact name is required.',
                'emergency_contact_primary_name.string' => 'The primary emergency contact name must be a string.',
                'emergency_contact_primary_relationship.required' => 'The primary emergency contact relationship is required.',
                'emergency_contact_primary_relationship.string' => 'The primary emergency contact relationship must be a string.',
                'emergency_contact_primary_phone.required' => 'The primary emergency contact phone number is required.',
                'emergency_contact_primary_phone.string' => 'The primary emergency contact phone number must be a string.',
                'emergency_contact_secondary_name.string' => 'The secondary emergency contact name must be a string.',
                'emergency_contact_secondary_relationship.string' => 'The secondary emergency contact relationship must be a string.',
                'emergency_contact_secondary_phone.string' => 'The secondary emergency contact phone number must be a string.',

                'bank_name.required' => 'The bank name is required.',
                'bank_name.string' => 'The bank name must be a string.',
                'bank_account_no.required' => 'The bank account number is required.',
                'bank_account_no.numeric' => 'The bank account number must be numeric.',
                'ifsc_code.string' => 'The IFSC code must be a string.',
                'pan_no.string' => 'The PAN number must be a string.',

                'family_member_name.required' => 'The family member name is required.',
                'family_member_name.string' => 'The family member name must be a string.',
                'family_member_relationship.required' => 'The family member relationship is required.',
                'family_member_relationship.string' => 'The family member relationship must be a string.',
                'family_member_dob.required' => 'The family member date of birth is required.',
                'family_member_dob.date' => 'The family member date of birth must be a valid date.',
                'family_member_phone.required' => 'The family member phone number is required.',
                'family_member_phone.string' => 'The family member phone number must be a string.',

                'salary_basis.required' => 'The salary basis is required.',
                'salary_basis.string' => 'The salary basis must be a string.',
                'salary_amount.required' => 'The salary amount is required.',
                'salary_amount.numeric' => 'The salary amount must be numeric.',
                'payment_type.required' => 'The payment type is required.',
                'payment_type.string' => 'The payment type must be a string.',
                'pf_contribution.boolean' => 'The PF contribution must be a boolean value.',
                'pf_no.string' => 'The PF number must be a string.',
                'employee_pf_rate.string' => 'The employee PF rate must be a string.',
                'additional_pf_rate.string' => 'The additional PF rate must be a string.',
                'total_pf_rate.string' => 'The total PF rate must be a string.',
                'esi_contribution.boolean' => 'The ESI contribution must be a boolean value.',
                'esi_no.string' => 'The ESI number must be a string.',
                'employee_esi_rate.string' => 'The employee ESI rate must be a string.',
                'additional_esi_rate.string' => 'The additional ESI rate must be a string.',
                'total_esi_rate.string' => 'The total ESI rate must be a string.',
            ];

            if ($request->ruleSet == 'profile') {
                $rules += [
                    'name' => 'required|string',
                    'gender' => 'required|string',
                    'birthday' => 'nullable|date',
                    'date_of_joining' => 'nullable|date',
                    'address' => 'nullable|string',
                    'employee_id' => 'required|integer',
                    'phone' => 'required|string|unique:users,phone,' . $request->id,
                    'email' => 'required|string|email|unique:users,email,' . $request->id,
                    'department' => 'required|exists:departments,id',
                    'designation' => 'required|exists:designations,id',
                    'profile_image' => 'nullable|string',
                    'report_to' => 'required|exists:users,id',
                ];
            } elseif ($request->ruleSet == 'personal') {
                $rules += [
                    'nid' => 'required|string',
                    'passport_no' => 'nullable|string',
                    'passport_exp_date' => 'nullable|date',
                    'nationality' => 'required|string',
                    'religion' => 'required|string',
                    'marital_status' => 'required|string',
                    'employment_of_spouse' => 'nullable|string',
                    'number_of_children' => 'nullable|integer',
                ];
            } elseif ($request->ruleSet == 'emergency'){
                $rules += [
                    'emergency_contact_primary_name' => 'required|string',
                    'emergency_contact_primary_relationship' => 'required|string',
                    'emergency_contact_primary_phone' =>  'required|string',
                    'emergency_contact_secondary_name' => 'nullable|string',
                    'emergency_contact_secondary_relationship' => 'nullable|string',
                    'emergency_contact_secondary_phone' => 'nullable|string',
                ];
            } elseif ($request->ruleSet == 'bank'){
                $rules += [
                    'bank_name' => 'required|string',
                    'bank_account_no' => 'required|numeric',
                    'ifsc_code' => 'nullable|string',
                    'pan_no' => 'nullable|string',
                ];
            } elseif ($request->ruleSet == 'family'){
                $rules += [
                    'family_member_name' => 'required|string',
                    'family_member_relationship' => 'required|string',
                    'family_member_dob' => 'required|date',
                    'family_member_phone' => 'required|string',
                ];
            } elseif ($request->ruleSet == 'salary'){
                $rules += [
                    'salary_basis' => 'required|string',
                    'salary_amount' => 'required|numeric',
                    'payment_type' => 'required|string',
                    'pf_contribution' => 'nullable|boolean',
                    'pf_no' => 'nullable|string',
                    'employee_pf_rate' => 'nullable|numeric',
                    'additional_pf_rate' => 'nullable|numeric',
                    'total_pf_rate' => 'nullable|numeric',
                    'esi_contribution' => 'nullable|boolean',
                    'esi_no' => 'nullable|string',
                    'employee_esi_rate' => 'nullable|numeric',
                    'additional_esi_rate' => 'nullable|numeric',
                    'total_esi_rate' => 'nullable|numeric',
                ];
            }

            $validated = $request->validate($rules, $messages);

            Log::info('Received data:', $validated);


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

                            if (array_key_exists($key, $fieldNames) && ($user->{$key} !== $value)) {
                                $user->{$key} = $value;
                                $humanReadableKey = $fieldNames[$key];
                                if ($key === 'marital_status' && $value === 'Single') {
                                    $user->employment_of_spouse = null;
                                    $user->number_of_children = null;
                                }
                                if ($key === 'pf_contribution') {
                                    $messageValue = $value === 0 ? 'No' : ($value === 1 ? 'Yes' : $value);
                                    $messages[] = $humanReadableKey . ' updated to ' . $messageValue . '.';

                                    if ($value === 0) {
                                        // Delete related fields if pf_contribution is 0
                                        $user->pf_no = null;
                                        $user->employee_pf_rate = 0;
                                        $user->additional_pf_rate = 0;
                                        $user->total_pf_rate = 0;
                                    }
                                } elseif ($key === 'esi_contribution') {
                                    $messageValue = $value === 0 ? 'No' : ($value === 1 ? 'Yes' : $value);
                                    $messages[] = $humanReadableKey . ' updated to ' . $messageValue . '.';

                                    if ($value === 0) {
                                        // Delete related fields if esi_contribution is 0
                                        $user->esi_no = null;
                                        $user->employee_esi_rate = 0;
                                        $user->additional_esi_rate = 0;
                                        $user->total_esi_rate = 0;
                                    }
                                } else {
                                    // Handle other fields
                                    $messages[] = $humanReadableKey . ' updated to ' . $value . '.';
                                }

                            }
                            break;
                    }
                }
            }

            // Save the user
            $user->save();

            return response()->json([
                'messages' => $messages,
                'user' => $user
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error( $e->errors());
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
