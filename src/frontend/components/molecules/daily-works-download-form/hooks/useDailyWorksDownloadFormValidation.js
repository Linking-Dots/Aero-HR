import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    DailyWorksDownloadFormValidationSchema,
    DailyWorksDownloadFormStepValidationSchemas,
    DailyWorksDownloadFormBusinessRules,
    DailyWorksDownloadFormDataIntegrity
} from '../validation';
import { DAILY_WORKS_DOWNLOAD_CONFIG } from '../config';

/**
 * Validation hook for Daily Works Download Form
 * Provides comprehensive validation including business rules and data integrity checks
 */
export const useDailyWorksDownloadFormValidation = ({ 
    selectedColumns = [], 
    exportFormat = 'excel',
    performanceMode = 'balanced',
    data = [],
    users = [],
    filename = '',
    userPermissions = null
}) => {
    // Validation state
    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [businessRuleErrors, setBusinessRuleErrors] = useState([]);
    const [dataIntegrityErrors, setDataIntegrityErrors] = useState([]);
    const [performanceWarnings, setPerformanceWarnings] = useState([]);
    const [securityChecks, setSecurityChecks] = useState({
        dataAccess: false,
        fileGeneration: false,
        dataPrivacy: false
    });

    // Step validation state
    const [stepValidation, setStepValidation] = useState({
        currentStep: null,
        completedSteps: 0,
        stepErrors: {},
        stepWarnings: {}
    });

    // Validation caching for performance
    const [validationCache, setValidationCache] = useState(new Map());
    const [lastValidationTime, setLastValidationTime] = useState(null);

    // Create validation data object
    const validationData = useMemo(() => ({
        selectedColumns,
        exportFormat,
        performanceMode,
        data,
        filename,
        userPermissions: userPermissions || {
            canExport: true,
            canAccessData: true,
            maxRecords: DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxRecordCount
        },
        performanceConstraints: {
            estimatedFileSize: calculateEstimatedFileSize(),
            estimatedExportTime: calculateEstimatedExportTime()
        }
    }), [selectedColumns, exportFormat, performanceMode, data, filename, userPermissions]);

    // Calculate estimated file size
    function calculateEstimatedFileSize() {
        const recordCount = data.length;
        const columnCount = selectedColumns.filter(col => col.checked).length;
        const avgDataSize = 50; // Average bytes per field
        const formatOverhead = exportFormat === 'excel' ? 1.8 : 1.1;
        return Math.round(recordCount * columnCount * avgDataSize * formatOverhead);
    }

    // Calculate estimated export time
    function calculateEstimatedExportTime() {
        const recordCount = data.length;
        const columnCount = selectedColumns.filter(col => col.checked).length;
        const baseFactor = 0.001;
        const formatMultiplier = exportFormat === 'excel' ? 2 : 1;
        const modeConfig = DAILY_WORKS_DOWNLOAD_CONFIG.performanceModes[performanceMode];
        const modeMultiplier = modeConfig?.enableFormatting ? 1.5 : 1;
        
        return Math.max(1, Math.round(recordCount * columnCount * baseFactor * formatMultiplier * modeMultiplier));
    }

    // Main validation function
    const validateForm = useCallback(async (useCache = true) => {
        const cacheKey = JSON.stringify(validationData);
        
        // Check cache first
        if (useCache && validationCache.has(cacheKey)) {
            const cached = validationCache.get(cacheKey);
            setIsValid(cached.isValid);
            setErrors(cached.errors);
            setWarnings(cached.warnings);
            setBusinessRuleErrors(cached.businessRuleErrors);
            setDataIntegrityErrors(cached.dataIntegrityErrors);
            setPerformanceWarnings(cached.performanceWarnings);
            return cached;
        }

        const validationStart = Date.now();
        
        try {
            // Schema validation
            await DailyWorksDownloadFormValidationSchema.validate(validationData, { abortEarly: false });
            
            // Business rule validation
            const businessErrors = validateBusinessRules();
            
            // Data integrity validation
            const integrityErrors = validateDataIntegrity();
            
            // Performance validation
            const perfWarnings = validatePerformance();
            
            // Security validation
            const securityResult = validateSecurity();
            
            // Compile all errors and warnings
            const allErrors = [...businessErrors, ...integrityErrors];
            const allWarnings = [...perfWarnings];
            
            const result = {
                isValid: allErrors.length === 0,
                errors: [],
                warnings: allWarnings,
                businessRuleErrors: businessErrors,
                dataIntegrityErrors: integrityErrors,
                performanceWarnings: perfWarnings,
                securityChecks: securityResult
            };
            
            // Update state
            setIsValid(result.isValid);
            setErrors(result.errors);
            setWarnings(result.warnings);
            setBusinessRuleErrors(result.businessRuleErrors);
            setDataIntegrityErrors(result.dataIntegrityErrors);
            setPerformanceWarnings(result.performanceWarnings);
            setSecurityChecks(result.securityChecks);
            
            // Cache result
            if (validationCache.size > 50) {
                validationCache.clear(); // Prevent memory leaks
            }
            validationCache.set(cacheKey, result);
            setValidationCache(new Map(validationCache));
            
            setLastValidationTime(Date.now());
            
            return result;
            
        } catch (validationError) {
            const schemaErrors = validationError.inner ? 
                validationError.inner.map(err => err.message) : 
                [validationError.message];
            
            const result = {
                isValid: false,
                errors: schemaErrors,
                warnings: [],
                businessRuleErrors: [],
                dataIntegrityErrors: [],
                performanceWarnings: [],
                securityChecks: { dataAccess: false, fileGeneration: false, dataPrivacy: false }
            };
            
            setIsValid(false);
            setErrors(schemaErrors);
            setWarnings([]);
            setBusinessRuleErrors([]);
            setDataIntegrityErrors([]);
            setPerformanceWarnings([]);
            setSecurityChecks(result.securityChecks);
            
            return result;
        }
    }, [validationData, validationCache]);

    // Business rules validation
    const validateBusinessRules = useCallback(() => {
        const errors = [];
        
        data.forEach((record, index) => {
            const recordErrors = DailyWorksDownloadFormBusinessRules.validateAll(record);
            recordErrors.forEach(error => {
                errors.push(`Row ${index + 1}: ${error}`);
            });
        });
        
        return errors;
    }, [data]);

    // Data integrity validation
    const validateDataIntegrity = useCallback(() => {
        const errors = [];
        const selectedCols = selectedColumns.filter(col => col.checked);
        const columnConfig = DAILY_WORKS_DOWNLOAD_CONFIG.exportColumns;
        
        // Validate data completeness
        const completenessErrors = DailyWorksDownloadFormDataIntegrity.validateDataCompleteness(data, selectedCols);
        errors.push(...completenessErrors);
        
        // Validate data types
        const typeErrors = DailyWorksDownloadFormDataIntegrity.validateDataTypes(data, columnConfig);
        errors.push(...typeErrors);
        
        // Validate data consistency
        const consistencyErrors = DailyWorksDownloadFormDataIntegrity.validateDataConsistency(data);
        errors.push(...consistencyErrors);
        
        return errors;
    }, [data, selectedColumns]);

    // Performance validation
    const validatePerformance = useCallback(() => {
        const warnings = [];
        const thresholds = DAILY_WORKS_DOWNLOAD_CONFIG.performanceThresholds;
        
        const estimatedTime = calculateEstimatedExportTime();
        const estimatedSize = calculateEstimatedFileSize();
        const recordCount = data.length;
        
        if (estimatedTime > thresholds.warning.exportTime) {
            warnings.push(`Export may take ${estimatedTime} seconds - consider using fast mode`);
        }
        
        if (estimatedSize > thresholds.warning.fileSize) {
            const sizeMB = Math.round(estimatedSize / (1024 * 1024));
            warnings.push(`Large file size estimated (${sizeMB}MB) - consider reducing columns`);
        }
        
        if (recordCount > thresholds.warning.recordCount) {
            warnings.push(`Large dataset (${recordCount} records) - export may be slow`);
        }
        
        // Performance mode recommendations
        if (performanceMode === 'quality' && recordCount > 10000) {
            warnings.push('Consider using balanced mode for better performance with large datasets');
        }
        
        if (performanceMode === 'fast' && selectedColumns.filter(col => col.checked).length > 10) {
            warnings.push('Fast mode may not handle many columns efficiently');
        }
        
        return warnings;
    }, [data, selectedColumns, performanceMode]);

    // Security validation
    const validateSecurity = useCallback(() => {
        const checks = {
            dataAccess: true, // Assume user has access for now
            fileGeneration: true, // Assume file generation is secure
            dataPrivacy: true // Assume GDPR compliance
        };
        
        // Check user permissions
        if (userPermissions) {
            checks.dataAccess = userPermissions.canExport && userPermissions.canAccessData;
            
            if (userPermissions.maxRecords && data.length > userPermissions.maxRecords) {
                checks.dataAccess = false;
            }
        }
        
        // Check for sensitive data patterns
        const sensitiveFields = ['phone', 'email', 'ssn', 'personal'];
        const hasSensitiveData = selectedColumns.some(col => 
            col.checked && sensitiveFields.some(field => 
                col.key.toLowerCase().includes(field) || col.label.toLowerCase().includes(field)
            )
        );
        
        if (hasSensitiveData) {
            checks.dataPrivacy = false; // Requires additional review
        }
        
        return checks;
    }, [data, selectedColumns, userPermissions]);

    // Step-by-step validation
    const validateStep = useCallback(async (stepNumber) => {
        setStepValidation(prev => ({ ...prev, currentStep: `Step ${stepNumber}` }));
        
        const stepSchemas = DailyWorksDownloadFormStepValidationSchemas;
        let schema;
        
        switch (stepNumber) {
            case 1:
                schema = stepSchemas.step1;
                break;
            case 2:
                schema = stepSchemas.step2;
                break;
            case 3:
                schema = stepSchemas.step3;
                break;
            default:
                return { isValid: false, errors: ['Invalid step number'] };
        }
        
        try {
            await schema.validate(validationData, { abortEarly: false });
            
            setStepValidation(prev => ({
                ...prev,
                completedSteps: Math.max(prev.completedSteps, stepNumber),
                stepErrors: { ...prev.stepErrors, [stepNumber]: [] },
                stepWarnings: { ...prev.stepWarnings, [stepNumber]: [] }
            }));
            
            return { isValid: true, errors: [], warnings: [] };
            
        } catch (error) {
            const stepErrors = error.inner ? 
                error.inner.map(err => err.message) : 
                [error.message];
            
            setStepValidation(prev => ({
                ...prev,
                stepErrors: { ...prev.stepErrors, [stepNumber]: stepErrors },
                stepWarnings: { ...prev.stepWarnings, [stepNumber]: [] }
            }));
            
            return { isValid: false, errors: stepErrors, warnings: [] };
        }
    }, [validationData]);

    // Real-time validation with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            validateForm();
        }, DAILY_WORKS_DOWNLOAD_CONFIG.ui.debounceDelay);
        
        return () => clearTimeout(timeoutId);
    }, [validateForm]);

    // Clear validation cache when configuration changes significantly
    useEffect(() => {
        if (validationCache.size > 0) {
            setValidationCache(new Map());
        }
    }, [exportFormat, performanceMode]);

    return {
        // Validation state
        isValid,
        errors,
        warnings,
        businessRuleErrors,
        dataIntegrityErrors,
        performanceWarnings,
        securityChecks,
        stepValidation,
        lastValidationTime,
        
        // Validation functions
        validateForm,
        validateStep,
        validateBusinessRules,
        validateDataIntegrity,
        validatePerformance,
        validateSecurity,
        
        // Utilities
        clearCache: () => setValidationCache(new Map())
    };
};
