/**
 * Sidebar Navigation Organism
 * 
 * A comprehensive navigation sidebar component following Atomic Design principles.
 * Implements ISO 25010 maintainability standards with modular architecture,
 * accessibility features, and responsive design patterns.
 * 
 * @component
 * @example
 * ```jsx
 * <Sidebar 
 *   isOpen={sidebarOpen}
 *   onToggle={toggleSidebar}
 *   navigationItems={pages}
 *   currentUrl={currentUrl}
 * />
 * ```
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Link, usePage } from "@inertiajs/react";
import {
  Button,
  ScrollShadow,
  Chip,
  Divider
} from "@heroui/react";
import {
  XMarkIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { GlassCard } from '@components/atoms/glass-card';
import { useSidebarState } from '@frontend/shared/hooks/useSidebarState';
import { sidebarUtils } from './utils';

/**
 * Sidebar Navigation Component
 * 
 * Complex navigation organism that provides hierarchical menu navigation
 * with state persistence, responsive behavior, and accessibility features.
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Controls sidebar visibility
 * @param {Function} props.onToggle - Callback for sidebar toggle
 * @param {Array} props.navigationItems - Array of navigation page objects
 * @param {string} props.currentUrl - Current active URL path
 * @param {Object} props.config - Optional configuration object
 * @returns {JSX.Element} Rendered Sidebar component
 */
