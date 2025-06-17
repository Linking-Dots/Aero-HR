/**
 * @fileoverview Salary Information Form Component
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Advanced salary information form component providing:
 * - Comprehensive salary management with PF/ESI calculations
 * - Indian statutory compliance validation
 * - Real-time analytics and calculations
 * - Auto-save functionality with validation
 * - Glass morphism design with accessibility
 * 
 * Follows Atomic Design principles (Molecule) and implements:
 * - ISO 25010 Software Quality standards
 * - ISO 27001 Information Security guidelines
 * - ISO 9001 Quality Management principles
 * 
 * Features:
 * - Advanced PF calculation engine with Indian compliance
 * - ESI contribution management with eligibility checks
 * - Real-time salary analytics and CTC calculations
 * - Comprehensive validation with error categorization
 * - Auto-save with configurable intervals
 * - Responsive glass morphism design
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  Fab,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Import custom hooks
import { useSalaryForm } from './hooks';

// Import sub-components
import {
  SalaryFormCore,
  PFInformationSection,
  ESIInformationSection,
  SalaryAnalyticsSummary,
  FormValidationSummary
} from './components';

// Import configuration
import { salaryFormConfig } from './config';

// Styled components for glass morphism design
const FormContainer = styled(Container)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  minHeight: '80vh',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(46, 213, 115, 0.02), rgba(0, 184, 148, 0.02))',
    borderRadius: '24px',
    pointerEvents: 'none'
  }
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: theme.spacing(2),
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(15px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}));

const StyledButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, #2196f3, #42a5f5)',
    border: '1px solid rgba(33, 150, 243, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1976d2, #2196f3)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)'
    }
  }),
  ...(variant === 'outlined' && {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: theme.palette.text.primary,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)'
    }
  })
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(76, 175, 80, 0.3)',
  zIndex: 1200,
  '&:hover': {
    background: 'linear-gradient(135deg, #388e3c, #4caf50)',
    transform: 'scale(1.1)',
    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)'
  }
}));

/**
 * SalaryInformationForm Component
 * 
 * Main component for salary information management with PF/ESI calculations
 */
