import React, {useState} from "react";
import {
    Checkbox,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import {useTheme} from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";
import {Download} from '@mui/icons-material';

import * as XLSX from 'xlsx';


const DailyWorkSummaryDownloadForm = ({ open, closeModal,  filteredData, users }) => {
    console.log(users)

    const [processing, setProcessing] = useState(false);
    const theme = useTheme();
    const columns = [
        { label: 'Date', key: 'date' },
        { label: 'Total Daily Works', key: 'totalDailyWorks' },
        { label: 'Resubmissions', key: 'resubmissions' },
        { label: 'Embankment', key: 'embankment' },
        { label: 'Structure', key: 'structure' },
        { label: 'Pavement', key: 'pavement' },
        { label: 'Completed', key: 'completed' },
        { label: 'Pending', key: 'pending' },
        { label: 'Completion Percentage', key: 'completionPercentage' },
        { label: 'RFI Submissions', key: 'rfiSubmissions' },
        { label: 'RFI Submission Percentage', key: 'rfiSubmissionPercentage' },

    ];

    const [selectedColumns, setSelectedColumns] = useState(
        columns.map(column => ({ ...column, checked: true })) // All columns checked by default
    );

    const handleCheckboxChange = (index) => {
        const newColumns = [...selectedColumns];
        newColumns[index].checked = !newColumns[index].checked;
        setSelectedColumns(newColumns);
    };

    // Function to handle export with selected columns
    const exportToExcel = async (selectedColumns) => {
        const promise = new Promise((resolve, reject) => {
            try {
                // Filter the columns based on the user's selection
                const exportData = filteredData.map(row => {
                    const selectedRow = {};

                    selectedColumns.forEach(column => {
                        if (column.checked) {
                            selectedRow[column.label] = row[column.key];
                        }
                    });

                    return selectedRow;
                });

                // Create and download Excel file
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Work Summary');
                XLSX.writeFile(workbook, 'DailyWorkSummary.xlsx');

                // Notify success
                resolve('Export successful!');
                closeModal(); // Close the modal

            } catch (error) {
                // Handle any errors that occur during the export process
                reject('Failed to export data. Please try again.');
                console.error("Error exporting data to Excel:", error);
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Exporting data to Excel ...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                success: {
                    render({ data }) {
                        return (
                            <>
                                {data}
                            </>
                        );
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                error: {
                    render({ data }) {
                        return (
                            <>
                                {data}
                            </>
                        );
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                }
            }
        );
    };





    return (
        <GlassDialog open={open} onClose={closeModal}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography>Export Daily Works</Typography>
                <IconButton
                    variant="outlined"
                    color="primary"
                    onClick={closeModal}
                    sx={{ position: 'absolute', top: 8, right: 16 }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>

                <Table
                    size="small"
                    sx={{
                        '& .MuiTableCell-root': {
                            padding: '4px 8px', // Adjust padding for more compact cells
                        },
                        '& .MuiCheckbox-root': {
                            padding: '0px', // Remove default padding around checkbox
                        }
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Column Label</TableCell>
                            <TableCell align="center">Include in Export</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedColumns.map((column, index) => (
                            <TableRow key={column.key}>
                                <TableCell>{column.label}</TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        checked={column.checked}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </DialogContent>
            <DialogActions
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}
            >
                <LoadingButton
                    sx={{
                        borderRadius: '50px',
                        padding: '6px 16px',
                    }}
                    variant="outlined"
                    color="primary"
                    type="submit"
                    onClick={() => exportToExcel(selectedColumns)}
                    startIcon={<Download />}
                >
                    Download
                </LoadingButton>
            </DialogActions>
        </GlassDialog>
    );
};

export default DailyWorkSummaryDownloadForm;
