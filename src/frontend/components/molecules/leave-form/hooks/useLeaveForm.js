/**
 * Leave Form Management Hook
 * 
 * Advanced form state management for leave applications
 * 
 * @fileoverview Main form hook for leave application with validation and submission
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - React Hook Form integration
 * - Leave balance validation
 * - Date range calculations
 * - Form submission handling
 * - Error management
 * - Real-time validation
 * - Role-based logic
 * 
 * @author glassERP Development Team
 * @module hooks/useLeaveForm
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { router } from '@inertiajs/react';
import axios from 'axios';

/**
 * Create validation schema for leave form
 */
const createLeaveValidationSchema = (isAdmin = false) => {
  const baseSchema = {
    leave_type: yup.string()
      .required('Leave type is required'),
    
    from_date: yup.date()
      .required('From date is required')
      .min(new Date(), 'From date cannot be in the past'),
    
    to_date: yup.date()
      .required('To date is required')
      .min(yup.ref('from_date'), 'To date must be after or equal to from date'),
    
    days_count: yup.number()
      .required('Days count is required')
      .min(1, 'Must be at least 1 day')
      .max(365, 'Cannot exceed 365 days'),
    
    remaining_leaves: yup.number()
      .min(0, 'Remaining leaves cannot be negative'),
    
    reason: yup.string()
      .required('Leave reason is required')
      .min(10, 'Reason must be at least 10 characters')
      .max(500, 'Reason must not exceed 500 characters')
  };

  // Add user_id validation for admins
  if (isAdmin) {
    baseSchema.user_id = yup.string()
      .required('Employee selection is required')
      .notOneOf(['na', ''], 'Please select an employee');
  }

  return yup.object(baseSchema);
};

/**
 * Leave Form Management Hook
 * 
 * @param {Object} initialData - Initial form data
 * @param {Object} config - Form configuration
 * @param {Object} options - Hook options
 * @returns {Object} Form state and methods
 */
