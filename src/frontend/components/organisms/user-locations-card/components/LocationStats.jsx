/**
 * Location Statistics Component
 * 
 * Displays statistical overview of user locations including active users,
 * total check-ins, and average distance from office.
 * 
 * @component
 * @example
 * ```jsx
 * <LocationStats 
 *   userStats={{
 *     totalUsers: 25,
 *     activeUsers: 18,
 *     averageDistance: 2.5,
 *     checkInsToday: 22
 *   }}
 *   theme={muiTheme}
 * />
 * ```
 */

import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    Stack,
    Chip
} from '@mui/material';
import {
    Groups,
    AccessTime,
    Place,
    Timeline,
    CheckCircle,
    LocationOn
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * Individual stat card component
 */
const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    unit = '', 
    color = 'primary',
    theme,
    subtitle = null 
}) => (
    <Paper 
        sx={{ 
            p: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)}, ${alpha(theme.palette[color].main, 0.02)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
            borderRadius: 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
                border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`
            }
        }}
        elevation={0}
    >
        <Stack spacing={1.5}>
            {/* Icon and Value Row */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
            }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`
                    }}
                >
                    <Icon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 700,
                        color: theme.palette[color].main,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                >
                    {value}{unit}
                </Typography>
            </Box>

            {/* Label */}
            <Typography 
                variant="body2" 
                sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.875rem'
                }}
            >
                {label}
            </Typography>

            {/* Optional Subtitle */}
            {subtitle && (
                <Chip
                    label={subtitle}
                    size="small"
                    sx={{
                        background: alpha(theme.palette[color].main, 0.1),
                        color: theme.palette[color].main,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        '& .MuiChip-label': {
                            px: 1
                        }
                    }}
                />
            )}
        </Stack>
    </Paper>
);

/**
 * Main LocationStats Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.userStats - Statistics object with user data
 * @param {number} props.userStats.totalUsers - Total number of users
 * @param {number} props.userStats.activeUsers - Number of active users
 * @param {number} props.userStats.averageDistance - Average distance from office (km)
 * @param {number} props.userStats.checkInsToday - Number of check-ins today
 * @param {Object} props.theme - MUI theme object
 * @returns {JSX.Element} Rendered LocationStats component
 */
const LocationStats = ({ userStats = {}, theme }) => {
    // Default values
    const {
        totalUsers = 0,
        activeUsers = 0,
        averageDistance = 0,
        checkInsToday = 0,
        lastUpdate = null
    } = userStats;

    // Calculate activity percentage
    const activityPercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    /**
     * Format distance with appropriate units
     */
    const formatDistance = (distance) => {
        if (distance === 0) return '0';
        if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
        return distance.toFixed(1);
    };

    /**
     * Get distance unit
     */
    const getDistanceUnit = (distance) => {
        if (distance === 0) return '';
        if (distance < 1) return '';
        return 'km';
    };

    /**
     * Format last update time
     */
    const formatLastUpdate = () => {
        if (!lastUpdate) return null;
        
        try {
            const updateTime = new Date(lastUpdate);
            const now = new Date();
            const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));
            
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            
            return updateTime.toLocaleDateString();
        } catch (error) {
            return null;
        }
    };

    return (
        <Box sx={{ px: 3, pb: 2 }}>
            <Grid container spacing={2}>
                {/* Total Users */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={Groups}
                        label="Total Team Members"
                        value={totalUsers}
                        color="primary"
                        theme={theme}
                        subtitle={lastUpdate ? `Updated ${formatLastUpdate()}` : null}
                    />
                </Grid>

                {/* Active Users */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={CheckCircle}
                        label="Active Today"
                        value={activeUsers}
                        color="success"
                        theme={theme}
                        subtitle={`${activityPercentage}% activity rate`}
                    />
                </Grid>

                {/* Check-ins Today */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={AccessTime}
                        label="Check-ins Today"
                        value={checkInsToday}
                        color="info"
                        theme={theme}
                        subtitle={checkInsToday > 0 ? "Live tracking" : "No data"}
                    />
                </Grid>

                {/* Average Distance */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={LocationOn}
                        label="Avg. Distance from Office"
                        value={formatDistance(averageDistance)}
                        unit={getDistanceUnit(averageDistance)}
                        color="warning"
                        theme={theme}
                        subtitle={averageDistance > 0 ? "From office" : "No location data"}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default LocationStats;
