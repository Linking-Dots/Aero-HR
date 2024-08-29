import * as React from 'react';
import { useState, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
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
import { Collapse, Switch } from "@mui/material";
import logo from '../../../public/assets/images/logo.png';
import useTheme from "@/theme.jsx";
import { Link, usePage } from '@inertiajs/react';
import { getPages } from '@/Props/pages.jsx';

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
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
    },
}));

const Header = React.memo(({ darkMode, toggleDarkMode, sideBarOpen, toggleSideBar }) => {
    const theme = useTheme(darkMode);
    const { auth } = usePage().props;
    const userIsAdmin = auth.roles.includes('admin');
    const pages = getPages(userIsAdmin);
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
    }, []);

    return (
        <Box sx={{ p: 2 }}>
            <Grow in>
                <AppBar sx={{
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    borderRadius: '12px',
                    border: theme.glassCard.border,
                }} position="static">
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
                                                        {openSubMenu === page.name ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
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
                                </Collapse>
                            </Box>

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
                                                    sx={{ color: theme.palette.text.primary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {page.icon}
                                                        <Typography sx={{ ml: 1 }} textAlign="center">
                                                            {page.name}
                                                        </Typography>
                                                    </Box>
                                                    {openSubMenu === page.name ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
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


                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                            </Box>
                        </Box>
                    </Container>
                </AppBar>
            </Grow>
        </Box>
    );
});

export default Header;
