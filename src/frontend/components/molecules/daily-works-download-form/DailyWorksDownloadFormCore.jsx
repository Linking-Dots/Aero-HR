import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
    FormControlLabel,
    Box,
    Typography,
    Chip,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Tooltip,
    Switch,
    TextField
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Info as InfoIcon,
    Speed as SpeedIcon,
    Assessment as AssessmentIcon,
    Security as SecurityIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useDailyWorksDownloadForm } from './hooks/useDailyWorksDownloadForm';
import { useDailyWorksDownloadFormValidation } from './hooks/useDailyWorksDownloadFormValidation';
import { DAILY_WORKS_DOWNLOAD_CONFIG } from './config';

/**
 * Core component for Daily Works Download Form
 * Provides enterprise-grade export interface for construction project management
 */
const DailyWorksDownloadFormCore = ({ 
    data = [], 
    users = [],
    onExport, 
    disabled = false,
    initialSelectedColumns = null,
    showPreview = true,
    showAdvancedOptions = true 
}) => {
    const theme = useTheme();
    
    // Form state management
    const {
        selectedColumns,
        exportFormat,
        performanceMode,
        filename,
        includeMetadata,
        includeTimestamp,
        estimatedExportTime,
        estimatedFileSize,
        summary,
        toggleColumn,
        toggleColumnCategory,
        selectAllColumns,
        deselectAllColumns,
        setExportFormat,
        setPerformanceMode,
        setFilename,
        setIncludeMetadata,
        setIncludeTimestamp,
        resetToDefaults,
        savePreferences,
        loadPreferences
    } = useDailyWorksDownloadForm({
        data,
        users,
        initialSelectedColumns
    });

    // Validation
    const {
        isValid,
        errors,
        warnings,
        stepValidation,
        businessRuleErrors,
        dataIntegrityErrors,
        performanceWarnings,
        securityChecks
    } = useDailyWorksDownloadFormValidation({
        selectedColumns,
        exportFormat,
        performanceMode,
        data,
        users,
        filename
    });

    // Get column categories for organization
    const columnCategories = DAILY_WORKS_DOWNLOAD_CONFIG.columnCategories;
    const exportFormats = DAILY_WORKS_DOWNLOAD_CONFIG.exportFormats;
    const performanceModes = DAILY_WORKS_DOWNLOAD_CONFIG.performanceModes;

    // Handle export action
    const handleExport = () => {
        if (isValid && onExport) {
            const exportConfig = {
                selectedColumns: selectedColumns.filter(col => col.checked),
                exportFormat,
                performanceMode,
                filename,
                includeMetadata,
                includeTimestamp,
                summary,
                estimatedExportTime,
                estimatedFileSize
            };
            onExport(exportConfig);
        }
    };

    // Get columns by category
    const getColumnsByCategory = (categoryKey) => {
        const category = columnCategories.find(cat => cat.key === categoryKey);
        if (!category) return [];
        
        return selectedColumns.filter(col => 
            category.columns.includes(col.key)
        );
    };

    // Calculate category selection status
    const getCategoryStatus = (categoryKey) => {
        const categoryColumns = getColumnsByCategory(categoryKey);
        const selectedCount = categoryColumns.filter(col => col.checked).length;
        
        if (selectedCount === 0) return 'none';
        if (selectedCount === categoryColumns.length) return 'all';
        return 'partial';
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 900 }}>
            {/* Export Configuration Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Export Configuration
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    {/* Export Format Selection */}
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Format</InputLabel>
                        <Select
                            value={exportFormat}
                            label="Format"
                            onChange={(e) => setExportFormat(e.target.value)}
                            disabled={disabled}
                        >
                            {Object.entries(exportFormats).map(([key, format]) => (
                                <MenuItem key={key} value={key}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>{format.label}</Typography>
                                        {format.recommended && (
                                            <Chip 
                                                label="Recommended" 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined" 
                                            />
                                        )}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Performance Mode Selection */}
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Performance</InputLabel>
                        <Select
                            value={performanceMode}
                            label="Performance"
                            onChange={(e) => setPerformanceMode(e.target.value)}
                            disabled={disabled}
                        >
                            {Object.entries(performanceModes).map(([key, mode]) => (
                                <MenuItem key={key} value={key}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SpeedIcon fontSize="small" />
                                        <Typography>{mode.label}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                    <Box sx={{ mb: 2 }}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Advanced Options</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Filename"
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                        size="small"
                                        disabled={disabled}
                                        helperText="File extension will be added automatically"
                                    />
                                    
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={includeMetadata}
                                                onChange={(e) => setIncludeMetadata(e.target.checked)}
                                                disabled={disabled}
                                            />
                                        }
                                        label="Include metadata sheet"
                                    />
                                    
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={includeTimestamp}
                                                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                                                disabled={disabled}
                                            />
                                        }
                                        label="Add timestamp to filename"
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                )}

                {/* Export Estimates */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Tooltip title="Estimated time to complete export">
                        <Chip
                            icon={<SpeedIcon />}
                            label={`Export Time: ~${estimatedExportTime}s`}
                            variant="outlined"
                            color={estimatedExportTime > 30 ? 'warning' : 'info'}
                        />
                    </Tooltip>
                    <Tooltip title="Estimated file size">
                        <Chip
                            icon={<AssessmentIcon />}
                            label={`File Size: ~${estimatedFileSize}`}
                            variant="outlined"
                            color="info"
                        />
                    </Tooltip>
                    <Tooltip title="Security status">
                        <Chip
                            icon={<SecurityIcon />}
                            label={securityChecks?.dataAccess ? 'Secure' : 'Review Required'}
                            variant="outlined"
                            color={securityChecks?.dataAccess ? 'success' : 'warning'}
                        />
                    </Tooltip>
                </Box>

                {/* Validation Errors */}
                {(errors.length > 0 || businessRuleErrors.length > 0 || dataIntegrityErrors.length > 0) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Please fix the following issues:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {[...errors, ...businessRuleErrors, ...dataIntegrityErrors].map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {/* Validation Warnings */}
                {(warnings.length > 0 || performanceWarnings.length > 0) && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Recommendations:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {[...warnings, ...performanceWarnings].map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </Alert>
                )}
            </Box>

            {/* Column Selection Section */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Column Selection
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                            label="Select All"
                            variant="outlined"
                            onClick={selectAllColumns}
                            disabled={disabled}
                            clickable
                        />
                        <Chip 
                            label="Clear All"
                            variant="outlined"
                            onClick={deselectAllColumns}
                            disabled={disabled}
                            clickable
                        />
                    </Box>
                </Box>

                {/* Summary Stats */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        label={`${selectedColumns.filter(col => col.checked).length} of ${selectedColumns.length} columns selected`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip 
                        label={`${summary.totalRecords} records to export`}
                        color="secondary"
                        variant="outlined"
                    />
                    <Chip 
                        label={`Quality Score: ${summary.dataQuality?.score || 0}%`}
                        color={summary.dataQuality?.score > 90 ? 'success' : 'warning'}
                        variant="outlined"
                    />
                </Box>

                {/* Column Categories */}
                {columnCategories.map((category) => {
                    const categoryColumns = getColumnsByCategory(category.key);
                    const categoryStatus = getCategoryStatus(category.key);
                    
                    if (categoryColumns.length === 0) return null;

                    return (
                        <Accordion 
                            key={category.key} 
                            defaultExpanded={category.key === 'basic' || category.defaultSelected}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.05)' 
                                        : 'rgba(0, 0, 0, 0.02)',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={categoryStatus === 'all'}
                                                indeterminate={categoryStatus === 'partial'}
                                                onChange={() => toggleColumnCategory(category.key)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={disabled}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {category.label}
                                                </Typography>
                                                <Chip 
                                                    label={`${categoryColumns.filter(col => col.checked).length}/${categoryColumns.length}`}
                                                    size="small"
                                                    color={categoryStatus === 'all' ? 'primary' : 'default'}
                                                />
                                            </Box>
                                        }
                                        sx={{ margin: 0 }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {category.description && (
                                        <Tooltip title={category.description}>
                                            <InfoIcon fontSize="small" color="action" />
                                        </Tooltip>
                                    )}
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormGroup>
                                    {categoryColumns.map((column) => (
                                        <FormControlLabel
                                            key={column.key}
                                            control={
                                                <Checkbox
                                                    checked={column.checked}
                                                    onChange={() => toggleColumn(column.key)}
                                                    disabled={disabled}
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography>{column.label}</Typography>
                                                    {column.required && (
                                                        <Chip 
                                                            label="Required" 
                                                            size="small" 
                                                            color="error" 
                                                            variant="outlined" 
                                                        />
                                                    )}
                                                    {column.description && (
                                                        <Tooltip title={column.description}>
                                                            <InfoIcon fontSize="small" color="action" />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    ))}
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Box>

            {/* Data Preview Section */}
            {showPreview && data.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Data Preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Preview of selected columns (showing first 5 records)
                    </Typography>
                    
                    <Table size="small" sx={{ border: 1, borderColor: 'divider' }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                {selectedColumns
                                    .filter(col => col.checked)
                                    .slice(0, 6) // Limit preview columns
                                    .map((column) => (
                                        <TableCell key={column.key} sx={{ fontWeight: 'bold' }}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                {selectedColumns.filter(col => col.checked).length > 6 && (
                                    <TableCell sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                                        ...and {selectedColumns.filter(col => col.checked).length - 6} more
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.slice(0, 5).map((row, index) => (
                                <TableRow key={index}>
                                    {selectedColumns
                                        .filter(col => col.checked)
                                        .slice(0, 6)
                                        .map((column) => {
                                            let cellValue = row[column.key] || '-';
                                            
                                            // Apply transformations for preview
                                            if (column.key === 'incharge' || column.key === 'assigned') {
                                                const user = users.find(user => user.id === row[column.key]);
                                                cellValue = user ? user.name : 'N/A';
                                            } else if (column.key === 'status' || column.key === 'type') {
                                                cellValue = cellValue.toString().charAt(0).toUpperCase() + cellValue.toString().slice(1);
                                            }
                                            
                                            return (
                                                <TableCell key={column.key}>
                                                    {cellValue}
                                                </TableCell>
                                            );
                                        })}
                                    {selectedColumns.filter(col => col.checked).length > 6 && (
                                        <TableCell sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            ...
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    {data.length > 5 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            ...and {data.length - 5} more records
                        </Typography>
                    )}
                </Box>
            )}

            {/* Export Progress */}
            {stepValidation.currentStep && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                        Validation Progress: {stepValidation.currentStep}
                    </Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={(stepValidation.completedSteps / 4) * 100} 
                        sx={{ height: 6, borderRadius: 3 }}
                        color={isValid ? 'success' : 'primary'}
                    />
                </Box>
            )}

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Chip 
                    label="Reset"
                    variant="outlined"
                    onClick={resetToDefaults}
                    disabled={disabled}
                    clickable
                />
                <Chip 
                    label="Save Config"
                    variant="outlined"
                    onClick={savePreferences}
                    disabled={disabled}
                    clickable
                />
                <Chip 
                    label="Load Config"
                    variant="outlined"
                    onClick={loadPreferences}
                    disabled={disabled}
                    clickable
                />
            </Box>
        </Box>
    );
};

export default DailyWorksDownloadFormCore;
