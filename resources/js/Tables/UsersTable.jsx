import {Checkbox, FormControl, IconButton, InputLabel, MenuItem, Select, Switch} from "@mui/material";
import {Link} from '@inertiajs/react';
import {Delete, Edit} from '@mui/icons-material';
import React, {useState} from "react";
import {useTheme} from "@mui/material/styles";
import {toast} from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User} from "@heroui/react";

const UsersTable = ({allUsers, roles}) => {
    const [users, setUsers] = useState(allUsers);

    const theme = useTheme();

    const [anchorEls, setAnchorEls] = useState({});

    async function handleChange(key, user_id, value) {

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(route('user.updateRole', { id: user_id }), {
                    [key]: value,
                });

                if (response.status === 200) {
                    setUsers((prevUsers) =>
                        prevUsers.map((user) => {
                            if (user.id === user_id) {
                                return { ...user, [key]: value };
                            }
                            return user;
                        })
                    );
                    resolve([response.data.messages || 'Role updated successfully']);
                }
            } catch (error) {

                if (error.response) {
                    if (error.response.status === 422) {
                        // Handle validation errors
                        reject(error.response.data.errors || ['Failed to update user role.']);
                    } else {
                        reject('An unexpected error occurred. Please try again later.');
                    }
                    console.error(error.response);
                } else if (error.request) {
                    reject('No response received from the server. Please check your internet connection.');
                    console.error(error.request);
                } else {
                    reject('An error occurred while setting up the request.');
                    console.error('Error', error.message);
                }
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
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
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
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    }

    const handleStatusToggle = async (userId, value) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.put(route('user.toggleStatus', { id: userId }), {
                    active: value,
                });

                if (response.status === 200) {
                    setUsers((prevUsers) =>
                        prevUsers.map((user) => {
                            if (user.id === userId) {
                                return { ...user, active: value };
                            }
                            return user;
                        })
                    );
                    resolve([response.data.message || 'User status updated successfully']);
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 422) {
                        reject(error.response.data.errors || ['Failed to update user status.']);
                    } else {
                        reject('An unexpected error occurred. Please try again later.');
                    }
                    console.error(error.response);
                } else if (error.request) {
                    reject('No response received from the server. Please check your internet connection.');
                    console.error(error.request);
                } else {
                    reject('An error occurred while setting up the request.');
                    console.error('Error', error.message);
                }
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
                                <span style={{ marginLeft: '8px' }}>Updating user status...</span>
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
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
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
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
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
                console.error('Error deleting user:', error);
                reject(['An error occurred while deleting user. Please try again.']);
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <CircularProgress/>
                                <span style={{marginLeft: '8px'}}>Deleting user...</span>
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
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
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
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    };




    const handleClick = (event, id) => {
        setAnchorEls((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleClose = (id) => {
        setAnchorEls((prev) => ({ ...prev, [id]: null }));
    };

    const renderCell = (user, columnKey) => {
        const cellValue = user[columnKey];


        switch (columnKey) {
            case "name":
                return (
                <User
                    avatarProps={{ radius: "lg", src: user?.profile_image }}
                    name={user?.name}
                >
                    {user?.email}
                </User>
            );
            case "email":
                return cellValue;
            case "phone":
                return cellValue;
            case "created_at":
                return cellValue ? cellValue : "N/A";
            case "role":
                return (
                    <FormControl size="small" fullWidth>
                        <InputLabel id="role">Role</InputLabel>
                        <Select
                            disabled={!user.active}
                            labelId="role"
                            id={'role'}
                            multiple
                            value={user.roles}
                            onChange={(event) => handleChange('roles', user.id, event.target.value)}
                            label="Role"
                            variant={'outlined'}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backdropFilter: 'blur(16px) saturate(200%)',
                                        backgroundColor: theme.glassCard.backgroundColor,
                                        border: theme.glassCard.border,
                                        borderRadius: 2,
                                        boxShadow:
                                            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                    },
                                },
                            }}
                         >
                            {roles.map((role) => (
                                <MenuItem key={role.name} value={role.name}>
                                    <Checkbox size={'small'} checked={user.roles.includes(role.name)} />
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit Leave">
                            <IconButton
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                component={Link}
                                href={route('profile', { user: user.id })} // Assuming this is the intended route
                                onClick={() => {
                                    handleClose(user.id);
                                }}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Delete Leave" color="danger">
                            <IconButton
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                component={Link}
                                href={route('profile', { user: user.id })} // Or change the route if different action is required
                                onClick={() => {
                                    handleDelete(user.id);
                                }}
                            >
                                <Delete /> {/* Changed to a different icon for clarity */}
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Set Active Status" color="danger">
                            <Switch
                                checked={user.active}
                                onChange={() => handleStatusToggle(user.id, !user.active)}
                            />
                        </Tooltip>
                    </div>
                );
            default:
                return "N/A";
        }
    };

    const columns = [
        { name: "Name", uid: "name" },
        { name: "Email", uid: "email" },
        { name: "Phone", uid: "phone" },
        { name: "Created At", uid: "created_at" },
        { name: "Role", uid: "role" },
        { name: "Action", uid: "actions" }
    ];

    return (
        <div style={{maxHeight: '84vh', overflowY: 'auto'}}>
            <Table
                key={users}
                fullWidth
                isStriped
                isCompact
                isHeaderSticky
                removeWrapper
                aria-label="Employees Table"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={users}>
                    {(user) => (
                        <TableRow key={user.id}>
                            {(columnKey) => <TableCell
                                style={{whiteSpace: 'nowrap'}}>{renderCell(user, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default UsersTable;
