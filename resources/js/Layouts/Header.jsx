import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Grow from '@mui/material/Grow';

import { Settings, AccountCircle, ExitToApp } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import BlogIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LeaveIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import { Switch } from "@mui/material";
import logo from '../../../public/assets/images/logo.png';
import useTheme from "@/theme.jsx";
import { usePage, Link } from '@inertiajs/react';
import {useState} from "react";

// Styled Menu component
const StyledMenu = styled(({ anchorOrigin, transformOrigin, ...props }) => (
    <Menu
        elevation={0}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        backdropFilter: 'blur(16px) saturate(200%)',
        backgroundColor: theme.glassCard.backgroundColor,
        border: theme.glassCard.border,
        borderRadius: 10,
        backgroundClip: 'border-box',
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
    },
}));



function Header({ darkMode, toggleDarkMode }) {
    const theme = useTheme(darkMode);
    const { auth } = usePage().props;
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [anchorElSubMenu, setAnchorElSubMenu] = React.useState(null);
    const [openSubMenu, setOpenSubMenu] = React.useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const pages = [
        { name: 'Dashboard', icon: <DashboardIcon />, route: 'dashboard' },
        { name: 'Leaves', icon: <LeaveIcon />, route: 'leaves-employee' },
        { name: 'Attendance', icon: <CalendarTodayIcon />, route: 'attendance-employee' },
        { name: 'Employees', icon: <PeopleIcon />, subMenu: [
                { name: 'All Employees', icon: <PeopleIcon />, route: 'employees' },
                { name: 'Holidays', icon: <EventNoteIcon />, route: 'holidays' },
                { name: 'Leaves', icon: <LeaveIcon />, route: 'leaves', badge: { content: '1', className: 'badge rounded-pill bg-primary float-end' } },
                { name: 'Leave Settings', icon: <SettingsIcon />, route: 'leave-settings' },
                { name: 'Attendances', icon: <CalendarTodayIcon />, route: 'attendances' },
                { name: 'Departments', icon: <HomeIcon />, route: 'departments' },
                { name: 'Designations', icon: <WorkIcon />, route: 'designations' },
                { name: 'Timesheet', icon: <ListAltIcon />, route: 'timesheet' },
            ]
        },
        { name: 'Projects', icon: <WorkIcon />, subMenu: [
                { name: 'Projects', icon: <WorkIcon />, route: 'dashboard' },
                { name: 'Tasks', icon: <ListAltIcon />, route: 'tasks' }
            ] },
        { name: 'Blog', icon: <BlogIcon />, route: 'dashboard' }
    ];


    const settings = [
        { name: 'Settings', route: 'dashboard', icon: <Settings /> },
        { name: 'Logout', route: 'logout', method: 'post', icon: <ExitToApp /> }
    ];



    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
        setMenuOpen(true);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleOpenSubMenu = (pageName, event) => {
        setAnchorElSubMenu(event.currentTarget); // Set the submenu anchor element
        setOpenSubMenu(prev => prev === pageName ? null : pageName);
        event.stopPropagation(); // Prevent event from propagating to parent
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
        setMenuOpen(false);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleCloseSubMenu = () => {
        setAnchorElSubMenu(null);
        setOpenSubMenu(null);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Grow in>
                <AppBar sx={{
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    borderRadius: '12px',
                    border: theme.glassCard.border
                }} position="static">
                    <Container maxWidth="xl">
                        <Toolbar disableGutters>
                            {/* Desktop Logo Area */}
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

                            {/* Mobile Menu Area */}
                            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                                <IconButton
                                    sx={{ color: theme.palette.text.primary }}
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenNavMenu}
                                >
                                    {menuOpen ? <CloseIcon /> : <MenuIcon />}
                                </IconButton>
                                <StyledMenu
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
                                            backgroundColor: theme.glassCard.backgroundColor,
                                            border: theme.glassCard.border,
                                        },
                                    }}
                                >
                                    {pages.map((page) => (
                                        page.subMenu ? (
                                            <div key={page.name}>
                                                <MenuItem
                                                    onClick={(event) => handleOpenSubMenu(page.name, event)}
                                                    sx={{ color: theme.palette.text.primary }}
                                                >
                                                    {page.icon}
                                                    <Typography sx={{ ml: 1 }} textAlign="center">
                                                        {page.name}
                                                    </Typography>
                                                </MenuItem>
                                                <StyledMenu
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
                                                            backgroundColor: theme.glassCard.backgroundColor,
                                                            border: theme.glassCard.border,
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
                                                </StyledMenu>
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
                                </StyledMenu>
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
                            {/* Desktop Menu Area */}
                            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                                {pages.map((page) => (
                                    page.subMenu ? (
                                        <div key={page.name}>
                                            <MenuItem
                                                sx={{ color: theme.palette.text.primary }}
                                                onClick={(event) => handleOpenSubMenu(page.name, event)}
                                            >
                                                {page.icon}
                                                <Typography sx={{ ml: 1 }} textAlign="center">
                                                    {page.name}
                                                </Typography>
                                            </MenuItem>
                                            <StyledMenu
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
                                                        backgroundColor: theme.glassCard.backgroundColor,
                                                        border: theme.glassCard.border,
                                                    },
                                                }}
                                            >
                                                {page.subMenu.map((subPage) => (
                                                    <MenuItem
                                                        key={subPage.name}
                                                        onClick={handleCloseSubMenu}
                                                        sx={{ color: theme.palette.text.primary }}
                                                    >
                                                        <Link as={'a'} href={route(subPage.route)} method={subPage.method || undefined} style={{
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
                                            </StyledMenu>
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
                            </Box>

                            <Box sx={{ flexGrow: 0 }}>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt={auth.user.first_name} src={`/assets/images/users/${auth.user.user_name}.jpg`} />
                                    </IconButton>
                                </Tooltip>
                                <StyledMenu
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    PaperProps={{
                                        sx: {
                                            backgroundColor: theme.glassCard.backgroundColor,
                                            border: theme.glassCard.border,
                                        },
                                    }}
                                >
                                    <MenuItem key={'Profile'} onClick={handleCloseUserMenu} sx={{ color: theme.palette.text.primary }}>
                                        <Link
                                            as={'a'}
                                            href={route('profile', { user: auth.user.id })}
                                            method="get"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: theme.palette.text.primary,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            <AccountCircle />
                                            <Typography sx={{ ml: 1 }} textAlign="center">
                                                Profile
                                            </Typography>
                                        </Link>
                                    </MenuItem>
                                    {settings.map((setting) => (
                                        <MenuItem key={setting.name} onClick={handleCloseUserMenu} sx={{ color: theme.palette.text.primary }}>
                                            <Link as={'a'} href={route(setting.route)} method={setting.method || undefined} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: theme.palette.text.primary,
                                                textDecoration: 'none'
                                            }}>
                                                {setting.icon}
                                                <Typography sx={{ ml: 1 }} textAlign="center">{setting.name}</Typography>
                                            </Link>
                                        </MenuItem>
                                    ))}
                                    <MenuItem onClick={toggleDarkMode} sx={{ color: theme.palette.text.primary }}>
                                        {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                                        <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
                                    </MenuItem>
                                </StyledMenu>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
            </Grow>
        </Box>
    );
}

export default Header;
