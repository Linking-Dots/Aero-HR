import React from 'react';
import { Box, Typography, Grid, LinearProgress } from '@mui/material';
import { Card, CardBody, Chip } from '@heroui/react';
import { 
    ShieldCheckIcon, 
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const CompliancePanel = () => {
    const complianceData = {
        iso30414Score: 92,
        gdprStatus: 'compliant',
        soxStatus: 'current',
        laborLawCompliance: 'attention',
        nextReviewDate: 'Dec 2025',
        requiredActions: [
            { action: 'Update privacy policy', dueDate: 'Aug 15', priority: 'medium' },
            { action: 'Complete diversity report', dueDate: 'Aug 30', priority: 'high' },
            { action: 'Conduct safety training', dueDate: 'Sep 10', priority: 'medium' }
        ]
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'compliant':
            case 'current':
                return 'success';
            case 'attention':
                return 'warning';
            case 'critical':
                return 'danger';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'compliant':
            case 'current':
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'attention':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
            case 'critical':
                return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <Card className="mt-6 border border-gray-200 shadow-lg">
            <CardBody className="p-6">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Compliance Dashboard
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* ISO 30414 Compliance Score */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    ISO 30414 Compliance Score
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {complianceData.iso30414Score}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={complianceData.iso30414Score}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        backgroundColor: complianceData.iso30414Score >= 90 ? '#10b981' : '#f59e0b'
                                    }
                                }}
                            />
                        </Box>
                    </Grid>

                    {/* Compliance Status Items */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">GDPR Compliance Status:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getStatusIcon(complianceData.gdprStatus)}
                                    <Chip 
                                        color={getStatusColor(complianceData.gdprStatus)}
                                        size="sm"
                                        variant="flat"
                                    >
                                        Compliant
                                    </Chip>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">SOX Section 404:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getStatusIcon(complianceData.soxStatus)}
                                    <Chip 
                                        color={getStatusColor(complianceData.soxStatus)}
                                        size="sm"
                                        variant="flat"
                                    >
                                        Current (Next Review: {complianceData.nextReviewDate})
                                    </Chip>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Labor Law Compliance:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getStatusIcon(complianceData.laborLawCompliance)}
                                    <Chip 
                                        color={getStatusColor(complianceData.laborLawCompliance)}
                                        size="sm"
                                        variant="flat"
                                    >
                                        3 items require attention
                                    </Chip>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Required Actions */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Required Actions:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {complianceData.requiredActions.map((action, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        p: 2,
                                        backgroundColor: 'rgba(0,0,0,0.02)',
                                        borderRadius: 2,
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Typography variant="body2">
                                        • {action.action}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Due: {action.dueDate}
                                        </Typography>
                                        <Chip
                                            color={action.priority === 'high' ? 'danger' : 'warning'}
                                            size="sm"
                                            variant="flat"
                                        >
                                            {action.priority}
                                        </Chip>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </CardBody>
        </Card>
    );
};

export default CompliancePanel;
