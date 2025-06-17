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
    Slide,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    Download as DownloadIcon,
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import GlassDialog from '@/Components/GlassDialog.jsx';
import LoadingButton from '@mui/lab/LoadingButton';

// Import form components and hooks
import DailyWorksDownloadFormCore from './DailyWorksDownloadFormCore';
import DailyWorksDownloadFormValidationSummary from './DailyWorksDownloadFormValidationSummary';
import { useCompleteDailyWorksDownloadForm } from './hooks/useCompleteDailyWorksDownloadForm';
import { useDailyWorksDownloadFormAnalytics } from './hooks/useDailyWorksDownloadFormAnalytics';

/**
 * Complete Daily Works Download Form Component
 * Enterprise-grade export interface with multi-step workflow for construction project data
 */
const DailyWorksDownloadForm = ({ 
    open, 
    onClose, 
    data = [], 
    users = [],
    title = "Export Daily Works",
    subtitle = "Configure and export construction project data",
    maxWidth = "lg",
    fullWidth = true,
    showAdvancedFeatures = true 
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
        loadConfiguration,
        exportStatus,
        exportProgress,
        exportError
    } = useCompleteDailyWorksDownloadForm({
        data,
        users,
        onClose,
        onExportComplete: (result) => {
            console.log('Export completed:', result);
        },
        onExportError: (error) => {
            console.error('Export failed:', error);
        }
    });

    // Analytics tracking
    const { trackEvent, trackStepNavigation, trackExportAction } = useDailyWorksDownloadFormAnalytics({
        formId: 'daily-works-download',
        userId: 'current-user', // Replace with actual user ID
        sessionId: 'current-session' // Replace with actual session ID
    });

    // Form steps configuration
    const steps = [
        {
            label: 'Configure Export',
            description: 'Select columns and export format',
            icon: <SettingsIcon />,
            component: 'configure'
        },
        {
            label: 'Preview & Validate',
            description: 'Review selections and validate data',
            icon: <VisibilityIcon />,
            component: 'validate'
        },
        {
            label: 'Download',
            description: 'Generate and download file',
            icon: <DownloadIcon />,
            component: 'download'
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
                recordCount: data.length,
                performanceMode: exportConfig?.performanceMode
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
                    <DailyWorksDownloadFormCore
                        data={data}
                        users={users}
                        onExport={handleExport}
                        disabled={isExporting}
                        showPreview={false}
                        showAdvancedOptions={showAdvancedFeatures}
                    />
                );
            case 1:
                return (
                    <Box>
                        <DailyWorksDownloadFormValidationSummary
                            validation={validation}
                            summary={formState?.summary}
                            estimatedExportTime={formState?.estimatedExportTime}
                            estimatedFileSize={formState?.estimatedFileSize}
                            performanceMode={formState?.performanceMode}
                            exportFormat={formState?.exportFormat}
                        />
                        <Divider sx={{ my: 3 }} />
                        <DailyWorksDownloadFormCore
                            data={data}
                            users={users}
                            onExport={handleExport}
                            disabled={isExporting}
                            showPreview={true}
                            showAdvancedOptions={false}
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        {isExporting || exportStatus === 'processing' ? (
                            <Box>
                                <CircularProgress size={60} sx={{ mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    {exportStatus === 'preparing' && 'Preparing Export...'}
                                    {exportStatus === 'processing' && 'Generating Export File...'}
                                    {exportStatus === 'completing' && 'Finalizing Export...'}
                                    {(!exportStatus || exportStatus === 'idle') && 'Processing...'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Processing {data.length} records with {exportConfig?.selectedColumns?.length || 0} columns
                                </Typography>
                                {exportProgress > 0 && (
                                    <Box sx={{ mt: 2, minWidth: 200 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Progress: {exportProgress}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={exportProgress} 
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        ) : exportStatus === 'completed' ? (
                            <Box>
                                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6" gutterBottom color="success.main">
                                    Export Completed Successfully!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Your file has been downloaded
                                </Typography>
                            </Box>
                        ) : exportStatus === 'error' ? (
                            <Box>
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Export Failed
                                    </Typography>
                                    <Typography variant="body2">
                                        {exportError || 'An unexpected error occurred during export'}
                                    </Typography>
                                </Alert>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setActiveStep(0)}
                                    startIcon={<SettingsIcon />}
                                >
                                    Reconfigure Export
                                </Button>
                            </Box>
                        ) : (
                            <Box>
                                <CloudDownloadIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Ready to Export
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Click the download button to generate your file
                                </Typography>
                                <Box sx={{ mt: 3 }}>
                                    <DailyWorksDownloadFormValidationSummary
                                        validation={validation}
                                        summary={formState?.summary}
                                        estimatedExportTime={formState?.estimatedExportTime}
                                        estimatedFileSize={formState?.estimatedFileSize}
                                        performanceMode={formState?.performanceMode}
                                        exportFormat={formState?.exportFormat}
                                        compact={true}
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
                    maxHeight: '90vh',
                    overflow: 'hidden'
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
                            <StepLabel
                                StepIconComponent={({ active, completed }) => (
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                                            color: 'white'
                                        }}
                                    >
                                        {completed ? <CheckCircleIcon fontSize="small" /> : step.icon}
                                    </Box>
                                )}
                            >
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
            <DialogContent 
                sx={{ 
                    minHeight: 400, 
                    p: 3,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: theme.palette.grey[100],
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.grey[400],
                        borderRadius: '4px',
                    },
                }}
            >
                <Fade in={true} timeout={300}>
                    <Box>
                        {getStepContent()}
                    </Box>
                </Fade>

                {/* Global validation errors */}
                {validation?.errors?.length > 0 && activeStep < 2 && (
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                        
                        {showAdvancedFeatures && (
                            <Button
                                onClick={resetForm}
                                disabled={isExporting}
                                variant="outlined"
                                color="inherit"
                                size="small"
                            >
                                Reset
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
                                loading={isExporting || exportStatus === 'processing'}
                                disabled={!canProceed() || exportStatus === 'completed'}
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
                                {isExporting || exportStatus === 'processing' ? 'Exporting...' : 'Download Export'}
                            </LoadingButton>
                        )}
                    </Box>
                </Box>
            </DialogActions>
        </GlassDialog>
    );
};

export default DailyWorksDownloadForm;
