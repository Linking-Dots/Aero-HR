<?php

namespace App\Http\Controllers;

use App\Models\Letter;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LetterController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get();

        // Loop through each user and add a new field 'role' with the role name
        $users->transform(function ($user) {
            $user->role = $user->roles->first()->name;
            return $user;
        });

        return Inertia::render('Letters', [
            'users' => $users,
            'title' => 'Letters',
        ]);
    }

    public function paginate(Request $request)
    {
        $perPage = $request->get('perPage', 30); // Default to 10 items per page
        $page = $request->get('search') != '' ? 1 : $request->get('page', 1);
        $search = $request->get('search'); // Search query

        // Base query depending on user's role
        $query = Letter::query();

        // Apply search if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('from', 'LIKE', "%{$search}%")
                    ->orWhere('received_date', 'LIKE', "%{$search}%")
                    ->orWhere('memo_number', 'LIKE', "%{$search}%")
                    ->orWhere('subject', 'LIKE', "%{$search}%")
                    ->orWhere('action_taken', 'LIKE', "%{$search}%")
                    ->orWhere('response_date', 'LIKE', "%{$search}%");

            });
        }

        // Order by 'date' in descending order
        $paginatedLetters = $query->orderBy('received_date', 'desc')->paginate($perPage, ['*'], 'page', $page);

        // Return the paginated response as JSON
        return response()->json($paginatedLetters);
    }
}
