
import {Head, Link, usePage} from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import PunchStatusCard from "@/Components/PunchStatusCard.jsx";
import StatisticCard from "@/Components/StatisticCard.jsx";
import UpdatesCards from "@/Components/UpdatesCards.jsx";
import LeaveCard from "@/Components/LeaveCard.jsx";
import TimeSheetTable from "@/Tables/TimeSheetTable.jsx";
import UserLocationsCard from "@/Components/UserLocationsCard.jsx";
import App from "@/Layouts/App.jsx";


export default function Dashboard() {

    return (
        <App>
            <Head title="Dashboard"/>

                <PunchStatusCard/>
                <StatisticCard/>
                <UserLocationsCard/>
                <TimeSheetTable/>
                <UpdatesCards/>
                <LeaveCard/>

        </App>
);
}
