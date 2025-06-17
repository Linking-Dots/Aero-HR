/**
 * ThemeSettingDrawer Molecule Component
 * 
 * A theme configuration drawer that provides controls for switching between
 * dark/light mode and theme color selection. Designed with glass morphism
 * styling and responsive interactions.
 * 
 * Features:
 * - Dark/Light mode toggle
 * - Multiple theme color options
 * - Glass morphism drawer styling
 * - Responsive touch interactions
 * - Accessibility support
 * - State persistence
 * 
 * @component
 * @example
 * ```jsx
 * <ThemeSettingDrawer
 *   open={isOpen}
 *   onClose={handleClose}
 *   darkMode={isDark}
 *   onDarkModeChange={setDarkMode}
 *   selectedTheme={currentTheme}
 *   onThemeChange={setTheme}
 * />
 * ```
 */

import React from 'react';
import { useTheme } from '@mui/material/styles';

import { ThemeSettingDrawerCore } from './components';
import { useThemeSettingDrawer } from './hooks';
import { THEME_SETTING_DRAWER_CONFIG } from './config';

const ThemeSettingDrawer = ({
  open = false,
  onClose,
  darkMode = false,
  onDarkModeChange,
  selectedTheme,
  onThemeChange,
  anchor = 'right',
  className = '',
  style = {}
}) => {
  const theme = useTheme();
  
  const {
    handleDarkModeToggle,
    handleThemeColorSelect,
    availableThemes,
    isThemeSelected
  } = useThemeSettingDrawer({
    darkMode,
    onDarkModeChange,
    selectedTheme,
    onThemeChange,
    config: THEME_SETTING_DRAWER_CONFIG
  });

  return (
    <ThemeSettingDrawerCore
      open={open}
      onClose={onClose}
      anchor={anchor}
      darkMode={darkMode}
      selectedTheme={selectedTheme}
      availableThemes={availableThemes}
      onDarkModeToggle={handleDarkModeToggle}
      onThemeColorSelect={handleThemeColorSelect}
      isThemeSelected={isThemeSelected}
      theme={theme}
      className={className}
      style={style}
      config={THEME_SETTING_DRAWER_CONFIG}
    />
  );
};

export default ThemeSettingDrawer;
