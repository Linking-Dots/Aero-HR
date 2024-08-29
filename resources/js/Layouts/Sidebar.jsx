import React, {useState} from 'react';
import {Box, CardHeader, Collapse, List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {Link, usePage} from "@inertiajs/react";
import GlassCard from "@/Components/GlassCard.jsx";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {getPages} from '@/Props/pages.jsx';

const Sidebar = ({toggleSideBar}) => {
    const theme = useTheme();
    const { auth } = usePage().props;
    const userIsAdmin = auth.roles.includes('admin');
    const pages = getPages(userIsAdmin);
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
