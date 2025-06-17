/**
 * Daily Work Form Management Hook
 * 
 * @fileoverview Primary state management hook for daily work form with RFI generation,
 * work type management, time planning, and construction-specific business logic.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useDailyWorkForm
 * @namespace Components.Molecules.DailyWorkForm.Hooks
 * 
 * @requires React ^18.0.0
 * @requires date-fns ^2.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Core daily work form hook providing:
 * - RFI number generation and validation
 * - Work type and road type management
 * - Time planning and estimation
 * - Location and quantity tracking
 * - Auto-save functionality
 * - Form state persistence
 * - Construction workflow support
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Performance, Usability
 * - ISO 27001 (Information Security): Data handling security
 * - ISO 9001 (Quality Management): Process standardization
 * - Construction Standards: Work documentation compliance
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { format, parseISO, isValid } from 'date-fns';

// Import configuration and validation
import { DAILY_WORK_FORM_CONFIG, WORK_TYPE_CONFIG } from '../config';
import { dailyWorkValidationSchema } from '../validation';

/**
 * Daily Work Form Management Hook
 * 
 * @param {Object} options - Hook configuration options
 * @param {Object} options.initialData - Initial form data
 * @param {boolean} options.enableAutoSave - Enable auto-save functionality
 * @param {boolean} options.enableRfiGeneration - Enable automatic RFI number generation
 * @param {number} options.autoSaveInterval - Auto-save interval in milliseconds
 * @param {Function} options.onDataChange - Callback for data changes
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Object} options.config - Custom configuration overrides
 * 
 * @returns {Object} Hook interface with form state and handlers
 */
