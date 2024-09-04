import {Head} from '@inertiajs/react';
import React, {useState} from 'react';
import PunchStatusCard from "@/Components/PunchStatusCard.jsx";
import StatisticCard from "@/Components/StatisticCard.jsx";
import UpdatesCards from "@/Components/UpdatesCards.jsx";
import LeaveCard from "@/Components/LeaveCard.jsx";
import TimeSheetTable from "@/Tables/TimeSheetTable.jsx";
import UserLocationsCard from "@/Components/UserLocationsCard.jsx";
import App from "@/Layouts/App.jsx";

export default function Dashboard({auth}) {

    const [updateMap, setUpdateMap] = useState(false);
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);

    const handlePunchSuccess = () => {
        // Toggle the state to re-render UserLocationsCard
        setUpdateMap(prev => !prev);
        setUpdateTimeSheet(prev => !prev);
    };

    return (
        <App>

            <Head title="Dashboard"/>
            <PunchStatusCard handlePunchSuccess={handlePunchSuccess}/>
            <StatisticCard/>
            {auth.roles.includes('admin') && <UserLocationsCard updateMap={updateMap}/>}
            {auth.roles.includes('admin') && <TimeSheetTable key={updateTimeSheet}/>}
            <UpdatesCards/>
            <LeaveCard/>
        </App>
);
}
