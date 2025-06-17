/**
 * Device Type Detection Hook
 * 
 * Determines device type based on screen width and user agent.
 * Provides responsive behavior for different screen sizes with proper
 * breakpoint detection and user agent analysis.
 * 
 * @hook
 * @returns {Object} Device type flags and utilities
 * @returns {boolean} return.isMobile - True if mobile device (≤640px or mobile user agent)
 * @returns {boolean} return.isTablet - True if tablet device (641-1024px)
 * @returns {boolean} return.isDesktop - True if desktop device (>1024px)
 * @returns {string} return.deviceType - String representation of device type
 * @returns {Object} return.breakpoints - Current breakpoint information
 * 
 * @example
 * ```jsx
 * const { isMobile, isTablet, isDesktop, deviceType } = useDeviceType();
 * 
 * return (
 *   <div>
 *     {isMobile && <MobileComponent />}
 *     {isTablet && <TabletComponent />}
 *     {isDesktop && <DesktopComponent />}
 *     <p>Current device: {deviceType}</p>
 *   </div>
 * );
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { useWindowSize } from './useWindowSize';

export const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const windowSize = useWindowSize();

  // Breakpoint constants following Material-UI standards
  const BREAKPOINTS = {
    MOBILE: 640,      // sm breakpoint
    TABLET: 1024,     // md breakpoint
    DESKTOP: 1440     // lg breakpoint
  };

  /**
   * Update device type based on window size and user agent
   */
  const updateDeviceType = useCallback(() => {
    const width = windowSize.width;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Enhanced mobile detection
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    
    // Tablet detection
    const tabletRegex = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i;
    const isTabletUserAgent = tabletRegex.test(userAgent.toLowerCase());

    // Device type determination logic
    if (width <= BREAKPOINTS.MOBILE || (isMobileUserAgent && !isTabletUserAgent)) {
      setIsMobile(true);
      setIsTablet(false);
      setIsDesktop(false);
    } else if (width <= BREAKPOINTS.TABLET || isTabletUserAgent) {
      setIsMobile(false);
      setIsTablet(true);
      setIsDesktop(false);
    } else {
      setIsMobile(false);
      setIsTablet(false);
      setIsDesktop(true);
    }
  }, [windowSize.width]);

  // Update device type when window size changes
  useEffect(() => {
    updateDeviceType();
  }, [updateDeviceType]);

  /**
   * Get current device type as string
   */
  const getDeviceType = useCallback(() => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isDesktop) return 'desktop';
    return 'unknown';
  }, [isMobile, isTablet, isDesktop]);

  /**
   * Get current breakpoint information
   */
  const getCurrentBreakpoint = useCallback(() => {
    const width = windowSize.width;
    
    if (width <= BREAKPOINTS.MOBILE) {
      return {
        name: 'mobile',
        value: 'sm',
        width: BREAKPOINTS.MOBILE,
        range: `0-${BREAKPOINTS.MOBILE}px`
      };
    } else if (width <= BREAKPOINTS.TABLET) {
      return {
        name: 'tablet',
        value: 'md',
        width: BREAKPOINTS.TABLET,
        range: `${BREAKPOINTS.MOBILE + 1}-${BREAKPOINTS.TABLET}px`
      };
    } else {
      return {
        name: 'desktop',
        value: 'lg',
        width: BREAKPOINTS.DESKTOP,
        range: `${BREAKPOINTS.TABLET + 1}px+`
      };
    }
  }, [windowSize.width]);

  /**
   * Check if current device matches specific breakpoint
   */
  const isBreakpoint = useCallback((breakpoint) => {
    switch (breakpoint.toLowerCase()) {
      case 'mobile':
      case 'sm':
        return isMobile;
      case 'tablet':
      case 'md':
        return isTablet;
      case 'desktop':
      case 'lg':
      case 'xl':
        return isDesktop;
      default:
        return false;
    }
  }, [isMobile, isTablet, isDesktop]);

  /**
   * Get responsive grid columns based on device type
   */
  const getGridColumns = useCallback((mobileColumns = 1, tabletColumns = 2, desktopColumns = 4) => {
    if (isMobile) return mobileColumns;
    if (isTablet) return tabletColumns;
    return desktopColumns;
  }, [isMobile, isTablet, isDesktop]);

  /**
   * Get responsive size based on device type
   */
  const getResponsiveSize = useCallback((mobileSizes, tabletSizes, desktopSizes) => {
    if (isMobile) return mobileSizes;
    if (isTablet) return tabletSizes;
    return desktopSizes;
  }, [isMobile, isTablet, isDesktop]);

  return {
    // Device type flags
    isMobile,
    isTablet,
    isDesktop,
    
    // Device type string
    deviceType: getDeviceType(),
    
    // Breakpoint information
    breakpoints: {
      constants: BREAKPOINTS,
      current: getCurrentBreakpoint()
    },
    
    // Utility functions
    isBreakpoint,
    getGridColumns,
    getResponsiveSize,
    
    // Window size (from useWindowSize hook)
    windowSize
  };
};
