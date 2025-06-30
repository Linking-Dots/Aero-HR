
import React, { useEffect, useState } from 'react';
import { Box, CardHeader, Collapse, List, ListItem, ListItemIcon, ListItemText, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ExpandLess, ExpandMore, Close as CloseIcon } from '@mui/icons-material';
import { Link, usePage } from "@inertiajs/react";
import GlassCard from "@/Components/GlassCard.jsx";
import logo from '../../../public/assets/images/logo.png';

const Sidebar = ({ toggleSideBar, pages, url, sideBarOpen }) => {
    const theme = useTheme();
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [activePage, setActivePage] = useState(url);

    useEffect(() => {
        setActivePage(url);
    }, [url]);

    const handleOpenSubMenu = (pageName) => {
        setOpenSubMenu(prev => prev === pageName ? null : pageName);
    };

    const handleMenuItemClick = (route) => {
        setActivePage(`/${route}`);
    };

    if (!sideBarOpen) return null;

    return (
        <Box sx={{ p: 2, height: '100%' }}>
            <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Sidebar Header */}
                <CardHeader 
                    sx={{ 
                        position: 'relative',
                        pb: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                component="img"
                                alt="Logo"
                                src={logo}
                                sx={{ height: '32px', width: '32px' }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    color: theme.palette.text.primary,
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.2rem',
                                }}
                            >
                                DBEDC
                            </Typography>
                        </Box>
                    }
                />
                
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: theme.palette.text.primary,
                        zIndex: 1,
                    }}
                    size="small"
                    onClick={toggleSideBar}
                >
                    <CloseIcon />
                </IconButton>

                {/* Navigation List */}
                <Box sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
                    <List dense>
                        {pages.map((page) => (
                            page.subMenu ? (
                                <Box key={page.name}>
                                    <ListItem
                                        button
                                        onClick={() => handleOpenSubMenu(page.name)}
                                        sx={{
                                            mb: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: page.subMenu.find(subPage => `/${subPage.route}` === activePage)
                                                ? theme.palette.action.selected 
                                                : 'transparent',
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.hover,
                                            },
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.primary }}>
                                            {page.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={page.name}
                                            primaryTypographyProps={{
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                            }}
                                        />
                                        {openSubMenu === page.name ? <ExpandLess /> : <ExpandMore />}
                                    </ListItem>
                                    
                                    <Collapse in={openSubMenu === page.name} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {page.subMenu.map((subPage) => (
                                                <ListItem
                                                    key={subPage.name}
                                                    component={Link}
                                                    href={route(subPage.route)}
                                                    method={subPage.method || undefined}
                                                    onClick={() => handleMenuItemClick(subPage.route)}
                                                    button
                                                    sx={{
                                                        pl: 4,
                                                        mb: 0.25,
                                                        ml: 1,
                                                        borderRadius: 1,
                                                        backgroundColor: activePage === `/${subPage.route}`
                                                            ? theme.palette.action.selected 
                                                            : 'transparent',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.action.hover,
                                                        },
                                                        transition: 'all 0.2s ease',
                                                        color: theme.palette.text.primary,
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
                                                        {subPage.icon}
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={subPage.name}
                                                        primaryTypographyProps={{
                                                            fontSize: '0.8125rem',
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </Box>
                            ) : (
                                <ListItem
                                    key={page.name}
                                    component={Link}
                                    href={route(page.route)}
                                    method={page.method || undefined}
                                    onClick={() => handleMenuItemClick(page.route)}
                                    button
                                    sx={{
                                        mb: 0.5,
                                        borderRadius: 1,
                                        backgroundColor: activePage === `/${page.route}`
                                            ? theme.palette.action.selected 
                                            : 'transparent',
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        },
                                        transition: 'all 0.2s ease',
                                        color: theme.palette.text.primary,
                                        textDecoration: 'none',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.primary }}>
                                        {page.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={page.name}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                        }}
                                    />
                                </ListItem>
                            )
                        ))}
                    </List>
                </Box>
            </GlassCard>
        </Box>
    );
};

export default Sidebar;
