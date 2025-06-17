/**
 * Mobile Header Component
 * 
 * Compact navigation bar optimized for mobile devices.
 * Features sidebar toggle, logo, and profile dropdown.
 * 
 * @component
 * @example
 * ```jsx
 * <MobileHeader 
 *   sideBarOpen={false}
 *   toggleSideBar={handleToggleSidebar}
 *   auth={authUser}
 *   darkMode={isDark}
 *   toggleDarkMode={handleToggleDark}
 *   toggleThemeDrawer={handleToggleTheme}
 *   handleNavigation={navigate}
 * />
 * ```
 */

import React from 'react';
import { Box, Typography, Grow } from '@mui/material';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Button
} from "@heroui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { ProfileDropdown } from './ProfileDropdown';

// Logo import (to be moved to shared/assets later)
import logo from '../../../../../../../public/assets/images/logo.png';

/**
 * Mobile Header Component
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.sideBarOpen - Current sidebar state
 * @param {Function} props.toggleSideBar - Function to toggle sidebar
 * @param {Object} props.auth - Authentication data
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 * @param {Function} props.toggleThemeDrawer - Function to toggle theme drawer
 * @param {Function} props.handleNavigation - Navigation handler function
 * @returns {JSX.Element} Rendered MobileHeader component
 */
const MobileHeader = ({
  sideBarOpen,
  toggleSideBar,
  auth,
  darkMode,
  toggleDarkMode,
  toggleThemeDrawer,
  handleNavigation
}) => {
  return (
    <Box 
      sx={{ mb: 2 }}
      component="header"
      role="banner"
      aria-label="Mobile navigation header"
    >
      <Grow in>
        <Navbar
          shouldHideOnScroll
          maxWidth="full"
          classNames={{
            base: "bg-white/10 backdrop-blur-md border-b border-white/20",
            wrapper: "px-4",
            content: "gap-4"
          }}
        >
          {/* Sidebar Toggle */}
          <NavbarContent justify="start">
            <Button
              isIconOnly
              variant="light"
              onPress={toggleSideBar}
              className="text-foreground"
              aria-label={sideBarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Bars3Icon className="w-5 h-5" />
            </Button>
          </NavbarContent>

          {/* Logo */}
          <NavbarContent justify="center">
            <NavbarBrand>
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt="DBEDC Logo"
                  className="h-8 w-8"
                />
                <Typography
                  variant="h6"
                  className="font-bold text-foreground hidden sm:block"
                  style={{ fontFamily: 'monospace', letterSpacing: '.1rem' }}
                >
                  DBEDC
                </Typography>
              </div>
            </NavbarBrand>
          </NavbarContent>

          {/* Profile Menu */}
          <NavbarContent justify="end">
            <ProfileDropdown 
              auth={auth}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              toggleThemeDrawer={toggleThemeDrawer}
              handleNavigation={handleNavigation}
              size="sm"
            />
          </NavbarContent>
        </Navbar>
      </Grow>
    </Box>
  );
};

export default MobileHeader;
