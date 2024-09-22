import React, {useState, useEffect, useCallback} from 'react';
import {Head, usePage} from '@inertiajs/react';
import {Box, Button, Card, CardContent, CardHeader, Typography, Grid, Avatar, Divider} from '@mui/material';
import { Add } from '@mui/icons-material';
import GlassCard from '@/Components/GlassCard.jsx'; // Ensure this component is imported if you have custom styles
import App from "@/Layouts/App.jsx";
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';
import LeaveForm from "@/Forms/LeaveForm.jsx";
import Grow from "@mui/material/Grow";
import DeleteLeaveForm from "@/Forms/DeleteLeaveForm.jsx";

const LeavesEmployee = ({ title, allUsers }) => {
    const {auth} = usePage().props;
    const [openModalType, setOpenModalType] = useState(null);
    const [leavesData, setLeavesData] = useState(usePage().props.leavesData);

    const [allLeaves, setAllLeaves] = useState(leavesData.allLeaves);
    const [leaveIdToDelete, setLeaveIdToDelete] = useState(null);

    const [currentLeave, setCurrentLeave] = useState();

    useEffect(() => {
        setAllLeaves(leavesData.allLeaves);
    }, [leavesData]);


    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const handleClickOpen = useCallback((leaveId, modalType) => {
        setLeaveIdToDelete(leaveId);
        setOpenModalType(modalType);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModalType(null);
        setLeaveIdToDelete(null);
    }, []);

    const closeModal = () => {
        setOpenModalType(null);
    };

    return (
        <>
            <Head title={title} />
            {openModalType === 'add_leave' && (
                <LeaveForm
                    open={openModalType === 'add_leave'}
                    setLeavesData={setLeavesData}
                    closeModal={closeModal}
                    leaveTypes={leavesData.leaveTypes}
                    leaveCounts={leavesData.leaveCountsByUser[auth.user.id] ?
                        leavesData.leaveCountsByUser[auth.user.id] : []}
                />
            )}
            {openModalType === 'edit_leave' && (
                <LeaveForm
                    open={openModalType === 'edit_leave'}
                    setLeavesData={setLeavesData}
                    closeModal={closeModal}
                    leaveTypes={leavesData.leaveTypes}
                    leaveCounts={leavesData.leaveCountsByUser[auth.user.id] ?
                        leavesData.leaveCountsByUser[auth.user.id] : []}
                    currentLeave={currentLeave}
                />
            )}
            {openModalType === 'delete_leave' && (
                <DeleteLeaveForm
                    open={openModalType === 'delete_leave'}
                    handleClose={handleClose}
                    leaveIdToDelete={leaveIdToDelete}
                    setLeavesData={setLeavesData}
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
                                        onClick={() => openModal('add_leave')}
                                    >
                                        Add Leave
                                    </Button>
                                </Box>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                {leavesData.leaveTypes.map((leaveType) => (
                                    <Grid item xs={6} sm={6} md={3} key={leaveType.type}>
                                        <GlassCard>
                                            <CardContent>
                                                <Box
                                                    display="flex"
                                                    flexDirection="column"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    height="100%"
                                                    textAlign="center"
                                                >
                                                    {/* Leave Type centered at the top */}
                                                    <Typography variant="h6" sx={{ mb: 2 }}>{leaveType.type}</Typography> {/* Margin-bottom to separate from the next line */}

                                                    {/* Used and Remaining values in a new row */}
                                                    <Box display="flex" alignItems="center">
                                                        <Box>
                                                            Used:
                                                            <Typography variant="h4">
                                                                {leavesData.leaveCountsByUser[auth.user.id]
                                                                    ? leavesData.leaveCountsByUser[auth.user.id].find(item => item.leave_type === leaveType.type)?.days_used
                                                                    : 0}
                                                            </Typography>
                                                        </Box>

                                                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} /> {/* Vertical divider with horizontal margin */}

                                                        <Box>
                                                            Remaining:
                                                            <Typography variant="h4">
                                                                {leavesData.leaveCountsByUser[auth.user.id]
                                                                    ? leavesData.leaveCountsByUser[auth.user.id].find(item => item.leave_type === leaveType.type)?.remaining_days
                                                                    : 0}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </GlassCard>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                        <CardContent>
                            <LeaveEmployeeTable setLeavesData={setLeavesData} handleClickOpen={handleClickOpen} setCurrentLeave={setCurrentLeave} openModal={openModal} allLeaves={allLeaves} allUsers={allUsers}/>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};
LeavesEmployee.layout = (page) => <App>{page}</App>;

export default LeavesEmployee;
