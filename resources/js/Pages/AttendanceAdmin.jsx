import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
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
        );    };    // Prepare all stats data for StatsCards component - Combined into one array
    const allStatsData = useMemo(() => [
        {            title: "Total Employees",
            value: attendanceStats.totalEmployees,
            icon: <UserGroupIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "Active employees"
        },
        {
            title: "Working Days", 
            value: attendanceStats.totalWorkingDays,
            icon: <CalendarIcon />,
            color: "text-indigo-600",
            iconBg: "bg-indigo-500/20",
            description: `This month (${attendanceStats.month})`
        },
        {
            title: "Present Today",
            value: attendanceStats.presentToday,
            icon: <CheckCircleIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20", 
            description: attendanceStats.presentToday > 0 
                ? `${((attendanceStats.presentToday / attendanceStats.totalEmployees) * 100).toFixed(1)}% of employees`
                : 'No attendance yet'
        },
        {
            title: "Absent Today",
            value: attendanceStats.absentToday,
            icon: <XCircleIcon />,
            color: "text-red-400",
            iconBg: "bg-red-500/20",
            description: attendanceStats.absentToday > 0 
                ? `${((attendanceStats.absentToday / attendanceStats.totalEmployees) * 100).toFixed(1)}% absent`
                : 'All present'
        },
        {
            title: "Late Today",
            value: attendanceStats.lateToday,
            icon: <ExclamationTriangleIcon />,
            color: "text-orange-400",
            iconBg: "bg-orange-500/20",
            description: "Late arrivals today"
        },
        {
            title: "Attendance Rate",
            value: `${attendanceStats.attendancePercentage}%`,
            icon: <ChartBarIcon />,
            color: "text-emerald-600",
            iconBg: "bg-emerald-500/20",
            description: "Monthly average"
        },        {
            title: "Avg Work Hours", 
            value: `${attendanceStats.averageWorkHours}h`,
            icon: <ClockIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "Daily average this month"
        },
        {
            title: "Overtime",
            value: `${attendanceStats.overtimeHours}h`,
            icon: <ClockIcon />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20", 
            description: "Total overtime this month"
        },
        {
            title: "Leave Days",
            value: attendanceStats.totalLeaveDays,
            icon: <UserIcon />,
            color: "text-amber-600",
            iconBg: "bg-amber-500/20",
            description: "Total leaves this month"
        }
    ], [attendanceStats]);




    return (
        <>            <Head title={title} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Attendance Management"
                            subtitle="Monitor and manage employee attendance records"
                            icon={<PresentationChartLineIcon className="w-8 h-8" />}
                            variant="default"
                            actionButtons={auth.roles.includes('Administrator') ? [
                                {
                                    label: "Export",
                                    icon: <DocumentArrowDownIcon className="w-4 h-4" />,
                                    variant: "bordered",
                                    onPress: exportToExcel,
                                    className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
                                }
                            ] : []}                        >                            <div className="p-6">
                                {/* All Stats - Responsive Layout for 9 cards */}
                                <StatsCards 
                                    stats={allStatsData} 
                                    className="mb-6"
                                />
                                
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
                                                }}                                            />                                        </div>
                                    )}
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
});
AttendanceAdmin.layout = (page) => <App>{page}</App>;

export default AttendanceAdmin;
