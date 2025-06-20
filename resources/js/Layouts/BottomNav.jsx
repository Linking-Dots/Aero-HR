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

const BottomNav = ({ auth, contentRef, setBottomNavHeight, toggleSideBar, sideBarOpen }) => {
    const theme = useTheme();
    const { url } = usePage().props;
    const [activeTab, setActiveTab] = useState('dashboard');
    const bottomNavRef = useRef(null);

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
                backdropFilter: 'blur(20px) saturate(200%)',
                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                borderTop: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
                py: 1.5,
                px: 2,
                minHeight: 72
            }}
        >
            <div className="flex items-center justify-around w-full max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComponent = item.icon;
                    
                    if (item.action === 'sidebar') {
                        return (
                            <Button
                                key={item.id}
                                isIconOnly
                                variant={sideBarOpen ? "flat" : "light"}
                                color={sideBarOpen ? "primary" : "default"}
                                className={`
                                    h-12 w-12 transition-all duration-200
                                    ${sideBarOpen 
                                        ? 'bg-primary/20 border border-primary/30' 
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
                                    className={`w-5 h-5 transition-all duration-200 ${
                                        isActive ? 'text-primary scale-110' : 'text-default-500'
                                    }`} 
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
                            <span className={`
                                text-xs font-semibold transition-all duration-200 
                                ${isActive ? 'text-primary' : 'text-default-500'}
                            `}>
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
                            className={`
                                h-16 min-w-16 px-2 transition-all duration-300
                                ${isActive 
                                    ? 'bg-primary/15 border border-primary/30 shadow-lg scale-105' 
                                    : 'bg-transparent hover:bg-white/5 hover:scale-105'
                                }
                            `}
                            onPress={() => handleItemPress(item)}
                            aria-label={`Navigate to ${item.label}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {ButtonContent}
                        </Button>
                    );
                })}
            </div>
        </Box>
    );
};

export default BottomNav;
