
import {Head, Link, usePage} from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import PunchStatusCard from "@/Components/PunchStatusCard.jsx";
import StatisticCard from "@/Components/StatisticCard.jsx";
import UpdatesCards from "@/Components/UpdatesCards.jsx";
import LeaveCard from "@/Components/LeaveCard.jsx";
import TimeSheetTable from "@/Tables/TimeSheetTable.jsx";
import UserLocationsCard from "@/Components/UserLocationsCard.jsx";
import App from "@/Layouts/App.jsx";
import { Card, Fade } from '@mui/material';

export default function Dashboard({auth}) {

    return (
        <App>
            <Head title="Dashboard"/>
            <PunchStatusCard/>
            <StatisticCard/>
            {auth.roles.includes('admin') && <UserLocationsCard/>}
            {auth.roles.includes('admin') && <TimeSheetTable/>}
            <UpdatesCards/>
            <LeaveCard/>
        </App>
);
}
