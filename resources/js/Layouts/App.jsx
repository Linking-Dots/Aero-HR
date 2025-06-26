import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import BottomNav from "@/Layouts/BottomNav.jsx";
import { usePage } from "@inertiajs/react";
import useTheme from "@/theme.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/theme-transitions.css';
import Sidebar from "@/Layouts/Sidebar.jsx";
import { Inertia } from '@inertiajs/inertia';
import { getPages } from '@/Props/pages.jsx';
import { getSettingsPages } from '@/Props/settings.jsx';
import { HeroUIProvider } from "@heroui/react";
import { onMessageListener, requestNotificationPermission } from "@/firebase-config.js";
import ThemeSettingDrawer from "@/Components/ThemeSettingDrawer.jsx";
import { applyThemeToRoot } from "@/utils/themeUtils.js";
import { usePerformance } from "@/hooks/usePerformance.jsx";


import axios from 'axios';

const useAppLoader = (auth) => {
    useEffect(() => {
        let unsubscribeOnMessage = null;

        const initializeFirebase = async () => {
            try {
                // Request notification permission and get token
                const token = await requestNotificationPermission();
                if (token) {
                    try {
                        const response = await axios.post(route('updateFcmToken'), { fcm_token: token });
                        if (response.status === 200) {
                            console.log('FCM Token Updated:', response.data.fcm_token);
                        }
                    } catch (error) {
                        console.error('Failed to update FCM token:', error);
                    }
                } else {
                    console.warn('Notification permission denied or no token retrieved.');
                }

                // Listen for foreground messages
                unsubscribeOnMessage = onMessageListener()
                    .then(payload => {
                        console.log('Message received:', payload);
                        const { title, body, icon } = payload.notification;

                        // Display desktop notification
                        if (Notification.permission === 'granted') {
                            new Notification(title, { body, icon });
                        }

                        // Also show in-app alert (optional)
                        alert(`${title}: ${body}`);
                    })
                    .catch(err => console.error('onMessageListener error:', err));
            } catch (err) {
                console.error('Firebase initialization error:', err);
            }
        };

        initializeFirebase();

        // Signal that React app is ready
        if (window.AppLoader) {
            const timer = setTimeout(() => {
                window.AppLoader.hideLoading();
            }, 200);
            return () => clearTimeout(timer);
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeOnMessage && typeof unsubscribeOnMessage === 'function') {
                unsubscribeOnMessage(); // Firebase unsubscribe (if using Firebase v9+ with listeners)
            }
        };
    }, [auth]);
};

