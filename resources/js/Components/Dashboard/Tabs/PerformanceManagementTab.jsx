import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Card, CardBody, CardHeader, Progress, Chip } from '@heroui/react';
import { 
    TrophyIcon,
    TargetIcon,
    ChartBarIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const PerformanceManagementTab = ({ data = {} }) => {
    // Mock performance data
    const performanceData = {
        overallScore: 4.1,
        distribution: [
            { rating: 5, label: '★★★★★', count: 612, percentage: 25 },
            { rating: 4, label: '★★★★☆', count: 1103, percentage: 45 },
            { rating: 3, label: '★★★☆☆', count: 612, percentage: 25 },
            { rating: 2, label: '★★☆☆☆', count: 98, percentage: 4 },
            { rating: 1, label: '★☆☆☆☆', count: 25, percentage: 1 }
        ],
        goals: {
            q4Goals: 78,
            annualGoals: 65,
            departmentGoals: 72,
            individualGoals: 81,
            reviewCompletion: 92,
            nextReviewCycle: 45
        },
        trendData: [
            { month: 'J', score: 3.8 },
            { month: 'F', score: 3.9 },
            { month: 'M', score: 4.0 },
            { month: 'A', score: 4.1 },
            { month: 'M', score: 4.2 },
            { month: 'J', score: 4.1 },
            { month: 'J', score: 4.1 },
            { month: 'A', score: 4.0 },
            { month: 'S', score: 4.2 },
            { month: 'O', score: 4.1 },
            { month: 'N', score: 4.0 },
            { month: 'D', score: 4.1 }
        ],
        topPerformers: 612,
        needsDevelopment: 123
    };

    const getRatingColor = (rating) => {
        switch (rating) {
            case 5: return 'success';
            case 4: return 'primary';
            case 3: return 'warning';
            case 2: return 'danger';
            case 1: return 'danger';
            default: return 'default';
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Performance Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Employee performance scores, goal achievement, and review tracking
                </Typography>
            </Box>

            {/* Main Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Performance Scores */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Performance Scores
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            {/* Overall Score */}
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {performanceData.overallScore}/5
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Average Performance Score
                                </Typography>
                            </Box>

                            {/* Distribution */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Performance Distribution:
                                </Typography>
                                {performanceData.distribution.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ minWidth: 60, color: getRatingColor(item.rating) === 'success' ? 'green.600' : 
                                                   getRatingColor(item.rating) === 'danger' ? 'red.600' : 
                                                   getRatingColor(item.rating) === 'warning' ? 'yellow.600' : 'blue.600' }}
                                        >
                                            {item.label}
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <Progress
                                                value={item.percentage}
                                                color={getRatingColor(item.rating)}
                                                size="sm"
                                                showValueLabel={false}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                                            {item.percentage}% ({item.count})
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Summary Stats */}
                            <Box sx={{ mt: 3, p: 2, backgroundColor: 'gray.50', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Top Performers:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {performanceData.topPerformers}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Needs Development:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {performanceData.needsDevelopment}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Goal Achievement */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Goal Achievement
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Goal Progress Bars */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Q4 Goals</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {performanceData.goals.q4Goals}%
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={performanceData.goals.q4Goals}
                                        color="primary"
                                        size="md"
                                        showValueLabel={false}
                                    />
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Annual Goals</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {performanceData.goals.annualGoals}%
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={performanceData.goals.annualGoals}
                                        color="warning"
                                        size="md"
                                        showValueLabel={false}
                                    />
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Department Goals</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {performanceData.goals.departmentGoals}%
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={performanceData.goals.departmentGoals}
                                        color="secondary"
                                        size="md"
                                        showValueLabel={false}
                                    />
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Individual Goals</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {performanceData.goals.individualGoals}%
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={performanceData.goals.individualGoals}
                                        color="success"
                                        size="md"
                                        showValueLabel={false}
                                    />
                                </Box>

                                {/* Review Status */}
                                <Box sx={{ mt: 2, p: 2, backgroundColor: 'blue.50', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body2">Review Completion:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {performanceData.goals.reviewCompletion}%
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={performanceData.goals.reviewCompletion}
                                        color="primary"
                                        size="sm"
                                        showValueLabel={false}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Next Review Cycle: <strong>{performanceData.goals.nextReviewCycle} days</strong>
                                    </Typography>
                                </Box>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

            {/* Performance Trend Analysis */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Performance Trend Analysis (Last 12 Months)
                    </Typography>
                </CardHeader>
                <CardBody>
                    <Box sx={{ 
                        height: 300, 
                        display: 'flex', 
                        alignItems: 'end', 
                        justifyContent: 'space-around',
                        px: 2,
                        position: 'relative'
                    }}>
                        {/* Y-axis labels */}
                        <Box sx={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            color: 'text.secondary'
                        }}>
                            <Typography variant="caption">5.0</Typography>
                            <Typography variant="caption">4.5</Typography>
                            <Typography variant="caption">4.0</Typography>
                            <Typography variant="caption">3.5</Typography>
                            <Typography variant="caption">3.0</Typography>
                            <Typography variant="caption">2.5</Typography>
                            <Typography variant="caption">2.0</Typography>
                        </Box>

                        {/* Chart area */}
                        <Box sx={{ 
                            flex: 1, 
                            ml: 4, 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'end', 
                            justifyContent: 'space-around',
                            position: 'relative'
                        }}>
                            {/* Grid lines */}
                            {[2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((value, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: `${((value - 2) / 3) * 100}%`,
                                        height: '1px',
                                        backgroundColor: 'gray.200',
                                        zIndex: 0
                                    }}
                                />
                            ))}
                            
                            {/* Data points */}
                            {performanceData.trendData.map((item, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        flex: 1,
                                        mx: 0.5,
                                        zIndex: 1
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: `${((item.score - 2) / 3) * 250}px`,
                                            backgroundColor: 'transparent',
                                            borderRadius: 1,
                                            mb: 1,
                                            display: 'flex',
                                            alignItems: 'end',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                backgroundColor: 'primary.main',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                bottom: 0
                                            }}
                                        />
                                        {index < performanceData.trendData.length - 1 && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 4,
                                                    left: '50%',
                                                    width: '100%',
                                                    height: '2px',
                                                    backgroundColor: 'primary.main',
                                                    transformOrigin: 'left',
                                                    transform: `rotate(${Math.atan2(
                                                        (performanceData.trendData[index + 1].score - item.score) * 50,
                                                        100 / performanceData.trendData.length
                                                    )}rad)`
                                                }}
                                            />
                                        )}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                bottom: 12,
                                                fontSize: '0.6rem',
                                                fontWeight: 600,
                                                color: 'primary.main'
                                            }}
                                        >
                                            {item.score}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                        {item.month}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Performance trend shows consistent improvement with current score at 4.1/5.0
                        </Typography>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

export default PerformanceManagementTab;
