<?php

namespace App\Policies;

use App\Models\QualityCalibration;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QualityCalibrationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('quality.calibrations.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, QualityCalibration $qualityCalibration): bool
    {
        return $user->hasPermissionTo('quality.calibrations.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('quality.calibrations.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, QualityCalibration $qualityCalibration): bool
    {
        return $user->hasPermissionTo('quality.calibrations.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, QualityCalibration $qualityCalibration): bool
    {
        return $user->hasPermissionTo('quality.calibrations.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, QualityCalibration $qualityCalibration): bool
    {
        return $user->hasPermissionTo('quality.calibrations.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, QualityCalibration $qualityCalibration): bool
    {
        return $user->hasPermissionTo('quality.calibrations.delete');
    }
}
