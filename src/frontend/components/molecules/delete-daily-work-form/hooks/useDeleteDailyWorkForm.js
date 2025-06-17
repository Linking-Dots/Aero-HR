/**
 * Delete Daily Work Form Hook
 * 
 * Core hook for managing daily work deletion form state, multi-step navigation,
 * and construction project-specific business logic.
 * 
 * @module useDeleteDailyWorkForm
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { deleteDailyWorkFormConfig } from '../config.js';

/**
 * Custom hook for delete daily work form management
 * 
 * @param {Object} config - Hook configuration
 * @param {string|number} config.workId - Daily work entry ID to delete
 * @param {Object} config.workData - Daily work entry data
 * @param {Object} config.initialData - Initial form data
 * @param {Function} config.onStepChange - Step change callback
 * @param {Function} config.onDataChange - Data change callback
 * @param {boolean} config.autoSave - Enable auto-save functionality
 * @param {number} config.autoSaveDelay - Auto-save delay in milliseconds
 * 
 * @returns {Object} Form state and handlers
 */
export const useDeleteDailyWorkForm = ({
  workId,
  workData = {},
  initialData = {},
  onStepChange,
  onDataChange,
  autoSave = true,
  autoSaveDelay = 1000,
} = {}) => {
  // Form state
  const [formData, setFormData] = useState({
    reason: '',
    details: '',
    impactAssessment: {
      project: false,
      reporting: false,
      financial: false,
      compliance: false,
    },
    confirmation: '',
    acknowledgeConsequences: false,
    password: '',
    ...initialData,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);

  // Refs for optimization
  const autoSaveTimeoutRef = useRef(null);
  const formDataRef = useRef(formData);
  const stepHistoryRef = useRef([0]);

  // Update ref when formData changes
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && !isSubmitting) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        saveFormData();
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, isDirty, autoSave, autoSaveDelay, isSubmitting]);

  // Save form data to localStorage
  const saveFormData = useCallback(() => {
    try {
      const saveData = {
        formData: formDataRef.current,
        currentStep,
        timestamp: Date.now(),
        workId,
      };
      
      localStorage.setItem(
        `delete-daily-work-form-${workId}`,
        JSON.stringify(saveData)
      );
      
      setLastSaved(Date.now());
      setIsDirty(false);
    } catch (error) {
      console.warn('Failed to auto-save form data:', error);
    }
  }, [workId, currentStep]);

  // Load saved form data
  const loadSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(`delete-daily-work-form-${workId}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Check if data is not too old (1 hour)
        const isRecent = Date.now() - parsed.timestamp < 3600000;
        
        if (isRecent && parsed.workId === workId) {
          setFormData(parsed.formData);
          setCurrentStep(parsed.currentStep);
          setLastSaved(parsed.timestamp);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
    return false;
  }, [workId]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(`delete-daily-work-form-${workId}`);
    } catch (error) {
      console.warn('Failed to clear saved data:', error);
    }
  }, [workId]);

  // Field change handler
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      // Handle nested field updates (e.g., 'impactAssessment.project')
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
      
      return {
        ...prev,
        [field]: value,
      };
    });
    
    setIsDirty(true);
    setError(null);
    
    // Trigger change callback
    onDataChange?.(field, value, formDataRef.current);
  }, [onDataChange]);

  // Batch field updates
  const handleBatchFieldChange = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setError(null);
  }, []);

  // Step navigation
  const goToStep = useCallback((step) => {
    if (step < 0 || step >= deleteDailyWorkFormConfig.steps.length) {
      return false;
    }
    
    const previousStep = currentStep;
    setCurrentStep(step);
    
    // Update step history
    stepHistoryRef.current.push(step);
    
    // Trigger step change callback
    onStepChange?.(step, previousStep, formDataRef.current);
    
    return true;
  }, [currentStep, onStepChange]);

  const goToNextStep = useCallback(() => {
    return goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    return goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Progress calculations
  const getStepProgress = useCallback(() => {
    const totalSteps = deleteDailyWorkFormConfig.steps.length;
    return {
      current: currentStep + 1,
      total: totalSteps,
      percentage: Math.round(((currentStep + 1) / totalSteps) * 100),
    };
  }, [currentStep]);

  // Form completion status
  const getCompletionStatus = useCallback(() => {
    const requiredFields = {
      0: ['reason'], // Step 0: Reason required
      1: ['impactAssessment'], // Step 1: Impact assessment required  
      2: ['confirmation', 'acknowledgeConsequences'], // Step 2: Confirmation required
    };

    const stepStatus = {};
    
    Object.entries(requiredFields).forEach(([step, fields]) => {
      const stepNum = parseInt(step);
      stepStatus[stepNum] = fields.every(field => {
        if (field === 'impactAssessment') {
          const acknowledged = Object.values(formData.impactAssessment || {});
          return acknowledged.filter(Boolean).length >= 2;
        }
        return Boolean(formData[field]);
      });
    });

    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = Object.keys(stepStatus).length;

    return {
      stepStatus,
      completedSteps,
      totalSteps,
      isComplete: completedSteps === totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100),
    };
  }, [formData]);

  // Form reset
  const resetForm = useCallback(() => {
    setFormData({
      reason: '',
      details: '',
      impactAssessment: {
        project: false,
        reporting: false,
        financial: false,
        compliance: false,
      },
      confirmation: '',
      acknowledgeConsequences: false,
      password: '',
      ...initialData,
    });
    setCurrentStep(0);
    setIsDirty(false);
    setIsSubmitting(false);
    setError(null);
    stepHistoryRef.current = [0];
    clearSavedData();
  }, [initialData, clearSavedData]);

  // Get step data
  const getCurrentStepData = useCallback(() => {
    const stepConfig = deleteDailyWorkFormConfig.steps[currentStep];
    return {
      ...stepConfig,
      isFirst: currentStep === 0,
      isLast: currentStep === deleteDailyWorkFormConfig.steps.length - 1,
      canGoNext: currentStep < deleteDailyWorkFormConfig.steps.length - 1,
      canGoPrevious: currentStep > 0,
    };
  }, [currentStep]);

  // Get impact assessment summary
  const getImpactAssessmentSummary = useCallback(() => {
    const { impactAssessment = {} } = formData;
    const categories = deleteDailyWorkFormConfig.impactCategories;
    
    const acknowledged = Object.entries(impactAssessment)
      .filter(([, value]) => value)
      .map(([key]) => ({
        key,
        ...categories[key],
      }));

    return {
      acknowledged,
      count: acknowledged.length,
      required: 2,
      isValid: acknowledged.length >= 2,
    };
  }, [formData]);

  // Security context
  const getSecurityContext = useCallback(() => {
    return {
      workId,
      formSessionId: `delete-work-${workId}-${Date.now()}`,
      lastActivity: Date.now(),
      stepHistory: [...stepHistoryRef.current],
      isDirty,
      autoSaveEnabled: autoSave,
      lastSaved,
    };
  }, [workId, isDirty, autoSave, lastSaved]);

  return {
    // Form state
    formData,
    currentStep,
    isDirty,
    isSubmitting,
    lastSaved,
    error,

    // Form handlers
    handleFieldChange,
    handleBatchFieldChange,
    setIsSubmitting,
    setError,

    // Step navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    getCurrentStepData,

    // Progress and status
    getStepProgress,
    getCompletionStatus,
    getImpactAssessmentSummary,

    // Utilities
    resetForm,
    saveFormData,
    loadSavedData,
    clearSavedData,
    getSecurityContext,

    // Configuration
    config: deleteDailyWorkFormConfig,
  };
};

export default useDeleteDailyWorkForm;
