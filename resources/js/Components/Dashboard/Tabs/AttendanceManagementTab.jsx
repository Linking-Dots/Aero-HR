import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Card, CardBody, CardHeader, Progress, Chip } from '@heroui/react';
import { 
    ClockIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const AttendanceManagementTab = ({ data = {}, selectedDate, onDateChange }) => {
    // Mock attendance data
    const attendanceData = {
        dailyStats: {
            present: 2388,
            presentPercentage: 96.8,
            late: 45,
            latePercentage: 1.8,
            absent: 32,
            absentPercentage: 1.3,
            onLeave: 15,
            onLeavePercentage: 0.6
        },
        realTimeStatus: {
            inOffice: 1850,
            workingRemote: 538,
            onBreak: 125,
            checkedOut: 287
        },
        monthlyTrend: [
            { month: 'J', rate: 94.5 },
            { month: 'F', rate: 95.2 },
            { month: 'M', rate: 96.1 },
            { month: 'A', rate: 96.5 },
            { month: 'M', rate: 97.2 },
            { month: 'J', rate: 96.8 },
            { month: 'J', rate: 96.5 },
            { month: 'A', rate: 96.8 },
            { month: 'S', rate: 97.1 },
            { month: 'O', rate: 96.9 },
            { month: 'N', rate: 96.2 },
            { month: 'D', rate: 96.8 }
        ],
        departmentBreakdown: [
            { department: 'Engineering', rate: 97.8, target: 95, status: 'good' },
            { department: 'HR', rate: 97.5, target: 95, status: 'good' },
            { department: 'Finance', rate: 96.2, target: 95, status: 'good' },
            { department: 'Marketing', rate: 95.8, target: 95, status: 'good' },
            { department: 'Sales', rate: 94.5, target: 95, status: 'warning' },
            { department: 'Operations', rate: 93.2, target: 95, status: 'critical' }
        ]
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'danger';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
            case 'warning': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
            case 'critical': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
            default: return null;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Attendance Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Real-time attendance tracking and monthly performance analysis
                </Typography>
            </Box>

            {/* Main Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Daily Attendance Stats */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Daily Attendance Summary
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'green.50', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'green.600' }}>
                                            {attendanceData.dailyStats.present}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Present ({attendanceData.dailyStats.presentPercentage}%)
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'yellow.50', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'yellow.600' }}>
                                            {attendanceData.dailyStats.late}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Late ({attendanceData.dailyStats.latePercentage}%)
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'red.50', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'red.600' }}>
                                            {attendanceData.dailyStats.absent}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Absent ({attendanceData.dailyStats.absentPercentage}%)
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'blue.50', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'blue.600' }}>
                                            {attendanceData.dailyStats.onLeave}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            On Leave ({attendanceData.dailyStats.onLeavePercentage}%)
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Real-time Status */}
                            <Box sx={{ 
                                p: 3, 
                                backgroundColor: 'gray.50', 
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'gray.200'
                            }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Real-time Status
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            In Office: <strong>{attendanceData.realTimeStatus.inOffice}</strong>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            Working Remote: <strong>{attendanceData.realTimeStatus.workingRemote}</strong>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            On Break: <strong>{attendanceData.realTimeStatus.onBreak}</strong>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            Checked Out: <strong>{attendanceData.realTimeStatus.checkedOut}</strong>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Monthly Trend */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Monthly Attendance Trend
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Box sx={{ 
                                height: 300, 
                                display: 'flex', 
                                alignItems: 'end', 
                                justifyContent: 'space-around',
                                px: 2 
                            }}>
                                {attendanceData.monthlyTrend.map((item, index) => (
                                    <Box 
                                        key={index}
                                        sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            flex: 1,
                                            mx: 0.5
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: `${((item.rate - 90) / 10) * 250}px`,
                                                backgroundColor: item.rate >= 96 ? 'green.500' : item.rate >= 95 ? 'yellow.500' : 'red.500',
                                                borderRadius: 1,
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'end',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                pb: 0.5
                                            }}
                                        >
                                            {item.rate}%
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                            {item.month}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Current Month: <strong>96.8%</strong> | 
                                    Previous Month: <strong>95.2%</strong> | 
                                    Year Average: <strong>96.1%</strong>
                                </Typography>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

            {/* Department Breakdown */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Department Attendance Breakdown
                    </Typography>
                </CardHeader>
                <CardBody>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {attendanceData.departmentBreakdown.map((dept, index) => (
                            <Box key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 100 }}>
                                            {dept.department}
                                        </Typography>
                                        {getStatusIcon(dept.status)}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Target: {dept.target}%
                                        </Typography>
                                        <Chip
                                            label={`${dept.rate}%`}
                                            color={getStatusColor(dept.status)}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                </Box>
                                <Progress
                                    value={dept.rate}
                                    color={getStatusColor(dept.status)}
                                    size="md"
                                    showValueLabel={false}
                                />
                                {dept.status === 'critical' && (
                                    <Typography variant="body2" color="error" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        Alert: {dept.department} department below target threshold!
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

export default AttendanceManagementTab;
