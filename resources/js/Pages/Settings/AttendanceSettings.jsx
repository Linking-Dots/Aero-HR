import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Head, usePage } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import AttendanceSettingsForm from "@/Forms/AttendanceSettingsForm.jsx";

const AttendanceSettings = ({ title }) => {
    const [settings, setSettings] = useState(usePage().props.attendanceSettings);

    return (
        <>
            <Head title={title} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <AttendanceSettingsForm settings={settings} setSettings={setSettings} />
            </Box>
        </>
    );
};

AttendanceSettings.layout = (page) => <App>{page}</App>;
export default AttendanceSettings;