function App({ children }) {
    const { auth, url, csrfToken } = usePage().props;
    useEffect(() =>  {
        if(csrfToken) {
            document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', csrfToken);
            axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
        }
    })
    useAppLoader(auth);
    usePerformance();
    

    const permissions = auth?.permissions || [];
    
    // Initialize sidebar state with localStorage
    const [sideBarOpen, setSideBarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebar-open');
        return saved !== null ? JSON.parse(saved) : false;
    });
    
    // Initialize theme state with localStorage
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [themeColor, setThemeColor] = useState(() => {
        const stored = localStorage.getItem('themeColor');
        return stored ? JSON.parse(stored) : {
            name: "OCEAN", 
            primary: "#0ea5e9", 
            secondary: "#0284c7",
            gradient: "from-sky-500 to-blue-600",
            description: "Ocean Blue - Professional & Trustworthy"
        };
    });
    
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

    const contentRef = useRef(null);
    const [bottomNavHeight, setBottomNavHeight] = useState(0);
    const [loading, setLoading] = useState(false);

    // Memoize pages to avoid unnecessary recalculations
    const pages = useMemo(() => {
        // Check if the current URL is specifically a settings page
        // You can adjust this condition based on your actual settings routes
        const isSettingsPage = url.startsWith('/settings') || 
                              url.includes('settings') || 
                              url === '/settings';
        
        return isSettingsPage ? getSettingsPages(permissions, auth) : getPages(permissions, auth);
    }, [url, permissions]);

    // Theme and media query
    const theme = useTheme(darkMode, themeColor);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));    // Persist darkMode, themeColor, and sidebar state
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        localStorage.setItem('themeColor', JSON.stringify(themeColor));
        localStorage.setItem('sidebar-open', JSON.stringify(sideBarOpen));
        
        // Apply theme to document root
        applyThemeToRoot(themeColor, darkMode);
    }, [darkMode, themeColor, sideBarOpen]);

    // Memoize toggle handlers to prevent unnecessary re-renders
    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const newValue = !prev;
            localStorage.setItem('darkMode', newValue);
            return newValue;
        });
    }, []);
    
    const toggleThemeColor = useCallback((color) => {
        setThemeColor(color);
        localStorage.setItem('themeColor', JSON.stringify(color));
    }, []);
    
    const toggleThemeDrawer = useCallback(() => {
        setThemeDrawerOpen(prev => !prev);
    }, []);
    
    const toggleSideBar = useCallback(() => {
        setSideBarOpen(prev => {
            const newState = !prev;
            localStorage.setItem('sidebar-open', JSON.stringify(newState));
            return newState;
        });
    }, []);

    // Inertia loading state
    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);
        const unStart = Inertia.on('start', start);
        const unFinish = Inertia.on('finish', finish);
        return () => {
            unStart();
            unFinish();
        };
    }, []);



        
    return (
        
        <ThemeProvider theme={theme}>
            <ThemeSettingDrawer
                toggleThemeColor={toggleThemeColor}
                themeColor={themeColor}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                toggleThemeDrawer={toggleThemeDrawer}
                themeDrawerOpen={themeDrawerOpen}
            />
            <HeroUIProvider>
                <main className={darkMode ? "dark" : "light"}>
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
                    {/*{loading && <Loader/>}*/}                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            height: '100vh',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >                        {/* Mobile Sidebar Overlay */}
                        {auth.user && isMobile && (
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    zIndex: 1199,
                                    opacity: sideBarOpen ? 1 : 0,
                                    visibility: sideBarOpen ? 'visible' : 'hidden',
                                    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    pointerEvents: sideBarOpen ? 'auto' : 'none',
                                }}
                                onClick={toggleSideBar}
                            />
                        )}                        {/* Mobile Sidebar */}
                        {auth.user && isMobile && (
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    zIndex: 1300,
                                    transform: sideBarOpen ? 'translateX(0)' : 'translateX(-100%)',
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    pointerEvents: sideBarOpen ? 'auto' : 'none',
                                }}
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        toggleSideBar();
                                    }
                                }}
                            >                                <Box
                                    sx={{
                                        width: 'fit-content',
                                        minWidth: '240px',
                                        maxWidth: '280px',
                                        height: '100vh',
                                        transform: sideBarOpen ? 'translateX(0)' : 'translateX(-100%)',
                                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                >
                                    <Sidebar 
                                        url={url} 
                                        pages={pages} 
                                        toggleSideBar={toggleSideBar}
                                        sideBarOpen={sideBarOpen}
                                    />
                                </Box>
                            </Box>
                        )}                        {/* Desktop Sidebar Area */}
                        {auth.user && (
                            <Box
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    height: '100vh',
                                    zIndex: 1200,
                                    width: sideBarOpen ? '280px' : '72px',
                                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                                    overflow: 'hidden',
                                    display: { xs: 'none', md: 'block' },
                                    backgroundColor: 'background.paper',
                                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                                    borderRight: '1px solid',
                                    borderColor: 'divider',
                                    willChange: 'width',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '280px',
                                        height: '100vh',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        overflowX: 'hidden',
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: 'transparent',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            borderRadius: '3px',
                                        },
                                    }}
                                >
                                    <Sidebar 
                                        url={url} 
                                        pages={pages} 
                                        toggleSideBar={toggleSideBar}
                                        sideBarOpen={sideBarOpen}
                                    />
                                </Box>
                            </Box>
                        )}

                        {/* Main Content Area */}
                        <Box
                            ref={contentRef}
                            sx={{
                                pb: `${bottomNavHeight}px`,
                                display: 'flex',
                                flex: 1,
                                transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginLeft: { 
                                    xs: 0, 
                                    md: sideBarOpen ? '280px' : '72px' 
                                },
                                width: { 
                                    xs: '100%', 
                                    md: sideBarOpen ? 'calc(100% - 280px)' : 'calc(100% - 72px)' 
                                },
                                minWidth: 0, // Prevent flex-shrink issues
                                willChange: 'margin, width',
                                backfaceVisibility: 'hidden',
                                transform: 'translateZ(0)',
                                WebkitFontSmoothing: 'subpixel-antialiased',
                                flexDirection: 'column',
                                height: '100vh',
                                overflow: 'auto',
                            }}
                        >
                            {auth.user && (
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
                            )}
                            {auth.user && <Breadcrumb />}
                            {children}
                            {auth.user && isMobile && (
                                <BottomNav
                                    setBottomNavHeight={setBottomNavHeight}
                                    contentRef={contentRef}
                                    auth={auth}
                                    toggleSideBar={toggleSideBar}
                                    sideBarOpen={sideBarOpen}
                                />
                            )}
                        </Box>
                    </Box>
                </main>
            </HeroUIProvider>
        </ThemeProvider>
    );
}

export default App;
