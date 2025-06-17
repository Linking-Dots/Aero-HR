import * as Yup from 'yup';
import { dailyWorkSummaryDownloadFormConfig } from './config.js';

/**
 * Validation schema for Daily Work Summary Download Form
 * 
 * Features:
 * - Column selection validation
 * - Export format validation
 * - Data range validation
 * - File size and performance validation
 * - Construction industry compliance
 */

// Custom validation methods
Yup.addMethod(Yup.array, 'minSelectedColumns', function(min, message) {
  return this.test('min-selected-columns', message || `At least ${min} columns must be selected`, function(value) {
    if (!value) return false;
    const selectedCount = value.filter(col => col.checked).length;
    return selectedCount >= min;
  });
});

Yup.addMethod(Yup.array, 'maxSelectedColumns', function(max, message) {
  return this.test('max-selected-columns', message || `Maximum ${max} columns can be selected`, function(value) {
    if (!value) return true;
    const selectedCount = value.filter(col => col.checked).length;
    return selectedCount <= max;
  });
});

Yup.addMethod(Yup.string, 'validExportFormat', function(message) {
  return this.test('valid-export-format', message || 'Invalid export format', function(value) {
    if (!value) return false;
    const validFormats = Object.keys(dailyWorkSummaryDownloadFormConfig.exportFormats);
    return validFormats.includes(value);
  });
});

Yup.addMethod(Yup.number, 'validRecordCount', function(message) {
  return this.test('valid-record-count', message || 'Invalid record count for export', function(value) {
    if (value === undefined || value === null) return true;
    const maxRecords = dailyWorkSummaryDownloadFormConfig.dataProcessing.maxRecords;
    return value >= 0 && value <= maxRecords;
  });
});

Yup.addMethod(Yup.string, 'safeFilename', function(message) {
  return this.test('safe-filename', message || 'Filename contains invalid characters', function(value) {
    if (!value) return true;
    // Check for invalid filename characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    return !invalidChars.test(value);
  });
});

// Main validation schema
export const dailyWorkSummaryDownloadFormValidation = Yup.object().shape({
  // Column selection validation
  selectedColumns: Yup.array()
    .of(Yup.object().shape({
      key: Yup.string().required('Column key is required'),
      label: Yup.string().required('Column label is required'),
      checked: Yup.boolean().required('Column checked state is required'),
      required: Yup.boolean().default(false)
    }))
    .minSelectedColumns(1, 'At least one column must be selected for export')
    .maxSelectedColumns(20, 'Too many columns selected. Maximum 20 columns allowed')
    .test('required-columns-included', 'Required columns must be selected', function(value) {
      if (!value) return false;
      
      const requiredColumns = dailyWorkSummaryDownloadFormConfig.exportColumns
        .filter(col => col.required)
        .map(col => col.key);
      
      const selectedKeys = value
        .filter(col => col.checked)
        .map(col => col.key);
      
      return requiredColumns.every(key => selectedKeys.includes(key));
    })
    .required('Column selection is required'),

  // Export format validation
  exportFormat: Yup.string()
    .validExportFormat('Please select a valid export format')
    .required('Export format is required'),

  // Filename validation
  filename: Yup.string()
    .min(1, 'Filename cannot be empty')
    .max(100, 'Filename is too long (maximum 100 characters)')
    .safeFilename('Filename contains invalid characters')
    .matches(/^[a-zA-Z0-9_\-\s]+$/, 'Filename can only contain letters, numbers, spaces, hyphens, and underscores')
    .default('DailyWorkSummary'),

  // Data range validation
  dateRange: Yup.object().shape({
    startDate: Yup.date()
      .nullable()
      .max(new Date(), 'Start date cannot be in the future'),
    endDate: Yup.date()
      .nullable()
      .max(new Date(), 'End date cannot be in the future')
      .when('startDate', (startDate, schema) => 
        startDate ? schema.min(startDate, 'End date must be after start date') : schema
      )
  }).nullable(),

  // Record count validation (for performance)
  estimatedRecordCount: Yup.number()
    .validRecordCount('Record count exceeds maximum allowed limit')
    .nullable(),

  // Export options validation
  exportOptions: Yup.object().shape({
    includeHeaders: Yup.boolean().default(true),
    includeCalculatedFields: Yup.boolean().default(true),
    compressOutput: Yup.boolean().default(false),
    separateWorkTypes: Yup.boolean().default(false)
  }).default({}),

  // Performance settings validation
  performanceSettings: Yup.object().shape({
    batchSize: Yup.number()
      .min(10, 'Batch size must be at least 10')
      .max(1000, 'Batch size cannot exceed 1000')
      .default(100),
    timeout: Yup.number()
      .min(5000, 'Timeout must be at least 5 seconds')
      .max(300000, 'Timeout cannot exceed 5 minutes')
      .default(30000)
  }).default({})
});

// Validation for specific use cases
export const quickExportValidation = Yup.object().shape({
  selectedColumns: dailyWorkSummaryDownloadFormValidation.fields.selectedColumns,
  exportFormat: dailyWorkSummaryDownloadFormValidation.fields.exportFormat
});

export const advancedExportValidation = dailyWorkSummaryDownloadFormValidation;

