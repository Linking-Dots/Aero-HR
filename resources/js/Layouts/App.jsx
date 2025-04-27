import React, {useEffect, useRef, useState} from 'react';
import {Box, CssBaseline, ThemeProvider, useMediaQuery,} from '@mui/material';
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import BottomNav from "@/Layouts/BottomNav.jsx";
import {usePage} from "@inertiajs/react";
import useTheme from "@/theme.jsx";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "@/Layouts/Sidebar.jsx";
import {Inertia} from '@inertiajs/inertia'
import {getPages} from '@/Props/pages.jsx';
import {getSettingsPages} from '@/Props/settings.jsx';
import {HeroUIProvider} from "@heroui/react";
import {onMessageListener, requestNotificationPermission} from "@/firebase-config.js";
import ThemeSettingDrawer from "@/Components/ThemeSettingDrawer.jsx";

function App({ children }) {

    const [loading, setLoading] = useState();
    const { auth } = usePage().props;
    const permissions = auth.permissions;

    const [sideBarOpen, setSideBarOpen] = useState(false);
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode === 'true';
    });
    const [themeColor, setThemeColor] = useState(() => {
        const storedThemeColor = localStorage.getItem('themeColor');
        return storedThemeColor ? JSON.parse(storedThemeColor) : { name: "DEFAULT", className: "bg-blue-600/25 text-blue-600 font-bold", backgroundColor: darkMode ? 'rgba(31, 38, 59, 0.55)' : 'rgba(255, 255, 255, 0.60)' }; // Provide a default value
    });
    const contentRef = useRef(null);   // Ref to the main content container
    const [bottomNavHeight, setBottomNavHeight] = useState(0); // State to store the bottom nav height
    const { url } = usePage(); // Get the current page object (url is the current route)
    const [currentRoute, setCurrentRoute] = useState(url);

    const [pages, setPages] = useState(() =>
        /setting/i.test(url) ? getSettingsPages() : getPages(permissions)
    );

    useEffect(() => {
        setCurrentRoute(url); // Update currentRoute when url changes
    }, [url]);


    useEffect(() => {
        setPages( /setting/i.test(currentRoute) ? getSettingsPages() : getPages(permissions));
    }, [currentRoute, permissions]);


    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        localStorage.setItem('themeColor', JSON.stringify(themeColor));
    }, [darkMode, themeColor]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.setItem('darkMode', darkMode);
    };

    const toggleThemeColor = (color) => {
        setThemeColor(color);
        localStorage.setItem('themeColor', JSON.stringify(color)); // Persist the new theme color as a string
    };

    const toggleThemeDrawer = () => {
        setThemeDrawerOpen(!themeDrawerOpen);
    };
    const toggleSideBar = () => {
        setSideBarOpen(!sideBarOpen);
    };

    const theme = useTheme(darkMode, themeColor);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));



    Inertia.on('start', () => {
        setLoading(true);
    })

    Inertia.on('finish', (event) => {
        setLoading(false);
    })

    useEffect(() => {
        requestNotificationPermission().then(async token => {

            try {
                // Make the POST request to the route that updates the FCM token
                const response = await axios.post(route('updateFcmToken'), {
                    fcm_token: token,
                });

                if (response.status === 200) {
                    console.log(response.data.message,': ', response.data.fcm_token);
                }
            } catch (error) {
                console.error(error);

            }
        });

        // Listen to incoming messages
        onMessageListener()
            .then((payload) => {
                console.log('Message received. ', payload);
                alert(payload.notification.title + ": " + payload.notification.body);
            })
            .catch((err) => console.log('failed: ', err));
    }, []);



    return (

        <ThemeProvider theme={theme}>
            <ThemeSettingDrawer toggleThemeColor={toggleThemeColor} themeColor={themeColor} darkMode={darkMode} toggleDarkMode={toggleDarkMode} toggleThemeDrawer={toggleThemeDrawer} themeDrawerOpen={themeDrawerOpen}/>
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
                    <CssBaseline/>
                    {/*{loading && <Loader/>}*/}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            height: '100vh',
                        }}
                    >
                        {/* Sidebar Area */}
                        <Box
                            sx={{
                                display: {xs: 'none', md: 'block'},
                                height: '100vh', // Full height
                                width: sideBarOpen ? 280 : 0,
                                transition: 'width 0.3s ease-in-out',
                                flexDirection: 'column',
                                overflow: 'hidden', // Avoid overflow on the sidebar
                            }}
                        >
                            <Sidebar url={url} pages={pages} toggleSideBar={toggleSideBar}/>
                        </Box>

                        {/* Main Content Area */}
                        <Box
                            ref={contentRef}
                            sx={{
                                pb: `${bottomNavHeight}px`,
                                display: 'flex',
                                flex: 1,
                                flexDirection: 'column',
                                height: '100vh', // Full height for content area
                                overflow: 'auto', // Enable vertical scrolling
                            }}
                        >
                            {auth.user &&
                                <Header url={url} pages={pages} darkMode={darkMode} toggleDarkMode={toggleDarkMode} toggleThemeDrawer={toggleThemeDrawer}
                                        sideBarOpen={sideBarOpen} toggleSideBar={toggleSideBar} themeDrawerOpen={themeDrawerOpen}/>}
                            {auth.user && <Breadcrumb/>}
                            {children}
                            {/*{!isMobile && <Footer/>}*/}
                            {auth.user && isMobile &&
                                <BottomNav setBottomNavHeight={setBottomNavHeight} contentRef={contentRef}
                                           auth={auth}/>}



                        </Box>
                    </Box>

                </main>


            </HeroUIProvider>

        </ThemeProvider>


    );
}

export default App;
