import * as React from 'react';
import {useState, useCallback, useEffect} from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Grow from '@mui/material/Grow';
import { AccountCircle, ExitToApp, Settings } from '@mui/icons-material';
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {Collapse, Grid, Slide, Switch, useScrollTrigger} from "@mui/material";
import {Dropdown, DropdownTrigger, DropdownMenu, Button, DropdownItem, NavbarItem} from "@nextui-org/react";
import logo from '../../../public/assets/images/logo.png';
import { Link, usePage } from '@inertiajs/react';
import GlassCard from "@/Components/GlassCard.jsx"
import GlassDropdown from "@/Components/GlassDropdown.jsx"
import useTheme from "@/theme.jsx";

const Header = React.memo(({ darkMode, toggleDarkMode, sideBarOpen, toggleSideBar, url, pages }) => {
    const theme = useTheme(darkMode);
    const { auth } = usePage().props;
    const [activePage, setActivePage] = useState();

    useEffect(() => {
        setActivePage(url);
    }, [url]);

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [anchorElSubMenu, setAnchorElSubMenu] = useState(null);
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const settings = [
        { name: 'Settings', route: 'dashboard', icon: <Settings /> },
        { name: 'Logout', route: 'logout', method: 'post', icon: <ExitToApp /> }
    ];

    const handleOpenNavMenu = useCallback((event) => {
        setAnchorElNav(event.currentTarget);
        setMenuOpen(true);
    }, []);

    const handleOpenUserMenu = useCallback((event) => {
        setAnchorElUser(event.currentTarget);
    }, []);

    const handleOpenSubMenu = useCallback((pageName, event) => {
        setAnchorElSubMenu(event.currentTarget); // Set the submenu anchor element
        setOpenSubMenu(prev => prev === pageName ? null : pageName);
        event.stopPropagation(); // Prevent event from propagating to parent
    }, []);

    const handleCloseNavMenu = useCallback(() => {
        setAnchorElNav(null);
        setMenuOpen(false);
    }, []);

    const handleCloseUserMenu = useCallback(() => {
        setAnchorElUser(null);
    }, []);

    const handleCloseSubMenu = useCallback(() => {
        setAnchorElSubMenu(null);
        setOpenSubMenu(null);
        setAnchorElNav(null);
        setMenuOpen(false);
    }, []);
    const trigger = useScrollTrigger();


    return (
        <Slide appear={false} direction="down" in={!trigger}>
            <Box sx={{ p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <Container maxWidth="xl">
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center', // Center items vertically
                                p: {md: 2},
                            }}>
                                {/* Desktop Logo Area */}
                                <Box sx={{
                                    display: {xs: 'none', md: 'flex'},
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    flexGrow: 1,
                                }}>
                                    <Box
                                        component="img"
                                        alt="Logo"
                                        src={logo}
                                        sx={{
                                            display: { xs: 'none', md: 'flex' },
                                            mr: 1,
                                            height: '40px',
                                            width: '40px',
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        component="a"
                                        href="#"
                                        sx={{
                                            color: theme.palette.text.primary,
                                            mr: 2,
                                            display: { xs: 'none', md: 'flex' },
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            letterSpacing: '.3rem',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        DBEDC
                                    </Typography>
                                    {!sideBarOpen && <IconButton
                                        sx={{ color: theme.palette.text.primary, display: { xs: 'none', md: 'flex' } }}
                                        size="large"
                                        onClick={toggleSideBar}
                                    >
                                        <MenuIcon />
                                    </IconButton> }
                                    {/* Desktop Menu Area */}
                                    <Collapse in={!sideBarOpen} timeout="auto" unmountOnExit>
                                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap'}}>
                                            <Grid container>
                                                {pages.map((page) => (
                                                    page.subMenu ? (
                                                        <Grid sx={{
                                                            backgroundColor: page.subMenu.find(subPage => "/" + subPage.route === activePage) ? theme.palette.action.selected : 'transparent',
                                                        }} xs={12} sm={4} md={3} lg={2} item key={page.name} >
                                                            <GlassDropdown type='menu'>
                                                                <DropdownTrigger>
                                                                    <Button
                                                                        css={{
                                                                            color: theme.palette.text.primary,
                                                                        }}
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
                                                                            // description="ACME scales apps to meet user demand, automagically, based on load."
                                                                            startContent={subPage.icon}
                                                                            style={{
                                                                                color: theme.palette.text.primary,
                                                                                backgroundColor: activePage === "/"+subPage.route ? theme.palette.action.selected : 'transparent',
                                                                            }}
                                                                        >
                                                                            {subPage.name}
                                                                        </DropdownItem>
                                                                    ))}
                                                                </DropdownMenu>
                                                            </GlassDropdown>
                                                        </Grid>
                                                    ) : (
                                                        <Grid sx={{
                                                            backgroundColor: activePage === "/"+page.route ? theme.palette.action.selected : 'transparent',
                                                        }} xs={12} sm={4} md={3} lg={2} item key={page.name}>
                                                            <Button
                                                                as={Link}
                                                                href={route(page.route)}
                                                                method={page.method || undefined}
                                                                css={{
                                                                    color: theme.palette.text.primary,
                                                                }}
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

                                {/* Mobile Menu Area */}
                                <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                                    <IconButton
                                        sx={{color: theme.palette.text.primary}}
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleOpenNavMenu}
                                    >
                                        {menuOpen ? <CloseIcon/> : <MenuIcon/>}
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorElNav}
                                        open={Boolean(anchorElNav)}
                                        onClose={handleCloseNavMenu}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'left',
                                        }}
                                        PaperProps={{
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(150%)',
                                                backgroundColor: theme.glassCard.backgroundColor,
                                                border: theme.glassCard.border,
                                                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                                                backgroundClip: 'border-box',
                                                borderRadius: '10px'
                                            },
                                        }}
                                    >
                                        {pages.map((page) => (
                                            page.subMenu ? (
                                                <div key={page.name}>
                                                    <MenuItem
                                                        onClick={(event) => handleOpenSubMenu(page.name, event)}
                                                        sx={{
                                                            color: theme.palette.text.primary,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                            {page.icon}
                                                            <Typography sx={{ml: 1}} textAlign="center">
                                                                {page.name}
                                                            </Typography>
                                                        </Box>
                                                        {openSubMenu === page.name ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                    </MenuItem>
                                                    <Menu
                                                        anchorEl={anchorElSubMenu} // Correct anchor element for submenu
                                                        open={Boolean(openSubMenu === page.name)}
                                                        onClose={handleCloseSubMenu}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'left',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        }}
                                                        PaperProps={{
                                                            sx: {
                                                                backdropFilter: 'blur(16px) saturate(150%)',
                                                                backgroundColor: theme.glassCard.backgroundColor,
                                                                border: theme.glassCard.border,
                                                                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                                                                backgroundClip: 'border-box',
                                                                borderRadius: '10px'
                                                            },
                                                        }}
                                                    >
                                                        {page.subMenu.map((subPage) => (
                                                            <MenuItem
                                                                key={subPage.name}
                                                                onClick={handleCloseSubMenu}
                                                                sx={{ color: theme.palette.text.primary }}
                                                            >
                                                                <Link as={'a'} href={route(subPage.route)}
                                                                      method={subPage.method || undefined} style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    color: theme.palette.text.primary,
                                                                    textDecoration: 'none'
                                                                }}>
                                                                    {subPage.icon}
                                                                    <Typography sx={{ ml: 1 }} textAlign="center">{subPage.name}</Typography>
                                                                </Link>
                                                            </MenuItem>
                                                        ))}
                                                    </Menu>
                                                </div>
                                            ) : (
                                                <MenuItem key={page.name} onClick={handleCloseNavMenu} sx={{ color: theme.palette.text.primary }}>
                                                    <Link as={'a'} href={route(page.route)} method={page.method || undefined} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        color: theme.palette.text.primary,
                                                        textDecoration: 'none'
                                                    }}>
                                                        {page.icon}
                                                        <Typography sx={{ ml: 1 }} textAlign="center">{page.name}</Typography>
                                                    </Link>
                                                </MenuItem>
                                            )
                                        ))}
                                    </Menu>
                                </Box>

                                {/* Mobile Logo Area */}
                                <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }}}>
                                    <Box
                                        component="img"
                                        alt="Logo"
                                        src={logo}
                                        sx={{
                                            height: '40px',
                                            width: '40px',
                                        }}
                                    />
                                </Box>


                                {/* Profile Menu Area */}
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <GlassDropdown
                                            type='menu'
                                        >
                                            <DropdownTrigger>
                                                <Tooltip title="Open settings">
                                                    <Avatar
                                                        alt={auth.user.first_name}
                                                        src={auth.user.profile_image} />
                                                </Tooltip>
                                            </DropdownTrigger>

                                            <DropdownMenu>
                                                <DropdownItem
                                                    as={Link}
                                                    href={route('profile', { user: auth.user.id })}
                                                    method="get"
                                                    key={'profile'}
                                                    // description="ACME scales apps to meet user demand, automagically, based on load."
                                                    startContent={<AccountCircle />}
                                                    style={{
                                                        color: theme.palette.text.primary,
                                                    }}
                                                >
                                                    Profile
                                                </DropdownItem>
                                                {settings.map((setting) => (
                                                    <DropdownItem
                                                        as={Link}
                                                        href={route(setting.route)}
                                                        method={setting.method || undefined}
                                                        key={setting.name}
                                                        // description="ACME scales apps to meet user demand, automagically, based on load."
                                                        startContent={setting.icon}
                                                        style={{
                                                            color: theme.palette.text.primary,
                                                        }}
                                                    >
                                                        {setting.name}
                                                    </DropdownItem>
                                                ))}
                                                <DropdownItem
                                                    style={{ color: theme.palette.text.primary }}>
                                                    {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                                                    <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </GlassDropdown>
                                    </Box>
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
