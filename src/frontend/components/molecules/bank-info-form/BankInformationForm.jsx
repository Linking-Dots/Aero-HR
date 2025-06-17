import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  IconButton,
  Box,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Clear as ClearIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// Internal components
import { 
  BankFormCore,
  FormValidationSummary,
  IfscLookupDisplay 
} from './components';

// Custom hooks
import { 
  useBankForm,
  useIfscLookup,
  useFormValidation 
} from './hooks';

// Configuration
import { BANK_INFO_FORM_CONFIG } from './config';

// Validation schema
import { bankInfoValidationSchema } from './validation';

/**
 * BankInformationForm Component
 * 
 * Comprehensive bank information management form with:
 * - Financial data validation and security
 * - IFSC code lookup and verification
 * - Real-time validation with banking rules
 * - Glass morphism modal design
 * - Accessibility compliance
 * 
 * Features:
 * - Bank account details management
 * - Indian banking system compliance (IFSC, PAN)
 * - Real-time IFSC verification with branch details
 * - Account number format validation by bank
 * - PAN number checksum validation
 * - Duplicate account detection
 * - Data encryption and masking
 * - Audit trail for financial data changes
 * 
 * @param {Object} props Component props
 * @param {Object} props.user - Current user data
 * @param {Function} props.setUser - User state setter
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.closeModal - Modal close handler
 * @param {boolean} props.readOnly - Read-only mode
 * @param {Object} props.permissions - User permissions
 */
const BankInformationForm = ({
  user = {},
  setUser,
  open = false,
  closeModal,
  readOnly = false,
  permissions = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form state management
  const {
    formData,
    isLoading,
    isSubmitting,
    errors: formErrors,
    hasChanges,
    handleSubmit: handleFormSubmit,
    handleFieldChange,
    resetForm,
    validateForm
  } = useBankForm({
    user,
    config: BANK_INFO_FORM_CONFIG,
    onSuccess: (data) => {
      setUser?.(data.user);
      toast.success(data.messages?.length > 0 ? data.messages.join(' ') : 'Bank information updated successfully', {
        icon: '🏦',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      });
      closeModal?.();
    },
    onError: (error) => {
      console.error('Bank form error:', error);
    }
  });

  // IFSC lookup functionality
  const {
    branchDetails,
    isLookingUp,
    lookupError,
    performIfscLookup,
    clearLookupData
  } = useIfscLookup({
    config: BANK_INFO_FORM_CONFIG
  });

  // Form validation
  const {
    validationErrors,
    validationWarnings,
    isValidating,
    validateField,
    clearValidation
  } = useFormValidation({
    config: BANK_INFO_FORM_CONFIG,
    formData
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
    resolver: yupResolver(bankInfoValidationSchema),
    defaultValues: formData,
    mode: 'onChange'
  });

  // Watch for IFSC changes to trigger lookup
  const watchedIfsc = watch('ifsc_code');

  // Handle IFSC code changes
  useEffect(() => {
    if (watchedIfsc && watchedIfsc.length === 11) {
      performIfscLookup(watchedIfsc);
    } else {
      clearLookupData();
    }
  }, [watchedIfsc, performIfscLookup, clearLookupData]);

  // Update form values when user data changes
  useEffect(() => {
    if (user && open) {
      setValue('bank_name', user.bank_name || '');
      setValue('bank_account_no', user.bank_account_no || '');
      setValue('ifsc_code', user.ifsc_code || '');
      setValue('pan_no', user.pan_no || '');
    }
  }, [user, open, setValue]);

  // Handle form submission
  const onSubmit = useCallback(async (data) => {
    try {
      await handleFormSubmit(data);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [handleFormSubmit]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    
    resetForm();
    clearValidation();
    clearLookupData();
    closeModal?.();
  }, [hasChanges, resetForm, clearValidation, clearLookupData, closeModal]);

  // Check if user can edit bank information
  const canEdit = !readOnly && (permissions['profile.edit'] !== false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={BANK_INFO_FORM_CONFIG.ui.layout.maxWidth}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          ...theme.glassCard,
          backdropFilter: 'blur(16px) saturate(200%)',
          minHeight: isMobile ? '100vh' : 'auto'
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ 
        cursor: 'move',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BankIcon color="primary" />
          <Typography variant="h6">
            {BANK_INFO_FORM_CONFIG.sections.banking.title}
          </Typography>
        </Box>
        
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ 
            opacity: 0.7,
            '&:hover': { opacity: 1 }
          }}
        >
          <ClearIcon />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pb: 1 }}>
          {/* Form Description */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 3 }}
          >
            {BANK_INFO_FORM_CONFIG.sections.banking.description}
          </Typography>

          {/* Validation Summary */}
          <FormValidationSummary
            errors={[...Object.values(errors), ...Object.values(validationErrors)]}
            warnings={validationWarnings}
            show={Object.keys(errors).length > 0 || Object.keys(validationErrors).length > 0}
          />

          <Grid container spacing={BANK_INFO_FORM_CONFIG.ui.layout.spacing}>
            {/* Bank Name */}
            <Grid item xs={12}>
              <BankFormCore
                name="bank_name"
                register={register}
                error={errors.bank_name || validationErrors.bank_name}
                value={formData.bank_name}
                onChange={(value) => handleFieldChange('bank_name', value)}
                disabled={!canEdit || isSubmitting}
                config={BANK_INFO_FORM_CONFIG.fields.bankName}
              />
            </Grid>

            {/* Bank Account Number */}
            <Grid item xs={12}>
              <BankFormCore
                name="bank_account_no"
                register={register}
                error={errors.bank_account_no || validationErrors.bank_account_no}
                value={formData.bank_account_no}
                onChange={(value) => handleFieldChange('bank_account_no', value)}
                disabled={!canEdit || isSubmitting}
                config={BANK_INFO_FORM_CONFIG.fields.accountNumber}
                masked={BANK_INFO_FORM_CONFIG.security.masking.enabled && !canEdit}
              />
            </Grid>

            {/* IFSC Code */}
            <Grid item xs={12}>
              <BankFormCore
                name="ifsc_code"
                register={register}
                error={errors.ifsc_code || validationErrors.ifsc_code}
                value={formData.ifsc_code}
                onChange={(value) => handleFieldChange('ifsc_code', value)}
                disabled={!canEdit || isSubmitting}
                config={BANK_INFO_FORM_CONFIG.fields.ifscCode}
                loading={isLookingUp}
              />
            </Grid>

            {/* IFSC Lookup Results */}
            {branchDetails && (
              <Grid item xs={12}>
                <IfscLookupDisplay
                  branchDetails={branchDetails}
                  loading={isLookingUp}
                  error={lookupError}
                />
              </Grid>
            )}

            {/* PAN Number */}
            <Grid item xs={12}>
              <BankFormCore
                name="pan_no"
                register={register}
                error={errors.pan_no || validationErrors.pan_no}
                value={formData.pan_no}
                onChange={(value) => handleFieldChange('pan_no', value)}
                disabled={!canEdit || isSubmitting}
                config={BANK_INFO_FORM_CONFIG.fields.panNumber}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions sx={{ 
          justifyContent: 'center',
          p: 3,
          pt: 1
        }}>
          <LoadingButton
            type="submit"
            variant="outlined"
            color="primary"
            loading={isSubmitting}
            disabled={!hasChanges || !canEdit}
            sx={{
              borderRadius: '50px',
              px: 4,
              py: 1,
              minWidth: 120
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BankInformationForm;
