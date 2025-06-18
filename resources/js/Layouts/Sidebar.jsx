import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Link, usePage } from "@inertiajs/react";
import {
  Button,
  Accordion,
  AccordionItem,
  Divider,
  ScrollShadow,
  Chip
} from "@heroui/react";
import {
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import GlassCard from "../components/ui/GlassCard.jsx";

// Custom hook for sidebar state management
const useSidebarState = () => {
  const [openSubMenus, setOpenSubMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar-open-submenus');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const saveSubMenuState = useCallback((newSubMenus) => {
    try {
      localStorage.setItem('sidebar-open-submenus', JSON.stringify(Array.from(newSubMenus)));
    } catch (error) {
      console.warn('Failed to save submenu state to localStorage:', error);
    }
  }, []);

  const clearAllState = useCallback(() => {
    try {
      localStorage.removeItem('sidebar-open-submenus');
      localStorage.removeItem('sidebar-open');
      setOpenSubMenus(new Set());
    } catch (error) {
      console.warn('Failed to clear sidebar state:', error);
    }
  }, []);

  return {
    openSubMenus,
    setOpenSubMenus,
    saveSubMenuState,
    clearAllState
  };
};

const Sidebar = ({ toggleSideBar, pages, url, sideBarOpen }) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const {
    openSubMenus,
    setOpenSubMenus,
    saveSubMenuState,
    clearAllState
  } = useSidebarState();

  const [activePage, setActivePage] = useState(url);  // Update active page when URL changes
  useEffect(() => {
    setActivePage(url);
    
    // Auto-expand parent menu if a submenu item is active
    pages.forEach(page => {
      if (page.subMenu) {
        const hasActiveSubPage = page.subMenu.some(
          subPage => "/" + subPage.route === url
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
  }, [url, pages, saveSubMenuState]);

  const handleSubMenuToggle = useCallback((pageName) => {
    setOpenSubMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageName)) {
        newSet.delete(pageName);
      } else {
        newSet.add(pageName);
      }
      
      // Save to localStorage
      saveSubMenuState(newSet);
      
      return newSet;
    });
  }, [saveSubMenuState]);

  const handlePageClick = useCallback((pageName) => {
    setActivePage(pageName);
    if (isMobile) {
      toggleSideBar();
    }
  }, [isMobile, toggleSideBar]);

  // Group pages by category if needed
  const groupedPages = useMemo(() => {
    const mainPages = pages.filter(page => !page.category || page.category === 'main');
    const settingsPages = pages.filter(page => page.category === 'settings');
    
    return { mainPages, settingsPages };
  }, [pages]);

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
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            }
            className={`w-full justify-start h-12 ${
              isSubMenu ? 'pl-8' : 'pl-4'
            } bg-transparent hover:bg-white/10 ${
              hasActiveSubPage ? 'bg-primary/20 border-l-3 border-primary' : ''
            }`}
            onPress={() => handleSubMenuToggle(page.name)}
            size={isMobile ? "sm" : "md"}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{page.name}</span>
              {page.subMenu.length > 0 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="ml-2 bg-white/20 text-xs min-w-unit-6 h-unit-5"
                >
                  {page.subMenu.length}
                </Chip>
              )}
            </div>
          </Button>
          
          {/* Submenu Items */}
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-2">
              {page.subMenu.map(subPage => (
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
                  className={`w-full justify-start h-10 pl-4 bg-transparent hover:bg-white/10 ${
                    activePage === "/" + subPage.route 
                      ? 'bg-primary/20 border-l-2 border-primary' 
                      : ''
                  }`}
                  onPress={() => handlePageClick(subPage.name)}
                  size="sm"
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
        } bg-transparent hover:bg-white/10 ${
          isActive ? 'bg-primary/20 border-l-3 border-primary' : ''
        }`}
        onPress={() => handlePageClick(page.name)}
        size={isMobile ? "sm" : "md"}
      >
        <span className="font-medium">{page.name}</span>
      </Button>
    );
  }, [activePage, openSubMenus, handleSubMenuToggle, handlePageClick, isMobile]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Navigation
        </Typography>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={toggleSideBar}
          className="text-foreground hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation Content */}
      <ScrollShadow 
        className="flex-1 overflow-auto"
        hideScrollBar={false}
        size={10}
      >
        <div className="p-4 space-y-2">
          {/* Main Navigation */}
          {groupedPages.mainPages.length > 0 && (
            <div className="space-y-1">
              {groupedPages.mainPages.map(page => renderMenuItem(page))}
            </div>
          )}

          {/* Settings Section */}
          {groupedPages.settingsPages.length > 0 && (
            <>
              <Divider className="my-4 bg-white/20" />
              <div className="space-y-1">
                <Typography 
                  variant="caption" 
                  className="px-4 py-2 text-default-500 font-semibold uppercase tracking-wider"
                >
                  Settings
                </Typography>
                {groupedPages.settingsPages.map(page => renderMenuItem(page))}
              </div>
            </>
          )}

          {/* If no categorization, render all pages */}
          {groupedPages.mainPages.length === 0 && groupedPages.settingsPages.length === 0 && (
            <div className="space-y-1">
              {pages.map(page => renderMenuItem(page))}
            </div>
          )}
        </div>
      </ScrollShadow>      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <div className="text-center space-y-2">
          <Typography variant="caption" className="text-default-500">
            Glass ERP v1.0
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={clearAllState}
              className="text-xs"
            >
              Clear Sidebar State
            </Button>
          )}
        </div>
      </div>
    </div>
  );
  // Mobile Sidebar (Full Screen Overlay)
  if (isMobile) {
    if (!sideBarOpen) return null; // Don't render if not open
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div 
          className="absolute inset-0"
          onClick={toggleSideBar}
        />
        <div className="w-80 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl">
          <SidebarContent />
        </div>
      </div>
    );
  }

  // Desktop/Tablet Sidebar - only render when open
  if (!sideBarOpen && !isMobile) {
    return null;
  }

  // Desktop/Tablet Sidebar
  return (
    <Box sx={{ 
      p: 2, 
      height: '100%',
      
      transition: 'width 0.3s ease'
    }}>
      <GlassCard className="h-full">
        <SidebarContent />
      </GlassCard>
    </Box>
  );
};

export default Sidebar;
