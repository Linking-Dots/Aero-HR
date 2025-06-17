/**
 * Personal Information Form Molecule
 * 
 * A comprehensive personal information management form component following
 * Atomic Design principles and ISO 25010 maintainability standards.
 * 
 * Features:
 * - Advanced form validation with business rules
 * - Conditional field visibility based on marital status
 * - Real-time validation feedback
 * - Responsive design for all screen sizes
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Smart field dependencies and auto-clearing
 * 
 * @component
 * @example
 * ```jsx
 * <PersonalInformationForm 
 *   user={userData}
 *   open={isOpen}
 *   onClose={handleClose}
 *   onSave={handleSave}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  Box,
  Alert,
  Collapse
} from '@mui/material';
import {
  ClearIcon,
  PersonIcon,
  SaveIcon,
  RestoreIcon,
  InfoIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

// Import atomic components
import { GlassDialog } from '@components/atoms/glass-dialog';

// Import molecule components  
import { PersonalInfoFormCore } from './components/PersonalInfoFormCore';
import { FormValidationSummary } from './components/FormValidationSummary';

// Import custom hooks
import { usePersonalInfoForm } from './hooks/usePersonalInfoForm';
import { useFormValidation } from './hooks/useFormValidation';
import { useConditionalFields } from './hooks/useConditionalFields';

// Import configuration
import { PERSONAL_INFO_FORM_CONFIG } from './config';

/**
 * Main PersonalInformationForm Component
 * 
 * Manages user personal information with conditional fields,
 * business rule validation, and smart field dependencies.
 */
