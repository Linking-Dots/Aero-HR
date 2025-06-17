import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Box,
  Typography,
  Grid,
  Fade,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// Internal components
import { 
  CompanyFormCore,
  FormValidationSummary,
  CountryStateSelector 
} from './components';

// Custom hooks
import { 
  useCompanyForm,
  useCountryData,
  useFormValidation 
} from './hooks';

// Configuration
import { COMPANY_INFO_FORM_CONFIG } from './config';

// Validation schema
import { companyInfoValidationSchema } from './validation';

/**
 * CompanyInformationForm Component
 * 
 * Comprehensive company information management form with:
 * - Country/state dependency management
 * - Real-time validation
 * - Glass morphism design
 * - Auto-save functionality (optional)
 * - Accessibility compliance
 * 
 * Features:
 * - Company details management (name, contact person)
 * - Location information with country/state dependencies
 * - Contact information (email, phone, fax, website)
 * - Real-time field validation
 * - Responsive design with mobile optimization
 * - Glass morphism UI theme
 * - Error handling and success notifications
 * 
 * @param {Object} props Component props
 * @param {Object} props.settings - Current company settings
 * @param {Function} props.setSettings - Settings state setter
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onSuccess - Success callback
 * @param {Function} props.onError - Error callback
 * @param {Object} props.permissions - User permissions
 * @param {boolean} props.readOnly - Read-only mode
 */
