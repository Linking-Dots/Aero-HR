import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Link, usePage} from "@inertiajs/react";

const BottomNav = () => {
    const [value, setValue] = useState(0);
    const auth = usePage().props;


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Paper sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' }} elevation={3}>
            <BottomNavigation
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: 'rgba(17, 25, 40, 0.3)',
                }}
                showLabels
                value={value}
                onChange={handleChange}
            >
                <BottomNavigationAction
                    component={Link}
                    href="/dashboard"
                    label="Home"
                    icon={<HomeIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    href="/tasks"
                    label="Tasks"
                    icon={<AddBoxIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    href={route('profile', { user: auth.user.id })}
                    label="Profile"
                    icon={<AccountCircleIcon />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;
