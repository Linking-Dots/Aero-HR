` tags, ensuring no forbidden words are included and all instructions are followed.

```
<replit_final_file>
import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Container, Grid, Collapse, useScrollTrigger, Slide, Grow } from '@mui/material';
import { AccountCircle, ExitToApp, Settings, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Switch, Tooltip, Avatar } from '@mui/material';
import { 
    Dropdown, 
    DropdownTrigger, 
    DropdownMenu, 
    Button, 
    DropdownItem, 
    Navbar, 
    NavbarBrand, 
    NavbarMenuToggle, 
    NavbarMenuItem, 
    NavbarMenu, 
    NavbarContent, 
    Accordion, 
    AccordionItem 
} from "@nextui-org/react";
import logo from '../../../public/assets/images/logo.png';
import { Link, usePage } from '@inertiajs/react';
import GlassCard from "@/Components/GlassCard.jsx";
import GlassDropdown from "@/Components/GlassDropdown.jsx";
import useTheme from "@/theme.jsx";

const useDeviceType = () => {
    const [isMobile, setIsMobile] = useState(false);

    const updateDeviceType = () => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobileUserAgent = /android|iphone|ipad|ipod/i.test(userAgent);
        setIsMobile(window.innerWidth <= 768 || isMobileUserAgent);
    };

    useEffect(() => {
        updateDeviceType();
        window.addEventListener('resize', updateDeviceType);
        return () => window.removeEventListener('resize', updateDeviceType);
    }, []);

    return { isMobile };
};

