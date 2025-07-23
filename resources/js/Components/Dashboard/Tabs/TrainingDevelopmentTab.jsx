import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { Card, CardBody, CardHeader, Progress, Chip } from '@heroui/react';
import { 
    AcademicCapIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    TrophyIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const TrainingDevelopmentTab = ({ data = {} }) => {
    // Mock training data
    const trainingData = {
        metrics: {
            completionRate: 87,
            completionTarget: 85,
            hoursPerEmployee: 40,
            hoursTarget: 40,
            trainingROI: 325,
            roiTarget: 300,
            satisfaction: 4.3,
            satisfactionTarget: 4.0
        },
        skillDevelopment: {
            technicalSkills: 78,
            leadershipSkills: 65,
            softSkills: 72,
            complianceTraining: 95
        },
        upcomingTraining: [
            {
                date: 'Jul 25',
                course: 'Data Security',
                participants: 45,
                status: 'Confirmed',
                statusColor: 'success'
            },
            {
                date: 'Jul 28',
                course: 'Leadership Skills',
                participants: 25,
                status: 'Confirmed',
                statusColor: 'success'
            },
            {
                date: 'Aug 02',
                course: 'Project Management',
                participants: 30,
                status: 'Planning',
                statusColor: 'warning'
            },
            {
                date: 'Aug 05',
                course: 'Customer Service',
                participants: 60,
                status: 'Planning',
                statusColor: 'warning'
            },
            {
                date: 'Aug 10',
                course: 'Technical Writing',
                participants: 20,
                status: 'Planning',
                statusColor: 'warning'
            }
        ],
        budgetInfo: {
            totalBudget: 192000,
            utilized: 125000,
            utilizationPercentage: 65
        }
    };

    const getMetricStatus = (value, target, isHigherBetter = true) => {
        if (isHigherBetter) {
            return value >= target ? 'success' : 'warning';
        }
        return value <= target ? 'success' : 'warning';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getSkillCoverageColor = (percentage) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 75) return 'primary';
        if (percentage >= 60) return 'warning';
        return 'danger';
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Training & Development
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Training metrics, skill development tracking, and upcoming sessions
                </Typography>
            </Box>

            {/* Main Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Training Metrics */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Training Metrics
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {/* Completion Rate */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Completion Rate
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {trainingData.metrics.completionRate}%
                                        </Typography>
                                        <Chip
                                            label={`Target: >${trainingData.metrics.completionTarget}%`}
                                            color={getMetricStatus(
                                                trainingData.metrics.completionRate,
                                                trainingData.metrics.completionTarget
                                            )}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                    <Progress
                                        value={trainingData.metrics.completionRate}
                                        color="success"
                                        size="sm"
                                    />
                                </Box>

                                {/* Hours per Employee */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <ClockIcon className="w-5 h-5 text-blue-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Hours per Employee (Annual)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {trainingData.metrics.hoursPerEmployee} hrs
                                        </Typography>
                                        <Chip
                                            label={`Target: ${trainingData.metrics.hoursTarget}+ hrs`}
                                            color={getMetricStatus(
                                                trainingData.metrics.hoursPerEmployee,
                                                trainingData.metrics.hoursTarget
                                            )}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                </Box>

                                {/* Training ROI */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Training ROI
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {trainingData.metrics.trainingROI}%
                                        </Typography>
                                        <Chip
                                            label={`Target: >${trainingData.metrics.roiTarget}%`}
                                            color={getMetricStatus(
                                                trainingData.metrics.trainingROI,
                                                trainingData.metrics.roiTarget
                                            )}
                                            size="small"
                                            variant="flat"
                                        />
                                    </Box>
                                </Box>

                                {/* Satisfaction */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <TrophyIcon className="w-5 h-5 text-orange-600" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Training Satisfaction
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {trainingData.metrics.satisfaction}/5
                                        </Typography>
                                        <Chip
                                            label={`Target: >${trainingData.metrics.satisfactionTarget}`}
                                            color={getMetricStatus(
                                                trainingData.metrics.satisfaction,
                                                trainingData.metrics.satisfactionTarget
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

                {/* Skill Development */}
                <Grid item xs={12} md={6}>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Skill Development Coverage
                            </Typography>
                        </CardHeader>
                        <CardBody>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Skill Gap Analysis:
                                </Typography>

                                {/* Technical Skills */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Technical Skills
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {trainingData.skillDevelopment.technicalSkills}% coverage
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={trainingData.skillDevelopment.technicalSkills}
                                        color={getSkillCoverageColor(trainingData.skillDevelopment.technicalSkills)}
                                        size="md"
                                    />
                                </Box>

                                {/* Leadership Skills */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Leadership Skills
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {trainingData.skillDevelopment.leadershipSkills}% coverage
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={trainingData.skillDevelopment.leadershipSkills}
                                        color={getSkillCoverageColor(trainingData.skillDevelopment.leadershipSkills)}
                                        size="md"
                                    />
                                </Box>

                                {/* Soft Skills */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Soft Skills
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {trainingData.skillDevelopment.softSkills}% coverage
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={trainingData.skillDevelopment.softSkills}
                                        color={getSkillCoverageColor(trainingData.skillDevelopment.softSkills)}
                                        size="md"
                                    />
                                </Box>

                                {/* Compliance Training */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Compliance Training
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {trainingData.skillDevelopment.complianceTraining}% coverage
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={trainingData.skillDevelopment.complianceTraining}
                                        color={getSkillCoverageColor(trainingData.skillDevelopment.complianceTraining)}
                                        size="md"
                                    />
                                </Box>

                                {/* Budget Information */}
                                <Box sx={{ mt: 2, p: 2, backgroundColor: 'blue.50', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                        Training Budget Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">Budget Utilized:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {trainingData.budgetInfo.utilizationPercentage}%
                                        </Typography>
                                    </Box>
                                    <Progress
                                        value={trainingData.budgetInfo.utilizationPercentage}
                                        color="primary"
                                        size="sm"
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {formatCurrency(trainingData.budgetInfo.utilized)} of {formatCurrency(trainingData.budgetInfo.totalBudget)}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

            {/* Upcoming Training Schedule */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Upcoming Training Schedule
                    </Typography>
                </CardHeader>
                <CardBody>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                            <Box component="thead">
                                <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                                    <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 600 }}>
                                        Date
                                    </Box>
                                    <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 600 }}>
                                        Course
                                    </Box>
                                    <Box component="th" sx={{ textAlign: 'center', p: 2, fontWeight: 600 }}>
                                        Participants
                                    </Box>
                                    <Box component="th" sx={{ textAlign: 'center', p: 2, fontWeight: 600 }}>
                                        Status
                                    </Box>
                                </Box>
                            </Box>
                            <Box component="tbody">
                                {trainingData.upcomingTraining.map((training, index) => (
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
                                                {training.date}
                                            </Typography>
                                        </Box>
                                        <Box component="td" sx={{ p: 2 }}>
                                            <Typography variant="body2">
                                                {training.course}
                                            </Typography>
                                        </Box>
                                        <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {training.participants}
                                            </Typography>
                                        </Box>
                                        <Box component="td" sx={{ textAlign: 'center', p: 2 }}>
                                            <Chip
                                                label={training.status}
                                                color={training.statusColor}
                                                size="small"
                                                variant="flat"
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ p: 2, backgroundColor: 'green.50', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Scheduled Participants
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'green.600' }}>
                                        {trainingData.upcomingTraining.reduce((sum, training) => sum + training.participants, 0)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ p: 2, backgroundColor: 'blue.50', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Sessions This Month
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'blue.600' }}>
                                        {trainingData.upcomingTraining.length}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

export default TrainingDevelopmentTab;
