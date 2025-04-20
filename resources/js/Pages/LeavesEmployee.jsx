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
import dayjs from "dayjs";
import { Input } from '@nextui-org/react';

const LeavesEmployee = ({ title, allUsers }) => {
    const {auth} = usePage().props;
    const {props} = usePage();
    const [leaves, setLeaves] = useState([]);
    const [openModalType, setOpenModalType] = useState(null);
    const [leavesData, setLeavesData] = useState({
        leaveTypes: [],
        leaveCountsByUser: {}
    });
    
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [leaveIdToDelete, setLeaveIdToDelete] = useState(null);
    const [employee, setEmployee] = useState('');
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLeave, setCurrentLeave] = useState();
    const [error, setError] = useState('');

    const openModal = (modalType) => setOpenModalType(modalType);

    const handleClickOpen = useCallback((leaveId, modalType) => {
        setLeaveIdToDelete(leaveId);
        setOpenModalType(modalType);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModalType(null);
        setLeaveIdToDelete(null);
    }, []);

    const handleSearch = (event) => setEmployee(event.target.value.toLowerCase());

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const fetchLeavesData = async () => {
        try {
            const response = await axios.get(route('leaves.paginate'), {
                params: {
                    page: currentPage,
                    perPage,
                    employee,
                    year: selectedYear
                },
            });
            console.log(response);

            if (response.status === 200) {
                
                const { leaves, leavesData } = response.data;
                setLeaves(leaves.data);
                setLeavesData(leavesData);
                setTotalRows(leaves.total);
                setLastPage(leaves.last_page);
            }
        } catch (error) {
            console.error('Error fetching leaves data:', error);
            setError(error.response?.data?.message || 'Error retrieving data.');
        }
    };

    useEffect(() => {
        console.log("User Effect Running");
        fetchLeavesData();
    }, [selectedYear, currentPage, perPage, employee]);

  

    return (
        <>
            <Head title={title} />
            

        
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Leaves"
                            sx={{padding: '24px'}}
                            
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                            
                                <Grid item xs={12} sm={6} md={4}>
                                    <Input
                                        label="Select Year"
                                        type="year"
                                        variant="bordered"
                                        onChange={handleYearChange}
                                        value={selectedYear}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardContent>
                            <Grid container spacing={2}>
                                {leavesData?.leaveTypes?.map((leaveType) => (
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
                            <LeaveEmployeeTable setLeavesData={setLeavesData} handleClickOpen={handleClickOpen} setCurrentLeave={setCurrentLeave} openModal={openModal} leaves={leaves} allUsers={allUsers}/>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};
LeavesEmployee.layout = (page) => <App>{page}</App>;

export default LeavesEmployee;
