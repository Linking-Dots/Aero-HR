import React, {useState, useEffect} from 'react';
import {Head, usePage} from '@inertiajs/react';
import {Box, Button, Card, CardContent, CardHeader, Typography, Grid, Avatar} from '@mui/material';
import { Add } from '@mui/icons-material';
import GlassCard from '@/Components/GlassCard.jsx'; // Ensure this component is imported if you have custom styles
import App from "@/Layouts/App.jsx";
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';
import LeaveForm from "@/Forms/LeaveForm.jsx";
import Grow from "@mui/material/Grow";
const LeavesEmployee = ({ title, leavesData, allUsers }) => {
    const [openModalType, setOpenModalType] = useState(null);
    const [allLeaves, setAllLeaves] = useState(leavesData.allLeaves);

    console.log(leavesData);


    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const closeModal = () => {
        setOpenModalType(null);
    };

    return (
        <App>
            <Head title={title} />
            {openModalType === 'leave' && (
                <LeaveForm
                    open={openModalType === 'leave'}
                    setAllLeaves={setAllLeaves}
                    closeModal={closeModal}
                    leaveTypes={leavesData.leaveTypes}
                    leaveCounts={leavesData.leaveCounts}
                />
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Leaves"
                            sx={{padding: '24px'}}
                            action={
                                <Box display="flex" gap={2}>
                                    <Button
                                        title="Add Leave"
                                        variant="outlined"
                                        color="success"
                                        startIcon={<Add />}
                                        onClick={() => openModal('leave')}
                                    >
                                        Add Leave
                                    </Button>
                                </Box>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                {leavesData.leaveCounts.map((leave) => (
                                    <Grid item xs={12} sm={6} md={3} key={leave.leave_type}>
                                        <GlassCard>
                                            <CardContent>
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    height="100%"
                                                    textAlign="center"
                                                >
                                                    <Box>
                                                        <Typography variant="h6">{leave.leave_type}</Typography>
                                                        <Typography variant="h4">{leave.days_used}</Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                        <CardContent>
                            <LeaveEmployeeTable allLeaves={allLeaves} allUsers={allUsers}/>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </App>
    );
};

export default LeavesEmployee;