const SalaryInformationForm = memo(({
  initialData = {},
  onSubmit,
  onSave,
  autoSave = true,
  autoSaveDelay = 3000,
  showAnalytics = true,
  showValidation = true,
  enableFloatingActions = true,
  variant = 'default',
  isLoading: externalLoading = false,
  disabled = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Local state
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Main salary form hook
  const {
    formik,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    pfData,
    esiData,
    analyticsData,
    errors,
    hasErrors,
    handlePFContributionChange,
    handleESIContributionChange,
    handleSalaryAmountChange,
    validateForm,
    resetForm,
    getFormData,
    isValid,
    canSubmit,
    config
  } = useSalaryForm({
    initialData,
    onSubmit: async (values) => {
      setSubmitAttempted(true);
      if (onSubmit) {
        await onSubmit(values);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    },
    onSave,
    autoSave,
    autoSaveDelay,
    enableAnalytics: showAnalytics
  });

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    
    // Validate form before submission
    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }
    
    formik.handleSubmit(event);
  }, [formik, validateForm]);

  // Handle manual save
  const handleManualSave = useCallback(async () => {
    if (onSave && formik.dirty) {
      try {
        await onSave(getFormData());
        toast.success('Changes saved successfully');
      } catch (error) {
        toast.error('Failed to save changes');
      }
    }
  }, [onSave, formik.dirty, getFormData]);

  // Handle form reset
  const handleReset = useCallback(() => {
    resetForm();
    setSubmitAttempted(false);
    setShowSuccess(false);
    toast.info('Form reset to initial values');
  }, [resetForm]);

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    const requiredFields = ['salaryAmount', 'salaryBasis', 'paymentType'];
    const conditionalFields = [];
    
    if (formik.values.pfContribution) {
      conditionalFields.push('pfNumber', 'pfEmployeeRate');
    }
    
    if (formik.values.esiContribution) {
      conditionalFields.push('esiNumber', 'esiEmployeeRate');
    }
    
    const allFields = [...requiredFields, ...conditionalFields];
    const completedFields = allFields.filter(field => formik.values[field]);
    
    return allFields.length > 0 ? (completedFields.length / allFields.length) * 100 : 0;
  }, [formik.values]);

  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleManualSave();
            break;
          case 'Enter':
            if (canSubmit) {
              event.preventDefault();
              handleSubmit(event);
            }
            break;
          case 'r':
            event.preventDefault();
            handleReset();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave, handleSubmit, handleReset, canSubmit]);

  const isFormLoading = isLoading || externalLoading;
  const isFormDisabled = disabled || isFormLoading;

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(5px)'
        }}
        open={isFormLoading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isSaving ? 'Saving...' : 'Loading...'}
          </Typography>
        </Box>
      </Backdrop>

      <FormContainer maxWidth="lg">
        {/* Form Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2196f3, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 2
            }}
          >
            <MonetizationOnIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Salary Information Management
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Configure employee salary with automatic PF and ESI calculations based on Indian statutory requirements
          </Typography>
        </Box>

        {/* Success Alert */}
        <Fade in={showSuccess}>
          <Alert
            severity="success"
            sx={{
              mb: 3,
              background: 'rgba(76, 175, 80, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '12px'
            }}
          >
            Salary information has been saved successfully!
          </Alert>
        </Fade>

        {/* Form Content */}
        <form onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Salary Core Section */}
            <Zoom in timeout={300}>
              <Box>
                <SalaryFormCore
                  formik={formik}
                  config={config}
                  analyticsData={analyticsData}
                  onSalaryAmountChange={handleSalaryAmountChange}
                  errors={errors}
                  isLoading={isFormDisabled}
                  showAnalytics={showAnalytics}
                />
              </Box>
            </Zoom>

            {/* PF Information Section */}
            <Zoom in timeout={400}>
              <Box>
                <PFInformationSection
                  formik={formik}
                  pfData={pfData}
                  pfRules={config.businessRules.pf}
                  onPFContributionChange={handlePFContributionChange}
                  formatPFAmount={(amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  isPFCompliant={pfData?.isValid || false}
                  errors={errors}
                  isLoading={isFormDisabled}
                  showDetails={true}
                />
              </Box>
            </Zoom>

            {/* ESI Information Section */}
            <Zoom in timeout={500}>
              <Box>
                <ESIInformationSection
                  formik={formik}
                  esiData={esiData}
                  esiRules={config.businessRules.esi}
                  onESIContributionChange={handleESIContributionChange}
                  formatESIAmount={(amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  isESICompliant={esiData?.isValid || false}
                  isESIEligible={formik.values.salaryAmount <= config.businessRules.esi.salaryThreshold}
                  getESIBenefits={() => ({
                    medicalBenefits: { employee: 'Full medical care', family: 'Dependent coverage' },
                    cashBenefits: { sickness: 'Up to 91 days', maternity: '26 weeks' }
                  })}
                  salaryAmount={formik.values.salaryAmount}
                  errors={errors}
                  isLoading={isFormDisabled}
                  showDetails={true}
                />
              </Box>
            </Zoom>

            {/* Salary Analytics Summary */}
            {showAnalytics && analyticsData && (
              <Zoom in timeout={600}>
                <Box>
                  <SalaryAnalyticsSummary
                    analyticsData={analyticsData}
                    pfData={pfData}
                    esiData={esiData}
                    salaryAmount={formik.values.salaryAmount}
                    config={config}
                    formatCurrency={(amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    showDetailedBreakdown={true}
                    showComplianceStatus={true}
                  />
                </Box>
              </Zoom>
            )}

            {/* Form Validation Summary */}
            {showValidation && (
              <Zoom in timeout={700}>
                <Box>
                  <FormValidationSummary
                    validationSummary={{
                      totalFields: Object.keys(formik.values).length,
                      validFields: Object.keys(formik.values).filter(key => formik.values[key] && !errors[key]).length,
                      fieldsWithErrors: Object.keys(errors).length,
                      completionPercentage,
                      isFormValid: isValid
                    }}
                    errors={errors}
                    hasUnsavedChanges={hasUnsavedChanges}
                    lastSaved={lastSaved}
                    isSaving={isSaving}
                    isValid={isValid}
                    completionPercentage={completionPercentage}
                    showDetailedErrors={true}
                    showProgress={true}
                    showSaveStatus={true}
                  />
                </Box>
              </Zoom>
            )}
          </Box>

          {/* Action Buttons */}
          <ActionButtonContainer>
            <StyledButton
              variant="outlined"
              onClick={handleReset}
              disabled={isFormDisabled || !formik.dirty}
              startIcon={<RefreshIcon />}
              size={isMobile ? 'small' : 'medium'}
            >
              Reset
            </StyledButton>

            <StyledButton
              variant="outlined"
              onClick={handleManualSave}
              disabled={isFormDisabled || !formik.dirty}
              startIcon={<SaveIcon />}
              size={isMobile ? 'small' : 'medium'}
            >
              Save
            </StyledButton>

            <StyledButton
              type="submit"
              variant="contained"
              disabled={isFormDisabled || !canSubmit}
              startIcon={<SendIcon />}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                background: canSubmit 
                  ? 'linear-gradient(135deg, #4caf50, #66bb6a)' 
                  : 'rgba(158, 158, 158, 0.3)',
                '&:hover': {
                  background: canSubmit 
                    ? 'linear-gradient(135deg, #388e3c, #4caf50)' 
                    : 'rgba(158, 158, 158, 0.3)'
                }
              }}
            >
              Submit
            </StyledButton>
          </ActionButtonContainer>
        </form>

        {/* Floating Action Button for Quick Save */}
        {enableFloatingActions && hasUnsavedChanges && !isMobile && (
          <FloatingActionButton
            onClick={handleManualSave}
            disabled={isFormDisabled}
            aria-label="Quick save"
          >
            <SaveIcon />
          </FloatingActionButton>
        )}

        {/* Info Alert */}
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{
            mt: 3,
            background: 'rgba(33, 150, 243, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            borderRadius: '12px'
          }}
        >
          <Typography variant="body2">
            <strong>Keyboard Shortcuts:</strong> Ctrl+S (Save), Ctrl+Enter (Submit), Ctrl+R (Reset). 
            Auto-save is {autoSave ? 'enabled' : 'disabled'}.
          </Typography>
        </Alert>
      </FormContainer>
    </Box>
  );
});

SalaryInformationForm.propTypes = {
  /** Initial form data */
  initialData: PropTypes.object,
  /** Form submission handler */
  onSubmit: PropTypes.func,
  /** Auto-save handler */
  onSave: PropTypes.func,
  /** Enable auto-save functionality */
  autoSave: PropTypes.bool,
  /** Auto-save delay in milliseconds */
  autoSaveDelay: PropTypes.number,
  /** Show analytics section */
  showAnalytics: PropTypes.bool,
  /** Show validation summary */
  showValidation: PropTypes.bool,
  /** Enable floating action buttons */
  enableFloatingActions: PropTypes.bool,
  /** Form variant */
  variant: PropTypes.oneOf(['default', 'compact', 'detailed']),
  /** External loading state */
  isLoading: PropTypes.bool,
  /** Disable form interactions */
  disabled: PropTypes.bool
};

SalaryInformationForm.displayName = 'SalaryInformationForm';

export default SalaryInformationForm;
