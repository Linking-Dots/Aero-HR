import { useState, useEffect, useMemo } from 'react';
import { dailyWorksUploadFormValidation } from '../validation.js';

/**
 * Hook for managing DailyWorksUploadForm validation
 * 
 * Features:
 * - Real-time form validation
 * - File validation with size and type checks
 * - Data structure validation for uploaded files
 * - Step-by-step validation for multi-step upload process
 * - Comprehensive error handling and messaging
 * - Performance optimized validation
 */
export const useDailyWorksUploadFormValidation = (
  formData = {},
  uploadedFiles = [],
  parsedData = [],
  currentStep = 0
) => {
  const [validationCache, setValidationCache] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [dataErrors, setDataErrors] = useState({});

  // Validate entire form
  const validateForm = async (data = formData, files = uploadedFiles, parsed = parsedData) => {
    setIsValidating(true);
    
    try {
      // Create cache key for performance
      const cacheKey = JSON.stringify({
        data,
        filesCount: files.length,
        parsedCount: parsed.length,
        step: currentStep
      });

      // Return cached validation if available
      if (validationCache[cacheKey] && Date.now() - validationCache[cacheKey].timestamp < 1000) {
        setIsValidating(false);
        return validationCache[cacheKey].result;
      }

      const validation = await dailyWorksUploadFormValidation.validate({
        ...data,
        files,
        parsedData: parsed
      }, { abortEarly: false });

      const result = {
        isValid: true,
        errors: {},
        fileErrors: {},
        dataErrors: {},
        warnings: [],
        suggestions: []
      };

      // Cache successful validation
      setValidationCache(prev => ({
        ...prev,
        [cacheKey]: {
          result,
          timestamp: Date.now()
        }
      }));

      setErrors({});
      setFileErrors({});
      setDataErrors({});
      setLastValidation(result);
      setIsValidating(false);

      return result;
    } catch (validationError) {
      const result = {
        isValid: false,
        errors: {},
        fileErrors: {},
        dataErrors: {},
        warnings: [],
        suggestions: []
      };

      // Process validation errors
      if (validationError.inner) {
        validationError.inner.forEach(error => {
          const path = error.path;
          
          if (path.startsWith('files[')) {
            // File-specific errors
            const fileIndex = parseInt(path.match(/files\[(\d+)\]/)?.[1] || '0');
            const field = path.split('.').pop();
            
            if (!result.fileErrors[fileIndex]) {
              result.fileErrors[fileIndex] = {};
            }
            result.fileErrors[fileIndex][field] = error.message;
          } else if (path.startsWith('parsedData[')) {
            // Data validation errors
            const dataIndex = parseInt(path.match(/parsedData\[(\d+)\]/)?.[1] || '0');
            const field = path.split('.').pop();
            
            if (!result.dataErrors[dataIndex]) {
              result.dataErrors[dataIndex] = {};
            }
            result.dataErrors[dataIndex][field] = error.message;
          } else {
            // General form errors
            result.errors[path] = error.message;
          }
        });
      }

      // Add contextual suggestions
      result.suggestions = generateValidationSuggestions(result, files, parsed);

      setErrors(result.errors);
      setFileErrors(result.fileErrors);
      setDataErrors(result.dataErrors);
      setLastValidation(result);
      setIsValidating(false);

      return result;
    }
  };

  // Validate specific field
  const validateField = async (fieldName, value) => {
    try {
      await dailyWorksUploadFormValidation.validateAt(fieldName, {
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
      const fieldError = error.message;
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError
      }));

      return { isValid: false, error: fieldError };
    }
  };

  // Validate uploaded files
  const validateFiles = async (files) => {
    const fileValidationResults = {};
    const globalFileErrors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileResult = {
        isValid: true,
        errors: {},
        warnings: [],
        suggestions: []
      };

      try {
        // File size validation
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          fileResult.errors.size = 'File size exceeds 50MB limit';
          fileResult.isValid = false;
        }

        // File type validation
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'application/pdf'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          fileResult.errors.type = 'File type not supported. Please use Excel, CSV, or PDF files.';
          fileResult.isValid = false;
        }

        // File name validation
        if (file.name.length > 255) {
          fileResult.errors.name = 'File name is too long (max 255 characters)';
          fileResult.isValid = false;
        }

        // Check for potential issues
        if (file.name.includes(' ')) {
          fileResult.warnings.push('File name contains spaces - consider using underscores');
        }

        if (!file.name.match(/\.(xlsx|xls|csv|pdf)$/i)) {
          fileResult.warnings.push('File extension not clearly indicated');
        }

        fileValidationResults[i] = fileResult;
      } catch (error) {
        fileResult.isValid = false;
        fileResult.errors.general = 'Failed to validate file';
        fileValidationResults[i] = fileResult;
      }
    }

    // Check for duplicate files
    const fileNames = files.map(f => f.name.toLowerCase());
    const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      globalFileErrors.push(`Duplicate files detected: ${duplicates.join(', ')}`);
    }

    setFileErrors(fileValidationResults);
    
    return {
      isValid: Object.values(fileValidationResults).every(r => r.isValid) && globalFileErrors.length === 0,
      fileResults: fileValidationResults,
      globalErrors: globalFileErrors
    };
  };

  // Validate parsed data structure
  const validateParsedData = async (data, expectedStructure) => {
    const dataValidationResults = {};
    const globalDataErrors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowResult = {
        isValid: true,
        errors: {},
        warnings: [],
        suggestions: []
      };

      try {
        // Required field validation
        expectedStructure.required.forEach(field => {
          if (!row[field] || row[field].toString().trim() === '') {
            rowResult.errors[field] = `${field} is required`;
            rowResult.isValid = false;
          }
        });

        // Data type validation
        Object.entries(expectedStructure.types || {}).forEach(([field, type]) => {
          if (row[field] && !validateDataType(row[field], type)) {
            rowResult.errors[field] = `${field} must be a valid ${type}`;
            rowResult.isValid = false;
          }
        });

        // Business rule validation
        if (expectedStructure.businessRules) {
          expectedStructure.businessRules.forEach(rule => {
            if (!rule.validate(row)) {
              rowResult.errors[rule.field] = rule.message;
              rowResult.isValid = false;
            }
          });
        }

        // Generate suggestions for common issues
        if (row.date && !isValidDate(row.date)) {
          rowResult.suggestions.push('Check date format (expected: YYYY-MM-DD)');
        }

        if (row.quantity && parseFloat(row.quantity) <= 0) {
          rowResult.warnings.push('Quantity should be greater than 0');
        }

        dataValidationResults[i] = rowResult;
      } catch (error) {
        rowResult.isValid = false;
        rowResult.errors.general = 'Failed to validate row data';
        dataValidationResults[i] = rowResult;
      }
    }

    // Check for duplicate entries
    const duplicateCheck = checkForDuplicateEntries(data);
    if (duplicateCheck.hasDuplicates) {
      globalDataErrors.push(`Duplicate entries found at rows: ${duplicateCheck.duplicateRows.join(', ')}`);
    }

    setDataErrors(dataValidationResults);
    
    return {
      isValid: Object.values(dataValidationResults).every(r => r.isValid) && globalDataErrors.length === 0,
      rowResults: dataValidationResults,
      globalErrors: globalDataErrors
    };
  };

  // Validate current step
  const validateStep = async (step = currentStep) => {
    const stepValidation = {
      isValid: true,
      errors: [],
      canProceed: false
    };

    switch (step) {
      case 0: // File selection
        if (uploadedFiles.length === 0) {
          stepValidation.errors.push('Please select at least one file to upload');
          stepValidation.isValid = false;
        } else {
          const fileValidation = await validateFiles(uploadedFiles);
          if (!fileValidation.isValid) {
            stepValidation.errors.push(...fileValidation.globalErrors);
            stepValidation.isValid = false;
          }
        }
        break;

      case 1: // Data preview and validation
        if (parsedData.length === 0) {
          stepValidation.errors.push('No data found in uploaded files');
          stepValidation.isValid = false;
        } else {
          // Check if data structure is valid
          const hasRequiredColumns = checkRequiredColumns(parsedData[0]);
          if (!hasRequiredColumns.isValid) {
            stepValidation.errors.push(`Missing required columns: ${hasRequiredColumns.missing.join(', ')}`);
            stepValidation.isValid = false;
          }
        }
        break;

      case 2: // Final confirmation
        const formValidation = await validateForm();
        if (!formValidation.isValid) {
          stepValidation.errors.push('Please correct all validation errors before proceeding');
          stepValidation.isValid = false;
        }
        break;

      default:
        stepValidation.isValid = true;
    }

    stepValidation.canProceed = stepValidation.isValid;
    return stepValidation;
  };

  // Generate validation suggestions
  const generateValidationSuggestions = (validationResult, files, data) => {
    const suggestions = [];

    if (files.length === 0) {
      suggestions.push('Start by selecting files to upload using the file picker or drag-and-drop area');
    }

    if (files.length > 10) {
      suggestions.push('Consider uploading files in smaller batches for better performance');
    }

    if (data.length > 1000) {
      suggestions.push('Large datasets detected - processing may take longer than usual');
    }

    Object.keys(validationResult.errors).forEach(field => {
      if (field === 'project') {
        suggestions.push('Make sure to select a valid project from the dropdown');
      }
      if (field === 'workType') {
        suggestions.push('Specify the type of work being uploaded (structure, embankment, etc.)');
      }
    });

    return suggestions;
  };

  // Helper functions
  const validateDataType = (value, type) => {
    switch (type) {
      case 'number':
        return !isNaN(parseFloat(value));
      case 'date':
        return isValidDate(value);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true;
    }
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const checkForDuplicateEntries = (data) => {
    const seen = new Set();
    const duplicateRows = [];

    data.forEach((row, index) => {
      const key = `${row.date}-${row.workType}-${row.location}`;
      if (seen.has(key)) {
        duplicateRows.push(index + 1);
      } else {
        seen.add(key);
      }
    });

    return {
      hasDuplicates: duplicateRows.length > 0,
      duplicateRows
    };
  };

  const checkRequiredColumns = (firstRow) => {
    const required = ['date', 'workType', 'location', 'quantity'];
    const available = Object.keys(firstRow || {});
    const missing = required.filter(col => !available.includes(col));

    return {
      isValid: missing.length === 0,
      missing,
      available
    };
  };

  // Memoized validation state
  const validationState = useMemo(() => ({
    isValid: Object.keys(errors).length === 0 && 
             Object.keys(fileErrors).length === 0 && 
             Object.keys(dataErrors).length === 0,
    hasErrors: Object.keys(errors).length > 0 || 
               Object.keys(fileErrors).length > 0 || 
               Object.keys(dataErrors).length > 0,
    errorCount: Object.keys(errors).length + 
                Object.keys(fileErrors).length + 
                Object.keys(dataErrors).length,
    isValidating,
    lastValidated: lastValidation?.timestamp
  }), [errors, fileErrors, dataErrors, isValidating, lastValidation]);

  // Auto-validate on data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData || uploadedFiles.length > 0 || parsedData.length > 0) {
        validateForm();
      }
    }, 300); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [formData, uploadedFiles, parsedData]);

  return {
    // Validation state
    errors,
    fileErrors,
    dataErrors,
    validationState,
    
    // Validation methods
    validateForm,
    validateField,
    validateFiles,
    validateParsedData,
    validateStep,
    
    // Utility methods
    isValidating,
    clearErrors: () => {
      setErrors({});
      setFileErrors({});
      setDataErrors({});
    },
    
    // Get errors for specific contexts
    getFieldError: (field) => errors[field],
    getFileError: (fileIndex, field) => fileErrors[fileIndex]?.[field],
    getDataError: (rowIndex, field) => dataErrors[rowIndex]?.[field],
    
    // Validation helpers
    hasFieldError: (field) => !!errors[field],
    hasFileError: (fileIndex) => !!fileErrors[fileIndex] && Object.keys(fileErrors[fileIndex]).length > 0,
    hasDataError: (rowIndex) => !!dataErrors[rowIndex] && Object.keys(dataErrors[rowIndex]).length > 0,
  };
};

export default useDailyWorksUploadFormValidation;
