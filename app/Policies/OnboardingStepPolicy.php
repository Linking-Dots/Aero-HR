<?php

namespace App\Policies;

use App\Models\OnboardingStep;
use App\Models\User;

class OnboardingStepPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.onboarding.view');
    }

    public function view(User $user, OnboardingStep $step): bool
    {
        return $user->can('hr.onboarding.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.onboarding.create');
    }

    public function update(User $user, OnboardingStep $step): bool
    {
        return $user->can('hr.onboarding.update');
    }

    public function delete(User $user, OnboardingStep $step): bool
    {
        return $user->can('hr.onboarding.delete');
    }
}
