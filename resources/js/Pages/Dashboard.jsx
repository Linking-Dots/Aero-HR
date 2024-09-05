import {Head} from '@inertiajs/react';
import React, {useState} from 'react';
import PunchStatusCard from "@/Components/PunchStatusCard.jsx";
import StatisticCard from "@/Components/StatisticCard.jsx";
import UpdatesCards from "@/Components/UpdatesCards.jsx";
import LeaveCard from "@/Components/LeaveCard.jsx";
import TimeSheetTable from "@/Tables/TimeSheetTable.jsx";
import UserLocationsCard from "@/Components/UserLocationsCard.jsx";
import App from "@/Layouts/App.jsx";
import {Grid} from "@mui/material";

export default function Dashboard({auth}) {

    const [updateMap, setUpdateMap] = useState(false);
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);

    const handlePunchSuccess = () => {
        // Toggle the state to re-render UserLocationsCard
        // setUpdateMap(prev => !prev);
        setUpdateTimeSheet(prev => !prev);
    };

    return (
        <App>

            <Head title="Dashboard"/>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <PunchStatusCard handlePunchSuccess={handlePunchSuccess} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <StatisticCard />
                </Grid>
            </Grid>
            {/*{auth.roles.includes('admin') && <UserLocationsCard updateMap={updateMap}/>}*/}
            {auth.roles.includes('admin') && <TimeSheetTable key={updateTimeSheet}/>}
            <UpdatesCards/>
            <LeaveCard/>
        </App>
);
}