const CompanyInformationForm = ({
  settings = {},
  setSettings,
  loading = false,
  onSuccess,
  onError,
  permissions = {},
  readOnly = false
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
    validateForm,
    autoSave
  } = useCompanyForm({
    settings,
    config: COMPANY_INFO_FORM_CONFIG,
    onSuccess: (data) => {
      setSettings?.(data.companySettings);
      toast.success(data.message || 'Company information updated successfully', {
        icon: '✅',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary
        }
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Company form error:', error);
      onError?.(error);
    }
  });

  // Country and state data management
  const {
    countries,
    states,
    selectedCountry,
    loadingCountries,
    loadingStates,
    loadCountries,
    loadStatesForCountry,
    getCountryByName,
    getStateByName
  } = useCountryData({
    initialCountry: formData.country,
    config: COMPANY_INFO_FORM_CONFIG
  });

  // Form validation
  const {
    validationErrors,
    validationWarnings,
    isValidating,
    validateField,
    clearValidation
  } = useFormValidation({
    config: COMPANY_INFO_FORM_CONFIG,
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
    resolver: yupResolver(companyInfoValidationSchema),
    mode: 'onChange',
    defaultValues: formData
  });

  // Watch form changes
  const watchedValues = watch();

  // Handle country change
  const handleCountryChange = useCallback(async (countryName) => {
    handleFieldChange('country', countryName);
    
    // Reset state when country changes
    if (COMPANY_INFO_FORM_CONFIG.businessRules.countryStateDependency.resetStateOnCountryChange) {
      handleFieldChange('state', '');
      setValue('state', '');
    }
    
    // Load states for the selected country
    if (countryName) {
      const country = getCountryByName(countryName);
      if (country) {
        await loadStatesForCountry(country.code || country.code2);
      }
    }
  }, [handleFieldChange, setValue, getCountryByName, loadStatesForCountry]);

  // Handle website URL formatting
  const handleWebsiteChange = useCallback((value) => {
    let formattedUrl = value;
    
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      if (COMPANY_INFO_FORM_CONFIG.businessRules.fieldValidation.website.autoPrefix) {
        formattedUrl = `https://${value}`;
      }
    }
    
    handleFieldChange('websiteUrl', formattedUrl);
  }, [handleFieldChange]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      await validateForm(data);
      await handleFormSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle form reset
  const handleReset = useCallback(() => {
    resetForm();
    clearErrors();
    clearValidation();
  }, [resetForm, clearErrors, clearValidation]);

  // Load initial data
  useEffect(() => {
    loadCountries();
    
    // Load states if country is already selected
    if (formData.country) {
      const country = getCountryByName(formData.country);
      if (country) {
        loadStatesForCountry(country.code || country.code2);
      }
    }
  }, [loadCountries, formData.country, getCountryByName, loadStatesForCountry]);

  // Sync form data with React Hook Form
  useEffect(() => {
    Object.keys(formData).forEach(key => {
      setValue(key, formData[key]);
    });
  }, [formData, setValue]);

  // Auto-save functionality
  useEffect(() => {
    if (COMPANY_INFO_FORM_CONFIG.performance.autoSave.enabled && hasChanges && !isSubmitting) {
      const autoSaveFields = COMPANY_INFO_FORM_CONFIG.performance.autoSave.fields;
      const hasAutoSaveChanges = autoSaveFields.some(field => 
        watchedValues[field] !== settings[field]
      );
      
      if (hasAutoSaveChanges) {
        autoSave(watchedValues);
      }
    }
  }, [watchedValues, hasChanges, isSubmitting, autoSave, settings]);

  const canEdit = !readOnly && permissions.canEditCompanySettings !== false;

  return (
    <Fade in timeout={COMPANY_INFO_FORM_CONFIG.ui.animations.duration}>
      <Card
        sx={{
          maxWidth: COMPANY_INFO_FORM_CONFIG.ui.form.maxWidth,
          mx: 'auto',
          mt: 2,
          backdropFilter: COMPANY_INFO_FORM_CONFIG.ui.glassEffect.backdropFilter,
          background: COMPANY_INFO_FORM_CONFIG.ui.glassEffect.background,
          border: COMPANY_INFO_FORM_CONFIG.ui.glassEffect.border,
          borderRadius: COMPANY_INFO_FORM_CONFIG.ui.glassEffect.borderRadius
        }}
      >
        {/* Card Header */}
        <CardHeader
          avatar={<BusinessIcon color="primary" />}
          title={
            <Typography variant="h5" component="h2">
              {COMPANY_INFO_FORM_CONFIG.formTitle}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {COMPANY_INFO_FORM_CONFIG.formDescription}
            </Typography>
          }
          action={
            hasChanges && (
              <Typography variant="caption" color="warning.main">
                Unsaved changes
              </Typography>
            )
          }
        />

        {/* Loading Indicator */}
        {(isLoading || isSubmitting || loading) && (
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

        {/* Card Content */}
        <CardContent>
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

            <Grid container spacing={COMPANY_INFO_FORM_CONFIG.ui.form.spacing}>
              {/* Company Details Section */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {COMPANY_INFO_FORM_CONFIG.sections.company.title}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <CompanyFormCore
                      name="companyName"
                      register={register}
                      error={errors.companyName || validationErrors.companyName}
                      value={formData.companyName}
                      onChange={(value) => handleFieldChange('companyName', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.companyName}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <CompanyFormCore
                      name="contactPerson"
                      register={register}
                      error={errors.contactPerson || validationErrors.contactPerson}
                      value={formData.contactPerson}
                      onChange={(value) => handleFieldChange('contactPerson', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.contactPerson}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Location Information Section */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mb: 2, 
                    mt: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {COMPANY_INFO_FORM_CONFIG.sections.location.title}
                </Typography>

                {/* Address Field */}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <CompanyFormCore
                      name="address"
                      register={register}
                      error={errors.address || validationErrors.address}
                      value={formData.address}
                      onChange={(value) => handleFieldChange('address', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.address}
                    />
                  </Grid>

                  {/* Country and State Selector */}
                  <Grid item xs={12}>
                    <CountryStateSelector
                      countries={countries}
                      states={states}
                      selectedCountry={formData.country}
                      selectedState={formData.state}
                      onCountryChange={handleCountryChange}
                      onStateChange={(value) => handleFieldChange('state', value)}
                      loadingCountries={loadingCountries}
                      loadingStates={loadingStates}
                      disabled={!canEdit || isSubmitting}
                      errors={{
                        country: errors.country || validationErrors.country,
                        state: errors.state || validationErrors.state
                      }}
                      config={COMPANY_INFO_FORM_CONFIG}
                    />
                  </Grid>

                  {/* City and Postal Code */}
                  <Grid item xs={12} sm={6} lg={6}>
                    <CompanyFormCore
                      name="city"
                      register={register}
                      error={errors.city || validationErrors.city}
                      value={formData.city}
                      onChange={(value) => handleFieldChange('city', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.city}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} lg={6}>
                    <CompanyFormCore
                      name="postalCode"
                      register={register}
                      error={errors.postalCode || validationErrors.postalCode}
                      value={formData.postalCode}
                      onChange={(value) => handleFieldChange('postalCode', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.postalCode}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Contact Information Section */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mb: 2, 
                    mt: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {COMPANY_INFO_FORM_CONFIG.sections.contact.title}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <CompanyFormCore
                      name="email"
                      register={register}
                      error={errors.email || validationErrors.email}
                      value={formData.email}
                      onChange={(value) => handleFieldChange('email', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.email}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <CompanyFormCore
                      name="phoneNumber"
                      register={register}
                      error={errors.phoneNumber || validationErrors.phoneNumber}
                      value={formData.phoneNumber}
                      onChange={(value) => handleFieldChange('phoneNumber', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.phoneNumber}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <CompanyFormCore
                      name="mobileNumber"
                      register={register}
                      error={errors.mobileNumber || validationErrors.mobileNumber}
                      value={formData.mobileNumber}
                      onChange={(value) => handleFieldChange('mobileNumber', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.mobileNumber}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <CompanyFormCore
                      name="fax"
                      register={register}
                      error={errors.fax || validationErrors.fax}
                      value={formData.fax}
                      onChange={(value) => handleFieldChange('fax', value)}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.fax}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <CompanyFormCore
                      name="websiteUrl"
                      register={register}
                      error={errors.websiteUrl || validationErrors.websiteUrl}
                      value={formData.websiteUrl}
                      onChange={handleWebsiteChange}
                      disabled={!canEdit || isSubmitting}
                      config={COMPANY_INFO_FORM_CONFIG.fields.websiteUrl}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </CardContent>

        {/* Card Actions */}
        {canEdit && (
          <CardActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || isSubmitting}
              style={{
                ...COMPANY_INFO_FORM_CONFIG.ui.buttons.reset,
                padding: '8px 24px',
                border: 'none',
                borderRadius: COMPANY_INFO_FORM_CONFIG.ui.buttons.save.borderRadius,
                background: 'transparent',
                color: theme.palette.text.secondary,
                cursor: (!hasChanges || isSubmitting) ? 'not-allowed' : 'pointer'
              }}
            >
              {COMPANY_INFO_FORM_CONFIG.ui.buttons.reset.text}
            </button>

            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={!hasChanges || isSubmitting || !canEdit}
              style={{
                ...COMPANY_INFO_FORM_CONFIG.ui.buttons.save,
                padding: '8px 24px',
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: COMPANY_INFO_FORM_CONFIG.ui.buttons.save.borderRadius,
                background: 'transparent',
                color: theme.palette.primary.main,
                cursor: (!hasChanges || isSubmitting || !canEdit) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting 
                ? COMPANY_INFO_FORM_CONFIG.ui.buttons.save.loadingText 
                : COMPANY_INFO_FORM_CONFIG.ui.buttons.save.text
              }
            </button>
          </CardActions>
        )}

        {/* Read-only indicator */}
        {readOnly && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Read-only mode - Changes cannot be saved
            </Typography>
          </Box>
        )}
      </Card>
    </Fade>
  );
};

// Default props
CompanyInformationForm.defaultProps = {
  settings: {},
  loading: false,
  permissions: {},
  readOnly: false
};

export default CompanyInformationForm;