const Sidebar = ({ 
  isOpen = false,
  onToggle,
  navigationItems = [],
  currentUrl = '',
  config = {}
}) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Custom hooks for state management
  const {
    openSubMenus,
    setOpenSubMenus,
    saveSubMenuState,
    clearAllState
  } = useSidebarState();

  // Local state
  const [activePage, setActivePage] = useState(currentUrl);

  // Configuration with defaults
  const sidebarConfig = {
    showVersionInfo: true,
    enableStateReset: process.env.NODE_ENV === 'development',
    maxSubMenuItems: 10,
    animationDuration: 200,
    ...config
  };

  /**
   * Effect: Update active page and auto-expand parent menus
   */
  useEffect(() => {
    setActivePage(currentUrl);
    
    // Auto-expand parent menu if a submenu item is active
    navigationItems.forEach(page => {
      if (page.subMenu) {
        const hasActiveSubPage = page.subMenu.some(
          subPage => "/" + subPage.route === currentUrl
        );
        if (hasActiveSubPage) {
          setOpenSubMenus(prev => {
            const newSet = new Set([...prev, page.name]);
            saveSubMenuState(newSet);
            return newSet;
          });
        }
      }
    });
  }, [currentUrl, navigationItems, saveSubMenuState, setOpenSubMenus]);

  /**
   * Handle submenu toggle with state persistence
   */
  const handleSubMenuToggle = useCallback((pageName) => {
    setOpenSubMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageName)) {
        newSet.delete(pageName);
      } else {
        newSet.add(pageName);
      }
      
      saveSubMenuState(newSet);
      return newSet;
    });
  }, [saveSubMenuState, setOpenSubMenus]);

  /**
   * Handle page navigation click
   */
  const handlePageClick = useCallback((pageName) => {
    setActivePage(pageName);
    if (isMobile) {
      onToggle?.();
    }
  }, [isMobile, onToggle]);

  /**
   * Group navigation pages by category
   */
  const groupedPages = useMemo(() => {
    return sidebarUtils.groupPagesByCategory(navigationItems);
  }, [navigationItems]);

  /**
   * Render individual menu item (with submenu support)
   */
  const renderMenuItem = useCallback((page, isSubMenu = false) => {
    const isActive = activePage === "/" + page.route;
    const hasActiveSubPage = page.subMenu?.some(
      subPage => "/" + subPage.route === activePage
    );
    const isExpanded = openSubMenus.has(page.name);

    if (page.subMenu) {
      return (
        <div key={page.name} className="w-full">
          <Button
            variant={hasActiveSubPage ? "flat" : "light"}
            color={hasActiveSubPage ? "primary" : "default"}
            startContent={page.icon}
            endContent={
              <ChevronRightIcon 
                className={`w-4 h-4 transition-transform duration-${sidebarConfig.animationDuration} ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                aria-hidden="true"
              />
            }
            className={`w-full justify-start h-12 ${
              isSubMenu ? 'pl-8' : 'pl-4'
            } bg-transparent hover:bg-white/10 transition-all ${
              hasActiveSubPage ? 'bg-primary/20 border-l-3 border-primary' : ''
            }`}
            onPress={() => handleSubMenuToggle(page.name)}
            size={isMobile ? "sm" : "md"}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${page.name}`}
            aria-label={`Toggle ${page.name} submenu`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{page.name}</span>
              {page.subMenu.length > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="ml-2 bg-white/20 text-xs min-w-unit-6 h-unit-5"
                  aria-label={`${page.subMenu.length} items`}
                >
                  {page.subMenu.length}
                </Chip>
              )}
            </div>
          </Button>
          
          {/* Submenu Items */}
          {isExpanded && (
            <div 
              id={`submenu-${page.name}`}
              className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-2"
              role="menu"
              aria-label={`${page.name} submenu`}
            >
              {page.subMenu.slice(0, sidebarConfig.maxSubMenuItems).map(subPage => (
                <Button
                  key={subPage.name}
                  as={Link}
                  href={route(subPage.route)}
                  method={subPage.method}
                  preserveState
                  preserveScroll
                  variant={activePage === "/" + subPage.route ? "flat" : "light"}
                  color={activePage === "/" + subPage.route ? "primary" : "default"}
                  startContent={subPage.icon}
                  className={`w-full justify-start h-10 pl-4 bg-transparent hover:bg-white/10 transition-all ${
                    activePage === "/" + subPage.route 
                      ? 'bg-primary/20 border-l-2 border-primary' 
                      : ''
                  }`}
                  onPress={() => handlePageClick(subPage.name)}
                  size="sm"
                  role="menuitem"
                  aria-current={activePage === "/" + subPage.route ? 'page' : undefined}
                >
                  <span className="text-sm">{subPage.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Button
        key={page.name}
        as={Link}
        href={route(page.route)}
        method={page.method}
        preserveState
        preserveScroll
        variant={isActive ? "flat" : "light"}
        color={isActive ? "primary" : "default"}
        startContent={page.icon}
        className={`w-full justify-start h-12 ${
          isSubMenu ? 'pl-8' : 'pl-4'
        } bg-transparent hover:bg-white/10 transition-all ${
          isActive ? 'bg-primary/20 border-l-3 border-primary' : ''
        }`}
        onPress={() => handlePageClick(page.name)}
        size={isMobile ? "sm" : "md"}
        role="menuitem"
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="font-medium">{page.name}</span>
      </Button>
    );
  }, [activePage, openSubMenus, handleSubMenuToggle, handlePageClick, isMobile, sidebarConfig]);

  /**
   * Render navigation sections
   */
  const renderNavigationSections = useCallback(() => {
    const { mainPages, settingsPages } = groupedPages;

    return (
      <>
        {/* Main Navigation */}
        {mainPages.length > 0 && (
          <nav className="space-y-1" role="navigation" aria-label="Main navigation">
            {mainPages.map(page => renderMenuItem(page))}
          </nav>
        )}

        {/* Settings Section */}
        {settingsPages.length > 0 && (
          <>
            <Divider className="my-4 bg-white/20" />
            <nav className="space-y-1" role="navigation" aria-label="Settings navigation">
              <Typography 
                variant="caption" 
                className="px-4 py-2 text-default-500 font-semibold uppercase tracking-wider"
                component="h2"
              >
                Settings
              </Typography>
              {settingsPages.map(page => renderMenuItem(page))}
            </nav>
          </>
        )}

        {/* Fallback: render all pages if no categorization */}
        {mainPages.length === 0 && settingsPages.length === 0 && (
          <nav className="space-y-1" role="navigation" aria-label="Navigation">
            {navigationItems.map(page => renderMenuItem(page))}
          </nav>
        )}
      </>
    );
  }, [groupedPages, navigationItems, renderMenuItem]);

  /**
   * Sidebar content component
   */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/20">
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          component="h1"
        >
          Navigation
        </Typography>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={onToggle}
          className="text-foreground hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </header>

      {/* Navigation Content */}
      <ScrollShadow 
        className="flex-1 overflow-auto"
        hideScrollBar={false}
        size={10}
      >
        <div className="p-4 space-y-2">
          {renderNavigationSections()}
        </div>
      </ScrollShadow>

      {/* Footer */}
      <footer className="p-4 border-t border-white/20">
        <div className="text-center space-y-2">
          {sidebarConfig.showVersionInfo && (
            <Typography variant="caption" className="text-default-500">
              Glass ERP v1.0
            </Typography>
          )}
          {sidebarConfig.enableStateReset && (
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={clearAllState}
              className="text-xs"
              aria-label="Clear sidebar state for debugging"
            >
              Clear Sidebar State
            </Button>
          )}
        </div>
      </footer>
    </div>
  );

  // Mobile Sidebar (Full Screen Overlay)
  if (isMobile) {
    if (!isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div 
          className="absolute inset-0"
          onClick={onToggle}
          aria-hidden="true"
        />
        <aside className="w-80 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl">
          <SidebarContent />
        </aside>
      </div>
    );
  }

  // Desktop/Tablet Sidebar - only render when open
  if (!isOpen && !isMobile) {
    return null;
  }

  // Desktop/Tablet Sidebar
  return (
    <Box 
      sx={{ 
        p: 2, 
        height: '100%',
        transition: 'width 0.3s ease'
      }}
      component="aside"
      role="complementary"
      aria-label="Navigation sidebar"
    >
      <GlassCard className="h-full">
        <SidebarContent />
      </GlassCard>
    </Box>
  );
};

export default Sidebar;
