import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  dailyWorkSummaryDownloadFormValidation, 
  stepValidationSchemas, 
  validateStep,
  validateBusinessRules,
  getValidationErrorMessage,
  validateExportData
} from '../validation.js';

/**
 * Hook for managing Daily Work Summary Download Form validation
 * 
 * Features:
 * - Real-time form validation
 * - Step-by-step validation
 * - Business rule enforcement
 * - Performance validation
 * - Data integrity checks
 */
export const useDailyWorkSummaryDownloadFormValidation = (
  formData = {},
  currentStep = 0,
  filteredData = [],
  userPermissions = {},
  options = {}
) => {
  const {
    validateOnChange = true,
    enableBusinessRules = true,
    cacheValidation = true,
    debounceTime = 300
  } = options;

  const [validationCache, setValidationCache] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [stepErrors, setStepErrors] = useState([[], [], []]);
  const [businessRuleErrors, setBusinessRuleErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  // Validate entire form
  const validateForm = useCallback(async (data = formData) => {
    setIsValidating(true);
    
    try {
      // Create cache key for performance
      const cacheKey = JSON.stringify({ 
        data, 
        step: currentStep, 
        dataLength: filteredData.length 
      });

      // Return cached validation if available and caching is enabled
      if (cacheValidation && validationCache[cacheKey] && 
          Date.now() - validationCache[cacheKey].timestamp < 5000) {
        setIsValidating(false);
        return validationCache[cacheKey].result;
      }

      // Validate against schema
      await dailyWorkSummaryDownloadFormValidation.validate(data, { abortEarly: false });

      const result = {
        isValid: true,
        errors: {},
        stepErrors: [[], [], []],
        businessRuleErrors: [],
        warnings: []
      };

      // Validate business rules if enabled
      if (enableBusinessRules) {
        const businessValidation = validateBusinessRules(data, filteredData, userPermissions);
        result.businessRuleErrors = businessValidation.blockers;
        result.warnings = businessValidation.warnings;
        
        if (!businessValidation.isValid) {
          result.isValid = false;
        }
      }

      // Validate export data
      const exportDataValidation = validateExportData(filteredData);
      if (!exportDataValidation.isValid) {
        result.businessRuleErrors.push(exportDataValidation.error);
        result.isValid = false;
      }

      // Cache successful validation
      if (cacheValidation) {
        setValidationCache(prev => ({
          ...prev,
          [cacheKey]: {
            result,
            timestamp: Date.now()
          }
        }));
      }

      setErrors({});
      setStepErrors([[], [], []]);
      setBusinessRuleErrors(result.businessRuleErrors);
      setWarnings(result.warnings);
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
            dataCount: filteredData.length
          });

          // Categorize errors by step
          if (['selectedColumns'].includes(field)) {
            result.stepErrors[0].push(result.errors[field]);
          } else if (['exportFormat', 'filename', 'exportOptions'].includes(field)) {
            result.stepErrors[1].push(result.errors[field]);
          } else if (['estimatedRecordCount', 'performanceSettings'].includes(field)) {
            result.stepErrors[2].push(result.errors[field]);
          }
        });
      }

      // Validate business rules if enabled
      if (enableBusinessRules) {
        const businessValidation = validateBusinessRules(data, filteredData, userPermissions);
        result.businessRuleErrors = businessValidation.blockers;
        result.warnings = businessValidation.warnings;
      }

      setErrors(result.errors);
      setStepErrors(result.stepErrors);
      setBusinessRuleErrors(result.businessRuleErrors);
      setWarnings(result.warnings);
      setLastValidation(result);
      setIsValidating(false);

      return result;
    }
  }, [formData, currentStep, filteredData, userPermissions, enableBusinessRules, cacheValidation, validationCache]);

  // Validate specific step
  const validateCurrentStep = useCallback(async (step = currentStep, data = formData) => {
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
  }, [currentStep, formData]);

  // Validate specific field
  const validateField = useCallback(async (fieldName, value) => {
    try {
      await dailyWorkSummaryDownloadFormValidation.validateAt(fieldName, {
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
        dataCount: filteredData.length
      });
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError
      }));

      return { isValid: false, error: fieldError };
    }
  }, [formData, filteredData.length]);

  // Get fields for specific step
  const getStepFields = useCallback((step) => {
    switch (step) {
      case 0:
        return ['selectedColumns'];
      case 1:
        return ['exportFormat', 'filename', 'exportOptions'];
      case 2:
        return ['estimatedRecordCount', 'performanceSettings'];
      default:
        return [];
    }
  }, []);

  // Check if step can proceed
  const canProceedToNextStep = useCallback((step = currentStep) => {
    const stepErrorsForStep = stepErrors[step] || [];
    const stepFields = getStepFields(step);
    const hasFieldErrors = stepFields.some(field => errors[field]);
    
    // Additional step-specific validation
    switch (step) {
      case 0:
        // Must have at least one column selected
        const selectedColumns = formData.selectedColumns?.filter(col => col.checked) || [];
        return stepErrorsForStep.length === 0 && !hasFieldErrors && selectedColumns.length > 0;
      
      case 1:
        // Must have export format and filename
        return stepErrorsForStep.length === 0 && !hasFieldErrors && 
               formData.exportFormat && formData.filename;
      
      case 2:
        // Final step - all previous validations must pass
        return stepErrorsForStep.length === 0 && !hasFieldErrors;
      
      default:
        return stepErrorsForStep.length === 0 && !hasFieldErrors;
    }
  }, [currentStep, stepErrors, errors, formData, getStepFields]);

  // Validate column selection
  const validateColumnSelection = useCallback(() => {
    const selectedColumns = formData.selectedColumns?.filter(col => col.checked) || [];
    const requiredColumns = formData.selectedColumns?.filter(col => col.required && col.checked) || [];
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      info: {
        selectedCount: selectedColumns.length,
        requiredCount: requiredColumns.length,
        totalCount: formData.selectedColumns?.length || 0
      }
    };

    if (selectedColumns.length === 0) {
      validation.isValid = false;
      validation.errors.push('At least one column must be selected for export');
    }

    if (selectedColumns.length > 15) {
      validation.warnings.push('Many columns selected may impact export performance');
    }

    // Check for logical column combinations
    const selectedKeys = selectedColumns.map(col => col.key);
    if (selectedKeys.includes('completionPercentage') && 
        (!selectedKeys.includes('totalDailyWorks') || !selectedKeys.includes('completed'))) {
      validation.warnings.push('Completion percentage requires both Total Daily Works and Completed columns');
    }

    return validation;
  }, [formData.selectedColumns]);

  // Validate export settings
  const validateExportSettings = useCallback(() => {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate filename
    if (!formData.filename || formData.filename.trim().length === 0) {
      validation.isValid = false;
      validation.errors.push('Filename is required');
    }

    // Validate export format
    if (!formData.exportFormat) {
      validation.isValid = false;
      validation.errors.push('Export format is required');
    }

    // Performance warnings
    if (filteredData.length > 1000 && formData.exportFormat === 'pdf') {
      validation.warnings.push('PDF export may be slow for large datasets');
    }

    return validation;
  }, [formData.filename, formData.exportFormat, filteredData.length]);

  // Validate performance settings
  const validatePerformanceSettings = useCallback(() => {
    const selectedColumns = formData.selectedColumns?.filter(col => col.checked) || [];
    const dataSize = filteredData.length * selectedColumns.length;
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      performance: {
        dataSize,
        estimatedTime: Math.ceil(dataSize / 1000), // Rough estimate
        complexity: dataSize > 10000 ? 'high' : dataSize > 1000 ? 'medium' : 'low'
      }
    };

    if (dataSize > 50000) {
      validation.warnings.push('Large export may take several minutes to complete');
    }

    if (filteredData.length > 10000) {
      validation.warnings.push('Consider using date range filtering for better performance');
    }

    return validation;
  }, [formData.selectedColumns, filteredData.length]);

  // Memoized validation state
  const validationState = useMemo(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const hasStepErrors = stepErrors.some(stepErrorArray => stepErrorArray.length > 0);
    const hasBusinessRuleErrors = businessRuleErrors.length > 0;
    const hasWarnings = warnings.length > 0;
    
    return {
      isValid: !hasErrors && !hasStepErrors && !hasBusinessRuleErrors,
      hasErrors: hasErrors || hasStepErrors || hasBusinessRuleErrors,
      hasWarnings,
      errorCount: Object.keys(errors).length + 
                  stepErrors.flat().length + 
                  businessRuleErrors.length,
      warningCount: warnings.length,
      isValidating,
      lastValidated: lastValidation?.timestamp,
      canProceedToNext: canProceedToNextStep(currentStep),
      canExport: !hasErrors && !hasStepErrors && !hasBusinessRuleErrors && 
                 (formData.selectedColumns?.filter(col => col.checked) || []).length > 0
    };
  }, [errors, stepErrors, businessRuleErrors, warnings, isValidating, lastValidation, 
      canProceedToNextStep, currentStep, formData.selectedColumns]);

  // Auto-validate on data changes with debouncing
  useEffect(() => {
    if (!validateOnChange) return;

    const timeoutId = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        validateCurrentStep();
      }
    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, validateOnChange, debounceTime, validateCurrentStep]);

  // Validate business rules when data changes
  useEffect(() => {
    if (enableBusinessRules && filteredData.length > 0 && Object.keys(formData).length > 0) {
      const businessValidation = validateBusinessRules(formData, filteredData, userPermissions);
      setBusinessRuleErrors(businessValidation.blockers);
      setWarnings(businessValidation.warnings);
    }
  }, [filteredData, formData, userPermissions, enableBusinessRules]);

  return {
    // Validation state
    errors,
    stepErrors,
    businessRuleErrors,
    warnings,
    validationState,
    
    // Validation methods
    validateForm,
    validateCurrentStep,
    validateField,
    canProceedToNextStep,
    
    // Specialized validations
    validateColumnSelection,
    validateExportSettings,
    validatePerformanceSettings,
    
    // Utility methods
    isValidating,
    clearErrors: () => {
      setErrors({});
      setStepErrors([[], [], []]);
      setBusinessRuleErrors([]);
      setWarnings([]);
    },
    
    // Get errors for specific contexts
    getFieldError: (field) => errors[field],
    getStepErrors: (step) => stepErrors[step] || [],
    getBusinessRuleErrors: () => businessRuleErrors,
    getWarnings: () => warnings,
    
    // Validation helpers
    hasFieldError: (field) => !!errors[field],
    hasStepError: (step) => (stepErrors[step] || []).length > 0,
    hasBusinessRuleError: () => businessRuleErrors.length > 0,
    hasWarnings: () => warnings.length > 0,
    
    // Progress indicators
    getValidationProgress: () => {
      const totalSteps = 3;
      const completedSteps = stepErrors.filter(stepErrorArray => stepErrorArray.length === 0).length;
      return (completedSteps / totalSteps) * 100;
    },
    
    getColumnSelectionProgress: () => {
      const columnValidation = validateColumnSelection();
      return {
        selectedCount: columnValidation.info.selectedCount,
        totalCount: columnValidation.info.totalCount,
        percentage: (columnValidation.info.selectedCount / columnValidation.info.totalCount) * 100
      };
    }
  };
};

export default useDailyWorkSummaryDownloadFormValidation;
