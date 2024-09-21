import React from 'react';
import DataTable from 'react-data-table-component';
import {Avatar, Box, CircularProgress, GlobalStyles, IconButton, MenuItem, Select, TextField,} from '@mui/material';
import {styled, useTheme} from '@mui/material/styles';
import {usePage} from "@inertiajs/react";
import NewIcon from '@mui/icons-material/FiberNew'; // Example icon for "New"
import ResubmissionIcon from '@mui/icons-material/Replay'; // Example icon for "Resubmission"
import CompletedIcon from '@mui/icons-material/CheckCircle'; // Example icon for "Completed"
import EmergencyIcon from '@mui/icons-material/Error';
import {toast} from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CustomDataTable = styled(DataTable)(({ theme }) => ({

    '& .rdt_Table': {
        backgroundColor: 'transparent',
        '& .rdt_TableHead': {
            '& .rdt_TableHeadRow': {
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
            },
            top: 0,
            zIndex: 1, // Ensure header is above the scrollable body
        },
        '& .rdt_TableBody': {
            overflowY: 'auto',
            maxHeight: '52vh',
            '& .rdt_TableRow': {
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
                '& .rdt_TableCol': {
                    backgroundColor: 'transparent',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    width: 'auto', // Ensure columns can grow to fit content
                    whiteSpace: 'nowrap', // Prevent wrapping, adjust based on your needs
                },
            },
            '& .rdt_TableRow:hover': {
                backgroundColor: theme.palette.action.hover,
            },
        },
    },


}));

const DailyWorksTable = ({ handleClickOpen, allInCharges,setDailyWorks, reports, juniors, reports_with_daily_works, openModal, setCurrentRow, filteredData, setFilteredData }) => {
    const { auth } = usePage().props;
    const theme = useTheme();

    const userIsAdmin = auth.roles.includes('Administrator');
    const userIsSe = auth.roles.includes('se');

    const columns = [
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Total Daily Works',
            selector: row => row.totalDailyWorks,
            sortable: true,
            center: true,
            width: '160px',
        },
        {
            name: 'Resubmissions',
            selector: row => row.resubmissions,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Embankment',
            selector: row => row.embankment,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Structure',
            selector: row => row.structure,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Pavement',
            selector: row => row.pavement,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Completed',
            selector: row => row.completed,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Pending',
            selector: row => row.pending,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Completion Percentage',
            selector: row => row.completionPercentage,
            sortable: true,
            center: true,
            width: '180px',
            cell: row => (
                <Box sx={{
                    textAlign: 'center',
                    color: row.completionPercentage >= 100 ? 'green' : 'red',
                }}>
                    {row.completionPercentage}%
                </Box>
            ),
        },
        {
            name: 'RFI Submissions',
            selector: row => row.rfiSubmissions,
            sortable: true,
            center: true,
            width: '160px',
        },
        {
            name: 'RFI Submission Percentage',
            selector: row => row.rfiSubmissionPercentage,
            sortable: true,
            center: true,
            width: '180px',
            cell: row => (
                <Box sx={{
                    textAlign: 'center',
                    color: row.rfiSubmissionPercentage >= 100 ? 'green' : 'red',
                }}>
                    {row.rfiSubmissionPercentage}%
                </Box>
            ),
        },
    ];





    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'blue';
            case 'resubmission':
                return 'orange';
            case 'completed':
                return 'green';
            case 'emergency':
                return 'red';
            default:
                return '';
        }
    };


    const handleChange = async (taskId, key, value) => {
        try {
            const response = await axios.post(route('dailyWorks.update'), {
                id: taskId,
                [key]: value,
            });
            console.log(response);

            if (response.status === 200) {
                setDailyWorks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, [key]: value } : task
                    )
                );
                setFilteredData(prevFilteredData =>
                    prevFilteredData.map(task =>
                        task.id === taskId ? { ...task, [key]: value } : task
                    )
                );

                toast.success(...response.data.messages || `Task updated successfully`, {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            } else {
                toast.error(response.data.error || `Failed to update task ${[key]}.`, {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An unexpected error occurred.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        }
    };



    return (
        <>
            <GlobalStyles
                styles={{
                    '& .cgTKyH': {
                        backgroundColor: 'transparent !important',
                        color: theme.palette.text.primary

                    },
                }}
            />
            <CustomDataTable
                columns={columns}
                data={filteredData}
                defaultSortField="date"
                defaultSortFieldId={1}
                defaultSortAsc={false}
                pagination
                highlightOnHover
                responsive
            />
        </>

    );
};

export default DailyWorksTable;
