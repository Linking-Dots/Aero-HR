import DataTable from 'react-data-table-component';
import {
    Avatar,
    Box,
    CircularProgress,
    GlobalStyles,
} from '@mui/material';
import {SelectItem, Select, Input, Textarea, Checkbox, ButtonGroup, Button, Link} from '@nextui-org/react';
import {styled, useTheme} from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewIcon from '@mui/icons-material/FiberNew'; // Example icon for "New"
import ResubmissionIcon from '@mui/icons-material/Replay'; // Example icon for "Resubmission"
import CompletedIcon from '@mui/icons-material/CheckCircle'; // Example icon for "Completed"
import EmergencyIcon from '@mui/icons-material/Error';
import {toast} from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Pagination} from "@nextui-org/react";
import Loader from "@/Components/Loader.jsx";
import {  usePage } from '@inertiajs/react';
import LinkIcon from '@mui/icons-material/Link';

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

            maxHeight: '52vh',
            '& .rdt_TableRow': {
                minHeight: 'auto',
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

const LettersTable = ({ allData, setData, users, loading, handleClickOpen, openModal, setCurrentRow }) => {
    const { auth } = usePage().props;
    const theme = useTheme();

    const userIsAdmin = auth.roles.includes('Administrator');
    const userIsSe = auth.roles.includes('Supervision Engineer');

    const columns = [
        {
            name: 'From',
            selector: row => row.from,
            sortable: true,
            center: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            center: true,
            width: '170px',
            cell: row => (
                <Select
                    variant={'bordered'}
                    placeholder="Select Status"
                    value={row.status}
                    onChange={(value) => handleChange(row.id, 'status', value)}
                    fullWidth
                >
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                </Select>
            ),
        },
        {
            name: 'Received Date',
            selector: row => row.received_date,
            sortable: true,
            center: true,
            width: '160px',
            cell: row => (
                <Input
                    variant={'bordered'}
                    type="date"
                    fullWidth
                    value={row.received_date}
                    onChange={(e) => handleChange(row.id, 'received_date', e.target.value)}
                />
            ),
        },
        {
            name: 'Memo Number',
            selector: row => row.memo_number,
            sortable: true,
            center: true,
            width: '140px',
        },
        {
            name: 'Subject',
            selector: row => row.subject,
            sortable: true,
            left: true,
            width: '260px',
            cell: row => (
                <Box sx={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                }}>
                    {row.subject}
                </Box>
            ),
        },
        {
            name: 'Action Taken',
            selector: row => row.action_taken,
            sortable: true,
            left: true,
            width: '250px',
            cell: row => (
                <Textarea
                    variant={'bordered'}
                    fullWidth
                    value={row.action_taken || ''}
                    onChange={(e) => handleChange(row.id, 'action_taken', e.target.value)}
                />
            ),
        },
        {
            name: 'Response Date',
            selector: row => row.response_date,
            sortable: true,
            center: true,
            width: '160px',
            cell: row => (
                <Input
                    variant={'bordered'}
                    type="date"
                    fullWidth
                    value={row.response_date || ''}
                    onChange={(e) => handleChange(row.id, 'response_date', e.target.value)}
                />
            ),
        },
        {
            name: 'Handling Link',
            selector: row => row.handling_link,
            sortable: true,
            center: true,
            width: '200px',
            cell: row => (
                <Link
                    isExternal
                    showAnchorIcon
                    href={row.handling_link || '#'}
                    anchorIcon={<LinkIcon />}
                >
                    {row.handling_memo || 'N/A'}
                </Link>
            ),
        },
        {
            name: 'Handling Status',
            selector: row => row.handling_status,
            sortable: true,
            center: true,
            width: '180px',
            cell: row => (
                <Select
                    variant={'bordered'}
                    value={row.handling_status}
                    onChange={(value) => handleChange(row.id, 'handling_status', value)}
                    fullWidth
                >
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                </Select>
            ),
        },
        {
            name: 'Need Reply',
            selector: row => row.need_reply,
            sortable: true,
            center: true,
            width: '120px',
            cell: row => (
                <Checkbox
                    checked={row.need_reply}
                    onChange={(e) => handleChange(row.id, 'need_reply', e.target.checked)}
                />
            ),
        },
        {
            name: 'Replied Status',
            selector: row => row.replied_status,
            sortable: true,
            center: true,
            width: '150px',
            cell: row => (
                <Checkbox
                    checked={row.replied_status}
                    onChange={(e) => handleChange(row.id, 'replied_status', e.target.checked)}
                />
            ),
        },
        {
            name: 'Need Forward',
            selector: row => row.need_forward,
            sortable: true,
            center: true,
            width: '120px',
            cell: row => (
                <Checkbox
                    checked={row.need_forward}
                    onChange={(e) => handleChange(row.id, 'need_forward', e.target.checked)}
                />
            ),
        },
        {
            name: 'Forwarded Status',
            selector: row => row.forwarded_status,
            sortable: true,
            center: true,
            width: '150px',
            cell: row => (
                <Checkbox
                    checked={row.forwarded_status}
                    onChange={(e) => handleChange(row.id, 'forwarded_status', e.target.checked)}
                />
            ),
        },
        {
            name: 'Dealt By',
            selector: row => row.dealt_by,
            sortable: true,
            center: true,
            width: '200px',
            cell: row => {
                const user = users.find(u => u.id === row.dealt_by);
                return user ? (
                    <Box css={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} alt={user.name} css={{ marginRight: '8px' }} />
                        {user.name}
                    </Box>
                ) : 'N/A';
            },
        },
        {
            name: 'Actions',
            center: true,
            width: '150px',
            cell: row => (
                <ButtonGroup>
                    <Button onClick={() => openModal('editLetter', row)}>Edit</Button>
                    <Button color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
                </ButtonGroup>
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
    const handleChange = async (letterId, key, value) => {
        try {
            const response = await axios.post(route('dailyWorks.update'), {
                id: letterId,
                [key]: value,
            });


            if (response.status === 200) {
                setData(prevLetters =>
                    prevLetters.map(letter =>
                        letter.id === letterId ? { ...letter, [key]: value } : letter
                    )
                );

                toast.success(...response.data.messages || `Letter updated successfully`, {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            } else {
                toast.error(response.data.error || `Failed to update letter ${[key]}.`, {
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
        <div>
            {loading && <Loader/>}
            <GlobalStyles
                styles={{
                    '& .cgTKyH': {
                        backgroundColor: 'transparent !important',
                        color: theme.palette.text.primary

                    },
                }}
            />
            <CustomDataTable
                classNames={{
                    base: "max-h-[84vh] overflow-scroll",
                    table: "min-h-[84vh]",
                }}
                columns={columns}
                data={allData}
                loading={loading}
                loadingComponent={<CircularProgress />}
                defaultSortField="date"
                highlightOnHover
                responsive
                dense
            />

        </div>

    );
};

export default LettersTable;
