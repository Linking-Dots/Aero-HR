// filepath: src/frontend/components/molecules/delete-holiday-form/hooks/useDeleteHolidayForm.js

/**
 * Delete Holiday Form Hook
 * Core form state management for holiday deletion with multi-step workflow and security
 * 
 * Features:
 * - Multi-step form progression with validation
 * - Impact assessment calculations
 * - Security confirmation tracking
 * - Auto-save functionality with session storage
 * - Progress tracking and step navigation
 * - Comprehensive error handling
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DELETE_HOLIDAY_CONFIG, DELETE_HOLIDAY_FIELDS } from '../config.js';
import { validationUtils } from '../validation.js';

export const useDeleteHolidayForm = (initialData = {}, options = {}) => {
  const {
    holidayId,
    onStepChange,
    onProgressUpdate,
    onDataChange,
    enableAutoSave = true,
    sessionKey = 'deleteHolidayForm'
  } = options;

  // Form state
  const [formData, setFormData] = useState(() => {
    const savedData = enableAutoSave ? sessionStorage.getItem(sessionKey) : null;
    const parsedSavedData = savedData ? JSON.parse(savedData) : {};
    
    return {
      holidayId: holidayId || '',
      deletionReason: '',
      impactAssessment: {
        overall_score: 0,
        assessed_categories: [],
        category_scores: {},
        notes: ''
      },
      confirmationText: '',
      acknowledgment: false,
      additionalNotes: '',
      currentStep: 0,
      completedSteps: [],
      ...parsedSavedData,
      ...initialData
    };
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(formData.currentStep || 0);
  const [completedSteps, setCompletedSteps] = useState(formData.completedSteps || []);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [progress, setProgress] = useState(0);

  // Performance tracking
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [stepTimes, setStepTimes] = useState({});
  const [interactionCount, setInteractionCount] = useState(0);

  // Refs for cleanup and performance
  const autoSaveTimeoutRef = useRef(null);
  const progressUpdateTimeoutRef = useRef(null);
  const initialDataRef = useRef(initialData);

  // Auto-save functionality
  const saveToSession = useCallback((data) => {
    if (enableAutoSave && data.holidayId) {
      try {
        sessionStorage.setItem(sessionKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save form data to session storage:', error);
      }
    }
  }, [enableAutoSave, sessionKey]);

  // Update form data with validation
  const updateFormData = useCallback((updates, triggerValidation = true) => {
    setFormData(prevData => {
      const newData = { ...prevData, ...updates };
      
      // Auto-save with debouncing
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveToSession(newData);
      }, 1000);

      // Mark as dirty
      setIsDirty(true);
      setInteractionCount(prev => prev + 1);

      // Trigger callbacks
      if (onDataChange) {
        onDataChange(newData, prevData);
      }

      return newData;
    });

    // Update progress
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }
    progressUpdateTimeoutRef.current = setTimeout(() => {
      updateProgress();
    }, 300);
  }, [saveToSession, onDataChange]);

  // Calculate and update form progress
  const updateProgress = useCallback(() => {
    const currentProgress = validationUtils.getFormProgress(formData);
    setProgress(currentProgress);
    
    if (onProgressUpdate) {
      onProgressUpdate(currentProgress, currentStep, completedSteps);
    }
  }, [formData, currentStep, completedSteps, onProgressUpdate]);

  // Step navigation functions
  const canProceedToStep = useCallback((targetStep) => {
    if (targetStep <= currentStep) return true;
    return validationUtils.canProceedToStep(targetStep, formData);
  }, [currentStep, formData]);

  const goToStep = useCallback((targetStep) => {
    if (targetStep < 0 || targetStep >= DELETE_HOLIDAY_CONFIG.confirmation.steps.length) {
      return false;
    }

    if (!canProceedToStep(targetStep)) {
      return false;
    }

    // Record step timing
    const stepEndTime = Date.now();
    const timeSpent = stepEndTime - stepStartTime;
    setStepTimes(prev => ({
      ...prev,
      [currentStep]: (prev[currentStep] || 0) + timeSpent
    }));

    // Update current step
    setCurrentStep(targetStep);
    setStepStartTime(stepEndTime);

    // Update completed steps
    if (targetStep > currentStep) {
      const newCompletedSteps = [...completedSteps];
      for (let i = currentStep; i < targetStep; i++) {
        if (!newCompletedSteps.includes(i)) {
          newCompletedSteps.push(i);
        }
      }
      setCompletedSteps(newCompletedSteps);
      updateFormData({ completedSteps: newCompletedSteps, currentStep: targetStep });
    } else {
      updateFormData({ currentStep: targetStep });
    }

    // Trigger callback
    if (onStepChange) {
      onStepChange(targetStep, currentStep, {
        timeSpent,
        totalStepTimes: stepTimes,
        interactionCount
      });
    }

    return true;
  }, [currentStep, stepStartTime, stepTimes, completedSteps, canProceedToStep, updateFormData, onStepChange, interactionCount]);

  const nextStep = useCallback(() => {
    return goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const previousStep = useCallback(() => {
    return goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Impact assessment functions
  const updateImpactAssessment = useCallback((categoryId, score, notes = '') => {
    const newImpactAssessment = { ...formData.impactAssessment };
    
    // Update category score
    newImpactAssessment.category_scores[categoryId] = score;
    
    // Add to assessed categories if not already present
    if (!newImpactAssessment.assessed_categories.includes(categoryId)) {
      newImpactAssessment.assessed_categories.push(categoryId);
    }

    // Calculate overall score based on weights
    const { categories } = DELETE_HOLIDAY_CONFIG.impactAssessment;
    let weightedSum = 0;
    let totalWeight = 0;

    categories.forEach(category => {
      const categoryScore = newImpactAssessment.category_scores[category.id];
      if (typeof categoryScore === 'number') {
        weightedSum += categoryScore * category.weight;
        totalWeight += category.weight;
      }
    });

    newImpactAssessment.overall_score = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    if (notes) {
      newImpactAssessment.notes = notes;
    }

    updateFormData({ impactAssessment: newImpactAssessment });
  }, [formData.impactAssessment, updateFormData]);

  const getImpactLevel = useCallback(() => {
    const score = formData.impactAssessment.overall_score;
    const { threshold } = DELETE_HOLIDAY_CONFIG.impactAssessment;

    if (score >= threshold.critical) return 'critical';
    if (score >= threshold.high) return 'high';
    if (score >= threshold.medium) return 'medium';
    return 'low';
  }, [formData.impactAssessment.overall_score]);

  // Validation functions
  const validateCurrentStep = useCallback(() => {
    const stepErrors = validationUtils.getStepErrors(currentStep, formData);
    setErrors(prev => ({ ...prev, [currentStep]: stepErrors }));
    return stepErrors.length === 0;
  }, [currentStep, formData]);

  const validateForm = useCallback(() => {
    const isValid = validationUtils.isFormComplete(formData);
    return isValid;
  }, [formData]);

  // Reset functions
  const resetForm = useCallback(() => {
    const resetData = {
      holidayId: holidayId || '',
      deletionReason: '',
      impactAssessment: {
        overall_score: 0,
        assessed_categories: [],
        category_scores: {},
        notes: ''
      },
      confirmationText: '',
      acknowledgment: false,
      additionalNotes: '',
      currentStep: 0,
      completedSteps: []
    };

    setFormData(resetData);
    setCurrentStep(0);
    setCompletedSteps([]);
    setErrors({});
    setIsDirty(false);
    setProgress(0);
    setInteractionCount(0);
    setStepTimes({});

    // Clear session storage
    if (enableAutoSave) {
      sessionStorage.removeItem(sessionKey);
    }
  }, [holidayId, enableAutoSave, sessionKey]);

  const clearSession = useCallback(() => {
    if (enableAutoSave) {
      sessionStorage.removeItem(sessionKey);
    }
  }, [enableAutoSave, sessionKey]);

  // Effects
  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Form state helpers
  const isStepCompleted = useCallback((step) => {
    return completedSteps.includes(step);
  }, [completedSteps]);

  const isFormComplete = useCallback(() => {
    return validateForm() && completedSteps.length >= DELETE_HOLIDAY_CONFIG.confirmation.steps.length - 1;
  }, [validateForm, completedSteps]);

  const canSubmit = useCallback(() => {
    return isFormComplete() && currentStep === DELETE_HOLIDAY_CONFIG.confirmation.steps.length - 1;
  }, [isFormComplete, currentStep]);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const totalTime = Object.values(stepTimes).reduce((sum, time) => sum + time, 0);
    const averageStepTime = totalTime / Math.max(Object.keys(stepTimes).length, 1);

    return {
      totalTime,
      averageStepTime,
      stepTimes,
      interactionCount,
      currentProgress: progress,
      stepsCompleted: completedSteps.length,
      currentStep,
      isDirty
    };
  }, [stepTimes, interactionCount, progress, completedSteps, currentStep, isDirty]);

  return {
    // Form data
    formData,
    updateFormData,
    resetForm,
    clearSession,

    // Step management
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    previousStep,
    canProceedToStep,
    isStepCompleted,

    // Impact assessment
    updateImpactAssessment,
    getImpactLevel,

    // Validation
    errors,
    validateCurrentStep,
    validateForm,
    isFormComplete,
    canSubmit,

    // UI state
    isLoading,
    setIsLoading,
    isDirty,
    progress,

    // Performance
    getPerformanceMetrics,

    // Configuration
    config: DELETE_HOLIDAY_CONFIG,
    fields: DELETE_HOLIDAY_FIELDS
  };
};

export default useDeleteHolidayForm;
