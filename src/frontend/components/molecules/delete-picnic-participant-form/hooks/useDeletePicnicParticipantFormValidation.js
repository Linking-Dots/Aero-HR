import { useState, useEffect, useMemo } from 'react';
import { 
  deletePicnicParticipantFormValidation, 
  stepValidationSchemas, 
  validateStep,
  validateBusinessRules,
  getValidationErrorMessage 
} from '../validation.js';

/**
 * Hook for managing delete picnic participant form validation
 * 
 * Features:
 * - Real-time form validation
 * - Step-by-step validation
 * - Business rule enforcement
 * - Security validation
 * - Performance optimized validation
 */
export const useDeletePicnicParticipantFormValidation = (
  formData = {},
  currentStep = 0,
  participantData = null,
  eventData = null
) => {
  const [validationCache, setValidationCache] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [stepErrors, setStepErrors] = useState([[], [], []]);
  const [businessRuleErrors, setBusinessRuleErrors] = useState([]);

  // Validate entire form
  const validateForm = async (data = formData) => {
    setIsValidating(true);
    
    try {
      // Create cache key for performance
      const cacheKey = JSON.stringify({ 
        data, 
        step: currentStep, 
        participantId: participantData?.id 
      });

      // Return cached validation if available
      if (validationCache[cacheKey] && Date.now() - validationCache[cacheKey].timestamp < 5000) {
        setIsValidating(false);
        return validationCache[cacheKey].result;
      }

      await deletePicnicParticipantFormValidation.validate(data, { abortEarly: false });

      const result = {
        isValid: true,
        errors: {},
        stepErrors: [[], [], []],
        businessRuleErrors: [],
        warnings: []
      };

      // Validate business rules if we have participant data
      if (participantData && eventData) {
        const businessValidation = validateBusinessRules(data, participantData, eventData);
        result.businessRuleErrors = businessValidation.blockers;
        result.warnings = businessValidation.warnings;
        
        if (!businessValidation.isValid) {
          result.isValid = false;
        }
      }

      // Cache successful validation
      setValidationCache(prev => ({
        ...prev,
        [cacheKey]: {
          result,
          timestamp: Date.now()
        }
      }));      setErrors({});
      setStepErrors([[], [], []]);
      setBusinessRuleErrors(result.businessRuleErrors);
      setLastValidation(result);
      setIsValidating(false);

      return result;
    } catch (validationError) {
      const result = {
        isValid: false,
        errors: {},
        stepErrors: [[], [], []],
        businessRuleErrors: [],
        warnings: []
      };

      // Process validation errors
      if (validationError.inner) {
        validationError.inner.forEach(error => {
          const field = error.path;
          result.errors[field] = getValidationErrorMessage(error, {
            field,
            value: data[field],
            participantName: participantData?.name
          });

          // Categorize errors by step
          if (['reason', 'details'].includes(field)) {
            result.stepErrors[0].push(result.errors[field]);
          } else if (['impactAssessment'].includes(field)) {
            result.stepErrors[1].push(result.errors[field]);
          } else if (['password', 'confirmation', 'acknowledgeConsequences'].includes(field)) {
            result.stepErrors[2].push(result.errors[field]);
          }
        });
      }

      // Validate business rules if we have participant data
      if (participantData && eventData) {
        const businessValidation = validateBusinessRules(data, participantData, eventData);
        result.businessRuleErrors = businessValidation.blockers;
        result.warnings = businessValidation.warnings;
      }      setErrors(result.errors);
      setStepErrors(result.stepErrors);
      setBusinessRuleErrors(result.businessRuleErrors);
      setLastValidation(result);
      setIsValidating(false);

      return result;
    }
  };

  // Validate specific step
  const validateCurrentStep = async (step = currentStep, data = formData) => {
    try {
      const validation = await validateStep(step, data);
      
      if (validation.isValid) {
        // Clear step errors
        setStepErrors(prev => {
          const newStepErrors = [...prev];
          newStepErrors[step] = [];
          return newStepErrors;
        });

        // Clear field errors for this step
        const stepFields = getStepFields(step);
        setErrors(prev => {
          const newErrors = { ...prev };
          stepFields.forEach(field => {
            delete newErrors[field];
          });
          return newErrors;
        });
      } else {
        // Set step errors
        const stepErrorMessages = Object.values(validation.errors);
        setStepErrors(prev => {
          const newStepErrors = [...prev];
          newStepErrors[step] = stepErrorMessages;
          return newStepErrors;
        });

        // Set field errors
        setErrors(prev => ({
          ...prev,
          ...validation.errors
        }));
      }

      return validation;
    } catch (error) {
      console.error('Step validation error:', error);
      return { isValid: false, errors: { [step]: 'Validation failed' } };
    }
  };

  // Validate specific field
  const validateField = async (fieldName, value) => {
    try {
      await deletePicnicParticipantFormValidation.validateAt(fieldName, {
        ...formData,
        [fieldName]: value
      });

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      return { isValid: true, error: null };
    } catch (error) {
      const fieldError = getValidationErrorMessage(error, {
        field: fieldName,
        value,
        participantName: participantData?.name
      });
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError
      }));

      return { isValid: false, error: fieldError };
    }
  };

  // Get fields for specific step
  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ['reason', 'details'];
      case 1:
        return ['impactAssessment'];
      case 2:
        return ['password', 'confirmation', 'acknowledgeConsequences'];
      default:
        return [];
    }
  };

  // Check if step can proceed
  const canProceedToNextStep = (step = currentStep) => {
    const stepErrorsForStep = stepErrors[step] || [];
    const stepFields = getStepFields(step);
    const hasFieldErrors = stepFields.some(field => errors[field]);
    
    return stepErrorsForStep.length === 0 && !hasFieldErrors;
  };

  // Validate deletion eligibility based on business rules
  const validateDeletionEligibility = () => {
    if (!participantData || !eventData) {
      return {
        eligible: false,
        reasons: ['Participant or event data not available']
      };
    }

    const businessValidation = validateBusinessRules(formData, participantData, eventData);
    
    return {
      eligible: businessValidation.isValid,
      reasons: businessValidation.blockers,
      warnings: businessValidation.warnings,
      details: businessValidation.results
    };
  };

  // Security validation
  const validateSecurity = () => {
    const securityErrors = [];

    if (!formData.password || formData.password.length < 6) {
      securityErrors.push('Password must be at least 6 characters');
    }

    if (formData.confirmation !== 'DELETE PARTICIPANT') {
      securityErrors.push('Confirmation text must match exactly');
    }

    if (!formData.acknowledgeConsequences) {
      securityErrors.push('Must acknowledge irreversible consequences');
    }

    return {
      isValid: securityErrors.length === 0,
      errors: securityErrors
    };
  };

  // Impact assessment validation
  const validateImpactAssessment = () => {
    const requiredCategories = ['eventPlanning', 'financial', 'teamDynamics', 'communication'];
    const acknowledged = Object.entries(formData.impactAssessment || {})
      .filter(([, value]) => value)
      .map(([key]) => key);

    const missing = requiredCategories.filter(category => !acknowledged.includes(category));

    return {
      isValid: missing.length === 0,
      missing,
      acknowledged,
      progress: (acknowledged.length / requiredCategories.length) * 100
    };
  };
  // Memoized validation state
  const validationState = useMemo(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const hasStepErrors = stepErrors.some(stepErrorArray => stepErrorArray.length > 0);
    const hasBusinessRuleErrors = businessRuleErrors.length > 0;
    
    return {
      isValid: !hasErrors && !hasStepErrors && !hasBusinessRuleErrors,
      hasErrors: hasErrors || hasStepErrors || hasBusinessRuleErrors,
      errorCount: Object.keys(errors).length + 
                  stepErrors.flat().length + 
                  businessRuleErrors.length,
      isValidating,
      lastValidated: lastValidation?.timestamp,
      canProceedToNext: canProceedToNextStep(currentStep)
    };
  }, [errors, stepErrors, businessRuleErrors, isValidating, lastValidation, currentStep]);

  // Auto-validate on data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        validateCurrentStep();
      }
    }, 300); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep]);
  // Validate business rules when participant/event data changes
  useEffect(() => {
    if (participantData && eventData && Object.keys(formData).length > 0) {
      const businessValidation = validateBusinessRules(formData, participantData, eventData);
      setBusinessRuleErrors(businessValidation.blockers);
    }
  }, [participantData, eventData, formData]);

  return {
    // Validation state
    errors,
    stepErrors,
    businessRuleErrors,
    validationState,
    
    // Validation methods
    validateForm,
    validateCurrentStep,
    validateField,
    canProceedToNextStep,
    
    // Specialized validations
    validateDeletionEligibility,
    validateSecurity,
    validateImpactAssessment,
      // Utility methods
    isValidating,
    clearErrors: () => {
      setErrors({});
      setStepErrors([[], [], []]);
      setBusinessRuleErrors([]);
    },
    
    // Get errors for specific contexts
    getFieldError: (field) => errors[field],
    getStepErrors: (step) => stepErrors[step] || [],
    getBusinessRuleErrors: () => businessRuleErrors,
    
    // Validation helpers
    hasFieldError: (field) => !!errors[field],
    hasStepError: (step) => (stepErrors[step] || []).length > 0,
    hasBusinessRuleError: () => businessRuleErrors.length > 0,
    
    // Progress indicators
    getValidationProgress: () => {
      const totalSteps = 3;
      const completedSteps = stepErrors.filter(stepErrorArray => stepErrorArray.length === 0).length;
      return (completedSteps / totalSteps) * 100;
    },
    
    getImpactAssessmentProgress: () => validateImpactAssessment().progress
  };
};

export default useDeletePicnicParticipantFormValidation;
