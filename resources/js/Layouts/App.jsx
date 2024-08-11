import React, { useState, useMemo, useEffect } from 'react';
import {ThemeProvider, createTheme, CssBaseline, Select, MenuItem, Avatar, TextField, Button} from '@mui/material';
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import BottomNavigation from "@/Layouts/BottomNav.jsx";
import {usePage} from "@inertiajs/react";
import useTheme from "@/theme.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App({ children }) {
    const { auth } = usePage().props;

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

    const theme = useTheme(darkMode);

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
                transition: Bounce
            />
                <CssBaseline />
                {auth.user && <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
                {auth.user && <Breadcrumb/>}
                {children}
                {auth.user && <BottomNavigation/>}
        </ThemeProvider>

    );
}

export default App;
