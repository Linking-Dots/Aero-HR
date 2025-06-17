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
  Switch
} from "@heroui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SwatchIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";

import logo from '../../../public/assets/images/logo.png';
import GlassCard from '@/Components/GlassCard.jsx';
import useTheme from '@/theme.jsx';

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
          classNames={{
            base: "bg-white/10 backdrop-blur-md border-b border-white/20",
            wrapper: "px-4",
            content: "gap-4"
          }}
        >
          {/* Sidebar Toggle */}
          <NavbarContent justify="start">
            <Button
              isIconOnly
              variant="light"
              onPress={toggleSideBar}
              className="text-foreground"
              aria-label={sideBarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Bars3Icon className="w-5 h-5" />
            </Button>
          </NavbarContent>

          {/* Logo */}
          <NavbarContent justify="center">
            <NavbarBrand>
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-8 w-8"
                />
                <Typography
                  variant="h6"
                  className="font-bold text-foreground hidden sm:block"
                  style={{ fontFamily: 'monospace', letterSpacing: '.1rem' }}
                >
                  DBEDC
                </Typography>
              </div>
            </NavbarBrand>
          </NavbarContent>

          {/* Profile Menu */}
          <NavbarContent justify="end">
            <Dropdown
              placement="bottom-end"
              classNames={{
                content: "bg-white/10 backdrop-blur-md border border-white/20"
              }}
            >
              <DropdownTrigger>
                <Avatar
                  as="button"
                  size="sm"
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
                                  variant={
                                    page.subMenu.find(subPage => "/" + subPage.route === activePage)
                                      ? "flat"
                                      : "light"
                                  }
                                  color={
                                    page.subMenu.find(subPage => "/" + subPage.route === activePage)
                                      ? "primary"
                                      : "default"
                                  }
                                  startContent={page.icon}
                                  endContent={<ChevronDownIcon className="w-4 h-4" />}
                                  className="bg-transparent hover:bg-white/10"
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
                                        ? "bg-primary/20"
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
                              variant={activePage === "/" + page.route ? "flat" : "light"}
                              color={activePage === "/" + page.route ? "primary" : "default"}
                              startContent={page.icon}
                              className="bg-transparent hover:bg-white/10"
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
