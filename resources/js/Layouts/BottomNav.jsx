
import React, { useEffect, useRef, useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home as HomeIcon, AddBox as AddBoxIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { Link, usePage } from "@inertiajs/react";
import { useTheme } from "@mui/material/styles";

const BottomNav = ({ auth, setBottomNavHeight }) => {
    const theme = useTheme();
    const { url } = usePage();
    const [value, setValue] = useState(0);
    const bottomNavRef = useRef(null);

    // Navigation items configuration
    const navItems = [
        { 
            label: 'Home', 
            icon: <HomeIcon />, 
            href: '/dashboard',
            match: '/dashboard'
        },
        { 
            label: 'Tasks', 
            icon: <AddBoxIcon />, 
            href: '/daily-works',
            match: '/daily-works'
        },
        { 
            label: 'Profile', 
            icon: <AccountCircleIcon />, 
            href: route('profile', { user: auth.user.id }),
            match: `/profile/${auth.user.id}`
        }
    ];

    // Calculate and set bottom navigation height
    const calculatePadding = () => {
        if (bottomNavRef.current) {
            const navHeight = bottomNavRef.current.clientHeight;
            setBottomNavHeight(navHeight);
        }
    };

    useEffect(() => {
        calculatePadding();
        window.addEventListener('resize', calculatePadding);
        return () => window.removeEventListener('resize', calculatePadding);
    }, []);

    // Update active tab based on current URL
    useEffect(() => {
        const activeIndex = navItems.findIndex(item => url.includes(item.match));
        setValue(activeIndex !== -1 ? activeIndex : 0);
    }, [url, auth.user.id]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <BottomNavigation
            ref={bottomNavRef}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: theme.zIndex.bottomNavigation || 1200,
                display: { xs: 'flex', md: 'none' },
                backdropFilter: 'blur(16px) saturate(200%)',
                backgroundColor: theme.glassCard?.backgroundColor || theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[8],
                '& .MuiBottomNavigationAction-root': {
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                        color: theme.palette.primary.main,
                    },
                    '&:hover': {
                        color: theme.palette.text.primary,
                    },
                    transition: 'color 0.2s ease',
                },
            }}
            elevation={0}
            showLabels
            value={value}
            onChange={handleChange}
        >
            {navItems.map((item, index) => (
                <BottomNavigationAction
                    key={index}
                    component={Link}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                />
            ))}
        </BottomNavigation>
    );
};

export default BottomNav;
