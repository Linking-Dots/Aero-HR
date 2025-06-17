/**
 * Navigation Hook for Header Component
 * 
 * Provides navigation functionality with Inertia.js integration,
 * active page tracking, and proper error handling.
 * 
 * @hook
 * @param {string} initialUrl - Initial URL for active page tracking
 * @returns {Object} Navigation utilities and state
 * 
 * @example
 * ```jsx
 * const { 
 *   activePage, 
 *   isNavigating, 
 *   handleNavigation, 
 *   isActivePage 
 * } = useNavigation('/dashboard');
 * 
 * <Button 
 *   variant={isActivePage('/users') ? 'solid' : 'ghost'}
 *   onPress={() => handleNavigation(route('users.index'))}
 * >
 *   Users
 * </Button>
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';

export const useNavigation = (initialUrl) => {
  const [activePage, setActivePage] = useState(initialUrl || '');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState(null);

  /**
   * Update active page when URL changes
   */
  useEffect(() => {
    setActivePage(initialUrl || '');
  }, [initialUrl]);

  /**
   * Handle navigation with proper Inertia.js integration
   * 
   * @param {string} route - The route to navigate to
   * @param {string} method - HTTP method (default: 'get')
   * @param {Object} options - Additional Inertia options
   */
  const handleNavigation = useCallback((route, method = 'get', options = {}) => {
    if (!route) {
      console.warn('Navigation: No route provided');
      return;
    }

    const defaultOptions = {
      method,
      preserveState: true,
      preserveScroll: true,
      ...options
    };

    setIsNavigating(true);
    setNavigationError(null);

    router.visit(route, {
      ...defaultOptions,
      onStart: () => {
        setIsNavigating(true);
        console.log('Navigation started to:', route);
        options.onStart?.();
      },
      onProgress: (progress) => {
        console.log('Navigation progress:', progress);
        options.onProgress?.(progress);
      },
      onSuccess: (page) => {
        setIsNavigating(false);
        setActivePage(route);
        console.log('Navigation completed to:', route);
        options.onSuccess?.(page);
      },
      onError: (errors) => {
        setIsNavigating(false);
        setNavigationError(errors);
        console.error('Navigation error:', errors);
        options.onError?.(errors);
      },
      onFinish: () => {
        setIsNavigating(false);
        console.log('Navigation finished');
        options.onFinish?.();
      }
    });
  }, []);

  /**
   * Check if a given route is the currently active page
   * 
   * @param {string} route - Route to check
   * @returns {boolean} True if route is active
   */
  const isActivePage = useCallback((route) => {
    if (!route || !activePage) return false;
    
    // Normalize routes for comparison
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
    const normalizedActive = activePage.startsWith('/') ? activePage : `/${activePage}`;
    
    return normalizedActive === normalizedRoute;
  }, [activePage]);

  /**
   * Check if a submenu contains the active page
   * 
   * @param {Array} subMenu - Array of submenu items
   * @returns {boolean} True if any submenu item is active
   */
  const hasActiveSubmenu = useCallback((subMenu) => {
    if (!Array.isArray(subMenu)) return false;
    
    return subMenu.some(item => {
      const itemRoute = item.route ? `/${item.route}` : '';
      return isActivePage(itemRoute);
    });
  }, [isActivePage]);

  /**
   * Get navigation state for a specific route
   * 
   * @param {string} route - Route to get state for
   * @returns {Object} Navigation state object
   */
  const getNavigationState = useCallback((route) => {
    return {
      isActive: isActivePage(route),
      isNavigating: isNavigating && isActivePage(route),
      hasError: !!navigationError
    };
  }, [isActivePage, isNavigating, navigationError]);

  /**
   * Handle logout with proper cleanup
   */
  const handleLogout = useCallback((options = {}) => {
    setIsNavigating(true);
    
    router.post('/logout', {}, {
      preserveState: false,
      preserveScroll: false,
      ...options,
      onStart: () => {
        setIsNavigating(true);
        console.log('Logout started');
        options.onStart?.();
      },
      onSuccess: () => {
        setIsNavigating(false);
        setActivePage('');
        console.log('Logout completed');
        options.onSuccess?.();
      },
      onError: (errors) => {
        setIsNavigating(false);
        setNavigationError(errors);
        console.error('Logout error:', errors);
        options.onError?.(errors);
      },
      onFinish: () => {
        setIsNavigating(false);
        console.log('Logout finished');
        options.onFinish?.();
      }
    });
  }, []);

  /**
   * Clear navigation error
   */
  const clearNavigationError = useCallback(() => {
    setNavigationError(null);
  }, []);

  /**
   * Force refresh current page
   */
  const refreshPage = useCallback((options = {}) => {
    if (!activePage) return;
    
    handleNavigation(activePage, 'get', {
      preserveState: false,
      preserveScroll: false,
      ...options
    });
  }, [activePage, handleNavigation]);

  return {
    // State
    activePage,
    isNavigating,
    navigationError,
    
    // Navigation functions
    handleNavigation,
    handleLogout,
    
    // Utility functions
    isActivePage,
    hasActiveSubmenu,
    getNavigationState,
    
    // Actions
    clearNavigationError,
    refreshPage
  };
};
