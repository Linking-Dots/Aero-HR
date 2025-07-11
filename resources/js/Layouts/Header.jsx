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
  CommandLineIcon
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
  const { auth } = usePage().props;
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
  <Box sx={{ p: 2 }}>
    <Grow in>
      <GlassCard>
        <Navbar
          shouldHideOnScroll
          maxWidth="full"
          height="60px"
          classNames={{
            base: "bg-transparent border-none shadow-none",
            wrapper: "px-3 sm:px-6 max-w-full",
            content: "gap-2"
          }}
        >
          {/* Left: Logo + Sidebar */}
          <NavbarContent justify="start" className="flex items-center gap-2">
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

            {/* Logo & Name */}
            <NavbarBrand className="flex items-center gap-2 min-w-0">
              <div className="relative">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xl ${GRADIENT_PRESETS.iconContainer}`}>
                  <Typography variant="h6" className="text-white text-sm font-black">A</Typography>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>

              {/* Hide brand text on mobile */}
              <div className="hidden sm:flex flex-col leading-tight">
                <Typography variant="h6" className={`${GRADIENT_PRESETS.gradientText} font-black text-sm`}>
                  Aero Enterprise
                </Typography>
                <Typography variant="caption" className="text-default-400 text-xs font-medium truncate">
                  HRM, ERP, CRM & more
                </Typography>
              </div>
            </NavbarBrand>
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
            <GlassDropdown placement="bottom-end" closeDelay={100}>
              <DropdownTrigger>
                {/* ✅ Single React element inside */}
                <Button
                  isIconOnly
                  variant="light"
                  className="relative text-foreground hover:bg-white/10"
                  size="sm"
                >
                  <BellIcon className="w-5 h-5" />
                  <Badge
                    content="12"
                    color="danger"
                    size="sm"
                    className="absolute -top-1 -right-1"
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="w-80 p-0">
                <DropdownItem key="header" className="cursor-default" textValue="Notifications Header">
                  <div className="p-4 border-b border-divider">
                    <Typography variant="h6" className="font-semibold">Notifications</Typography>
                    <Typography variant="caption" className="text-default-500">You have 12 unread notifications</Typography>
                  </div>
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
                content: "bg-white/10 backdrop-blur-md border border-white/20"
              }}
              placement="bottom-end"
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
      <Box sx={{ p: 2 }}>
        <Grow in>
          <GlassCard>
            <Container maxWidth="xl">
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                py: 2,
                gap: 2
              }}>
                {/* Logo and Menu Toggle */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexShrink: 0
                }}>
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-10 w-10"
                  />
                  <Typography
                    variant="h6"
                    className="font-bold text-foreground"
                    style={{ 
                      fontFamily: 'monospace', 
                      letterSpacing: '.2rem',
                      display: isTablet ? 'none' : 'block'
                    }}
                  >
                    DBEDC
                  </Typography>
                  {!sideBarOpen && (
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={toggleSideBar}
                      className="text-foreground"
                    >
                      <Bars3Icon className="w-5 h-5" />
                    </Button>
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
                  <GlassDropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        variant="light"
                        className="text-foreground hover:bg-white/10 transition-all duration-300 relative"
                        size="sm"
                      >
                        <BellIcon className="w-5 h-5" />
                        <Badge
                          content="12"
                          color="danger"
                          size="sm"
                          className="absolute -top-1 -right-1"
                        />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu className="w-80 p-0">
                      <DropdownItem key="header" className="cursor-default" textValue="Notifications Header">
                        <div className="p-4 border-b border-divider">
                          <Typography variant="h6" className="font-semibold">Notifications</Typography>
                          <Typography variant="caption" className="text-default-500">You have 12 unread notifications</Typography>
                        </div>
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
                      content: "bg-white/10 backdrop-blur-md border border-white/20"
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

  // Shared Profile Button for both Mobile and Desktop with greeting and translation
  const ProfileButton = React.forwardRef((props, ref) => (
    <div
      ref={ref}
      {...props}
      className={
        "flex items-center gap-3 cursor-pointer hover:bg-white/10 rounded-xl p-2 transition-all duration-300 " +
        (props.className || "")
      }
      tabIndex={0}
    >
      <Avatar
        size="sm"
        src={auth.user.profile_image}
        fallback={auth.user.first_name?.charAt(0)}
        className="ring-2 ring-white/20 transition-transform hover:scale-105"
      />
      <div className="hidden md:flex flex-col text-left">
        <span className="text-xs text-default-500 leading-tight">Hi,</span>
        <span className="font-semibold text-foreground text-sm leading-tight">{auth.user.first_name}</span>
        <span className="text-xs text-default-400 leading-tight">{auth.user.roles?.[0]?.name || 'User'}</span>
      </div>
      <ChevronDownIcon className="w-3 h-3 text-default-400" />
    </div>
  ));

  // Shared Profile Menu for both Mobile and Desktop
  const ProfileMenu = () => (
    <DropdownMenu className="w-72 p-2 min-w-48" aria-label="Profile Actions" variant="faded">
      <DropdownItem key="user-info" className="h-20 gap-3 cursor-default" textValue={`${auth.user.first_name} ${auth.user.last_name || ''} - ${auth.user.email}`}>
        <div className="flex items-center gap-4 w-full">
          <Avatar
            size="md"
            src={auth.user.profile_image}
            fallback={auth.user.first_name?.charAt(0)}
            className={`ring-2 ring-blue-500/30`}
          />
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-semibold text-foreground text-sm">
              {auth.user.first_name} {auth.user.last_name || ''}
            </span>
            <span className="text-xs text-default-500">{auth.user.email}</span>
            <div className="flex gap-1 mt-1">
              {auth.user.roles?.slice(0, 2).map((role, index) => (
                <span key={index} className={`text-xs px-2 py-0.5 rounded-full font-medium text-blue-600 ${GRADIENT_PRESETS.accentCard}`}>
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DropdownItem>
      <DropdownItem key="divider" className="p-0 my-2" textValue="Divider">
        <div className="border-t border-divider" />
      </DropdownItem>
      <DropdownItem
        key="profile"
        startContent={<UserCircleIcon className="w-5 h-5" />}
        onPress={() => handleNavigation(route('profile', { user: auth.user.id }))}
        className="hover:bg-white/10 rounded-lg"
        textValue="View Profile"
      >
        View Profile
      </DropdownItem>
      <DropdownItem
        key="settings"
        startContent={<Cog6ToothIcon className="w-5 h-5" />}
        onPress={() => handleNavigation(route('dashboard'))}
        className="hover:bg-white/10 rounded-lg"
        textValue="Account Settings"
      >
        Account Settings
      </DropdownItem>
      <DropdownItem
        key="themes"
        startContent={<SwatchIcon className="w-5 h-5" />}
        onPress={toggleThemeDrawer}
        className="hover:bg-white/10 rounded-lg"
        textValue="Appearance"
      >
        Appearance
      </DropdownItem>
      <DropdownItem key="theme-toggle" className="p-0 my-1" textValue="Dark Mode Toggle">
        <div className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-all duration-200">
          <div className="flex items-center gap-3">
            {darkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            <span className="text-sm">Dark Mode</span>
          </div>
          <Switch
            size="sm"
            isSelected={darkMode}
            onValueChange={toggleDarkMode}
            classNames={{
              wrapper: "bg-white/20",
              thumb: "bg-white"
            }}
          />
        </div>
      </DropdownItem>
      <DropdownItem key="divider2" className="p-0 my-2">
        <div className="border-t border-divider" />
      </DropdownItem>
      <DropdownItem
        key="logout"
        color="danger"
        startContent={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
        onPress={() => router.post('/logout')}
        className="hover:bg-red-500/20 rounded-lg"
      >
        Sign Out
      </DropdownItem>
    </DropdownMenu>
  );

  return (
    <>
      {isMobile && <MobileHeader toggleSideBar={memoizedToggleSideBar} />}
      {(isTablet || isDesktop) && <DesktopHeader toggleSideBar={memoizedToggleSideBar} />}
    </>
  );
});

Header.displayName = 'Header';

export default Header;
