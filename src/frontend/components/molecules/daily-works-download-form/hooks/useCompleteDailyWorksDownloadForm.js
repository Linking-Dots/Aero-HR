import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { useDailyWorksDownloadForm } from './useDailyWorksDownloadForm';
import { useDailyWorksDownloadFormValidation } from './useDailyWorksDownloadFormValidation';
import { useDailyWorksDownloadFormAnalytics } from './useDailyWorksDownloadFormAnalytics';
import { DAILY_WORKS_DOWNLOAD_CONFIG } from '../config';

/**
 * Complete integration hook for Daily Works Download Form
 * Combines form state, validation, analytics, and export functionality
 */
export const useCompleteDailyWorksDownloadForm = ({
    data = [],
    users = [],
    onClose,
    onExportComplete = null,
    onExportError = null,
    initialConfig = null
}) => {
    // Integration state
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportStatus, setExportStatus] = useState('idle'); // idle, preparing, processing, completing, completed, error
    const [exportError, setExportError] = useState(null);

    // Form state integration
    const formState = useDailyWorksDownloadForm({
        data,
        users,
        initialSelectedColumns: initialConfig?.selectedColumns,
        onConfigChange: (config) => {
            // Track configuration changes
            analytics.trackEvent('config_changed', {
                selectedColumnsCount: config.selectedColumns?.filter(col => col.checked).length || 0,
                exportFormat: config.exportFormat,
                performanceMode: config.performanceMode
            });
        }
    });

    // Validation integration
    const validation = useDailyWorksDownloadFormValidation({
        selectedColumns: formState.selectedColumns,
        exportFormat: formState.exportFormat,
        performanceMode: formState.performanceMode,
        data,
        users,
        filename: formState.filename,
        userPermissions: {
            canExport: true,
            canAccessData: true,
            maxRecords: DAILY_WORKS_DOWNLOAD_CONFIG.validation.maxRecordCount
        }
    });

    // Analytics integration
    const analytics = useDailyWorksDownloadFormAnalytics({
        formId: 'daily-works-download',
        userId: 'current-user', // Replace with actual user ID
        sessionId: 'current-session', // Replace with actual session ID
        enableTracking: DAILY_WORKS_DOWNLOAD_CONFIG.analytics.enabled
    });

    // Export configuration
    const exportConfig = useMemo(() => ({
        selectedColumns: formState.selectedColumns.filter(col => col.checked),
        exportFormat: formState.exportFormat,
        performanceMode: formState.performanceMode,
        filename: formState.filename,
        includeMetadata: formState.includeMetadata,
        includeTimestamp: formState.includeTimestamp,
        summary: formState.summary,
        estimatedExportTime: formState.estimatedExportTime,
        estimatedFileSize: formState.estimatedFileSize,
        complexity: formState.complexity
    }), [formState]);

    // Data processing utilities
    const processExportData = useCallback((rawData, selectedColumns, users) => {
        return rawData.map((row, index) => {
            const processedRow = {};
            
            selectedColumns.forEach(column => {
                if (column.checked) {
                    let value = row[column.key];
                    
                    // Apply column-specific transformations
                    switch (column.key) {
                        case 'incharge':
                        case 'assigned':
                            // Look up user by ID
                            const user = users.find(user => user.id === value);
                            value = user ? user.name : 'N/A';
                            break;
                            
                        case 'status':
                            // Capitalize status
                            value = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
                            break;
                            
                        case 'type':
                            // Capitalize work type
                            value = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
                            break;
                            
                        case 'date':
                        case 'planned_time':
                        case 'completion_time':
                        case 'rfi_submission_date':
                            // Format dates based on export format
                            if (value) {
                                const date = new Date(value);
                                if (!isNaN(date.getTime())) {
                                    if (column.key === 'date' || column.key === 'rfi_submission_date') {
                                        value = date.toLocaleDateString();
                                    } else {
                                        value = date.toLocaleString();
                                    }
                                }
                            }
                            break;
                            
                        case 'resubmission_count':
                            // Ensure numeric format
                            value = Number(value) || 0;
                            break;
                            
                        default:
                            // Default handling
                            value = value || '';
                    }
                    
                    processedRow[column.label] = value;
                }
            });
            
            return processedRow;
        });
    }, []);

    // Excel export functionality
    const exportToExcel = useCallback(async (processedData, config) => {
        try {
            setExportStatus('processing');
            setExportProgress(25);

            // Create workbook and worksheet
            const worksheet = XLSX.utils.json_to_sheet(processedData);
            const workbook = XLSX.utils.book_new();
            
            setExportProgress(50);

            // Add formatting if enabled
            const performanceConfig = DAILY_WORKS_DOWNLOAD_CONFIG.performanceModes[config.performanceMode];
            if (performanceConfig.enableFormatting) {
                // Add header styling
                const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
                for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                    if (worksheet[cellAddress]) {
                        worksheet[cellAddress].s = {
                            font: { bold: true },
                            fill: { fgColor: { rgb: "EEEEEE" } }
                        };
                    }
                }
            }
            
            setExportProgress(75);

            // Add metadata if enabled
            if (config.includeMetadata) {
                const metadataSheet = XLSX.utils.aoa_to_sheet([
                    ['Export Information'],
                    ['Generated Date', new Date().toLocaleString()],
                    ['Total Records', processedData.length],
                    ['Selected Columns', config.selectedColumns.length],
                    ['Export Format', config.exportFormat],
                    ['Performance Mode', config.performanceMode],
                    ['Estimated File Size', config.estimatedFileSize],
                    ['User', 'Current User'] // Replace with actual user info
                ]);
                XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Export Info');
            }

            // Add main data sheet
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Works');
            
            setExportProgress(90);

            // Generate filename with timestamp if enabled
            let filename = config.filename || 'DailyWorks';
            if (config.includeTimestamp) {
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                filename = `${filename}_${timestamp}`;
            }
            filename += '.xlsx';

            // Write and download file
            XLSX.writeFile(workbook, filename);
            
            setExportProgress(100);
            
            return {
                success: true,
                filename,
                recordCount: processedData.length,
                fileSize: config.estimatedFileSize
            };

        } catch (error) {
            console.error('Excel export failed:', error);
            throw new Error(`Excel export failed: ${error.message}`);
        }
    }, []);

    // CSV export functionality
    const exportToCSV = useCallback(async (processedData, config) => {
        try {
            setExportStatus('processing');
            setExportProgress(25);

            // Convert to CSV format
            if (processedData.length === 0) {
                throw new Error('No data available for export');
            }

            const headers = Object.keys(processedData[0]);
            const csvContent = [
                headers.join(','),
                ...processedData.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        // Escape values containing commas or quotes
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    }).join(',')
                )
            ].join('\n');

            setExportProgress(75);

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            let filename = config.filename || 'DailyWorks';
            if (config.includeTimestamp) {
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                filename = `${filename}_${timestamp}`;
            }
            filename += '.csv';

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportProgress(100);

            return {
                success: true,
                filename,
                recordCount: processedData.length,
                fileSize: config.estimatedFileSize
            };

        } catch (error) {
            console.error('CSV export failed:', error);
            throw new Error(`CSV export failed: ${error.message}`);
        }
    }, []);

    // PDF export functionality (basic implementation)
    const exportToPDF = useCallback(async (processedData, config) => {
        try {
            setExportStatus('processing');
            setExportProgress(25);

            // For PDF export, we'll create a simple HTML table and use browser's print
            // In a real implementation, you might use libraries like jsPDF or Puppeteer
            
            if (processedData.length === 0) {
                throw new Error('No data available for export');
            }

            const headers = Object.keys(processedData[0]);
            
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Daily Works Export</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .header { margin-bottom: 20px; }
                        .metadata { margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Daily Works Export</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                        <p>Total Records: ${processedData.length}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                ${headers.map(header => `<th>${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${processedData.map(row => 
                                `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`
                            ).join('')}
                        </tbody>
                    </table>
                    ${config.includeMetadata ? `
                        <div class="metadata">
                            <p>Export Format: PDF | Performance Mode: ${config.performanceMode}</p>
                            <p>Selected Columns: ${config.selectedColumns.length} | File Size: ${config.estimatedFileSize}</p>
                        </div>
                    ` : ''}
                </body>
                </html>
            `;

            setExportProgress(75);

            // Open in new window for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            setExportProgress(100);

            // Note: In a real implementation, you would generate an actual PDF file
            // This is a simplified version for demonstration
            
            return {
                success: true,
                filename: 'DailyWorks.pdf',
                recordCount: processedData.length,
                fileSize: config.estimatedFileSize,
                note: 'PDF opened in new window for printing'
            };

        } catch (error) {
            console.error('PDF export failed:', error);
            throw new Error(`PDF export failed: ${error.message}`);
        }
    }, []);

    // Main export handler
    const handleExport = useCallback(async () => {
        if (!validation.isValid) {
            const errorMessage = 'Please fix validation errors before exporting';
            setExportError(errorMessage);
            analytics.trackExportAction('export_failed', { reason: 'validation_errors' });
            if (onExportError) onExportError(errorMessage);
            return;
        }

        setIsExporting(true);
        setExportProgress(0);
        setExportStatus('preparing');
        setExportError(null);

        const startTime = Date.now();

        try {
            // Track export start
            analytics.trackExportAction('export_started', {
                selectedColumns: exportConfig.selectedColumns.length,
                exportFormat: exportConfig.exportFormat,
                recordCount: data.length,
                performanceMode: exportConfig.performanceMode
            });

            setExportProgress(10);

            // Process data
            const processedData = processExportData(data, exportConfig.selectedColumns, users);
            
            setExportProgress(20);

            let result;
            switch (exportConfig.exportFormat) {
                case 'excel':
                    result = await exportToExcel(processedData, exportConfig);
                    break;
                case 'csv':
                    result = await exportToCSV(processedData, exportConfig);
                    break;
                case 'pdf':
                    result = await exportToPDF(processedData, exportConfig);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${exportConfig.exportFormat}`);
            }

            const exportTime = Date.now() - startTime;
            setExportStatus('completed');

            // Track successful export
            analytics.trackExportAction('export_completed', {
                ...result,
                exportTime,
                performanceMode: exportConfig.performanceMode
            });

            // Success notification
            toast.success(`Export completed successfully! Downloaded: ${result.filename}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });

            if (onExportComplete) {
                onExportComplete(result);
            }

            // Close dialog after successful export
            setTimeout(() => {
                if (onClose) onClose();
            }, 1000);

        } catch (error) {
            console.error('Export failed:', error);
            const errorMessage = error.message || 'Export failed. Please try again.';
            
            setExportError(errorMessage);
            setExportStatus('error');
            
            // Track export failure
            analytics.trackExportAction('export_failed', {
                error: errorMessage,
                exportTime: Date.now() - startTime
            });

            if (onExportError) {
                onExportError(errorMessage);
            }

            // Error notification
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });

        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    }, [
        validation.isValid, data, users, exportConfig, analytics, 
        processExportData, exportToExcel, exportToCSV, exportToPDF,
        onExportComplete, onExportError, onClose
    ]);

    // Reset form state
    const resetForm = useCallback(() => {
        formState.resetToDefaults();
        setExportError(null);
        setExportStatus('idle');
        setExportProgress(0);
        analytics.trackEvent('form_reset');
    }, [formState, analytics]);

    // Save current configuration
    const saveConfiguration = useCallback(() => {
        const saved = formState.savePreferences();
        if (saved) {
            analytics.trackEvent('config_saved');
            toast.success('Configuration saved successfully');
        } else {
            toast.error('Failed to save configuration');
        }
        return saved;
    }, [formState, analytics]);

    // Load saved configuration
    const loadConfiguration = useCallback(() => {
        const loaded = formState.loadPreferences();
        if (loaded) {
            analytics.trackEvent('config_loaded');
            toast.success('Configuration loaded successfully');
        }
        return loaded;
    }, [formState, analytics]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            analytics.flushEvents();
        };
    }, [analytics]);

    return {
        // Form state
        formState,
        validation,
        analytics,
        
        // Export state
        isExporting,
        exportProgress,
        exportStatus,
        exportError,
        exportConfig,
        
        // Actions
        handleExport,
        resetForm,
        saveConfiguration,
        loadConfiguration,
        
        // Utilities
        processExportData,
        
        // Export functions (exposed for advanced usage)
        exportToExcel,
        exportToCSV,
        exportToPDF
    };
};