// Step-by-step validation schemas
export const stepValidationSchemas = {
  columnSelection: Yup.object().shape({
    selectedColumns: dailyWorkSummaryDownloadFormValidation.fields.selectedColumns
  }),
  
  formatOptions: Yup.object().shape({
    exportFormat: dailyWorkSummaryDownloadFormValidation.fields.exportFormat,
    filename: dailyWorkSummaryDownloadFormValidation.fields.filename,
    exportOptions: dailyWorkSummaryDownloadFormValidation.fields.exportOptions
  }),
  
  confirmation: Yup.object().shape({
    estimatedRecordCount: dailyWorkSummaryDownloadFormValidation.fields.estimatedRecordCount,
    performanceSettings: dailyWorkSummaryDownloadFormValidation.fields.performanceSettings
  })
};

// Validate specific step
export const validateStep = async (step, data) => {
  try {
    const schemas = {
      0: stepValidationSchemas.columnSelection,
      1: stepValidationSchemas.formatOptions,
      2: stepValidationSchemas.confirmation
    };

    const schema = schemas[step];
    if (!schema) {
      return { isValid: false, errors: { step: 'Invalid step' } };
    }

    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };

  } catch (validationError) {
    const errors = {};
    
    if (validationError.inner) {
      validationError.inner.forEach(error => {
        errors[error.path] = error.message;
      });
    } else {
      errors.general = validationError.message;
    }

    return { isValid: false, errors };
  }
};

// Business rules validation
export const validateBusinessRules = (data, filteredData = [], userPermissions = {}) => {
  const violations = [];
  const warnings = [];

  // Check data size limits
  if (filteredData.length > dailyWorkSummaryDownloadFormConfig.dataProcessing.maxRecords) {
    violations.push(`Data set too large: ${filteredData.length} records exceeds maximum of ${dailyWorkSummaryDownloadFormConfig.dataProcessing.maxRecords}`);
  }

  // Check for performance warnings
  if (filteredData.length > 1000) {
    warnings.push('Large data set may take longer to export');
  }

  // Check column selection efficiency
  const selectedCount = (data.selectedColumns || []).filter(col => col.checked).length;
  if (selectedCount > 10) {
    warnings.push('Many columns selected may impact export performance');
  }

  // Check user permissions
  if (!userPermissions.canExportData) {
    violations.push('User does not have permission to export data');
  }

  // Check for required column combinations
  const selectedKeys = (data.selectedColumns || [])
    .filter(col => col.checked)
    .map(col => col.key);

  if (selectedKeys.includes('completionPercentage') && 
      !selectedKeys.includes('totalDailyWorks') && 
      !selectedKeys.includes('completed')) {
    warnings.push('Completion percentage requires Total Daily Works and Completed columns for accuracy');
  }

  // Check date range reasonableness
  if (data.dateRange?.startDate && data.dateRange?.endDate) {
    const daysDiff = Math.abs(new Date(data.dateRange.endDate) - new Date(data.dateRange.startDate)) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      warnings.push('Date range spans more than one year, consider filtering for better performance');
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    blockers: violations,
    suggestions: warnings
  };
};

// Get validation error message with context
export const getValidationErrorMessage = (error, context = {}) => {
  const field = context.field || error.path || 'unknown';
  const value = context.value;
  const message = error.message;

  // Customize messages based on field and context
  const customMessages = {
    selectedColumns: {
      'minSelectedColumns': 'Please select at least one column to export your construction data.',
      'maxSelectedColumns': 'Too many columns selected. Please reduce selection for optimal performance.',
      'required-columns-included': 'Date column is required for construction timeline tracking.'
    },
    exportFormat: {
      'validExportFormat': 'Please choose a supported export format (Excel, CSV, or PDF).',
      'required': 'Export format selection is required to proceed.'
    },
    filename: {
      'safeFilename': 'Filename contains special characters that are not allowed in file names.',
      'matches': 'Please use only letters, numbers, spaces, hyphens, and underscores in filename.',
      'max': 'Filename is too long. Please use a shorter name.'
    }
  };

  // Return custom message if available
  if (customMessages[field] && customMessages[field][error.type || 'default']) {
    return customMessages[field][error.type || 'default'];
  }

  // Return enhanced generic message
  const enhancedMessages = {
    'required': `${field.charAt(0).toUpperCase() + field.slice(1)} is required for export.`,
    'min': `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${error.params?.min} characters.`,
    'max': `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${error.params?.max} characters.`,
    'oneOf': `Please select a valid option for ${field}.`
  };

  return enhancedMessages[error.type] || message || `Invalid ${field}`;
};

// Export validation utilities
export const validateExportData = (data) => {
  // Validate data structure
  if (!Array.isArray(data)) {
    return { isValid: false, error: 'Export data must be an array' };
  }

  // Check for empty data
  if (data.length === 0) {
    return { isValid: false, error: 'No data available for export' };
  }

  // Validate data consistency
  const firstRow = data[0];
  const requiredFields = ['date'];
  
  for (const field of requiredFields) {
    if (!(field in firstRow)) {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }

  return { isValid: true };
};

export default dailyWorkSummaryDownloadFormValidation;
