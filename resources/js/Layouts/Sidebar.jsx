import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Link, usePage } from "@inertiajs/react";
import {
  Button,
  Accordion,
  AccordionItem,
  Divider,
  ScrollShadow,
  Chip,
  Input,
  Avatar,
  Badge,
  Tooltip
} from "@heroui/react";
import {
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  StarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import GlassCard from "@/Components/GlassCard.jsx";
import { GRADIENT_PRESETS, getTextGradientClasses, getIconGradientClasses } from '@/utils/gradientUtils.js';
import { getThemePrimaryColor, hexToRgba } from '@/theme.jsx';

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

const Sidebar = React.memo(({ toggleSideBar, pages, url, sideBarOpen }) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { auth } = usePage().props;
  
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
    const expandParentMenus = (menuItems, targetUrl, parentNames = []) => {
      for (const page of menuItems) {
        const currentParents = [...parentNames, page.name];
        
        // Check if this page matches the current URL
        if (page.route && "/" + page.route === targetUrl) {
          // Expand all parent menus
          setOpenSubMenus(prev => {
            const newSet = new Set([...prev, ...currentParents.slice(0, -1)]);
            saveSubMenuState(newSet);
            return newSet;
          });
          return true;
        }
        
        // Check submenu recursively
        if (page.subMenu) {
          if (expandParentMenus(page.subMenu, targetUrl, currentParents)) {
            return true;
          }
        }
      }
      return false;
    };
    
    expandParentMenus(pages, url);
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

  const themeColor = getThemePrimaryColor(muiTheme);
  const themeColorRgba = hexToRgba(themeColor, 0.5);

  const renderCompactMenuItem = useCallback((page, isSubMenu = false, level = 0) => {
    const isActive = activePage === "/" + page.route;
    const hasActiveSubPage = page.subMenu?.some(
      subPage => {
        if (subPage.route) return "/" + subPage.route === activePage;
        if (subPage.subMenu) return subPage.subMenu.some(nestedPage => "/" + nestedPage.route === activePage);
        return false;
      }
    );
    const isExpanded = openSubMenus.has(page.name);
    const activeStyle = isActive || hasActiveSubPage ? {
      background: themeColorRgba,
      borderLeft: `2px solid ${themeColor}`,
      color: themeColor,
    } : {};
    
    const paddingLeft = level === 0 ? 'px-3' : level === 1 ? 'px-4' : 'px-5';
    const height = level === 0 ? 'h-9' : level === 1 ? 'h-8' : 'h-7';
    const iconSize = level === 0 ? 'w-3 h-3' : level === 1 ? 'w-3 h-3' : 'w-3 h-3';
    const textSize = level === 0 ? 'text-sm' : level === 1 ? 'text-xs' : 'text-xs';
    
    if (page.subMenu) {
      return (
        <div key={page.name} className="w-full">
          <Button
            variant="light"
            color={hasActiveSubPage ? "primary" : "default"}
            startContent={
              <div style={hasActiveSubPage ? { color: themeColor } : {}}>
                {React.cloneElement(page.icon, { className: iconSize })}
              </div>
            }
            endContent={
              <ChevronRightIcon 
                className={`w-3 h-3 transition-all duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                style={isExpanded ? { color: themeColor } : {}}
              />
            }
            className={`w-full justify-start ${height} ${paddingLeft} bg-transparent hover:bg-white/10 transition-all duration-200 hover:scale-105 rounded-xl`}
            style={activeStyle}
            onPress={() => handleSubMenuToggle(page.name)}
            size="sm"
          >
            <div className="flex items-center justify-between w-full">
              <span className={`${textSize} font-medium`} style={hasActiveSubPage ? { color: themeColor } : {}}>
                {page.name}
              </span>
              <Chip
                size="sm"
                variant="flat"
                className="text-xs h-4 min-w-4 px-1 transition-all duration-300"
                style={hasActiveSubPage ? { background: themeColorRgba, color: themeColor } : {}}
              >
                {page.subMenu.length}
              </Chip>
            </div>
          </Button>
          {/* Compact Submenu */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className={`${level === 0 ? 'ml-6' : 'ml-4'} mt-1 space-y-0.5 border-l border-primary/20 pl-2`}>
              {page.subMenu.map((subPage, index) => renderCompactMenuItem(subPage, true, level + 1))}
            </div>
          </div>
        </div>
      );
    }
    
    // No submenu - leaf item
    if (page.route) {
      return (
        <Button
          key={page.name}
          as={Link}
          href={route(page.route)}
          method={page.method}
          preserveState
          preserveScroll
          variant="light"
          startContent={
            <div style={isActive ? { color: themeColor } : {}}>
              {React.cloneElement(page.icon, { className: iconSize })}
            </div>
          }
          className={`w-full justify-start ${height} ${paddingLeft} bg-transparent hover:bg-white/10 transition-all duration-200 hover:scale-105 rounded-xl`}
          style={isActive ? { background: themeColorRgba, borderLeft: `2px solid ${themeColor}`, color: themeColor } : {}}
          onPress={() => handlePageClick(page.name)}
          size="sm"
        >
          <span className={`${textSize} font-medium`} style={isActive ? { color: themeColor } : {}}>
            {page.name}
          </span>
        </Button>
      );
    }
    
    // Category header without route
    return (
      <div key={page.name} className="w-full">
        <Button
          variant="light"
          color={hasActiveSubPage ? "primary" : "default"}
          startContent={
            <div style={hasActiveSubPage ? { color: themeColor } : {}}>
              {React.cloneElement(page.icon, { className: iconSize })}
            </div>
          }
          endContent={
            <ChevronRightIcon 
              className={`w-3 h-3 transition-all duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              style={isExpanded ? { color: themeColor } : {}}
            />
          }
          className={`w-full justify-start ${height} ${paddingLeft} bg-transparent hover:bg-white/10 transition-all duration-200 hover:scale-105 rounded-xl`}
          style={activeStyle}
          onPress={() => handleSubMenuToggle(page.name)}
          size="sm"
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${textSize} font-medium`} style={hasActiveSubPage ? { color: themeColor } : {}}>
              {page.name}
            </span>
            <Chip
              size="sm"
              variant="flat"
              className="text-xs h-4 min-w-4 px-1 transition-all duration-300"
              style={hasActiveSubPage ? { background: themeColorRgba, color: themeColor } : {}}
            >
              {page.subMenu?.length || 0}
            </Chip>
          </div>
        </Button>
        {/* Compact Submenu */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`${level === 0 ? 'ml-6' : 'ml-4'} mt-1 space-y-0.5 border-l border-primary/20 pl-2`}>
            {page.subMenu?.map((subPage, index) => renderCompactMenuItem(subPage, true, level + 1))}
          </div>
        </div>
      </div>
    );
  }, [activePage, openSubMenus, handleSubMenuToggle, handlePageClick, themeColor, themeColorRgba]);

  const renderMenuItem = useCallback((page, isSubMenu = false, level = 0) => {
    const isActive = page.route && activePage === "/" + page.route;
    const hasActiveSubPage = page.subMenu?.some(
      subPage => {
        if (subPage.route) return "/" + subPage.route === activePage;
        if (subPage.subMenu) return subPage.subMenu.some(nestedPage => "/" + nestedPage.route === activePage);
        return false;
      }
    );
    const isExpanded = openSubMenus.has(page.name);

    const marginLeft = level === 0 ? '' : level === 1 ? 'ml-8' : 'ml-12';
    const paddingLeft = level === 0 ? 'pl-4' : level === 1 ? 'pl-6' : 'pl-8';

    if (page.subMenu) {
      return (
        <div key={page.name} className="w-full">
          <Button
            variant="light"
            color={hasActiveSubPage ? "primary" : "default"}
            startContent={
              <div>
                {page.icon}
              </div>
            }
            endContent={
              <ChevronRightIcon 
                className={`w-4 h-4 transition-all duration-300 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                style={isExpanded ? { color: themeColor } : {}}
              />
            }
            className={`w-full justify-start h-14 ${paddingLeft} pr-4 bg-transparent hover:bg-white/10 transition-all duration-300 group hover:scale-105 ${
              hasActiveSubPage 
                ? `${GRADIENT_PRESETS.accentCard} border-l-4 border-blue-500 shadow-lg` 
                : 'hover:border-l-4 hover:border-blue-500/30'
            }`}
            onPress={() => handleSubMenuToggle(page.name)}
            size="md"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <span className={`font-semibold text-sm ${hasActiveSubPage ? 'text-blue-600' : 'text-foreground'}`}>
                  {page.name}
                </span>
                <span className="text-xs text-default-400 group-hover:text-default-500 transition-colors">
                  {page.subMenu.length} {level === 0 ? 'categories' : 'modules'}
                </span>
              </div>
              <Chip
                size="sm"
                variant="flat"
                className={`transition-all duration-300 ${
                  hasActiveSubPage 
                    ? `${GRADIENT_PRESETS.accentCard} text-blue-600` 
                    : 'bg-white/10 text-default-500 group-hover:bg-white/20'
                }`}
              >
                {page.subMenu.length}
              </Chip>
            </div>
          </Button>
          
          {/* Submenu Items with Animation */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className={`${marginLeft} mt-2 space-y-1 border-l-2 border-primary/20 pl-4 relative`}>
              {page.subMenu.map((subPage, index) => (
                <div
                  key={subPage.name}
                  className={`transform transition-all duration-300 delay-${index * 50} ${
                    isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
                >
                  {renderMenuItem(subPage, true, level + 1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // No submenu - either a route or category
    if (page.route) {
      return (
        <Button
          key={page.name}
          as={Link}
          href={route(page.route)}
          method={page.method}
          preserveState
          preserveScroll
          variant="light"
          startContent={
            <div >
              {page.icon}
            </div>
          }
          className={`w-full justify-start h-11 ${paddingLeft} pr-4 bg-transparent hover:bg-white/10 transition-all duration-300 group hover:scale-105 ${
            isActive 
              ? `${GRADIENT_PRESETS.accentCard} border-l-3 border-blue-500 text-blue-600 shadow-md` 
              : 'hover:border-l-3 hover:border-blue-500/30'
          }`}
          onPress={() => handlePageClick(page.name)}
          size="sm"
        >
          <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-foreground'}`}>
            {page.name}
          </span>
        </Button>
      );
    }

    // Category without route - just display as header
    return (
      <div key={page.name} className="w-full">
        <div className={`${paddingLeft} pr-4 py-2`}>
          <div className="flex items-center gap-2">
            <div>
              {page.icon}
            </div>
            <span className="text-sm font-semibold text-foreground/80">
              {page.name}
            </span>
          </div>
        </div>
      </div>
    );
  }, [activePage, openSubMenus, handleSubMenuToggle, handlePageClick]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-full">
      {/* Compact Header - Using PageHeader theming */}
      <div className={GRADIENT_PRESETS.pageHeader}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={GRADIENT_PRESETS.iconContainer}>
                <Typography variant="body2" className="font-black text-white text-xs">
                  A
                </Typography>
              </div>
              <div>
                <Typography variant="body2" className={`font-bold leading-tight ${GRADIENT_PRESETS.gradientText}`}>
                  AeroHR
                </Typography>
                <Typography variant="caption" className="text-default-400 text-xs leading-tight">
                  Enterprise
                </Typography>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={toggleSideBar}
              className="text-foreground hover:bg-white/10 transition-all duration-200 min-w-6 w-6 h-6"
            >
              <XMarkIcon className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Compact User Info - Using PageHeader theming */}
          {auth.user && (
            <div className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${GRADIENT_PRESETS.accentCard}`}>
              <div className="flex items-center gap-2">
                <Avatar
                  size="sm"
                  src={auth.user.profile_image}
                  fallback={auth.user.first_name?.charAt(0)}
                  className="w-6 h-6"
                />
                <div className="flex-1 min-w-0">
                  <Typography variant="caption" className="font-medium text-foreground truncate block">
                    {auth.user.first_name} {auth.user.last_name}
                  </Typography>
                  {auth.user.roles && auth.user.roles.length > 0 && (
                    <Typography variant="caption" className="text-default-400 text-xs truncate block">
                      {auth.user.roles[0].name}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Navigation */}
      <ScrollShadow className="flex-1 overflow-auto" hideScrollBar size={5}>
        <div className="p-3 space-y-1">
          
          {/* Main Navigation - Compact */}
          {groupedPages.mainPages.length > 0 && (
            <div className="space-y-1">
              <Typography variant="caption" className="px-2 text-default-500 font-bold text-xs uppercase tracking-wide">
                Main
              </Typography>
              {groupedPages.mainPages.map(page => renderCompactMenuItem(page))}
            </div>
          )}

          {/* Settings Section - Compact */}
          {groupedPages.settingsPages.length > 0 && (
            <div className="space-y-1 mt-3">
              <Typography variant="caption" className="px-2 text-default-500 font-bold text-xs uppercase tracking-wide">
                Admin
              </Typography>
              {groupedPages.settingsPages.map(page => renderCompactMenuItem(page))}
            </div>
          )}

          {/* All Pages fallback */}
          {groupedPages.mainPages.length === 0 && groupedPages.settingsPages.length === 0 && (
            <div className="space-y-1">
              <Typography variant="caption" className="px-2 text-default-500 font-bold text-xs uppercase tracking-wide">
                Modules
              </Typography>
              {pages.map(page => renderCompactMenuItem(page))}
            </div>
          )}
        </div>
      </ScrollShadow>

      {/* Compact Footer - Using PageHeader theming */}
      <div className="p-3 border-t border-white/10">
        <div className={`flex items-center justify-between p-2 rounded-md backdrop-blur-sm transition-all duration-300 ${GRADIENT_PRESETS.accentCard}`}>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-foreground">Online</span>
          </div>
          <Typography variant="caption" className="text-default-500 text-xs">
            v2.1.0
          </Typography>
        </div>
      </div>
    </div>
  );
  // Unified Sidebar for both Mobile and Desktop
  return (
    <Box sx={{ 
      p: isMobile ? 0 : 2, 
      height: '100%',
      width: 'fit-content',
      minWidth: isMobile ? '240px' : '220px',
      maxWidth: isMobile ? '280px' : '260px',
      overflow: 'hidden'
    }}>
      <div className="h-full">
        <GlassCard className="h-full">
          <SidebarContent />
        </GlassCard>
      </div>
    </Box>
  );
});

export default Sidebar;
