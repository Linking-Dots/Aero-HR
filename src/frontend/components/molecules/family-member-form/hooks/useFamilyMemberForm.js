/**
 * Family Member Form Management Hook
 * 
 * @fileoverview Main hook for managing family member form state, validation, and operations.
 * Provides comprehensive form management with auto-save, analytics integration, and advanced validation.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useFamilyMemberForm
 * @namespace Components.Molecules.FamilyMemberForm.Hooks
 * 
 * @requires React ^18.0.0
 * @requires date-fns ^2.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Advanced form management hook with:
 * - Real-time validation and error handling
 * - Auto-save functionality with localStorage backup
 * - Family member relationship management
 * - Age calculation and validation
 * - Phone number formatting and validation
 * - Analytics integration for user behavior tracking
 * - Accessibility features and keyboard shortcuts
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Usability, Reliability, Performance
 * - ISO 27001 (Information Security): Data protection, Input validation
 * - WCAG 2.1 AA (Web Accessibility): Keyboard navigation, Screen reader support
 * 
 * @security
 * - Input sanitization and validation
 * - XSS prevention through data validation
 * - Secure data storage and transmission
 * - Privacy-compliant data handling
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  FAMILY_MEMBER_FORM_CONFIG, 
  BUSINESS_RULES, 
  DEFAULT_VALUES,
  getAllRelationships 
} from '../config.js';
import { 
  validateForm, 
  validateField, 
  formatPhoneNumber, 
  calculateAge,
  createFamilyMemberValidationSchema 
} from '../validation.js';
import { useFamilyMemberAnalytics } from './useFamilyMemberAnalytics.js';
import { useFamilyMemberValidation } from './useFamilyMemberValidation.js';

/**
 * Family Member Form Management Hook
 * 
 * @param {Object} options - Hook configuration options
 * @param {Object} options.initialData - Initial form data
 * @param {boolean} options.isEdit - Whether this is an edit operation
 * @param {Array} options.existingMembers - Existing family members for validation
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onClose - Close callback
 * @param {boolean} options.autoSave - Enable auto-save functionality
 * @param {number} options.autoSaveInterval - Auto-save interval in milliseconds
 * @param {boolean} options.enableAnalytics - Enable analytics tracking
 * 
 * @returns {Object} Form management interface
 */
