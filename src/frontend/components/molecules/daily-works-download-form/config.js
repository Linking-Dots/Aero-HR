/**
 * Daily Works Download Form Configuration
 * Enterprise-grade configuration for construction daily works export system
 */

export const DAILY_WORKS_DOWNLOAD_CONFIG = {
    // Export columns configuration for daily works
    exportColumns: [
        {
            key: 'date',
            label: 'Date',
            required: true,
            type: 'date',
            description: 'Work completion date',
            exportFormat: {
                excel: { format: 'date', pattern: 'yyyy-mm-dd' },
                csv: { format: 'string' },
                pdf: { format: 'date', pattern: 'DD/MM/YYYY' }
            }
        },
        {
            key: 'number',
            label: 'RFI No.',
            required: true,
            type: 'string',
            description: 'Request for Information number',
            exportFormat: {
                excel: { format: 'text' },
                csv: { format: 'string' },
                pdf: { format: 'text' }
            }
        },
        {
            key: 'status',
            label: 'Status',
            required: true,
            type: 'enum',
            description: 'Current work status',
            values: ['pending', 'in_progress', 'completed', 'cancelled', 'resubmission'],
            exportFormat: {
                excel: { format: 'text', transform: 'capitalize' },
                csv: { format: 'string', transform: 'capitalize' },
                pdf: { format: 'text', transform: 'capitalize' }
            }
        },
        {
            key: 'assigned',
            label: 'Assigned',
            required: false,
            type: 'user',
            description: 'Assigned team member',
            exportFormat: {
                excel: { format: 'text', lookup: 'users' },
                csv: { format: 'string', lookup: 'users' },
                pdf: { format: 'text', lookup: 'users' }
            }
        },
        {
            key: 'incharge',
            label: 'In Charge',
            required: false,
            type: 'user',
            description: 'Person in charge of the work',
            exportFormat: {
                excel: { format: 'text', lookup: 'users' },
                csv: { format: 'string', lookup: 'users' },
                pdf: { format: 'text', lookup: 'users' }
            }
        },
        {
            key: 'type',
            label: 'Type',
            required: true,
            type: 'enum',
            description: 'Type of construction work',
            values: ['embankment', 'structure', 'pavement'],
            exportFormat: {
                excel: { format: 'text', transform: 'capitalize' },
                csv: { format: 'string', transform: 'capitalize' },
                pdf: { format: 'text', transform: 'capitalize' }
            }
        },
        {
            key: 'description',
            label: 'Description',
            required: true,
            type: 'text',
            description: 'Detailed work description',
            exportFormat: {
                excel: { format: 'text', wrapText: true },
                csv: { format: 'string', escape: true },
                pdf: { format: 'text', wordWrap: true }
            }
        },
        {
            key: 'location',
            label: 'Location',
            required: true,
            type: 'string',
            description: 'Work site location',
            exportFormat: {
                excel: { format: 'text' },
                csv: { format: 'string' },
                pdf: { format: 'text' }
            }
        },
        {
            key: 'side',
            label: 'Side',
            required: false,
            type: 'enum',
            description: 'Work side specification',
            values: ['left', 'right', 'center', 'both'],
            exportFormat: {
                excel: { format: 'text', transform: 'capitalize' },
                csv: { format: 'string', transform: 'capitalize' },
                pdf: { format: 'text', transform: 'capitalize' }
            }
        },
        {
            key: 'qty_layer',
            label: 'Quantity/Layer',
            required: false,
            type: 'string',
            description: 'Quantity or layer information',
            exportFormat: {
                excel: { format: 'text' },
                csv: { format: 'string' },
                pdf: { format: 'text' }
            }
        },
        {
            key: 'planned_time',
            label: 'Planned Time',
            required: false,
            type: 'datetime',
            description: 'Planned completion time',
            exportFormat: {
                excel: { format: 'datetime', pattern: 'yyyy-mm-dd hh:mm' },
                csv: { format: 'string' },
                pdf: { format: 'datetime', pattern: 'DD/MM/YYYY HH:mm' }
            }
        },
        {
            key: 'completion_time',
            label: 'Completion Time',
            required: false,
            type: 'datetime',
            description: 'Actual completion time',
            exportFormat: {
                excel: { format: 'datetime', pattern: 'yyyy-mm-dd hh:mm' },
                csv: { format: 'string' },
                pdf: { format: 'datetime', pattern: 'DD/MM/YYYY HH:mm' }
            }
        },
        {
            key: 'inspection_details',
            label: 'Results',
            required: false,
            type: 'text',
            description: 'Inspection results and details',
            exportFormat: {
                excel: { format: 'text', wrapText: true },
                csv: { format: 'string', escape: true },
                pdf: { format: 'text', wordWrap: true }
            }
        },
        {
            key: 'resubmission_count',
            label: 'Resubmission Count',
            required: false,
            type: 'number',
            description: 'Number of resubmissions',
            exportFormat: {
                excel: { format: 'number' },
                csv: { format: 'number' },
                pdf: { format: 'number' }
            }
        },
        {
            key: 'rfi_submission_date',
            label: 'RFI Submission Date',
            required: false,
            type: 'date',
            description: 'Date of RFI submission',
            exportFormat: {
                excel: { format: 'date', pattern: 'yyyy-mm-dd' },
                csv: { format: 'string' },
                pdf: { format: 'date', pattern: 'DD/MM/YYYY' }
            }
        }
    ],

    // Column categories for organization
    columnCategories: [
        {
            key: 'basic',
            label: 'Basic Information',
            description: 'Essential work identification data',
            columns: ['date', 'number', 'status', 'type'],
            defaultSelected: true
        },
        {
            key: 'personnel',
            label: 'Personnel',
            description: 'Team and responsibility assignments',
            columns: ['assigned', 'incharge'],
            defaultSelected: true
        },
        {
            key: 'details',
            label: 'Work Details',
            description: 'Detailed work specifications',
            columns: ['description', 'location', 'side', 'qty_layer'],
            defaultSelected: true
        },
        {
            key: 'timing',
            label: 'Time Tracking',
            description: 'Planned and actual timing information',
            columns: ['planned_time', 'completion_time'],
            defaultSelected: false
        },
        {
            key: 'quality',
            label: 'Quality Control',
            description: 'Inspection and quality assurance data',
            columns: ['inspection_details'],
            defaultSelected: false
        },
        {
            key: 'process',
            label: 'Process Management',
            description: 'Resubmission and RFI tracking',
            columns: ['resubmission_count', 'rfi_submission_date'],
            defaultSelected: false
        }
    ],

    // Export format configurations
    exportFormats: {
        excel: {
            label: 'Excel (.xlsx)',
            extension: '.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            recommended: true,
            features: {
                formatting: true,
                charts: true,
                formulas: true,
                multiSheet: true,
                filters: true,
                styling: true
            },
            limits: {
                maxRows: 1048576,
                maxColumns: 16384,
                maxFileSize: '100MB'
            }
        },
        csv: {
            label: 'CSV (.csv)',
            extension: '.csv',
            mimeType: 'text/csv',
            recommended: false,
            features: {
                formatting: false,
                charts: false,
                formulas: false,
                multiSheet: false,
                filters: false,
                styling: false
            },
            limits: {
                maxRows: 1000000,
                maxColumns: 1000,
                maxFileSize: '50MB'
            }
        },
        pdf: {
            label: 'PDF (.pdf)',
            extension: '.pdf',
            mimeType: 'application/pdf',
            recommended: false,
            features: {
                formatting: true,
                charts: false,
                formulas: false,
                multiSheet: false,
                filters: false,
                styling: true
            },
            limits: {
                maxRows: 10000,
                maxColumns: 20,
                maxFileSize: '25MB'
            }
        }
    },

    // Performance optimization modes
    performanceModes: {
        fast: {
            label: 'Fast Export',
            description: 'Quick export with minimal formatting',
            timeout: 30000, // 30 seconds
            batchSize: 1000,
            enableFormatting: false,
            enableValidation: false,
            enableCompression: false
        },
        balanced: {
            label: 'Balanced',
            description: 'Good balance of speed and features',
            timeout: 60000, // 1 minute
            batchSize: 500,
            enableFormatting: true,
            enableValidation: true,
            enableCompression: false
        },
        quality: {
            label: 'High Quality',
            description: 'Full formatting and validation',
            timeout: 120000, // 2 minutes
            batchSize: 250,
            enableFormatting: true,
            enableValidation: true,
            enableCompression: true
        }
    },

    // Performance monitoring thresholds
    performanceThresholds: {
        warning: {
            exportTime: 30, // seconds
            fileSize: 25 * 1024 * 1024, // 25MB
            recordCount: 10000
        },
        error: {
            exportTime: 120, // seconds
            fileSize: 100 * 1024 * 1024, // 100MB
            recordCount: 50000
        }
    },

    // Analytics configuration
    analytics: {
        enabled: true,
        events: {
            formOpened: 'daily_works_export_opened',
            columnSelected: 'daily_works_column_selected',
            formatChanged: 'daily_works_format_changed',
            exportStarted: 'daily_works_export_started',
            exportCompleted: 'daily_works_export_completed',
            exportFailed: 'daily_works_export_failed',
            validationError: 'daily_works_validation_error'
        },
        gdprCompliant: true,
        retentionDays: 90,
        batchSize: 10,
        flushInterval: 5000 // 5 seconds
    },

    // Default export settings
    defaults: {
        exportFormat: 'excel',
        performanceMode: 'balanced',
        selectedColumns: ['date', 'number', 'status', 'type', 'assigned', 'incharge', 'description', 'location'],
        filename: 'DailyWorks',
        includeMetadata: true,
        includeTimestamp: true
    },

    // Validation rules
    validation: {
        minSelectedColumns: 1,
        maxSelectedColumns: 15,
        maxRecordCount: 50000,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        requiredColumns: ['date', 'number', 'status'],
        filenamePattern: /^[a-zA-Z0-9_-]+$/,
        maxFilenameLength: 100
    },

    // API endpoints
    endpoints: {
        fetchData: 'dailyWorks.all',
        export: 'dailyWorks.export',
        validate: 'dailyWorks.validate-export'
    },

    // UI configuration
    ui: {
        maxPreviewRows: 5,
        maxPreviewColumns: 6,
        debounceDelay: 300,
        autoSaveDelay: 1000,
        progressUpdateInterval: 500
    }
};
