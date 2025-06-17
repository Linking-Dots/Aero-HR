/**
 * Desktop Header Component
 * 
 * Full-featured header bar for desktop and tablet devices.
 * Includes navigation menu, logo, and profile controls with
 * scroll-based visibility and responsive design.
 * 
 * @component
 * @example
 * ```jsx
 * <DesktopHeader 
 *   trigger={scrollTrigger}
 *   sideBarOpen={false}
 *   toggleSideBar={handleToggleSidebar}
 *   pages={navigationPages}
 *   activePage="/dashboard"
 *   handleNavigation={navigate}
 *   auth={authUser}
 *   darkMode={isDark}
 *   toggleDarkMode={handleToggleDark}
 *   toggleThemeDrawer={handleToggleTheme}
 *   isTablet={false}
 * />
 * ```
 */

import React from 'react';
import { Box, Typography, Container, Grow, Slide } from '@mui/material';
import { Button } from "@heroui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { GlassCard } from '@components/atoms/glass-card';
import { NavigationMenu } from './NavigationMenu';
import { ProfileDropdown } from './ProfileDropdown';

// Logo import (to be moved to shared/assets later)
import logo from '../../../../../../../public/assets/images/logo.png';

/**
 * Desktop Header Component
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.trigger - Scroll trigger state for visibility
 * @param {boolean} props.sideBarOpen - Current sidebar state
 * @param {Function} props.toggleSideBar - Function to toggle sidebar
 * @param {Array} props.pages - Navigation pages configuration
 * @param {string} props.activePage - Current active page
 * @param {Function} props.handleNavigation - Navigation handler function
 * @param {Object} props.auth - Authentication data
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 * @param {Function} props.toggleThemeDrawer - Function to toggle theme drawer
 * @param {boolean} props.isTablet - True if device is tablet
 * @returns {JSX.Element} Rendered DesktopHeader component
 */
const DesktopHeader = ({
  trigger,
  sideBarOpen,
  toggleSideBar,
  pages,
  activePage,
  handleNavigation,
  auth,
  darkMode,
  toggleDarkMode,
  toggleThemeDrawer,
  isTablet
}) => {
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <Box 
        sx={{ p: 2 }}
        component="header"
        role="banner"
        aria-label="Desktop navigation header"
      >
        <Grow in>
          <GlassCard>
            <Container maxWidth="xl">
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                py: 2,
                gap: 2
              }}>
                {/* Logo and Menu Toggle */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexShrink: 0
                }}>
                  <img
                    src={logo}
                    alt="DBEDC Logo"
                    className="h-10 w-10"
                  />
                  <Typography
                    variant="h6"
                    className="font-bold text-foreground"
                    style={{ 
                      fontFamily: 'monospace', 
                      letterSpacing: '.2rem',
                      display: isTablet ? 'none' : 'block'
                    }}
                  >
                    DBEDC
                  </Typography>
                  {!sideBarOpen && (
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={toggleSideBar}
                      className="text-foreground"
                      aria-label="Open sidebar"
                    >
                      <Bars3Icon className="w-5 h-5" />
                    </Button>
                  )}
                </Box>

                {/* Navigation Menu */}
                <NavigationMenu 
                  pages={pages}
                  activePage={activePage}
                  handleNavigation={handleNavigation}
                  sideBarOpen={sideBarOpen}
                  isTablet={isTablet}
                />

                {/* Profile Menu */}
                <Box sx={{ flexShrink: 0 }}>
                  <ProfileDropdown 
                    auth={auth}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    toggleThemeDrawer={toggleThemeDrawer}
                    handleNavigation={handleNavigation}
                    size={isTablet ? "sm" : "md"}
                  />
                </Box>
              </Box>
            </Container>
          </GlassCard>
        </Grow>
      </Box>
    </Slide>
  );
};

export default DesktopHeader;
