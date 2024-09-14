import * as React from 'react';
import {useState, useCallback, useEffect} from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import Container from '@mui/material/Container';
// import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Grow from '@mui/material/Grow';
import { AccountCircle, ExitToApp, Settings } from '@mui/icons-material';
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {Grid, Container, Collapse, MenuItem} from "@mui/material";
import {Link} from '@inertiajs/react'
import logo from '../../../public/assets/images/logo.png';
import useTheme from "@/theme.jsx";
import { usePage } from '@inertiajs/react';
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem
} from "@nextui-org/react";
import {VisuallyHidden, useSwitch, Button, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Switch, Avatar} from "@nextui-org/react";
import {SunIcon, MoonIcon } from "@heroicons/react/24/outline/index.js";
import {ChevronDownIcon} from "@heroicons/react/16/solid/index.js";
import GlassCard from '@/Components/GlassCard.jsx'

import { FaBars } from 'react-icons/fa';

import {Inertia} from "@inertiajs/inertia";

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
        borderRadius: 10,
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
    },
}));

const Header = React.memo(({ darkMode, toggleDarkMode, sideBarOpen, toggleSideBar, url, pages }, props) => {
    // const theme = useTheme(darkMode);
    const { auth } = usePage().props;
    const [activePage, setActivePage] = useState();
    //
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

    // const [openSubMenu, setOpenSubMenu] = useState(null);

    // const handleOpenSubMenu = (name) => {
    //     setOpenSubMenu((prevOpen) => (prevOpen === name ? null : name));
    // };

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

   console.log(activePage)



    return (

                <AppBar as={GlassCard} position="static">
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
                                <p>
                                    DBEDC
                                </p>
                                {!sideBarOpen && <IconButton
                                    sx={{ display: { xs: 'none', md: 'flex' } }}
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
                                                    <Grid xs={12} sm={4} md={3} lg={2} item key={page.name} >
                                                        <MenuItem
                                                            sx={{
                                                            }}
                                                            onClick={(event) => handleOpenSubMenu(page.name, event)}
                                                        >
                                                            {page.icon}
                                                            <Typography sx={{ml: 1}} textAlign="center">
                                                                {page.name}
                                                            </Typography>
                                                            {openSubMenu === page.name ? (
                                                                <KeyboardArrowUpIcon sx={{ ml: 'auto', textAlign: 'right' }} />
                                                            ) : (
                                                                <KeyboardArrowDownIcon sx={{ ml: 'auto', textAlign: 'right' }} />
                                                            )}
                                                        </MenuItem>
                                                        <StyledMenu
                                                            key={pages}
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

                                                            }}
                                                        >
                                                            {page.subMenu.map((subPage) => (
                                                                <MenuItem
                                                                    key={subPage.name}
                                                                    onClick={handleCloseSubMenu}

                                                                >
                                                                    <Link as={'a'} href={route(subPage.route)}
                                                                          method={subPage.method || undefined}
                                                                          style={{
                                                                              display: 'flex',
                                                                              alignItems: 'center',
                                                                              textDecoration: 'none'
                                                                          }}>
                                                                        {subPage.icon}
                                                                        <Typography sx={{ml: 1}}
                                                                                    textAlign="center">{subPage.name}</Typography>
                                                                    </Link>
                                                                </MenuItem>
                                                            ))}
                                                        </StyledMenu>
                                                    </Grid>
                                                ) : (
                                                    <Grid xs={12} sm={4} md={3} lg={2} item key={page.name}>
                                                        <MenuItem
                                                            onClick={handleCloseNavMenu}
                                                        >
                                                            <Link as={'a'} href={route(page.route)}
                                                                  method={page.method || undefined} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                textDecoration: 'none'
                                                            }}>
                                                                {page.icon}
                                                                <Typography sx={{ml: 1}}
                                                                            textAlign="center">{page.name}</Typography>
                                                            </Link>
                                                        </MenuItem>
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
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenNavMenu}
                                >
                                    {menuOpen ? <CloseIcon/> : <MenuIcon/>}
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

                                >
                                    {pages.map((page) => (
                                        page.subMenu ? (
                                            <div key={page.name}>
                                                <MenuItem
                                                    onClick={(event) => handleOpenSubMenu(page.name, event)}
                                                    sx={{
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
                                                >
                                                    {page.subMenu.map((subPage) => (
                                                        <MenuItem
                                                            key={subPage.name}
                                                            onClick={handleCloseSubMenu}
                                                        >
                                                            <Link as={'a'} href={route(subPage.route)}
                                                                  method={subPage.method || undefined} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
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
                                            <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                                                <Link as={'a'} href={route(page.route)} method={page.method || undefined} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
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
                                            <Avatar alt={auth.user.first_name} src={auth.user.profile_image} />
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
                                    >
                                        <MenuItem key={'Profile'} onClick={handleCloseUserMenu} >
                                            <Link
                                                as={'a'}
                                                href={route('profile', { user: auth.user.id })}
                                                method="get"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',

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
                                            <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                                                <Link as={'a'} href={route(setting.route)} method={setting.method || undefined} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    textDecoration: 'none'
                                                }}>
                                                    {setting.icon}
                                                    <Typography sx={{ ml: 1 }} textAlign="center">{setting.name}</Typography>
                                                </Link>
                                            </MenuItem>
                                        ))}
                                        <MenuItem onClick={toggleDarkMode} >
                                            {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
                                            <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
                                        </MenuItem>
                                    </StyledMenu>
                                </Box>
                            </Box>
                        </Box>
                    </Container>
                </AppBar>

        // <Navbar isBlurred variant="sticky" shouldHideOnScroll className="flex">
        //     <NavbarBrand className="flex-grow-0">
        //         <NavbarMenuToggle
        //             aria-label="toggle sidebar"
        //             icon={<FaBars />}
        //             onClick={toggleSideBar}
        //         />
        //         <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
        //         <p className="font-bold text-inherit">DBEDC</p>
        //     </NavbarBrand>
        //
        //     {/* Desktop Menu */}
        //     <NavbarContent className="flex-grow-1 flex-wrap">
        //         {pages.map((page) => (
        //             page.subMenu ? (
        //                 <Grid xs={12} sm={4} md={3} lg={2} item key={page.name} >
        //                     <Dropdown key={page.name} placement="bottom-left">
        //                         <NavbarItem>
        //                             <DropdownTrigger>
        //                                 <Button
        //                                     disableRipple
        //                                     className="p-0 bg-transparent data-[hover=true]:bg-transparent"
        //                                     startContent={page.icon}
        //                                     endContent={<ChevronDownIcon/>}
        //                                     radius="sm"
        //                                     variant="light"
        //                                 >{page.name}</Button>
        //                             </DropdownTrigger>
        //                         </NavbarItem>
        //
        //                         <DropdownMenu variant={'shadow'} aria-label="submenu">
        //                             {page.subMenu.map((subPage) => (
        //                                 <DropdownItem key={subPage.name}>
        //                                     <Link as={'a'} href={route(subPage.route)}
        //                                           method={subPage.method || undefined}
        //                                           style={{
        //                                               display: 'flex',
        //                                               alignItems: 'center',
        //                                               textDecoration: 'none'
        //                                           }}>
        //                                         {subPage.icon}
        //                                         <p>{subPage.name}</p>
        //                                     </Link>
        //                                 </DropdownItem>
        //                             ))}
        //                         </DropdownMenu>
        //                     </Dropdown>
        //                 </Grid>
        //             ) : (
        //                 <Grid xs={12} sm={4} md={3} lg={2} item key={page.name} >
        //                     <NavbarItem key={page.name} isActive={activePage === "/"+page.route}>
        //                         <Button
        //                             as={Link}
        //                             href={route(page.route)}
        //                             method={page.method || undefined}
        //                             style={{
        //                                 display: 'flex',
        //                                 alignItems: 'center',
        //                                 textDecoration: 'none'
        //                             }}
        //                             disableRipple
        //                             className="p-0 bg-transparent data-[hover=true]:bg-transparent"
        //                             startContent={page.icon}
        //                             radius="sm"
        //                             variant="light"
        //                         >
        //                             <p>{page.name}</p>
        //                         </Button>
        //                     </NavbarItem>
        //                 </Grid>
        //             )
        //         ))}
        //
        //     </NavbarContent>
        //
        //     {/* User and Theme Toggle */}
        //     <NavbarContent className="grow-0 align-middle">
        //         <NavbarItem>
        //             <Button
        //                 size='sm'
        //                 onPress={toggleDarkMode}
        //                 isIconOnly
        //                 color="warning"
        //                 variant="faded"
        //                 aria-label="Toggle dark mode"
        //             >
        //                 {darkMode ? <SunIcon/> : <MoonIcon/>}
        //             </Button>
        //         </NavbarItem>
        //
        //         <Dropdown placement="bottom-right">
        //             <DropdownTrigger>
        //                 <Avatar
        //                     isBordered
        //                     size="md"
        //                     as="button"
        //                     src={auth.user.profile_image}
        //                     alt={auth.user.first_name}
        //                 />
        //             </DropdownTrigger>
        //             <DropdownMenu
        //                 aria-label="User menu actions"
        //                 css={{ $$dropdownMenuBackgroundColor: '$accents1' }}
        //             >
        //                 <DropdownItem key="profile" textValue="Profile">
        //                     <Link href={route('profile', { user: auth.user.id })}>Profile</Link>
        //                 </DropdownItem>
        //                 {settings.map((setting) => (
        //                     <DropdownItem key={setting.name}>
        //                         <Link href={route(setting.route)}>{setting.name}</Link>
        //                     </DropdownItem>
        //                 ))}
        //             </DropdownMenu>
        //         </Dropdown>
        //     </NavbarContent>
        // </Navbar>
    );
});

export default Header;