export const useDailyWorkForm = ({
  initialData = {},
  enableAutoSave = false,
  enableRfiGeneration = true,
  autoSaveInterval = 30000, // 30 seconds
  onDataChange,
  onSubmit,
  config = {}
} = {}) => {
  // Merge configuration
  const formConfig = useMemo(() => ({
    ...DAILY_WORK_FORM_CONFIG,
    ...config
  }), [config]);

  // Form state
  const [formData, setFormData] = useState(() => ({
    date: format(new Date(), 'yyyy-MM-dd'),
    number: '',
    type: 'Structure',
    location: '',
    description: '',
    planned_time: '',
    side: 'SR-R',
    qty_layer: '',
    ...initialData
  }));

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [rfiGenerated, setRfiGenerated] = useState(false);

  // Refs for internal state
  const autoSaveTimer = useRef(null);
  const initialDataRef = useRef(initialData);
  const formStartTime = useRef(Date.now());

  /**
   * Generate RFI number based on current date and sequence
   */
  const generateRfiNumber = useCallback(async () => {
    if (!enableRfiGeneration) return null;

    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      
      // Generate sequence number (in real app, this would come from API)
      const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
      
      const rfiNumber = `RFI-${year}-${sequence}`;
      
      return rfiNumber;
    } catch (error) {
      console.error('Error generating RFI number:', error);
      return null;
    }
  }, [enableRfiGeneration]);

  /**
   * Calculate estimated duration based on work type and quantity
   */
  const calculateEstimatedDuration = useCallback((workType, quantity) => {
    const workConfig = WORK_TYPE_CONFIG[workType];
    if (!workConfig) return null;

    try {
      // Extract numeric value from quantity if present
      const numericMatch = quantity?.match(/(\d+(?:\.\d+)?)/);
      if (!numericMatch) return workConfig.averageDuration;

      const numericValue = parseFloat(numericMatch[1]);
      const baseHours = parseInt(workConfig.averageDuration.match(/(\d+)/)[1]);

      // Simple estimation: scale base duration by quantity
      let estimatedHours = baseHours;
      
      if (numericValue > 100) {
        estimatedHours = Math.ceil(baseHours * (numericValue / 100));
      } else if (numericValue < 10) {
        estimatedHours = Math.max(1, Math.ceil(baseHours * (numericValue / 10)));
      }

      // Cap at reasonable limits
      estimatedHours = Math.min(120, Math.max(1, estimatedHours)); // 1-120 hours

      return estimatedHours === 1 ? '1 hour' : `${estimatedHours} hours`;
    } catch (error) {
      return workConfig.averageDuration;
    }
  }, []);

  /**
   * Get work type configuration and requirements
   */
  const getWorkTypeInfo = useCallback((workType) => {
    const config = WORK_TYPE_CONFIG[workType];
    if (!config) return null;

    return {
      ...config,
      estimatedDuration: calculateEstimatedDuration(workType, formData.qty_layer),
      safetyRequirements: config.requirements?.safety || [],
      qualityChecks: config.qualityChecks || [],
      complexity: config.complexity,
      trafficImpact: formData.side?.startsWith('TR') ? 'High' : 'Low'
    };
  }, [formData.qty_layer, formData.side, calculateEstimatedDuration]);

  /**
   * Validate single field
   */
  const validateField = useCallback(async (fieldName, value) => {
    try {
      const fieldSchema = dailyWorkValidationSchema.fields[fieldName];
      if (!fieldSchema) return null;

      await fieldSchema.validate(value);
      return null; // No error
    } catch (error) {
      return error.message;
    }
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async () => {
    try {
      await dailyWorkValidationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach(err => {
        if (err.path) {
          validationErrors[err.path] = err.message;
        }
      });
      setErrors(validationErrors);
      return false;
    }
  }, [formData]);

  /**
   * Handle field changes with validation
   */
  const handleFieldChange = useCallback(async (fieldName, value) => {
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

    // Mark form as dirty
    setIsDirty(true);

    // Validate field if touched
    if (touched[fieldName] || value !== '') {
      const fieldError = await validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError
      }));
    }

    // Generate RFI number if date changes and number is empty
    if (fieldName === 'date' && enableRfiGeneration && !formData.number && !rfiGenerated) {
      const newRfiNumber = await generateRfiNumber();
      if (newRfiNumber) {
        setFormData(prev => ({
          ...prev,
          number: newRfiNumber
        }));
        setRfiGenerated(true);
      }
    }

    // Auto-estimate time if work type or quantity changes
    if ((fieldName === 'type' || fieldName === 'qty_layer') && !formData.planned_time) {
      const workType = fieldName === 'type' ? value : formData.type;
      const quantity = fieldName === 'qty_layer' ? value : formData.qty_layer;
      
      if (workType && quantity) {
        const estimatedTime = calculateEstimatedDuration(workType, quantity);
        if (estimatedTime) {
          setFormData(prev => ({
            ...prev,
            planned_time: estimatedTime
          }));
        }
      }
    }
  }, [
    touched,
    formData.number,
    formData.planned_time,
    formData.type,
    enableRfiGeneration,
    rfiGenerated,
    validateField,
    generateRfiNumber,
    calculateEstimatedDuration
  ]);

  /**
   * Auto-save functionality
   */
  const autoSave = useCallback(async () => {
    if (!enableAutoSave || !isDirty) return;

    try {
      const isValid = await validateForm();
      if (isValid && onDataChange) {
        await onDataChange(formData);
        setLastSaved(new Date());
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [enableAutoSave, isDirty, formData, validateForm, onDataChange]);

  /**
   * Submit form
   */
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    try {
      const isValid = await validateForm();
      
      if (!isValid) {
        setIsLoading(false);
        return { success: false, error: 'Please fix validation errors' };
      }

      if (onSubmit) {
        const result = await onSubmit(formData);
        
        if (result?.success) {
          setIsDirty(false);
          setLastSaved(new Date());
        }
        
        setIsLoading(false);
        return result;
      }

      setIsLoading(false);
      return { success: true, data: formData };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  }, [formData, validateForm, onSubmit]);

  /**
   * Reset form to initial state
   */
  const handleReset = useCallback(() => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      number: '',
      type: 'Structure',
      location: '',
      description: '',
      planned_time: '',
      side: 'SR-R',
      qty_layer: '',
      ...initialDataRef.current
    });
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setRfiGenerated(false);
    formStartTime.current = Date.now();
  }, []);

  /**
   * Get form completion percentage
   */
  const getCompletionPercentage = useCallback(() => {
    const requiredFields = ['date', 'number', 'type', 'location', 'description', 'planned_time', 'side', 'qty_layer'];
    const completedFields = requiredFields.filter(field => formData[field] && formData[field].toString().trim() !== '');
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  /**
   * Get form session duration
   */
  const getSessionDuration = useCallback(() => {
    return Date.now() - formStartTime.current;
  }, []);

  /**
   * Calculate work urgency based on planned time and type
   */
  const getWorkUrgency = useCallback(() => {
    const { type, planned_time, side } = formData;
    
    let urgencyScore = 0;
    
    // Work type urgency
    const typeUrgency = { Structure: 3, Pavement: 2, Embankment: 1 };
    urgencyScore += typeUrgency[type] || 0;
    
    // Road type urgency (through roads are higher priority)
    if (side?.startsWith('TR')) {
      urgencyScore += 2;
    }
    
    // Time urgency (shorter times are more urgent)
    if (planned_time) {
      const hourMatch = planned_time.match(/(\d+)\s?(hour|hours|h)/i);
      if (hourMatch) {
        const hours = parseInt(hourMatch[1]);
        if (hours <= 4) urgencyScore += 2;
        else if (hours <= 8) urgencyScore += 1;
      }
    }
    
    // Urgency levels
    if (urgencyScore >= 6) return 'critical';
    if (urgencyScore >= 4) return 'high';
    if (urgencyScore >= 2) return 'medium';
    return 'low';
  }, [formData]);

  // Auto-save timer effect
  useEffect(() => {
    if (enableAutoSave && isDirty) {
      autoSaveTimer.current = setTimeout(autoSave, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [enableAutoSave, isDirty, autoSave, autoSaveInterval]);

  // Data change notification
  useEffect(() => {
    if (onDataChange && isDirty) {
      onDataChange(formData);
    }
  }, [formData, isDirty, onDataChange]);

  // Initial RFI generation
  useEffect(() => {
    if (enableRfiGeneration && !formData.number && !rfiGenerated) {
      generateRfiNumber().then(rfiNumber => {
        if (rfiNumber) {
          setFormData(prev => ({
            ...prev,
            number: rfiNumber
          }));
          setRfiGenerated(true);
        }
      });
    }
  }, [enableRfiGeneration, formData.number, rfiGenerated, generateRfiNumber]);

  // Form completion and urgency calculations
  const completionPercentage = useMemo(() => getCompletionPercentage(), [getCompletionPercentage]);
  const workTypeInfo = useMemo(() => getWorkTypeInfo(formData.type), [getWorkTypeInfo, formData.type]);
  const workUrgency = useMemo(() => getWorkUrgency(), [getWorkUrgency]);
  const sessionDuration = useMemo(() => getSessionDuration(), [getSessionDuration]);

  return {
    // Form state
    formData,
    isDirty,
    isLoading,
    errors,
    touched,
    lastSaved,
    
    // Form handlers
    handleFieldChange,
    handleSubmit,
    handleReset,
    validateForm,
    validateField,
    
    // Utility functions
    generateRfiNumber,
    calculateEstimatedDuration,
    getWorkTypeInfo,
    
    // Computed values
    completionPercentage,
    workTypeInfo,
    workUrgency,
    sessionDuration,
    
    // Form status
    isValid: Object.keys(errors).length === 0,
    hasChanges: isDirty,
    canSubmit: Object.keys(errors).length === 0 && isDirty,
    
    // Configuration
    config: formConfig
  };
};

export default useDailyWorkForm;
