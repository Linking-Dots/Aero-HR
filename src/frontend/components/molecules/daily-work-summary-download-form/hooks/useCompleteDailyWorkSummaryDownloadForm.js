import { useState, useCallback, useRef } from 'react';
import { useDailyWorkSummaryDownloadForm } from './useDailyWorkSummaryDownloadForm.js';
import { useDailyWorkSummaryDownloadFormValidation } from './useDailyWorkSummaryDownloadFormValidation.js';
import { useDailyWorkSummaryDownloadFormAnalytics } from './useDailyWorkSummaryDownloadFormAnalytics.js';
import * as XLSX from 'xlsx';

/**
 * Complete integration hook for Daily Work Summary Download Form
 * 
 * Features:
 * - Complete export workflow management
 * - Multi-format export support (Excel, CSV, PDF)
 * - Performance optimization
 * - Error handling and recovery
 * - Analytics and progress tracking
 */
export const useCompleteDailyWorkSummaryDownloadForm = (
  filteredData = [],
  users = [],
  options = {}
) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    onCancel = () => {},
    enableAnalytics = true,
    autoValidate = true,
    performanceMode = 'balanced' // 'fast', 'balanced', 'quality'
  } = options;

  // Integration state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [exportStage, setExportStage] = useState(null);

  // Export tracking
  const exportRef = useRef({
    startTime: null,
    currentOperation: null,
    processedRecords: 0,
    totalRecords: 0
  });

  // Initialize core hooks
  const formHook = useDailyWorkSummaryDownloadForm(filteredData, users, {
    autoSave: true,
    persistPreferences: true,
    validateOnChange: autoValidate
  });

  const validationHook = useDailyWorkSummaryDownloadFormValidation(
    formHook.formData,
    formHook.currentStep,
    filteredData,
    { canExportData: true }, // User permissions
    {
      validateOnChange: autoValidate,
      enableBusinessRules: true
    }
  );

  const analyticsHook = useDailyWorkSummaryDownloadFormAnalytics(
    filteredData,
    {
      enableAnalytics,
      trackingLevel: enableAnalytics ? 'detailed' : 'minimal'
    }
  );

  // Process export with progress tracking
  const processExport = useCallback(async () => {
    if (isExporting) return { success: false, error: 'Export already in progress' };

    setIsExporting(true);
    setLastError(null);
    setExportProgress(0);
    exportRef.current.startTime = Date.now();

    try {
      // Track export attempt
      analyticsHook.trackExportAttempt('initiated', {
        exportFormat: formHook.formData.exportFormat,
        selectedColumnCount: formHook.getSelectedColumns.length,
        recordCount: filteredData.length,
        performanceLevel: formHook.getPerformanceEstimate.performanceLevel
      });

      analyticsHook.startPerformanceTimer('export_process');

      // Stage 1: Validation
      setExportStage('validation');
      setExportProgress(10);

      const finalValidation = await validationHook.validateForm();
      
      if (!finalValidation.isValid) {
        analyticsHook.trackExportAttempt('failed', {
          success: false,
          errorType: 'validation',
          errors: finalValidation.errors
        });
        
        throw new Error('Export validation failed: ' + Object.values(finalValidation.errors).join(', '));
      }

      // Stage 2: Data Processing
      setExportStage('processing');
      setExportProgress(25);

      const processedData = formHook.getProcessedData;
      
      if (processedData.length === 0) {
        throw new Error('No data available for export');
      }

      exportRef.current.totalRecords = processedData.length;

      // Stage 3: Format-specific Export
      setExportStage('generating');
      setExportProgress(50);

      let result;
      const filename = formHook.generateFilename();
      
      switch (formHook.formData.exportFormat) {
        case 'xlsx':
          result = await exportToExcel(processedData, filename);
          break;
        case 'csv':
          result = await exportToCSV(processedData, filename);
          break;
        case 'pdf':
          result = await exportToPDF(processedData, filename);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Stage 4: File Generation Complete
      setExportStage('finalizing');
      setExportProgress(90);

      const processingTime = analyticsHook.endPerformanceTimer('export_process');

      // Stage 5: Complete
      setExportProgress(100);
      setExportStage('complete');

      analyticsHook.trackExportAttempt('completed', {
        success: true,
        processingTime,
        fileSize: result.fileSize,
        exportFormat: formHook.formData.exportFormat,
        selectedColumnCount: formHook.getSelectedColumns.length,
        recordCount: processedData.length
      });

      analyticsHook.trackCompletion('completed', {
        stepsCompleted: 3,
        exportFormat: formHook.formData.exportFormat,
        selectedColumns: formHook.getSelectedColumns.length,
        recordCount: processedData.length,
        fileSize: result.fileSize
      });

      setIsExporting(false);
      onSuccess(result);

      return { 
        success: true, 
        data: result,
        processingTime,
        recordCount: processedData.length
      };

    } catch (error) {
      setLastError(error.message);
      setIsExporting(false);
      setExportProgress(0);
      setExportStage(null);
      
      analyticsHook.trackExportAttempt('failed', {
        success: false,
        errorType: 'process_error',
        error: error.message,
        stage: exportStage
      });

      analyticsHook.trackCompletion('failed', {
        reason: error.message,
        stage: exportStage
      });

      onError(error);

      return { 
        success: false, 
        error: error.message,
        stage: exportStage 
      };
    }
  }, [
    isExporting,
    formHook,
    validationHook,
    analyticsHook,
    filteredData,
    exportStage,
    onSuccess,
    onError
  ]);

  // Export to Excel format
  const exportToExcel = useCallback(async (data, filename) => {
    return new Promise((resolve, reject) => {
      try {
        setExportProgress(60);
        
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        setExportProgress(70);
        
        // Apply formatting based on performance mode
        if (performanceMode === 'quality') {
          // Add column widths
          const columnWidths = formHook.getSelectedColumns.map(col => ({
            wch: col.width ? col.width / 8 : 15 // Convert pixels to character width
          }));
          worksheet['!cols'] = columnWidths;
          
          // Add cell styling for headers
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;
            
            worksheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "EEEEEE" } },
              alignment: { horizontal: "center" }
            };
          }
        }
        
        setExportProgress(80);
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Work Summary');
        
        // Add metadata
        workbook.Props = {
          Title: 'Daily Work Summary Export',
          Subject: 'Construction Work Summary',
          Author: 'GlassERP System',
          CreatedDate: new Date()
        };
        
        setExportProgress(85);
        
        // Write file
        const buffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'array',
          compression: formHook.formData.exportOptions.compressOutput
        });
        
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        resolve({
          format: 'xlsx',
          filename: `${filename}.xlsx`,
          fileSize: blob.size,
          recordCount: data.length,
          columnCount: formHook.getSelectedColumns.length
        });
        
      } catch (error) {
        reject(new Error(`Excel export failed: ${error.message}`));
      }
    });
  }, [formHook, performanceMode]);

  // Export to CSV format
  const exportToCSV = useCallback(async (data, filename) => {
    return new Promise((resolve, reject) => {
      try {
        setExportProgress(60);
        
        if (data.length === 0) {
          throw new Error('No data to export');
        }
        
        // Get headers
        const headers = Object.keys(data[0]);
        
        setExportProgress(70);
        
        // Convert to CSV format
        const csvContent = [
          headers.join(','), // Header row
          ...data.map(row => 
            headers.map(header => {
              const value = row[header];
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value || '';
            }).join(',')
          )
        ].join('\n');
        
        setExportProgress(80);
        
        // Create and download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        resolve({
          format: 'csv',
          filename: `${filename}.csv`,
          fileSize: blob.size,
          recordCount: data.length,
          columnCount: headers.length
        });
        
      } catch (error) {
        reject(new Error(`CSV export failed: ${error.message}`));
      }
    });
  }, []);

  // Export to PDF format (simplified for now)
  const exportToPDF = useCallback(async (data, filename) => {
    return new Promise((resolve, reject) => {
      try {
        // For now, convert to CSV and suggest PDF generation
        // In a real implementation, you'd use a PDF library like jsPDF
        reject(new Error('PDF export not yet implemented. Please use Excel or CSV format.'));
      } catch (error) {
        reject(new Error(`PDF export failed: ${error.message}`));
      }
    });
  }, []);

  // Cancel export process
  const cancelExport = useCallback(() => {
    if (isExporting) {
      analyticsHook.trackCompletion('cancelled', {
        reason: 'user_cancellation',
        stage: exportStage
      });
    }

    setIsExporting(false);
    setExportProgress(0);
    setExportStage(null);
    setLastError(null);
    
    onCancel();
  }, [isExporting, exportStage, analyticsHook, onCancel]);

  // Get export summary
  const getExportSummary = useCallback(() => {
    return {
      selectedColumns: formHook.getSelectedColumns,
      exportFormat: formHook.formData.exportFormat,
      filename: formHook.generateFilename(),
      recordCount: filteredData.length,
      estimatedSize: formHook.getPerformanceEstimate.estimatedSize,
      estimatedTime: formHook.getPerformanceEstimate.estimatedTime,
      performanceLevel: formHook.getPerformanceEstimate.performanceLevel,
      summaryStats: formHook.getSummaryStats
    };
  }, [formHook, filteredData.length]);

  return {
    // Form management
    ...formHook,
    
    // Validation
    validation: validationHook,
    
    // Analytics
    analytics: analyticsHook,
    
    // Export state
    isExporting,
    exportProgress,
    exportStage,
    lastError,
    
    // Export actions
    processExport,
    cancelExport,
    
    // Export utilities
    getExportSummary,
    clearError: () => setLastError(null),
    
    // Status checks
    canExport: () => {
      return !isExporting && 
             validationHook.validationState.canExport && 
             formHook.getSelectedColumns.length > 0 &&
             formHook.formData.exportFormat;
    },
    
    isReadyForExport: () => {
      return formHook.getSelectedColumns.length > 0 &&
             formHook.formData.exportFormat &&
             formHook.formData.filename &&
             !validationHook.validationState.hasErrors;
    },
    
    // Progress tracking
    getExportProgress: () => ({
      percentage: exportProgress,
      stage: exportStage,
      isActive: isExporting,
      recordsProcessed: exportRef.current.processedRecords,
      totalRecords: exportRef.current.totalRecords
    }),
    
    // Performance helpers
    getPerformanceRecommendations: () => {
      const recommendations = [];
      const estimate = formHook.getPerformanceEstimate;
      
      if (estimate.performanceLevel === 'slow') {
        recommendations.push('Consider reducing the number of selected columns for faster export');
        
        if (filteredData.length > 5000) {
          recommendations.push('Large dataset detected. Export may take several minutes');
        }
        
        if (formHook.formData.exportFormat === 'pdf') {
          recommendations.push('Excel or CSV format will export faster than PDF');
        }
      }
      
      if (formHook.getSelectedColumns.length > 10) {
        recommendations.push('Many columns selected may impact file size and loading time');
      }
      
      return recommendations;
    }
  };
};

export default useCompleteDailyWorkSummaryDownloadForm;
