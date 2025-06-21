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
import useTheme from '@/theme.jsx';
import { GRADIENT_PRESETS } from '@/utils/gradientUtils.js';

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
}) => {  const theme = useTheme(darkMode);
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
    <Box sx={{ mb: 2 }}>
      <Grow in>
        <Navbar
          shouldHideOnScroll
          maxWidth="full"
          height="70px"
          classNames={{
            base: "bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl",
            wrapper: "px-6 max-w-full",
            content: "gap-4"
          }}
        >
          {/* Left section */}
          <NavbarContent justify="start" className="flex-grow">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                onPress={toggleSideBar}
                className="text-foreground hover:bg-white/10 transition-all duration-300 hover:scale-110"
                aria-label={sideBarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Bars3Icon className="w-6 h-6" />
              </Button>
              
              <NavbarBrand>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xl ${GRADIENT_PRESETS.iconContainer}`}>
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
                  <div className="hidden sm:block">
                    <Typography
                      variant="h6"
                      className={`font-black ${GRADIENT_PRESETS.gradientText}`}
                      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.025em' }}
                    >
                      AeroHR
                    </Typography>
                    <Typography variant="caption" className="text-default-400 block leading-tight font-medium">
                      Enterprise Platform
                    </Typography>
                  </div>
                </div>
              </NavbarBrand>
            </div>
          </NavbarContent>

          {/* Center section - Search */}
          <NavbarContent justify="center" className="hidden md:flex flex-1 max-w-md">
            <Input
              placeholder="Search anything..."
              startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
              endContent={
                <Kbd className="hidden lg:inline-block" keys={["command"]}>K</Kbd>
              }
              classNames={{
                base: "w-full",
                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300",
                input: "text-sm"
              }}
              size="sm"
            />
          </NavbarContent>

          {/* Right section */}
          <NavbarContent justify="end" className="flex-grow-0 gap-2">
            {/* Search button for mobile */}
            <Button
              isIconOnly
              variant="light"
              className="md:hidden text-foreground hover:bg-white/10 transition-all duration-300"
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
            <Dropdown placement="bottom-end">
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
                <DropdownItem key="header" className="cursor-default">
                  <div className="p-4 border-b border-divider">
                    <Typography variant="h6" className="font-semibold">Notifications</Typography>
                    <Typography variant="caption" className="text-default-500">You have 12 unread notifications</Typography>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* User Menu */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 rounded-xl p-2 transition-all duration-300">
                  <Avatar
                    size="sm"
                    src={auth.user.profile_image}
                    fallback={auth.user.first_name?.charAt(0)}
                    className="ring-2 ring-white/20 transition-transform hover:scale-105"
                  />
                  <div className="hidden lg:block text-left">
                    <Typography variant="caption" className="font-semibold text-foreground block leading-tight">
                      {auth.user.first_name}
                    </Typography>
                    <Typography variant="caption" className="text-default-500 block leading-tight">
                      {auth.user.roles?.[0]?.name || 'User'}
                    </Typography>
                  </div>
                  <ChevronDownIcon className="w-3 h-3 text-default-400" />
                </div>
              </DropdownTrigger>
              <DropdownMenu className="w-72 p-2">
                <DropdownItem key="user-info" className="h-20 gap-3 cursor-default">
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
                <DropdownItem key="divider" className="p-0 my-2">
                  <div className="border-t border-divider" />
                </DropdownItem>
                <DropdownItem
                  key="profile"
                  startContent={<UserCircleIcon className="w-4 h-4" />}
                  onPress={() => handleNavigation(route('profile', { user: auth.user.id }))}
                  className="hover:bg-white/10 rounded-lg"
                >
                  View Profile
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<Cog6ToothIcon className="w-4 h-4" />}
                  onPress={() => handleNavigation(route('dashboard'))}
                  className="hover:bg-white/10 rounded-lg"
                >
                  Account Settings
                </DropdownItem>
                <DropdownItem
                  key="themes"
                  startContent={<SwatchIcon className="w-4 h-4" />}
                  onPress={toggleThemeDrawer}
                  className="hover:bg-white/10 rounded-lg"
                >
                  Appearance
                </DropdownItem>
                <DropdownItem key="theme-toggle" className="p-0 my-1">
                  <div className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      {darkMode ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
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
                  startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                  onPress={() => router.post('/logout')}
                  className="hover:bg-red-500/20 rounded-lg"
                >
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        </Navbar>
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
                      {pages.map((page, index) => (
                        <div key={`${page.name}-${index}`} className="flex justify-center">
                          {page.subMenu ? (
                            <Dropdown
                              placement="bottom"
                              classNames={{
                                content: "bg-white/10 backdrop-blur-md border border-white/20"
                              }}
                            >
                              <DropdownTrigger>
                                <Button
                                  variant="light"
                                  startContent={page.icon}
                                  endContent={<ChevronDownIcon className="w-4 h-4" />}
                                  className={`transition-all duration-300 hover:scale-105 ${
                                    page.subMenu.find(subPage => "/" + subPage.route === activePage)
                                      ? `${GRADIENT_PRESETS.accentCard} text-blue-600`
                                      : "bg-transparent hover:bg-white/10"
                                  }`}
                                  size={isTablet ? "sm" : "md"}
                                >
                                  {page.name}
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label={`${page.name} submenu`}
                                variant="faded"
                              >
                                {page.subMenu.map((subPage) => (
                                  <DropdownItem
                                    key={subPage.name}
                                    startContent={subPage.icon}
                                    className={
                                      activePage === "/" + subPage.route
                                        ? GRADIENT_PRESETS.accentCard
                                        : ""
                                    }
                                    onPress={() => handleNavigation(route(subPage.route), subPage.method)}
                                  >
                                    {subPage.name}
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                          ) : (
                            <Button
                              as={Link}
                              href={route(page.route)}
                              method={page.method}
                              preserveState
                              preserveScroll
                              variant="light"
                              startContent={page.icon}
                              className={`transition-all duration-300 hover:scale-105 ${
                                activePage === "/" + page.route 
                                  ? `${GRADIENT_PRESETS.accentCard} text-blue-600` 
                                  : "bg-transparent hover:bg-white/10"
                              }`}
                              size={isTablet ? "sm" : "md"}
                            >
                              {page.name}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </Box>
                </Collapse>

                {/* Profile Menu */}
                <Box sx={{ flexShrink: 0 }}>
                  <Dropdown
                    placement="bottom-end"
                    classNames={{
                      content: "bg-white/10 backdrop-blur-md border border-white/20"
                    }}
                  >
                    <DropdownTrigger>
                      <Avatar
                        as="button"
                        size={isTablet ? "sm" : "md"}
                        src={auth.user.profile_image}
                        name={auth.user.first_name}
                        className="transition-transform hover:scale-105"
                      />
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Profile Actions"
                      variant="faded"
                      className="min-w-48"
                    >
                      <DropdownItem
                        key="user-info"
                        className="h-14 gap-2"
                        textValue={`${auth.user.first_name} ${auth.user.last_name || ''}`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{auth.user.first_name} {auth.user.last_name || ''}</span>
                          <div className="flex flex-wrap gap-1">
                            {auth.user.roles && auth.user.roles.length > 0 ? (
                              auth.user.roles.map((role, index) => (
                                <span key={index} className={`text-xs px-2 py-1 rounded-full text-blue-600 ${GRADIENT_PRESETS.accentCard}`}>
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-default-400">No roles assigned</span>
                            )}
                          </div>
                        </div>
                      </DropdownItem>
                      <DropdownItem
                        key="profile"
                        startContent={<UserCircleIcon className="w-4 h-4" />}
                        onPress={() => handleNavigation(route('profile', { user: auth.user.id }))}
                      >
                        Profile
                      </DropdownItem>
                      <DropdownItem
                        key="settings"
                        startContent={<Cog6ToothIcon className="w-4 h-4" />}
                        onPress={() => handleNavigation(route('dashboard'))}
                      >
                        Settings
                      </DropdownItem>
                      <DropdownItem
                        key="themes"
                        startContent={<SwatchIcon className="w-4 h-4" />}
                        onPress={toggleThemeDrawer}
                      >
                        Themes
                      </DropdownItem>
                      <DropdownItem key="theme-toggle" className="p-0">
                        <div className="flex items-center justify-between w-full px-2 py-1">
                          <div className="flex items-center gap-2">
                            {darkMode ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                            <span>Dark Mode</span>
                          </div>
                          <Switch
                            size="sm"
                            isSelected={darkMode}
                            onValueChange={toggleDarkMode}
                            classNames={{
                              wrapper: "bg-white/20"
                            }}
                          />
                        </div>
                      </DropdownItem>
                      <DropdownItem
                        key="logout"
                        color="danger"
                        startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                        onPress={() => router.post('/logout')}
                      >
                        Logout
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </Box>
              </Box>
            </Container>
          </GlassCard>
        </Grow>
      </Box>
    </Slide>
  );

  return (
    <>
      {isMobile && <MobileHeader />}
      {(isTablet || isDesktop) && <DesktopHeader />}
    </>
  );
});

Header.displayName = 'Header';

export default Header;
