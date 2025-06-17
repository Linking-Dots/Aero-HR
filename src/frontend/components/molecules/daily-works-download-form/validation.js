import * as Yup from 'yup';
import { DAILY_WORKS_DOWNLOAD_CONFIG } from './config';

/**
 * Custom Yup validation methods for Daily Works Download Form
 */

// Add custom validation methods to Yup
Yup.addMethod(Yup.array, 'minSelectedColumns', function(min, message) {
    return this.test('min-selected-columns', message || `At least ${min} column(s) must be selected`, function(value) {
        if (!value || !Array.isArray(value)) return false;
        const selectedCount = value.filter(col => col.checked).length;
        return selectedCount >= min;
    });
});

Yup.addMethod(Yup.array, 'maxSelectedColumns', function(max, message) {
    return this.test('max-selected-columns', message || `Maximum ${max} columns can be selected`, function(value) {
        if (!value || !Array.isArray(value)) return true;
        const selectedCount = value.filter(col => col.checked).length;
        return selectedCount <= max;
    });
});

Yup.addMethod(Yup.array, 'requiredColumnsSelected', function(requiredColumns, message) {
    return this.test('required-columns', message || 'Required columns must be selected', function(value) {
        if (!value || !Array.isArray(value)) return false;
        const selectedKeys = value.filter(col => col.checked).map(col => col.key);
        return requiredColumns.every(req => selectedKeys.includes(req));
    });
});

Yup.addMethod(Yup.string, 'validExportFormat', function(validFormats, message) {
    return this.test('valid-export-format', message || 'Invalid export format', function(value) {
        if (!value) return false;
        return validFormats.includes(value);
    });
});

Yup.addMethod(Yup.array, 'validRecordCount', function(maxRecords, message) {
    return this.test('valid-record-count', message || `Cannot export more than ${maxRecords} records`, function(value) {
        if (!value || !Array.isArray(value)) return true;
        return value.length <= maxRecords;
    });
});

Yup.addMethod(Yup.string, 'safeFilename', function(message) {
    return this.test('safe-filename', message || 'Filename contains invalid characters', function(value) {
        if (!value) return true;
        const pattern = DAILY_WORKS_DOWNLOAD_CONFIG.validation.filenamePattern;
        return pattern.test(value);
    });
});

Yup.addMethod(Yup.object, 'businessRuleValidation', function(message) {
    return this.test('business-rules', message || 'Business rule validation failed', function(value) {
        const errors = [];
        
        // Rule 1: Status and completion time consistency
        if (value.status === 'completed' && !value.completion_time) {
            errors.push('Completed works must have completion time');
        }
        
        // Rule 2: Resubmission count validation
        if (value.resubmission_count > 0 && value.status !== 'resubmission') {
            errors.push('Works with resubmissions must have resubmission status');
        }
        
        // Rule 3: RFI submission date validation
        if (value.rfi_submission_date && value.status === 'pending') {
            errors.push('Pending works should not have RFI submission date');
        }
        
        // Rule 4: Planned vs completion time validation
        if (value.planned_time && value.completion_time) {
            const planned = new Date(value.planned_time);
            const completed = new Date(value.completion_time);
            if (completed < planned) {
                errors.push('Completion time cannot be before planned time');
            }
        }
        
        // Rule 5: Personnel assignment validation
        if (value.status === 'in_progress' && !value.assigned && !value.incharge) {
            errors.push('In-progress works must have assigned personnel');
        }
        
        if (errors.length > 0) {
            return this.createError({
                message: `Business rule violations: ${errors.join(', ')}`
            });
        }
        
        return true;
    });
});

/**
 * Main validation schema for Daily Works Download Form
 */
