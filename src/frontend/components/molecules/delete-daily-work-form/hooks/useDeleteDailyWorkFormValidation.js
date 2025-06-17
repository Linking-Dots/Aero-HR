/**
 * Delete Daily Work Form Validation Hook
 * 
 * Advanced validation hook with real-time validation, business rule enforcement,
 * security checks, and construction project-specific validation logic.
 * 
 * @module useDeleteDailyWorkFormValidation
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  stepValidationSchemas, 
  fieldValidations, 
  businessRuleValidations,
  categorizeValidationErrors,
  createValidationCache
} from '../validation.js';
import { deleteDailyWorkFormConfig } from '../config.js';

/**
 * Custom hook for delete daily work form validation
 * 
 * @param {Object} formData - Current form data
 * @param {number} currentStep - Current form step
 * @param {Object} config - Validation configuration
 * @param {Object} config.workData - Daily work entry data
 * @param {Object} config.userData - Current user data
 * @param {Object} config.securityContext - Security validation context
 * @param {boolean} config.enableRealTime - Enable real-time validation
 * @param {boolean} config.enableBusinessRules - Enable business rule validation
 * @param {number} config.debounceDelay - Validation debounce delay
 * 
 * @returns {Object} Validation state and utilities
 */
export const useDeleteDailyWorkFormValidation = ({
  formData,
  currentStep = 0,
  workData = {},
  userData = {},
  securityContext = {},
  enableRealTime = true,
  enableBusinessRules = true,
  debounceDelay = 300,
} = {}) => {
  // Validation state
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState(null);
  const [fieldTouched, setFieldTouched] = useState({});

  // Performance optimization
  const validationCache = useRef(createValidationCache());
  const debounceTimeoutRef = useRef(null);
  const validationCounterRef = useRef(0);

  // Step-specific validation state
  const [stepErrors, setStepErrors] = useState([]);
  const [stepValidation, setStepValidation] = useState([]);
  const [canProceedToNext, setCanProceedToNext] = useState(false);

  // Security validation state
  const [securityChecks, setSecurityChecks] = useState({});
  const [businessRuleResults, setBusinessRuleResults] = useState({});

  // Memoized validation configuration
  const validationConfig = useMemo(() => ({
    steps: deleteDailyWorkFormConfig.steps,
    fields: deleteDailyWorkFormConfig.fields,
    security: deleteDailyWorkFormConfig.security,
    errorMessages: deleteDailyWorkFormConfig.errorMessages,
  }), []);

  // Debounced validation function
  const debouncedValidate = useCallback((immediate = false) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const delay = immediate ? 0 : debounceDelay;
    
    debounceTimeoutRef.current = setTimeout(() => {
      performValidation();
    }, delay);
  }, [debounceDelay]);

  // Core validation function
  const performValidation = useCallback(async () => {
    const validationId = ++validationCounterRef.current;
    setIsValidating(true);

    try {
      // Create cache key
      const cacheKey = JSON.stringify({ formData, currentStep, workData: workData.id });
      const cachedResult = validationCache.current.get(cacheKey);
      
      if (cachedResult) {
        applyValidationResults(cachedResult);
        setIsValidating(false);
        return cachedResult;
      }

      const results = await runValidationChecks();
      
      // Only apply results if this is the latest validation
      if (validationId === validationCounterRef.current) {
        applyValidationResults(results);
        validationCache.current.set(cacheKey, results);
      }
      
      setIsValidating(false);
      return results;
      
    } catch (error) {
      console.error('Validation error:', error);
      setIsValidating(false);
      setErrors({ validation: 'Validation failed. Please try again.' });
    }
  }, [formData, currentStep, workData]);

  // Run all validation checks
  const runValidationChecks = useCallback(async () => {
    const results = {
      errors: {},
      warnings: [],
      stepErrors: [],
      stepValidation: [],
      securityChecks: {},
      businessRuleResults: {},
      isValid: false,
      canProceedToNext: false,
    };

    // 1. Schema validation
    await runSchemaValidation(results);
    
    // 2. Business rule validation
    if (enableBusinessRules) {
      await runBusinessRuleValidation(results);
    }
    
    // 3. Security validation
    await runSecurityValidation(results);
    
    // 4. Step-specific validation
    await runStepValidation(results);
    
    // 5. Calculate overall validity
    calculateOverallValidity(results);
    
    return results;
  }, [formData, currentStep, workData, userData, securityContext, enableBusinessRules]);

  // Schema validation
  const runSchemaValidation = useCallback(async (results) => {
    try {
      // Validate current step
      const stepSchema = stepValidationSchemas[currentStep];
      if (stepSchema) {
        await stepSchema.validate(formData, { abortEarly: false });
      }
      
      // Field-level validation
      for (const [field, value] of Object.entries(formData)) {
        if (fieldValidations[field]) {
          const error = await fieldValidations[field](value, formData);
          if (error) {
            results.errors[field] = error;
          }
        }
      }
      
    } catch (validationError) {
      if (validationError.inner) {
        validationError.inner.forEach(error => {
          results.errors[error.path] = error.message;
        });
      } else {
        results.errors[validationError.path] = validationError.message;
      }
    }
  }, [formData, currentStep]);

  // Business rule validation
  const runBusinessRuleValidation = useCallback(async (results) => {
    try {
      // Check deletion eligibility
      const eligibilityCheck = businessRuleValidations.checkDeletionEligibility(workData);
      results.businessRuleResults.eligibility = eligibilityCheck;
      
      if (eligibilityCheck.errors.length > 0) {
        eligibilityCheck.errors.forEach(error => {
          results.errors.business = error;
        });
      }
      
      if (eligibilityCheck.warnings.length > 0) {
        results.warnings.push(...eligibilityCheck.warnings);
      }
      
      // Check user permissions
      const permissionErrors = businessRuleValidations.checkUserPermissions(userData, workData);
      if (permissionErrors.length > 0) {
        results.errors.permissions = permissionErrors.join('; ');
      }
      
      results.businessRuleResults.permissions = permissionErrors;
      
    } catch (error) {
      console.error('Business rule validation error:', error);
      results.warnings.push('Some business rule checks failed');
    }
  }, [workData, userData]);

  // Security validation
  const runSecurityValidation = useCallback(async (results) => {
    try {
      // Validate security context
      const securityValidation = businessRuleValidations.validateSecurityContext(securityContext);
      results.securityChecks = {
        rateLimiting: {
          passed: securityValidation.errors.length === 0,
          message: securityValidation.errors.join('; ') || 'Rate limiting check passed',
        },
        sessionValidity: {
          passed: securityContext.validSession !== false,
          message: securityContext.validSession === false ? 'Invalid session' : 'Session valid',
        },
        suspiciousActivity: {
          passed: !securityValidation.warnings.some(w => w.includes('suspicious')),
          detected: securityValidation.warnings.some(w => w.includes('suspicious')),
          message: securityValidation.warnings.find(w => w.includes('suspicious')) || 'No suspicious activity detected',
        },
      };
      
      // Add security errors to main errors
      if (securityValidation.errors.length > 0) {
        results.errors.security = securityValidation.errors.join('; ');
      }
      
      if (securityValidation.warnings.length > 0) {
        results.warnings.push(...securityValidation.warnings);
      }
      
    } catch (error) {
      console.error('Security validation error:', error);
      results.securityChecks.general = {
        passed: false,
        message: 'Security validation failed',
      };
    }
  }, [securityContext]);

  // Step-specific validation
  const runStepValidation = useCallback(async (results) => {
    try {
      const stepValidationResults = [];
      
      for (let i = 0; i < validationConfig.steps.length; i++) {
        const stepSchema = stepValidationSchemas[i];
        const stepResult = {
          step: i,
          label: validationConfig.steps[i].label,
          isValid: true,
          errors: [],
        };
        
        if (stepSchema) {
          try {
            await stepSchema.validate(formData, { abortEarly: false });
          } catch (error) {
            stepResult.isValid = false;
            if (error.inner) {
              stepResult.errors = error.inner.map(e => e.message);
            } else {
              stepResult.errors = [error.message];
            }
          }
        }
        
        stepValidationResults.push(stepResult);
      }
      
      results.stepValidation = stepValidationResults;
      
      // Current step errors
      const currentStepResult = stepValidationResults[currentStep];
      results.stepErrors = currentStepResult ? currentStepResult.errors : [];
      
      // Can proceed to next step
      results.canProceedToNext = currentStepResult ? currentStepResult.isValid : false;
      
    } catch (error) {
      console.error('Step validation error:', error);
      results.stepErrors = ['Step validation failed'];
    }
  }, [currentStep, formData, validationConfig.steps]);

  // Calculate overall validity
  const calculateOverallValidity = useCallback((results) => {
    const hasErrors = Object.keys(results.errors).length > 0;
    const hasStepErrors = results.stepErrors.length > 0;
    const allStepsValid = results.stepValidation.every(step => step.isValid);
    const securityPassed = Object.values(results.securityChecks).every(check => check.passed !== false);
    
    results.isValid = !hasErrors && !hasStepErrors && allStepsValid && securityPassed;
  }, []);

  // Apply validation results to state
  const applyValidationResults = useCallback((results) => {
    setErrors(results.errors);
    setWarnings(results.warnings);
    setStepErrors(results.stepErrors);
    setStepValidation(results.stepValidation);
    setSecurityChecks(results.securityChecks);
    setBusinessRuleResults(results.businessRuleResults);
    setIsValid(results.isValid);
    setCanProceedToNext(results.canProceedToNext);
    setLastValidated(Date.now());
  }, []);

  // Field-specific validation
  const validateField = useCallback(async (fieldName, value) => {
    if (!fieldValidations[fieldName]) return null;
    
    try {
      return await fieldValidations[fieldName](value, formData);
    } catch (error) {
      console.error(`Field validation error for ${fieldName}:`, error);
      return 'Validation failed';
    }
  }, [formData]);

  // Mark field as touched
  const touchField = useCallback((fieldName) => {
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  // Check if field has error and is touched
  const getFieldError = useCallback((fieldName) => {
    return fieldTouched[fieldName] ? errors[fieldName] : null;
  }, [errors, fieldTouched]);

  // Refresh validation
  const refreshValidation = useCallback(() => {
    validationCache.current.clear();
    debouncedValidate(true);
  }, [debouncedValidate]);

  // Real-time validation effect
  useEffect(() => {
    if (enableRealTime) {
      debouncedValidate();
    }
  }, [formData, currentStep, enableRealTime, debouncedValidate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Performance metrics
  const getValidationMetrics = useCallback(() => {
    return {
      totalValidations: validationCounterRef.current,
      cacheSize: validationCache.current.size || 0,
      lastValidated,
      isValidating,
      debounceDelay,
    };
  }, [lastValidated, isValidating, debounceDelay]);

  return {
    // Validation state
    errors,
    warnings,
    isValid,
    isValidating,
    lastValidated,
    
    // Step validation
    stepErrors,
    stepValidation,
    canProceedToNext,
    
    // Security and business rules
    securityChecks,
    businessRuleResults,
    
    // Field validation
    getFieldError,
    validateField,
    touchField,
    fieldTouched,
    
    // Utilities
    refreshValidation,
    getValidationMetrics,
    categorizeErrors: () => categorizeValidationErrors(Object.values(errors)),
  };
};

export default useDeleteDailyWorkFormValidation;
