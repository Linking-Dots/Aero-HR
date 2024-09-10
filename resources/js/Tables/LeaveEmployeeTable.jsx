import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Avatar,
    Typography,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Button, Box, CircularProgress, FormHelperText
} from '@mui/material';
import { AccountCircle, Edit, Delete } from '@mui/icons-material';
import {useTheme} from "@mui/material/styles";
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import EditIcon from "@mui/icons-material/Edit.js";
import DeleteIcon from "@mui/icons-material/Delete.js";
import React, {useState} from "react";
import {usePage} from "@inertiajs/react";
import Menu from "@mui/material/Menu";
import { toast } from "react-toastify";
import NewIcon from "@mui/icons-material/FiberNew.js";
const LeaveEmployeeTable = ({ allLeaves, allUsers, handleClickOpen, setCurrentLeave, openModal, setLeavesData}) => {
    const {auth} = usePage().props;
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = async (leaveId, newStatus) => {
        handleClose();
        await updateLeaveStatus(leaveId, 'status', newStatus);
    };

    const updateLeaveStatus = async (leave, key, value) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(route('leave-add'), {
                    route: route().current(),
                    user_id: leave.user_id,
                    id: leave.id,
                    leaveType: leave.leave_type,
                    fromDate: leave.from_date,
                    toDate: leave.to_date,
                    daysCount: leave.no_of_days,
                    leaveReason: leave.reason,
                    [key]: value,
                });

                if (response.status === 200) {
                    // Assume `setLeaves` is a state setter for your leaves list
                    setLeavesData(response.data.leavesData);
                    resolve([response.data.message || 'Leave status updated successfully']);
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 422) {
                        reject(error.response.statusText || 'Failed to update leave status');
                    } else {
                        reject('An unexpected error occurred. Please try again later.');
                    }
                    console.error(error.response);
                } else if (error.request) {
                    // The request was made but no response was received
                    reject('No response received from the server. Please check your internet connection.');
                    console.error(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
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
                                <span style={{ marginLeft: '8px' }}>Updating leave status...</span>
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

    const getMenuItemColor = (option) => {
        switch (option) {
            case 'New':
                return theme.palette.primary.main; // Blue for 'New'
            case 'Pending':
                return theme.palette.warning.main; // Yellow for 'Pending'
            case 'Approved':
                return theme.palette.success.main; // Green for 'Approved'
            case 'Declined':
                return theme.palette.error.main; // Red for 'Declined'
            default:
                return theme.palette.text.primary; // Default color
        }
    };

    return (
        <TableContainer style={{ maxHeight: '84vh', overflowY: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {auth.roles.includes('admin') && route().current() === 'leaves' && <TableCell sx={{ whiteSpace: 'nowrap' }}>Employee</TableCell>}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Leave Type</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>From</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>To</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>No of Days</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Reason</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Status</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Approved/Declined by</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {allLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                            {auth.roles.includes('admin') && route().current() === 'leaves' && (
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {(() => {
                                            // Find the user in allUsers array by matching leave.user_id
                                            const user = allUsers.find(u => String(u.id) === String(leave.user_id));
                                            return user ? (
                                                <>
                                                    <Avatar
                                                        src={user.profile_image}
                                                        alt={user.name}
                                                    />
                                                    <Typography sx={{ marginLeft: '10px', fontWeight: 'bold'  }}>
                                                        {user.name}
                                                    </Typography>
                                                </>
                                            ) : (
                                                // If user is not found, show fallback content
                                                <Typography>No User Found</Typography>
                                            );
                                        })()}
                                    </Box>
                                </TableCell>
                            )}
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{leave.leave_type}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(leave.from_date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(leave.to_date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{leave.no_of_days}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{leave.reason}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <FormControl fullWidth>
                                    <Select
                                        disabled={!auth.roles.includes('admin') && route().current() !== 'leaves'}
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        margin={'0'}
                                        onClick={handleClick}
                                        startIcon={<RadioButtonCheckedIcon />}
                                        value={leave.status}
                                        onChange={(e) => handleMenuItemClick(leave, e.target.value)}
                                        sx={{
                                            border: theme.glassCard.border,
                                            borderRadius: '50px',
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backdropFilter: 'blur(16px) saturate(200%)',
                                                    backgroundColor: theme.glassCard.backgroundColor,
                                                    border: theme.glassCard.border,
                                                    borderRadius: 2,
                                                    boxShadow: theme.glassCard.boxShadow,
                                                },
                                            },
                                        }}
                                    >
                                        {['New', 'Pending', 'Approved', 'Declined'].map(option => (
                                            <MenuItem
                                                value={option}
                                                key={option}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.action.hover
                                                    }
                                                }}
                                            >
                                                <Box sx={{display: 'flex'}}>
                                                    <RadioButtonCheckedIcon sx={{ marginRight: 1, color: getMenuItemColor(option) }} />
                                                    {option}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {leave.approved_by ? (
                                    <Typography sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        <Avatar src={allUsers.find(user => user.id === leave.approved_by).profile_image} alt={allUsers.find(user => user.id === leave.approved_by).name} />
                                        <Typography sx={{ marginLeft: '10px', fontWeight: 'bold' }}>
                                            {allUsers.find(user => user.id === leave.approved_by).name}
                                        </Typography>
                                    </Typography>
                                ) : null}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
                                <IconButton
                                    sx={{m:1}}
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    onClick={() => {
                                        setCurrentLeave(leave);
                                        openModal('edit_leave');
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    sx={{ m: 1 }}
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleClickOpen(leave.id, 'delete_leave')}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LeaveEmployeeTable;
