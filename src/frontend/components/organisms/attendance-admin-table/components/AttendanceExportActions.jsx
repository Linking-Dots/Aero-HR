/**
 * AttendanceExportActions Component
 * 
 * Export action buttons for attendance data including Excel and PDF export functionality.
 * Provides download capabilities with proper formatting and styling for monthly attendance reports.
 * 
 * @component
 * @example
 * ```jsx
 * <AttendanceExportActions
 *   onExcelExport={handleExcelExport}
 *   onPdfExport={handlePdfExport}
 *   onRefresh={handleRefresh}
 *   loading={false}
 *   hasData={true}
 * />
 * ```
 */

import React from 'react';
import { 
    IconButton, 
    Stack, 
    Tooltip,
    useMediaQuery 
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { 
    Refresh, 
    FileDownload, 
    PictureAsPdf 
} from '@mui/icons-material';

const AttendanceExportActions = ({ 
    onExcelExport,
    onPdfExport,
    onRefresh,
    loading = false,
    hasData = false,
    className = ""
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Stack 
            direction="row" 
            spacing={1}
            className={className}
            role="toolbar"
            aria-label="Export and refresh actions"
        >
            <Tooltip title="Download as Excel">
                <IconButton 
                    onClick={onExcelExport}
                    disabled={loading || !hasData}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                        background: alpha(theme.palette.success.main, 0.1),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        '&:hover': {
                            background: alpha(theme.palette.success.main, 0.2),
                            transform: 'scale(1.05)'
                        },
                        '&:disabled': { 
                            opacity: 0.5,
                            transform: 'none'
                        }
                    }}
                    aria-label="Download attendance data as Excel file"
                >
                    <FileDownload sx={{ color: theme.palette.success.main }} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Download as PDF">
                <IconButton 
                    onClick={onPdfExport}
                    disabled={loading || !hasData}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                        background: alpha(theme.palette.error.main, 0.1),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        '&:hover': {
                            background: alpha(theme.palette.error.main, 0.2),
                            transform: 'scale(1.05)'
                        },
                        '&:disabled': { 
                            opacity: 0.5,
                            transform: 'none'
                        }
                    }}
                    aria-label="Download attendance data as PDF file"
                >
                    <PictureAsPdf sx={{ color: theme.palette.error.main }} />
                </IconButton>
            </Tooltip>

            {onRefresh && (
                <Tooltip title="Refresh Data">
                    <IconButton 
                        onClick={onRefresh}
                        disabled={loading}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                            background: alpha(theme.palette.primary.main, 0.1),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.2),
                                transform: 'scale(1.05)'
                            },
                            '&:disabled': { 
                                opacity: 0.5,
                                transform: 'none'
                            }
                        }}
                        aria-label="Refresh attendance data"
                    >
                        <Refresh color="primary" />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    );
};

export default AttendanceExportActions;
