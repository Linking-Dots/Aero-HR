import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { usePage } from "@inertiajs/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Inertia } from '@inertiajs/inertia';
import { HeroUIProvider } from "@heroui/react";
import { onMessageListener, requestNotificationPermission } from "@/firebase-config.js";
import axios from 'axios';

// Legacy imports (to be migrated)
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import Sidebar from "@/Layouts/Sidebar.jsx";
import ThemeSettingDrawer from "@/Components/ThemeSettingDrawer.jsx";
import useTheme from "@/theme.jsx";
import { getPages } from '@/Props/pages.jsx';
import { getSettingsPages } from '@/Props/settings.jsx';

// New structure imports
import { BottomNav } from '@components';

/**
 * App Loader Hook - Atomic Design: Template Utility
 * 
 * Manages the application loading state and signals when React app is ready.
 * Integrates with window.AppLoader for smooth loading experience.
 * 
 * @hook
 */
const useAppLoader = () => {
    useEffect(() => {
        // Signal that React app is ready
        if (window.AppLoader) {
            // Small delay to ensure all components are mounted
            const timer = setTimeout(() => {
                window.AppLoader.hideLoading();
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, []);
};

/**
 * App Layout Component - Atomic Design: Template
 * 
 * Main application layout template that provides the overall structure for the ERP system.
 * Manages global state, theme, authentication, and navigation layout.
 * 
 * Features:
 * - Responsive layout with mobile and desktop navigation
 * - Theme management (dark/light mode + custom colors)
 * - Sidebar state persistence
 * - Firebase Cloud Messaging integration
 * - Inertia.js loading states
 * - ISO 25010 compliant structure
 * 
 * Layout Structure:
 * - ThemeProvider (Material-UI)
 * - HeroUIProvider (NextUI)
 * - ToastContainer (Notifications)
 * - Sidebar (Desktop + Mobile overlay)
 * - Main Content Area (Header + Breadcrumb + Children + BottomNav)
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render
 * @returns {JSX.Element} Rendered App layout
 * 
 * @example
 * <AppLayout>
 *   <Dashboard />
 * </AppLayout>
 */
function AppLayout({ children }) {
    useAppLoader();
    const { auth, url } = usePage().props;
    const permissions = auth.permissions;

    // State Management
    const [sideBarOpen, setSideBarOpen] = useState(() => {
        // Load sidebar state from localStorage with fallback
        const saved = localStorage.getItem('sidebar-open');
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
    
    const [darkMode, setDarkMode] = useState(() => 
        localStorage.getItem('darkMode') === 'true'
    );
    
    const [themeColor, setThemeColor] = useState(() => {
        const stored = localStorage.getItem('themeColor');
        return stored
            ? JSON.parse(stored)
            : { 
                name: "DEFAULT", 
                className: "bg-blue-600/25 text-blue-600 font-bold", 
                backgroundColor: darkMode ? 'rgba(31, 38, 59, 0.55)' : 'rgba(255, 255, 255, 0.60)' 
            };
    });

    const [bottomNavHeight, setBottomNavHeight] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Refs
    const contentRef = useRef(null);

    // Memoized Values
    const pages = useMemo(() => {
        // Check if the current URL is specifically a settings page
        const isSettingsPage = url.startsWith('/settings') || 
                              url.includes('settings') || 
                              url === '/settings';
        
        return isSettingsPage ? getSettingsPages() : getPages(permissions);
    }, [url, permissions]);

    // Theme and responsive detection
    const theme = useTheme(darkMode, themeColor);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Event Handlers (useCallback for stable references)
    const toggleDarkMode = useCallback(() => setDarkMode(dm => !dm), []);
    const toggleThemeColor = useCallback(color => setThemeColor(color), []);
    const toggleThemeDrawer = useCallback(() => setThemeDrawerOpen(open => !open), []);
    const toggleSideBar = useCallback(() => setSideBarOpen(open => !open), []);

    // Effects
    
    // Persist user preferences
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        localStorage.setItem('themeColor', JSON.stringify(themeColor));
        localStorage.setItem('sidebar-open', JSON.stringify(sideBarOpen));
    }, [darkMode, themeColor, sideBarOpen]);

    // Inertia loading state management
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

    // Firebase Cloud Messaging setup
    useEffect(() => {
        const setupFCM = async () => {
            try {
                const token = await requestNotificationPermission();
                if (token) {
                    const response = await axios.post(route('updateFcmToken'), { 
                        fcm_token: token 
                    });
                    if (response.status === 200) {
                        console.log('FCM Token updated:', response.data.fcm_token);
                    }
                }
            } catch (error) {
                console.error('FCM setup error:', error);
            }
        };

        setupFCM();

        // Listen for incoming messages
        onMessageListener()
            .then(payload => {
                console.log('FCM Message received:', payload);
                // TODO: Replace alert with proper notification component
                alert(`${payload.notification.title}: ${payload.notification.body}`);
            })
            .catch(err => console.log('FCM listener failed:', err));
    }, []);

    return (
        <ThemeProvider theme={theme}>
            {/* Theme Settings Drawer */}
            <ThemeSettingDrawer
                toggleThemeColor={toggleThemeColor}
                themeColor={themeColor}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                toggleThemeDrawer={toggleThemeDrawer}
                themeDrawerOpen={themeDrawerOpen}
            />
            
            <HeroUIProvider>
                <main 
                    className={darkMode ? "dark" : "light"}
                    role="main"
                    aria-label="Glass ERP Application"
                >
                    {/* Global Toast Notifications */}
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
                        toastClassName="toast-container"
                    />
                    
                    {/* Material-UI CSS Baseline */}
                    <CssBaseline />
                    
                    {/* Global Loading Indicator */}
                    {/*{loading && <Loader/>}*/}
                    
                    {/* Main Layout Container */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            height: '100vh',
                            overflow: 'hidden',
                        }}
                        component="div"
                        role="application"
                    >
                        {/* Mobile Sidebar Overlay */}
                        {isMobile && sideBarOpen && (
                            <Sidebar 
                                url={url} 
                                pages={pages} 
                                toggleSideBar={toggleSideBar}
                                sideBarOpen={sideBarOpen}
                                aria-label="Mobile navigation sidebar"
                            />
                        )}

                        {/* Desktop Sidebar Area */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                height: '100vh',
                                width: sideBarOpen ? 280 : 0,
                                transition: theme.transitions.create('width', {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.enteringScreen,
                                }),
                                flexDirection: 'column',
                                overflow: 'hidden',
                                zIndex: theme.zIndex.drawer,
                            }}
                            component="aside"
                            role="navigation"
                            aria-label="Desktop navigation sidebar"
                        >
                            <Sidebar 
                                url={url} 
                                pages={pages} 
                                toggleSideBar={toggleSideBar}
                                sideBarOpen={sideBarOpen}
                            />
                        </Box>

                        {/* Main Content Area */}
                        <Box
                            ref={contentRef}
                            sx={{
                                pb: `${bottomNavHeight}px`,
                                display: 'flex',
                                flex: 1,
                                flexDirection: 'column',
                                height: '100vh',
                                overflow: 'auto',
                                position: 'relative',
                            }}
                            component="section"
                            role="main"
                            aria-label="Main content area"
                        >
                            {/* Header (Desktop + Mobile) */}
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
                            
                            {/* Breadcrumb Navigation */}
                            {auth.user && <Breadcrumb />}
                            
                            {/* Page Content */}
                            <Box
                                component="div"
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    position: 'relative',
                                }}
                                role="region"
                                aria-label="Page content"
                            >
                                {children}
                            </Box>
                            
                            {/* Mobile Bottom Navigation */}
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

export default AppLayout;
