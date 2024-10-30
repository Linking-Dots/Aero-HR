<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function sendOtp(Request $request): \Illuminate\Http\JsonResponse
    {
        // Validate the request with a custom error message
        $validatedData = $request->validate([
            'email' => 'required|email|exists:users,email',  // Ensure email exists in the users table
        ], [
            'email.required' => 'The email field is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.exists' => 'There is no account associated with this email.',
        ]);

        // Generate a 6-digit OTP
        $otp = random_int(100000, 999999);

        // Store OTP securely in the password_resets table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validatedData['email']],
            [
                'token' => bcrypt($otp),  // Hash the OTP
                'created_at' => Carbon::now()
            ]
        );

        // Send OTP to the user's email
        Mail::raw("Your OTP for password reset is: $otp", function ($message) use ($validatedData) {
            $message->to($validatedData['email'])
                ->subject('Your Password Reset OTP');
        });

        // Return a structured response for success
        return response()->json([
            'status' => 'success',
            'message' => 'OTP sent to your email!'
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string'
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->otp, $record->token)) {
            throw ValidationException::withMessages([
                'otp' => ['The provided OTP is invalid.'],
            ]);
        }


        return response()->json(['status' => 'OTP verified successfully.']);
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'newPassword' => 'required|string|min:8|confirmed', // Ensure the password is confirmed
            'newPassword_confirmation' => 'required|string|min:8'
        ]);

        // Find the user by email
        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['No user found with this email address.'],
            ]);
        }

        // Update the user's password
        $user->password = Hash::make($request->newPassword);
        $user->save();

        // Optionally, you can delete the OTP record after successful password reset
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['status' => 'Password reset successfully.']);
    }

}
