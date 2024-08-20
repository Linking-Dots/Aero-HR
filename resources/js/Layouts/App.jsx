import React, { useState, useEffect } from 'react';
import {
    ThemeProvider,
    CssBaseline,
    Box, useMediaQuery,
} from '@mui/material';
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import BottomNavigation from "@/Layouts/BottomNav.jsx";
import {usePage} from "@inertiajs/react";
import useTheme from "@/theme.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "@/Layouts/Sidebar.jsx";
import BottomNav from "@/Layouts/BottomNav.jsx";
import Footer from "@/Layouts/Footer.jsx";
function App({ children }) {
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
                        display: { xs: 'none', md: 'flex' },
                        height:  '100%',
                        width: sideBarOpen ? 260 : 0,
                        transition: 'width 0.3s ease-in-out',
                        flexDirection: 'column',
                    }}
                >
                    <Sidebar toggleSideBar={toggleSideBar}/>
                </Box>


                {/* Main Content Area */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto', // Ensure content can scroll if needed
                    }}
                >
                    {children}
                    <Footer/>
                </Box>
            </Box>
            <>
                {auth.user && isMobile && <BottomNav auth={auth}/>}
            </>

        </ThemeProvider>

    );
}

export default App;
