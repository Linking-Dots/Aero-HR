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
            variant="light"
            color={hasActiveSubPage ? "primary" : "default"}
            startContent={
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                hasActiveSubPage ? 'bg-primary/20' : 'bg-white/5'
              }`}>
                {page.icon}
              </div>
            }
            endContent={
              <ChevronRightIcon 
                className={`w-4 h-4 transition-all duration-300 ${
                  isExpanded ? 'rotate-90 text-primary' : 'text-default-400'
                }`}
              />
            }
            className={`w-full justify-start h-14 ${
              isSubMenu ? 'pl-12' : 'pl-4'
            } pr-4 bg-transparent hover:bg-white/10 transition-all duration-300 group ${
              hasActiveSubPage 
                ? 'bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary shadow-lg' 
                : 'hover:border-l-4 hover:border-primary/30'
            }`}
            onPress={() => handleSubMenuToggle(page.name)}
            size="md"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <span className={`font-semibold text-sm ${hasActiveSubPage ? 'text-primary' : 'text-foreground'}`}>
                  {page.name}
                </span>
                <span className="text-xs text-default-400 group-hover:text-default-500 transition-colors">
                  {page.subMenu.length} modules
                </span>
              </div>
              <Chip
                size="sm"
                variant="flat"
                className={`transition-all duration-300 ${
                  hasActiveSubPage 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-white/10 text-default-500 group-hover:bg-white/20'
                }`}
              >
                {page.subMenu.length}
              </Chip>
            </div>
          </Button>
          
          {/* Submenu Items with Animation */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="ml-8 mt-2 space-y-1 border-l-2 border-primary/20 pl-4 relative">
              {page.subMenu.map((subPage, index) => {
                const isSubActive = activePage === "/" + subPage.route;
                return (
                  <div
                    key={subPage.name}
                    className={`transform transition-all duration-300 delay-${index * 50} ${
                      isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                    }`}
                  >
                    <Button
                      as={Link}
                      href={route(subPage.route)}
                      method={subPage.method}
                      preserveState
                      preserveScroll
                      variant="light"
                      startContent={
                        <div className={`p-1 rounded-md transition-all duration-300 ${
                          isSubActive ? 'bg-primary/20' : 'bg-white/5'
                        }`}>
                          {subPage.icon}
                        </div>
                      }
                      className={`w-full justify-start h-11 pl-4 pr-4 bg-transparent hover:bg-white/10 transition-all duration-300 ${
                        isSubActive 
                          ? 'bg-primary/10 border-l-3 border-primary text-primary shadow-md' 
                          : 'hover:border-l-3 hover:border-primary/30'
                      }`}
                      onPress={() => handlePageClick(subPage.name)}
                      size="sm"
                    >
                      <span className={`text-sm font-medium ${isSubActive ? 'text-primary' : 'text-foreground'}`}>
                        {subPage.name}
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
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
        variant="light"
        startContent={
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${
            isActive ? 'bg-primary/20' : 'bg-white/5'
          }`}>
            {page.icon}
          </div>
        }
        className={`w-full justify-start h-14 ${
          isSubMenu ? 'pl-12' : 'pl-4'
        } pr-4 bg-transparent hover:bg-white/10 transition-all duration-300 group ${
          isActive 
            ? 'bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary shadow-lg' 
            : 'hover:border-l-4 hover:border-primary/30'
        }`}
        onPress={() => handlePageClick(page.name)}
        size="md"
      >
        <div className="flex flex-col items-start w-full">
          <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
            {page.name}
          </span>
          {page.description && (
            <span className="text-xs text-default-400 group-hover:text-default-500 transition-colors">
              {page.description}
            </span>
          )}
        </div>
      </Button>
    );
  }, [activePage, openSubMenus, handleSubMenuToggle, handlePageClick]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Modern Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                <Typography
                  variant="h6"
                  className="font-black text-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  A
                </Typography>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <Typography 
                variant="h6" 
                className="font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight"
                style={{ letterSpacing: '-0.025em' }}
              >
                AeroHR
              </Typography>
              <Typography variant="caption" className="text-default-400 block leading-tight font-medium">
                Enterprise Platform
              </Typography>
            </div>
          </div>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={toggleSideBar}
            className="text-foreground hover:bg-white/10 transition-all duration-300 hover:rotate-90"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Enhanced User Card */}
        {auth.user && (
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Avatar
                  size="md"
                  src={auth.user.profile_image}
                  fallback={auth.user.first_name?.charAt(0)}
                  className="ring-2 ring-primary/30"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <Typography variant="body2" className="font-bold text-foreground truncate">
                  {auth.user.first_name} {auth.user.last_name}
                </Typography>
                <Typography variant="caption" className="text-default-400">
                  {auth.user.email}
                </Typography>
              </div>
            </div>
            
            {/* Role Badges */}
            {auth.user.roles && auth.user.roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {auth.user.roles.slice(0, 2).map((role, index) => (
                  <Chip
                    key={index}
                    size="sm"
                    variant="flat"
                    startContent={<ShieldCheckIcon className="w-3 h-3" />}
                    className="bg-primary/20 text-primary text-xs font-medium"
                  >
                    {role.name}
                  </Chip>
                ))}
                {auth.user.roles.length > 2 && (
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-default/20 text-default-500 text-xs"
                  >
                    +{auth.user.roles.length - 2}
                  </Chip>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="mt-4">
          <Input
            placeholder="Search modules..."
            startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
            classNames={{
              inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300",
              input: "text-sm"
            }}
            size="sm"
          />
        </div>
      </div>

      {/* Navigation Content */}
      <ScrollShadow 
        className="flex-1 overflow-auto"
        hideScrollBar={false}
        size={10}
      >
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Typography variant="body2" className="font-bold text-foreground flex items-center gap-2">
                <StarIcon className="w-4 h-4 text-primary" />
                Quick Access
              </Typography>
              <Chip
                size="sm"
                variant="flat"
                className="bg-primary/20 text-primary font-bold"
              >
                {pages.length}
              </Chip>
            </div>
            
            {/* Favorites or Recent */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="flat"
                className="h-16 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300"
                startContent={<HomeIcon className="w-5 h-5 text-blue-500" />}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold">Dashboard</span>
                  <span className="text-xs text-default-400">Overview</span>
                </div>
              </Button>
              <Button
                variant="flat"
                className="h-16 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300"
                startContent={<ClockIcon className="w-5 h-5 text-green-500" />}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold">Today</span>
                  <span className="text-xs text-default-400">Activities</span>
                </div>
              </Button>
            </div>
          </div>

          <Divider className="bg-white/10" />
          
          {/* Main Navigation */}
          {groupedPages.mainPages.length > 0 && (
            <div className="space-y-2">
              <Typography 
                variant="caption" 
                className="px-2 py-1 text-default-500 font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Main Modules
              </Typography>
              <div className="space-y-1">
                {groupedPages.mainPages.map(page => renderMenuItem(page))}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {groupedPages.settingsPages.length > 0 && (
            <>
              <Divider className="bg-white/10" />
              <div className="space-y-2">
                <Typography 
                  variant="caption" 
                  className="px-2 py-1 text-default-500 font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  Administration
                </Typography>
                <div className="space-y-1">
                  {groupedPages.settingsPages.map(page => renderMenuItem(page))}
                </div>
              </div>
            </>
          )}

          {/* If no categorization, render all pages */}
          {groupedPages.mainPages.length === 0 && groupedPages.settingsPages.length === 0 && (
            <div className="space-y-2">
              <Typography 
                variant="caption" 
                className="px-2 py-1 text-default-500 font-bold uppercase tracking-wider"
              >
                All Modules
              </Typography>
              <div className="space-y-1">
                {pages.map(page => renderMenuItem(page))}
              </div>
            </div>
          )}
        </div>
      </ScrollShadow>

      {/* Enhanced Footer */}
      <div className="p-6 border-t border-white/10 bg-gradient-to-r from-slate-500/5 to-gray-500/5">
        <div className="space-y-3">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-foreground">System Online</span>
            </div>
            <Badge content="99.9%" color="success" size="sm" />
          </div>
          
          {/* Version Info */}
          <div className="text-center space-y-1">
            <Typography variant="caption" className="text-default-500 font-bold">
              AeroHR Enterprise v2.1.0
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Button
                size="sm"
                variant="light"
                color="warning"
                onPress={clearAllState}
                className="text-xs w-full"
              >
                Clear Cache
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  // Mobile Sidebar (Full Screen Overlay with Animation)
  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${
        sideBarOpen 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
      }`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            sideBarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleSideBar}
        />
        <div 
          className={`min-w-80 max-w-96 w-fit h-full bg-white/5 backdrop-blur-2xl border-r border-white/20 shadow-2xl transform transition-transform duration-500 ease-out ${
            sideBarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent />
        </div>
      </div>
    );
  }

  // Desktop/Tablet Sidebar with Smooth Animation
  return (
    <Box sx={{ 
      p: 2, 
      height: '100%',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: sideBarOpen ? 'translateX(0)' : 'translateX(-100%)',
      opacity: sideBarOpen ? 1 : 0,
      
      overflow: 'hidden'
    }}>
      <div className={`h-full transition-all duration-500 ease-out ${
        sideBarOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <GlassCard className="h-full">
          <SidebarContent />
        </GlassCard>
      </div>
    </Box>
  );
};

export default Sidebar;
