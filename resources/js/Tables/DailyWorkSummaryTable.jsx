import React from 'react';
import DataTable from 'react-data-table-component';
import {Box, GlobalStyles} from '@mui/material';
import {styled, useTheme} from '@mui/material/styles';
import {usePage} from "@inertiajs/react";


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

const DailyWorksTable = ({ filteredData }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
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
            selector: row => row.totalDailyWorks - row.completed,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Completion Percentage',
            selector: row => row.totalDailyWorks > 0 ? parseFloat((row.completed / row.totalDailyWorks * 100).toFixed(1)) : 0,
            sortable: true,
            center: true,
            width: '180px',
            cell: row => {
                const completionPercentage = row.totalDailyWorks > 0
                    ? (row.completed / row.totalDailyWorks * 100).toFixed(1)
                    : 0;
                return (
                    <Box sx={{
                        textAlign: 'center',
                        color: completionPercentage >= 100 ? 'green' : 'red',
                    }}>
                        {completionPercentage}%
                    </Box>
                );
            },
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
            selector: row => row.rfiSubmissions > 0 ? parseFloat((row.rfiSubmissions / row.completed * 100).toFixed(1)) : 0,
            sortable: true,
            center: true,
            width: '180px',
            cell: row => {
                const rfiSubmissionPercentage = row.rfiSubmissions > 0
                    ? (row.rfiSubmissions / row.completed * 100).toFixed(1)
                    : 0;
                return (
                    <Box sx={{
                        textAlign: 'center',
                        color: rfiSubmissionPercentage >= 100 ? 'green' : 'red',
                    }}>
                        {rfiSubmissionPercentage}%
                    </Box>
                );
            },
        },
    ];

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
