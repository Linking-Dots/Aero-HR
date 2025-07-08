<?php

namespace App\Policies;

use App\Models\Competency;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompetencyPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('hr.competencies.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Competency $competency): bool
    {
        return $user->can('hr.competencies.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('hr.competencies.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Competency $competency): bool
    {
        return $user->can('hr.competencies.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Competency $competency): bool
    {
        return $user->can('hr.competencies.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Competency $competency): bool
    {
        return $user->can('hr.competencies.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Competency $competency): bool
    {
        return $user->can('hr.competencies.delete');
    }
}
