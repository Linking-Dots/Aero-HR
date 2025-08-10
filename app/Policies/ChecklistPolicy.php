<?php

namespace App\Policies;

use App\Models\Checklist;
use App\Models\User;

class ChecklistPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('hr.checklists.view');
    }

    public function view(User $user, Checklist $checklist): bool
    {
        return $user->can('hr.checklists.view');
    }

    public function create(User $user): bool
    {
        return $user->can('hr.checklists.create');
    }

    public function update(User $user, Checklist $checklist): bool
    {
        return $user->can('hr.checklists.update');
    }

    public function delete(User $user, Checklist $checklist): bool
    {
        return $user->can('hr.checklists.delete');
    }

    public function restore(User $user, Checklist $checklist): bool
    {
        return $user->can('hr.checklists.update');
    }

    public function forceDelete(User $user, Checklist $checklist): bool
    {
        return false; // not allowed
    }
}
