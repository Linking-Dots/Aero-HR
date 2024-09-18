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
import Footer from "@/Layouts/Footer.jsx";
import { Inertia } from '@inertiajs/inertia'
import Loader from '@/Components/Loader.jsx'
import { getPages } from '@/Props/pages.jsx';
import { getSettingsPages } from '@/Props/settings.jsx';
import { NextUIProvider } from '@nextui-org/react';
function App({ children }) {

    const [loading, setLoading] = useState();
    const { auth } = usePage().props;
    const userIsAdmin = auth.roles.includes('admin');
    const [sideBarOpen, setSideBarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode === 'true';
    });
    const contentRef = useRef(null);   // Ref to the main content container
    const [bottomNavHeight, setBottomNavHeight] = useState(0); // State to store the bottom nav height
    const { url } = usePage(); // Get the current page object (url is the current route)
    const [currentRoute, setCurrentRoute] = useState(url);

    const [pages, setPages] = useState(() =>
        /setting/i.test(url) ? getSettingsPages() : getPages(userIsAdmin)
    );

    useEffect(() => {
        setCurrentRoute(url); // Update currentRoute when url changes
    }, [url]);


    useEffect(() => {
        setPages( /setting/i.test(currentRoute) ? getSettingsPages() : getPages(userIsAdmin));
    }, [currentRoute, userIsAdmin]);


    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        console.log(darkMode)
    };
    const toggleSideBar = () => {
        setSideBarOpen(!sideBarOpen);
    };

    const theme = useTheme(darkMode);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));



    Inertia.on('start', () => {
        setLoading(true);
    })

    Inertia.on('finish', (event) => {
        setLoading(false);
    })


    return (

        <ThemeProvider theme={theme}>
            <NextUIProvider>
                <body className={darkMode ? "dark" : "light"}>
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
                            <Header url={url} pages={pages} darkMode={darkMode} toggleDarkMode={toggleDarkMode}
                                    sideBarOpen={sideBarOpen} toggleSideBar={toggleSideBar}/>}
                        {auth.user && <Breadcrumb/>}
                        {children}
                        {/*{!isMobile && <Footer/>}*/}
                        {auth.user && isMobile &&
                            <BottomNav setBottomNavHeight={setBottomNavHeight} contentRef={contentRef} auth={auth}/>}
                    </Box>
                </Box>
                </body>
            </NextUIProvider>
        </ThemeProvider>



);
}

export default App;