export const DailyWorksDownloadFormValidationSchema = Yup.object().shape({
    // Column selection validation
    selectedColumns: Yup.array()
        .of(Yup.object().shape({
            key: Yup.string().required(),
            label: Yup.string().required(),
            checked: Yup.boolean().required()
        }))
        .required('Column selection is required')
        .minSelectedColumns(
            DAILY_WORKS_DOWNLOAD_CONFIG.validation.minSelectedColumns,
            `At least ${DAILY_WORKS_DOWNLOAD_CONFIG.validation.minSelectedColumns} column must be selected`
        )
        .maxSelectedColumns(
            DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxSelectedColumns,
            `Maximum ${DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxSelectedColumns} columns can be selected`
        )
        .requiredColumnsSelected(
            DAILY_WORKS_DOWNLOAD_CONFIG.validation.requiredColumns,
            'Required columns (Date, RFI No., Status) must be selected'
        ),

    // Export format validation
    exportFormat: Yup.string()
        .required('Export format is required')
        .validExportFormat(
            Object.keys(DAILY_WORKS_DOWNLOAD_CONFIG.exportFormats),
            'Please select a valid export format'
        ),

    // Performance mode validation
    performanceMode: Yup.string()
        .required('Performance mode is required')
        .oneOf(
            Object.keys(DAILY_WORKS_DOWNLOAD_CONFIG.performanceModes),
            'Please select a valid performance mode'
        ),

    // Data validation
    data: Yup.array()
        .of(Yup.object().businessRuleValidation())
        .required('Data is required for export')
        .validRecordCount(
            DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxRecordCount,
            `Cannot export more than ${DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxRecordCount} records`
        ),

    // Filename validation
    filename: Yup.string()
        .max(
            DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxFilenameLength,
            `Filename must be ${DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxFilenameLength} characters or less`
        )
        .safeFilename('Filename can only contain letters, numbers, hyphens, and underscores'),

    // User permissions validation
    userPermissions: Yup.object().shape({
        canExport: Yup.boolean().oneOf([true], 'User does not have export permissions'),
        canAccessData: Yup.boolean().oneOf([true], 'User does not have data access permissions'),
        maxRecords: Yup.number().min(1, 'Invalid record limit')
    }),

    // Performance constraints validation
    performanceConstraints: Yup.object().shape({
        estimatedFileSize: Yup.number()
            .max(
                DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxFileSize,
                'Estimated file size exceeds maximum allowed size'
            ),
        estimatedExportTime: Yup.number()
            .max(
                DAILY_WORKS_DOWNLOAD_CONFIG.performanceThresholds.error.exportTime,
                'Estimated export time exceeds maximum allowed time'
            )
    })
});

/**
 * Step-by-step validation schemas for multi-step form
 */
export const DailyWorksDownloadFormStepValidationSchemas = {
    step1: Yup.object().shape({
        selectedColumns: DailyWorksDownloadFormValidationSchema.fields.selectedColumns,
        exportFormat: DailyWorksDownloadFormValidationSchema.fields.exportFormat,
        performanceMode: DailyWorksDownloadFormValidationSchema.fields.performanceMode
    }),

    step2: Yup.object().shape({
        data: DailyWorksDownloadFormValidationSchema.fields.data,
        userPermissions: DailyWorksDownloadFormValidationSchema.fields.userPermissions
    }),

    step3: Yup.object().shape({
        performanceConstraints: DailyWorksDownloadFormValidationSchema.fields.performanceConstraints,
        filename: DailyWorksDownloadFormValidationSchema.fields.filename
    })
};

/**
 * Business rule validation functions
 */
