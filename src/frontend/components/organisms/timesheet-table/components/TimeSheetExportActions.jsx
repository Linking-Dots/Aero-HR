/**
 * TimeSheetExportActions Component
 * 
 * Export action buttons for timesheet data including Excel, PDF export
 * and refresh functionality.
 * 
 * @component
 * @example
 * <TimeSheetExportActions
 *   downloadExcel={downloadExcel}
 *   downloadPDF={downloadPDF}
 *   handleRefresh={handleRefresh}
 *   isLoaded={isLoaded}
 *   hasData={hasData}
 *   theme={theme}
 * />
 */

import React from "react";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { 
    Refresh, 
    FileDownload, 
    PictureAsPdf 
} from '@mui/icons-material';
import { TIMESHEET_TABLE_CONFIG } from "../config";

const TimeSheetExportActions = ({
    downloadExcel,
    downloadPDF,
    handleRefresh,
    isLoaded = true,
    hasData = false,
    theme,
    isCompact = false
}) => {
    const { export: exportConfig } = TIMESHEET_TABLE_CONFIG;
    const iconSize = isCompact ? "small" : "medium";

    const actionStyle = (color) => ({
        background: alpha(color, 0.1),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color, 0.2)}`,
        '&:hover': {
            background: alpha(color, 0.2),
            transform: 'scale(1.05)'
        },
        '&:disabled': {
            opacity: 0.5
        },
        ...(isCompact && {
            width: 32,
            height: 32,
            minWidth: 32
        })
    });

    return (
        <Stack direction="row" spacing={1}>
            {/* Excel Export */}
            <Tooltip title="Download as Excel">
                <IconButton 
                    onClick={downloadExcel}
                    disabled={!isLoaded || !hasData}
                    size={iconSize}
                    sx={actionStyle(theme.palette.success.main)}
                    aria-label="Export timesheet to Excel"
                >
                    <FileDownload 
                        sx={{ 
                            color: theme.palette.success.main,
                            fontSize: isCompact ? '1rem' : '1.25rem'
                        }} 
                    />
                </IconButton>
            </Tooltip>

            {/* PDF Export */}
            <Tooltip title="Download as PDF">
                <IconButton 
                    onClick={downloadPDF}
                    disabled={!isLoaded || !hasData}
                    size={iconSize}
                    sx={actionStyle(theme.palette.error.main)}
                    aria-label="Export timesheet to PDF"
                >
                    <PictureAsPdf 
                        sx={{ 
                            color: theme.palette.error.main,
                            fontSize: isCompact ? '1rem' : '1.25rem'
                        }} 
                    />
                </IconButton>
            </Tooltip>

            {/* Refresh */}
            <Tooltip title="Refresh Timesheet">
                <IconButton 
                    onClick={handleRefresh}
                    disabled={!isLoaded}
                    size={iconSize}
                    sx={actionStyle(theme.palette.primary.main)}
                    aria-label="Refresh timesheet data"
                >
                    <Refresh 
                        sx={{ 
                            color: theme.palette.primary.main,
                            fontSize: isCompact ? '1rem' : '1.25rem'
                        }} 
                    />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};

export default TimeSheetExportActions;
