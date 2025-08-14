import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from '@inertiajs/react';
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
import { HeroUIProvider, Button } from "@heroui/react";
import SessionExpiredModal from '@/Components/SessionExpiredModal.jsx';
import { onMessageListener, requestNotificationPermission } from "@/firebase-config.js";
import ThemeSettingDrawer from "@/Components/ThemeSettingDrawer.jsx";


import axios from 'axios';





function App({ children }) {
    const [sessionExpired, setSessionExpired] = useState(false);
    let appRenderCount = 0;
    let { auth, url, csrfToken } = usePage().props;
    auth = useMemo(() => auth, [JSON.stringify(auth)]);
    const appLoader = useCallback(() => {
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


    const permissions = auth?.permissions || [];

    
    // Initialize sidebar state with localStorage
    const [sideBarOpen, setSideBarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebar-open');
        return saved !== null ? JSON.parse(saved) : false;
    });
    
    // Initialize theme state with localStorage
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [themeId, setThemeId] = useState(() => localStorage.getItem('themeId') || 'default');
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
    const theme = useTheme(darkMode ? 'dark' : 'light', themeId);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));    // Persist darkMode, themeColor, and sidebar state
    
    

    // Memoize toggle handlers to prevent unnecessary re-renders
    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const newValue = !prev;
            localStorage.setItem('darkMode', newValue);
            return newValue;
        });
    }, []);
    
    const handleSetThemeId = useCallback((id) => {
        setThemeId(id);
        localStorage.setItem('themeId', id);
    }, []);

    const toggleThemeDrawer = useCallback(() => {
        setThemeDrawerOpen(prev => !prev);
    }, []);
    
    const toggleSideBar = useCallback(() => {
        // Use requestAnimationFrame for smoother animation start
        requestAnimationFrame(() => {
            setSideBarOpen(prev => !prev);
        });
    }, []);

    // Memoize sidebar content to prevent re-renders
    const sidebarContent = useMemo(() => (
        <Sidebar 
            url={url} 
            pages={pages} 
            toggleSideBar={toggleSideBar}
            sideBarOpen={sideBarOpen}
        />
    ), [pages, toggleSideBar, sideBarOpen]);


    

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        localStorage.setItem('themeId', themeId);
        localStorage.setItem('sidebar-open', JSON.stringify(sideBarOpen));
        
     
    }, [darkMode, themeId, sideBarOpen]);

    useEffect(() => {
        if (!auth.user) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const response = await axios.get('/session-check');
                if (!response.data.authenticated) {
                    setSessionExpired(true);
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Session check failed:', error);
                setSessionExpired(true);
                clearInterval(interval);
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [auth.user]);
    
  
    useEffect(() => {
        if (csrfToken) {
            document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', csrfToken);
            axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
        }
    }, [csrfToken]);

    useEffect(() => {
        appLoader();
    }, [appLoader]);

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

    appRenderCount++;
    console.log('App render count:', appRenderCount);

            
return (
        <ThemeProvider theme={theme}>
            <HeroUIProvider>
                {sessionExpired && <SessionExpiredModal setSessionExpired={setSessionExpired}/>}
                <ThemeSettingDrawer
                    themeId={themeId}
                    setThemeId={handleSetThemeId}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    themeDrawerOpen={themeDrawerOpen}
                    toggleThemeDrawer={toggleThemeDrawer}
                />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme={darkMode ? "dark" : "light"}
                />
                <CssBaseline />
                <main id="app-main" className={darkMode ? "dark" : "light"}>
                    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                        {/* Overlay for mobile sidebar */}
                        {isMobile && (
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
                                    opacity: sideBarOpen ? 1 : 0,
                                    visibility: sideBarOpen ? 'visible' : 'hidden',
                                    transition: 'opacity 0.2s ease',
                                    pointerEvents: sideBarOpen ? 'auto' : 'none',
                                }}
                            />
                        )}
                        {/* Desktop Sidebar Area */}
                        {auth.user && (
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
                        {/* Main Content Area */}
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
                                    md: sideBarOpen ? `calc(100% - 280px)` : '100%'
                                },
                                minWidth: 0, // Prevent flex-shrink issues
                                willChange: 'margin',
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
