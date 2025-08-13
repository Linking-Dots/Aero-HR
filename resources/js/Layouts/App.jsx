import React, { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { usePage } from "@inertiajs/react";
import useTheme from "@/theme.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/theme-transitions.css';
import { Inertia } from '@inertiajs/inertia';
import { getPages } from '@/Props/pages.jsx';
import { getSettingsPages } from '@/Props/settings.jsx';
import { HeroUIProvider } from "@heroui/react";
import { applyThemeToRoot } from "@/utils/themeUtils.js";
import {ScrollShadow} from "@heroui/scroll-shadow";

// Lazy load components with code splitting
const Header = lazy(() => import("@/Layouts/Header.jsx"));
const Breadcrumb = lazy(() => import("@/Components/Breadcrumb.jsx"));
const BottomNav = lazy(() => import("@/Layouts/BottomNav.jsx"));
const Sidebar = lazy(() => import("@/Layouts/Sidebar.jsx"));
const SessionExpiredModal = lazy(() => import('@/Components/SessionExpiredModal.jsx'));
const ThemeSettingDrawer = lazy(() => import("@/Components/ThemeSettingDrawer.jsx"));

import axios from 'axios';

// Optimized loading component with skeleton
const LoadingFallback = React.memo(({ type = 'default' }) => {
    const skeletonStyles = {
        default: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        header: { height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', margin: '8px' },
        sidebar: { height: '100%', width: '280px', background: 'rgba(255,255,255,0.05)' },
        content: { height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', margin: '8px' }
    };

    return (
        <Box sx={skeletonStyles[type]}>
            {type === 'default' && (
                <div className="animate-pulse">
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                </div>
            )}
        </Box>
    );
});

LoadingFallback.displayName = 'LoadingFallback';

/**
 * Main App Layout Component
 * Optimized for performance with memoization, virtualization and efficient state management
 */
function App({ children }) {
    // ===== STATE MANAGEMENT =====
    const [sessionExpired, setSessionExpired] = useState(false);
    const [scrolled, setScrolled] = useState(false); // Track scroll position for shadow effect
    let { auth, url, csrfToken } = usePage().props;
    
    // Memoize auth to prevent unnecessary re-renders
    const memoizedAuth = useMemo(() => ({
        user: auth?.user,
        permissions: auth?.permissions,
        id: auth?.user?.id,
        permissionCount: auth?.permissions?.length
    }), [auth?.user?.id, auth?.permissions?.length]);
    
    // Initialize persistent state with localStorage (only once per app lifecycle)
    const [sideBarOpen, setSideBarOpen] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebar-open');
            return saved !== null ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });
    
    const [darkMode, setDarkMode] = useState(() => {
        try {
            return localStorage.getItem('darkMode') === 'true';
        } catch {
            return false;
        }
    });
    
    const [themeColor, setThemeColor] = useState(() => {
        try {
            const stored = localStorage.getItem('themeColor');
            return stored ? JSON.parse(stored) : {
                name: "OCEAN", 
                primary: "#0ea5e9", 
                secondary: "#0284c7",
                gradient: "from-sky-500 to-blue-600",
                description: "Ocean Blue - Professional & Trustworthy"
            };
        } catch {
            return {
                name: "OCEAN", 
                primary: "#0ea5e9", 
                secondary: "#0284c7",
                gradient: "from-sky-500 to-blue-600",
                description: "Ocean Blue - Professional & Trustworthy"
            };
        }
    });
    
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
    const [bottomNavHeight, setBottomNavHeight] = useState(0);
    const [loading, setLoading] = useState(false);

    // Persistent refs
    const contentRef = useRef(null);
    const mainContentRef = useRef(null); // Reference for scroll shadow effect
    const sessionCheckRef = useRef(null);
    const layoutInitialized = useRef(false);

    // ===== MEMOIZED COMPUTATIONS =====
    // Memoize permissions and pages - critical for performance
    const permissions = useMemo(() => memoizedAuth?.permissions || [], [memoizedAuth?.permissions]);
    
    const pages = useMemo(() => {
        const isSettingsPage = url.startsWith('/settings') || url.includes('settings');
        return isSettingsPage ? getSettingsPages(permissions, memoizedAuth) : getPages(permissions, memoizedAuth);
    }, [url, permissions, memoizedAuth]);

    // Theme and media query
    const theme = useTheme(darkMode, themeColor);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // ===== OPTIMIZED TOGGLE HANDLERS =====
    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const newValue = !prev;
            // Use RAF for smoother UI updates
            requestAnimationFrame(() => {
                localStorage.setItem('darkMode', newValue);
            });
            return newValue;
        });
    }, []);
    
    const toggleThemeColor = useCallback((color) => {
        setThemeColor(color);
        requestAnimationFrame(() => {
            localStorage.setItem('themeColor', JSON.stringify(color));
        });
    }, []);
    
    const toggleThemeDrawer = useCallback(() => {
        setThemeDrawerOpen(prev => !prev);
    }, []);
    
    const toggleSideBar = useCallback(() => {
        setSideBarOpen(prev => {
            const newValue = !prev;
            // Use RAF for smoother animations
            requestAnimationFrame(() => {
                localStorage.setItem('sidebar-open', JSON.stringify(newValue));
            });
            return newValue;
        });
    }, []);

  
    // ===== INITIALIZATION EFFECTS =====
    // Initialize Firebase only when user is authenticated (one-time setup)
    useEffect(() => {
        if (!memoizedAuth?.user || layoutInitialized.current) return;

        let mounted = true;
        
        const loadFirebase = async () => {
            try {
                const { initFirebase } = await import("@/utils/firebaseInit.js");
                if (mounted) {
                    await initFirebase();
                    layoutInitialized.current = true;
                }
            } catch (error) {
                console.warn('Firebase initialization failed:', error);
            }
        };

        loadFirebase();
        
        return () => {
            mounted = false;
        };
    }, [memoizedAuth?.user?.id]);

    // Apply theme to root with optimized scheduling
    useEffect(() => {
        // Apply theme immediately
        applyThemeToRoot(themeColor, darkMode);
        
        // Initialize background pattern from localStorage
        const savedBackground = localStorage.getItem('aero-hr-background');
        const backgroundPattern = savedBackground || 'pattern-glass-1'; 
        
        // Apply background pattern immediately
        document.documentElement.setAttribute('data-background', backgroundPattern);
        
        // Apply theme mode for background variations
        document.body.setAttribute('data-theme-mode', darkMode ? 'dark' : 'light');
        
        // Force immediate background application with theme colors for overlays
        const root = document.documentElement;
        root.style.setProperty('--theme-primary-rgb', hexToRgb(themeColor.primary));
        root.style.setProperty('--theme-secondary-rgb', hexToRgb(themeColor.secondary));
        root.style.setProperty('--theme-primary', themeColor.primary);
        root.style.setProperty('--theme-secondary', themeColor.secondary);
    }, [darkMode, themeColor]);

    // Helper function to convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `${r}, ${g}, ${b}`;
        }
        return '14, 165, 233'; // fallback to ocean blue
    };
    
    // Session check with optimized interval (persistent across navigations)
    useEffect(() => {
        if (!memoizedAuth?.user) return;

        const checkSession = async () => {
            try {
                const response = await axios.get('/session-check');
                if (!response.data.authenticated) {
                    setSessionExpired(true);
                    if (sessionCheckRef.current) {
                        clearInterval(sessionCheckRef.current);
                        sessionCheckRef.current = null;
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
                setSessionExpired(true);
                if (sessionCheckRef.current) {
                    clearInterval(sessionCheckRef.current);
                    sessionCheckRef.current = null;
                }
            }
        };

        // Initial check after 10 seconds, then every 30 seconds
        const initialTimeout = setTimeout(() => {
            checkSession();
            sessionCheckRef.current = setInterval(checkSession, 30000);
        }, 10000);

        return () => {
            clearTimeout(initialTimeout);
            if (sessionCheckRef.current) {
                clearInterval(sessionCheckRef.current);
            }
        };
    }, [memoizedAuth?.user?.id]);
        
    // CSRF token setup (persistent)
    useEffect(() => {
        if (csrfToken) {
            document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', csrfToken);
            axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
        }
    }, [csrfToken]);

    // Inertia loading state with throttling (optimized for SPA navigation)
    useEffect(() => {
        let loadingTimeout;
        
        const start = () => {
            // Only show loading for longer operations
            loadingTimeout = setTimeout(() => setLoading(true), 250);
        };
        
        const finish = () => {
            clearTimeout(loadingTimeout);
            setLoading(false);
        };
        
        const unStart = Inertia.on('start', start);
        const unFinish = Inertia.on('finish', finish);
        
        return () => {
            clearTimeout(loadingTimeout);
            unStart();
            unFinish();
        };
    }, []);

   

    // Hide app loading screen with improved timing (one-time initialization)
    useEffect(() => {
        if (memoizedAuth?.user && window.AppLoader) {
            // Give components time to mount and render
            const timer = setTimeout(() => {
                window.AppLoader.updateLoadingMessage('Almost ready...', 'Loading your dashboard');
                
                // Final hide after a brief moment
                setTimeout(() => {
                    window.AppLoader.hideLoading();
                }, 300);
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [memoizedAuth?.user]);

    // ===== MEMOIZED LAYOUT COMPONENTS =====
    // These components are memoized to prevent re-rendering on page navigation
    const headerContent = useMemo(() => (
        memoizedAuth?.user ? (
            <Suspense fallback={<LoadingFallback type="header" />}>
                <Header
                    url={url}
                    pages={pages}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    toggleThemeDrawer={toggleThemeDrawer}
                    sideBarOpen={sideBarOpen}
                    toggleSideBar={toggleSideBar}
                    themeDrawerOpen={themeDrawerOpen}
                />
            </Suspense>
        ) : null
    ), [url, pages, darkMode, toggleDarkMode, toggleThemeDrawer, sideBarOpen, toggleSideBar, themeDrawerOpen, memoizedAuth?.user]);

    const sidebarContent = useMemo(() => (
        memoizedAuth?.user ? (
            <Suspense fallback={<LoadingFallback type="sidebar" />}>
                <Sidebar 
                    url={url} 
                    pages={pages} 
                    toggleSideBar={toggleSideBar}
                    sideBarOpen={sideBarOpen}
                />
            </Suspense>
        ) : null
    ), [url, pages, toggleSideBar, sideBarOpen, memoizedAuth?.user]);

    const breadcrumbContent = useMemo(() => (
        memoizedAuth?.user ? (
            <Suspense fallback={null}>
                <Breadcrumb />
            </Suspense>
        ) : null
    ), [memoizedAuth?.user]);

    const bottomNavContent = useMemo(() => (
        memoizedAuth?.user && isMobile ? (
            <Suspense fallback={null}>
                <BottomNav
                    setBottomNavHeight={setBottomNavHeight}
                    contentRef={contentRef}
                    auth={memoizedAuth}
                    toggleSideBar={toggleSideBar}
                    sideBarOpen={sideBarOpen}
                />
            </Suspense>
        ) : null
    ), [memoizedAuth?.user, isMobile, setBottomNavHeight, toggleSideBar, sideBarOpen]);

    // ===== RENDER =====
    return (
        <ThemeProvider theme={theme}>
            <HeroUIProvider>
                {/* Global modals and overlays */}
                {sessionExpired && (
                    <Suspense fallback={null}>
                        <SessionExpiredModal setSessionExpired={setSessionExpired}/>
                    </Suspense>
                )}
                
                <Suspense fallback={null}>
                    <ThemeSettingDrawer
                        toggleThemeColor={toggleThemeColor}
                        themeColor={themeColor}
                        darkMode={darkMode}
                        toggleDarkMode={toggleDarkMode}
                        toggleThemeDrawer={toggleThemeDrawer}
                        themeDrawerOpen={themeDrawerOpen}
                    />
                </Suspense>
                
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                
                <CssBaseline />
                
                {/* Main layout container */}
                <main id="app-main" className={darkMode ? "dark" : "light"}>
                    
                    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                        {/* Mobile overlay */}
                        {isMobile && sideBarOpen && (
                            <Box
                                onClick={toggleSideBar}
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    zIndex: 1199,
                                    transition: 'opacity 0.2s ease',
                                    willChange: 'opacity',
                                }}
                            />
                        )}
                        
                        {/* Persistent Sidebar */}
                        {sidebarContent && (
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    height: '100vh',
                                    zIndex: 1200,
                                    width: '280px',
                                    transform: sideBarOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    willChange: 'transform',
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    WebkitOverflowScrolling: 'touch',
                                }}
                            >
                                {sidebarContent}
                            </Box>
                        )}

                        {/* Main content area - this is where page content updates */}
                        <Box
                            ref={contentRef}
                            sx={{
                                pb: `${bottomNavHeight}px`,
                                display: 'flex',
                                flex: 1,
                                transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginLeft: { 
                                    xs: 0, 
                                    md: sideBarOpen ? '280px' : '0' 
                                },
                                width: { 
                                    xs: '100%', 
                                    md: sideBarOpen ? 'calc(100% - 280px)' : '100%' 
                                },
                                minWidth: 0,
                                maxWidth: '100vw',
                                willChange: 'margin, width',
                                flexDirection: 'column',
                                height: '100vh',
                                overflow: 'hidden', // Changed from 'auto' to 'hidden'
                                position: 'relative',
                            }}
                        >
                        

                            {/* Persistent Header */}
                            <Box
                                sx={{
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 5,
                                
                                }}
                            >
                                {headerContent}
                                {breadcrumbContent}
                            </Box>
                            
                            {/* Dynamic page content - ONLY this section re-renders on navigation */}
                            <Box
                                ref={mainContentRef}
                                component="section"
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'auto',
                                    position: 'relative',
                                    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: theme => theme.palette.mode === 'dark' 
                                            ? 'rgba(255,255,255,0.2)' 
                                            : 'rgba(0,0,0,0.2)',
                                        borderRadius: '3px',
                                    },
                                }}
                                role="main"
                                aria-label="Main content"
                              
                            >
                                <ScrollShadow>
                                    {children}
                                </ScrollShadow>
                                
                            </Box>
                            
                           
                            
                            {/* Persistent Bottom Navigation */}
                            {bottomNavContent}
                        </Box>
                    </Box>
                </main>
            </HeroUIProvider>
        </ThemeProvider>
    );
}

// Export with memo to prevent unnecessary re-renders
export default React.memo(App);