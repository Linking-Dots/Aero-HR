import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Direct imports - eager loading
import TimeSheetTable from '@/Tables/TimeSheetTable.jsx';
import UserLocationsCard from '@/Components/UserLocationsCard.jsx';
import UpdatesCards from '@/Components/UpdatesCards.jsx';
import HolidayCard from '@/Components/HolidayCard.jsx';
import StatisticCard from '@/Components/StatisticCard.jsx';
import PunchStatusCard from '@/Components/PunchStatusCard.jsx';
import App from "@/Layouts/App.jsx";
import { Grid, Box } from "@mui/material";

import { 
    HomeIcon, 
    CalendarDaysIcon,
    ChartBarIcon 
} from '@heroicons/react/24/outline';

export default function Dashboard({ auth }) {

    const [updateMap, setUpdateMap] = useState(false);
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date()));

    // Animation variants for smooth component entry
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 20, 
            scale: 0.95 
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const staggerItemVariants = {
        hidden: { 
            opacity: 0, 
            y: 30, 
            scale: 0.9 
        },
        visible: (index) => ({ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut"
            }
        })
    };

    // Helper function to check permissions
    const hasPermission = (permission) => {
        return auth.permissions && auth.permissions.includes(permission);
    };

    // Helper function to check if user has any of the specified permissions
    const hasAnyPermission = (permissions) => {
        return permissions.some(permission => hasPermission(permission));
    };    

    const hasEveryPermission = (permissions) => {
        return permissions.every(permission => hasPermission(permission));
    };    
    
   
    
    const handlePunchSuccess = () => {
        setUpdateMap(prev => !prev);
        setUpdateTimeSheet(prev => !prev);
    };

    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Dhaka',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date(newDate)));
        setUpdateTimeSheet(prev => !prev);
        setUpdateMap(prev => !prev);
    };

    return (
        <>
            <Head title="Dashboard" />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                
            >
                <Box sx={{ 
                    width: '100%',
                    // Remove extra padding since App.jsx now provides consistent padding
                }}>
                    {/*<NoticeBoard/>*/}
                    <motion.div key="main-grid" variants={itemVariants}>
                        <Grid container spacing={2}>
                            {/* Punch Status Card - for employees and self-service users */}
                            {hasEveryPermission(['attendance.own.punch', 'attendance.own.view']) &&
                                <Grid key="punch-status-grid" item xs={12} md={6} sx={{ display: 'flex' }}>
                                    <motion.div
                                        key="punch-status-card"
                                        variants={staggerItemVariants}
                                        custom={0}
                                        whileHover={{ 
                                            scale: 1.02,
                                            transition: { duration: 0.2 }
                                        }}
                                        style={{ width: '100%', display: 'flex' }}
                                    >
                                        <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                                    </motion.div>
                                </Grid>
                            }
                            {/* Statistics Card - for users with dashboard access */}
                            {hasPermission('core.dashboard.view') &&
                                <Grid key="statistics-grid" item xs={12} md={6} sx={{ display: 'flex' }}>
                                    <motion.div
                                        key="statistics-card"
                                        variants={staggerItemVariants}
                                        custom={1}
                                        whileHover={{ 
                                            scale: 1.02,
                                            transition: { duration: 0.2 }
                                        }}
                                        style={{ width: '100%', display: 'flex' }}
                                    >
                                        <StatisticCard />
                                    </motion.div>
                                </Grid>
                            }
                        </Grid>
                    </motion.div>
                    
                    {/* Admin/Manager level components */}
                    {hasAnyPermission(['attendance.view', 'employees.view']) && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="timesheet-section"
                                variants={staggerItemVariants}
                                custom={2}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <TimeSheetTable 
                                    selectedDate={selectedDate} 
                                    handleDateChange={handleDateChange} 
                                    updateTimeSheet={updateTimeSheet} 
                                />
                            </motion.div>
                            <motion.div
                                key="user-locations-section"
                                variants={staggerItemVariants}
                                custom={3}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <UserLocationsCard 
                                    selectedDate={selectedDate} 
                                    updateMap={updateMap} 
                                />
                            </motion.div>
                        </AnimatePresence>
                    )}
                    
                    {/* Updates and holidays - available to all authenticated users */}
                    {hasPermission('core.updates.view') && (
                        <motion.div
                            key="updates-section"
                            variants={staggerItemVariants}
                            custom={4}
                            initial="hidden"
                            animate="visible"
                        >
                            <UpdatesCards />
                        </motion.div>
                    )}
                
                </Box>
            </motion.div>
        </>
    );
}

Dashboard.layout = (page) => <App>{page}</App>;
