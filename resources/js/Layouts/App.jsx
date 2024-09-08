import React, {useEffect, useState} from 'react';
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
function App({ children }) {
    const [loading, setLoading] = useState();
    const { auth } = usePage().props;
    const [sideBarOpen, setSideBarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode === 'true';
    });

    // Update local storage whenever darkMode changes
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
            {loading && <Loader />}

            {auth.user && <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} sideBarOpen={sideBarOpen} toggleSideBar={toggleSideBar}/>}

            {auth.user && <Breadcrumb />}

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
                        display: { xs: 'none', md: 'block' },
                        height: '100vh', // Full height
                        width: sideBarOpen ? 260 : 0,
                        transition: 'width 0.3s ease-in-out',
                        flexDirection: 'column',
                        overflow: 'hidden', // Avoid overflow on the sidebar
                    }}
                >
                    <Sidebar toggleSideBar={toggleSideBar} />
                </Box>

                {/* Main Content Area */}
                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        height: '100vh', // Full height for content area
                        overflow: 'auto', // Enable vertical scrolling
                    }}
                >
                    {children}
                </Box>
            </Box>
            <>
                {!isMobile && <Footer/>}
                {auth.user && isMobile && <BottomNav auth={auth}/>}
            </>

        </ThemeProvider>

    );
}

export default App;
