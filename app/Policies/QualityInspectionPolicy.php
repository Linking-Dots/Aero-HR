<?php

namespace App\Policies;

use App\Models\QualityInspection;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QualityInspectionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('quality.inspections.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, QualityInspection $qualityInspection): bool
    {
        return $user->hasPermissionTo('quality.inspections.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('quality.inspections.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, QualityInspection $qualityInspection): bool
    {
        return $user->hasPermissionTo('quality.inspections.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, QualityInspection $qualityInspection): bool
    {
        return $user->hasPermissionTo('quality.inspections.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, QualityInspection $qualityInspection): bool
    {
        return $user->hasPermissionTo('quality.inspections.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, QualityInspection $qualityInspection): bool
    {
        return $user->hasPermissionTo('quality.inspections.delete');
    }
}
