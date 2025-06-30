
import React, {useEffect, useRef, useState} from 'react';
import {Box, CssBaseline, ThemeProvider, useMediaQuery} from '@mui/material';
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import BottomNav from "@/Layouts/BottomNav.jsx";
import {usePage} from "@inertiajs/react";
import useTheme from "@/theme.jsx";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "@/Layouts/Sidebar.jsx";
import { Inertia } from '@inertiajs/inertia'
import Loader from '@/Components/Loader.jsx'
import { getPages } from '@/Props/pages.jsx';
import { getSettingsPages } from '@/Props/settings.jsx';
import { NextUIProvider } from '@nextui-org/react';
import {onMessageListener, requestNotificationPermission} from "@/firebase-config.js";

function App({ children }) {
    const [loading, setLoading] = useState(false);
    const { auth } = usePage().props;
    const permissions = auth.permissions;

    const [sideBarOpen, setSideBarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode === 'true';
    });
    
    const contentRef = useRef(null);
    const [bottomNavHeight, setBottomNavHeight] = useState(0);
    const { url } = usePage();
    const [currentRoute, setCurrentRoute] = useState(url);

    const [pages, setPages] = useState(() =>
        /setting/i.test(url) ? getSettingsPages() : getPages(permissions)
    );

    const theme = useTheme(darkMode);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Update current route when URL changes
    useEffect(() => {
        setCurrentRoute(url);
    }, [url]);

    // Update pages based on current route
    useEffect(() => {
        setPages(/setting/i.test(currentRoute) ? getSettingsPages() : getPages(permissions));
    }, [currentRoute, permissions]);

    // Save dark mode preference
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const toggleSideBar = () => {
        setSideBarOpen(!sideBarOpen);
    };

    // Loading states for navigation
    Inertia.on('start', () => {
        setLoading(true);
    });

    Inertia.on('finish', () => {
        setLoading(false);
    });

    // Firebase notification setup
    useEffect(() => {
        requestNotificationPermission().then(async token => {
            try {
                const response = await axios.post(route('updateFcmToken'), {
                    fcm_token: token,
                });

                if (response.status === 200) {
                    console.log(response.data.message, ': ', response.data.fcm_token);
                }
            } catch (error) {
                console.error(error);
            }
        });

        onMessageListener()
            .then((payload) => {
                console.log('Message received. ', payload);
                alert(payload.notification.title + ": " + payload.notification.body);
            })
            .catch((err) => console.log('failed: ', err));
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <NextUIProvider>
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
                    <CssBaseline/>
                    {loading && <Loader/>}
                    
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            height: '100vh',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Sidebar Area - Desktop Only */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                height: '100vh',
                                width: sideBarOpen ? 280 : 0,
                                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                overflow: 'hidden',
                                zIndex: theme.zIndex.drawer,
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
                                display: 'flex',
                                flex: 1,
                                flexDirection: 'column',
                                height: '100vh',
                                overflow: 'hidden',
                                pb: isMobile ? `${bottomNavHeight}px` : 0,
                                transition: 'padding-bottom 0.3s ease',
                            }}
                        >
                            {/* Header */}
                            {auth.user && (
                                <Header 
                                    url={url} 
                                    pages={pages} 
                                    darkMode={darkMode} 
                                    toggleDarkMode={toggleDarkMode}
                                    sideBarOpen={sideBarOpen} 
                                    toggleSideBar={toggleSideBar}
                                />
                            )}

                            {/* Breadcrumb */}
                            {auth.user && <Breadcrumb />}

                            {/* Page Content */}
                            <Box
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {children}
                            </Box>

                            {/* Bottom Navigation - Mobile Only */}
                            {auth.user && isMobile && (
                                <BottomNav 
                                    setBottomNavHeight={setBottomNavHeight} 
                                    contentRef={contentRef} 
                                    auth={auth}
                                />
                            )}
                        </Box>
                    </Box>
                </main>
            </NextUIProvider>
        </ThemeProvider>
    );
}

export default App;
