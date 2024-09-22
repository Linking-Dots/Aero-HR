import React, {useState, useEffect, useCallback} from 'react';
import {Head, usePage} from '@inertiajs/react';
import {Box, Button, Card, CardContent, CardHeader, Typography, Grid, Avatar} from '@mui/material';
import { Add } from '@mui/icons-material';
import GlassCard from '@/Components/GlassCard.jsx'; // Ensure this component is imported if you have custom styles
import App from "@/Layouts/App.jsx";
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';
import LeaveForm from "@/Forms/LeaveForm.jsx";
import Grow from "@mui/material/Grow";
import DeleteLeaveForm from "@/Forms/DeleteLeaveForm.jsx";

const LeavesAdmin = ({ title, allUsers }) => {
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
                    allUsers={allUsers}
                    open={openModalType === 'add_leave'}
                    setLeavesData={setLeavesData}
                    closeModal={closeModal}
                    leavesData={leavesData}
                />
            )}
            {openModalType === 'edit_leave' && (
                <LeaveForm
                    allUsers={allUsers}
                    open={openModalType === 'edit_leave'}
                    setLeavesData={setLeavesData}
                    closeModal={closeModal}
                    leavesData={leavesData}
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
                            {/*<Grid container spacing={2}>*/}
                            {/*    {leavesData.leaveCounts.map((leave) => (*/}
                            {/*        <Grid item xs={6} sm={6} md={3} key={leave.leave_type}>*/}
                            {/*            <GlassCard>*/}
                            {/*                <CardContent>*/}
                            {/*                    <Box*/}
                            {/*                        display="flex"*/}
                            {/*                        justifyContent="center"*/}
                            {/*                        alignItems="center"*/}
                            {/*                        height="100%"*/}
                            {/*                        textAlign="center"*/}
                            {/*                    >*/}
                            {/*                        <Box>*/}
                            {/*                            <Typography variant="h6">{leave.leave_type}</Typography>*/}
                            {/*                            <Typography variant="h4">{leave.days_used}</Typography>*/}
                            {/*                        </Box>*/}
                            {/*                    </Box>*/}
                            {/*                </CardContent>*/}
                            {/*            </GlassCard>*/}
                            {/*        </Grid>*/}
                            {/*    ))}*/}
                            {/*</Grid>*/}
                        </CardContent>
                        <CardContent>
                            <LeaveEmployeeTable handleClickOpen={handleClickOpen} setCurrentLeave={setCurrentLeave} openModal={openModal} allLeaves={allLeaves} allUsers={allUsers} setLeavesData={setLeavesData}/>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};
LeavesAdmin.layout = (page) => <App>{page}</App>;

export default LeavesAdmin;
