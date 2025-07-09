<?php

namespace App\Policies;

use App\Models\QualityNCR;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QualityNCRPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('quality.ncr.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, QualityNCR $qualityNCR): bool
    {
        return $user->hasPermissionTo('quality.ncr.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('quality.ncr.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, QualityNCR $qualityNCR): bool
    {
        return $user->hasPermissionTo('quality.ncr.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, QualityNCR $qualityNCR): bool
    {
        return $user->hasPermissionTo('quality.ncr.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, QualityNCR $qualityNCR): bool
    {
        return $user->hasPermissionTo('quality.ncr.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, QualityNCR $qualityNCR): bool
    {
        return $user->hasPermissionTo('quality.ncr.delete');
    }
}
