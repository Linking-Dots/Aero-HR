import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { 
    BriefcaseIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const RecruitmentPipelineTab = ({ data = {} }) => {
    // Mock recruitment data
    const recruitmentData = {
        funnel: {
            applications: 1245,
            screening: { count: 560, conversionRate: 45 },
            interviews: { count: 196, conversionRate: 35 },
            offers: { count: 78, conversionRate: 40 },
            hired: { count: 66, conversionRate: 85 },
            overallConversion: 5.3
        },
        metrics: {
            timeToHire: 24,
            timeToHireTarget: 30,
            costPerHire: 3200,
            costPerHireTarget: 4000,
            offerAcceptance: 85,
            offerAcceptanceTarget: 80,
            qualityOfHire: 4.2,
            qualityOfHireTarget: 4.0
        },
        openPositions: [
            { department: 'Engineering', open: 12, inProgress: 8, filledThisMonth: 4 },
            { department: 'Sales', open: 6, inProgress: 4, filledThisMonth: 8 },
            { department: 'Marketing', open: 4, inProgress: 2, filledThisMonth: 3 },
            { department: 'Operations', open: 3, inProgress: 2, filledThisMonth: 2 },
            { department: 'Finance', open: 2, inProgress: 1, filledThisMonth: 1 },
            { department: 'HR', open: 1, inProgress: 0, filledThisMonth: 1 }
        ],
        averageTimeToFill: 28,
        averageTimeToFillTarget: 30
    };

    const getMetricStatus = (value, target, isLowerBetter = false) => {
        if (isLowerBetter) {
            return value <= target ? 'success' : 'warning';
        }
        return value >= target ? 'success' : 'warning';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Recruitment Pipeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Hiring funnel analysis, metrics tracking, and open positions status
                </Typography>
            </Box>

            {/* Main Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Recruitment Funnel */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Recruitment Funnel
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Applications */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ 
                                        backgroundColor: 'blue.500', 
                                        color: 'white', 
                                        py: 2, 
                                        borderRadius: 2,
                                        mb: 1
                                    }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            {recruitmentData.funnel.applications}
                                        </Typography>
                                        <Typography variant="body2">Applications</Typography>
                                    </Box>
                                </Box>

                                {/* Screening */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            ↓ ({recruitmentData.funnel.screening.conversionRate}%)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        backgroundColor: 'green.500', 
                                        color: 'white', 
                                        py: 2, 
                                        borderRadius: 2,
                                        mb: 1
                                    }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            {recruitmentData.funnel.screening.count}
                                        </Typography>
                                        <Typography variant="body2">Screening</Typography>
                                    </Box>
                                </Box>

                                {/* Interviews */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            ↓ ({recruitmentData.funnel.interviews.conversionRate}%)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        backgroundColor: 'purple.500', 
                                        color: 'white', 
                                        py: 2, 
                                        borderRadius: 2,
                                        mb: 1
                                    }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            {recruitmentData.funnel.interviews.count}
                                        </Typography>
                                        <Typography variant="body2">Interviews</Typography>
                                    </Box>
                                </Box>

                                {/* Offers */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            ↓ ({recruitmentData.funnel.offers.conversionRate}%)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        backgroundColor: 'orange.500', 
                                        color: 'white', 
                                        py: 2, 
                                        borderRadius: 2,
                                        mb: 1
                                    }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            {recruitmentData.funnel.offers.count}
                                        </Typography>
                                        <Typography variant="body2">Offers</Typography>
                                    </Box>
                                </Box>

                                {/* Hired */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            ↓ ({recruitmentData.funnel.hired.conversionRate}%)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        backgroundColor: 'emerald.600', 
                                        color: 'white', 
                                        py: 2, 
                                        borderRadius: 2,
                                        mb: 2
                                    }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            {recruitmentData.funnel.hired.count}
                                        </Typography>
                                        <Typography variant="body2">Hired</Typography>
                                    </Box>
                                </Box>

                                {/* Overall Conversion Rate */}
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'gray.50', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Overall Conversion Rate
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        {recruitmentData.funnel.overallConversion}%
                                    </Typography>
                                </Box>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Hiring Metrics */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Hiring Metrics
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {/* Time to Hire */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <ClockIcon className="w-5 h-5 text-blue-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Time to Hire
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {recruitmentData.metrics.timeToHire} days
                                        </Typography>
                                        <Chip
                                            label={`Target: <${recruitmentData.metrics.timeToHireTarget} days`}
                                            color={getMetricStatus(
                                                recruitmentData.metrics.timeToHire,
                                                recruitmentData.metrics.timeToHireTarget,
                                                true
                                            )}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                </Box>

                                {/* Cost per Hire */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Cost per Hire
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {formatCurrency(recruitmentData.metrics.costPerHire)}
                                        </Typography>
                                        <Chip
                                            label={`Target: <${formatCurrency(recruitmentData.metrics.costPerHireTarget)}`}
                                            color={getMetricStatus(
                                                recruitmentData.metrics.costPerHire,
                                                recruitmentData.metrics.costPerHireTarget,
                                                true
                                            )}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                </Box>

                                {/* Offer Acceptance */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Offer Acceptance Rate
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {recruitmentData.metrics.offerAcceptance}%
                                        </Typography>
                                        <Chip
                                            label={`Target: >${recruitmentData.metrics.offerAcceptanceTarget}%`}
                                            color={getMetricStatus(
                                                recruitmentData.metrics.offerAcceptance,
                                                recruitmentData.metrics.offerAcceptanceTarget
                                            )}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                </Box>

                                {/* Quality of Hire */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <BriefcaseIcon className="w-5 h-5 text-orange-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Quality of Hire
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {recruitmentData.metrics.qualityOfHire}/5
                                        </Typography>
                                        <Chip
                                            label={`Target: >${recruitmentData.metrics.qualityOfHireTarget}`}
                                            color={getMetricStatus(
                                                recruitmentData.metrics.qualityOfHire,
                                                recruitmentData.metrics.qualityOfHireTarget
                                            )}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

            {/* Open Positions Status */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Open Positions Status
                    </Typography>
                </CardHeader>
                <CardBody>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                            <Box component="thead">
                                <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                                    <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 600 }}>
                                        Department
                                    </Box>
                                    <Box component="th" sx={{ textAlign: 'center', p: 2, fontWeight: 600 }}>
                                        Open
                                    </Box>
                                    <Box component="th" sx={{ textAlign: 'center', p: 2, fontWeight: 600 }}>
                                        In Progress
                                    </Box>
                                    <Box component="th" sx={{ textAlign: 'center', p: 2, fontWeight: 600 }}>
                                        Filled This Month
                                    </Box>
                                </Box>
                            </Box>
                            <Box component="tbody">
                                {recruitmentData.openPositions.map((dept, index) => (
                                    <Box 
                                        key={index} 
                                        component="tr" 
                                        sx={{ 
                                            borderBottom: '1px solid', 
                                            borderColor: 'divider',
                                            '&:hover': { backgroundColor: 'gray.50' }
                                        }}
                                    >
                                        <Box component="td" sx={{ p: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {dept.department}
                                            </Typography>
                                        </Box>
                                        <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                            <Chip
                                                label={dept.open}
                                                color={dept.open > 5 ? 'warning' : 'default'}
                                                size="small"
                                                variant="flat"
                                            />
                                        </Box>
                                        <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                            <Typography variant="body2">{dept.inProgress}</Typography>
                                        </Box>
                                        <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                {dept.filledThisMonth}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                                {/* Totals Row */}
                                <Box 
                                    component="tr" 
                                    sx={{ 
                                        borderTop: '2px solid', 
                                        borderColor: 'divider',
                                        backgroundColor: 'gray.50'
                                    }}
                                >
                                    <Box component="td" sx={{ p: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            TOTAL
                                        </Typography>
                                    </Box>
                                    <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {recruitmentData.openPositions.reduce((sum, dept) => sum + dept.open, 0)}
                                        </Typography>
                                    </Box>
                                    <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {recruitmentData.openPositions.reduce((sum, dept) => sum + dept.inProgress, 0)}
                                        </Typography>
                                    </Box>
                                    <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {recruitmentData.openPositions.reduce((sum, dept) => sum + dept.filledThisMonth, 0)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3, textAlign: 'center', p: 2, backgroundColor: 'blue.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Average Time to Fill: <strong>{recruitmentData.averageTimeToFill} days</strong> 
                            (Target: <strong>&lt;{recruitmentData.averageTimeToFillTarget} days</strong>)
                        </Typography>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

export default RecruitmentPipelineTab;
