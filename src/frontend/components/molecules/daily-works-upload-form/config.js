/**
 * Daily Works Upload Form Configuration
 * 
 * Enterprise-grade file upload configuration for daily work data import
 * with validation, progress tracking, and error handling.
 * 
 * @module DailyWorksUploadFormConfig
 */

export const dailyWorksUploadFormConfig = {
  // Form identification and metadata
  formId: 'daily-works-upload-form',
  version: '1.0.0',
  
  // File upload specifications
  upload: {
    acceptedFileTypes: {
      excel: {
        mimeTypes: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
        ],
        extensions: ['.xlsx', '.xls'],
        maxSize: 10 * 1024 * 1024, // 10MB
        icon: 'Description',
        color: 'success',
        description: 'Excel spreadsheet with daily work data',
      },
      csv: {
        mimeTypes: ['text/csv'],
        extensions: ['.csv'],
        maxSize: 5 * 1024 * 1024, // 5MB
        icon: 'TableChart',
        color: 'info',
        description: 'Comma-separated values file',
      },
      pdf: {
        mimeTypes: ['application/pdf'],
        extensions: ['.pdf'],
        maxSize: 15 * 1024 * 1024, // 15MB
        icon: 'PictureAsPdf',
        color: 'error',
        description: 'PDF document (for reference only)',
        readonly: true, // Can't import data from PDF
      },
    },
    maxFileSize: 15 * 1024 * 1024, // 15MB overall limit
    maxFiles: 1,
    dropzoneText: {
      default: 'Drag and drop your daily works file here, or click to browse',
      active: 'Drop the file here...',
      reject: 'File type not supported',
      maxSize: 'File is too large',
    },
  },

  // Data validation rules
  validation: {
    file: {
      required: true,
      maxSize: 15 * 1024 * 1024,
      allowedTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/pdf',
      ],
    },
    data: {
      requiredColumns: [
        'date',
        'work_type',
        'description',
        'quantity',
        'unit',
      ],
      optionalColumns: [
        'rfi_number',
        'project_id',
        'location',
        'weather',
        'supervisor',
        'notes',
      ],
      maxRows: 10000,
      dateFormat: 'YYYY-MM-DD',
      workTypes: [
        'structure',
        'embankment',
        'pavement',
        'drainage',
        'utilities',
        'landscaping',
        'other',
      ],
    },
  },

  // Upload process steps
  steps: [
    {
      key: 'file_selection',
      label: 'File Selection',
      description: 'Choose the daily works file to upload',
      icon: 'Upload',
      required: true,
    },
    {
      key: 'validation',
      label: 'Data Validation',
      description: 'Validate file format and data structure',
      icon: 'CheckCircle',
      required: true,
    },
    {
      key: 'preview',
      label: 'Data Preview',
      description: 'Review data before importing',
      icon: 'Preview',
      required: true,
    },
    {
      key: 'import',
      label: 'Data Import',
      description: 'Import data into the system',
      icon: 'Save',
      required: true,
    },
  ],

  // Progress tracking
  progress: {
    showDetailedProgress: true,
    showFileSize: true,
    showUploadSpeed: true,
    showTimeRemaining: true,
    updateInterval: 100, // milliseconds
  },

  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    showDetailedErrors: true,
    logErrors: true,
    errorCategories: {
      network: 'Network connection error',
      fileFormat: 'Invalid file format',
      fileSize: 'File size exceeds limit',
      dataValidation: 'Data validation failed',
      serverError: 'Server processing error',
      permission: 'Insufficient permissions',
    },
  },

  // Data processing options
  processing: {
    batchSize: 100, // Process records in batches
    validateBeforeImport: true,
    duplicateHandling: 'skip', // 'skip', 'replace', 'merge'
    backupBeforeImport: true,
    generateReport: true,
  },

  // UI configuration
  ui: {
    theme: 'glass-morphism',
    maxWidth: 'lg',
    showProgress: true,
    animationDuration: 300,
    autoFocus: true,
    closeOnEscape: true,
    closeOnOverlayClick: false,
    showPreview: true,
    previewRows: 10,
    compactMode: false,
  },

  // Analytics and tracking
  analytics: {
    enabled: true,
    trackUserBehavior: true,
    trackPerformance: true,
    trackFileTypes: true,
    trackUploadSpeeds: true,
    sessionTimeout: 1800000, // 30 minutes
    eventCategories: {
      upload: 'daily_works_upload',
      validation: 'daily_works_validation',
      import: 'daily_works_import',
      error: 'daily_works_upload_error',
    },
  },

  // API endpoints
  api: {
    upload: '/api/daily-works/upload',
    validate: '/api/daily-works/validate',
    import: '/api/daily-works/import',
    preview: '/api/daily-works/preview',
    template: '/api/daily-works/template',
    progress: '/api/daily-works/upload-progress',
  },

  // Template information
  template: {
    downloadUrl: '/templates/daily-works-template.xlsx',
    description: 'Download the template file to see the required format',
    columns: [
      { name: 'date', type: 'date', required: true, example: '2025-06-18' },
      { name: 'work_type', type: 'select', required: true, example: 'structure' },
      { name: 'description', type: 'text', required: true, example: 'Foundation work for building A' },
      { name: 'quantity', type: 'number', required: true, example: '25.5' },
      { name: 'unit', type: 'text', required: true, example: 'cubic meters' },
      { name: 'rfi_number', type: 'text', required: false, example: 'RFI-2025-0001' },
      { name: 'project_id', type: 'number', required: false, example: '123' },
      { name: 'location', type: 'text', required: false, example: 'Block A, Zone 1' },
      { name: 'weather', type: 'text', required: false, example: 'Sunny, 25°C' },
      { name: 'supervisor', type: 'text', required: false, example: 'John Smith' },
      { name: 'notes', type: 'text', required: false, example: 'Additional observations' },
    ],
  },

  // Success and error messages
  messages: {
    success: {
      fileSelected: 'File selected successfully',
      validationPassed: 'File validation completed successfully',
      uploadComplete: 'Daily works uploaded successfully',
      importComplete: 'Data imported successfully',
    },
    errors: {
      noFileSelected: 'Please select a file to upload',
      invalidFileType: 'Invalid file type. Please select an Excel or CSV file',
      fileTooLarge: 'File size exceeds the maximum limit of {maxSize}',
      uploadFailed: 'Upload failed. Please try again',
      validationFailed: 'File validation failed',
      importFailed: 'Data import failed',
      networkError: 'Network error. Please check your connection',
      serverError: 'Server error. Please try again later',
    },
    warnings: {
      duplicateData: 'Duplicate records detected',
      missingColumns: 'Some optional columns are missing',
      dataQualityIssues: 'Data quality issues detected',
      largeFile: 'Large file detected. Upload may take longer',
    },
  },

  // Form field configurations
  fields: {
    file: {
      type: 'file',
      label: 'Daily Works File',
      placeholder: 'Select file...',
      required: true,
      validation: ['required', 'fileType', 'fileSize'],
      dropzone: true,
      multiple: false,
    },
    duplicateHandling: {
      type: 'radio',
      label: 'Duplicate Record Handling',
      options: [
        { value: 'skip', label: 'Skip duplicates', description: 'Leave existing records unchanged' },
        { value: 'replace', label: 'Replace duplicates', description: 'Update existing records with new data' },
        { value: 'merge', label: 'Merge data', description: 'Combine new data with existing records' },
      ],
      default: 'skip',
      required: true,
    },
    validateData: {
      type: 'checkbox',
      label: 'Validate data before import',
      description: 'Perform comprehensive validation checks',
      default: true,
      required: false,
    },
    generateReport: {
      type: 'checkbox',
      label: 'Generate import report',
      description: 'Create detailed report of import process',
      default: true,
      required: false,
    },
    backupData: {
      type: 'checkbox',
      label: 'Backup existing data',
      description: 'Create backup before importing new data',
      default: true,
      required: false,
    },
  },

  // Preview configuration
  preview: {
    maxRows: 10,
    maxColumns: 20,
    showRowNumbers: true,
    showColumnTypes: true,
    highlightErrors: true,
    highlightWarnings: true,
    allowEdit: false,
  },
};

export default dailyWorksUploadFormConfig;
