/**
 * Daily Works Upload Form Hook
 * 
 * Core hook for managing file upload form state, file processing,
 * data validation, and upload progress tracking.
 * 
 * @module useDailyWorksUploadForm
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { dailyWorksUploadFormConfig } from '../config.js';

/**
 * Custom hook for daily works upload form management
 * 
 * @param {Object} config - Hook configuration
 * @param {Function} config.onFileSelect - File selection callback
 * @param {Function} config.onDataPreview - Data preview callback
 * @param {Function} config.onUploadComplete - Upload completion callback
 * @param {Function} config.onError - Error callback
 * @param {boolean} config.autoProcessFile - Auto-process file on selection
 * @param {number} config.previewRows - Number of rows to show in preview
 * 
 * @returns {Object} Form state and handlers
 */
export const useDailyWorksUploadForm = ({
  onFileSelect,
  onDataPreview,
  onUploadComplete,
  onError,
  autoProcessFile = true,
  previewRows = 10,
} = {}) => {
  // Form state
  const [formData, setFormData] = useState({
    file: null,
    duplicateHandling: 'skip',
    validateData: true,
    generateReport: true,
    backupData: true,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // File processing state
  const [fileInfo, setFileInfo] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [uploadStats, setUploadStats] = useState({
    totalRows: 0,
    processedRows: 0,
    errorRows: 0,
    warningRows: 0,
    duplicateRows: 0,
  });

  // Refs for file processing
  const fileReaderRef = useRef(null);
  const uploadAbortRef = useRef(null);
  const processingTimeoutRef = useRef(null);

  // File selection handler
  const handleFileSelect = useCallback((file) => {
    if (!file) {
      setFormData(prev => ({ ...prev, file: null }));
      setFileInfo(null);
      setParsedData(null);
      setPreviewData(null);
      setValidationResults(null);
      setError(null);
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setIsDirty(true);
    setError(null);

    // Set file info
    const info = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      extension: file.name.split('.').pop().toLowerCase(),
    };
    setFileInfo(info);

    // Trigger callback
    onFileSelect?.(file, info);

    // Auto-process if enabled
    if (autoProcessFile) {
      processFile(file);
    }
  }, [onFileSelect, autoProcessFile]);

  // File processing function
  const processFile = useCallback(async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Read file content
      const data = await readFileContent(file);
      setParsedData(data);

      // Generate preview
      const preview = data.slice(0, previewRows);
      setPreviewData(preview);

      // Update stats
      setUploadStats(prev => ({
        ...prev,
        totalRows: data.length,
        processedRows: 0,
        errorRows: 0,
        warningRows: 0,
        duplicateRows: 0,
      }));

      // Trigger preview callback
      onDataPreview?.(data, preview);

      // Move to next step if validation passes
      if (formData.validateData) {
        await validateFileData(data);
      }

    } catch (error) {
      setError(error);
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  }, [previewRows, onDataPreview, onError, formData.validateData]);

  // File content reading
  const readFileContent = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      fileReaderRef.current = reader;

      reader.onload = (event) => {
        try {
          const content = event.target.result;
          let data;

          if (file.type.includes('csv')) {
            data = parseCSV(content);
          } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
            data = parseExcel(content);
          } else {
            throw new Error('Unsupported file format');
          }

          resolve(data);
        } catch (error) {
          reject(new Error(`Failed to parse file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Read file based on type
      if (file.type.includes('csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }, []);

  // CSV parsing
  const parseCSV = useCallback((content) => {
    const lines = content.split('\n');
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  }, []);

  // Excel parsing (simplified - in real implementation, use a library like SheetJS)
  const parseExcel = useCallback((content) => {
    // This is a placeholder - in a real implementation, you would use
    // a library like SheetJS (xlsx) to parse Excel files
    throw new Error('Excel parsing requires SheetJS library integration');
  }, []);

  // Data validation
  const validateFileData = useCallback(async (data) => {
    try {
      const results = {
        errors: [],
        warnings: [],
        duplicates: [],
        summary: {
          totalRows: data.length,
          validRows: 0,
          errorRows: 0,
          warningRows: 0,
          duplicateRows: 0,
        },
      };

      // Validate each row
      data.forEach((row, index) => {
        const rowValidation = validateRow(row, index);
        if (rowValidation.errors.length > 0) {
          results.errors.push(...rowValidation.errors);
          results.summary.errorRows++;
        } else {
          results.summary.validRows++;
        }

        if (rowValidation.warnings.length > 0) {
          results.warnings.push(...rowValidation.warnings);
          results.summary.warningRows++;
        }
      });

      // Check for duplicates
      const duplicates = detectDuplicates(data);
      results.duplicates = duplicates;
      results.summary.duplicateRows = duplicates.length;

      setValidationResults(results);
      setUploadStats(prev => ({
        ...prev,
        processedRows: results.summary.validRows,
        errorRows: results.summary.errorRows,
        warningRows: results.summary.warningRows,
        duplicateRows: results.summary.duplicateRows,
      }));

      return results;
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }, []);

  // Row validation helper
  const validateRow = useCallback((row, index) => {
    const errors = [];
    const warnings = [];

    // Required field validation
    const requiredFields = dailyWorksUploadFormConfig.validation.data.requiredColumns;
    requiredFields.forEach(field => {
      if (!row[field] || row[field].toString().trim() === '') {
        errors.push(`Row ${index + 1}: ${field} is required`);
      }
    });

    // Date validation
    if (row.date) {
      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        errors.push(`Row ${index + 1}: Invalid date format`);
      } else if (date > new Date()) {
        errors.push(`Row ${index + 1}: Date cannot be in the future`);
      }
    }

    // Quantity validation
    if (row.quantity) {
      const quantity = parseFloat(row.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Row ${index + 1}: Quantity must be a positive number`);
      } else if (quantity > 999999) {
        warnings.push(`Row ${index + 1}: Very large quantity value`);
      }
    }

    // Work type validation
    if (row.work_type) {
      const validTypes = dailyWorksUploadFormConfig.validation.data.workTypes;
      if (!validTypes.includes(row.work_type.toLowerCase())) {
        errors.push(`Row ${index + 1}: Invalid work type`);
      }
    }

    return { errors, warnings };
  }, []);

  // Duplicate detection
  const detectDuplicates = useCallback((data) => {
    const seen = new Map();
    const duplicates = [];

    data.forEach((row, index) => {
      const key = `${row.date}-${row.work_type}-${row.description}`;
      
      if (seen.has(key)) {
        duplicates.push({
          rowIndex: index,
          duplicateOf: seen.get(key),
          row,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates;
  }, []);

  // Field change handler
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setError(null);
  }, []);

  // Step navigation
  const goToStep = useCallback((step) => {
    if (step < 0 || step >= dailyWorksUploadFormConfig.steps.length) {
      return false;
    }
    
    setCurrentStep(step);
    return true;
  }, []);

  const goToNextStep = useCallback(() => {
    return goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    return goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Progress calculation
  const getStepProgress = useCallback(() => {
    const totalSteps = dailyWorksUploadFormConfig.steps.length;
    return {
      current: currentStep + 1,
      total: totalSteps,
      percentage: Math.round(((currentStep + 1) / totalSteps) * 100),
    };
  }, [currentStep]);

  // Upload abort
  const abortUpload = useCallback(() => {
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
    }
    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    setIsProcessing(false);
    setUploadProgress(0);
  }, []);

  // Form reset
  const resetForm = useCallback(() => {
    setFormData({
      file: null,
      duplicateHandling: 'skip',
      validateData: true,
      generateReport: true,
      backupData: true,
    });
    setCurrentStep(0);
    setIsDirty(false);
    setIsProcessing(false);
    setUploadProgress(0);
    setError(null);
    setFileInfo(null);
    setParsedData(null);
    setPreviewData(null);
    setValidationResults(null);
    setUploadStats({
      totalRows: 0,
      processedRows: 0,
      errorRows: 0,
      warningRows: 0,
      duplicateRows: 0,
    });
  }, []);

  // Get current step data
  const getCurrentStepData = useCallback(() => {
    const stepConfig = dailyWorksUploadFormConfig.steps[currentStep];
    return {
      ...stepConfig,
      isFirst: currentStep === 0,
      isLast: currentStep === dailyWorksUploadFormConfig.steps.length - 1,
      canGoNext: currentStep < dailyWorksUploadFormConfig.steps.length - 1,
      canGoPrevious: currentStep > 0,
    };
  }, [currentStep]);

  // Get file validation status
  const getFileValidationStatus = useCallback(() => {
    if (!formData.file) {
      return { isValid: false, canProceed: false, message: 'No file selected' };
    }

    if (validationResults) {
      const hasErrors = validationResults.errors.length > 0;
      const hasWarnings = validationResults.warnings.length > 0;
      
      return {
        isValid: !hasErrors,
        canProceed: !hasErrors,
        hasWarnings,
        message: hasErrors ? 'File contains validation errors' : 
                hasWarnings ? 'File contains warnings but can proceed' : 
                'File validation passed',
        results: validationResults,
      };
    }

    return { isValid: true, canProceed: true, message: 'File ready for processing' };
  }, [formData.file, validationResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortUpload();
    };
  }, [abortUpload]);

  return {
    // Form state
    formData,
    currentStep,
    isDirty,
    isProcessing,
    uploadProgress,
    error,

    // File processing state
    fileInfo,
    parsedData,
    previewData,
    validationResults,
    uploadStats,

    // Form handlers
    handleFileSelect,
    handleFieldChange,
    processFile,
    abortUpload,

    // Step navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    getCurrentStepData,

    // Progress and status
    getStepProgress,
    getFileValidationStatus,

    // Utilities
    resetForm,
    validateFileData,

    // Configuration
    config: dailyWorksUploadFormConfig,
  };
};

export default useDailyWorksUploadForm;
