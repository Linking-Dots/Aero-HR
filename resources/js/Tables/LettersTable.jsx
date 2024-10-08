import DataTable from 'react-data-table-component';
import {
    Avatar,
    Box,
    CircularProgress,
    GlobalStyles,
} from '@mui/material';
import {SelectItem, Select, Input, Textarea, Checkbox, ButtonGroup, Button, Link, Tooltip} from '@nextui-org/react';
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
                '& .hZUxNm': {
                    'white-space': 'normal',
                },
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
            },
            top: 0,
            zIndex: 1, // Ensure header is above the scrollable body
        },
        '& .rdt_TableBody': {
            overflowY: 'auto',
            maxHeight: '52vh',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            '-ms-overflow-style': 'none',  // IE and Edge
            'scrollbar-width': 'none',  // Firefox
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

    const [editingRow, setEditingRow] = useState(null);

    const userIsAdmin = auth.roles.includes('Administrator');
    const userIsSe = auth.roles.includes('Supervision Engineer');

    const columns = [
        {
            name: 'From',
            selector: row => row.from,
            sortable: true,
            center: 'true',
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            center: 'true',
            width: '170px',
            cell: row => (
                <Select
                    aria-label={'Status'}
                    color={getStatusColor(row.status)}
                    placeholder="Select Status"
                    value={row.status}
                    onChange={(e) => handleChange(row.id, 'status', e.target.value)}
                    fullWidth
                    selectedKeys={[row.status]}
                    popoverProps={{
                        classNames: {
                            content: "bg-transparent backdrop-blur-lg border-inherit",
                        },
                    }}
                >
                    {['Open', 'Closed'].map(option => (
                        <SelectItem key={option} value={row.status}>
                            {option}
                        </SelectItem>
                    ))}
                </Select>
            ),
        },
        {
            name: 'Received Date',
            selector: row => row.received_date,
            sortable: true,
            center: 'true',
            width: '160px',
            cell: row => (
                <Input
                    variant={'underlined'}
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
            center: 'true',
            width: '140px',
        },
        {
            name: 'Subject',
            selector: row => row.subject,
            sortable: true,
            left: true,
            width: '260px',
            cell: row => (
                <Tooltip
                    content={row.subject}
                    placement="top"
                    showArrow={true}
                    radius={'md'}
                    size={'md'}
                    classNames={{
                        content: [
                            'bg-transparent backdrop-blur-lg border border-gray-200',
                            'max-w-[300px] text-sm',
                        ]
                    }}
                >
                    <Box sx={{
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {row.subject}
                    </Box>
                </Tooltip>
            ),
        },
        {
            name: 'Action Taken',
            selector: row => row.action_taken,
            sortable: true,
            left: true,
            width: '250px',
            cell: row => {
                const [inputValue, setInputValue] = useState(row.action_taken);
                const handleInputChange = (event) => {
                    setInputValue(event.target.value);
                };
                const handleBlur = () => {
                    handleChange(row.id,'action_taken', inputValue);
                };

                return (
                    <Textarea
                        variant="underlined"
                        size={'sm'}
                        radius={'sm'}
                        maxRows={2}
                        fullWidth
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                    />
                )
            },
        },
        {
            name: 'Handling Link',
            selector: row => row.handling_link,
            sortable: true,
            center: 'true',
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
            center: 'true',
            width: '180px',
            cell: row => (
                <Select
                    aria-label={'Handling Status'}
                    color={getStatusColor(row.handling_status)}
                    placeholder="Select Status"
                    value={row.handling_status}
                    onChange={(e) => handleChange(row.id, 'handling_status', e.target.value)}
                    fullWidth
                    selectedKeys={[row.handling_status]}
                    popoverProps={{
                        classNames: {
                            content: "bg-transparent backdrop-blur-lg border-inherit",
                        },
                    }}
                >
                    {['Processing', 'Signed', 'Sent'].map(option => (
                        <SelectItem key={option} value={row.handling_status}>
                            {option}
                        </SelectItem>
                    ))}
                </Select>
            ),
        },
        {
            name: 'Need Reply',
            selector: row => row.need_reply,
            center: 'true',
            width: '80px',
            cell: row => (
                <Checkbox
                    isSelected={row.need_reply}
                    onChange={(e) => handleChange(row.id, 'need_reply', e.target.checked)}
                />
            ),
        },
        {
            name: 'Replied Status',
            selector: row => row.replied_status,
            center: 'true',
            width: '80px',
            cell: row => (
                <Checkbox
                    isSelected={row.replied_status}
                    onChange={(e) => handleChange(row.id, 'replied_status', e.target.checked)}
                />
            ),
        },
        {
            name: 'Need Forward',
            selector: row => row.need_forward,
            center: 'true',
            width: '80px',
            cell: row => (
                <Checkbox
                    isSelected={row.need_forward}
                    onChange={(e) => handleChange(row.id, 'need_forward', e.target.checked)}
                />
            ),
        },
        {
            name: 'Forwarded Status',
            selector: row => row.forwarded_status,
            center: 'true',
            width: '90px',
            cell: row => (
                <Checkbox
                    isSelected={row.forwarded_status}
                    onChange={(e) => handleChange(row.id, 'forwarded_status', e.target.checked)}
                />
            ),
        },
        {
            name: 'Dealt By',
            selector: row => row.dealt_by,
            sortable: true,
            center: 'true',
            width: '200px',
            cell: row => {
                const user = users.find(u => u.id === row.dealt_by);
                return user ? (
                    <Box css={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.profile_image} alt={user.name} css={{ marginRight: '8px' }} />
                        {user.name}
                    </Box>
                ) : 'N/A';
            },
        },
        {
            name: 'Actions',
            center: 'true',
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
            case 'Open':
                return 'danger';
            case 'Closed':
                return 'success';
            case 'Processing':
                return 'warning';
            case 'Signed':
                return 'info';
            case 'Sent':
                return 'primary';
            default:
                return '';
        }
    };
    const handleChange = async (letterId, key, value) => {
        console.log(letterId,key,value)
        try {
            const response = await axios.put(route('letters.update'), {
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
                columns={columns}
                data={allData}
                loading={loading}
                loadingComponent={<CircularProgress />}
                defaultSortField="received_date"
                highlightOnHover
                responsive
                dense
            />

        </div>

    );
};

export default LettersTable;
