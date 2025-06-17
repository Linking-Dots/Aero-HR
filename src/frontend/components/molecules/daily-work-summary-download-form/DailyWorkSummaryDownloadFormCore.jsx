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
    Tooltip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Info as InfoIcon,
    Speed as SpeedIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useDailyWorkSummaryDownloadForm } from './hooks/useDailyWorkSummaryDownloadForm';
import { useDailyWorkSummaryDownloadFormValidation } from './hooks/useDailyWorkSummaryDownloadFormValidation';
import { DAILY_WORK_SUMMARY_DOWNLOAD_CONFIG } from './config';

/**
 * Core component for Daily Work Summary Download Form
 * Provides enterprise-grade export interface for construction project management
 */
const DailyWorkSummaryDownloadFormCore = ({ 
    data = [], 
    onExport, 
    disabled = false,
    initialSelectedColumns = null,
    showPreview = true 
}) => {
    const theme = useTheme();
    
    // Form state management
    const {
        selectedColumns,
        exportFormat,
        performanceMode,
        estimatedExportTime,
        estimatedFileSize,
        summary,
        toggleColumn,
        toggleColumnCategory,
        setExportFormat,
        setPerformanceMode,
        resetToDefaults,
        savePreferences,
        loadPreferences
    } = useDailyWorkSummaryDownloadForm({
        data,
        initialSelectedColumns
    });

    // Validation
    const {
        isValid,
        errors,
        warnings,
        stepValidation,
        validateStep
    } = useDailyWorkSummaryDownloadFormValidation({
        selectedColumns,
        exportFormat,
        data,
        performanceMode
    });

    // Get column categories for organization
    const columnCategories = DAILY_WORK_SUMMARY_DOWNLOAD_CONFIG.columnCategories;
    const exportFormats = DAILY_WORK_SUMMARY_DOWNLOAD_CONFIG.exportFormats;
    const performanceModes = DAILY_WORK_SUMMARY_DOWNLOAD_CONFIG.performanceModes;

    // Handle export action
    const handleExport = () => {
        if (isValid && onExport) {
            const exportConfig = {
                selectedColumns: selectedColumns.filter(col => col.checked),
                exportFormat,
                performanceMode,
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
        <Box sx={{ width: '100%', maxWidth: 800 }}>
            {/* Export Configuration Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Export Configuration
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    {/* Export Format Selection */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
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
                    <FormControl size="small" sx={{ minWidth: 120 }}>
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

                {/* Export Estimates */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Tooltip title="Estimated time to complete export">
                        <Chip
                            icon={<SpeedIcon />}
                            label={`Export Time: ${estimatedExportTime}s`}
                            variant="outlined"
                            color="info"
                        />
                    </Tooltip>
                    <Tooltip title="Estimated file size">
                        <Chip
                            icon={<AssessmentIcon />}
                            label={`File Size: ${estimatedFileSize}`}
                            variant="outlined"
                            color="info"
                        />
                    </Tooltip>
                </Box>

                {/* Validation Errors */}
                {errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Please fix the following issues:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {/* Validation Warnings */}
                {warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Recommendations:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </Alert>
                )}
            </Box>

            {/* Column Selection Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Column Selection
                </Typography>

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
                </Box>

                {/* Column Categories */}
                {columnCategories.map((category) => {
                    const categoryColumns = getColumnsByCategory(category.key);
                    const categoryStatus = getCategoryStatus(category.key);
                    
                    if (categoryColumns.length === 0) return null;

                    return (
                        <Accordion key={category.key} defaultExpanded={category.key === 'basic'}>
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
                                        .map((column) => (
                                            <TableCell key={column.key}>
                                                {row[column.key] || '-'}
                                            </TableCell>
                                        ))}
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
                    />
                </Box>
            )}
        </Box>
    );
};

export default DailyWorkSummaryDownloadFormCore;
