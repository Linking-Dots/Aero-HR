/**
 * Dashboard Page - Modern Architecture
 * Phase 6: Feature-based page organization
 * 
 * This replaces the legacy Dashboard.jsx with modern atomic design principles
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { 
    Box, 
    Grid, 
    Typography, 
    Card, 
    CardContent,
    Fade,
    useTheme,
    useMediaQuery 
} from '@mui/material';

// Modern architecture imports
import { GlassCard } from '@components';
import { trackFeatureLoad } from '@shared/utils/webVitals';

// Feature-specific components (will be migrated)
import StatisticCard from '@/Components/StatisticCard.jsx';
import PunchStatusCard from '@/Components/PunchStatusCard.jsx';
import LeaveCard from '@/Components/LeaveCard.jsx';
import UpdatesCards from '@/Components/UpdatesCards.jsx';
import UserLocationsCard from '@/Components/UserLocationsCard.jsx';
import TimeSheetTable from '@/Tables/TimeSheetTable.jsx';

/**
 * Modern Dashboard Page Component
 * 
 * Features:
 * - Modern atomic design structure
 * - Performance tracking
 * - Responsive design
 * - Glass morphism UI
 * - Feature-based organization
 */
const DashboardPage = ({ auth, title, attendanceToday, leaves, users, locations }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [loadTime] = useState(() => performance.now());

    // Track feature load performance
    useEffect(() => {
        const endTime = trackFeatureLoad('Dashboard', loadTime);
        console.log(`📊 Dashboard loaded in ${endTime.toFixed(2)}ms`);
    }, [loadTime]);

    // Memoized dashboard data
    const dashboardStats = useMemo(() => ({
        totalUsers: users?.length || 0,
        presentToday: attendanceToday?.filter(a => a.status === 'present').length || 0,
        pendingLeaves: leaves?.filter(l => l.status === 'pending').length || 0,
        activeLocations: locations?.length || 0
    }), [users, attendanceToday, leaves, locations]);

    return (
        <>
            <Head title={title || "Dashboard"} />
            
            <div className="container-modern">
                <Fade in timeout={300}>
                    <Box>
                        {/* Header */}
                        <Box mb={3}>
                            <Typography 
                                variant="h4" 
                                component="h1"
                                sx={{ 
                                    fontFamily: 'var(--font-primary)',
                                    fontWeight: 600,
                                    color: 'var(--glass-primary)',
                                    mb: 1
                                }}
                            >
                                Dashboard
                            </Typography>
                            <Typography 
                                variant="subtitle1" 
                                color="text.secondary"
                                sx={{ fontFamily: 'var(--font-primary)' }}
                            >
                                Welcome back, {auth?.user?.name || 'User'}! Here's your overview.
                            </Typography>
                        </Box>

                        {/* Statistics Grid */}
                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatisticCard
                                    title="Total Users"
                                    value={dashboardStats.totalUsers}
                                    icon="users"
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatisticCard
                                    title="Present Today"
                                    value={dashboardStats.presentToday}
                                    icon="check"
                                    color="success"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatisticCard
                                    title="Pending Leaves"
                                    value={dashboardStats.pendingLeaves}
                                    icon="clock"
                                    color="warning"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <StatisticCard
                                    title="Active Locations"
                                    value={dashboardStats.activeLocations}
                                    icon="location"
                                    color="info"
                                />
                            </Grid>
                        </Grid>

                        {/* Main Content Grid */}
                        <Grid container spacing={3}>
                            {/* Left Column */}
                            <Grid item xs={12} lg={8}>
                                {/* Punch Status */}
                                <Box mb={3}>
                                    <PunchStatusCard />
                                </Box>

                                {/* TimeSheet Table */}
                                <GlassCard>
                                    <CardContent>
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom
                                            sx={{ fontFamily: 'var(--font-primary)' }}
                                        >
                                            Recent Time Entries
                                        </Typography>
                                        <TimeSheetTable />
                                    </CardContent>
                                </GlassCard>
                            </Grid>

                            {/* Right Column */}
                            <Grid item xs={12} lg={4}>
                                {/* Leave Card */}
                                <Box mb={3}>
                                    <LeaveCard leaves={leaves} />
                                </Box>

                                {/* Updates Cards */}
                                <Box mb={3}>
                                    <UpdatesCards />
                                </Box>

                                {/* User Locations */}
                                {locations && (
                                    <UserLocationsCard 
                                        locations={locations}
                                        users={users}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>
            </div>
        </>
    );
};

export default DashboardPage;
