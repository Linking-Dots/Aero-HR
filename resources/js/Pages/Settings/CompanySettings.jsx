import React, {useState} from 'react';
import {
    Box,
} from '@mui/material';
import {Head, usePage} from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import CompanyInformationForm from "@/Forms/CompanyInformationForm.jsx"


const CompanySettings = ({title}) => {
    const [settings, setSettings] = useState(usePage().props.companySettings);


    return (
        <>
            <Head title={title}/>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CompanyInformationForm settings={settings} setSettings={setSettings} />
            </Box>
        </>

    );
};
CompanySettings.layout = (page) => <App>{page}</App>;
export default CompanySettings;

