import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Fade,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

// Internal components
import { 
  AddUserFormCore,
  ProfileImageUpload,
  FormValidationSummary,
  FormProgress 
} from './components';

// Custom hooks
import { 
  useAddUserForm,
  useFormValidation,
  useDepartmentData,
  useFileUpload 
} from './hooks';

// Configuration
import { ADD_USER_FORM_CONFIG } from './config';

// Validation schema
import { addUserValidationSchema } from './validation';

/**
 * AddUserForm Component
 * 
 * Advanced user creation form with role assignment, department management,
 * file upload capabilities, and comprehensive validation following
 * ISO 25010 Software Quality standards.
 * 
 * Features:
 * - Multi-section form with step navigation
 * - Real-time validation with business rules
 * - File upload with image preview
 * - Role-based field visibility
 * - Department-designation dependency
 * - Async validation for unique fields
 * - Glass morphism design
 * - Full accessibility support
 * 
 * @param {Object} props Component props
 * @param {Object} props.user - User data for editing (optional)
 * @param {Array} props.allUsers - Available users for reporting structure
 * @param {Array} props.departments - Available departments
 * @param {Array} props.designations - Available designations
 * @param {Function} props.setUser - User state setter
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.closeModal - Close dialog handler
 * @param {string} props.mode - Form mode: 'create' | 'edit'
 * @param {Object} props.permissions - User permissions
 */
