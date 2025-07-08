<?php

namespace App\Policies;

use App\Models\DocumentCategory;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DocumentCategoryPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('hr.documents.categories.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, DocumentCategory $documentCategory): bool
    {
        return $user->can('hr.documents.categories.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('hr.documents.categories.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, DocumentCategory $documentCategory): bool
    {
        return $user->can('hr.documents.categories.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, DocumentCategory $documentCategory): bool
    {
        return $user->can('hr.documents.categories.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, DocumentCategory $documentCategory): bool
    {
        return $user->can('hr.documents.categories.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, DocumentCategory $documentCategory): bool
    {
        return $user->can('hr.documents.categories.delete');
    }
}