const PersonalInformationForm = ({
  user = {},
  open = false,
  onClose = () => {},
  onSave = () => {},
  mode = 'edit', // 'edit' | 'view'
  loading = false
}) => {
  const theme = useTheme();

  // Initialize form state with custom hooks
  const {
    formData,
    originalData,
    hasChanges,
    updateField,
    resetForm,
    validateForm,
    isSubmitting,
    submitForm
  } = usePersonalInfoForm({
    initialData: user,
    config: PERSONAL_INFO_FORM_CONFIG,
    onSubmit: onSave
  });

  const {
    errors,
    warnings,
    isValid,
    validateField,
    clearFieldError,
    getFieldError
  } = useFormValidation({
    data: formData,
    config: PERSONAL_INFO_FORM_CONFIG,
    mode: PERSONAL_INFO_FORM_CONFIG.VALIDATION.mode
  });

  const {
    visibleFields,
    shouldShowField,
    handleFieldChange,
    clearDependentFields
  } = useConditionalFields({
    formData,
    config: PERSONAL_INFO_FORM_CONFIG,
    onFieldUpdate: updateField
  });

  // State for UI interactions
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Handle form submission with comprehensive validation
   */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    // Validate entire form
    const validationResult = await validateForm();
    if (!validationResult.isValid) {
      setShowValidationSummary(true);
      toast.error(PERSONAL_INFO_FORM_CONFIG.NOTIFICATIONS.validation.message);
      return;
    }

    try {
      // Apply business rules before submission
      const submissionData = applyBusinessRules(formData);

      await submitForm(submissionData);
      
      toast.success(PERSONAL_INFO_FORM_CONFIG.NOTIFICATIONS.success.message);
      onClose();
    } catch (error) {
      console.error('Personal info form submission error:', error);
      toast.error(error.message || PERSONAL_INFO_FORM_CONFIG.NOTIFICATIONS.error.message);
    }
  }, [formData, validateForm, submitForm, onClose]);

  /**
   * Apply business rules to form data
   */
  const applyBusinessRules = useCallback((data) => {
    const processedData = { ...data };
    const rules = PERSONAL_INFO_FORM_CONFIG.BUSINESS_RULES;

    // Apply marital status rules
    if (data.marital_status === 'single' && rules.maritalStatusRules) {
      rules.maritalStatusRules.clearOnSingle.forEach(field => {
        processedData[field] = null;
      });
    }

    // Clean up empty string values (convert to null for API)
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === '') {
        processedData[key] = null;
      }
    });

    return processedData;
  }, []);

  /**
   * Handle form reset with confirmation
   */
  const handleReset = useCallback(async () => {
    if (!hasChanges) return;

    setIsResetting(true);
    try {
      await resetForm();
      setShowValidationSummary(false);
      toast.info('Form has been reset to original values');
    } finally {
      setIsResetting(false);
    }
  }, [hasChanges, resetForm]);

  /**
   * Handle dialog close with unsaved changes check
   */
  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  /**
   * Handle field change with business rules
   */
  const handleFieldChangeWithRules = useCallback((fieldName, value) => {
    // Update the field
    handleFieldChange(fieldName, value);
    
    // Clear field error
    clearFieldError(fieldName);
    
    // Apply business rules for specific fields
    if (fieldName === 'marital_status' && value === 'single') {
      const rules = PERSONAL_INFO_FORM_CONFIG.BUSINESS_RULES.maritalStatusRules;
      clearDependentFields(rules.clearOnSingle);
    }
    
    // Trigger field validation
    setTimeout(() => {
      validateField(fieldName, value);
    }, 300);
  }, [handleFieldChange, clearFieldError, clearDependentFields, validateField]);

  /**
   * Get info about conditional fields
   */
  const getConditionalFieldInfo = useMemo(() => {
    const maritalStatus = formData.marital_status;
    if (maritalStatus === 'married') {
      return {
        show: true,
        message: 'Additional fields are available because marital status is set to "Married".'
      };
    }
    return { show: false, message: '' };
  }, [formData.marital_status]);

  // Error boundary fallback
  if (loading) {
    return (
      <GlassDialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="200px"
          >
            <Typography>Loading personal information form...</Typography>
          </Box>
        </DialogContent>
      </GlassDialog>
    );
  }

  return (
    <GlassDialog
      open={open}
      onClose={handleClose}
      {...PERSONAL_INFO_FORM_CONFIG.UI.dialog}
      aria-labelledby="personal-info-form-title"
      aria-describedby="personal-info-form-description"
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Form Header */}
        <DialogTitle 
          id="personal-info-form-title"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            <Typography variant="h6" component="h2">
              Personal Information
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
            {hasChanges && (
              <IconButton
                onClick={handleReset}
                disabled={isResetting || isSubmitting}
                title="Reset changes"
                size="small"
              >
                <RestoreIcon />
              </IconButton>
            )}
            <IconButton
              onClick={handleClose}
              disabled={isSubmitting}
              size="small"
              aria-label="Close form"
            >
              <ClearIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {/* Validation Summary */}
          <Collapse in={showValidationSummary && Object.keys(errors).length > 0}>
            <FormValidationSummary
              errors={errors}
              warnings={warnings}
              onClose={() => setShowValidationSummary(false)}
              sx={{ mb: 3 }}
            />
          </Collapse>

          {/* Conditional Fields Info */}
          {getConditionalFieldInfo.show && (
            <Alert 
              severity="info" 
              icon={<InfoIcon />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2">
                {getConditionalFieldInfo.message}
              </Typography>
            </Alert>
          )}

          {/* Form Fields */}
          <PersonalInfoFormCore
            formData={formData}
            errors={errors}
            visibleFields={visibleFields}
            shouldShowField={shouldShowField}
            onFieldChange={handleFieldChangeWithRules}
            onFieldValidate={validateField}
            onFieldErrorClear={clearFieldError}
            disabled={mode === 'view' || isSubmitting}
            config={PERSONAL_INFO_FORM_CONFIG}
          />

          {/* Help Text */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              <strong>Note:</strong> All fields in this form are optional. 
              Fields marked with business rules will automatically clear when marital status changes to "Single".
            </Typography>
          </Box>
        </DialogContent>

        {/* Form Actions */}
        {mode !== 'view' && (
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <LoadingButton
              onClick={handleClose}
              disabled={isSubmitting}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </LoadingButton>
            
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={!isValid && hasChanges}
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              loadingPosition="start"
            >
              Save Personal Information
            </LoadingButton>
          </DialogActions>
        )}
      </form>
    </GlassDialog>
  );
};

export default PersonalInformationForm;
