import {
    FormControl,
    IconButton, InputLabel, MenuItem,
    Typography, Select
} from "@mui/material";
import {Link} from '@inertiajs/react';
import {AccountCircle, Delete, Edit} from '@mui/icons-material';
import React, {useState} from "react";
import {useTheme} from "@mui/material/styles";
import {toast} from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {

    TableColumn,
    TableHeader,
    Tooltip,
    User,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    getKeyValue, DropdownTrigger, Button, DropdownMenu, DropdownItem
} from "@nextui-org/react";
import {yellow} from "@mui/material/colors";
import GlassCard from '@/Components/GlassCard.jsx'
import GlassDropdown from "@/Components/GlassDropdown.jsx";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {Checkbox} from '@mui/material';

const UsersTable = ({allUsers, roles}) => {
    const [users, setUsers] = useState(allUsers);

    console.info(users)

    const theme = useTheme();

    const [anchorEls, setAnchorEls] = useState({});

    async function handleChange(key, user_id, value) {

        const promise = new Promise(async (resolve, reject) => {
            try {
                const newValue = value;

                const response = await fetch(route('user.updateRole', {id: user_id}), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        [key]: newValue,
                    }),
                });

                const data = await response.json();
                console.log(data)

                if (response.ok) {
                    setUsers((prevUsers) =>
                        prevUsers.map((user) => {
                            if (user.id === user_id) {
                                const updatedUser = {...user};

                                updatedUser[key] = newValue;
                                return updatedUser;
                            }
                            return user;
                        })
                    );
                    resolve(data.messages);
                } else {
                    reject(['Failed to update user role.']);
                    console.error(data.errors);
                }
            } catch (error) {
                console.log(error);
                reject(['An unexpected error occurred.']);
            }
        });

        console.log(users.find((user) => user.id === user_id))

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <CircularProgress/>
                                <span style={{marginLeft: '8px'}}>Updating employee {key}...</span>
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
                    render({data}) {
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
    }


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
