/**
 * Profile Dropdown Component
 * 
 * User profile dropdown with settings, theme controls, and logout.
 * Reusable across mobile and desktop headers with proper accessibility
 * and responsive sizing.
 * 
 * @component
 * @example
 * ```jsx
 * <ProfileDropdown 
 *   auth={authUser}
 *   darkMode={isDark}
 *   toggleDarkMode={handleToggleDark}
 *   toggleThemeDrawer={handleToggleTheme}
 *   handleNavigation={navigate}
 *   size="md"
 * />
 * ```
 */

import React from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Switch
} from "@heroui/react";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SwatchIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { router } from '@inertiajs/react';

/**
 * Profile Dropdown Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.auth - Authentication data with user information
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 * @param {Function} props.toggleThemeDrawer - Function to toggle theme drawer
 * @param {Function} props.handleNavigation - Navigation handler function
 * @param {string} props.size - Avatar size ("sm", "md", "lg")
 * @returns {JSX.Element} Rendered ProfileDropdown component
 */
const ProfileDropdown = ({ 
  auth, 
  darkMode, 
  toggleDarkMode, 
  toggleThemeDrawer, 
  handleNavigation, 
  size = "md" 
}) => {
  /**
   * Handle logout with proper cleanup
   */
  const handleLogout = () => {
    router.post('/logout', {}, {
      preserveState: false,
      preserveScroll: false,
      onStart: () => console.log('Logout started'),
      onSuccess: () => console.log('Logout completed'),
      onError: (errors) => console.error('Logout error:', errors),
      onFinish: () => console.log('Logout finished')
    });
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = () => {
    if (!auth?.user) return 'User';
    return auth.user.first_name || auth.user.name || 'User';
  };

  /**
   * Get user profile image
   */
  const getUserProfileImage = () => {
    return auth?.user?.profile_image || null;
  };

  return (
    <Dropdown
      placement="bottom-end"
      classNames={{
        content: "bg-white/10 backdrop-blur-md border border-white/20"
      }}
    >
      <DropdownTrigger>
        <Avatar
          as="button"
          size={size}
          src={getUserProfileImage()}
          name={getUserDisplayName()}
          className="transition-transform hover:scale-105"
          aria-label="User profile menu"
          showFallback
        />
      </DropdownTrigger>
      
      <DropdownMenu
        aria-label="Profile Actions"
        variant="faded"
        className="min-w-48"
      >
        {/* Profile */}
        <DropdownItem
          key="profile"
          startContent={<UserCircleIcon className="w-4 h-4" />}
          onPress={() => {
            if (auth?.user?.id) {
              handleNavigation(route('profile', { user: auth.user.id }));
            }
          }}
          aria-label="View profile"
        >
          Profile
        </DropdownItem>

        {/* Settings */}
        <DropdownItem
          key="settings"
          startContent={<Cog6ToothIcon className="w-4 h-4" />}
          onPress={() => handleNavigation(route('dashboard'))}
          aria-label="Open settings"
        >
          Settings
        </DropdownItem>

        {/* Themes */}
        <DropdownItem
          key="themes"
          startContent={<SwatchIcon className="w-4 h-4" />}
          onPress={toggleThemeDrawer}
          aria-label="Open theme selector"
        >
          Themes
        </DropdownItem>

        {/* Dark Mode Toggle */}
        <DropdownItem key="theme-toggle" className="p-0">
          <div className="flex items-center justify-between w-full px-2 py-1">
            <div className="flex items-center gap-2">
              {darkMode ? (
                <MoonIcon className="w-4 h-4" />
              ) : (
                <SunIcon className="w-4 h-4" />
              )}
              <span>Dark Mode</span>
            </div>
            <Switch
              size="sm"
              isSelected={darkMode}
              onValueChange={toggleDarkMode}
              classNames={{
                wrapper: "bg-white/20"
              }}
              aria-label="Toggle dark mode"
            />
          </div>
        </DropdownItem>

        {/* Logout */}
        <DropdownItem
          key="logout"
          color="danger"
          startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          onPress={handleLogout}
          aria-label="Logout"
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
