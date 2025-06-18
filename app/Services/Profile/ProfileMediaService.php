<?php

namespace App\Services\Profile;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileMediaService
{
    /**
     * Handle profile image upload and update
     */
    public function handleProfileImageUpload(User $user, Request $request): array
    {
        $messages = [];

        if (!$request->hasFile('profile_image')) {
            return $messages;
        }

        $newProfileImage = $request->file('profile_image');

        // Check if the profile image is the same as the existing one
        $existingMedia = $user->getFirstMedia('profile_image');

        if ($existingMedia && $existingMedia->getPath() === $newProfileImage->getPath()) {
            $messages[] = 'Profile image is already up-to-date.';
            return $messages;
        }

        // Remove old profile image if exists
        if ($user->hasMedia('profile_image')) {
            $user->clearMediaCollection('profile_image');
        }

        // Add new profile image
        $user->addMediaFromRequest('profile_image')
            ->toMediaCollection('profile_image');
        
        $messages[] = 'Profile image changed';

        $newProfileImageUrl = $user->getFirstMediaUrl('profile_image');

        // Update the user's profile_image field with the new URL
        $user->profile_image = $newProfileImageUrl;
        $user->save();

        return $messages;
    }
}
