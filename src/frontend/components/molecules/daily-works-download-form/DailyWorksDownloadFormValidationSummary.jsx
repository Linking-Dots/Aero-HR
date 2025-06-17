import React from 'react';
import {
    Box,
    Typography,
    Alert,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Speed as SpeedIcon,
    Assessment as AssessmentIcon,
    Security as SecurityIcon,
    Storage as StorageIcon,
    Construction as ConstructionIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * Validation Summary Component for Daily Works Download Form
 * Displays comprehensive validation status and recommendations for construction data export
 */
const DailyWorksDownloadFormValidationSummary = ({
    validation,
    summary,
    estimatedExportTime,
    estimatedFileSize,
    performanceMode,
    exportFormat,
    compact = false
}) => {
    const theme = useTheme();
    
    const {
        isValid,
        errors,
        warnings,
        stepValidation,
        businessRuleErrors,
        dataIntegrityErrors,
        performanceWarnings,
        securityChecks
    } = validation || {};

    // Calculate overall validation score
    const totalChecks = 12; // Total validation checks for daily works
    const passedChecks = totalChecks - (errors?.length || 0) - (businessRuleErrors?.length || 0) - (dataIntegrityErrors?.length || 0);
    const validationScore = Math.round((passedChecks / totalChecks) * 100);

    // Get validation status color and icon
    const getValidationStatus = () => {
        if (errors?.length > 0 || businessRuleErrors?.length > 0 || dataIntegrityErrors?.length > 0) {
            return { color: 'error', icon: <ErrorIcon />, label: 'Failed' };
        }
        if (warnings?.length > 0 || performanceWarnings?.length > 0) {
            return { color: 'warning', icon: <WarningIcon />, label: 'Warning' };
        }
        return { color: 'success', icon: <CheckCircleIcon />, label: 'Passed' };
    };

    const status = getValidationStatus();

    // Performance status based on estimated time and file size
    const getPerformanceStatus = () => {
        const timeThreshold = 30; // seconds
        
        if (estimatedExportTime > timeThreshold) {
            return { color: 'warning', message: 'Large export may take significant time' };
        }
        return { color: 'success', message: 'Export performance looks good' };
    };

    const performanceStatus = getPerformanceStatus();

    if (!validation) {
        return (
            <Alert severity="info">
                <Typography>Validation data not available</Typography>
            </Alert>
        );
    }

    // Compact version for final step
    if (compact) {
        return (
            <Box sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Box sx={{ color: `${status.color}.main` }}>
                                        {status.icon}
                                    </Box>
                                    <Typography variant="h6">
                                        Validation: {status.label}
                                    </Typography>
                                    <Chip 
                                        label={`${validationScore}%`}
                                        color={status.color}
                                        size="small"
                                    />
                                </Box>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <AssessmentIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={`${summary?.totalRecords || 0} records`}
                                            secondary="Total daily works"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <StorageIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={`${summary?.selectedColumns || 0} columns`}
                                            secondary="Selected for export"
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Export Details
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        icon={<SpeedIcon />}
                                        label={`~${estimatedExportTime}s`}
                                        size="small"
                                        color={estimatedExportTime > 30 ? 'warning' : 'success'}
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<StorageIcon />}
                                        label={`${estimatedFileSize}`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={exportFormat?.toUpperCase() || 'EXCEL'}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Overall Validation Status */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ color: `${status.color}.main` }}>
                        {status.icon}
                    </Box>
                    <Typography variant="h6">
                        Validation Status: {status.label}
                    </Typography>
                    <Chip 
                        label={`${validationScore}% Score`}
                        color={status.color}
                        variant="outlined"
                    />
                </Box>

                {/* Validation Progress */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Validation Progress</Typography>
                        <Typography variant="body2">{validationScore}%</Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={validationScore} 
                        color={status.color}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>
            </Box>

            {/* Critical Errors */}
            {(errors?.length > 0 || businessRuleErrors?.length > 0 || dataIntegrityErrors?.length > 0) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Critical Issues ({(errors?.length || 0) + (businessRuleErrors?.length || 0) + (dataIntegrityErrors?.length || 0)})
                    </Typography>
                    <List dense>
                        {errors?.map((error, index) => (
                            <ListItem key={`error-${index}`} sx={{ py: 0 }}>
                                <ListItemText primary={error} />
                            </ListItem>
                        ))}
                        {businessRuleErrors?.map((error, index) => (
                            <ListItem key={`business-${index}`} sx={{ py: 0 }}>
                                <ListItemText primary={`Business Rule: ${error}`} />
                            </ListItem>
                        ))}
                        {dataIntegrityErrors?.map((error, index) => (
                            <ListItem key={`integrity-${index}`} sx={{ py: 0 }}>
                                <ListItemText primary={`Data Integrity: ${error}`} />
                            </ListItem>
                        ))}
                    </List>
                </Alert>
            )}

            {/* Warnings */}
            {(warnings?.length > 0 || performanceWarnings?.length > 0) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Recommendations ({(warnings?.length || 0) + (performanceWarnings?.length || 0)})
                    </Typography>
                    <List dense>
                        {warnings?.map((warning, index) => (
                            <ListItem key={`warning-${index}`} sx={{ py: 0 }}>
                                <ListItemText primary={warning} />
                            </ListItem>
                        ))}
                        {performanceWarnings?.map((warning, index) => (
                            <ListItem key={`perf-${index}`} sx={{ py: 0 }}>
                                <ListItemText primary={`Performance: ${warning}`} />
                            </ListItem>
                        ))}
                    </List>
                </Alert>
            )}

            {/* Export Summary */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Export Summary
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <AssessmentIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Daily Works Records"
                                    secondary={`${summary?.totalRecords || 0} construction project records`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <StorageIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Selected Columns"
                                    secondary={`${summary?.selectedColumns || 0} of ${summary?.totalColumns || 0} available columns`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <ConstructionIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Work Types"
                                    secondary={Object.entries(summary?.workTypeDistribution || {}).map(([type, count]) => 
                                        `${type}: ${count}`
                                    ).join(', ') || 'No data'}
                                />
                            </ListItem>
                        </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <SpeedIcon color={performanceStatus.color} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Performance Mode"
                                    secondary={`${performanceMode || 'balanced'} mode - ${performanceStatus.message}`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <PeopleIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Status Distribution"
                                    secondary={Object.entries(summary?.statusDistribution || {}).map(([status, count]) => 
                                        `${status}: ${count}`
                                    ).join(', ') || 'No data'}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <InfoIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Data Quality"
                                    secondary={`${summary?.dataQuality?.score || 0}% complete - ${summary?.dataQuality?.issues?.length || 0} issues`}
                                />
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Performance Metrics */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Performance Metrics
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<SpeedIcon />}
                        label={`Export Time: ~${estimatedExportTime}s`}
                        color={estimatedExportTime > 30 ? 'warning' : 'success'}
                        variant="outlined"
                    />
                    <Chip
                        icon={<StorageIcon />}
                        label={`File Size: ~${estimatedFileSize}`}
                        color="info"
                        variant="outlined"
                    />
                    <Chip
                        icon={<AssessmentIcon />}
                        label={`Complexity: ${summary?.complexity || 'Medium'}`}
                        color="secondary"
                        variant="outlined"
                    />
                    <Chip
                        label={`Format: ${exportFormat?.toUpperCase() || 'EXCEL'}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            </Box>

            {/* Security Checks */}
            {securityChecks && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Security Validation
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <SecurityIcon color={securityChecks.dataAccess ? 'success' : 'error'} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Data Access Permissions"
                                secondary={securityChecks.dataAccess ? 'User has required permissions' : 'Permission verification failed'}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <SecurityIcon color={securityChecks.fileGeneration ? 'success' : 'error'} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="File Generation Security"
                                secondary={securityChecks.fileGeneration ? 'File generation is secure' : 'Security concerns detected'}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <SecurityIcon color={securityChecks.dataPrivacy ? 'success' : 'warning'} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Data Privacy Compliance"
                                secondary={securityChecks.dataPrivacy ? 'GDPR Compliant' : 'Privacy review required'}
                            />
                        </ListItem>
                    </List>
                </Box>
            )}

            {/* Construction-Specific Insights */}
            {summary?.resubmissionStats && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Construction Project Insights
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Resubmission Analysis
                                    </Typography>
                                    <Typography variant="body2">
                                        Total Resubmissions: {summary.resubmissionStats.totalResubmissions}
                                    </Typography>
                                    <Typography variant="body2">
                                        Records with Resubmissions: {summary.resubmissionStats.recordsWithResubmissions}
                                    </Typography>
                                    <Typography variant="body2">
                                        Average per Record: {summary.resubmissionStats.averageResubmissions?.toFixed(2) || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Completion Progress
                                    </Typography>
                                    <Typography variant="body2">
                                        Completed: {summary.completionStats?.completed || 0}
                                    </Typography>
                                    <Typography variant="body2">
                                        In Progress: {summary.completionStats?.inProgress || 0}
                                    </Typography>
                                    <Typography variant="body2">
                                        Completion Rate: {summary.completionStats?.completionRate?.toFixed(1) || 0}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Step Validation Progress */}
            {stepValidation && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Validation Steps
                    </Typography>
                    <List dense>
                        {['Column Selection', 'Format Validation', 'Data Integrity', 'Performance Check'].map((step, index) => {
                            const isCompleted = index < (stepValidation.completedSteps || 0);
                            const isCurrent = index === (stepValidation.completedSteps || 0);
                            
                            return (
                                <ListItem key={step}>
                                    <ListItemIcon>
                                        {isCompleted ? (
                                            <CheckCircleIcon color="success" />
                                        ) : isCurrent ? (
                                            <InfoIcon color="primary" />
                                        ) : (
                                            <InfoIcon color="disabled" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={step}
                                        secondary={
                                            isCompleted ? 'Completed' :
                                            isCurrent ? 'In Progress' : 'Pending'
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            )}

            {/* Success Message */}
            {isValid && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Ready for Export
                    </Typography>
                    <Typography variant="body2">
                        All validation checks have passed. The daily works export is ready to proceed with the selected configuration.
                    </Typography>
                </Alert>
            )}
        </Box>
    );
};

export default DailyWorksDownloadFormValidationSummary;
