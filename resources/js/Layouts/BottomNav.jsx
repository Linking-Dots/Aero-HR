import React, {useEffect, useState} from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Link, usePage} from "@inertiajs/react";
import {useTheme} from "@mui/material/styles";

const BottomNav = ({auth}) => {
    const theme = useTheme();

    const { url } = usePage();
    const [value, setValue] = useState(0);

    useEffect(() => {
        // Update the value based on the current URL
        if (url.includes('/daily-works')) {
            setValue(1);
        } else if (url.includes('/dashboard')) {
            setValue(0);
        } else if (url.includes(`/profile/${auth.user.id}`)) {
            setValue(2);
        }
    }, [url, auth.user.id]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };



    return (
        <Paper sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' }} elevation={3}>
            <BottomNavigation
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
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
                    href="/daily-works"
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
