import React, {useState, useEffect, useCallback} from 'react';
import {Head, usePage} from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Grid,
    Avatar,
    IconButton,
    useMediaQuery, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import {Add, CalendarMonth, Download, Upload} from '@mui/icons-material';
import GlassCard from '@/Components/GlassCard.jsx'; // Ensure this component is imported if you have custom styles
import App from "@/Layouts/App.jsx";
import AttendanceAdminTable from '@/Tables/AttendanceAdminTable.jsx';
import Grow from "@mui/material/Grow";
import axios from "axios";
import {toast} from "react-toastify";
import SearchIcon from "@mui/icons-material/Search.js";
import {Pagination} from "@nextui-org/react";
import {useTheme} from "@mui/material/styles";

const AttendanceAdmin = ({ title, allUsers }) => {
    const theme = useTheme();
    const {auth} = usePage().props;
    const [attendanceData, setAttendanceData] = useState(usePage().props.attendanceData);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [employee, setEmployee] = useState('');
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);

    const [filterData, setFilterData] = useState({
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
    });

    console.log(filterData);

    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    }, []);

    const fetchData = async (page, perPage, filterData) => {
        try {
            const response = await axios.get(route('attendancesAdmin.paginate'), {
                params: {
                    page,
                    perPage,
                    employee: employee, // Assuming 'report' is the search field
                    currentYear: filterData.currentYear !== 'all' ? filterData.currentYear : '',
                    currentMonth: filterData.currentMonth !== 'all' ? filterData.currentMonth : '',
                }
            });

            console.log(response)
            setAttendanceData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);

        } catch (error) {
            console.log(error)
            toast.error('Failed to fetch data.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });

        }
    };

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setEmployee(value);
    };



    useEffect(() => {
        fetchData(currentPage, perPage, filterData);
    }, [currentPage, perPage, filterData, employee]);


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    console.log(attendanceData)

    return (
        <>
            <Head title={title} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Attendances"
                            sx={{padding: '24px'}}
                            action={
                                <Box display="flex" gap={2}>
                                    {auth.roles.includes('Administrator') && (
                                        <>
                                            {isMobile ? (
                                                <>
                                                    <IconButton
                                                        title="Export Daily Works"
                                                        color="success"
                                                        onClick={() => openModal('exportDailyWorks')}
                                                    >
                                                        <Download />
                                                    </IconButton>
                                                </>

                                            ) : (
                                                <>
                                                    <Button
                                                        title="Export Daily Works"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<Download />}
                                                        onClick={() => openModal('exportDailyWorks')}
                                                    >
                                                        Export
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Box>
                            }
                        />
                        <CardContent>
                            <Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            label="Employee"
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Employee..."
                                            value={employee}
                                            onChange={handleSearch}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={3}>
                                        <TextField
                                            label="Current Month"
                                            type={'month'}
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Month..."
                                            value={filterData.currentMonth}
                                            onChange={(e) => handleFilterChange('currentMonth', e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarMonth />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={3}>
                                        <TextField
                                            label="Current Year"
                                            type={'year'}
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Year..."
                                            value={filterData.currentYear}
                                            onChange={(e) => handleFilterChange('currentYear', e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarMonth />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                        <CardContent>
                            <AttendanceAdminTable
                                allUsers={allUsers}
                                attendanceData={attendanceData}
                            />
                            {totalRows >= 30 && (
                                <div className="py-2 px-2 flex justify-center items-center">
                                    <Pagination
                                        initialPage={1}
                                        isCompact
                                        showControls
                                        showShadow
                                        color="primary"
                                        variant={'bordered'}
                                        page={currentPage}
                                        total={lastPage}
                                        onChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};
AttendanceAdmin.layout = (page) => <App>{page}</App>;

export default AttendanceAdmin;
