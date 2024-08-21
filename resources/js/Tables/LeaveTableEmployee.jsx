import React, { useState } from 'react';
import {
    Avatar,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountCircle, Delete, Edit } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import { usePage, Link } from '@inertiajs/react';

const LeaveTableEmployee = ({ allUsers, departments, designations }) => {
    const [users, setUsers] = useState(allUsers);
    const theme = useTheme();
    const [anchorEls, setAnchorEls] = useState({});

    const handleChange = async (key, id, event) => {
        const newValue = event.target.value;

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(route('profile.update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ id, [key]: newValue }),
                });

                const data = await response.json();

                if (response.ok) {
                    setUsers((prevUsers) =>
                        prevUsers.map((user) => {
                            if (user.id === id) {
                                const updatedUser = { ...user };

                                if (key === 'department' && user.department !== newValue) {
                                    updatedUser.designation = null;
                                }

                                updatedUser[key] = newValue;
                                return updatedUser;
                            }
                            return user;
                        })
                    );
                    resolve([...data.messages]);
                } else {
                    reject(data.messages);
                }
            } catch (error) {
                reject(['An unexpected error occurred.']);
            }
        });

        toast.promise(promise, {
            pending: {
                render() {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress />
                            <span style={{ marginLeft: '8px' }}>Updating employee {key}...</span>
                        </div>
                    );
                },
                icon: false,
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                },
            },
            success: {
                render({ data }) {
                    return data.map((message, index) => <div key={index}>{message}</div>);
                },
                icon: '🟢',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                },
            },
            error: {
                render({ data }) {
                    return data.map((message, index) => <div key={index}>{message}</div>);
                },
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                },
            },
        });
    };

    const handleDelete = async (userId) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(route('profile.delete'), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ user_id: userId }),
                });

                const data = await response.json();

                if (response.ok) {
                    setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
                    resolve([data.message]);
                } else {
                    reject([data.message]);
                }
            } catch (error) {
                reject(['An error occurred while deleting user. Please try again.']);
            }
        });

        toast.promise(promise, {
            pending: {
                render() {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress />
                            <span style={{ marginLeft: '8px' }}>Deleting user...</span>
                        </div>
                    );
                },
                icon: false,
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                },
            },
            success: {
                render({ data }) {
                    return data.map((message, index) => <div key={index}>{message}</div>);
                },
                icon: '🟢',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                },
            },
            error: {
                render({ data }) {
                    return data.map((message, index) => <div key={index}>{message}</div>);
                },
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                },
            },
        });
    };

    const handleClick = (event, id) => {
        setAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleClose = (id) => {
        setAnchorEls((prev) => ({ ...prev, [id]: null }));
    };

    return (
        <TableContainer style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>No of Days</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Approved by</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.leave_type || 'N/A'}</TableCell>
                            <TableCell>{user.from_date || 'N/A'}</TableCell>
                            <TableCell>{user.to_date || 'N/A'}</TableCell>
                            <TableCell>{user.no_of_days || 'N/A'}</TableCell>
                            <TableCell>{user.reason || 'N/A'}</TableCell>
                            <TableCell>{user.status || 'N/A'}</TableCell>
                            <TableCell>
                                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar
                                        src={`assets/img/profiles/${user.approved_by_image}`}
                                        alt={user.approved_by}
                                    />
                                    <span style={{ marginLeft: '10px' }}>
                                        {user.approved_by || 'N/A'}
                                    </span>
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <IconButton onClick={(e) => handleClick(e, user.id)}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEls[user.id]}
                                    open={Boolean(anchorEls[user.id])}
                                    onClose={() => handleClose(user.id)}
                                >
                                    <MenuItem onClick={() => handleChange('edit', user.id)}>
                                        <Edit /> Edit
                                    </MenuItem>
                                    <MenuItem onClick={() => handleDelete(user.id)}>
                                        <Delete /> Delete
                                    </MenuItem>
                                </Menu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LeaveTableEmployee;
