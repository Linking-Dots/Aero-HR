/**
 * Daily Works Upload Form Validation Schema
 * 
 * Advanced validation schema for file uploads with file type validation,
 * data structure validation, and construction project-specific rules.
 * 
 * @module DailyWorksUploadFormValidation
 */

import * as Yup from 'yup';
import { dailyWorksUploadFormConfig } from './config.js';

// Custom validation methods for file uploads
Yup.addMethod(Yup.mixed, 'fileType', function (allowedTypes, message) {
  return this.test('file-type', message, function (value) {
    const { path, createError } = this;
    if (!value) return true; // Let required handle empty values
    
    if (value instanceof File) {
      const isValidType = allowedTypes.includes(value.type);
      return isValidType || createError({ 
        path, 
        message: message || `File type not supported. Allowed types: ${allowedTypes.join(', ')}` 
      });
    }
    
    return true;
  });
});

Yup.addMethod(Yup.mixed, 'fileSize', function (maxSize, message) {
  return this.test('file-size', message, function (value) {
    const { path, createError } = this;
    if (!value) return true; // Let required handle empty values
    
    if (value instanceof File) {
      const isValidSize = value.size <= maxSize;
      return isValidSize || createError({ 
        path, 
        message: message || `File size must be less than ${formatFileSize(maxSize)}` 
      });
    }
    
    return true;
  });
});

Yup.addMethod(Yup.array, 'validDataStructure', function (requiredColumns, message) {
  return this.test('data-structure', message, function (value) {
    const { path, createError } = this;
    if (!value || !Array.isArray(value)) return true;
    
    // Check if required columns are present
    if (value.length > 0) {
      const firstRow = value[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        return createError({ 
          path, 
          message: message || `Missing required columns: ${missingColumns.join(', ')}` 
        });
      }
    }
    
    return true;
  });
});

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File selection validation schema
const fileSelectionSchema = Yup.object().shape({
  file: Yup.mixed()
    .required('Please select a file to upload')
    .fileType(
      dailyWorksUploadFormConfig.validation.file.allowedTypes,
      'Please select a valid Excel (.xlsx, .xls) or CSV file'
    )
    .fileSize(
      dailyWorksUploadFormConfig.validation.file.maxSize,
      `File size must be less than ${formatFileSize(dailyWorksUploadFormConfig.validation.file.maxSize)}`
    ),
});

// Upload options validation schema
const uploadOptionsSchema = Yup.object().shape({
  duplicateHandling: Yup.string()
    .required('Please select how to handle duplicate records')
    .oneOf(['skip', 'replace', 'merge'], 'Invalid duplicate handling option'),
  
  validateData: Yup.boolean()
    .default(true),
  
  generateReport: Yup.boolean()
    .default(true),
  
  backupData: Yup.boolean()
    .default(true),
});

// Data validation schema (for imported data)
const dataValidationSchema = Yup.object().shape({
  data: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.date()
          .required('Date is required')
          .max(new Date(), 'Date cannot be in the future'),
        
        work_type: Yup.string()
          .required('Work type is required')
          .oneOf(
            dailyWorksUploadFormConfig.validation.data.workTypes,
            'Invalid work type'
          ),
        
        description: Yup.string()
          .required('Description is required')
          .min(5, 'Description must be at least 5 characters')
          .max(500, 'Description cannot exceed 500 characters'),
        
        quantity: Yup.number()
          .required('Quantity is required')
          .positive('Quantity must be positive')
          .max(999999, 'Quantity too large'),
        
        unit: Yup.string()
          .required('Unit is required')
          .max(50, 'Unit name too long'),
        
        rfi_number: Yup.string()
          .matches(/^RFI-\d{4}-\d{4}$/, 'RFI number format should be RFI-YYYY-NNNN')
          .optional(),
        
        project_id: Yup.number()
          .positive('Project ID must be positive')
          .optional(),
        
        location: Yup.string()
          .max(200, 'Location description too long')
          .optional(),
        
        weather: Yup.string()
          .max(100, 'Weather description too long')
          .optional(),
        
        supervisor: Yup.string()
          .max(100, 'Supervisor name too long')
          .optional(),
        
        notes: Yup.string()
          .max(1000, 'Notes too long')
          .optional(),
      })
    )
    .validDataStructure(
      dailyWorksUploadFormConfig.validation.data.requiredColumns,
      'File is missing required columns'
    )
    .max(
      dailyWorksUploadFormConfig.validation.data.maxRows,
      `Cannot import more than ${dailyWorksUploadFormConfig.validation.data.maxRows} rows`
    ),
});

// Complete form validation schema
export const dailyWorksUploadFormValidationSchema = Yup.object().shape({
  // File selection
  file: fileSelectionSchema.fields.file,
  
  // Upload options
  duplicateHandling: uploadOptionsSchema.fields.duplicateHandling,
  validateData: uploadOptionsSchema.fields.validateData,
  generateReport: uploadOptionsSchema.fields.generateReport,
  backupData: uploadOptionsSchema.fields.backupData,
  
  // Data validation (for preview/import step)
  data: dataValidationSchema.fields.data,
});

