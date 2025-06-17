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

/**
 * BottomNav Component - Atomic Design: Organism
 * 
 * A responsive bottom navigation component for mobile devices.
 * Provides easy access to main application sections and sidebar toggle.
 * 
 * Features:
 * - Responsive design (hidden on desktop)
 * - Active state management
 * - Glassmorphism styling
 * - Accessibility support
 * - Height calculation for content padding
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.auth - Authentication object containing user data
 * @param {React.RefObject} props.contentRef - Reference to main content area
 * @param {Function} props.setBottomNavHeight - Function to set navigation height
 * @param {Function} props.toggleSideBar - Function to toggle sidebar
 * @param {boolean} props.sideBarOpen - Current sidebar state
 * @returns {JSX.Element} Rendered BottomNav component
 * 
 * @example
 * <BottomNav 
 *   auth={authData}
 *   contentRef={contentRef}
 *   setBottomNavHeight={setHeight}
 *   toggleSideBar={toggleSidebar}
 *   sideBarOpen={isOpen}
 * />
 */
const BottomNav = ({ auth, contentRef, setBottomNavHeight, toggleSideBar, sideBarOpen }) => {
    const theme = useTheme();
    const { url } = usePage().props;
    const [activeTab, setActiveTab] = useState('dashboard');
    const bottomNavRef = useRef(null);

    // Navigation items configuration
    const navItems = [
        {
            id: 'dashboard',
            label: 'Home',
            icon: HomeIcon,
            href: '/dashboard',
            route: 'dashboard'
        },
        {
            id: 'daily-works',
            label: 'Tasks',
            icon: DocumentTextIcon,
            href: '/daily-works',
            route: 'daily-works',
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
        if (url.includes('/daily-works')) {
            setActiveTab('daily-works');
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
                backdropFilter: 'blur(16px) saturate(200%)',
                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                borderTop: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
                py: 1,
                px: 2,
                minHeight: 64
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
                        <div className="flex flex-col items-center justify-center gap-1 py-1">
                            <div className="relative">
                                <IconComponent 
                                    className={`w-5 h-5 transition-colors duration-200 ${
                                        isActive ? 'text-primary' : 'text-default-500'
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
                                text-xs font-medium transition-colors duration-200 
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
                                h-14 min-w-16 px-2 transition-all duration-200
                                ${isActive 
                                    ? 'bg-primary/10 border border-primary/20' 
                                    : 'bg-transparent hover:bg-white/5'
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
