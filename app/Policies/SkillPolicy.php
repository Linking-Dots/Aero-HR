<?php

namespace App\Policies;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SkillPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('hr.skills.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Skill $skill): bool
    {
        return $user->can('hr.skills.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('hr.skills.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Skill $skill): bool
    {
        return $user->can('hr.skills.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Skill $skill): bool
    {
        return $user->can('hr.skills.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Skill $skill): bool
    {
        return $user->can('hr.skills.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Skill $skill): bool
    {
        return $user->can('hr.skills.delete');
    }
}
