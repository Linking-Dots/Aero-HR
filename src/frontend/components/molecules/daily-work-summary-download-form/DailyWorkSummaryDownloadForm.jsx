import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    CircularProgress,
    Alert,
    Fade,
    Slide
} from '@mui/material';
import {
    Close as CloseIcon,
    Download as DownloadIcon,
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import GlassDialog from '@/Components/GlassDialog.jsx';
import LoadingButton from '@mui/lab/LoadingButton';

// Import form components and hooks
import DailyWorkSummaryDownloadFormCore from './DailyWorkSummaryDownloadFormCore';
import DailyWorkSummaryDownloadFormValidationSummary from './DailyWorkSummaryDownloadFormValidationSummary';
import { useCompleteDailyWorkSummaryDownloadForm } from './hooks/useCompleteDailyWorkSummaryDownloadForm';
import { useDailyWorkSummaryDownloadFormAnalytics } from './hooks/useDailyWorkSummaryDownloadFormAnalytics';

/**
 * Complete Daily Work Summary Download Form Component
 * Enterprise-grade export interface with multi-step workflow
 */
const DailyWorkSummaryDownloadForm = ({ 
    open, 
    onClose, 
    data = [], 
    users = [],
    title = "Export Daily Work Summary",
    subtitle = "Configure and export construction project data",
    maxWidth = "md",
    fullWidth = true 
}) => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [isExporting, setIsExporting] = useState(false);

    // Form integration hook
    const {
        formState,
        validation,
        exportConfig,
        handleExport,
        resetForm,
        saveConfiguration,
        loadConfiguration
    } = useCompleteDailyWorkSummaryDownloadForm({
        data,
        users,
        onClose
    });

    // Analytics tracking
    const { trackEvent, trackStepNavigation, trackExportAction } = useDailyWorkSummaryDownloadFormAnalytics({
        formId: 'daily-work-summary-download',
        userId: 'current-user', // Replace with actual user ID
        sessionId: 'current-session' // Replace with actual session ID
    });

    // Form steps configuration
    const steps = [
        {
            label: 'Configure Export',
            description: 'Select columns and export format',
            icon: <SettingsIcon />
        },
        {
            label: 'Preview & Validate',
            description: 'Review selections and validate data',
            icon: <VisibilityIcon />
        },
        {
            label: 'Download',
            description: 'Generate and download file',
            icon: <DownloadIcon />
        }
    ];

    // Handle step navigation
    const handleNext = () => {
        const nextStep = activeStep + 1;
        setActiveStep(nextStep);
        trackStepNavigation(activeStep, nextStep, 'next');
    };

    const handleBack = () => {
        const prevStep = activeStep - 1;
        setActiveStep(prevStep);
        trackStepNavigation(activeStep, prevStep, 'back');
    };

    const handleStepClick = (step) => {
        if (step <= activeStep || validation?.isValid) {
            setActiveStep(step);
            trackStepNavigation(activeStep, step, 'jump');
        }
    };

    // Handle export process
    const handleExportClick = async () => {
        setIsExporting(true);
        
        try {
            trackExportAction('export_started', {
                selectedColumns: exportConfig?.selectedColumns?.length || 0,
                exportFormat: exportConfig?.exportFormat,
                recordCount: data.length
            });

            await handleExport();
            
            trackExportAction('export_completed', {
                fileSize: exportConfig?.estimatedFileSize,
                exportTime: exportConfig?.estimatedExportTime
            });

            // Show success message
            toast.success('Export completed successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                    color: theme.palette.text.primary
                }
            });

            // Close dialog after successful export
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Export failed:', error);
            
            trackExportAction('export_failed', {
                error: error.message,
                step: activeStep
            });

            toast.error(error.message || 'Export failed. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                    color: theme.palette.text.primary
                }
            });
        } finally {
            setIsExporting(false);
        }
    };

    // Handle dialog close
    const handleClose = () => {
        if (!isExporting) {
            trackEvent('form_closed', {
                step: activeStep,
                completed: false
            });
            onClose();
        }
    };

    // Get step content
    const getStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <DailyWorkSummaryDownloadFormCore
                        data={data}
                        onExport={handleExport}
                        disabled={isExporting}
                        showPreview={false}
                    />
                );
            case 1:
                return (
                    <Box>
                        <DailyWorkSummaryDownloadFormValidationSummary
                            validation={validation}
                            summary={formState?.summary}
                            estimatedExportTime={formState?.estimatedExportTime}
                            estimatedFileSize={formState?.estimatedFileSize}
                            performanceMode={formState?.performanceMode}
                        />
                        <Box sx={{ mt: 3 }}>
                            <DailyWorkSummaryDownloadFormCore
                                data={data}
                                onExport={handleExport}
                                disabled={isExporting}
                                showPreview={true}
                            />
                        </Box>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        {isExporting ? (
                            <Box>
                                <CircularProgress size={60} sx={{ mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Generating Export File...
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Processing {data.length} records with {exportConfig?.selectedColumns?.length || 0} columns
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Ready to Export
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Click the download button to generate your file
                                </Typography>
                                <Box sx={{ mt: 3 }}>
                                    <DailyWorkSummaryDownloadFormValidationSummary
                                        validation={validation}
                                        summary={formState?.summary}
                                        estimatedExportTime={formState?.estimatedExportTime}
                                        estimatedFileSize={formState?.estimatedFileSize}
                                        performanceMode={formState?.performanceMode}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    // Check if current step can proceed
    const canProceed = () => {
        switch (activeStep) {
            case 0:
                return validation?.isValid && !validation?.errors?.length;
            case 1:
                return validation?.isValid;
            case 2:
                return true;
            default:
                return false;
        }
    };

    return (
        <GlassDialog 
            open={open} 
            onClose={handleClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            sx={{
                '& .MuiDialog-paper': {
                    minHeight: '70vh',
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Dialog Header */}
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="div">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        disabled={isExporting}
                        sx={{ 
                            position: 'absolute', 
                            right: 8, 
                            top: 8,
                            color: 'text.secondary'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            {/* Progress Stepper */}
            <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((step, index) => (
                        <Step 
                            key={step.label}
                            onClick={() => handleStepClick(index)}
                            sx={{ 
                                cursor: (index <= activeStep || validation?.isValid) ? 'pointer' : 'default',
                                '& .MuiStepLabel-root': {
                                    '&:hover': {
                                        '& .MuiStepLabel-label': {
                                            color: (index <= activeStep || validation?.isValid) ? 'primary.main' : 'inherit'
                                        }
                                    }
                                }
                            }}
                        >
                            <StepLabel>
                                <Typography variant="caption" display="block">
                                    {step.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {step.description}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            {/* Dialog Content */}
            <DialogContent sx={{ minHeight: 400, p: 3 }}>
                <Fade in={true} timeout={300}>
                    <Box>
                        {getStepContent()}
                    </Box>
                </Fade>

                {/* Global validation errors */}
                {validation?.errors?.length > 0 && (
                    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                        <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Please resolve the following issues:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {validation.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </Alert>
                    </Slide>
                )}
            </DialogContent>

            {/* Dialog Actions */}
            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box>
                        {activeStep > 0 && (
                            <Button
                                onClick={handleBack}
                                disabled={isExporting}
                                variant="outlined"
                                color="inherit"
                            >
                                Back
                            </Button>
                        )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={handleClose}
                            disabled={isExporting}
                            variant="outlined"
                            color="inherit"
                        >
                            Cancel
                        </Button>
                        
                        {activeStep < steps.length - 1 ? (
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed() || isExporting}
                                variant="contained"
                                color="primary"
                            >
                                Next
                            </Button>
                        ) : (
                            <LoadingButton
                                onClick={handleExportClick}
                                loading={isExporting}
                                disabled={!canProceed()}
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                sx={{
                                    borderRadius: '50px',
                                    padding: '8px 24px',
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                {isExporting ? 'Exporting...' : 'Download Export'}
                            </LoadingButton>
                        )}
                    </Box>
                </Box>
            </DialogActions>
        </GlassDialog>
    );
};

export default DailyWorkSummaryDownloadForm;
