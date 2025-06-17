/**
 * Configuration for Daily Work Summary Download Form
 * Enterprise-grade construction data export system
 * 
 * Features:
 * - Column selection and customization
 * - Construction-specific metrics
 * - Performance analytics
 * - Export format options
 * - Data validation and filtering
 */

export const dailyWorkSummaryDownloadFormConfig = {
  // Form identification
  formId: 'daily-work-summary-download-form',
  version: '2.0.0',
  
  // Available export columns with construction-specific metrics
  exportColumns: [
    {
      key: 'date',
      label: 'Date',
      description: 'Work completion date',
      type: 'date',
      sortable: true,
      filterable: true,
      required: true,
      defaultChecked: true,
      category: 'basic',
      width: 120
    },
    {
      key: 'totalDailyWorks',
      label: 'Total Daily Works',
      description: 'Total number of work items for the day',
      type: 'number',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'metrics',
      width: 150,
      format: 'integer'
    },
    {
      key: 'resubmissions',
      label: 'Resubmissions',
      description: 'Number of work items requiring resubmission',
      type: 'number',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'quality',
      width: 130,
      format: 'integer'
    },
    {
      key: 'embankment',
      label: 'Embankment',
      description: 'Embankment work completed',
      type: 'number',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'worktype',
      width: 120,
      format: 'integer',
      icon: 'Mountain'
    },
    {
      key: 'structure',
      label: 'Structure',
      description: 'Structural work completed',
      type: 'number',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'worktype',
      width: 120,
      format: 'integer',
      icon: 'Building'
    },
    {
      key: 'pavement',
      label: 'Pavement',
      description: 'Pavement work completed',
      type: 'number',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'worktype',
      width: 120,
      format: 'integer',
      icon: 'Road'
    },
    {
      key: 'completed',
      label: 'Completed',
      description: 'Number of completed work items',
      type: 'number',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'status',
      width: 120,
      format: 'integer',
      icon: 'CheckCircle2'
    },
    {
      key: 'pending',
      label: 'Pending',
      description: 'Number of pending work items',
      type: 'calculated',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'status',
      width: 120,
      format: 'integer',
      icon: 'Clock',
      calculation: (row) => (row.totalDailyWorks || 0) - (row.completed || 0)
    },
    {
      key: 'completionPercentage',
      label: 'Completion Percentage',
      description: 'Percentage of work completed',
      type: 'calculated',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'metrics',
      width: 180,
      format: 'percentage',
      icon: 'TrendingUp',
      calculation: (row) => {
        const total = row.totalDailyWorks || 0;
        const completed = row.completed || 0;
        return total > 0 ? ((completed / total) * 100) : 0;
      }
    },
    {
      key: 'rfiSubmissions',
      label: 'RFI Submissions',
      description: 'Request for Information submissions',
      type: 'number',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'compliance',
      width: 150,
      format: 'integer',
      icon: 'FileText'
    },
    {
      key: 'rfiSubmissionPercentage',
      label: 'RFI Submission Percentage',
      description: 'Percentage of RFI submissions',
      type: 'calculated',
      sortable: true,
      filterable: true,
      required: false,
      defaultChecked: true,
      category: 'compliance',
      width: 200,
      format: 'percentage',
      icon: 'BarChart3',
      calculation: (row) => {
        const total = row.totalDailyWorks || 0;
        const rfi = row.rfiSubmissions || 0;
        return total > 0 ? ((rfi / total) * 100) : 0;
      }
    }
  ],

  // Column categories for organization
  columnCategories: {
    basic: {
      label: 'Basic Information',
      description: 'Essential work identification data',
      icon: 'Calendar',
      color: 'blue',
      order: 1
    },
    metrics: {
      label: 'Performance Metrics',
      description: 'Key performance indicators',
      icon: 'BarChart3',
      color: 'green',
      order: 2
    },
    worktype: {
      label: 'Work Types',
      description: 'Construction work categorization',
      icon: 'HardHat',
      color: 'orange',
      order: 3
    },
    status: {
      label: 'Status Tracking',
      description: 'Work completion status',
      icon: 'Activity',
      color: 'purple',
      order: 4
    },
    quality: {
      label: 'Quality Control',
      description: 'Quality assurance metrics',
      icon: 'ShieldCheck',
      color: 'red',
      order: 5
    },
    compliance: {
      label: 'Compliance & Documentation',
      description: 'Regulatory compliance tracking',
      icon: 'FileCheck',
      color: 'indigo',
      order: 6
    }
  },

  // Export format options
  exportFormats: {
    xlsx: {
      label: 'Excel (.xlsx)',
      description: 'Microsoft Excel format with formatting',
      icon: 'FileSpreadsheet',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
      features: ['formatting', 'charts', 'calculations'],
      default: true
    },
    csv: {
      label: 'CSV (.csv)',
      description: 'Comma-separated values for data analysis',
      icon: 'FileText',
      mimeType: 'text/csv',
      extension: 'csv',
      features: ['lightweight', 'universal'],
      default: false
    },
    pdf: {
      label: 'PDF (.pdf)',
      description: 'Portable document format for reports',
      icon: 'FileImage',
      mimeType: 'application/pdf',
      extension: 'pdf',
      features: ['formatted', 'printable'],
      default: false
    }
  },

  // Export options and settings
  exportOptions: {
    filename: {
      default: 'DailyWorkSummary',
      includeDate: true,
      includeTime: false,
      format: '{name}_{date}'
    },
    pagination: {
      enabled: true,
      defaultPageSize: 1000,
      maxPageSize: 5000
    },
    compression: {
      enabled: true,
      level: 6
    },
    formatting: {
      numberFormat: '#,##0',
      percentageFormat: '0.0%',
      dateFormat: 'yyyy-mm-dd',
      currency: 'INR'
    }
  },

  // Data processing settings
  dataProcessing: {
    batchSize: 100,
    maxRecords: 10000,
    timeout: 30000, // 30 seconds
    memoryLimit: '256MB',
    calculateFields: ['pending', 'completionPercentage', 'rfiSubmissionPercentage']
  },

  // Performance monitoring
  performance: {
    trackExportTime: true,
    trackDataSize: true,
    trackUserBehavior: true,
    alertThresholds: {
      exportTime: 10000, // 10 seconds
      dataSize: 50000, // 50MB
      recordCount: 5000
    }
  },

  // User interface settings
  ui: {
    layout: 'modal', // 'modal', 'sidebar', 'fullscreen'
    theme: 'glass-morphism',
    animations: true,
    compactMode: false,
    showPreview: true,
    maxPreviewRows: 10,
    columnGrouping: true,
    searchEnabled: true,
    sortEnabled: true,
    bulkActions: true
  },

  // Security and compliance
  security: {
    requireConfirmation: true,
    logExports: true,
    sensitiveDataMasking: false,
    accessControl: {
      roles: ['admin', 'manager', 'supervisor'],
      permissions: ['export_data', 'view_reports']
    }
  },

  // Analytics tracking
  analytics: {
    enabled: true,
    trackColumnSelection: true,
    trackExportFormats: true,
    trackPerformance: true,
    trackUserPreferences: true,
    gdprCompliant: true,
    anonymizeUserData: true
  },

  // Help and documentation
  help: {
    enabled: true,
    tooltips: true,
    quickHelp: true,
    documentation: {
      columnDescriptions: true,
      formatExplanations: true,
      troubleshooting: true
    }
  },

  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackFormat: 'csv',
    userFriendlyMessages: true,
    detailedLogging: true
  }
};

export default dailyWorkSummaryDownloadFormConfig;
