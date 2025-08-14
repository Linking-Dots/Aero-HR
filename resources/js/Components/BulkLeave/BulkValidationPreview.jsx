import React from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    CardHeader, 
    Chip, 
    CircularProgress, 
    Divider, 
    LinearProgress, 
    Typography 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    XCircleIcon,
    InformationCircleIcon 
} from '@heroicons/react/24/outline';

const BulkValidationPreview = ({ 
    validationResults = [], 
    balanceImpact = null,
    isValidating = false 
}) => {
    const theme = useTheme();
    
    if (validationResults.length === 0 && !isValidating) {
        return null;
    }

    // Count validation statuses
    const validCount = validationResults.filter(r => r.status === 'valid').length;
    const warningCount = validationResults.filter(r => r.status === 'warning').length;
    const conflictCount = validationResults.filter(r => r.status === 'conflict').length;
    const totalCount = validationResults.length;

    // Get status icon and color
    const getStatusIcon = (status) => {
        const iconProps = { style: { width: 16, height: 16 } };
        switch (status) {
            case 'valid':
                return <CheckCircleIcon {...iconProps} style={{ ...iconProps.style, color: theme.palette.success.main }} />;
            case 'warning':
                return <ExclamationTriangleIcon {...iconProps} style={{ ...iconProps.style, color: theme.palette.warning.main }} />;
            case 'conflict':
                return <XCircleIcon {...iconProps} style={{ ...iconProps.style, color: theme.palette.error.main }} />;
            default:
                return <InformationCircleIcon {...iconProps} style={{ ...iconProps.style, color: theme.palette.text.disabled }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'valid':
                return 'success';
            case 'warning':
                return 'warning';
            case 'conflict':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Summary Card */}
            <Card variant="outlined">
                <CardHeader
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Validation Results</Typography>
                            {isValidating && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={16} />
                                    <Typography variant="body2" color="text.secondary">
                                        Validating...
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    }
                />
                <CardContent sx={{ pt: 0 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {validCount}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                                Valid
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main" fontWeight="bold">
                                {warningCount}
                            </Typography>
                            <Typography variant="body2" color="warning.main">
                                Warnings
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                                {conflictCount}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                                Conflicts
                            </Typography>
                        </Box>
                    </Box>

                    {/* Balance Impact */}
                    {balanceImpact && (
                        <Box 
                            sx={{ 
                                p: 2, 
                                borderRadius: 2, 
                                background: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}` 
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <InformationCircleIcon style={{ width: 16, height: 16, color: theme.palette.primary.main }} />
                                Leave Balance Impact
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        Leave Type:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" component="span" sx={{ ml: 1 }}>
                                        {balanceImpact.leave_type}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        Current Balance:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" component="span" sx={{ ml: 1 }}>
                                        {balanceImpact.current_balance} days
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        Requested Days:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" component="span" sx={{ ml: 1 }}>
                                        {balanceImpact.requested_days} days
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        Remaining Balance:
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        fontWeight="medium" 
                                        component="span" 
                                        sx={{ 
                                            ml: 1,
                                            color: balanceImpact.remaining_balance < 0 ? 'error.main' : 'success.main'
                                        }}
                                    >
                                        {balanceImpact.remaining_balance} days
                                    </Typography>
                                </Box>
                            </Box>
                            
                            {balanceImpact.remaining_balance < 0 && (
                                <Box 
                                    sx={{ 
                                        mt: 2, 
                                        p: 1.5, 
                                        borderRadius: 1, 
                                        bgcolor: 'error.light',
                                        border: 1,
                                        borderColor: 'error.main'
                                    }}
                                >
                                    <Typography variant="body2" color="error.main">
                                        ⚠️ This request exceeds your available leave balance by {Math.abs(balanceImpact.remaining_balance)} days.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Results */}
            {validationResults.length > 0 && (
                <Card variant="outlined">
                    <CardHeader
                        title={<Typography variant="h6">Date-by-Date Results</Typography>}
                    />
                    <CardContent>
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: 1, 
                                maxHeight: 240, 
                                overflowY: 'auto' 
                            }}
                        >
                            {validationResults.map((result, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        justifyContent: 'space-between', 
                                        p: 2, 
                                        borderRadius: 2, 
                                        border: 1,
                                        borderColor: 'divider',
                                        '&:hover': {
                                            borderColor: 'text.secondary'
                                        },
                                        transition: 'border-color 0.2s'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {getStatusIcon(result.status)}
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {formatDate(result.date)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {result.date}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                        <Chip 
                                            size="small" 
                                            variant="outlined" 
                                            color={getStatusColor(result.status)}
                                            label={result.status}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                        
                                        {/* Errors */}
                                        {result.errors && result.errors.length > 0 && (
                                            <Box sx={{ textAlign: 'right' }}>
                                                {result.errors.map((error, errorIndex) => (
                                                    <Typography key={errorIndex} variant="caption" color="error.main">
                                                        {error}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                        
                                        {/* Warnings */}
                                        {result.warnings && result.warnings.length > 0 && (
                                            <Box sx={{ textAlign: 'right' }}>
                                                {result.warnings.map((warning, warningIndex) => (
                                                    <Typography key={warningIndex} variant="caption" color="warning.main">
                                                        {warning}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default BulkValidationPreview;
