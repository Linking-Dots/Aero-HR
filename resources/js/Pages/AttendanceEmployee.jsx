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
    }, [filterData.currentMonth]);

    // Fetch stats when component mounts or filter changes
    useEffect(() => {
        fetchMonthlyStats();
    }, [fetchMonthlyStats]);

    // Render Enhanced Quick Stats with industry-standard monthly metrics
    const renderQuickStats = () => (
        <div className="mb-6">
            {/* Primary Stats Row */}
            <Grid container spacing={3} className="mb-4">
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-blue-600"
                                >
                                    Working Days
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-blue-600"
                            >
                                {attendanceStats.totalWorkingDays}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total for {attendanceStats.month || 'this month'}
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-green-600"
                                >
                                    Present Days
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-green-600"
                            >
                                {attendanceStats.presentDays}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Days attended this month
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <XCircleIcon className="w-5 h-5 text-red-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-red-600"
                                >
                                    Absent Days
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-red-600"
                            >
                                {attendanceStats.absentDays}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Days missed this month
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    className="font-semibold text-orange-600"
                                >
                                    Late Arrivals
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <Typography 
                                variant={isMobile ? "h4" : "h3"} 
                                className="font-bold text-orange-600"
                            >
                                {attendanceStats.lateArrivals}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Times late this month
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

            {/* Performance Analytics Row */}
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
                                Your monthly performance
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
                                Extra hours this month
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
                                Leaves taken this month
                            </Typography>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );

    return (
        <>
            <Head title={title || "My Attendance"} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <div className="overflow-hidden">
                            {/* Header Section - Matching AttendanceAdmin */}
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
                                                    My Attendance
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    View your attendance records and timesheet details
                                                </Typography>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons - Matching AttendanceAdmin pattern */}
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                color="primary"
                                                variant="flat"
                                                startContent={<CalendarDaysIcon className="w-4 h-4" />}
                                                onPress={() => {
                                                    setSelectedDate(new Date());
                                                    setFilterData({
                                                        currentMonth: new Date().toISOString().slice(0, 7)
                                                    });
                                                    setUpdateTimeSheet(prev => !prev);
                                                }}
                                                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30"
                                            >
                                                Today
                                            </Button>
                                            
                                            <Button
                                                color="success"
                                                variant="flat"
                                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30"
                                            >
                                                Export
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Divider className="border-white/10" />

                            <div className="p-6">
                                {/* Quick Stats - Matching AttendanceAdmin */}
                                {renderQuickStats()}
                                
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
                                        action={
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Download as Excel">
                                                    <IconButton 
                                                        disabled={loading}
                                                        sx={{
                                                            background: alpha(theme.palette.success.main, 0.1),
                                                            backdropFilter: 'blur(10px)',
                                                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                                            '&:hover': {
                                                                background: alpha(theme.palette.success.main, 0.2),
                                                                transform: 'scale(1.05)'
                                                            },
                                                            '&:disabled': { opacity: 0.5 }
                                                        }}
                                                    >
                                                        <FileDownload sx={{ color: theme.palette.success.main }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Download as PDF">
                                                    <IconButton 
                                                        disabled={loading}
                                                        sx={{
                                                            background: alpha(theme.palette.error.main, 0.1),
                                                            backdropFilter: 'blur(10px)',
                                                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                                            '&:hover': {
                                                                background: alpha(theme.palette.error.main, 0.2),
                                                                transform: 'scale(1.05)'
                                                            },
                                                            '&:disabled': { opacity: 0.5 }
                                                        }}
                                                    >
                                                        <PictureAsPdf sx={{ color: theme.palette.error.main }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Refresh Data">
                                                    <IconButton 
                                                        onClick={() => {
                                                            setSelectedDate(new Date());
                                                            setFilterData({
                                                                currentMonth: new Date().toISOString().slice(0, 7)
                                                            });
                                                            setUpdateTimeSheet(prev => !prev);
                                                        }}
                                                        disabled={loading}
                                                        sx={{
                                                            background: alpha(theme.palette.primary.main, 0.1),
                                                            backdropFilter: 'blur(10px)',
                                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                            '&:hover': {
                                                                background: alpha(theme.palette.primary.main, 0.2),
                                                                transform: 'scale(1.05)'
                                                            },
                                                            '&:disabled': { opacity: 0.5 }
                                                        }}
                                                    >
                                                        <Refresh color="primary" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        }
                                        sx={{ padding: '24px' }}
                                    />
                                    <Divider />
                                    <MuiCardContent>
                                        <Box sx={{ maxHeight: '84vh', overflowY: 'auto' }}>
                                            <TimeSheetTable 
                                                selectedDate={selectedDate} 
                                                handleDateChange={handleDateChange}  
                                                updateTimeSheet={updateTimeSheet}
                                                externalFilterData={filterData}
                                                key={`${selectedDate}-${filterData.currentMonth}`}
                                            />
                                        </Box>
                                    </MuiCardContent>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
});
AttendanceEmployee.layout = (page) => <App>{page}</App>;

export default AttendanceEmployee;
