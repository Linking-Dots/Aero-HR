import React, {useState, useEffect, useCallback} from 'react';
import {Head, usePage} from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
    Grid,
} from '@mui/material';
import { 
    Select, 
    SelectItem, 
    Card, 
    CardBody, 
    CardHeader,
    Divider,
    Chip,
    Button,
    Input,
    Pagination
} from "@heroui/react";
import { 
    CalendarIcon, 
    ChartBarIcon, 
    ClockIcon,
    UserIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    Cog6ToothIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { 
    MagnifyingGlassIcon 
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import App from "@/Layouts/App.jsx";
import AttendanceAdminTable from '@/Tables/AttendanceAdminTable.jsx';
import axios from "axios";
import {toast} from "react-toastify";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';

const AttendanceAdmin = React.memo(({ title, allUsers }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const {auth} = usePage().props;
    const [attendanceData, setAttendanceData] = useState([]);
    const [leaveCounts, setLeaveCounts] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [employee, setEmployee] = useState('');
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);

    const [filterData, setFilterData] = useState({
        currentMonth: dayjs().format('YYYY-MM'),
    });    // Enhanced attendance stats state
    const [attendanceStats, setAttendanceStats] = useState({
        // Basic metrics
        totalEmployees: 0,
        totalWorkingDays: 0,
        totalDaysInMonth: 0,
        holidaysCount: 0,
        weekendsCount: 0,
        
        // Attendance metrics
        presentDays: 0,
        absentDays: 0,
        lateArrivals: 0,
        attendancePercentage: 0,
        
        // Work time metrics
        averageWorkHours: 0,
        overtimeHours: 0,
        totalWorkHours: 0,
        
        // Leave metrics
        totalLeaveDays: 0,
        leaveBreakdown: {},
        
        // Today's stats
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        
        // Meta
        month: '',
        generated_at: null
    });





    // Get the number of days in the current month
    const daysInMonth = dayjs(`${filterData.currentYear}-${filterData.currentMonth}-01`).daysInMonth();

    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    }, []);    const fetchData = async (page, perPage, filterData) => {
        setLoading(true);

        try {
            // Fetch attendance data
            const response = await axios.get(route('attendancesAdmin.paginate'), {
                params: {
                    page,
                    perPage,
                    employee: employee,
                    currentYear: filterData.currentMonth ? dayjs(filterData.currentMonth).year() : '',
                    currentMonth: filterData.currentMonth ? dayjs(filterData.currentMonth).format('MM') : '',
                }
            });

            setAttendanceData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);
            setLeaveTypes(response.data.leaveTypes);
            setLeaveCounts(response.data.leaveCounts);

            // Fetch enhanced monthly statistics
            const statsResponse = await axios.get(route('attendance.monthlyStats'), {
                params: {
                    currentYear: filterData.currentMonth ? dayjs(filterData.currentMonth).year() : dayjs().year(),
                    currentMonth: filterData.currentMonth ? dayjs(filterData.currentMonth).format('MM') : dayjs().format('MM'),
                }
            });

            if (statsResponse.data.success) {
                setAttendanceStats(statsResponse.data.data);
            }

        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch data.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });

        } finally {
            setLoading(false);
        }
    };    const handleSearch = (event) => {
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
                        attendanceRow[`day-${day}`] = userAttendance[dateKey] || '▼';
                    }

                    // Adding leave counts
                    leaveTypes.forEach((type) => {
                        attendanceRow[type.type] = leaveCounts[user.id]?.[type.type] || 0;
                    });

                    return attendanceRow;
                });

                // Define columns with proper labels
                const columns = [
                    { label: 'Sl', key: 'sl' },
                    { label: 'Name', key: 'name' },
                    ...Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        return {
                            label: `${day}`,
                            key: `day-${day}`,
                        };
                    }),
                    ...leaveTypes.map((type) => ({
                        label: type.type,
                        key: type.type,
                    })),
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
                        background: theme.glassCard.background,
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
                        background: theme.glassCard.background,
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
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                }
            }
        );
    };    // Render Enhanced Quick Stats with industry-standard monthly metrics
    const renderQuickStats = () => (
        <div className="mb-6">
            {/* Primary Stats Row */}
            <Grid container spacing={3} className="mb-4">
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-blue-600"
                                >
                                    Total Employees
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-blue-600"
                            >
                                {attendanceStats.totalEmployees}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Active employees
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-indigo-600"
                                >
                                    Working Days
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-indigo-600"
                            >
                                {attendanceStats.totalWorkingDays}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                This month ({attendanceStats.month})
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-green-600"
                                >
                                    Present Today
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-green-600"
                            >
                                {attendanceStats.presentToday}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {attendanceStats.presentToday > 0 
                                    ? `${((attendanceStats.presentToday / attendanceStats.totalEmployees) * 100).toFixed(1)}% of employees`
                                    : 'No attendance yet'
                                }
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <XCircleIcon className="w-5 h-5 text-red-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-red-600"
                                >
                                    Absent Today
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-red-600"
                            >
                                {attendanceStats.absentToday}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {attendanceStats.absentToday > 0 
                                    ? `${((attendanceStats.absentToday / attendanceStats.totalEmployees) * 100).toFixed(1)}% absent`
                                    : 'All present'
                                }
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-orange-600"
                                >
                                    Late Today
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-orange-600"
                            >
                                {attendanceStats.lateToday}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Late arrivals today
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

            {/* Monthly Analytics Row */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-emerald-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-emerald-600"
                                >
                                    Attendance Rate
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-emerald-600"
                            >
                                {attendanceStats.attendancePercentage}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Monthly average
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-blue-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-blue-600"
                                >
                                    Avg Work Hours
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-blue-600"
                            >
                                {attendanceStats.averageWorkHours}h
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Daily average this month
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-purple-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-purple-600"
                                >
                                    Overtime
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-purple-600"
                            >
                                {attendanceStats.overtimeHours}h
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total overtime this month
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-amber-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-amber-600"
                                >
                                    Leave Days
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-amber-600"
                            >
                                {attendanceStats.totalLeaveDays}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total leaves this month
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );




    return (
        <>
            <Head title={title} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <div className="overflow-hidden">
                            {/* Header Section - Matching LeavesAdmin */}
                            <div className="bg-gradient-to-br from-slate-50/50 to-white/30 backdrop-blur-sm border-b border-white/20">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                                                <PresentationChartLineIcon className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <Typography 
                                                    variant={isMobile ? "h5" : "h4"} 
                                                    className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                                >
                                                    Attendance Management
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Monitor and manage employee attendance records
                                                </Typography>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2 flex-wrap">
                                            {auth.roles.includes('Administrator') && (
                                                <Button
                                                    variant="bordered"
                                                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                                    className="border-white/20 bg-white/5 hover:bg-white/10"
                                                    onPress={exportToExcel}
                                                >
                                                    Export
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Divider className="border-white/10" />

                            <div className="p-6">
                                {/* Quick Stats */}
                                {renderQuickStats()}
                                
                                {/* Filters Section */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                                            <Input
                                                label="Search Employee"
                                                type="text"
                                                value={employee}
                                                onChange={handleSearch}
                                                placeholder="Enter employee name..."
                                                startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                }}
                                                size={isMobile ? "sm" : "md"}
                                            />
                                        </div>
                                        
                                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                                            <Input
                                                label="Month/Year"
                                                type="month"
                                                value={filterData.currentMonth}
                                                onChange={(e) => handleFilterChange('currentMonth', e.target.value)}
                                                startContent={<CalendarIcon className="w-4 h-4" />}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                }}
                                                size={isMobile ? "sm" : "md"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Table */}
                                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                                    <AttendanceAdminTable
                                        attendanceData={attendanceData}
                                        currentYear={filterData.currentYear}
                                        currentMonth={filterData.currentMonth}
                                        leaveTypes={leaveTypes}
                                        leaveCounts={leaveCounts}
                                        loading={loading}
                                    />
                                    
                                    {/* Pagination */}
                                    {totalRows >= 30 && (
                                        <div className="py-4 px-2 flex justify-center items-center">
                                            <Pagination
                                                initialPage={1}
                                                isCompact
                                                showControls
                                                showShadow
                                                color="primary"
                                                variant="bordered"
                                                page={currentPage}
                                                total={lastPage}
                                                onChange={handlePageChange}
                                                classNames={{
                                                    wrapper: "bg-white/10 backdrop-blur-md border-white/20",
                                                    item: "bg-white/5 border-white/10",
                                                    cursor: "bg-primary/20 backdrop-blur-md"
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
});
AttendanceAdmin.layout = (page) => <App>{page}</App>;

export default AttendanceAdmin;
