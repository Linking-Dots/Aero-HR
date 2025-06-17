import { useState, useEffect, useCallback, useMemo } from 'react';
import { DAILY_WORKS_DOWNLOAD_CONFIG } from '../config';

/**
 * Main form state management hook for Daily Works Download Form
 * Handles column selection, export configuration, and user preferences
 */
export const useDailyWorksDownloadForm = ({ 
    data = [], 
    users = [],
    initialSelectedColumns = null,
    onConfigChange = null 
}) => {
    // Initialize selected columns with defaults
    const [selectedColumns, setSelectedColumns] = useState(() => {
        if (initialSelectedColumns) return initialSelectedColumns;
        
        return DAILY_WORKS_DOWNLOAD_CONFIG.exportColumns.map(column => ({
            ...column,
            checked: DAILY_WORKS_DOWNLOAD_CONFIG.defaults.selectedColumns.includes(column.key)
        }));
    });

    // Export configuration state
    const [exportFormat, setExportFormat] = useState(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.exportFormat);
    const [performanceMode, setPerformanceMode] = useState(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.performanceMode);
    const [filename, setFilename] = useState(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.filename);
    const [includeMetadata, setIncludeMetadata] = useState(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.includeMetadata);
    const [includeTimestamp, setIncludeTimestamp] = useState(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.includeTimestamp);

    // Performance state
    const [estimatedExportTime, setEstimatedExportTime] = useState(0);
    const [estimatedFileSize, setEstimatedFileSize] = useState('0KB');
    const [complexity, setComplexity] = useState('Low');

    // Auto-save preferences
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [lastSaved, setLastSaved] = useState(null);

    // Calculate summary statistics
    const summary = useMemo(() => {
        const selectedCount = selectedColumns.filter(col => col.checked).length;
        const totalColumns = selectedColumns.length;
        const totalRecords = data.length;
        
        // Calculate work type distribution
        const workTypeDistribution = data.reduce((acc, record) => {
            const type = record.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        // Calculate status distribution
        const statusDistribution = data.reduce((acc, record) => {
            const status = record.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Calculate resubmission statistics
        const resubmissionStats = {
            totalResubmissions: data.reduce((sum, record) => sum + (record.resubmission_count || 0), 0),
            recordsWithResubmissions: data.filter(record => record.resubmission_count > 0).length,
            averageResubmissions: 0
        };

        if (resubmissionStats.recordsWithResubmissions > 0) {
            resubmissionStats.averageResubmissions = 
                resubmissionStats.totalResubmissions / resubmissionStats.recordsWithResubmissions;
        }

        // Calculate completion statistics
        const completionStats = {
            completed: data.filter(record => record.status === 'completed').length,
            inProgress: data.filter(record => record.status === 'in_progress').length,
            pending: data.filter(record => record.status === 'pending').length,
            completionRate: 0
        };

        if (totalRecords > 0) {
            completionStats.completionRate = (completionStats.completed / totalRecords) * 100;
        }

        return {
            selectedColumns: selectedCount,
            totalColumns,
            totalRecords,
            workTypeDistribution,
            statusDistribution,
            resubmissionStats,
            completionStats,
            complexity,
            dataQuality: calculateDataQuality(data, selectedColumns.filter(col => col.checked))
        };
    }, [selectedColumns, data, complexity]);

    // Calculate data quality score
    const calculateDataQuality = useCallback((records, selectedCols) => {
        if (records.length === 0) return { score: 100, issues: [] };
        
        let totalFields = 0;
        let missingFields = 0;
        const issues = [];
        
        selectedCols.forEach(column => {
            records.forEach(record => {
                totalFields++;
                const value = record[column.key];
                if (value === null || value === undefined || value === '') {
                    missingFields++;
                }
            });
        });
        
        const score = totalFields > 0 ? Math.round(((totalFields - missingFields) / totalFields) * 100) : 100;
        
        if (score < 90) {
            issues.push('Some records have missing data');
        }
        
        return { score, issues };
    }, []);

    // Calculate performance estimates
    const calculatePerformanceEstimates = useCallback(() => {
        const recordCount = data.length;
        const columnCount = selectedColumns.filter(col => col.checked).length;
        const formatConfig = DAILY_WORKS_DOWNLOAD_CONFIG.exportFormats[exportFormat];
        const modeConfig = DAILY_WORKS_DOWNLOAD_CONFIG.performanceModes[performanceMode];
        
        // Base calculation factors
        const baseFactor = 0.001; // Base time per record-column combination
        const formatMultiplier = formatConfig?.label.includes('Excel') ? 2 : 1;
        const modeMultiplier = modeConfig?.enableFormatting ? 1.5 : 1;
        
        // Calculate estimated export time
        const estimatedTime = Math.max(
            1,
            Math.round(recordCount * columnCount * baseFactor * formatMultiplier * modeMultiplier)
        );
        
        // Calculate estimated file size
        const avgDataSize = 50; // Average bytes per field
        const baseSize = recordCount * columnCount * avgDataSize;
        const formatOverhead = formatConfig?.label.includes('Excel') ? 1.8 : 1.1;
        const estimatedSize = Math.round(baseSize * formatOverhead);
        
        // Format file size
        let sizeString = '0KB';
        if (estimatedSize < 1024) {
            sizeString = `${estimatedSize}B`;
        } else if (estimatedSize < 1024 * 1024) {
            sizeString = `${Math.round(estimatedSize / 1024)}KB`;
        } else {
            sizeString = `${Math.round(estimatedSize / (1024 * 1024))}MB`;
        }
        
        // Determine complexity
        let newComplexity = 'Low';
        if (recordCount > 1000 || columnCount > 8) newComplexity = 'Medium';
        if (recordCount > 5000 || columnCount > 12) newComplexity = 'High';
        if (recordCount > 20000 || columnCount > 15) newComplexity = 'Very High';
        
        setEstimatedExportTime(estimatedTime);
        setEstimatedFileSize(sizeString);
        setComplexity(newComplexity);
    }, [data, selectedColumns, exportFormat, performanceMode]);

    // Update performance estimates when dependencies change
    useEffect(() => {
        calculatePerformanceEstimates();
    }, [calculatePerformanceEstimates]);

    // Column selection handlers
    const toggleColumn = useCallback((columnKey) => {
        setSelectedColumns(prev => 
            prev.map(col => 
                col.key === columnKey 
                    ? { ...col, checked: !col.checked }
                    : col
            )
        );
    }, []);

    const toggleColumnCategory = useCallback((categoryKey) => {
        const category = DAILY_WORKS_DOWNLOAD_CONFIG.columnCategories.find(cat => cat.key === categoryKey);
        if (!category) return;
        
        setSelectedColumns(prev => {
            const categoryColumns = category.columns;
            const categoryColumnsState = prev.filter(col => categoryColumns.includes(col.key));
            const allSelected = categoryColumnsState.every(col => col.checked);
            
            return prev.map(col => {
                if (categoryColumns.includes(col.key)) {
                    return { ...col, checked: !allSelected };
                }
                return col;
            });
        });
    }, []);

    const selectAllColumns = useCallback(() => {
        setSelectedColumns(prev => prev.map(col => ({ ...col, checked: true })));
    }, []);

    const deselectAllColumns = useCallback(() => {
        setSelectedColumns(prev => prev.map(col => ({ ...col, checked: false })));
    }, []);

    // Reset to defaults
    const resetToDefaults = useCallback(() => {
        setSelectedColumns(
            DAILY_WORKS_DOWNLOAD_CONFIG.exportColumns.map(column => ({
                ...column,
                checked: DAILY_WORKS_DOWNLOAD_CONFIG.defaults.selectedColumns.includes(column.key)
            }))
        );
        setExportFormat(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.exportFormat);
        setPerformanceMode(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.performanceMode);
        setFilename(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.filename);
        setIncludeMetadata(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.includeMetadata);
        setIncludeTimestamp(DAILY_WORKS_DOWNLOAD_CONFIG.defaults.includeTimestamp);
    }, []);

    // User preferences management
    const savePreferences = useCallback(() => {
        try {
            const preferences = {
                selectedColumns: selectedColumns.map(col => ({ key: col.key, checked: col.checked })),
                exportFormat,
                performanceMode,
                filename,
                includeMetadata,
                includeTimestamp,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('dailyWorksDownloadPreferences', JSON.stringify(preferences));
            setLastSaved(new Date());
            return true;
        } catch (error) {
            console.error('Failed to save preferences:', error);
            return false;
        }
    }, [selectedColumns, exportFormat, performanceMode, filename, includeMetadata, includeTimestamp]);

    const loadPreferences = useCallback(() => {
        try {
            const saved = localStorage.getItem('dailyWorksDownloadPreferences');
            if (!saved) return false;
            
            const preferences = JSON.parse(saved);
            
            // Update selected columns
            if (preferences.selectedColumns) {
                setSelectedColumns(prev => 
                    prev.map(col => {
                        const savedCol = preferences.selectedColumns.find(saved => saved.key === col.key);
                        return savedCol ? { ...col, checked: savedCol.checked } : col;
                    })
                );
            }
            
            // Update other preferences
            if (preferences.exportFormat) setExportFormat(preferences.exportFormat);
            if (preferences.performanceMode) setPerformanceMode(preferences.performanceMode);
            if (preferences.filename) setFilename(preferences.filename);
            if (typeof preferences.includeMetadata === 'boolean') setIncludeMetadata(preferences.includeMetadata);
            if (typeof preferences.includeTimestamp === 'boolean') setIncludeTimestamp(preferences.includeTimestamp);
            
            return true;
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return false;
        }
    }, []);

    // Auto-save functionality
    useEffect(() => {
        if (autoSaveEnabled && lastSaved) {
            const timeoutId = setTimeout(() => {
                savePreferences();
            }, DAILY_WORKS_DOWNLOAD_CONFIG.ui.autoSaveDelay);
            
            return () => clearTimeout(timeoutId);
        }
    }, [selectedColumns, exportFormat, performanceMode, autoSaveEnabled, savePreferences, lastSaved]);

    // Notify parent of configuration changes
    useEffect(() => {
        if (onConfigChange) {
            onConfigChange({
                selectedColumns,
                exportFormat,
                performanceMode,
                filename,
                includeMetadata,
                includeTimestamp,
                summary,
                estimatedExportTime,
                estimatedFileSize,
                complexity
            });
        }
    }, [
        selectedColumns, exportFormat, performanceMode, filename, 
        includeMetadata, includeTimestamp, summary, estimatedExportTime, 
        estimatedFileSize, complexity, onConfigChange
    ]);

    // Load preferences on mount
    useEffect(() => {
        loadPreferences();
    }, [loadPreferences]);

    return {
        // State
        selectedColumns,
        exportFormat,
        performanceMode,
        filename,
        includeMetadata,
        includeTimestamp,
        estimatedExportTime,
        estimatedFileSize,
        complexity,
        summary,
        autoSaveEnabled,
        lastSaved,
        
        // Actions
        toggleColumn,
        toggleColumnCategory,
        selectAllColumns,
        deselectAllColumns,
        setExportFormat,
        setPerformanceMode,
        setFilename,
        setIncludeMetadata,
        setIncludeTimestamp,
        setAutoSaveEnabled,
        resetToDefaults,
        savePreferences,
        loadPreferences,
        
        // Utilities
        calculatePerformanceEstimates
    };
};
