import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  companyInfoValidationSchema, 
  validateCompanyField, 
  validateBusinessRules,
  validateCompanyNameUniqueness,
  transformCompanyFormData 
} from '../validation';

/**
 * useCompanyForm Hook
 * 
 * Comprehensive form state management for company information with:
 * - Form data state management
 * - Real-time validation
 * - Submission handling
 * - Auto-save functionality (optional)
 * - Loading states
 * - Error handling
 * - Business rules validation
 * 
 * @param {Object} options Hook configuration
 * @param {Object} options.settings - Initial company settings
 * @param {Object} options.config - Form configuration
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.enableAutoSave - Enable auto-save functionality
 * @param {number} options.autoSaveDelay - Auto-save delay in milliseconds
 */
export const useCompanyForm = ({
  settings = {},
  config = {},
  onSuccess,
  onError,
  enableAutoSave = false,
  autoSaveDelay = 2000
}) => {
  // Form state
  const [formData, setFormData] = useState({
    companyName: settings.company_name || '',
    contactPerson: settings.contact_person || '',
    address: settings.address || '',
    country: settings.country || '',
    state: settings.state || '',
    city: settings.city || '',
    postalCode: settings.postal_code || '',
    email: settings.email || '',
    phone: settings.phone || '',
    fax: settings.fax || '',
    website: settings.website || ''
  });

  // Form meta state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Refs for managing timers and cleanup
  const autoSaveTimerRef = useRef(null);
  const validationTimeoutRef = useRef({});
  const initialDataRef = useRef(formData);

  // Track if form data has changed from initial state
  useEffect(() => {
    const hasDataChanged = JSON.stringify(formData) !== JSON.stringify(initialDataRef.current);
    setHasChanges(hasDataChanged);
  }, [formData]);

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave || !hasChanges || isSubmitting) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new auto-save timer
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, hasChanges, enableAutoSave, autoSaveDelay, isSubmitting]);

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Validate before auto-saving
      const isValid = await validateForm();
      if (!isValid) return;

      // Transform and save data
      const transformedData = transformCompanyFormData(formData);
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/company/auto-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify(transformedData)
      });

      if (response.ok) {
        setLastSaved(new Date());
        console.log('Company data auto-saved successfully');
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  // Handle field changes
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear existing error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Debounced validation
    if (validationTimeoutRef.current[fieldName]) {
      clearTimeout(validationTimeoutRef.current[fieldName]);
    }

    validationTimeoutRef.current[fieldName] = setTimeout(async () => {
      await validateSingleField(fieldName, value);
    }, config.validation?.debounceDelay || 300);
  }, [errors, config.validation?.debounceDelay]);

  // Validate single field
  const validateSingleField = useCallback(async (fieldName, value) => {
    try {
      // Basic validation
      const basicValidation = await validateCompanyField(fieldName, value, formData);
      
      if (!basicValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: { message: basicValidation.error }
        }));
        return false;
      }

      // Special validation for company name uniqueness
      if (fieldName === 'companyName' && value && value.length >= 2) {
        const uniquenessValidation = await validateCompanyNameUniqueness(value, settings.id);
        
        if (!uniquenessValidation.isValid) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: { message: uniquenessValidation.error }
          }));
          return false;
        }
      }

      // Clear error if validation passed
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      return true;
    } catch (error) {
      console.error(`Validation error for ${fieldName}:`, error);
      return false;
    }
  }, [formData, settings.id]);

  // Validate entire form
  const validateForm = useCallback(async () => {
    try {
      setIsLoading(true);

      // Schema validation
      await companyInfoValidationSchema.validate(formData, { abortEarly: false });

      // Business rules validation
      const businessValidation = await validateBusinessRules(formData);
      
      if (Object.keys(businessValidation.errors).length > 0) {
        setErrors(businessValidation.errors);
        return false;
      }

      // Clear all errors if validation passed
      setErrors({});
      return true;
    } catch (error) {
      if (error.inner) {
        // Yup validation errors
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = { message: err.message };
        });
        setErrors(validationErrors);
      } else {
        console.error('Form validation error:', error);
        setErrors({ general: { message: 'Validation failed' } });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Validate form
      const isValid = await validateForm();
      if (!isValid) {
        throw new Error('Form validation failed');
      }

      // Transform data for submission
      const transformedData = transformCompanyFormData(formData);

      // Submit to API
      const response = await fetch('/api/company/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update company information');
      }

      const result = await response.json();

      // Update initial data reference
      initialDataRef.current = formData;
      setHasChanges(false);
      setLastSaved(new Date());

      // Call success callback
      onSuccess?.(result);

      return result;
    } catch (error) {
      console.error('Company form submission error:', error);
      
      // Handle specific error types
      if (error.response?.status === 422) {
        // Validation errors from server
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
      } else {
        setErrors({
          general: { message: error.message || 'Failed to update company information' }
        });
      }

      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess, onError]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialDataRef.current);
    setErrors({});
    setHasChanges(false);
    
    // Clear validation timers
    Object.values(validationTimeoutRef.current).forEach(clearTimeout);
    validationTimeoutRef.current = {};
  }, []);

  // Update initial data (useful when settings prop changes)
  const updateInitialData = useCallback((newSettings) => {
    const newFormData = {
      companyName: newSettings.company_name || '',
      contactPerson: newSettings.contact_person || '',
      address: newSettings.address || '',
      country: newSettings.country || '',
      state: newSettings.state || '',
      city: newSettings.city || '',
      postalCode: newSettings.postal_code || '',
      email: newSettings.email || '',
      phone: newSettings.phone || '',
      fax: newSettings.fax || '',
      website: newSettings.website || ''
    };

    setFormData(newFormData);
    initialDataRef.current = newFormData;
    setHasChanges(false);
    setErrors({});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      Object.values(validationTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  return {
    // Form data
    formData,
    
    // Form state
    isLoading,
    isSubmitting,
    errors,
    hasChanges,
    lastSaved,
    
    // Form actions
    handleSubmit,
    handleFieldChange,
    resetForm,
    validateForm,
    updateInitialData,
    
    // Auto-save
    autoSave: handleAutoSave
  };
};

export default useCompanyForm;
