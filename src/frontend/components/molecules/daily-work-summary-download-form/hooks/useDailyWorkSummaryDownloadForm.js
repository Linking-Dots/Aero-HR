import { useState, useCallback, useMemo, useEffect } from 'react';
import { dailyWorkSummaryDownloadFormConfig } from '../config.js';

/**
 * Hook for managing Daily Work Summary Download Form state and logic
 * 
 * Features:
 * - Column selection management
 * - Export format handling
 * - Data processing and validation
 * - Performance optimization
 * - User preference persistence
 */
export const useDailyWorkSummaryDownloadForm = (
  filteredData = [],
  users = [],
  options = {}
) => {
  const {
    autoSave = true,
    persistPreferences = true,
    validateOnChange = true,
    defaultFormat = 'xlsx'
  } = options;

  // Initialize columns with default selection
  const initializeColumns = useCallback(() => {
    return dailyWorkSummaryDownloadFormConfig.exportColumns.map(column => ({
      ...column,
      checked: column.defaultChecked
    }));
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    selectedColumns: initializeColumns(),
    exportFormat: defaultFormat,
    filename: dailyWorkSummaryDownloadFormConfig.exportOptions.filename.default,
    dateRange: {
      startDate: null,
      endDate: null
    },
    exportOptions: {
      includeHeaders: true,
      includeCalculatedFields: true,
      compressOutput: false,
      separateWorkTypes: false
    },
    performanceSettings: {
      batchSize: dailyWorkSummaryDownloadFormConfig.dataProcessing.batchSize,
      timeout: dailyWorkSummaryDownloadFormConfig.dataProcessing.timeout
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load user preferences on mount
  useEffect(() => {
    if (persistPreferences && typeof window !== 'undefined') {
      try {
        const savedPreferences = localStorage.getItem('dailyWorkSummaryDownloadPrefs');
        if (savedPreferences) {
          const prefs = JSON.parse(savedPreferences);
          setFormData(prev => ({
            ...prev,
            ...prefs,
            selectedColumns: prev.selectedColumns.map(col => ({
              ...col,
              checked: prefs.selectedColumns?.find(savedCol => savedCol.key === col.key)?.checked ?? col.checked
            }))
          }));
        }
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      }
    }
  }, [persistPreferences]);

  // Save preferences when form data changes
  useEffect(() => {
    if (persistPreferences && autoSave && typeof window !== 'undefined') {
      const timeoutId = setTimeout(() => {
        try {
          const prefsToSave = {
            exportFormat: formData.exportFormat,
            exportOptions: formData.exportOptions,
            performanceSettings: formData.performanceSettings,
            selectedColumns: formData.selectedColumns.map(col => ({
              key: col.key,
              checked: col.checked
            }))
          };
          localStorage.setItem('dailyWorkSummaryDownloadPrefs', JSON.stringify(prefsToSave));
          setLastSaved(Date.now());
        } catch (error) {
          console.warn('Failed to save user preferences:', error);
        }
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [formData, persistPreferences, autoSave]);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      
      // Handle nested field updates
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  // Column management functions
  const toggleColumn = useCallback((columnKey) => {
    setFormData(prev => ({
      ...prev,
      selectedColumns: prev.selectedColumns.map(col =>
        col.key === columnKey ? { ...col, checked: !col.checked } : col
      )
    }));
  }, []);

  const toggleAllColumns = useCallback((checked) => {
    setFormData(prev => ({
      ...prev,
      selectedColumns: prev.selectedColumns.map(col => ({
        ...col,
        checked: col.required ? true : checked
      }))
    }));
  }, []);

  const toggleCategoryColumns = useCallback((category, checked) => {
    setFormData(prev => ({
      ...prev,
      selectedColumns: prev.selectedColumns.map(col =>
        col.category === category && !col.required 
          ? { ...col, checked } 
          : col
      )
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setFormData({
      selectedColumns: initializeColumns(),
      exportFormat: defaultFormat,
      filename: dailyWorkSummaryDownloadFormConfig.exportOptions.filename.default,
      dateRange: {
        startDate: null,
        endDate: null
      },
      exportOptions: {
        includeHeaders: true,
        includeCalculatedFields: true,
        compressOutput: false,
        separateWorkTypes: false
      },
      performanceSettings: {
        batchSize: dailyWorkSummaryDownloadFormConfig.dataProcessing.batchSize,
        timeout: dailyWorkSummaryDownloadFormConfig.dataProcessing.timeout
      }
    });
    setCurrentStep(0);
  }, [initializeColumns, defaultFormat]);

  // Data processing functions
  const getSelectedColumns = useMemo(() => {
    return formData.selectedColumns.filter(col => col.checked);
  }, [formData.selectedColumns]);

  const getProcessedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }

    return filteredData.map(row => {
      const processedRow = {};
      
      getSelectedColumns.forEach(column => {
        if (column.type === 'calculated' && column.calculation) {
          // Handle calculated fields
          const calculatedValue = column.calculation(row);
          
          if (column.format === 'percentage') {
            processedRow[column.label] = `${calculatedValue.toFixed(1)}%`;
          } else if (column.format === 'integer') {
            processedRow[column.label] = Math.round(calculatedValue);
          } else {
            processedRow[column.label] = calculatedValue;
          }
        } else {
          // Handle regular fields
          let value = row[column.key];
          
          if (column.format === 'integer' && typeof value === 'number') {
            value = Math.round(value);
          } else if (column.format === 'percentage' && typeof value === 'number') {
            value = `${value.toFixed(1)}%`;
          } else if (column.type === 'date' && value) {
            value = new Date(value).toLocaleDateString();
          }
          
          processedRow[column.label] = value || '';
        }
      });
      
      return processedRow;
    });
  }, [filteredData, getSelectedColumns]);

  // Generate filename with date
  const generateFilename = useCallback(() => {
    const config = dailyWorkSummaryDownloadFormConfig.exportOptions.filename;
    let filename = formData.filename || config.default;
    
    if (config.includeDate) {
      const date = new Date().toISOString().split('T')[0];
      filename = config.format.replace('{name}', filename).replace('{date}', date);
    }
    
    return filename;
  }, [formData.filename]);

  // Estimate export performance
  const getPerformanceEstimate = useMemo(() => {
    const recordCount = filteredData.length;
    const columnCount = getSelectedColumns.length;
    const complexity = columnCount * recordCount;
    
    // Rough estimates based on complexity
    let estimatedTime = 0;
    let estimatedSize = 0;
    
    if (complexity < 1000) {
      estimatedTime = 1; // 1 second
      estimatedSize = 0.1; // 0.1 MB
    } else if (complexity < 10000) {
      estimatedTime = 3; // 3 seconds
      estimatedSize = 0.5; // 0.5 MB
    } else if (complexity < 100000) {
      estimatedTime = 10; // 10 seconds
      estimatedSize = 2; // 2 MB
    } else {
      estimatedTime = 30; // 30 seconds
      estimatedSize = 10; // 10 MB
    }
    
    return {
      recordCount,
      columnCount,
      estimatedTime,
      estimatedSize,
      complexity,
      performanceLevel: complexity < 1000 ? 'fast' : complexity < 10000 ? 'medium' : 'slow'
    };
  }, [filteredData.length, getSelectedColumns.length]);

  // Get summary statistics
  const getSummaryStats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return null;
    }

    const stats = {
      totalRecords: filteredData.length,
      selectedColumns: getSelectedColumns.length,
      dateRange: {
        earliest: null,
        latest: null
      },
      totals: {}
    };

    // Calculate date range
    const dates = filteredData
      .map(row => row.date)
      .filter(date => date)
      .map(date => new Date(date))
      .sort();
    
    if (dates.length > 0) {
      stats.dateRange.earliest = dates[0].toLocaleDateString();
      stats.dateRange.latest = dates[dates.length - 1].toLocaleDateString();
    }

    // Calculate totals for numeric columns
    const numericColumns = ['totalDailyWorks', 'completed', 'resubmissions', 'embankment', 'structure', 'pavement', 'rfiSubmissions'];
    
    numericColumns.forEach(column => {
      stats.totals[column] = filteredData.reduce((sum, row) => sum + (row[column] || 0), 0);
    });

    return stats;
  }, [filteredData, getSelectedColumns]);

  // Get categories with selection status
  const getCategorizedColumns = useMemo(() => {
    const categories = {};
    
    Object.entries(dailyWorkSummaryDownloadFormConfig.columnCategories).forEach(([key, category]) => {
      const categoryColumns = formData.selectedColumns.filter(col => col.category === key);
      const selectedCount = categoryColumns.filter(col => col.checked).length;
      
      categories[key] = {
        ...category,
        columns: categoryColumns,
        totalColumns: categoryColumns.length,
        selectedColumns: selectedCount,
        allSelected: selectedCount === categoryColumns.length,
        noneSelected: selectedCount === 0,
        partialSelected: selectedCount > 0 && selectedCount < categoryColumns.length
      };
    });
    
    return Object.entries(categories)
      .sort(([, a], [, b]) => a.order - b.order)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }, [formData.selectedColumns]);

  return {
    // Form state
    formData,
    currentStep,
    isProcessing,
    lastSaved,
    
    // Form actions
    updateField,
    setCurrentStep,
    setIsProcessing,
    resetToDefaults,
    
    // Column management
    toggleColumn,
    toggleAllColumns,
    toggleCategoryColumns,
    getSelectedColumns,
    getCategorizedColumns,
    
    // Data processing
    getProcessedData,
    generateFilename,
    getPerformanceEstimate,
    getSummaryStats,
    
    // Validation helpers
    hasSelectedColumns: getSelectedColumns.length > 0,
    hasRequiredColumns: getSelectedColumns.some(col => col.required),
    isValidForExport: getSelectedColumns.length > 0 && formData.exportFormat,
    
    // Configuration access
    config: dailyWorkSummaryDownloadFormConfig,
    exportFormats: dailyWorkSummaryDownloadFormConfig.exportFormats,
    
    // Step navigation helpers
    canProceedToNext: (step) => {
      switch (step) {
        case 0: return getSelectedColumns.length > 0;
        case 1: return formData.exportFormat && formData.filename;
        case 2: return true;
        default: return false;
      }
    },
    
    // Progress indicators
    getProgress: () => ({
      currentStep,
      totalSteps: 3,
      percentage: Math.round(((currentStep + 1) / 3) * 100),
      completed: currentStep === 2
    })
  };
};

export default useDailyWorkSummaryDownloadForm;
