import React, { useEffect, useState } from 'react';
import { Box, CardContent, Grid, Typography } from '@mui/material';
import { blue, green, yellow, orange } from '@mui/material/colors';
import Grow from '@mui/material/Grow';
import GlassCard from '../../atoms/glass-card';
import { 
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { Skeleton, Card } from '@heroui/react';

/**
 * StatisticCard Component - Atomic Design: Molecule
 * 
 * A reusable card component for displaying statistical information.
 * Combines atoms (GlassCard, Typography, Icons) to create a cohesive data display.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The title of the statistic
 * @param {number|string} props.value - The statistical value to display
 * @param {React.Component} props.icon - Icon component to display
 * @param {string} props.color - Color theme for the icon background
 * @param {boolean} props.isLoaded - Loading state for skeleton display
 * @param {string} props.testId - Test identifier for testing
 * @returns {JSX.Element} Rendered StatisticCard component
 */
const StatisticCard = ({ title, value, icon: IconComponent, color, isLoaded, testId }) => (
    <Grow in timeout={300}>
        <GlassCard sx={{ height: '100%' }}>
            <CardContent sx={{ 
                p: { xs: 2, sm: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Skeleton 
                    className="rounded-lg" 
                    isLoaded={isLoaded}
                    data-testid={testId}
                >
                    <Box 
                        display="flex" 
                        flexDirection="column" 
                        gap={2}
                        role="region"
                        aria-label={`${title} statistics`}
                        sx={{ height: '100%' }}
                    >
                        {/* Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography 
                                variant="body2"
                                color="text.secondary" 
                                sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                    fontWeight: 500,
                                    lineHeight: 1.2,
                                    flex: 1,
                                    mr: 1
                                }}
                                component="h3"
                            >
                                {title}
                            </Typography>
                            <Box
                                sx={{
                                    bgcolor: `${color}20`,
                                    borderRadius: '12px',
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: { xs: 40, sm: 48 },
                                    minHeight: { xs: 40, sm: 48 },
                                    flexShrink: 0
                                }}
                            >
                                <IconComponent 
                                    style={{ 
                                        width: '24px', 
                                        height: '24px', 
                                        color: color,
                                        strokeWidth: 2
                                    }}
                                    aria-hidden="true"
                                />
                            </Box>
                        </Box>

                        {/* Value */}
                        <Box sx={{ mt: 'auto' }}>
                            <Typography 
                                variant="h4"
                                component="div"
                                sx={{ 
                                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '2rem', xl: '2.5rem' },
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    lineHeight: 1
                                }}
                                aria-live="polite"
                            >
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </Typography>
                        </Box>
                    </Box>
                </Skeleton>
            </CardContent>
        </GlassCard>
    </Grow>
);

/**
 * StatisticsWidgets Component - Atomic Design: Organism
 * 
 * A dashboard widget that displays multiple statistical cards.
 * Manages data fetching and provides a complete statistics overview.
 * 
 * @component
 * @returns {JSX.Element} Rendered StatisticsWidgets component
 */
const StatisticsWidgets = () => {
    const [statistics, setStatistics] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        rfi_submissions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(route('stats'), {
                    signal: controller.signal,
                    timeout: 10000 // 10 second timeout
                });
                
                if (isMounted && response.data?.statistics) {
                    setStatistics(response.data.statistics);
                } else {
                    throw new Error('Invalid response structure');
                }
            } catch (err) {
                if (isMounted && !controller.signal.aborted) {
                    console.error('Failed to fetch statistics:', err);
                    setError(err.message);
                    setStatistics({
                        total: 0,
                        completed: 0,
                        pending: 0,
                        rfi_submissions: 0
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchStatistics();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const statisticsConfig = [
        {
            id: 'total-daily-works',
            title: 'Total Daily Works',
            value: statistics.total,
            icon: ClipboardDocumentListIcon,
            color: blue[600],
            testId: 'stat-total-works'
        },
        {
            id: 'completed-daily-works',
            title: 'Completed Daily Works',
            value: statistics.completed,
            icon: CheckCircleIcon,
            color: green[600],
            testId: 'stat-completed-works'
        },
        {
            id: 'pending-daily-works',
            title: 'Pending Daily Works',
            value: statistics.pending,
            icon: ClockIcon,
            color: orange[600],
            testId: 'stat-pending-works'
        },
        {
            id: 'rfi-submissions',
            title: 'RFI Submissions',
            value: statistics.rfi_submissions,
            icon: DocumentTextIcon,
            color: blue[600],
            testId: 'stat-rfi-submissions'
        }
    ];

    if (error) {
        return (
            <Box 
                sx={{ 
                    flexGrow: 1, 
                    pt: 2, 
                    pr: 2, 
                    pl: 2, 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Card className="p-4 bg-danger-50 border-danger-200">
                    <Typography color="error" variant="body1">
                        Failed to load statistics: {error}
                    </Typography>
                </Card>
            </Box>
        );
    }

    return (
        <Box 
            sx={{ 
                flexGrow: 1, 
                pt: 2, 
                pr: 2, 
                pl: 2, 
                height: '100%' 
            }}
            component="section"
            aria-label="Statistics Dashboard"
        >
            <Grid 
                container 
                spacing={{ xs: 2, sm: 2, md: 2 }}
                sx={{ 
                    height: '100%',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }} 
                alignItems="stretch"
            >
                {statisticsConfig.map((stat, index) => (
                    <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={6} 
                        lg={6}
                        xl={6}
                        key={stat.id}
                        
                    >
                        <StatisticCard
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            isLoaded={!loading}
                            testId={stat.testId}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export { StatisticCard };
export default StatisticsWidgets;
