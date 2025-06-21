/**
 * Gradient Utility Functions
 * Helper functions for applying theme-aware gradients
 */

import { getThemeColor, getThemeGradient } from './themeUtils.js';

/**
 * Get current theme from local storage or default
 * @returns {Object} Current theme object
 */
export const getCurrentTheme = () => {
  try {
    const savedTheme = localStorage.getItem('selectedTheme');
    return savedTheme ? JSON.parse(savedTheme) : getThemeColor('OCEAN');
  } catch {
    return getThemeColor('OCEAN');
  }
};

/**
 * Generate gradient class names for current theme
 * @param {string} gradientType - Type of gradient (primary, secondary, accent, light, dark, subtle)
 * @param {string} direction - Gradient direction (to-r, to-br, to-b, to-bl, to-l, to-tl, to-t, to-tr)
 * @returns {string} Tailwind gradient class
 */
export const getGradientClass = (gradientType = 'primary', direction = 'to-r') => {
  const currentTheme = getCurrentTheme();
  return getThemeGradient(currentTheme, gradientType, direction);
};

/**
 * Generate CSS-in-JS gradient styles for dynamic use
 * @param {string} gradientType - Type of gradient
 * @param {string} direction - CSS gradient direction
 * @returns {Object} CSS style object
 */
export const getGradientStyle = (gradientType = 'primary', direction = 'to right') => {
  const currentTheme = getCurrentTheme();
  
  const gradientMap = {
    primary: `linear-gradient(${direction}, ${currentTheme.primary}CC, ${currentTheme.primary})`,
    secondary: `linear-gradient(${direction}, ${currentTheme.secondary}CC, ${currentTheme.secondary})`,
    accent: `linear-gradient(${direction}, ${currentTheme.primary}, ${currentTheme.secondary})`,
    light: `linear-gradient(${direction}, ${currentTheme.primary}1A, ${currentTheme.secondary}1A)`,
    dark: `linear-gradient(${direction}, ${currentTheme.primary}E6, ${currentTheme.secondary}E6)`,
    subtle: `linear-gradient(${direction}, ${currentTheme.primary}0D, ${currentTheme.secondary}0D)`
  };

  return {
    background: gradientMap[gradientType] || gradientMap.primary
  };
};

/**
 * Get button gradient classes with hover effects
 * @param {string} gradientType - Type of gradient 
 * @param {string} size - Button size (sm, md, lg)
 * @returns {string} Combined CSS classes
 */
export const getButtonGradientClasses = (gradientType = 'primary', size = 'md') => {
  const baseClasses = 'font-medium transition-all duration-300 transform hover:scale-105';
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const gradientClass = getGradientClass(gradientType);
  const hoverEffect = 'hover:opacity-90 hover:shadow-lg';
  
  return `${baseClasses} ${sizeClasses[size]} ${gradientClass} ${hoverEffect} text-white`;
};

/**
 * Get card gradient background classes
 * @param {string} gradientType - Type of gradient
 * @param {boolean} subtle - Whether to use subtle gradient
 * @returns {string} CSS classes for card backgrounds
 */
export const getCardGradientClasses = (gradientType = 'subtle', subtle = true) => {
  const baseClasses = 'backdrop-blur-md border border-white/20 transition-all duration-300';
  const gradientClass = subtle ? getGradientClass('subtle') : getGradientClass(gradientType);
  const hoverEffect = 'hover:border-white/30 hover:backdrop-blur-lg';
  
  return `${baseClasses} ${gradientClass} ${hoverEffect}`;
};

/**
 * Get text gradient classes for headings
 * @returns {string} CSS classes for gradient text
 */
export const getTextGradientClasses = () => {
  return 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] bg-clip-text text-transparent font-bold';
};

/**
 * Get icon background gradient classes
 * @param {string} gradientType - Type of gradient
 * @returns {string} CSS classes for icon containers
 */
export const getIconGradientClasses = (gradientType = 'light') => {
  const baseClasses = 'p-3 rounded-xl border backdrop-blur-sm transition-all duration-300';
  const gradientClass = getGradientClass(gradientType);
  const borderClass = 'border-[rgba(var(--theme-primary-rgb),0.3)]';
  
  return `${baseClasses} ${gradientClass} ${borderClass}`;
};

/**
 * Predefined gradient combinations for common UI elements
 */
export const GRADIENT_PRESETS = {
  // Button presets
  primaryButton: 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white hover:opacity-90',
  secondaryButton: 'bg-gradient-to-r from-[rgba(var(--theme-primary-rgb),0.1)] to-[rgba(var(--theme-secondary-rgb),0.1)] border border-[rgba(var(--theme-primary-rgb),0.2)]',
  
  // Card presets
  glassCard: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20',
  accentCard: 'bg-gradient-to-br from-[rgba(var(--theme-primary-rgb),0.1)] to-[rgba(var(--theme-secondary-rgb),0.1)] backdrop-blur-md border border-[rgba(var(--theme-primary-rgb),0.2)]',
  
  // Header presets
  pageHeader: 'bg-gradient-to-br from-slate-50/50 to-white/30 backdrop-blur-sm border-b border-white/20',
  sectionHeader: 'bg-gradient-to-r from-[rgba(var(--theme-primary-rgb),0.05)] to-[rgba(var(--theme-secondary-rgb),0.05)]',
    // Text presets
  gradientText: 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] bg-clip-text text-transparent font-bold',    // Icon presets
  iconContainer: 'bg-gradient-to-br from-[rgba(var(--theme-primary-rgb),0.2)] to-[rgba(var(--theme-secondary-rgb),0.2)] border border-[rgba(var(--theme-primary-rgb),0.3)]',
  
  // Exact gradient theming as requested
  exactGradient: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30'
};

export default {
  getCurrentTheme,
  getGradientClass,
  getGradientStyle,
  getButtonGradientClasses,
  getCardGradientClasses,
  getTextGradientClasses,
  getIconGradientClasses,
  GRADIENT_PRESETS
};
