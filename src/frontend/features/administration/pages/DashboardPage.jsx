/**
 * Administration Dashboard Page
 * 
 * @file DashboardPage.jsx
 * @description System administration dashboard with analytics and controls
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - System overview and analytics
 * - User activity monitoring
 * - Performance metrics
 * - Security monitoring
 * - Configuration management
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    alpha,
    Chip,
    Fade,
    Divider
} from '@mui/material';
import {
    Dashboard,
    People,
    Security,
    Storage,
    Speed,
    TrendingUp,
    Warning,
    CheckCircle,
    Error,
    Refresh,
    Settings,
    Analytics,
    Monitor,
    CloudUpload
} from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import { useTheme } from "@mui/material/styles";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import { useSystemStats, useUserActivity, usePerformanceMetrics } from '../hooks';

/**
 * Administration Dashboard Page Component
 */
const DashboardPage = React.memo(({ auth, title }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Custom hooks
    const { systemStats, fetchSystemStats } = useSystemStats();
    const { userActivity, fetchUserActivity } = useUserActivity();
    const { performanceMetrics, fetchPerformanceMetrics } = usePerformanceMetrics();

    /**
     * Refresh all data
     */
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchSystemStats(),
                fetchUserActivity(),
                fetchPerformanceMetrics()
            ]);
        } catch (error) {
            console.error('Failed to refresh dashboard data:', error);
        } finally {
            setRefreshing(false);
        }
    }, [fetchSystemStats, fetchUserActivity, fetchPerformanceMetrics]);

    // Initial data fetch
    useEffect(() => {
        setLoading(true);
        handleRefresh().finally(() => setLoading(false));
    }, [handleRefresh]);

    /**
     * System Overview Cards
     */
    const SystemOverviewCards = useMemo(() => (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <People color="primary" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {systemStats.totalUsers || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Users
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <CheckCircle color="success" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {systemStats.systemHealth || '98%'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                System Health
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Storage color="warning" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {systemStats.storageUsed || '65%'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Storage Used
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        borderRadius: 3,
                        backdropFilter: 'blur(16px) saturate(200%)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Speed color="info" sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {performanceMetrics.avgResponseTime || '120ms'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avg Response Time
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    ), [systemStats, performanceMetrics, theme]);

    /**
     * Quick Actions Panel
     */
    const QuickActionsPanel = useMemo(() => (
        <GlassCard sx={{ mb: 3 }}>
            <CardHeader
                title="Quick Actions"
                action={
                    <IconButton 
                        onClick={handleRefresh} 
                        disabled={refreshing}
                        color="primary"
                    >
                        {refreshing ? <CircularProgress size={20} /> : <Refresh />}
                    </IconButton>
                }
            />
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<People />}
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            User Management
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Security />}
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            Security Settings
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Settings />}
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            System Config
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            Backup & Restore
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </GlassCard>
    ), [handleRefresh, refreshing]);

    /**
     * System Performance Chart
     */
    const PerformanceChart = useMemo(() => {
        const chartData = performanceMetrics.chartData || [
            { time: '00:00', cpu: 45, memory: 60, requests: 120 },
            { time: '04:00', cpu: 35, memory: 55, requests: 80 },
            { time: '08:00', cpu: 65, memory: 70, requests: 200 },
            { time: '12:00', cpu: 75, memory: 80, requests: 350 },
            { time: '16:00', cpu: 85, memory: 75, requests: 400 },
            { time: '20:00', cpu: 55, memory: 65, requests: 180 }
        ];

        return (
            <GlassCard sx={{ mb: 3 }}>
                <CardHeader title="System Performance (24h)" />
                <CardContent>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="cpu" 
                                    stroke={theme.palette.primary.main} 
                                    strokeWidth={2}
                                    name="CPU %"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="memory" 
                                    stroke={theme.palette.success.main} 
                                    strokeWidth={2}
                                    name="Memory %"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="requests" 
                                    stroke={theme.palette.warning.main} 
                                    strokeWidth={2}
                                    name="Requests/min"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </GlassCard>
        );
    }, [performanceMetrics, theme]);

    /**
     * Recent Activity Table
     */
    const RecentActivityTable = useMemo(() => (
        <GlassCard>
            <CardHeader title="Recent System Activity" />
            <CardContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(userActivity || []).map((activity, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Typography variant="body2">
                                        {activity.time || '10:30 AM'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {activity.user || `User ${index + 1}`}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {activity.action || 'Login'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={activity.status || 'Success'}
                                        color={activity.status === 'Failed' ? 'error' : 'success'}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!userActivity || userActivity.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No recent activity
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </GlassCard>
    ), [userActivity]);

    if (loading) {
        return (
            <App title={title} auth={auth}>
                <Head title={title} />
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress size={60} />
                </Box>
            </App>
        );
    }

    return (
        <App title={title} auth={auth}>
            <Head title={title} />
            
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Administration Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        System overview, monitoring, and administrative controls
                    </Typography>
                </Box>

                {/* System Overview Cards */}
                <Fade in timeout={800}>
                    <Box>{SystemOverviewCards}</Box>
                </Fade>

                {/* Quick Actions */}
                <Fade in timeout={1000}>
                    <Box>{QuickActionsPanel}</Box>
                </Fade>

                {/* Performance Chart */}
                <Fade in timeout={1200}>
                    <Box>{PerformanceChart}</Box>
                </Fade>

                {/* Recent Activity */}
                <Fade in timeout={1400}>
                    <Box>{RecentActivityTable}</Box>
                </Fade>
            </Box>
        </App>
    );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;