export const useFamilyMemberForm = (options = {}) => {
  const {
    initialData = DEFAULT_VALUES,
    isEdit = false,
    existingMembers = [],
    onSubmit,
    onSuccess,
    onError,
    onClose,
    autoSave = BUSINESS_RULES.behavior.autoSaveEnabled,
    autoSaveInterval = BUSINESS_RULES.behavior.autoSaveInterval,
    enableAnalytics = true
  } = options;

  // Form state management
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_VALUES,
    ...initialData
  }));

  const [originalData] = useState(() => ({
    ...DEFAULT_VALUES,
    ...initialData
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  const formRef = useRef(null);

  // Initialize analytics and validation hooks
  const analytics = useFamilyMemberAnalytics({
    enabled: enableAnalytics,
    formId: `family-member-form-${isEdit ? 'edit' : 'add'}`,
    userId: initialData?.id || 'new'
  });

  const validation = useFamilyMemberValidation({
    existingMembers,
    currentMemberId: isEdit ? initialData?.id : null,
    enableRealTime: true
  });

  // Validation context
  const validationContext = useMemo(() => ({
    existingMembers,
    currentMemberId: isEdit ? initialData?.id : null,
    isEdit
  }), [existingMembers, isEdit, initialData?.id]);

  // Calculate derived data
  const derivedData = useMemo(() => {
    const age = formData.family_member_dob ? calculateAge(formData.family_member_dob) : null;
    const formattedPhone = formData.family_member_phone ? formatPhoneNumber(formData.family_member_phone) : '';
    const relationship = getAllRelationships().find(r => r.value === formData.family_member_relationship);
    
    return {
      age,
      formattedPhone,
      relationship,
      completionPercentage: calculateCompletionPercentage(formData),
      hasRequiredFields: hasAllRequiredFields(formData),
      changedFields: getChangedFields(formData, originalData)
    };
  }, [formData, originalData]);

  /**
   * Calculate form completion percentage
   */
  const calculateCompletionPercentage = useCallback((data) => {
    const requiredFields = ['family_member_name', 'family_member_relationship', 'family_member_dob'];
    const optionalFields = ['family_member_phone'];
    
    const requiredCount = requiredFields.filter(field => data[field]?.trim()).length;
    const optionalCount = optionalFields.filter(field => data[field]?.trim()).length;
    
    const requiredWeight = 0.8;
    const optionalWeight = 0.2;
    
    const requiredPercentage = (requiredCount / requiredFields.length) * requiredWeight;
    const optionalPercentage = (optionalCount / optionalFields.length) * optionalWeight;
    
    return Math.round((requiredPercentage + optionalPercentage) * 100);
  }, []);

  /**
   * Check if all required fields are filled
   */
  const hasAllRequiredFields = useCallback((data) => {
    const requiredFields = ['family_member_name', 'family_member_relationship', 'family_member_dob'];
    return requiredFields.every(field => data[field]?.trim());
  }, []);

  /**
   * Get changed fields compared to original data
   */
  const getChangedFields = useCallback((current, original) => {
    const changed = {};
    Object.keys(current).forEach(key => {
      if (current[key] !== original[key]) {
        changed[key] = {
          from: original[key],
          to: current[key]
        };
      }
    });
    return changed;
  }, []);

  /**
   * Handle field change
   */
  const handleFieldChange = useCallback(async (fieldName, value) => {
    // Track field change for analytics
    analytics.trackFieldChange(fieldName, value, formData[fieldName]);

    // Update form data
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Real-time validation if enabled
    if (BUSINESS_RULES.behavior.validateOnChange || touched[fieldName]) {
      const fieldValidation = await validation.validateField(fieldName, value, {
        ...formData,
        [fieldName]: value
      });

      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldValidation.error
      }));
    }

    // Schedule auto-save
    if (autoSave) {
      scheduleAutoSave();
    }
  }, [formData, touched, analytics, validation, autoSave]);

  /**
   * Handle field blur
   */
  const handleFieldBlur = useCallback(async (fieldName) => {
    analytics.trackFieldBlur(fieldName, formData[fieldName]);

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate on blur if enabled
    if (BUSINESS_RULES.behavior.validateOnBlur) {
      const fieldValidation = await validation.validateField(fieldName, formData[fieldName], formData);
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldValidation.error
      }));
    }
  }, [formData, analytics, validation]);

  /**
   * Handle field focus
   */
  const handleFieldFocus = useCallback((fieldName) => {
    analytics.trackFieldFocus(fieldName);
  }, [analytics]);

  /**
   * Schedule auto-save
   */
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, autoSaveInterval);
  }, [autoSaveInterval]);

  /**
   * Perform auto-save
   */
  const performAutoSave = useCallback(async () => {
    if (!isDirty || isSubmitting) return;

    setAutoSaveStatus('saving');
    
    try {
      // Save to localStorage as backup
      const autoSaveKey = `family-member-form-autosave-${isEdit ? initialData?.id : 'new'}`;
      localStorage.setItem(autoSaveKey, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString(),
        isEdit
      }));

      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      
      analytics.trackAutoSave(formData);
      
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Auto-save failed:', error);
    }
  }, [formData, isDirty, isSubmitting, isEdit, initialData?.id, analytics]);

  /**
   * Load auto-saved data
   */
  const loadAutoSave = useCallback(() => {
    try {
      const autoSaveKey = `family-member-form-autosave-${isEdit ? initialData?.id : 'new'}`;
      const saved = localStorage.getItem(autoSaveKey);
      
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        const saveDate = new Date(timestamp);
        const hoursSinceAutoSave = (new Date() - saveDate) / (1000 * 60 * 60);
        
        // Only load if saved within last 24 hours
        if (hoursSinceAutoSave < 24) {
          return { data, timestamp: saveDate };
        } else {
          // Clean up old auto-save
          localStorage.removeItem(autoSaveKey);
        }
      }
    } catch (error) {
      console.error('Failed to load auto-save:', error);
    }
    
    return null;
  }, [isEdit, initialData?.id]);

  /**
   * Clear auto-saved data
   */
  const clearAutoSave = useCallback(() => {
    try {
      const autoSaveKey = `family-member-form-autosave-${isEdit ? initialData?.id : 'new'}`;
      localStorage.removeItem(autoSaveKey);
    } catch (error) {
      console.error('Failed to clear auto-save:', error);
    }
  }, [isEdit, initialData?.id]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async () => {
    setIsValidating(true);
    
    try {
      const result = await validation.validateForm(formData);
      setErrors(result.errors);
      setIsValid(result.isValid);
      
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [formData, validation]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSubmitAttempted(true);
    setIsSubmitting(true);
    
    analytics.trackFormSubmit(formData);

    try {
      // Validate form
      const validation = await validateForm();
      
      if (!validation.isValid) {
        analytics.trackValidationError(validation.errors);
        throw new Error('Form validation failed');
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        id: isEdit ? initialData?.id : undefined
      };

      // Call submission handler
      if (onSubmit) {
        await onSubmit(submissionData);
      }

      // Clear auto-save after successful submission
      clearAutoSave();
      
      analytics.trackFormSuccess(submissionData);
      
      if (onSuccess) {
        onSuccess(submissionData);
      }

    } catch (error) {
      analytics.trackFormError(error.message);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEdit, initialData?.id, validateForm, onSubmit, onSuccess, onError, analytics, clearAutoSave]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({ ...DEFAULT_VALUES, ...initialData });
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsValid(false);
    setSubmitAttempted(false);
    clearAutoSave();
    
    analytics.trackFormReset();
  }, [initialData, clearAutoSave, analytics]);

  /**
   * Clear form data
   */
  const clearForm = useCallback(() => {
    setFormData(DEFAULT_VALUES);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsValid(false);
    setSubmitAttempted(false);
    
    analytics.trackFormClear();
  }, [analytics]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyboardShortcut = useCallback((event) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          handleSubmit();
          break;
        case 'l':
          event.preventDefault();
          clearForm();
          break;
        default:
          break;
      }
    } else if (event.key === 'Escape') {
      if (onClose) {
        onClose();
      }
    }
  }, [handleSubmit, clearForm, onClose]);

  // Effect: Check if form is dirty
  useEffect(() => {
    const hasChanges = Object.keys(formData).some(key => 
      formData[key] !== originalData[key]
    );
    setIsDirty(hasChanges);
  }, [formData, originalData]);

  // Effect: Load auto-save on mount
  useEffect(() => {
    const autoSaveData = loadAutoSave();
    if (autoSaveData && !isEdit) { // Only load auto-save for new forms
      setFormData(autoSaveData.data);
      setLastSaved(autoSaveData.timestamp);
      setAutoSaveStatus('saved');
    }
  }, [loadAutoSave, isEdit]);

  // Effect: Keyboard shortcuts
  useEffect(() => {
    if (formRef.current) {
      const element = formRef.current;
      element.addEventListener('keydown', handleKeyboardShortcut);
      
      return () => {
        element.removeEventListener('keydown', handleKeyboardShortcut);
      };
    }
  }, [handleKeyboardShortcut]);

  // Effect: Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Form state summary
  const formState = useMemo(() => ({
    isValid,
    isDirty,
    isSubmitting,
    isValidating,
    submitAttempted,
    completionPercentage: derivedData.completionPercentage,
    hasRequiredFields: derivedData.hasRequiredFields,
    hasErrors: Object.keys(errors).length > 0,
    changedFieldsCount: Object.keys(derivedData.changedFields).length,
    touchedFieldsCount: Object.keys(touched).length
  }), [
    isValid, 
    isDirty, 
    isSubmitting, 
    isValidating, 
    submitAttempted, 
    derivedData.completionPercentage,
    derivedData.hasRequiredFields,
    derivedData.changedFields,
    errors, 
    touched
  ]);

  // Auto-save state
  const autoSaveState = useMemo(() => ({
    status: autoSaveStatus,
    lastSaved,
    enabled: autoSave,
    interval: autoSaveInterval
  }), [autoSaveStatus, lastSaved, autoSave, autoSaveInterval]);

  return {
    // Form data
    formData,
    originalData,
    derivedData,
    
    // Form state
    formState,
    errors,
    touched,
    
    // Auto-save
    autoSave: autoSaveState,
    
    // Event handlers
    handleFieldChange,
    handleFieldBlur,
    handleFieldFocus,
    handleSubmit,
    
    // Form actions
    resetForm,
    clearForm,
    validateForm,
    loadAutoSave,
    clearAutoSave,
    
    // Analytics
    analytics: analytics.getAnalytics(),
    
    // Utilities
    formRef,
    config: FAMILY_MEMBER_FORM_CONFIG,
    validationContext
  };
};

export default useFamilyMemberForm;
