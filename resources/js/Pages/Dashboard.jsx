import { Head } from '@inertiajs/react';
import React, { useState, lazy, Suspense } from 'react';

// Lazy loaded components
const TimeSheetTable = lazy(() => import('@/Tables/TimeSheetTable.jsx'));
const UserLocationsCard = lazy(() => import('@/Components/UserLocationsCard.jsx'));
const UpdatesCards = lazy(() => import('@/Components/UpdatesCards.jsx'));
const LeaveCard = lazy(() => import('@/Components/LeaveCard.jsx'));
const StatisticCard = lazy(() => import('@/Components/StatisticCard.jsx'));
const PunchStatusCard = lazy(() => import('@/Components/PunchStatusCard.jsx'));
import App from "@/Layouts/App.jsx";
import { Grid, Box } from "@mui/material";
import {Spinner} from "@heroui/react";

export default function Dashboard({ auth }) {

    const [updateMap, setUpdateMap] = useState(false);
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date()));

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
                >
                    <Grid container>
                        {auth.roles.includes('Employee') &&
                            <Grid item xs={12} md={6}>
                                <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                            </Grid>
                        }
                            <Grid item xs={12} md={6}>
                                <StatisticCard />
                            </Grid>
                    </Grid>
                    {auth.roles.includes('Administrator') && (
                        <>
                            <TimeSheetTable selectedDate={selectedDate} handleDateChange={handleDateChange} updateTimeSheet={updateTimeSheet} />
                            <UserLocationsCard selectedDate={selectedDate} updateMap={updateMap} />
                        </>
                    )}
                    <UpdatesCards />
                    <LeaveCard />
                </Suspense>
            </Box>
        </>
    );
}

Dashboard.layout = (page) => <App>{page}</App>;