const AddUserForm = ({
  user = null,
  allUsers = [],
  departments = [],
  designations = [],
  setUser,
  open = false,
  closeModal,
  mode = 'create',
  permissions = {},
  onSuccess,
  onError
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form state management
  const {
    formData,
    isLoading,
    isSubmitting,
    errors: formErrors,
    currentStep,
    totalSteps,
    progress,
    handleSubmit: handleFormSubmit,
    handleFieldChange,
    resetForm,
    validateForm,
    canProceedToNext,
    goToNextStep,
    goToPreviousStep
  } = useAddUserForm({
    user,
    mode,
    config: ADD_USER_FORM_CONFIG,
    onSuccess: (data) => {
      setUser?.(data.user);
      toast.success(data.message || 'User created successfully', {
        icon: '✅',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      });
      closeModal?.();
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error('User creation error:', error);
      onError?.(error);
    }
  });

  // Department and designation data management
  const {
    departmentOptions,
    designationOptions,
    reportToOptions,
    loadDepartmentData,
    loadDesignationsForDepartment,
    loadReportToOptions
  } = useDepartmentData({
    departments,
    designations,
    allUsers,
    currentUserId: user?.id,
    selectedDepartment: formData.department
  });

  // File upload management
  const {
    uploadedFile,
    uploadProgress,
    isUploading,
    previewUrl,
    handleFileSelect,
    handleFileRemove,
    uploadError
  } = useFileUpload({
    maxSize: ADD_USER_FORM_CONFIG.fields.profile_image.maxSize,
    allowedTypes: ADD_USER_FORM_CONFIG.fields.profile_image.validation.allowedTypes,
    onUploadComplete: (file, url) => {
      handleFieldChange('profile_image', file);
    }
  });

  // Form validation
  const {
    validationErrors,
    validationWarnings,
    isValidating,
    validateField,
    validateAsync,
    clearValidation
  } = useFormValidation({
    config: ADD_USER_FORM_CONFIG,
    formData,
    mode
  });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    trigger
  } = useForm({
    resolver: yupResolver(addUserValidationSchema),
    mode: 'onChange',
    defaultValues: formData
  });

  // Watch form changes for real-time validation
  const watchedValues = watch();

  // Handle dialog close with confirmation
  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return; // Prevent closing during submission
    }

    // Check if form has changes
    const hasChanges = Object.keys(watchedValues).some(
      key => watchedValues[key] !== (user?.[key] || '')
    );

    if (hasChanges && ADD_USER_FORM_CONFIG.businessRules.requireConfirmation) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        resetForm();
        closeModal?.();
      }
    } else {
      resetForm();
      closeModal?.();
    }
  }, [isSubmitting, watchedValues, user, resetForm, closeModal]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await validateForm(data);
      await handleFormSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle department change
  const handleDepartmentChange = useCallback(async (departmentId) => {
    handleFieldChange('department', departmentId);
    
    // Reset designation when department changes
    handleFieldChange('designation', '');
    setValue('designation', '');
    
    // Load designations for the selected department
    await loadDesignationsForDepartment(departmentId);
    
    // Update report-to options based on department
    await loadReportToOptions(departmentId);
  }, [handleFieldChange, setValue, loadDesignationsForDepartment, loadReportToOptions]);

  // Load initial data
  useEffect(() => {
    if (open) {
      loadDepartmentData();
      if (formData.department) {
        loadDesignationsForDepartment(formData.department);
        loadReportToOptions(formData.department);
      }
    }
  }, [open, formData.department, loadDepartmentData, loadDesignationsForDepartment, loadReportToOptions]);

  // Sync form data with React Hook Form
  useEffect(() => {
    Object.keys(formData).forEach(key => {
      setValue(key, formData[key]);
    });
  }, [formData, setValue]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          borderRadius: isMobile ? 0 : 3,
          minHeight: isMobile ? '100vh' : '80vh'
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: ADD_USER_FORM_CONFIG.ui.animations.duration
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            {mode === 'edit' ? 'Edit User' : 'Add New User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ADD_USER_FORM_CONFIG.formDescription}
          </Typography>
        </Box>
        
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{ color: 'text.secondary' }}
          aria-label="Close dialog"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Progress Indicator */}
      {ADD_USER_FORM_CONFIG.ui.form.showProgress && (
        <Box sx={{ px: 3 }}>
          <FormProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            progress={progress}
            isLoading={isLoading || isSubmitting}
          />
        </Box>
      )}

      {/* Loading Indicator */}
      {(isLoading || isSubmitting) && (
        <LinearProgress 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1
          }} 
        />
      )}

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ width: '100%' }}
        >
          {/* Validation Summary */}
          <FormValidationSummary
            errors={[...Object.values(errors), ...Object.values(validationErrors)]}
            warnings={validationWarnings}
            show={Object.keys(errors).length > 0 || Object.keys(validationErrors).length > 0}
          />

          <Grid container spacing={ADD_USER_FORM_CONFIG.ui.form.spacing}>
            {/* Profile Image Upload */}
            <Grid item xs={12}>
              <ProfileImageUpload
                currentImage={user?.profile_image_url}
                previewUrl={previewUrl}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={uploadError}
                disabled={isSubmitting}
              />
            </Grid>

            {/* Main Form Fields */}
            <Grid item xs={12}>
              <AddUserFormCore
                register={register}
                errors={errors}
                formData={formData}
                onChange={handleFieldChange}
                onDepartmentChange={handleDepartmentChange}
                departmentOptions={departmentOptions}
                designationOptions={designationOptions}
                reportToOptions={reportToOptions}
                permissions={permissions}
                mode={mode}
                isSubmitting={isSubmitting}
                validationErrors={validationErrors}
                onValidateField={validateField}
                onValidateAsync={validateAsync}
                config={ADD_USER_FORM_CONFIG}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          justifyContent: 'space-between',
          px: 3,
          pb: 3,
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentStep > 1 && (
            <IconButton
              onClick={goToPreviousStep}
              disabled={isSubmitting}
              size="small"
            >
              ←
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              ...ADD_USER_FORM_CONFIG.ui.buttons.cancel,
              padding: '8px 24px',
              border: 'none',
              borderRadius: ADD_USER_FORM_CONFIG.ui.buttons.submit.borderRadius,
              background: 'transparent',
              color: theme.palette.text.secondary,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {ADD_USER_FORM_CONFIG.ui.buttons.cancel.text}
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={goToNextStep}
              disabled={!canProceedToNext || isSubmitting}
              style={{
                ...ADD_USER_FORM_CONFIG.ui.buttons.submit,
                padding: '8px 24px',
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: ADD_USER_FORM_CONFIG.ui.buttons.submit.borderRadius,
                background: 'transparent',
                color: theme.palette.primary.main,
                cursor: (!canProceedToNext || isSubmitting) ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canProceedToNext || isSubmitting}
              style={{
                ...ADD_USER_FORM_CONFIG.ui.buttons.submit,
                padding: '8px 24px',
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: ADD_USER_FORM_CONFIG.ui.buttons.submit.borderRadius,
                background: 'transparent',
                color: theme.palette.primary.main,
                cursor: (!canProceedToNext || isSubmitting) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting 
                ? ADD_USER_FORM_CONFIG.ui.buttons.submit.loadingText 
                : ADD_USER_FORM_CONFIG.ui.buttons.submit.text
              }
            </button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Default props
AddUserForm.defaultProps = {
  user: null,
  allUsers: [],
  departments: [],
  designations: [],
  open: false,
  mode: 'create',
  permissions: {}
};

export default AddUserForm;