export const useLeaveForm = (initialData = {}, config = {}, options = {}) => {
  const {
    onSubmit,
    onFieldChange = () => {},
    isAdmin = false,
    validateOnChange = true,
    validateOnBlur = true
  } = options;

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [lastSubmissionData, setLastSubmissionData] = useState(null);

  // Create validation schema
  const validationSchema = useMemo(() => 
    createLeaveValidationSchema(isAdmin), 
    [isAdmin]
  );

  // Initialize form with react-hook-form
  const form = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      user_id: initialData.user_id || '',
      leave_type: initialData.leave_type || '',
      from_date: initialData.from_date || '',
      to_date: initialData.to_date || '',
      days_count: initialData.days_count || 0,
      remaining_leaves: initialData.remaining_leaves || 0,
      reason: initialData.reason || '',
      ...initialData
    },
    mode: validateOnChange ? 'onChange' : 'onSubmit',
    reValidateMode: validateOnBlur ? 'onBlur' : 'onChange'
  });

  const {
    control,
    handleSubmit: hookFormHandleSubmit,
    formState,
    watch,
    setValue,
    getValues,
    reset,
    clearErrors,
    setError,
    trigger
  } = form;

  const { errors, isValid, isDirty, isValidating } = formState;

  // Watch all form values
  const formData = watch();

  // Format date for submission
  const formatDateForSubmission = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }, []);

  // Handle field changes
  const handleFieldChange = useCallback((fieldName, value) => {
    setValue(fieldName, value, { 
      shouldValidate: validateOnChange,
      shouldDirty: true,
      shouldTouch: true
    });

    // Trigger validation for dependent fields
    if (fieldName === 'from_date' || fieldName === 'to_date') {
      setTimeout(() => {
        trigger(['from_date', 'to_date', 'days_count']);
      }, 100);
    }

    if (fieldName === 'leave_type' || fieldName === 'user_id') {
      setTimeout(() => {
        trigger(['remaining_leaves']);
      }, 100);
    }

    // Call external field change handler
    onFieldChange(fieldName, value);
  }, [setValue, validateOnChange, trigger, onFieldChange]);

  // Calculate days between dates
  const calculateDays = useCallback((fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    if (start > end) return 0;
    
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    return daysDiff;
  }, []);

  // Auto-calculate days when dates change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'from_date' || name === 'to_date') {
        const days = calculateDays(value.from_date, value.to_date);
        if (days !== value.days_count) {
          setValue('days_count', days, { shouldValidate: false });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, calculateDays]);

  // Validate leave balance
  const validateLeaveBalance = useCallback((leaveType, daysRequested, remainingBalance) => {
    if (!leaveType || !daysRequested || remainingBalance === undefined) {
      return { isValid: true };
    }

    if (daysRequested > remainingBalance) {
      return {
        isValid: false,
        message: `Insufficient leave balance. You have ${remainingBalance} days remaining but requested ${daysRequested} days.`,
        type: 'balance_exceeded'
      };
    }

    if (remainingBalance - daysRequested <= 2) {
      return {
        isValid: true,
        warning: `This request will leave you with only ${remainingBalance - daysRequested} days remaining.`,
        type: 'low_balance'
      };
    }

    return { isValid: true };
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Format dates for submission
      const submissionData = {
        ...data,
        from_date: formatDateForSubmission(data.from_date),
        to_date: formatDateForSubmission(data.to_date),
        route: window.route?.current?.() || 'leaves'
      };

      // Add ID for updates
      if (initialData.id) {
        submissionData.id = initialData.id;
      }

      // Validate leave balance one more time
      const balanceValidation = validateLeaveBalance(
        data.leave_type,
        data.days_count,
        data.remaining_leaves
      );

      if (!balanceValidation.isValid) {
        throw new Error(balanceValidation.message);
      }

      // Store submission data for potential retry
      setLastSubmissionData(submissionData);

      // Call external submit handler
      if (onSubmit) {
        await onSubmit(submissionData);
      } else {
        // Default submission logic
        const apiRoute = initialData.id 
          ? window.route('leave-update') 
          : window.route('leave-add');

        const response = await axios.post(apiRoute, submissionData);

        if (response.status === 200) {
          // Reset form on successful submission
          if (!initialData.id) {
            reset();
          }
          return response.data;
        }
      }

    } catch (error) {
      console.error('Leave form submission error:', error);
      
      if (error.response?.status === 422) {
        // Handle validation errors from server
        const serverErrors = error.response.data.errors || {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          setError(field, {
            type: 'server',
            message: Array.isArray(messages) ? messages[0] : messages
          });
        });
        setSubmitError('Please correct the validation errors and try again.');
      } else {
        setSubmitError(error.message || 'Failed to submit leave application. Please try again.');
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formatDateForSubmission,
    initialData,
    validateLeaveBalance,
    onSubmit,
    reset,
    setError
  ]);

  // Retry last submission
  const retrySubmission = useCallback(async () => {
    if (lastSubmissionData) {
      return handleSubmit(lastSubmissionData);
    }
  }, [lastSubmissionData, handleSubmit]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    reset();
    setSubmitError(null);
    setLastSubmissionData(null);
  }, [reset]);

  // Check if form is ready for submission
  const canSubmit = useMemo(() => {
    return isValid && isDirty && !isSubmitting && !isValidating;
  }, [isValid, isDirty, isSubmitting, isValidating]);

  // Get form validation state
  const getValidationState = useCallback(() => {
    const errorCount = Object.keys(errors).length;
    const hasRequiredFields = formData.leave_type && formData.from_date && formData.to_date && formData.reason;

    return {
      isValid,
      isDirty,
      canSubmit,
      hasErrors: errorCount > 0,
      errorCount,
      hasRequiredFields,
      isSubmitting,
      isValidating
    };
  }, [errors, formData, isValid, isDirty, canSubmit, isSubmitting, isValidating]);

  return {
    // Form control
    control,
    formState,
    
    // Form data
    formData,
    errors,
    
    // Form state
    isValid,
    isDirty,
    canSubmit,
    isSubmitting,
    isValidating,
    submitError,
    
    // Form methods
    handleFieldChange,
    handleSubmit: hookFormHandleSubmit(handleSubmit),
    reset: resetForm,
    resetForm,
    retrySubmission,
    
    // Utility methods
    watch,
    setValue,
    getValues,
    clearErrors,
    setError,
    trigger,
    
    // Validation
    validateLeaveBalance,
    getValidationState,
    
    // Calculations
    calculateDays
  };
};

export default useLeaveForm;
