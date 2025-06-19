import React, { useEffect } from 'react';
import { Head, router } from "@inertiajs/react";
import { Box, Typography, CircularProgress } from '@mui/material';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import App from "@/Layouts/App.jsx";

/**
 * Legacy Role Settings Page
 * 
 * This component now redirects to the new comprehensive RoleManagement page
 * for better user experience and enterprise-grade features.
 */
const RolesSettings = ({ title }) => {
    useEffect(() => {
        // Redirect to the new role management page
        router.visit('/admin/roles-management', {
            replace: true,
            preserveState: false
        });
    }, []);

    return (
        <>
            <Head title={title || "Role Management"} />
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '50vh',
                    p: 4
                }}
            >
                <ShieldCheckIcon className="w-16 h-16 text-primary mb-4" />
                <Typography variant="h5" fontWeight="bold" mb={2}>
                    Redirecting to Enterprise Role Management
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
                    You're being redirected to our enhanced role management system with ISO compliance features.
                </Typography>
                <CircularProgress />
            </Box>
        </>
    );
};

RolesSettings.layout = (page) => <App>{page}</App>;
export default RolesSettings;
