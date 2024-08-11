import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {usePage} from "@inertiajs/react";

const BottomNav = () => {
    const [value, setValue] = useState(0);


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Paper sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent', }} elevation={3}>
            <BottomNavigation
                sx={{
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: 'rgba(17, 25, 40, 0.3)',
                }}
                showLabels
                value={value}
                onChange={handleChange}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={<HomeIcon />}
                />
                <BottomNavigationAction
                    label="Search"
                    icon={<SearchIcon />}
                />
                <BottomNavigationAction
                    label="Add"
                    icon={<AddBoxIcon />}
                />
                <BottomNavigationAction
                    label="Profile"
                    icon={<AccountCircleIcon />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;
