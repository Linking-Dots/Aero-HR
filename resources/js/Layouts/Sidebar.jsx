import React, {useEffect, useState} from 'react';
import {Box, CardHeader, Collapse, List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {Link, usePage} from "@inertiajs/react";
import GlassCard from "@/Components/GlassCard.jsx";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {getPages} from '@/Props/pages.jsx';
import {getSettingsPages} from "@/Props/settings.jsx";

const Sidebar = ({toggleSideBar, pages}) => {
    const theme = useTheme();
    const {  url } = usePage().props;
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [activePage, setActivePage] = useState(url);



    const handleOpenSubMenu = (pageName) => {
        setOpenSubMenu(prev => prev === pageName ? null : pageName);
    };

    const handleClick = (pageName) => {
        setActivePage(pageName);
        handleOpenSubMenu(pageName);
    };

    return (
        <Box sx={{ p: 2, height: '100%' }}>
            <GlassCard>
                <CardHeader />
                <IconButton
                    sx={{
                        position: 'absolute',
                        zIndex: 1,
                        top: 8, // Adjust as needed
                        right: 8, // Adjust as needed
                        color: theme.palette.text.primary
                    }}
                    size="large"
                    onClick={toggleSideBar}
                >
                    <CloseIcon />
                </IconButton>
                <List>
                    {pages.map((page) => (
                        page.subMenu ? (
                            <div key={page.name}>
                                <ListItem
                                    button
                                    onClick={() => handleClick(page.name)}
                                    sx={{
                                        backgroundColor: activePage === page.name ? theme.palette.action.selected : 'transparent',
                                    }}
                                >
                                    <ListItemIcon>{page.icon}</ListItemIcon>
                                    <ListItemText primary={page.name} />
                                    {page.subMenu ? (openSubMenu === page.name ? <ExpandLess /> : <ExpandMore />) : null}
                                </ListItem>
                                {page.subMenu && (
                                    <Collapse in={openSubMenu === page.name} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {page.subMenu.map((subPage) => (
                                                <Link
                                                    as={'a'}
                                                    href={route(subPage.route)}
                                                    method={subPage.method || undefined}
                                                    key={subPage.name}
                                                    style={{
                                                        alignItems: 'center',
                                                        color: theme.palette.text.primary,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <ListItem
                                                        onClick={() => setActivePage(subPage.name)}
                                                        sx={{
                                                            pl: 3,
                                                            backgroundColor: activePage === subPage.name ? theme.palette.action.selected : 'transparent',
                                                        }}
                                                        button
                                                    >
                                                        <ListItemIcon>{subPage.icon}</ListItemIcon>
                                                        <ListItemText primary={subPage.name} />
                                                    </ListItem>
                                                </Link>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </div>
                        ) : (
                            <Link
                                as={'a'}
                                href={route(page.route)}
                                method={page.method || undefined}
                                key={page.name}
                                style={{
                                    alignItems: 'center',
                                    color: theme.palette.text.primary,
                                    textDecoration: 'none'
                                }}
                            >
                                <ListItem
                                    button
                                    onClick={() => setActivePage(page.name)}
                                    sx={{
                                        backgroundColor: activePage === page.name ? theme.palette.action.selected : 'transparent',
                                    }}
                                >
                                    <ListItemIcon>{page.icon}</ListItemIcon>
                                    <ListItemText primary={page.name} />
                                </ListItem>
                            </Link>
                        )
                    ))}
                </List>
            </GlassCard>
        </Box>

    );
};

export default Sidebar;
