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
    Divider
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Speed as SpeedIcon,
    Assessment as AssessmentIcon,
    Security as SecurityIcon,
    Storage as StorageIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * Validation Summary Component for Daily Work Summary Download Form
 * Displays comprehensive validation status and recommendations
 */
const DailyWorkSummaryDownloadFormValidationSummary = ({
    validation,
    summary,
    estimatedExportTime,
    estimatedFileSize,
    performanceMode
}) => {
    const theme = useTheme();
    
    const {
        isValid,
        errors,
        warnings,
        stepValidation,
        businessRuleErrors,
        performanceWarnings,
        securityChecks
    } = validation || {};

    // Calculate overall validation score
    const totalChecks = 10; // Total validation checks
    const passedChecks = totalChecks - (errors?.length || 0) - (businessRuleErrors?.length || 0);
    const validationScore = Math.round((passedChecks / totalChecks) * 100);

    // Get validation status color and icon
    const getValidationStatus = () => {
        if (errors?.length > 0 || businessRuleErrors?.length > 0) {
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
        const sizeThreshold = '50MB';
        
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
            {(errors?.length > 0 || businessRuleErrors?.length > 0) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Critical Issues ({(errors?.length || 0) + (businessRuleErrors?.length || 0)})
                    </Typography>
                    <List dense>
                        {errors?.map((error, index) => (
                            <ListItem key={`error-${index}`} sx={{ py: 0 }}>
                                <ListItemText primary={error} />
                            </ListItem>
                        ))}
                        {businessRuleErrors?.map((error, index) => (
                            <ListItem key={`business-${index}`} sx={{ py: 0 }}>
                                <ListItemText primary={error} />
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
                                <ListItemText primary={warning} />
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
                <List dense>
                    <ListItem>
                        <ListItemIcon>
                            <AssessmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Records to Export"
                            secondary={`${summary?.totalRecords || 0} daily work summary records`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <StorageIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Selected Columns"
                            secondary={`${summary?.selectedColumns || 0} of ${summary?.totalColumns || 0} columns`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <SpeedIcon color={performanceStatus.color} />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Performance Mode"
                            secondary={`${performanceMode || 'balanced'} mode - ${performanceStatus.message}`}
                        />
                    </ListItem>
                </List>
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
                                secondary={securityChecks.dataAccess ? 'Verified' : 'Failed verification'}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <SecurityIcon color={securityChecks.fileGeneration ? 'success' : 'error'} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="File Generation Security"
                                secondary={securityChecks.fileGeneration ? 'Secure' : 'Security concerns detected'}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <SecurityIcon color={securityChecks.dataPrivacy ? 'success' : 'warning'} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Data Privacy Compliance"
                                secondary={securityChecks.dataPrivacy ? 'GDPR Compliant' : 'Review required'}
                            />
                        </ListItem>
                    </List>
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
                        All validation checks have passed. The export is ready to proceed with the selected configuration.
                    </Typography>
                </Alert>
            )}
        </Box>
    );
};

export default DailyWorkSummaryDownloadFormValidationSummary;
