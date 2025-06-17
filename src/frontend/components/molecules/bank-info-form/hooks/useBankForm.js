import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  bankInfoValidationSchema, 
  validateBankField, 
  validateBankingBusinessRules,
  validateAccountUniqueness,
  transformBankFormData 
} from '../validation';

/**
 * useBankForm Hook
 * 
 * Comprehensive bank form state management with:
 * - Form data state management
 * - Real-time validation
 * - Submission handling
 * - Change tracking
 * - Loading states
 * - Error handling
 * - Banking business rules validation
 * 
 * @param {Object} options Hook configuration
 * @param {Object} options.user - User data
 * @param {Object} options.config - Form configuration
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
export const useBankForm = ({
  user = {},
  config = {},
  onSuccess,
  onError
}) => {
  // Form state
  const [formData, setFormData] = useState({
    bank_name: user.bank_name || '',
    bank_account_no: user.bank_account_no || '',
    ifsc_code: user.ifsc_code || '',
    pan_no: user.pan_no || ''
  });

  // Initial data reference for change tracking
  const [initialData, setInitialData] = useState(formData);

  // Form meta state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Refs for managing timers and cleanup
  const validationTimeoutRef = useRef({});

  // Track if form data has changed from initial state
  useEffect(() => {
    const hasDataChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(hasDataChanged);
  }, [formData, initialData]);

  // Update form data when user prop changes
  useEffect(() => {
    const newData = {
      bank_name: user.bank_name || '',
      bank_account_no: user.bank_account_no || '',
      ifsc_code: user.ifsc_code || '',
      pan_no: user.pan_no || ''
    };
    
    setFormData(newData);
    setInitialData(newData);
    setHasChanges(false);
    setErrors({});
  }, [user]);

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
      const basicValidation = await validateBankField(fieldName, value, formData);
      
      if (!basicValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: { message: basicValidation.error }
        }));
        return false;
      }

      // Special validation for account uniqueness
      if (fieldName === 'bank_account_no' && value && formData.ifsc_code) {
        const uniquenessValidation = await validateAccountUniqueness(
          value, 
          formData.ifsc_code, 
          user.id
        );
        
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
  }, [formData, user.id]);

  // Validate entire form
  const validateForm = useCallback(async () => {
    try {
      setIsLoading(true);

      // Schema validation
      await bankInfoValidationSchema.validate(formData, { abortEarly: false });

      // Business rules validation
      const businessValidation = await validateBankingBusinessRules(formData);
      
      if (Object.keys(businessValidation.errors).length > 0) {
        setErrors(businessValidation.errors);
        return false;
      }

      // Account uniqueness check
      if (formData.bank_account_no && formData.ifsc_code) {
        const uniquenessValidation = await validateAccountUniqueness(
          formData.bank_account_no,
          formData.ifsc_code,
          user.id
        );
        
        if (!uniquenessValidation.isValid) {
          setErrors({
            bank_account_no: { message: uniquenessValidation.error }
          });
          return false;
        }
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
  }, [formData, user.id]);

  // Handle form submission
  const handleSubmit = useCallback(async (data) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Use passed data or current form data
      const submitData = data || formData;

      // Validate form
      const isValid = await validateForm();
      if (!isValid) {
        throw new Error('Form validation failed');
      }

      // Transform data for submission
      const transformedData = transformBankFormData(submitData);

      // Submit to API
      const response = await fetch(route('profile.update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify(transformedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 422) {
          // Validation errors from server
          setErrors(errorData.errors || {});
          throw new Error(errorData.error || 'Validation failed');
        }
        
        throw new Error(errorData.error || 'Failed to update bank information');
      }

      const result = await response.json();

      // Update initial data reference
      setInitialData(submitData);
      setHasChanges(false);

      // Call success callback
      onSuccess?.(result);

      return result;
    } catch (error) {
      console.error('Bank form submission error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({
          general: { message: 'Network error. Please check your connection.' }
        });
      }

      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess, onError, validateForm]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setHasChanges(false);
    
    // Clear validation timers
    Object.values(validationTimeoutRef.current).forEach(clearTimeout);
    validationTimeoutRef.current = {};
  }, [initialData]);

  // Update initial data (useful when user prop changes)
  const updateInitialData = useCallback((newUser) => {
    const newFormData = {
      bank_name: newUser.bank_name || '',
      bank_account_no: newUser.bank_account_no || '',
      ifsc_code: newUser.ifsc_code || '',
      pan_no: newUser.pan_no || ''
    };

    setFormData(newFormData);
    setInitialData(newFormData);
    setHasChanges(false);
    setErrors({});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    
    // Form actions
    handleSubmit,
    handleFieldChange,
    resetForm,
    validateForm,
    updateInitialData
  };
};

export default useBankForm;
