import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { Button, Badge } from "@heroui/react";
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserCircleIcon,
  Bars3Icon 
} from '@heroicons/react/24/outline';
import { Link, usePage } from "@inertiajs/react";
import { useTheme } from "@mui/material/styles";
import { GRADIENT_PRESETS } from '@/utils/gradientUtils.js';
import GlassCard from '@/Components/GlassCard';
import { getThemePrimaryColor, hexToRgba } from '@/theme.jsx';

const BottomNav = ({ auth, contentRef, setBottomNavHeight, toggleSideBar, sideBarOpen }) => {
    const theme = useTheme();
    const { url } = usePage().props;
    const [activeTab, setActiveTab] = useState('dashboard');
    const bottomNavRef = useRef(null);
    const themeColor = getThemePrimaryColor(theme);
    const themeColorRgba = hexToRgba(themeColor, 0.5);
    

    // Navigation items configuration
    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: HomeIcon,
            href: '/dashboard',
            route: 'dashboard'
        },
        {
            id: 'attendance',
            label: 'Attendance',
            icon: DocumentTextIcon,
            href: '/attendance-employee',
            route: 'attendance-employee',
            badge: null
        },
        {
            id: 'leaves',
            label: 'Leaves',
            icon: DocumentTextIcon,
            href: '/leaves-employee',
            route: 'leaves-employee',
            badge: null
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: UserCircleIcon,
            href: route('profile', { user: auth.user.id }),
            route: `profile.${auth.user.id}`
        }
    ];

    // Calculate bottom navigation height
    const calculatePadding = useCallback(() => {
        if (bottomNavRef.current) {
            const navHeight = bottomNavRef.current.clientHeight;
            setBottomNavHeight(navHeight);
        }
    }, [setBottomNavHeight]);

    // Update active tab based on current URL
    useEffect(() => {
        if (url.includes('/attendance-employee')) {
            setActiveTab('attendance');
        } else if (url.includes('/leaves-employee')) {
            setActiveTab('leaves');
        } else if (url.includes('/dashboard')) {
            setActiveTab('dashboard');
        } else if (url.includes(`/profile/${auth.user.id}`)) {
            setActiveTab('profile');
        } else {
            setActiveTab('dashboard'); // Default fallback
        }
    }, [url, auth.user.id]);

    // Handle navigation and sidebar toggle
    const handleItemPress = useCallback((item) => {
        if (item.action === 'sidebar') {
            toggleSideBar();
        } else {
            setActiveTab(item.id);
        }
    }, [toggleSideBar]);

    // Setup resize listener
    useEffect(() => {
        calculatePadding();
        window.addEventListener('resize', calculatePadding);
        return () => window.removeEventListener('resize', calculatePadding);
    }, [calculatePadding]);

    return (
        <Box
            ref={bottomNavRef}
            component="nav"
            role="navigation"
            aria-label="Bottom navigation"
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                display: { xs: 'flex', md: 'none' },
                
                py: 1.5,
                px: 2,
                minHeight: 72
            }}
        >
            <GlassCard>
            <div className="flex items-center justify-around w-full max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComponent = item.icon;
                    const activeStyle = isActive ? {
                        color: themeColor,
                        borderBottom: `3px solid ${themeColor}`,
                    } : {};

                    if (item.action === 'sidebar') {
                        return (
                            <Button
                                key={item.id}
                                isIconOnly
                                variant={sideBarOpen ? "flat" : "light"}
                                color={sideBarOpen ? "primary" : "default"}
                                className={`
                                    h-12 w-12 transition-all duration-200 hover:scale-105
                                    ${sideBarOpen 
                                        ? GRADIENT_PRESETS.accentCard 
                                        : 'bg-transparent hover:bg-white/10'
                                    }
                                `}
                                onPress={() => handleItemPress(item)}
                                aria-label={item.ariaLabel}
                            >
                                <IconComponent className="w-5 h-5" />
                            </Button>
                        );
                    }

                    const ButtonContent = (
                        <div className="flex flex-col items-center justify-center gap-1.5 py-1.5">
                            <div className="relative">
                                <IconComponent 
                                    className={`transition-all duration-200 ${isActive ? 'w-6 h-6 font-bold' : 'w-5 h-5'}`}
                                    style={isActive ? { color: themeColor, fontWeight: 700 } : { color: '' }}
                                />
                                {item.badge && (
                                    <Badge
                                        content={item.badge}
                                        color="danger"
                                        size="sm"
                                        className="absolute -top-2 -right-2"
                                    />
                                )}
                            </div>
                            <span className={`text-xs transition-all duration-200 ${isActive ? 'font-bold' : 'font-semibold'}`}
                                  style={isActive ? { color: themeColor } : {}}>
                                {item.label}
                            </span>
                        </div>
                    );

                    return (
                        <Button
                            key={item.id}
                            as={Link}
                            href={item.href}
                            preserveState
                            preserveScroll
                            variant="light"
                            className={`h-16 min-w-16 px-2 transition-all duration-300 ${isActive ? 'scale-105' : 'bg-transparent hover:bg-white/5 hover:scale-105'}`}
                            style={isActive ? activeStyle : {}}
                            onPress={() => handleItemPress(item)}
                            aria-label={`Navigate to ${item.label}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {ButtonContent}
                        </Button>
                    );
                })}
            </div>
            </GlassCard>
        </Box>
    );
};

export default BottomNav;
