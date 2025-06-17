/**
 * Theme Setting Drawer Custom Hook
 * 
 * Manages theme setting drawer state and interactions.
 * Handles theme selection, dark mode toggling, and state persistence.
 */

import { useCallback, useMemo } from 'react';

export const useThemeSettingDrawer = ({
  darkMode,
  onDarkModeChange,
  selectedTheme,
  onThemeChange,
  config
}) => {
  
  // Handle dark mode toggle
  const handleDarkModeToggle = useCallback(() => {
    if (onDarkModeChange) {
      onDarkModeChange(!darkMode);
    }
  }, [darkMode, onDarkModeChange]);

  // Handle theme color selection
  const handleThemeColorSelect = useCallback((theme) => {
    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [onThemeChange]);

  // Check if theme is selected
  const isThemeSelected = useCallback((theme) => {
    return selectedTheme?.name === theme.name;
  }, [selectedTheme]);

  // Get available themes from config
  const availableThemes = useMemo(() => {
    return config.themeColors || [];
  }, [config.themeColors]);

  // Theme utilities
  const getThemeByName = useCallback((name) => {
    return availableThemes.find(theme => theme.name === name);
  }, [availableThemes]);

  const getSelectedThemeColor = useCallback(() => {
    return selectedTheme?.color || config.themeColors[0]?.color;
  }, [selectedTheme, config.themeColors]);

  return {
    handleDarkModeToggle,
    handleThemeColorSelect,
    isThemeSelected,
    availableThemes,
    getThemeByName,
    getSelectedThemeColor
  };
};
