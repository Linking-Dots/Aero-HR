import { Head } from '@inertiajs/react';
import React, { useState, lazy, Suspense } from 'react';

// Lazy loaded components
const TimeSheetTable = lazy(() => import('@/Tables/TimeSheetTable.jsx'));
const UserLocationsCard = lazy(() => import('@/Components/UserLocationsCard.jsx'));
const UpdatesCards = lazy(() => import('@/Components/UpdatesCards.jsx'));
const HolidayCard = lazy(() => import('@/Components/HolidayCard.jsx'));
const StatisticCard = lazy(() => import('@/Components/StatisticCard.jsx'));
const PunchStatusCard = lazy(() => import('@/Components/PunchStatusCard.jsx'));
import App from "@/Layouts/App.jsx";
import { Grid, Box } from "@mui/material";
import { Spinner } from "@heroui/react";

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

    // Helper function to check permissions
    const hasPermission = (permission) => {
        return auth.permissions && auth.permissions.includes(permission);
    };

    // Helper function to check if user has any of the specified permissions
    const hasAnyPermission = (permissions) => {
        return permissions.some(permission => hasPermission(permission));
    };    const actionButtons = [
        {
            label: "Today",
            icon: <CalendarDaysIcon className="w-4 h-4" />,
            onPress: () => {
                const today = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Dhaka',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }).format(new Date());
                setSelectedDate(today);
                setUpdateTimeSheet(prev => !prev);
                setUpdateMap(prev => !prev);            },
            className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
        },
        hasPermission('dashboard.view') && {
            label: "Analytics",
            icon: <ChartBarIcon className="w-4 h-4" />,
            onPress: () => {
                // Could navigate to analytics page or show modal
                console.log("Analytics clicked");
            },
            className: "bg-gradient-to-r from-[rgba(var(--theme-success-rgb),0.8)] to-[rgba(var(--theme-success-rgb),1)] text-white font-medium hover:opacity-90"
        }
    ].filter(Boolean);    const handlePunchSuccess = () => {
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
            <Box>
                {/*<NoticeBoard/>*/}
                <Suspense
                    fallback={
                        <div className="w-full flex justify-center items-center py-12">
                            <Spinner
                                classNames={{ label: "text-foreground mt-4" }}
                                label="Loading..."
                                variant="dots"
                            />
                        </div>
                    }
                >                    <Grid container>
                        {/* Punch Status Card - for employees and self-service users */}
                        {hasAnyPermission(['attendance.own.punch', 'attendance.own.view']) &&
                            <Grid item xs={12} md={6}>
                                <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                            </Grid>
                        }
                        {/* Statistics Card - for users with dashboard access */}
                        {hasPermission('dashboard.view') &&
                            <Grid item xs={12} md={6}>
                                <StatisticCard />
                            </Grid>
                        }
                    </Grid>
                    
                    {/* Admin/Manager level components */}
                    {hasAnyPermission(['attendance.view', 'employees.view']) && (
                        <>
                            <TimeSheetTable selectedDate={selectedDate} handleDateChange={handleDateChange} updateTimeSheet={updateTimeSheet} />
                            <UserLocationsCard selectedDate={selectedDate} updateMap={updateMap} />
                        </>
                    )}
                    
                    {/* Updates and holidays - available to all authenticated users */}
                    {hasPermission('updates.view') && <UpdatesCards />}
                    {hasPermission('dashboard.view') && <HolidayCard />}
                </Suspense>
            </Box>
        </>
    );
}

Dashboard.layout = (page) => <App>{page}</App>;
