import React, { useState } from "react";
import {
    FormControl, 
    IconButton, 
    InputLabel, 
    MenuItem, 
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Chip
} from "@mui/material";
import { Link } from '@inertiajs/react';
import { AccountCircle, Delete, Edit, Settings } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User } from "@heroui/react";

const EmployeeTable = ({ allUsers, departments, designations, attendanceTypes }) => {
 

    const [users, setUsers] = useState(allUsers || []);
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [attendanceConfig, setAttendanceConfig] = useState({});

    const theme = useTheme();

    // Add early return if data is not loaded
    if (!allUsers || !departments || !designations) {
        return <div>Loading...</div>;
    }

    async function handleChange(key, user_id, value_id) {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const newValue = value_id;
                let routeName;

                switch (key) {
                    case 'department':
                        routeName = 'user.updateDepartment';
                        break;
                    case 'designation':
                        routeName = 'user.updateDesignation';
                        break;
                    case 'attendance_type':
                        routeName = 'user.updateAttendanceType';
                        break;
                    default:
                        routeName = 'user.updateDepartment';
                }

                const response = await fetch(route(routeName, { id: user_id }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        [key === 'attendance_type' ? 'attendance_type_id' : key]: newValue,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setUsers((prevUsers) =>
                        prevUsers.map((user) => {
                            if (String(user.id) === String(user_id)) {
                                const updatedUser = { ...user };

                                if (key === 'department' && user.department !== newValue) {
                                    updatedUser.designation = null;
                                }

                                if (key === 'attendance_type') {
                                    updatedUser.attendance_type_id = newValue;
                                    // Update the attendance_type object if it exists
                                    const attendanceType = attendanceTypes.find(type => type.id === newValue);
                                    updatedUser.attendance_type = attendanceType;
                                } else {
                                    updatedUser[key] = newValue;
                                }

                                return updatedUser;
                            }
                            return user;
                        })
                    );
                    resolve(data.messages);
                } else {
                    reject([data.messages || 'Failed to update profile information.']);
                    console.error(data.errors);
                }
            } catch (error) {
                console.error(error);
                reject(['An unexpected error occurred.']);
            }
        });

        toast.promise(promise, {
            pending: {
                render() {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress />
                            <span style={{ marginLeft: '8px' }}>Updating employee {key.replace('_', ' ')}...</span>
                        </div>
                    );
                },
                icon: false,
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary
                }
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
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary
                }
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
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary
                }
            }
    });
    }

    const handleAttendanceConfig = (user) => {
        setSelectedUser(user);
        setAttendanceConfig(user.attendance_config || {});
        setConfigDialogOpen(true);
    };

    const saveAttendanceConfig = async () => {
        try {
            const response = await fetch(route('user.updateAttendanceType', { id: selectedUser.id }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    attendance_type_id: selectedUser.attendance_type_id,
                    attendance_config: attendanceConfig,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === selectedUser.id
                            ? { ...user, attendance_config: attendanceConfig }
                            : user
                    )
                );
                setConfigDialogOpen(false);
                toast.success('Attendance configuration updated successfully!');
            } else {
                toast.error('Failed to update attendance configuration.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while updating configuration.');
        }
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
                        background: theme.glassCard.background,
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
                        background: theme.glassCard.background,
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
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    };



    const renderCell = (user, columnKey) => {
        const cellValue = user[columnKey];

        switch (columnKey) {
            case "employee_id":
                return cellValue;
            case "name":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: user?.profile_image }}
                        name={user?.name}
                    >
                        {user?.email}
                    </User>
                );
            case "phone":
                return cellValue;
            case "email":
                return cellValue;
            case "date_of_joining":
                return cellValue;
            case "department":
                return (
                    <FormControl size="small" fullWidth>
                        <InputLabel id="department">Department</InputLabel>
                        <Select
                            labelId="department"
                            id={`department-select-${user.id}`}
                            value={user.department || 'na'}
                            onChange={(event) => handleChange('department', user.id, event.target.value)}
                            label="Department"
                            variant={'outlined'}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backdropFilter: 'blur(16px) saturate(200%)',
                                        background: theme.glassCard.background,
                                        border: theme.glassCard.border,
                                        borderRadius: 2,
                                        boxShadow:
                                            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                    },
                                },
                            }}
                        >
                            <MenuItem value="na" disabled>
                                Select Department
                            </MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case "designation":
                return (
                    <FormControl size="small" fullWidth sx={{ zIndex: 0 }}>
                        <InputLabel id="designation">Designation</InputLabel>
                        <Select
                            variant={'outlined'}
                            labelId="designation"
                            id={`designation-select-${user.id}`}
                            value={user.designation || 'na'}
                            onChange={(event) => handleChange('designation', user.id, event.target.value)}
                            disabled={!user.department}
                            label="Designation"
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backdropFilter: 'blur(16px) saturate(200%)',
                                        background: theme.glassCard.background,
                                        border: theme.glassCard.border,
                                        borderRadius: 2,
                                        boxShadow:
                                            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                    },
                                },
                            }}
                        >
                            <MenuItem value="na" disabled>
                                Select Designation
                            </MenuItem>
                            {designations
                                .filter((designation) => designation.department_id === user.department)
                                .map((desig) => (
                                    <MenuItem key={desig.id} value={desig.id}>
                                        {desig.title}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                );
            case "attendance_type":
                return (
                    <FormControl size="small" fullWidth sx={{ zIndex: 0 }}>
                        <InputLabel id="attendance-type">Attendance Type</InputLabel>
                        <Select
                            variant={'outlined'}
                            labelId="attendance-type"
                            id={`attendance-type-select-${user.id}`}
                            value={user.attendance_type_id || 'na'}
                            onChange={(event) => handleChange('attendance_type', user.id, event.target.value)}
                            label="Attendance Type"
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backdropFilter: 'blur(16px) saturate(200%)',
                                        background: theme.glassCard.background,
                                        border: theme.glassCard.border,
                                        borderRadius: 2,
                                        boxShadow:
                                            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                    },
                                },
                            }}
                        >
                            <MenuItem value="na" disabled>
                                Select Attendance Type
                            </MenuItem>
                            {/* Add safety check for attendanceTypes */}
                            {attendanceTypes && attendanceTypes.length > 0 ? (
                                attendanceTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {type.icon && <span>{type.icon}</span>}
                                            {type.name}
                                        </div>
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>
                                    No attendance types available
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="View Profile">
                            <IconButton
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                component={Link}
                                href={route('profile', { user: user.id })}
                            >
                                <AccountCircle />
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Edit User">
                            <IconButton
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                component={Link}
                                href={route('profile', { user: user.id })}
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Delete User" color="danger">
                            <IconButton
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => {
                                    handleDelete(user.id);
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </div>
                );
            default:
                return "N/A";
        }
    };

    const columns = [
        { name: "Employee ID", uid: "employee_id" },
        { name: "Name", uid: "name" },
        { name: "Mobile", uid: "phone" },
        { name: "Email", uid: "email" },
        { name: "Join Date", uid: "date_of_joining" },
        { name: "Department", uid: "department" },
        { name: "Designation", uid: "designation" },
        { name: "Attendance Type", uid: "attendance_type" }, // Add this column
        { name: "Action", uid: "actions" }
    ];

    return (
        <>
            <div style={{ maxHeight: '84vh', overflowY: 'auto' }}>
                <Table
                    key={users.length}
                    fullWidth
                    isCompact
                    isHeaderSticky
                    removeWrapper
                    isStriped
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
                                {(columnKey) => (
                                    <TableCell style={{ whiteSpace: 'nowrap' }}>
                                        {renderCell(user, columnKey)}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Attendance Configuration Dialog */}
            <Dialog 
                open={configDialogOpen} 
                onClose={() => setConfigDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        borderRadius: 2,
                    }
                }}
            >
                <DialogTitle>
                    Configure Attendance Settings for {selectedUser?.name}
                    {selectedUser?.attendance_type && (
                        <Chip 
                            label={selectedUser.attendance_type.name}
                            icon={selectedUser.attendance_type.icon ? <span>{selectedUser.attendance_type.icon}</span> : undefined}
                            sx={{ ml: 2 }}
                        />
                    )}
                </DialogTitle>
                <DialogContent>
                    {selectedUser?.attendance_type?.slug === 'geo_polygon' && (
                        <div>
                            <Typography variant="h6" gutterBottom>Polygon Configuration</Typography>
                            <TextField
                                fullWidth
                                label="Polygon Coordinates (JSON)"
                                multiline
                                rows={4}
                                value={JSON.stringify(attendanceConfig.polygon || [], null, 2)}
                                onChange={(e) => {
                                    try {
                                        const polygon = JSON.parse(e.target.value);
                                        setAttendanceConfig({...attendanceConfig, polygon});
                                    } catch (error) {
                                        // Invalid JSON, don't update
                                    }
                                }}
                                margin="normal"
                                helperText="Enter polygon coordinates as JSON array: [{'lat': 23.123, 'lng': 90.456}, ...]"
                            />
                        </div>
                    )}
                    
                    {selectedUser?.attendance_type?.slug === 'wifi_ip' && (
                        <div>
                            <Typography variant="h6" gutterBottom>WiFi/IP Configuration</Typography>
                            <TextField
                                fullWidth
                                label="Allowed IP Addresses (comma separated)"
                                value={(attendanceConfig.allowed_ips || []).join(', ')}
                                onChange={(e) => {
                                    const ips = e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip);
                                    setAttendanceConfig({...attendanceConfig, allowed_ips: ips});
                                }}
                                margin="normal"
                                helperText="Enter allowed IP addresses separated by commas"
                            />
                            <TextField
                                fullWidth
                                label="Allowed IP Ranges (CIDR notation, comma separated)"
                                value={(attendanceConfig.allowed_ranges || []).join(', ')}
                                onChange={(e) => {
                                    const ranges = e.target.value.split(',').map(range => range.trim()).filter(range => range);
                                    setAttendanceConfig({...attendanceConfig, allowed_ranges: ranges});
                                }}
                                margin="normal"
                                helperText="Enter IP ranges like: 192.168.1.0/24, 10.0.0.0/8"
                            />
                        </div>
                    )}

                    {selectedUser?.attendance_type?.slug === 'route_waypoint' && (
                        <div>
                            <Typography variant="h6" gutterBottom>Route Waypoint Configuration</Typography>
                            <TextField
                                fullWidth
                                label="Tolerance (meters)"
                                type="number"
                                value={attendanceConfig.tolerance || 200}
                                onChange={(e) => setAttendanceConfig({...attendanceConfig, tolerance: parseInt(e.target.value)})}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Waypoints (JSON)"
                                multiline
                                rows={4}
                                value={attendanceConfig.waypointsText || JSON.stringify(attendanceConfig.waypoints || [], null, 2)}
                                onChange={(e) => {
                                    const newText = e.target.value;
                                    
                                    // Always update the text field to allow editing
                                    setAttendanceConfig(prev => ({
                                        ...prev, 
                                        waypointsText: newText
                                    }));
                                    
                                    // Try to parse JSON and update waypoints if valid
                                    try {
                                        const waypoints = JSON.parse(newText);
                                        if (Array.isArray(waypoints)) {
                                            setAttendanceConfig(prev => ({
                                                ...prev,
                                                waypoints: waypoints,
                                                waypointsText: newText
                                            }));
                                        }
                                    } catch (error) {
                                        // JSON is invalid, but we still allow editing the text
                                        console.log('Invalid JSON, but allowing text editing');
                                    }
                                }}
                                margin="normal"
                                helperText="Enter waypoints as JSON array: [{'lat': 23.123, 'lng': 90.456}, ...]"
                                error={(() => {
                                    try {
                                        const text = attendanceConfig.waypointsText || JSON.stringify(attendanceConfig.waypoints || [], null, 2);
                                        JSON.parse(text);
                                        return false;
                                    } catch {
                                        return true;
                                    }
                                })()}
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveAttendanceConfig} variant="contained">Save Configuration</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EmployeeTable;
