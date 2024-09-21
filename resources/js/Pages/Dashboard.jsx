import {Head} from '@inertiajs/react';
import React, {useState} from 'react';
import PunchStatusCard from "@/Components/PunchStatusCard.jsx";
import StatisticCard from "@/Components/StatisticCard.jsx";
import UpdatesCards from "@/Components/UpdatesCards.jsx";
import LeaveCard from "@/Components/LeaveCard.jsx";
import TimeSheetTable from "@/Tables/TimeSheetTable.jsx";
import UserLocationsCard from "@/Components/UserLocationsCard.jsx";
import App from "@/Layouts/App.jsx";
import {Grid, Box} from "@mui/material";

export default function Dashboard({auth,users}) {

    const [updateMap, setUpdateMap] = useState(false);
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date()); // State to hold the selected date

    const handlePunchSuccess = () => {
        // Toggle the state to re-render UserLocationsCard
        setUpdateMap(prev => !prev);
        setUpdateTimeSheet(prev => !prev);
    };

    // Handle date change from DatePicker
    const handleDateChange = (event) => {
        const newDate = event.target.value; // Date from the input field
        setSelectedDate(new Date(newDate)); // Set it as a valid Date object
        setUpdateTimeSheet(prev => !prev);  // Re-render components if necessary
        setUpdateMap(prev => !prev);        // Re-render components if necessary
    };

    return (
        <>
            <Head title="Dashboard"/>
            <Box>
                <Grid container >
                    {auth.roles.includes('Employee') &&
                        <Grid item xs={12} md={6}>
                            <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                        </Grid>
                    }
                    <Grid item xs={12} md={6}>
                        <StatisticCard />
                    </Grid>
                </Grid>
                {auth.roles.includes('Administrator') && <TimeSheetTable selectedDate={selectedDate} handleDateChange={handleDateChange} users={users} key={updateTimeSheet}/>}
                {auth.roles.includes('Administrator') && <UserLocationsCard updateMap={updateMap}/>}
                <UpdatesCards/>
                <LeaveCard/>
            </Box>
        </>
    );
}

Dashboard.layout = (page) => <App>{page}</App>;
