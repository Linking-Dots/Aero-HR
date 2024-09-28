import React, {useState, useEffect, useCallback} from 'react';
import {Head, usePage} from '@inertiajs/react';
import {
    Box,
    Button,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    useMediaQuery, TextField, InputAdornment, CircularProgress
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
import dayjs from "dayjs";
import * as XLSX from 'xlsx';

const AttendanceAdmin = React.memo(({ title, allUsers  }) => {
    const theme = useTheme();
    const {auth} = usePage().props;
    const [attendanceData, setAttendanceData] = useState([]);
    const [leaveCounts, setLeaveCounts] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [employee, setEmployee] = useState('');
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    const [openModalType, setOpenModalType] = useState(null);

    const [filterData, setFilterData] = useState({
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
    });


    // Get the number of days in the current month
    const daysInMonth = dayjs(`${filterData.currentYear}-${filterData.currentMonth}-01`).daysInMonth();

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

            setAttendanceData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);
            setLeaveTypes(response.data.leaveTypes);
            setLeaveCounts(response.data.leaveCounts);

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

    const exportToExcel = async () => {
        const promise = new Promise((resolve, reject) => {
            try {
                // Prepare export data
                const exportData = allUsers.map((user, index) => {
                    const userAttendance = attendanceData.find((record) => record.user_id === user.id) || {};
                    const attendanceRow = {
                        sl: index + 1,
                        name: user.name,
                    };

                    // Attendance data for each day of the month
                    for (let i = 0; i < daysInMonth; i++) {
                        const day = i + 1;
                        const dateKey = dayjs(`${filterData.currentYear}-${filterData.currentMonth}-${day}`).format('YYYY-MM-DD');
                        attendanceRow[`day-${day}`] = userAttendance[dateKey] === 'present' ? '√' : '▼';
                    }

                    // Adding absence-related columns based on your provided image structure
                    attendanceRow.absence = user.absence || '-';
                    attendanceRow.personal = user.personal || '-';
                    attendanceRow.sick = user.sick || '-';
                    attendanceRow.marital = user.marital || '-';
                    attendanceRow.funeral = user.funeral || '-';
                    attendanceRow.maternity = user.maternity || '-';
                    attendanceRow.annualHoliday = user.annualHoliday || '-';
                    attendanceRow.festivalHoliday = user.festivalHoliday || '-';

                    return attendanceRow;
                });

                // Define columns with proper labels
                const columns = [
                    { label: 'Sl', key: 'sl' },
                    { label: 'Name', key: 'name' },
                    ...Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const date = dayjs(`${filterData.currentYear}-${filterData.currentMonth}-${day}`);
                        const weekday = date.format('ddd'); // Format day of the week (e.g., 'Fri')
                        return {
                            label: `${day}\n${weekday}`, // '1\nFri', '2\nSat', etc.
                            key: `day-${day}`,
                        };
                    }),
                    // Adding columns for absence-related data
                    { label: 'Absence', key: 'absence' },
                    { label: 'Personal', key: 'personal' },
                    { label: 'Sick', key: 'sick' },
                    { label: 'Marital', key: 'marital' },
                    { label: 'Funeral', key: 'funeral' },
                    { label: 'Maternity', key: 'maternity' },
                    { label: 'Annual Holiday', key: 'annualHoliday' },
                    { label: 'Festival Holiday', key: 'festivalHoliday' },
                ];

                // Create worksheet with headers
                const worksheet = XLSX.utils.json_to_sheet(exportData, { header: columns.map(col => col.key) });

                // Add headers (labels) manually to the worksheet
                columns.forEach((col, index) => {
                    const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
                    worksheet[cellAddress].v = col.label;
                });

                // Create and download Excel file
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
                XLSX.writeFile(workbook, 'AttendanceData.xlsx');

                // Notify success
                resolve('Export successful!');
            } catch (error) {
                // Handle any errors that occur during the export process
                reject('Failed to export data. Please try again.');
                console.error("Error exporting data to Excel:", error);
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Exporting data to Excel ...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                success: {
                    render({ data }) {
                        return (
                            <>
                                {data}
                            </>
                        );
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                error: {
                    render({ data }) {
                        return (
                            <>
                                {data}
                            </>
                        );
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                }
            }
        );
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
                                                        onClick={exportToExcel}
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
                                                        onClick={exportToExcel}
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
                                currentYear={filterData.currentYear}
                                currentMonth={filterData.currentMonth}
                                leaveTypes={leaveTypes}
                                leaveCounts={leaveCounts}
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
});
AttendanceAdmin.layout = (page) => <App>{page}</App>;

export default AttendanceAdmin;
