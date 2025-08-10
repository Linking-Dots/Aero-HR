<?php

namespace App\Policies;

use App\Models\OffboardingStep;
use App\Models\User;

class OffboardingStepPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.offboarding.view');
    }

    public function view(User $user, OffboardingStep $step): bool
    {
        return $user->can('hr.offboarding.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.offboarding.create');
    }

    public function update(User $user, OffboardingStep $step): bool
    {
        return $user->can('hr.offboarding.update');
    }

    public function delete(User $user, OffboardingStep $step): bool
    {
        return $user->can('hr.offboarding.delete');
    }
}