const Header = React.memo(({ darkMode, toggleDarkMode, sideBarOpen, toggleSideBar, url, pages }) => {
    const theme = useTheme(darkMode);
    const { auth } = usePage().props;
    const [activePage, setActivePage] = useState(url);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isMobile } = useDeviceType();
    const trigger = useScrollTrigger();

    useEffect(() => {
        setActivePage(url);
    }, [url]);

    const settings = [
        { name: 'Settings', route: 'dashboard', icon: <Settings /> },
        { name: 'Logout', route: 'logout', method: 'post', icon: <ExitToApp /> }
    ];

    const ProfileDropdown = () => (
        <GlassDropdown type='menu'>
            <DropdownTrigger>
                <Tooltip title="Open settings">
                    <Avatar
                        alt={auth.user.first_name}
                        src={auth.user.profile_image}
                        sx={{ cursor: 'pointer' }}
                    />
                </Tooltip>
            </DropdownTrigger>
            <DropdownMenu>
                <DropdownItem
                    as={Link}
                    href={route('profile', { user: auth.user.id })}
                    method="get"
                    key={'profile'}
                    startContent={<AccountCircle />}
                    style={{ color: theme.palette.text.primary }}
                >
                    Profile
                </DropdownItem>
                {settings.map((setting) => (
                    <DropdownItem
                        as={Link}
                        href={route(setting.route)}
                        method={setting.method || undefined}
                        key={setting.name}
                        startContent={setting.icon}
                        style={{ color: theme.palette.text.primary }}
                    >
                        {setting.name}
                    </DropdownItem>
                ))}
                <DropdownItem style={{ color: theme.palette.text.primary }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                        <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
                    </Box>
                </DropdownItem>
            </DropdownMenu>
        </GlassDropdown>
    );

    if (isMobile) {
        return (
            <Box sx={{ mb: 2 }}>
                <Grow in>
                    <Navbar
                        shouldHideOnScroll
                        isBordered
                        isMenuOpen={isMenuOpen}
                        onMenuOpenChange={setIsMenuOpen}
                        className={darkMode ? "dark" : "light"}
                    >
                        <NavbarContent justify="start">
                            <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
                        </NavbarContent>

                        <NavbarContent className="pr-3" justify="center">
                            <NavbarBrand>
                                <Box
                                    component="img"
                                    alt="Logo"
                                    src={logo}
                                    sx={{ height: '40px', width: '40px' }}
                                />
                            </NavbarBrand>
                        </NavbarContent>

                        <NavbarMenu className={darkMode ? 'dark' : 'light'}>
                            {pages.map((page, index) => (
                                <React.Fragment key={`${page.name}-${index}`}>
                                    {!page.subMenu ? (
                                        <NavbarMenuItem className="px-2">
                                            <Link
                                                className={`
                                                    ${activePage === "/" + page.route ? 'shadow' : ''}
                                                    px-2 w-full py-4 hover:shadow rounded-lg h-14 flex items-center
                                                `}
                                                href={route(page.route)}
                                                method={page.method || undefined}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {page.icon}
                                                <span style={{ marginLeft: '8px' }}>{page.name}</span>
                                            </Link>
                                        </NavbarMenuItem>
                                    ) : (
                                        <Accordion
                                            itemClasses={{
                                                trigger: `
                                                    px-2 py-0 data-[hover=true]:shadow data-[open=true]:shadow rounded-lg h-14 flex items-center
                                                    ${page.subMenu?.find(subPage => "/" + subPage.route === activePage) ? 'shadow' : ''}
                                                `,
                                            }}
                                        >
                                            <AccordionItem
                                                key={`accordion-${index}`}
                                                aria-label={`${page.name} submenu`}
                                                startContent={page.icon}
                                                title={page.name}
                                                indicator={<KeyboardArrowLeftIcon />}
                                            >
                                                {page.subMenu.map((subPage, subIndex) => (
                                                    <NavbarMenuItem key={`${subPage.name}-${subIndex}`}>
                                                        <Link
                                                            className={`
                                                                ${activePage === "/" + subPage.route ? 'shadow' : ''}
                                                                px-2 w-full py-4 hover:shadow rounded-lg h-14 flex items-center
                                                            `}
                                                            href={route(subPage.route)}
                                                            method={subPage.method || undefined}
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            {subPage.icon}
                                                            <span style={{ marginLeft: '8px' }}>{subPage.name}</span>
                                                        </Link>
                                                    </NavbarMenuItem>
                                                ))}
                                            </AccordionItem>
                                        </Accordion>
                                    )}
                                </React.Fragment>
                            ))}
                        </NavbarMenu>

                        <NavbarContent justify="end">
                            <ProfileDropdown />
                        </NavbarContent>
                    </Navbar>
                </Grow>
            </Box>
        );
    }

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            <Box sx={{ p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <Container maxWidth="xl">
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                p: { md: 2 },
                                minHeight: '64px',
                            }}>
                                {/* Logo and Brand Section */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexGrow: 1,
                                }}>
                                    <Box
                                        component="img"
                                        alt="Logo"
                                        src={logo}
                                        sx={{
                                            mr: 1,
                                            height: '40px',
                                            width: '40px',
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{
                                            color: theme.palette.text.primary,
                                            mr: 2,
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            letterSpacing: '.3rem',
                                        }}
                                    >
                                        DBEDC
                                    </Typography>

                                    {!sideBarOpen && (
                                        <IconButton
                                            sx={{ 
                                                color: theme.palette.text.primary,
                                                ml: 1,
                                            }}
                                            size="large"
                                            onClick={toggleSideBar}
                                        >
                                            <MenuIcon />
                                        </IconButton>
                                    )}

                                    {/* Navigation Menu */}
                                    <Collapse in={!sideBarOpen} timeout="auto" unmountOnExit>
                                        <Box sx={{ flexGrow: 1, display: 'flex', ml: 2 }}>
                                            <Grid container spacing={1}>
                                                {pages.map((page) => (
                                                    page.subMenu ? (
                                                        <Grid
                                                            item
                                                            key={page.name}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                px: 1,
                                                                borderRadius: '25px',
                                                                backgroundColor: page.subMenu.find(subPage => "/" + subPage.route === activePage) 
                                                                    ? theme.palette.action.selected 
                                                                    : 'transparent',
                                                            }}
                                                        >
                                                            <GlassDropdown type='menu'>
                                                                <DropdownTrigger>
                                                                    <Button
                                                                        css={{ color: theme.palette.text.primary }}
                                                                        startContent={page.icon}
                                                                        disableRipple
                                                                        className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                                                                        endContent={<KeyboardArrowDownIcon />}
                                                                        radius="full"
                                                                        size="md"
                                                                    >
                                                                        {page.name}
                                                                    </Button>
                                                                </DropdownTrigger>
                                                                <DropdownMenu>
                                                                    {page.subMenu.map((subPage) => (
                                                                        <DropdownItem
                                                                            as={Link}
                                                                            href={route(subPage.route)}
                                                                            method={subPage.method || undefined}
                                                                            key={subPage.name}
                                                                            startContent={subPage.icon}
                                                                            style={{
                                                                                color: theme.palette.text.primary,
                                                                                backgroundColor: activePage === "/" + subPage.route 
                                                                                    ? theme.palette.action.selected 
                                                                                    : 'transparent',
                                                                            }}
                                                                            variant={'faded'}
                                                                        >
                                                                            {subPage.name}
                                                                        </DropdownItem>
                                                                    ))}
                                                                </DropdownMenu>
                                                            </GlassDropdown>
                                                        </Grid>
                                                    ) : (
                                                        <Grid 
                                                            item 
                                                            key={page.name}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                px: 1,
                                                                borderRadius: '25px',
                                                                backgroundColor: activePage === "/" + page.route 
                                                                    ? theme.palette.action.selected 
                                                                    : 'transparent',
                                                            }}
                                                        >
                                                            <Button
                                                                as={Link}
                                                                href={route(page.route)}
                                                                method={page.method || undefined}
                                                                css={{ color: theme.palette.text.primary }}
                                                                startContent={page.icon}
                                                                disableRipple
                                                                className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                                                                radius="full"
                                                                size="md"
                                                            >
                                                                {page.name}
                                                            </Button>
                                                        </Grid>
                                                    )
                                                ))}
                                            </Grid>
                                        </Box>
                                    </Collapse>
                                </Box>

                                {/* Profile Section */}
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ProfileDropdown />
                                </Box>
                            </Box>
                        </Container>
                    </GlassCard>
                </Grow>
            </Box>
        </Slide>
    );
});

export default Header;