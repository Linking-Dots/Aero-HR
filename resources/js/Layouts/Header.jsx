import * as React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Container, Tooltip, Grow, Collapse, Grid, Slide, useScrollTrigger } from '@mui/material';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Switch,
  Input,
  Badge,
  Kbd,

} from "@heroui/react";
import GlassDropdown from '@/Components/GlassDropdown';
import {
  Bars3Icon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SwatchIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  CommandLineIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

import logo from '../../../public/assets/images/logo.png';
import GlassCard from '@/Components/GlassCard.jsx';
import useTheme, { getThemePrimaryColor, hexToRgba } from '@/theme.jsx';
import { GRADIENT_PRESETS, getTextGradientClasses, getIconGradientClasses, getCardGradientClasses } from '@/utils/gradientUtils.js';

const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const updateDeviceType = () => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUserAgent = /android|iphone|ipad|ipod/i.test(userAgent);

    if (width <= 640 || isMobileUserAgent) {
      setIsMobile(true);
      setIsTablet(false);
      setIsDesktop(false);
    } else if (width <= 1024) {
      setIsMobile(false);
      setIsTablet(true);
      setIsDesktop(false);
    } else {
      setIsMobile(false);
      setIsTablet(false);
      setIsDesktop(true);
    }
  };

  useEffect(() => {
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

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
  
  // Memoize the toggleSideBar function to prevent unnecessary re-renders
  const memoizedToggleSideBar = React.useCallback(() => {
    toggleSideBar();
  }, [toggleSideBar]);
  const { auth, app } = usePage().props;
  const [activePage, setActivePage] = useState(url);
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const trigger = useScrollTrigger();
  useEffect(() => {
    setActivePage(url);
  }, [url]);

  const handleNavigation = useCallback((route, method = 'get') => {
    router.visit(route, {
      method,
      preserveState: true,
      preserveScroll: true
    });
  }, []);
  // Mobile Header Component
  const MobileHeader = () => (
  <Box sx={{ p: 1.5 }}>
    <Grow in>
      <GlassCard>
        <Navbar
          shouldHideOnScroll
          maxWidth="full"
          height="60px" // Increased from 50px for better logo space
          classNames={{
            base: "bg-transparent border-none shadow-none",
            wrapper: "px-2 sm:px-3 max-w-full",
            content: "gap-2"
          }}
        >
          {/* Left: Sidebar Toggle + Logo */}
          <NavbarContent justify="start" className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="light"
              onPress={toggleSideBar}
              className="text-foreground hover:bg-white/10 transition-all duration-300"
              size="sm"
              aria-label={sideBarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Bars3Icon className="w-5 h-5" />
            </Button>

            {/* Logo & Name - Only show when sidebar is closed */}
            {!sideBarOpen && (
              <NavbarBrand className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className={`rounded-xl flex items-center justify-center shadow-xl overflow-hidden ${GRADIENT_PRESETS.iconContainer}`}
                       style={{ 
                         width: 'calc(60px - 20px)', // Dynamic: navbar height minus padding
                         height: 'calc(60px - 20px)', // Dynamic: navbar height minus padding
                         aspectRatio: '1'
                       }}>
                    <img 
                      src={logo} 
                      alt={`${app?.name || 'Company'} Logo`} 
                      className="object-contain"
                      style={{ 
                        width: 'calc(100% - 6px)', // Dynamic: container size minus internal padding
                        height: 'calc(100% - 6px)', // Dynamic: container size minus internal padding
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                      onError={(e) => {
                        // Fallback to text logo if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                   
                  </div>
                  
                </div>

              
              </NavbarBrand>
            )}
          </NavbarContent>

          {/* Center (only for md+ screen) */}
          <NavbarContent justify="center" className="hidden md:flex flex-1 max-w-md">
            <Input
              placeholder="Search..."
              startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
              endContent={<Kbd className="hidden lg:inline-block" keys={["command"]}>K</Kbd>}
              classNames={{
                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                input: "text-sm"
              }}
              size="sm"
            />
          </NavbarContent>

          {/* Right Controls */}
          <NavbarContent justify="end" className="flex items-center gap-1 min-w-0">
            {/* Mobile Search */}
            <Button
              isIconOnly
              variant="light"
              className="md:hidden text-foreground hover:bg-white/10"
              size="sm"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </Button>

            {/* Help */}
            <Tooltip content="Help" placement="bottom">
              <Button
                isIconOnly
                variant="light"
                className="text-foreground hover:bg-white/10"
                size="sm"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
              </Button>
            </Tooltip>

            {/* Notifications */}
            <GlassDropdown placement="bottom-end" closeDelay={100}
              classNames={{
                content: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden"
              }}
            >
              <DropdownTrigger>
                {/* ✅ Single React element inside */}
                <Button
                  isIconOnly
                  variant="light"
                  className="relative text-foreground hover:bg-white/10 transition-all duration-300"
                  size="sm"
                  aria-label="Notifications (12 unread)"
                >
                  <BellIcon className="w-5 h-5" />
                  <Badge
                    content="12"
                    color="danger"
                    size="sm"
                    className="absolute -top-1 -right-1 animate-pulse"
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="w-80 p-0" aria-label="Notifications">
                <DropdownItem key="header" className="cursor-default hover:bg-transparent" textValue="Notifications Header">
                  <div className="p-4 border-b border-divider">
                    <div className="flex items-center justify-between">
                      <Typography variant="h6" className="font-semibold">Notifications</Typography>
                      <Button size="sm" variant="light" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        Mark all read
                      </Button>
                    </div>
                    <Typography variant="caption" className="text-default-500">You have 12 unread notifications</Typography>
                  </div>
                </DropdownItem>
                <DropdownItem key="notification-1" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50" textValue="New message notification">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">New message from John Doe</p>
                      <p className="text-xs text-default-500 truncate">Hey, can we schedule a meeting for tomorrow?</p>
                      <p className="text-xs text-default-400 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem key="view-all" className="p-4 text-center hover:bg-blue-50 dark:hover:bg-blue-900/20" textValue="View all notifications">
                  <Button variant="light" className="text-blue-600 font-medium">
                    View all notifications
                  </Button>
                </DropdownItem>
              </DropdownMenu>
            </GlassDropdown>

            {/* Language Switcher */}
            <Button
              isIconOnly
              variant="light"
              className="text-foreground hover:bg-white/10"
              size="sm"
              aria-label="Change language"
            >
              <CommandLineIcon className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <GlassDropdown
              closeDelay={100}
              classNames={{
                content: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden"
              }}
              placement="bottom-end"
              shouldCloseOnInteractOutside={(element) => {
                // Allow interaction with switches and buttons inside the dropdown
                return !element.closest('[role="switch"]') && !element.closest('[data-testid="dropdown-item"]');
              }}
            >
              <DropdownTrigger>
                <ProfileButton size="sm" />
              </DropdownTrigger>
              <ProfileMenu />
            </GlassDropdown>
          </NavbarContent>
        </Navbar>
      </GlassCard>
    </Grow>
  </Box>
);



  // Desktop Header Component
  const DesktopHeader = () => (
    <Slide appear={false} direction="down" in={!trigger}>
      <Box sx={{ p: 1.5 }}>
        <Grow in>
          <GlassCard>
            <Container maxWidth="xl">
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                py: 2, // Increased from 1.5 for better logo space
                gap: 1.5,
                minHeight: '72px' // Explicit min height for calculations
              }}>
                {/* Logo and Menu Toggle */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexShrink: 0
                }}>
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={toggleSideBar}
                    className="text-foreground hover:bg-white/10 transition-all duration-300"
                    size="sm"
                    aria-label={sideBarOpen ? "Close sidebar" : "Open sidebar"}
                  >
                    <Bars3Icon className="w-5 h-5" />
                  </Button>

                  {/* Only show logo when sidebar is closed */}
                  {!sideBarOpen && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <div className="relative">
                        <div className={`rounded-xl flex items-center justify-center shadow-xl overflow-hidden ${GRADIENT_PRESETS.iconContainer}`}
                             style={{ 
                               width: 'calc(72px - 16px)', // Dynamic: container min-height minus padding
                               height: 'calc(72px - 16px)', // Dynamic: container min-height minus padding
                               aspectRatio: '1'
                             }}>
                          <img 
                            src={logo} 
                            alt={`${app?.name || 'Company'} Logo`} 
                            className="object-contain"
                            style={{ 
                              width: 'calc(100% - 8px)', // Dynamic: container size minus internal padding
                              height: 'calc(100% - 8px)', // Dynamic: container size minus internal padding
                              maxWidth: '100%',
                              maxHeight: '100%'
                            }}
                            onError={(e) => {
                              // Fallback to text logo if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          
                        </div>
                       
                      </div>
                    </Box>
                  )}
                </Box>

                {/* Navigation Menu */}
                <Collapse in={!sideBarOpen} timeout="auto" unmountOnExit>
                  <Box sx={{ flexGrow: 1, mx: 2 }}>
                    <div className={`grid gap-2 ${
                      isTablet ? 'grid-cols-2' : 'grid-cols-4'
                    }`}>
                      {pages.map((page, index) => {
                        // Enhanced active state detection for nested menus
                        const checkActiveRecursive = (menuItem) => {
                          if (activePage === "/" + menuItem.route) return true;
                          if (menuItem.subMenu) {
                            return menuItem.subMenu.some(subItem => checkActiveRecursive(subItem));
                          }
                          return false;
                        };
                        
                        const isActive = checkActiveRecursive(page);
                        // Theme color for active/inactive
                        // Convert hex themeColor to rgba with 0.5 opacity
                        function hexToRgba(hex, alpha) {
                          let c = hex.replace('#', '');
                          if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
                          const num = parseInt(c, 16);
                          return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
                        }
                        const themeColor = getThemePrimaryColor(theme);
                        // Convert hex themeColor to rgba with 0.5 opacity
                        const themeColorRgba = hexToRgba(themeColor, 0.5);
                        const activeGradientStyle = {
                          background: `linear-gradient(90deg, ${themeColorRgba} 0%, ${themeColorRgba} 100%)`,
                          border: `1px solid ${themeColor}`,
                          color: themeColor,
                        };
                        const inactiveText = 'text-default-700';
                        const inactiveIcon = 'text-default-700';
                        return (
                          <div key={`${page.name}-${index}`} className="flex justify-center">
                            {page.subMenu ? (
                              <GlassDropdown
                                placement="bottom"
                                closeDelay={800}
                                shouldBlockScroll={false}
                                isKeyboardDismissDisabled={false}
                                classNames={{
                                  content: "bg-white/10 backdrop-blur-md border border-white/20 min-w-64 max-h-80 overflow-y-auto p-1 dropdown-content-fix"
                                }}
                              >
                                <DropdownTrigger>
                                  <Button
                                    variant="light"
                                    endContent={<ChevronDownIcon className={`w-5 h-5 ${isActive ? 'text-white' : inactiveIcon}`} />}
                                    className={`transition-all duration-300 hover:scale-105 ${
                                      isActive
                                        ? 'text-white'
                                        : `bg-transparent hover:bg-white/10 ${inactiveText}`
                                    } rounded-xl px-4`}
                                    size={isTablet ? "sm" : "md"}
                                    style={isActive ? activeGradientStyle : {}}
                                  >
                                    <span className={`flex items-center gap-2 ${isActive ? 'text-white' : inactiveIcon}`}>{page.icon}</span>
                                    <span className={isActive ? 'text-white font-semibold' : 'font-semibold text-default-700'}>{page.name}</span>
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label={`${page.name} submenu`}
                                  variant="faded"
                                  closeOnSelect={false}
                                  className="p-1 dropdown-menu-container"
                                >
                                  {page.subMenu.map((subPage) => {
                                    // Enhanced active state detection for nested submenus
                                    const checkSubActiveRecursive = (menuItem) => {
                                      if (activePage === "/" + menuItem.route) return true;
                                      if (menuItem.subMenu) {
                                        return menuItem.subMenu.some(subItem => checkSubActiveRecursive(subItem));
                                      }
                                      return false;
                                    };
                                    
                                    const isSubActive = checkSubActiveRecursive(subPage);
                                    
                                    // Check if this submenu item has nested children
                                    if (subPage.subMenu && subPage.subMenu.length > 0) {
                                      return (
                                        <DropdownItem key={subPage.name} className="p-0 hover:bg-transparent" textValue={subPage.name}>
                                          <div className="dropdown-trigger-wrapper w-full">
                                            <GlassDropdown
                                              placement="right-start"
                                              offset={4}
                                              closeDelay={800}
                                              shouldBlockScroll={false}
                                              classNames={{
                                                content: "bg-white/10 backdrop-blur-md border border-white/20 min-w-48 max-h-72 overflow-y-auto p-1 dropdown-content-fix"
                                              }}
                                            >
                                            <DropdownTrigger>
                                              <div
                                                className={`menu-item-base ${
                                                  isSubActive 
                                                    ? 'active text-white' 
                                                    : 'hover:bg-white/10 text-default-700'
                                                }`}
                                                style={isSubActive ? activeGradientStyle : {}}
                                              >
                                                <div className="flex items-center gap-2 w-full">
                                                  <span className={`menu-item-icon flex items-center ${isSubActive ? 'text-white' : inactiveIcon}`}>
                                                    {subPage.icon}
                                                  </span>
                                                  <span className={`menu-item-text ${isSubActive ? 'text-white' : 'text-default-700'}`}>
                                                    {subPage.name}
                                                  </span>
                                                  <ChevronDownIcon className={`menu-item-chevron rotate-[-90deg] ${isSubActive ? 'text-white' : 'text-default-500'}`} />
                                                </div>
                                              </div>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                              aria-label={`${subPage.name} nested submenu`}
                                              variant="faded"
                                              closeOnSelect={true}
                                              className="p-1 dropdown-menu-container"
                                            >
                                              {subPage.subMenu.map((nestedPage) => {
                                                const isNestedActive = activePage === "/" + nestedPage.route;
                                                return (
                                                  <DropdownItem key={nestedPage.name} className="p-0 hover:bg-transparent" textValue={nestedPage.name}>
                                                    <div
                                                      className={`menu-item-base ${
                                                        isNestedActive 
                                                          ? 'active text-white' 
                                                          : 'hover:bg-white/10 text-default-700'
                                                      }`}
                                                      style={isNestedActive ? activeGradientStyle : {}}
                                                      onClick={() => handleNavigation(route(nestedPage.route), nestedPage.method)}
                                                    >
                                                      <div className="flex items-center gap-2 w-full">
                                                        <span className={`menu-item-icon flex items-center ${isNestedActive ? 'text-white' : inactiveIcon}`}>
                                                          {nestedPage.icon}
                                                        </span>
                                                        <span className={`menu-item-text ${isNestedActive ? 'text-white' : 'text-default-700'}`}>
                                                          {nestedPage.name}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </DropdownItem>
                                                );
                                              })}
                                            </DropdownMenu>
                                          </GlassDropdown>
                                          </div>
                                        </DropdownItem>
                                      );
                                    } else {
                                      // Regular submenu item without nested children
                                      return (
                                        <DropdownItem key={subPage.name} className="p-0 hover:bg-transparent" textValue={subPage.name}>
                                          <div
                                            className={`menu-item-base ${
                                              isSubActive 
                                                ? 'active text-white' 
                                                : 'hover:bg-white/10 text-default-700'
                                            }`}
                                            style={isSubActive ? activeGradientStyle : {}}
                                            onClick={() => handleNavigation(route(subPage.route), subPage.method)}
                                          >
                                            <div className="flex items-center gap-2 w-full">
                                              <span className={`menu-item-icon flex items-center ${isSubActive ? 'text-white' : inactiveIcon}`}>
                                                {subPage.icon}
                                              </span>
                                              <span className={`menu-item-text ${isSubActive ? 'text-white' : 'text-default-700'}`}>
                                                {subPage.name}
                                              </span>
                                            </div>
                                          </div>
                                        </DropdownItem>
                                      );
                                    }
                                  })}
                                </DropdownMenu>
                              </GlassDropdown>
                            ) : (
                              <Button
                                as={Link}
                                href={route(page.route)}
                                method={page.method}
                                preserveState
                                preserveScroll
                                variant="light"
                                startContent={
                                  <span className={`flex items-center ${isActive ? 'text-white' : inactiveIcon}`}>{page.icon}</span>
                                }
                                className={`transition-all duration-300 hover:scale-105 ${
                                  isActive
                                    ? 'text-white'
                                    : `bg-transparent hover:bg-white/10 ${inactiveText}`
                                } rounded-xl px-4`}
                                size={isTablet ? "sm" : "md"}
                                style={isActive ? activeGradientStyle : {}}
                              >
                                <span className={isActive ? 'text-white font-semibold' : 'font-semibold text-default-700'}>{page.name}</span>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Box>
                </Collapse>

                {/* Right-aligned Button Group and Profile Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto' }}>
                  {/* Search button */}
                  <Button
                    isIconOnly
                    variant="light"
                    className="text-foreground hover:bg-white/10 transition-all duration-300"
                    size="sm"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </Button>
                  {/* Help */}
                  <Tooltip content="Help & Support" placement="bottom">
                    <Button
                      isIconOnly
                      variant="light"
                      className="text-foreground hover:bg-white/10 transition-all duration-300"
                      size="sm"
                    >
                      <QuestionMarkCircleIcon className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  {/* Notifications */}
                  <GlassDropdown placement="bottom-end"
                    classNames={{
                      content: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden"
                    }}
                  >
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        variant="light"
                        className="text-foreground hover:bg-white/10 transition-all duration-300 relative"
                        size="sm"
                        aria-label="Notifications (12 unread)"
                      >
                        <BellIcon className="w-5 h-5" />
                        <Badge
                          content="12"
                          color="danger"
                          size="sm"
                          className="absolute -top-1 -right-1 animate-pulse"
                        />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu className="w-80 p-0" aria-label="Notifications">
                      <DropdownItem key="header" className="cursor-default hover:bg-transparent" textValue="Notifications Header">
                        <div className="p-4 border-b border-divider">
                          <div className="flex items-center justify-between">
                            <Typography variant="h6" className="font-semibold">Notifications</Typography>
                            <Button size="sm" variant="light" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              Mark all read
                            </Button>
                          </div>
                          <Typography variant="caption" className="text-default-500">You have 12 unread notifications</Typography>
                        </div>
                      </DropdownItem>
                      <DropdownItem key="notification-1" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50" textValue="New message notification">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">New message from John Doe</p>
                            <p className="text-xs text-default-500 truncate">Hey, can we schedule a meeting for tomorrow?</p>
                            <p className="text-xs text-default-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </DropdownItem>
                      <DropdownItem key="view-all" className="p-4 text-center hover:bg-blue-50 dark:hover:bg-blue-900/20" textValue="View all notifications">
                        <Button variant="light" className="text-blue-600 font-medium">
                          View all notifications
                        </Button>
                      </DropdownItem>
                    </DropdownMenu>
                  </GlassDropdown>
                  {/* Language Switcher - Placeholder Icon */}
                  <Button
                    isIconOnly
                    variant="light"
                    className="text-foreground hover:bg-white/10 transition-all duration-300"
                    size="sm"
                    aria-label="Change language"
                  >
                    <CommandLineIcon className="w-5 h-5" />
                  </Button>
                  {/* Profile Menu */}
                  <GlassDropdown
                    placement="bottom-end"
                    closeDelay={100}
                    classNames={{
                      content: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden"
                    }}
                    shouldCloseOnInteractOutside={(element) => {
                      // Allow interaction with switches and buttons inside the dropdown
                      return !element.closest('[role="switch"]') && !element.closest('[data-testid="dropdown-item"]');
                    }}
                  >
                    <DropdownTrigger>
                      <ProfileButton />
                    </DropdownTrigger>
                    {/* Shared Profile Menu for both Mobile and Desktop */}
                    <ProfileMenu />
                  </GlassDropdown>
                </Box>
              </Box>
            </Container>
          </GlassCard>
        </Grow>
      </Box>
    </Slide>
  );

  // Enhanced Profile Button with improved accessibility and styling
  const ProfileButton = React.forwardRef(({ size = "sm", ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    };

    const buttonSize = size === "sm" ? "small" : "medium";
    const avatarSize = size === "sm" ? "sm" : "md";
    
    return (
      <div
        ref={ref}
        {...props}
        className={`
          group relative flex items-center gap-3 cursor-pointer 
          hover:bg-white/10 active:bg-white/15 
          rounded-xl transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent
          ${size === "sm" ? "p-1.5" : "p-2"}
          ${props.className || ""}
        `}
        tabIndex={0}
        role="button"
        aria-label={`User menu for ${auth.user.first_name} ${auth.user.last_name || ''}`}
        aria-expanded="false"
        aria-haspopup="true"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsPressed(true);
            // Trigger dropdown via HeroUI's internal mechanism
            if (props.onPress) props.onPress(e);
          }
        }}
        onKeyUp={() => setIsPressed(false)}
      >
        {/* Avatar with enhanced styling */}
        <div className="relative">
          <Avatar
            size={avatarSize}
            src={auth.user.profile_image}
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {auth.user.first_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            }
            className={`
              ring-2 ring-white/20 transition-all duration-300 ease-out
              ${isHovered ? 'ring-white/40 scale-105' : ''}
              ${isPressed ? 'scale-95' : ''}
              group-hover:shadow-lg group-hover:shadow-blue-500/20
            `}
            classNames={{
              base: "shrink-0",
              img: "object-cover",
              fallback: "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold"
            }}
          />
          
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm">
            <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* User info for desktop */}
        <div className={`hidden ${size === "sm" ? "lg:flex" : "md:flex"} flex-col text-left min-w-0 flex-1`}>
          <span className="text-xs text-default-500 leading-tight font-medium">
            {getTimeBasedGreeting()},
          </span>
          <span className="font-semibold text-foreground text-sm leading-tight truncate">
            {auth.user.name || ''}
          </span>
          <span className="text-xs text-default-400 leading-tight truncate">
            {auth.user.designation?.title || 'Team Member'}
          </span>
        </div>

        {/* Chevron with animation */}
        <ChevronDownIcon 
          className={`
            w-4 h-4 text-default-400 transition-all duration-300 ease-out shrink-0
            ${isHovered ? 'text-default-300 rotate-180' : ''}
            ${isPressed ? 'scale-90' : ''}
            group-hover:text-blue-400
          `} 
        />

        {/* Ripple effect */}
        {isPressed && (
          <div className="absolute inset-0 bg-white/10 rounded-xl animate-ping" />
        )}
      </div>
    );
  });

  // Enhanced Profile Menu with better organization and styling
  const ProfileMenu = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const handleLogout = async () => {
      setIsLoggingOut(true);
      try {
        await router.post('/logout');
      } catch (error) {
        console.error('Logout failed:', error);
        setIsLoggingOut(false);
      }
    };

    const getInitials = (firstName, lastName) => {
      const first = firstName?.charAt(0)?.toUpperCase() || '';
      const last = lastName?.charAt(0)?.toUpperCase() || '';
      return first + last || 'U';
    };

    console.log(auth)

    return (
      <DropdownMenu 
        className="w-80 p-1 min-w-72" 
        aria-label="User profile and account menu" 
        variant="faded"
        closeOnSelect={false}
        classNames={{
          content: "overflow-hidden rounded-xl shadow-lg border border-divider"
        }}
      >
        {/* Chill User Info Header */}
        <DropdownItem
          key="user-info"
          className="p-3 hover:bg-transparent cursor-default"
          textValue={`${auth.user.name}'s quick profile`}
        >
          <div className="flex items-start gap-3 w-full">
            
            {/* Avatar with fallback */}
            <div className="relative">
              <Avatar
                size="md"
                src={auth.user.profile_image}
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-sm">
                    {auth.user.name}
                  </div>
                }
                className="ring-2 ring-pink-400/40 shadow-md"
              />

              {/* Online pulse dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>

            {/* User text info */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate text-foreground">
                  {auth.user.name}
                </span>
              </div>

              <span className="text-xs text-default-500 truncate">
                {auth.user.email}
              </span>

              <span className="text-xs text-default-500">
                📱 {auth.user.phone}
              </span>

              <span className="text-xs text-default-500">
                💼 {auth.designation}
              </span>

              <div className="flex flex-wrap gap-1 mt-1">
                {auth.roles?.slice(0, 2).map((role, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  >
                    {role}
                  </span>
                ))}
                {auth.roles?.length > 2 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gray-200 text-gray-700">
                    +{auth.roles.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </DropdownItem>

        
        {/* Divider */}
        <DropdownItem key="divider-1" className="p-0 py-1 cursor-default" textValue="Menu section divider">
          <div className="border-t border-divider mx-2" />
        </DropdownItem>

        {/* Account Actions Section */}
        <DropdownItem key="section-account" className="cursor-default p-0 pb-1" textValue="Account section header">
          <div className="px-3 py-1">
            <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
              Account
            </span>
          </div>
        </DropdownItem>

        <DropdownItem
          key="profile"
          startContent={
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          }
          onPress={() => handleNavigation(route('profile', { user: auth.user.id }))}
          className="data-[hover=true]:bg-blue-50 data-[focus=true]:bg-blue-50 dark:data-[hover=true]:bg-blue-900/20 dark:data-[focus=true]:bg-blue-900/20 rounded-none px-3 py-2 transition-colors duration-200"
          textValue="View Profile"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">View Profile</span>
            <span className="text-xs text-default-400">Manage your personal information</span>
          </div>
        </DropdownItem>

        <DropdownItem
          key="settings"
          startContent={
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Cog6ToothIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
          }
          onPress={() => handleNavigation(route('dashboard'))}
          className="data-[hover=true]:bg-gray-50 data-[focus=true]:bg-gray-50 dark:data-[hover=true]:bg-gray-800/50 dark:data-[focus=true]:bg-gray-800/50 rounded-none px-3 py-2 transition-colors duration-200"
          textValue="Account Settings"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Account Settings</span>
            <span className="text-xs text-default-400">Privacy, security, and preferences</span>
          </div>
        </DropdownItem>

        {/* Appearance Section */}
        <DropdownItem key="divider-2" className="p-0 py-1 cursor-default" textValue="Appearance section divider">
          <div className="border-t border-divider mx-2" />
        </DropdownItem>

        <DropdownItem key="section-appearance" className="cursor-default p-0 pb-1" textValue="Appearance section header">
          <div className="px-3 py-1">
            <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
              Appearance
            </span>
          </div>
        </DropdownItem>

        <DropdownItem
          key="themes"
          startContent={
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <SwatchIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          }
          onPress={toggleThemeDrawer}
          className="data-[hover=true]:bg-purple-50 data-[focus=true]:bg-purple-50 dark:data-[hover=true]:bg-purple-900/20 dark:data-[focus=true]:bg-purple-900/20 rounded-none px-3 py-2 transition-colors duration-200"
          textValue="Customize Appearance"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Customize Appearance</span>
            <span className="text-xs text-default-400">Themes, colors, and layout</span>
          </div>
        </DropdownItem>

        <DropdownItem 
          key="theme-toggle" 
          className="p-0 cursor-default" 
          textValue="Dark mode toggle"
        >
          <div className="flex items-center justify-between w-full px-3 py-2 data-[hover=true]:bg-gray-50 data-[focus=true]:bg-gray-50 dark:data-[hover=true]:bg-gray-800/50 dark:data-[focus=true]:bg-gray-800/50 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                {darkMode ? 
                  <MoonIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> : 
                  <SunIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                }
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Dark Mode</span>
                <span className="text-xs text-default-400">
                  {darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                </span>
              </div>
            </div>
            <Switch
              size="sm"
              isSelected={darkMode}
              onValueChange={toggleDarkMode}
              classNames={{
                wrapper: "group-data-[selected=true]:bg-blue-500",
                thumb: "bg-white shadow-md"
              }}
              aria-label="Toggle dark mode"
            />
          </div>
        </DropdownItem>

        {/* Help & Support Section */}
        <DropdownItem key="divider-3" className="p-0 py-1 cursor-default" textValue="Help section divider">
          <div className="border-t border-divider mx-2" />
        </DropdownItem>

        <DropdownItem key="section-help" className="cursor-default p-0 pb-1" textValue="Help section header">
          <div className="px-3 py-1">
            <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
              Help & Support
            </span>
          </div>
        </DropdownItem>

        <DropdownItem
          key="help"
          startContent={
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          }
          className="data-[hover=true]:bg-green-50 data-[focus=true]:bg-green-50 dark:data-[hover=true]:bg-green-900/20 dark:data-[focus=true]:bg-green-900/20 rounded-none px-3 py-2 transition-colors duration-200"
          textValue="Help Center"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Help Center</span>
            <span className="text-xs text-default-400">FAQ, guides, and tutorials</span>
          </div>
        </DropdownItem>

        <DropdownItem
          key="feedback"
          startContent={
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          }
          className="data-[hover=true]:bg-orange-50 data-[focus=true]:bg-orange-50 dark:data-[hover=true]:bg-orange-900/20 dark:data-[focus=true]:bg-orange-900/20 rounded-none px-3 py-2 transition-colors duration-200"
          textValue="Send Feedback"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Send Feedback</span>
            <span className="text-xs text-default-400">Help us improve your experience</span>
          </div>
        </DropdownItem>

        {/* Logout Section */}
        <DropdownItem key="divider-4" className="p-0 py-1 cursor-default" textValue="Logout section divider">
          <div className="border-t border-divider mx-2" />
        </DropdownItem>

        <DropdownItem
          key="logout"
          color="danger"
          startContent={
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          }
          onPress={handleLogout}
          className="data-[hover=true]:bg-red-50 data-[focus=true]:bg-red-50 dark:data-[hover=true]:bg-red-900/20 dark:data-[focus=true]:bg-red-900/20 rounded-none px-3 py-2 transition-colors duration-200"
          textValue="Sign Out"
          isDisabled={isLoggingOut}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </span>
              <span className="text-xs text-red-400 dark:text-red-500">
                End your current session
              </span>
            </div>
            {isLoggingOut && (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </DropdownItem>
      </DropdownMenu>
    );
  };

  return (
    <>
      {isMobile && <MobileHeader toggleSideBar={memoizedToggleSideBar} />}
      {(isTablet || isDesktop) && <DesktopHeader toggleSideBar={memoizedToggleSideBar} />}
    </>
  );
});

Header.displayName = 'Header';

export default Header;