export const DailyWorksDownloadFormBusinessRules = {
    /**
     * Validate work status consistency
     */
    validateWorkStatus: (workItem) => {
        const errors = [];
        
        if (workItem.status === 'completed') {
            if (!workItem.completion_time) {
                errors.push('Completed work must have completion time');
            }
            if (workItem.planned_time && workItem.completion_time) {
                const planned = new Date(workItem.planned_time);
                const completed = new Date(workItem.completion_time);
                if (completed < planned) {
                    errors.push('Completion time cannot be before planned time');
                }
            }
        }
        
        return errors;
    },

    /**
     * Validate resubmission data
     */
    validateResubmissions: (workItem) => {
        const errors = [];
        
        if (workItem.resubmission_count > 0) {
            if (workItem.status !== 'resubmission' && workItem.status !== 'completed') {
                errors.push('Works with resubmissions must have appropriate status');
            }
        }
        
        if (workItem.status === 'resubmission' && (!workItem.resubmission_count || workItem.resubmission_count === 0)) {
            errors.push('Resubmission status requires resubmission count');
        }
        
        return errors;
    },

    /**
     * Validate personnel assignments
     */
    validatePersonnelAssignments: (workItem) => {
        const errors = [];
        
        if (workItem.status === 'in_progress') {
            if (!workItem.assigned && !workItem.incharge) {
                errors.push('In-progress works must have assigned personnel');
            }
        }
        
        return errors;
    },

    /**
     * Validate RFI submission data
     */
    validateRFISubmission: (workItem) => {
        const errors = [];
        
        if (workItem.rfi_submission_date) {
            if (workItem.status === 'pending') {
                errors.push('Pending works should not have RFI submission date');
            }
            
            const submissionDate = new Date(workItem.rfi_submission_date);
            const workDate = new Date(workItem.date);
            if (submissionDate < workDate) {
                errors.push('RFI submission date cannot be before work date');
            }
        }
        
        return errors;
    },

    /**
     * Validate work type and details consistency
     */
    validateWorkTypeConsistency: (workItem) => {
        const errors = [];
        
        if (workItem.type === 'embankment') {
            if (workItem.qty_layer && !workItem.qty_layer.toLowerCase().includes('layer')) {
                errors.push('Embankment works should specify layer information');
            }
        }
        
        if (workItem.type === 'structure') {
            if (!workItem.location) {
                errors.push('Structure works must specify location');
            }
        }
        
        return errors;
    },

    /**
     * Run all business rule validations
     */
    validateAll: (workItem) => {
        const allErrors = [
            ...DailyWorksDownloadFormBusinessRules.validateWorkStatus(workItem),
            ...DailyWorksDownloadFormBusinessRules.validateResubmissions(workItem),
            ...DailyWorksDownloadFormBusinessRules.validatePersonnelAssignments(workItem),
            ...DailyWorksDownloadFormBusinessRules.validateRFISubmission(workItem),
            ...DailyWorksDownloadFormBusinessRules.validateWorkTypeConsistency(workItem)
        ];
        
        return allErrors;
    }
};

/**
 * Data integrity validation
 */
export const DailyWorksDownloadFormDataIntegrity = {
    /**
     * Validate data completeness
     */
    validateDataCompleteness: (data, selectedColumns) => {
        const errors = [];
        const requiredColumns = selectedColumns
            .filter(col => col.checked && col.required)
            .map(col => col.key);
        
        const incompleteRecords = data.filter(record => {
            return requiredColumns.some(col => !record[col] && record[col] !== 0);
        });
        
        if (incompleteRecords.length > 0) {
            errors.push(`${incompleteRecords.length} record(s) missing required data`);
        }
        
        return errors;
    },

    /**
     * Validate data types
     */
    validateDataTypes: (data, columnConfig) => {
        const errors = [];
        
        data.forEach((record, index) => {
            columnConfig.forEach(column => {
                const value = record[column.key];
                if (value === null || value === undefined) return;
                
                switch (column.type) {
                    case 'date':
                        if (isNaN(Date.parse(value))) {
                            errors.push(`Row ${index + 1}: Invalid date in ${column.label}`);
                        }
                        break;
                    case 'datetime':
                        if (isNaN(Date.parse(value))) {
                            errors.push(`Row ${index + 1}: Invalid datetime in ${column.label}`);
                        }
                        break;
                    case 'number':
                        if (isNaN(Number(value))) {
                            errors.push(`Row ${index + 1}: Invalid number in ${column.label}`);
                        }
                        break;
                    case 'enum':
                        if (column.values && !column.values.includes(value)) {
                            errors.push(`Row ${index + 1}: Invalid value in ${column.label}`);
                        }
                        break;
                }
            });
        });
        
        return errors;
    },

    /**
     * Validate data consistency
     */
    validateDataConsistency: (data) => {
        const errors = [];
        
        // Check for duplicate RFI numbers
        const rfiNumbers = data.map(record => record.number).filter(Boolean);
        const duplicateRFIs = rfiNumbers.filter((item, index) => rfiNumbers.indexOf(item) !== index);
        
        if (duplicateRFIs.length > 0) {
            errors.push(`Duplicate RFI numbers found: ${[...new Set(duplicateRFIs)].join(', ')}`);
        }
        
        return errors;
    }
};
