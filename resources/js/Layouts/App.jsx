import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import BottomNav from "@/Layouts/BottomNav.jsx";
import { usePage } from "@inertiajs/react";
import useTheme from "@/theme.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "@/Layouts/Sidebar.jsx";
import { Inertia } from '@inertiajs/inertia';
import { getPages } from '@/Props/pages.jsx';
import { getSettingsPages } from '@/Props/settings.jsx';
import { HeroUIProvider } from "@heroui/react";
import { onMessageListener, requestNotificationPermission } from "@/firebase-config.js";
import ThemeSettingDrawer from "@/Components/ThemeSettingDrawer.jsx";


// Add this hook in your main App component or create a separate component
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

function App({ children }) {
    useAppLoader();
    const { auth, url } = usePage().props;

    const permissions = auth.permissions;    const [sideBarOpen, setSideBarOpen] = useState(() => {
        // Load sidebar state from localStorage
        const saved = localStorage.getItem('sidebar-open');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [themeColor, setThemeColor] = useState(() => {
        const stored = localStorage.getItem('themeColor');
        return stored
            ? JSON.parse(stored)
            : { name: "DEFAULT", className: "bg-blue-600/25 text-blue-600 font-bold", backgroundColor: darkMode ? 'rgba(31, 38, 59, 0.55)' : 'rgba(255, 255, 255, 0.60)' };
    });
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
        
        return isSettingsPage ? getSettingsPages(permissions) : getPages(permissions);
    }, [url, permissions]);

    // Theme and media query
    const theme = useTheme(darkMode, themeColor);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));    // Persist darkMode, themeColor, and sidebar state
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        localStorage.setItem('themeColor', JSON.stringify(themeColor));
        localStorage.setItem('sidebar-open', JSON.stringify(sideBarOpen));
    }, [darkMode, themeColor, sideBarOpen]);

    // Toggle handlers (useCallback for stable references)
    const toggleDarkMode = useCallback(() => setDarkMode(dm => !dm), []);
    const toggleThemeColor = useCallback(color => setThemeColor(color), []);
    const toggleThemeDrawer = useCallback(() => setThemeDrawerOpen(open => !open), []);
    const toggleSideBar = useCallback(() => setSideBarOpen(open => !open), []);

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

    // FCM notification setup
    useEffect(() => {
        requestNotificationPermission().then(async token => {
            try {
                const response = await axios.post(route('updateFcmToken'), { fcm_token: token });
                if (response.status === 200) {
                    console.log(response.data.message, ': ', response.data.fcm_token);
                }
            } catch (error) {
                console.error(error);
            }
        });

        onMessageListener()
            .then(payload => {
                console.log('Message received. ', payload);
                alert(payload.notification.title + ": " + payload.notification.body);
            })
            .catch(err => console.log('failed: ', err));
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
                        }}
                    >
                        {/* Mobile Sidebar Overlay */}
                        {isMobile && sideBarOpen && (
                            <Sidebar 
                                url={url} 
                                pages={pages} 
                                toggleSideBar={toggleSideBar}
                                sideBarOpen={sideBarOpen}
                            />
                        )}

                        {/* Desktop Sidebar Area */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                height: '100vh',
                                minWidth: sideBarOpen ? 'auto' : 0,
                                width: sideBarOpen ? 'auto' : 0,
                                maxWidth: sideBarOpen ? '400px' : 0,
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}
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
