/**
 * Delete Leave Form Hook
 * Core state management hook for leave deletion functionality
 * 
 * Features:
 * - Leave deletion state management
 * - Security confirmation handling
 * - Permission validation
 * - Audit trail management
 * - Real-time validation integration
 * - Performance optimization
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { DELETE_LEAVE_FORM_CONFIG } from '../config';
import { validateDeleteLeaveForm } from '../validation';

/**
 * Main hook for delete leave form management
 * @param {Object} options - Hook configuration options
 * @param {Object} options.leaveData - Leave data to delete
 * @param {Object} options.userPermissions - User permissions
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onCancel - Cancel callback
 * @returns {Object} - Hook interface
 */
export const useDeleteLeaveForm = (options = {}) => {
  const {
    leaveData = null,
    userPermissions = null,
    onSuccess = () => {},
    onError = () => {},
    onCancel = () => {},
    config = DELETE_LEAVE_FORM_CONFIG
  } = options;

  // Form state
  const [formState, setFormState] = useState({
    // Form data
    confirmation: '',
    reason: '',
    userAcknowledgment: false,
    deleteType: config.deletion.defaultType,
    cascadeDelete: false,
    notifyUser: true,
    
    // UI state
    isVisible: false,
    isSubmitting: false,
    isValidating: false,
    showReasonField: false,
    
    // Validation state
    errors: {},
    warnings: [],
    isValid: false,
    
    // Security state
    confirmationStep: 1,
    maxConfirmationSteps: 3,
    securityPassed: false,
    
    // Permission state
    hasPermission: false,
    permissionChecked: false
  });

  // Refs for performance optimization
  const validationTimeoutRef = useRef(null);
  const submitAttemptRef = useRef(0);
  const formStartTimeRef = useRef(null);

  /**
   * Initialize form when leave data or permissions change
   */
  useEffect(() => {
    if (leaveData && userPermissions) {
      checkPermissions();
    }
  }, [leaveData, userPermissions]);

  /**
   * Check user permissions for leave deletion
   */
  const checkPermissions = useCallback(async () => {
    setFormState(prev => ({ 
      ...prev, 
      permissionChecked: false,
      hasPermission: false 
    }));

    try {
      // Validate permissions using validation engine
      const validationResult = await validateDeleteLeaveForm({
        userPermissions,
        leaveData,
        // Basic form data for permission check
        confirmation: '',
        reason: '',
        userAcknowledgment: false
      });

      const hasPermission = !validationResult.errors.some(
        error => error.field === 'userPermissions'
      );

      setFormState(prev => ({
        ...prev,
        hasPermission,
        permissionChecked: true,
        showReasonField: config.deletion.requireReason || 
                        (leaveData?.status === 'approved'),
        errors: hasPermission ? {} : { 
          permission: 'You do not have permission to delete this leave' 
        }
      }));

    } catch (error) {
      console.error('Permission check failed:', error);
      setFormState(prev => ({
        ...prev,
        hasPermission: false,
        permissionChecked: true,
        errors: { permission: 'Failed to verify permissions' }
      }));
    }
  }, [userPermissions, leaveData, config]);

  /**
   * Show the deletion dialog
   */
  const showDialog = useCallback(() => {
    if (!formState.hasPermission) {
      onError(new Error('Insufficient permissions'));
      return;
    }

    setFormState(prev => ({
      ...prev,
      isVisible: true,
      confirmationStep: 1,
      securityPassed: false
    }));

    formStartTimeRef.current = Date.now();
  }, [formState.hasPermission, onError]);

  /**
   * Hide the deletion dialog
   */
  const hideDialog = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      isVisible: false,
      // Reset form state
      confirmation: '',
      reason: '',
      userAcknowledgment: false,
      confirmationStep: 1,
      securityPassed: false,
      errors: {},
      warnings: [],
      isValid: false
    }));

    // Clear validation timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    onCancel();
  }, [onCancel]);

  /**
   * Update form field value
   */
  const updateField = useCallback((field, value) => {
    setFormState(prev => {
      const newState = {
        ...prev,
        [field]: value,
        // Clear field-specific errors
        errors: {
          ...prev.errors,
          [field]: undefined
        }
      };

      // Special handling for confirmation field
      if (field === 'confirmation') {
        newState.securityPassed = value === config.security.confirmationText;
        if (newState.securityPassed && prev.confirmationStep === 1) {
          newState.confirmationStep = 2;
        }
      }

      // Special handling for user acknowledgment
      if (field === 'userAcknowledgment' && value) {
        newState.confirmationStep = Math.max(prev.confirmationStep, 3);
      }

      return newState;
    });

    // Debounced validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      validateForm();
    }, config.validation.debounceDelay || 300);

  }, [config]);

  /**
   * Validate the complete form
   */
  const validateForm = useCallback(async () => {
    setFormState(prev => ({ ...prev, isValidating: true }));

    try {
      const formData = {
        confirmation: formState.confirmation,
        reason: formState.reason,
        userAcknowledgment: formState.userAcknowledgment,
        deleteType: formState.deleteType,
        cascadeDelete: formState.cascadeDelete,
        notifyUser: formState.notifyUser,
        leaveId: leaveData?.id,
        userPermissions,
        leaveData,
        reasonRequired: formState.showReasonField,
        auditTrail: {
          reason: formState.reason || 'User-initiated deletion',
          performedBy: userPermissions?.user_id,
          timestamp: new Date()
        }
      };

      const validationResult = await validateDeleteLeaveForm(formData);

      setFormState(prev => ({
        ...prev,
        isValidating: false,
        isValid: validationResult.isValid,
        errors: validationResult.errors.reduce((acc, error) => ({
          ...acc,
          [error.field]: error.message
        }), {}),
        warnings: validationResult.warnings
      }));

      return validationResult;

    } catch (error) {
      console.error('Form validation failed:', error);
      setFormState(prev => ({
        ...prev,
        isValidating: false,
        isValid: false,
        errors: { general: 'Validation failed' }
      }));
      return { isValid: false, errors: [{ field: 'general', message: 'Validation failed' }] };
    }
  }, [formState, leaveData, userPermissions]);

  /**
   * Submit the deletion request
   */
  const submitDeletion = useCallback(async () => {
    submitAttemptRef.current += 1;

    // Final validation
    const validationResult = await validateForm();
    if (!validationResult.isValid) {
      onError(new Error('Form validation failed'));
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Prepare deletion data
      const deletionData = {
        leaveId: leaveData.id,
        deleteType: formState.deleteType,
        reason: formState.reason,
        cascadeDelete: formState.cascadeDelete,
        notifyUser: formState.notifyUser,
        auditTrail: {
          reason: formState.reason || 'User-initiated deletion',
          performedBy: userPermissions.user_id,
          timestamp: new Date(),
          confirmationProvided: formState.confirmation,
          userAcknowledged: formState.userAcknowledgment,
          formSubmissionTime: Date.now() - (formStartTimeRef.current || Date.now()),
          submitAttempt: submitAttemptRef.current
        }
      };

      // Call success callback with deletion data
      await onSuccess(deletionData);

      // Reset form state
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isVisible: false,
        confirmation: '',
        reason: '',
        userAcknowledgment: false,
        confirmationStep: 1,
        securityPassed: false,
        errors: {},
        warnings: [],
        isValid: false
      }));

    } catch (error) {
      console.error('Deletion submission failed:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { 
          submission: error.message || 'Failed to delete leave' 
        }
      }));
      onError(error);
    }
  }, [formState, leaveData, userPermissions, onSuccess, onError, validateForm]);

  /**
   * Get form progress percentage
   */
  const getFormProgress = useCallback(() => {
    const steps = [
      formState.securityPassed,                    // Step 1: Confirmation text
      formState.userAcknowledgment,               // Step 2: User acknowledgment
      !formState.showReasonField || formState.reason.length >= 10  // Step 3: Reason (if required)
    ];

    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / steps.length) * 100);
  }, [formState]);

  /**
   * Check if form can be submitted
   */
  const canSubmit = useCallback(() => {
    return formState.isValid &&
           formState.securityPassed &&
           formState.userAcknowledgment &&
           (!formState.showReasonField || formState.reason.length >= 10) &&
           !formState.isSubmitting &&
           !formState.isValidating;
  }, [formState]);

  /**
   * Get current step information
   */
  const getCurrentStep = useCallback(() => {
    if (!formState.securityPassed) {
      return {
        step: 1,
        title: 'Confirm Deletion',
        description: `Type "${config.security.confirmationText}" to confirm`,
        isComplete: false
      };
    }

    if (!formState.userAcknowledgment) {
      return {
        step: 2,
        title: 'Acknowledge Consequences',
        description: 'Confirm you understand the consequences',
        isComplete: false
      };
    }

    if (formState.showReasonField && formState.reason.length < 10) {
      return {
        step: 3,
        title: 'Provide Reason',
        description: 'Explain why you are deleting this leave',
        isComplete: false
      };
    }

    return {
      step: 4,
      title: 'Ready to Delete',
      description: 'All requirements met',
      isComplete: true
    };
  }, [formState, config]);

  // Return hook interface
  return {
    // State
    formState,
    leaveData,
    userPermissions,
    
    // Computed properties
    canSubmit: canSubmit(),
    formProgress: getFormProgress(),
    currentStep: getCurrentStep(),
    
    // Actions
    showDialog,
    hideDialog,
    updateField,
    validateForm,
    submitDeletion,
    checkPermissions,
    
    // Utility methods
    getFormProgress,
    getCurrentStep,
    canSubmit: canSubmit
  };
};

export default useDeleteLeaveForm;
