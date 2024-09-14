import React, { useEffect, useRef, useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import Header from "@/Layouts/Header.jsx";
import Breadcrumb from "@/Components/Breadcrumb.jsx";
import BottomNav from "@/Layouts/BottomNav.jsx";
import { usePage } from "@inertiajs/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "@/Layouts/Sidebar.jsx";
import Footer from "@/Layouts/Footer.jsx";
import { Inertia } from '@inertiajs/inertia';
import Loader from '@/Components/Loader.jsx';
import { getPages } from '@/Props/pages.jsx';
import { getSettingsPages } from '@/Props/settings.jsx';

function App({ children }) {
    const [loading, setLoading] = useState(false);
    const { auth } = usePage().props;
    const userIsAdmin = auth.roles.includes('admin');
    const [sideBarOpen, setSideBarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        return savedDarkMode === 'true';
    });
    const contentRef = useRef(null); // Ref to the main content container
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
        setPages(/setting/i.test(currentRoute) ? getSettingsPages() : getPages(userIsAdmin));
    }, [currentRoute, userIsAdmin]);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        console.log(darkMode);
    };

    const toggleSideBar = () => {
        setSideBarOpen(!sideBarOpen);
    };

    // const theme = createTheme({
    //     type: darkMode ? 'dark' : 'light',
    //     theme: {
    //         colors: {
    //             primary: '$blue600',
    //             secondary: '$purple600',
    //         },
    //     },
    // });

    Inertia.on('start', () => {
        setLoading(true);
    });

    Inertia.on('finish', () => {
        setLoading(false);
    });

    return (
        <NextUIProvider>
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
            {loading && <Loader />}
            <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
                {/* Sidebar Area */}
                <div
                    style={{
                        display: window.innerWidth >= 960 ? 'block' : 'none',
                        height: '100vh', // Full height
                        width: sideBarOpen ? 280 : 0,
                        transition: 'width 0.3s ease-in-out',
                        flexDirection: 'column',
                        overflow: 'hidden', // Avoid overflow on the sidebar
                    }}
                >
                    {/*<Sidebar url={url} pages={pages} toggleSideBar={toggleSideBar} />*/}
                </div>

                {/* Main Content Area */}
                <div
                    ref={contentRef}
                    style={{
                        paddingBottom: `${bottomNavHeight}px`,
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        height: '100vh', // Full height for content area
                        overflow: 'auto', // Enable vertical scrolling
                    }}
                >
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
                    {/*{auth.user && <Breadcrumb />}*/}
                    {children}
                    {/*{auth.user && window.innerWidth < 960 && (*/}
                    {/*    <BottomNav setBottomNavHeight={setBottomNavHeight} contentRef={contentRef} auth={auth} />*/}
                    {/*)}*/}
                </div>
            </div>
        </NextUIProvider>
    );
}

export default App;
