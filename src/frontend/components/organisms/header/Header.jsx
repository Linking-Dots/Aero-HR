import React, { useEffect } from 'react';
import { usePage, useScrollTrigger } from '@inertiajs/react';

// New structure imports
import { useDeviceType } from '@shared/hooks';
import { useNavigation } from './hooks/useNavigation';
import { MobileHeader, DesktopHeader } from './components';

// Legacy imports (to be moved to shared/assets)
import useTheme from '@/theme.jsx';

/**
 * Header Component - Atomic Design: Organism
 * 
 * Responsive application header that adapts to different screen sizes.
 * Provides navigation, user profile access, and theme controls with
 * modular sub-components and custom hooks.
 * 
 * Features:
 * - Responsive design (mobile navbar, desktop header bar)
 * - Logo and branding display
 * - Main navigation menu with dropdowns
 * - User profile dropdown with settings
 * - Dark mode toggle
 * - Theme drawer access
 * - Sidebar toggle control
 * - Scroll-based visibility (desktop)
 * - Modular sub-components for maintainability
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 * @param {boolean} props.themeDrawerOpen - Theme drawer state
 * @param {Function} props.toggleThemeDrawer - Function to toggle theme drawer
 * @param {boolean} props.sideBarOpen - Sidebar state
 * @param {Function} props.toggleSideBar - Function to toggle sidebar
 * @param {string} props.url - Current URL path
 * @param {Array} props.pages - Navigation pages configuration
 * @returns {JSX.Element} Rendered Header component
 * 
 * @example
 * <Header
 *   darkMode={isDark}
 *   toggleDarkMode={handleToggleDark}
 *   themeDrawerOpen={themeOpen}
 *   toggleThemeDrawer={handleToggleTheme}
 *   sideBarOpen={sidebarOpen}
 *   toggleSideBar={handleToggleSidebar}
 *   url="/dashboard"
 *   pages={navigationPages}
 * />
 */
const Header = React.memo(({ 
  darkMode, 
  toggleDarkMode, 
  themeDrawerOpen, 
  toggleThemeDrawer, 
  sideBarOpen, 
  toggleSideBar, 
  url, 
  pages 
}) => {
  const theme = useTheme(darkMode);
  const { auth } = usePage().props;
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const { activePage, handleNavigation } = useNavigation(url);
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <>
      {isMobile && (
        <MobileHeader 
          sideBarOpen={sideBarOpen}
          toggleSideBar={toggleSideBar}
          auth={auth}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          toggleThemeDrawer={toggleThemeDrawer}
          handleNavigation={handleNavigation}
        />
      )}
      
      {(isTablet || isDesktop) && (
        <DesktopHeader 
          trigger={trigger}
          sideBarOpen={sideBarOpen}
          toggleSideBar={toggleSideBar}
          pages={pages}
          activePage={activePage}
          handleNavigation={handleNavigation}
          auth={auth}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          toggleThemeDrawer={toggleThemeDrawer}
          isTablet={isTablet}
        />
      )}
    </>
  );
});

Header.displayName = 'Header';

export default Header;
