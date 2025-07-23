import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Card, CardBody, CardHeader, Progress } from '@heroui/react';
import { 
    UserGroupIcon,
    BuildingOfficeIcon,
    GlobeAltIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const WorkforceOverviewTab = ({ data = {}, permissions = [] }) => {
    // Mock data for demonstration
    const workforceData = {
        headcountTrend: [
            { month: 'Jan', count: 2200 },
            { month: 'Feb', count: 2250 },
            { month: 'Mar', count: 2300 },
            { month: 'Apr', count: 2350 },
            { month: 'May', count: 2400 },
            { month: 'Jun', count: 2450 }
        ],
        departmentBreakdown: [
            { department: 'Engineering', percentage: 35, count: 857 },
            { department: 'Sales', percentage: 20, count: 490 },
            { department: 'Marketing', percentage: 15, count: 368 },
            { department: 'Operations', percentage: 12, count: 294 },
            { department: 'Finance', percentage: 8, count: 196 },
            { department: 'HR', percentage: 5, count: 123 },
            { department: 'Others', percentage: 5, count: 123 }
        ],
        demographics: {
            ageGroups: [
                { group: '20-30', percentage: 35 },
                { group: '31-40', percentage: 40 },
                { group: '41-50', percentage: 20 },
                { group: '50+', percentage: 5 }
            ],
            gender: {
                male: 52,
                female: 48
            },
            location: [
                { location: 'HQ', percentage: 60 },
                { location: 'Remote', percentage: 25 },
                { location: 'Branches', percentage: 15 }
            ],
            employmentType: [
                { type: 'Full-time', percentage: 85 },
                { type: 'Part-time', percentage: 10 },
                { type: 'Contract', percentage: 5 }
            ],
            tenure: [
                { range: '0-2 years', percentage: 40 },
                { range: '3-5 years', percentage: 35 },
                { range: '5+ years', percentage: 25 }
            ]
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Workforce Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Comprehensive view of organizational workforce composition and trends
                </Typography>
            </Box>

            {/* Main Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Headcount Trend */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Headcount Trend (Last 6 Months)
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
                                {workforceData.headcountTrend.map((item, index) => (
                                    <Box 
                                        key={index}
                                        sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            flex: 1,
                                            mx: 1
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: `${(item.count / 2500) * 250}px`,
                                                backgroundColor: 'primary.main',
                                                borderRadius: 1,
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'end',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                pb: 1
                                            }}
                                        >
                                            {item.count}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {item.month}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Department Breakdown */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Department Breakdown
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {workforceData.departmentBreakdown.map((dept, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ fontWeight: 500, minWidth: 80 }}
                                        >
                                            {dept.department}
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <Progress 
                                                value={dept.percentage} 
                                                color="primary"
                                                size="sm"
                                                label={`${dept.count} employees`}
                                                showValueLabel={true}
                                                formatOptions={{
                                                    style: "percent",
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 1
                                                }}
                                            />
                                        </Box>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ minWidth: 40, textAlign: 'right' }}
                                        >
                                            {dept.percentage}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

            {/* Demographics Section */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Workforce Demographics
                    </Typography>
                </CardHeader>
                <CardBody>
                    <Grid container spacing={4}>
                        {/* Age Groups */}
                        <Grid item xs={12} md={3}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Age Groups
                                </Typography>
                                {workforceData.demographics.ageGroups.map((group, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">{group.group}:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {group.percentage}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>

                        {/* Gender */}
                        <Grid item xs={12} md={3}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Gender Distribution
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Male:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {workforceData.demographics.gender.male}%
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Female:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {workforceData.demographics.gender.female}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Location */}
                        <Grid item xs={12} md={3}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Location Distribution
                                </Typography>
                                {workforceData.demographics.location.map((loc, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">{loc.location}:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {loc.percentage}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>

                        {/* Employment Type & Tenure */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Employment Type
                                </Typography>
                                {workforceData.demographics.employmentType.map((type, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">{type.type}:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {type.percentage}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Tenure Distribution
                                </Typography>
                                {workforceData.demographics.tenure.map((tenure, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">{tenure.range}:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {tenure.percentage}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </CardBody>
            </Card>
        </Box>
    );
};

export default WorkforceOverviewTab;
