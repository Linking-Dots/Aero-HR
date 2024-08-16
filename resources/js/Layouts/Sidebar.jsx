import React, { useState } from 'react';
import {Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse, Typography, Box, CardHeader} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {Link} from "@inertiajs/react";
import Menu from "@mui/material/Menu";
import GlassCard from "@/Components/GlassCard.jsx";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {pages} from "@/Props/pages.jsx";


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

const Sidebar = ({toggleSideBar}) => {
    const theme = useTheme();
    const [openSubMenu, setOpenSubMenu] = useState(null);

    const handleOpenSubMenu = (pageName) => {
        setOpenSubMenu(prev => prev === pageName ? null : pageName);
    };

    return (
        <Box sx={{p: 2, height:  '100%',}}>
            <GlassCard>
                <CardHeader
                />
                <IconButton
                    sx={{
                        position: 'absolute',
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
                        <div key={page.name}>
                            <ListItem button onClick={() => page.subMenu ? handleOpenSubMenu(page.name) : null}>
                                <ListItemIcon>{page.icon}</ListItemIcon>
                                <ListItemText primary={page.name} />
                                {page.subMenu ? (openSubMenu === page.name ? <ExpandLess /> : <ExpandMore />) : null}
                            </ListItem>
                            {page.subMenu && (
                                <Collapse in={openSubMenu === page.name} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {page.subMenu.map((subPage) => (
                                            <ListItem button key={subPage.name} sx={{ pl: 4 }}>
                                                <ListItemIcon>{subPage.icon}</ListItemIcon>
                                                <Link as={'a'} href={route(subPage.route)} method={subPage.method || undefined} style={{
                                                    alignItems: 'center',
                                                    color: theme.palette.text.primary,
                                                    textDecoration: 'none'
                                                }}>
                                                    <ListItemText primary={subPage.name} />
                                                </Link>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </div>
                    ))}
                </List>
            </GlassCard>
        </Box>

    );
};

export default Sidebar;
