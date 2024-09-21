import {
    Avatar,
    Typography,
    Link,
    FormControl,
    InputLabel,
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

import {Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
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
        console.log(leaveId, newStatus)
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
                return "primary"; // Blue for 'New'
            case 'Pending':
                return "secondary"; // Yellow for 'Pending'
            case 'Approved':
                return "success"; // Green for 'Approved'
            case 'Declined':
                return "danger"; // Red for 'Declined'
            default:
                return "primary"; // Default color
        }
    };

    const renderCell = (leave, columnKey) => {
        const cellValue = leave[columnKey];

        switch (columnKey) {
            case "employee":
                const user = allUsers.find(u => String(u.id) === String(leave.user_id));
                return (
                    <User
                        avatarProps={{ radius: "lg", src: user?.profile_image }}
                        description={user?.phone}
                        name={user?.name}
                    >
                        {user?.email}
                    </User>
                );
            case "leave_type":
                return cellValue;
            case "from_date":
                return new Date(cellValue).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            case "to_date":
                return new Date(cellValue).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            case "status":
                return (
                    <Select
                        isDisabled={!auth.roles.includes('Administrator') && route().current() !== 'leaves'}
                        aria-label="Leave Status"
                        color={getMenuItemColor(leave.status)}
                        placeholder="Select status"
                        size="sm"
                        selectedKeys={[leave.status]}
                        onChange={(e) => handleMenuItemClick(leave, e.target.value)}
                        css={{
                            width: '110px',
                        }}
                    >
                        {['New', 'Pending', 'Approved', 'Declined'].map(option => (
                            <SelectItem key={option} value={leave.status}>
                                {option}
                            </SelectItem>
                        ))}
                    </Select>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit Leave">
              <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => {
                      setCurrentLeave(leave);
                      openModal('edit_leave');
                  }}
              >
                <EditIcon />
              </span>
                        </Tooltip>
                        <Tooltip content="Delete Leave" color="danger">
              <span
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  onClick={() => handleClickOpen(leave.id, 'delete_leave')}
              >
                <DeleteIcon />
              </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    };

    const columns = [
        { name: "Employee", uid: "employee" },
        { name: "Leave Type", uid: "leave_type" },
        { name: "From Date", uid: "from_date" },
        { name: "To Date", uid: "to_date" },
        { name: "Status", uid: "status" },
        { name: "Reason", uid: "reason" },
        { name: "Actions", uid: "actions" }
    ];

    return (
        <div style={{maxHeight: '84vh', overflowY: 'auto'}}>
            <Table
                selectionMode="multiple"
                selectionBehavior={'toggle'}
                isCompact
                isHeaderSticky
                removeWrapper
                aria-label="Leave Employee Table"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={allLeaves}>
                    {(leave) => (
                        <TableRow key={leave.id}>
                            {(columnKey) => <TableCell style={{whiteSpace: 'nowrap'}}>{renderCell(leave, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

    );
};

export default LeaveEmployeeTable;
