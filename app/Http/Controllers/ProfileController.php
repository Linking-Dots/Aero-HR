<?php

namespace App\Http\Controllers;

use App\Models\HRM\Department;
use App\Models\HRM\Designation;
use App\Models\User;
use App\Services\Profile\ProfileCrudService;
use App\Services\Profile\ProfileMediaService;
use App\Services\Profile\ProfileUpdateService;
use App\Services\Profile\ProfileValidationService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    protected ProfileValidationService $validationService;
    protected ProfileCrudService $crudService;
    protected ProfileUpdateService $updateService;
    protected ProfileMediaService $mediaService;

    public function __construct(
        ProfileValidationService $validationService,
        ProfileCrudService $crudService,
        ProfileUpdateService $updateService,
        ProfileMediaService $mediaService
    ) {
        $this->validationService = $validationService;
        $this->crudService = $crudService;
        $this->updateService = $updateService;
        $this->mediaService = $mediaService;
    }
    /**
     * Display the user's profile form.
     */
    public function index(Request $request, User $user): Response
    {
        $reportTo = User::find($user->report_to);
        $userDetails = $this->crudService->getUserWithDetails($user->id);

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

    public function store(Request $request)
    {
        // Validate the incoming request
        $validator = $this->validationService->validateUserCreation($request);

        // If validation fails, return the errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create a new user
        $user = $this->crudService->createUser($validator->validated());

        // Return a success response with the created user data
        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = $this->crudService->findUser($request->id);

        try {
            // Validate the request
            $validated = $this->validationService->validateUserUpdate($request);

            // Update user profile
            $messages = $this->updateService->updateUserProfile($user, $validated);

            // Handle profile image upload
            $imageMessages = $this->mediaService->handleProfileImageUpload($user, $request);
            $messages = array_merge($messages, $imageMessages);

            // Save the user
            $this->crudService->saveUser($user);

            return response()->json([
                'messages' => $messages,
                'user' => $user
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }




    public function delete(Request $request)
    {
        $userId = $request->input('user_id');

        if (!$this->crudService->deleteUser($userId)) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        try {
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