// Step-specific validation schemas
export const stepValidationSchemas = {
  0: fileSelectionSchema, // File selection
  1: dataValidationSchema, // Data validation
  2: uploadOptionsSchema, // Upload options
  3: Yup.object(), // Import (no additional validation needed)
};

// Field-level validation functions
export const fieldValidations = {
  file: async (value) => {
    try {
      await fileSelectionSchema.fields.file.validate(value);
      return null;
    } catch (error) {
      return error.message;
    }
  },

  duplicateHandling: async (value) => {
    try {
      await uploadOptionsSchema.fields.duplicateHandling.validate(value);
      return null;
    } catch (error) {
      return error.message;
    }
  },

  data: async (value) => {
    try {
      await dataValidationSchema.fields.data.validate(value);
      return null;
    } catch (error) {
      return error.message;
    }
  },
};

// File format validation
export const validateFileFormat = (file) => {
  const errors = [];
  const warnings = [];

  if (!file) {
    errors.push('No file selected');
    return { errors, warnings };
  }

  // Check file type
  const allowedTypes = dailyWorksUploadFormConfig.validation.file.allowedTypes;
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  const maxSize = dailyWorksUploadFormConfig.validation.file.maxSize;
  if (file.size > maxSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`);
  }

  // Check file size warnings
  const warningSize = maxSize * 0.8; // 80% of max size
  if (file.size > warningSize) {
    warnings.push('Large file detected. Upload may take longer than usual');
  }

  // Check file name
  if (file.name.length > 255) {
    errors.push('File name is too long');
  }

  return { errors, warnings };
};

// Data structure validation
export const validateDataStructure = (data) => {
  const errors = [];
  const warnings = [];
  const { requiredColumns, optionalColumns, maxRows } = dailyWorksUploadFormConfig.validation.data;

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('No data found in file');
    return { errors, warnings };
  }

  // Check row count
  if (data.length > maxRows) {
    errors.push(`Too many rows (${data.length}). Maximum allowed: ${maxRows}`);
  }

  // Check columns in first row
  const firstRow = data[0];
  const presentColumns = Object.keys(firstRow);
  
  // Check required columns
  const missingRequired = requiredColumns.filter(col => !presentColumns.includes(col));
  if (missingRequired.length > 0) {
    errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
  }

  // Check for extra columns
  const allKnownColumns = [...requiredColumns, ...optionalColumns];
  const extraColumns = presentColumns.filter(col => !allKnownColumns.includes(col));
  if (extraColumns.length > 0) {
    warnings.push(`Unknown columns found: ${extraColumns.join(', ')}`);
  }

  // Check missing optional columns
  const missingOptional = optionalColumns.filter(col => !presentColumns.includes(col));
  if (missingOptional.length > 0) {
    warnings.push(`Optional columns not found: ${missingOptional.join(', ')}`);
  }

  return { errors, warnings };
};

// Row-level data validation
export const validateRowData = (row, rowIndex) => {
  const errors = [];
  const warnings = [];

  try {
    // Validate individual row against schema
    const rowSchema = dataValidationSchema.fields.data.innerType;
    rowSchema.validateSync(row, { abortEarly: false });
  } catch (validationError) {
    if (validationError.inner) {
      validationError.inner.forEach(error => {
        errors.push(`Row ${rowIndex + 1}, ${error.path}: ${error.message}`);
      });
    } else {
      errors.push(`Row ${rowIndex + 1}: ${validationError.message}`);
    }
  }

  // Additional business rule checks
  if (row.date) {
    const workDate = new Date(row.date);
    const daysDiff = Math.floor((new Date() - workDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 30) {
      warnings.push(`Row ${rowIndex + 1}: Work date is more than 30 days old`);
    }
  }

  // Check for reasonable quantity values
  if (row.quantity && row.quantity > 10000) {
    warnings.push(`Row ${rowIndex + 1}: Very large quantity value (${row.quantity})`);
  }

  return { errors, warnings };
};

// Duplicate detection
export const detectDuplicates = (data) => {
  const duplicates = [];
  const seen = new Set();

  data.forEach((row, index) => {
    // Create a key based on date, work_type, and description
    const key = `${row.date}-${row.work_type}-${row.description}`;
    
    if (seen.has(key)) {
      duplicates.push({
        rowIndex: index,
        key,
        row,
      });
    } else {
      seen.add(key);
    }
  });

  return duplicates;
};

// Performance optimization for large file validation
export const createValidationWorker = () => {
  // For large files, validation can be moved to a web worker
  // This is a placeholder for worker implementation
  return {
    validateInWorker: (data) => {
      return new Promise((resolve) => {
        // Simulate async validation
        setTimeout(() => {
          const results = {
            errors: [],
            warnings: [],
            duplicates: detectDuplicates(data),
          };
          resolve(results);
        }, 100);
      });
    },
  };
};

export default dailyWorksUploadFormValidationSchema;
