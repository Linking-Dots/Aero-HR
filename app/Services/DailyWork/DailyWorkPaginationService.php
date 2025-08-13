<?php

namespace App\Services\DailyWork;

use App\Models\DailyWork;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class DailyWorkPaginationService
{
    /**
     * Get paginated daily works based on user role and filters
     */
    public function getPaginatedDailyWorks(Request $request): LengthAwarePaginator
    {
        $user = Auth::user();
        $perPage = $request->get('perPage', 30);
        $page = $request->get('search') != '' ? 1 : $request->get('page', 1);
        $search = $request->get('search');
        $statusFilter = $request->get('status');
        $inChargeFilter = $request->get('inCharge');
        $startDate = $request->get('startDate');
        $endDate = $request->get('endDate');

        $query = $this->buildBaseQuery($user);
        $query = $this->applyFilters($query, $search, $statusFilter, $inChargeFilter, $startDate, $endDate);

        return $query->orderBy('date', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get all daily works based on user role and filters
     */
    public function getAllDailyWorks(Request $request): array
    {
        $user = Auth::user();
        $search = $request->get('search');
        $statusFilter = $request->get('status');
        $inChargeFilter = $request->get('inCharge');
        $startDate = $request->get('startDate');
        $endDate = $request->get('endDate');

        $query = $this->buildBaseQuery($user);
        $query = $this->applyFilters($query, $search, $statusFilter, $inChargeFilter, $startDate, $endDate);

        $dailyWorks = $query->orderBy('date', 'desc')->get();

        return [
            'dailyWorks' => $dailyWorks,
            'role' => $this->getUserRole($user),
            'userInfo' => $this->getUserInfo($user)
        ];
    }

    /**
     * Build base query based on user designation
     */
    private function buildBaseQuery(User $user)
    {
        $userWithDesignation = User::with('designation')->find($user->id);
        $userDesignationTitle = $userWithDesignation->designation?->title;
        
        if ($userDesignationTitle === 'Supervision Engineer') {
            return DailyWork::with('reports')->where('incharge', $user->id);
        }

        if (in_array($userDesignationTitle, ['Quality Control Inspector', 'Asst. Quality Control Inspector'])) {
            return DailyWork::with('reports')->where('assigned', $user->id);
        }

        if ($user->hasRole('Administrator')) {
            return DailyWork::with('reports');
        }

        return DailyWork::query();
    }

    /**
     * Apply filters to the query
     */
    private function applyFilters($query, ?string $search, ?string $statusFilter, ?string $inChargeFilter, ?string $startDate, ?string $endDate)
    {
        // Apply search if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%");
            });
        }

        // Apply status filter if provided
        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }

        // Apply in-charge filter if provided
        if ($inChargeFilter) {
            $query->where('incharge', $inChargeFilter);
        }

        // Apply date range filter if provided
        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('date', '>=', $startDate);
        }

        return $query;
    }

    /**
     * Get user role for response based on designation
     */
    private function getUserRole(User $user): string
    {
        $userWithDesignation = User::with('designation')->find($user->id);
        $userDesignationTitle = $userWithDesignation->designation?->title;
        
        if ($userDesignationTitle === 'Supervision Engineer') {
            return 'Supervision Engineer';
        }

        if ($userDesignationTitle === 'Quality Control Inspector') {
            return 'Quality Control Inspector';
        }

        if ($userDesignationTitle === 'Asst. Quality Control Inspector') {
            return 'Asst. Quality Control Inspector';
        }

        if ($user->hasRole('Administrator')) {
            return 'Administrator';
        }

        return 'Unknown';
    }

    /**
     * Get additional user info for response based on designation
     */
    private function getUserInfo(User $user): array
    {
        $userWithDesignation = User::with('designation')->find($user->id);
        $userDesignationTitle = $userWithDesignation->designation?->title;
        
        if ($userDesignationTitle === 'Supervision Engineer') {
            return [
                'allInCharges' => [],
                'juniors' => User::where('incharge', $user->user_name)->get(),
            ];
        }

        if ($user->hasRole('Administrator')) {
            return [
                'allInCharges' => User::whereHas('designation', function($q) {
                    $q->where('title', 'Supervision Engineer');
                })->get(),
                'juniors' => [],
            ];
        }

        return [];
    }
}
