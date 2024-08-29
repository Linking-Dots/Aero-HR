import React from 'react';
import {Head} from "@inertiajs/react";
import {Box, Button, CardContent, CardHeader} from '@mui/material';

import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import GlassCard from "@/Components/GlassCard.jsx";
import {Add} from "@mui/icons-material";
import EmployeeTable from '@/Tables/EmployeeTable.jsx';

const EmployeesList = ({title, allUsers, departments, designations}) => {
    return (
        <App>
            <Head title={title}/>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Employees"
                            sx={{padding: '24px'}}
                            action={
                            <Box display="flex" gap={2}>
                                <Button
                                    title="Add Employee"
                                    variant="outlined"
                                    color="success"
                                    startIcon={<Add />}
                                >
                                    Add Employee
                                </Button>
                            </Box>
                        } />
                        <CardContent>
                            <EmployeeTable allUsers={allUsers} departments={departments} designations={designations}/>

                        </CardContent>
                    </GlassCard>


                </Grow>
            </Box>
        </App>

    );
};

export default EmployeesList;
