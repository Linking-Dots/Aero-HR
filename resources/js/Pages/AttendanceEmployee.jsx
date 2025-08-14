import React, { useState, useEffect, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
  Box,
  Typography,
  CircularProgress,
  Grow,
  useTheme,
  useMediaQuery,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  CardHeader as MuiCardHeader,
  CardContent as MuiCardContent
} from '@mui/material';
import axios from 'axios';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Divider,
  Button,
  Input,
  Pagination
} from "@heroui/react";
import { useTheme as useHeroTheme, alpha } from '@mui/material/styles';
import { Refresh, FileDownload, PictureAsPdf } from '@mui/icons-material';
import App from "@/Layouts/App.jsx";
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import TimeSheetTable from "@/Tables/TimeSheetTable.jsx";
import GlassCard from '@/Components/GlassCard.jsx';
import { 
  ClockIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  UserGroupIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PresentationChartLineIcon,
  DocumentArrowDownIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const AttendanceEmployee = React.memo(({ title, totalWorkingDays, presentDays, absentDays, lateArrivals }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [updateTimeSheet, setUpdateTimeSheet] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Filter data state - matching TimeSheetTable expectations
    const [filterData, setFilterData] = useState({
        currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
    });

    // Enhanced attendance stats state - matching industry standards
    const [attendanceStats, setAttendanceStats] = useState({
        // Basic metrics
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
        
        // Meta
        month: '',
        generated_at: null
    });

    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(new Date(newDate));
        setUpdateTimeSheet(prev => !prev);
    };

    // Handle filter changes
    const handleFilterChange = useCallback((key, value) => {
        setFilterData(prevState => ({
            ...prevState,
            [key]: value,
        }));
        setUpdateTimeSheet(prev => !prev);
    }, []);

    // Fetch enhanced monthly statistics for the current user
    const fetchMonthlyStats = useCallback(async () => {
        try {
            const statsResponse = await axios.get(route('attendance.myMonthlyStats'), {
                params: {
                    currentYear: filterData.currentMonth ? new Date(filterData.currentMonth).getFullYear() : new Date().getFullYear(),
                    currentMonth: filterData.currentMonth ? String(new Date(filterData.currentMonth).getMonth() + 1).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0'),
                    // userId is automatically determined from auth in backend
                }
            });
          

            if (statsResponse.data.success) {
                setAttendanceStats(statsResponse.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch monthly stats:', error);
        }
    }, [filterData.currentMonth]);    // Fetch stats when component mounts or filter changes
    useEffect(() => {
        fetchMonthlyStats();
    }, [fetchMonthlyStats]);    // Prepare all stats data for StatsCards component - Combined into one array
    const allStatsData = [
        {
            title: "Working Days",
            value: attendanceStats.totalWorkingDays,
            icon: <CalendarDaysIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: `Total for ${attendanceStats.month || 'this month'}`
        },
        {
            title: "Present Days",
            value: attendanceStats.presentDays,
            icon: <CheckCircleIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "Days attended this month"
        },
        {
            title: "Absent Days",
            value: attendanceStats.absentDays,
            icon: <XCircleIcon />,
            color: "text-red-400",
            iconBg: "bg-red-500/20",
            description: "Days missed this month"
        },
        {
            title: "Late Arrivals",
            value: attendanceStats.lateArrivals,
            icon: <ExclamationTriangleIcon />,
            color: "text-orange-400",
            iconBg: "bg-orange-500/20",
            description: "Times late this month"
        },
        {
            title: "Attendance Rate",
            value: `${attendanceStats.attendancePercentage}%`,
            icon: <ChartBarIcon />,
            color: "text-emerald-400",
            iconBg: "bg-emerald-500/20",
            description: "Your monthly performance"
        },
        {
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
            description: "Extra hours this month"
        },
        {
            title: "Leave Days",
            value: attendanceStats.totalLeaveDays,
            icon: <UserIcon />,
            color: "text-amber-400",
            iconBg: "bg-amber-500/20",
            description: "Leaves taken this month"
        }
    ];

    return (
        <>            <Head title={title || "My Attendance"} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="My Attendance"
                            subtitle="View your attendance records and timesheet details"
                            icon={<PresentationChartLineIcon className="w-8 h-8" />}
                            variant="default"
                            
                        >
                            <div className="p-6">
                                {/* All Stats - Responsive Layout for 8 cards */}
                                <StatsCards stats={allStatsData} className="mb-6" />
                                
                                {/* Filters Section - Matching AttendanceAdmin */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                                            <Input
                                                label="Month/Year"
                                                type="month"
                                                value={filterData.currentMonth}
                                                onChange={(e) => handleFilterChange('currentMonth', e.target.value)}
                                                startContent={<CalendarDaysIcon className="w-4 h-4" />}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                }}
                                                size={isMobile ? "sm" : "md"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Table - Matching AttendanceAdminTable */}
                                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                                    <MuiCardHeader
                                        title={
                                            <Box className="flex items-center gap-3">
                                                <ClockIcon className="w-6 h-6 text-primary" />
                                                <Typography 
                                                    variant="h5"
                                                    component="h1"
                                                    sx={{ 
                                                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    My Attendance Records
                                                </Typography>
                                            </Box>
                                        }
                                        
                                        sx={{ padding: '24px' }}
                                    />
                                    <Divider />
                                    <MuiCardContent>
                                        <Box sx={{ maxHeight: '84vh', overflowY: 'auto' }}>
                                            <TimeSheetTable 
                                                selectedDate={selectedDate} 
                                                handleDateChange={handleDateChange}                                                updateTimeSheet={updateTimeSheet}
                                                externalFilterData={filterData}
                                                key={`${selectedDate}-${filterData.currentMonth}`}
                                            />
                                        </Box>
                                    </MuiCardContent>
                                </div>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
});
AttendanceEmployee.layout = (page) => <App>{page}</App>;

export default AttendanceEmployee;
