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

// Lazy load heavy components
const Header = lazy(() => import("@/Layouts/Header.jsx"));
const Breadcrumb = lazy(() => import("@/Components/Breadcrumb.jsx"));
const BottomNav = lazy(() => import("@/Layouts/BottomNav.jsx"));
const Sidebar = lazy(() => import("@/Layouts/Sidebar.jsx"));
const SessionExpiredModal = lazy(() => import('@/Components/SessionExpiredModal.jsx'));
const ThemeSettingDrawer = lazy(() => import("@/Components/ThemeSettingDrawer.jsx"));

// Lazy load Firebase functions only when needed
const initializeFirebase = lazy(() => import("@/utils/firebaseInit.js"));

import axios from 'axios';

// Memoized loading component
const LoadingFallback = React.memo(() => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div>Loading...</div>
    </Box>
));

function App({ children }) {
    const [sessionExpired, setSessionExpired] = useState(false);
    let { auth, url, csrfToken } = usePage().props;
    
    // Memoize auth to prevent unnecessary re-renders
    const memoizedAuth = useMemo(() => auth, [auth?.user?.id, auth?.permissions?.length]);
    
    // Initialize sidebar state with localStorage (only once)
    const [sideBarOpen, setSideBarOpen] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebar-open');
            return saved !== null ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });
    
    // Initialize theme state with localStorage (only once)
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

    const contentRef = useRef(null);
    const sessionCheckRef = useRef(null);

    // Memoize permissions and pages
    const permissions = useMemo(() => memoizedAuth?.permissions || [], [memoizedAuth?.permissions]);
    
    const pages = useMemo(() => {
        const isSettingsPage = url.startsWith('/settings') || url.includes('settings');
        return isSettingsPage ? getSettingsPages(permissions, memoizedAuth) : getPages(permissions, memoizedAuth);
    }, [url, permissions, memoizedAuth]);

    // Theme and media query
    const theme = useTheme(darkMode, themeColor);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Optimized toggle handlers with batched state updates
    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const newValue = !prev;
            // Batch localStorage update
            requestIdleCallback(() => {
                localStorage.setItem('darkMode', newValue);
            });
            return newValue;
        });
    }, []);
    
    const toggleThemeColor = useCallback((color) => {
        setThemeColor(color);
        requestIdleCallback(() => {
            localStorage.setItem('themeColor', JSON.stringify(color));
        });
    }, []);
    
    const toggleThemeDrawer = useCallback(() => {
        setThemeDrawerOpen(prev => !prev);
    }, []);
    
    const toggleSideBar = useCallback(() => {
        setSideBarOpen(prev => {
            const newValue = !prev;
            // Batch localStorage update
            requestIdleCallback(() => {
                localStorage.setItem('sidebar-open', JSON.stringify(newValue));
            });
            return newValue;
        });
    }, []);

    // Initialize Firebase only when user is authenticated
    useEffect(() => {
        if (!memoizedAuth?.user) return;

        let mounted = true;
        
        const loadFirebase = async () => {
            try {
                const { initFirebase } = await import("@/utils/firebaseInit.js");
                if (mounted) {
                    await initFirebase();
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

    // Optimized theme application
    useEffect(() => {
        requestIdleCallback(() => {
            applyThemeToRoot(themeColor, darkMode);
        });
    }, [darkMode, themeColor]);
    
    // Session check with optimized interval
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
        
    // CSRF token setup
    useEffect(() => {
        if (csrfToken) {
            document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', csrfToken);
            axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
        }
    }, [csrfToken]);

    // Inertia loading state with throttling
    useEffect(() => {
        let loadingTimeout;
        
        const start = () => {
            loadingTimeout = setTimeout(() => setLoading(true), 150); // Delay to avoid flicker
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

    // Hide app loading screen
    useEffect(() => {
        if (memoizedAuth?.user && window.AppLoader) {
            const timer = setTimeout(() => {
                window.AppLoader.hideLoading();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [memoizedAuth?.user]);

    // Memoized sidebar content
    const sidebarContent = useMemo(() => (
        <Suspense fallback={<LoadingFallback />}>
            <Sidebar 
                url={url} 
                pages={pages} 
                toggleSideBar={toggleSideBar}
                sideBarOpen={sideBarOpen}
            />
        </Suspense>
    ), [url, pages, toggleSideBar, sideBarOpen]);

    return (
        <ThemeProvider theme={theme}>
            <HeroUIProvider>
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
                                }}
                            />
                        )}
                        
                        {/* Sidebar */}
                        {memoizedAuth?.user && (
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    height: '100vh',
                                    zIndex: 1200,
                                    width: '280px',
                                    transform: sideBarOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
                                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    willChange: 'transform',
                                    backfaceVisibility: 'hidden',
                                }}
                            >
                                {sidebarContent}
                            </Box>
                        )}

                        {/* Main content */}
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
                                willChange: 'margin',
                                flexDirection: 'column',
                                height: '100vh',
                                overflow: 'auto',
                                position: 'relative',
                            }}
                        >
                            {memoizedAuth?.user && (
                                <Suspense fallback={<LoadingFallback />}>
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
                            )}
                            
                            {memoizedAuth?.user && (
                                <Suspense fallback={null}>
                                    <Breadcrumb />
                                </Suspense>
                            )}
                            
                            {children}
                            
                            {memoizedAuth?.user && isMobile && (
                                <Suspense fallback={null}>
                                    <BottomNav
                                        setBottomNavHeight={setBottomNavHeight}
                                        contentRef={contentRef}
                                        auth={memoizedAuth}
                                        toggleSideBar={toggleSideBar}
                                        sideBarOpen={sideBarOpen}
                                    />
                                </Suspense>
                            )}
                        </Box>
                    </Box>
                </main>
            </HeroUIProvider>
        </ThemeProvider>
    );
}

export default React.memo(App);
