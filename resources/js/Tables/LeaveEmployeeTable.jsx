import React, { useState, useCallback } from "react";
import {
    Box,
    Typography,
    IconButton,
    Stack,
    useMediaQuery,
    Tooltip as MuiTooltip,
    CardContent,
    CardHeader,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Tooltip,
    Pagination,
    Chip,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Card,
    CardBody,
    Divider,
    ScrollShadow
} from "@heroui/react";
import {
    CalendarDaysIcon,
    UserIcon,
    ClockIcon,
    DocumentTextIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    ClockIcon as ClockIconOutline,
    SunIcon,
    HeartIcon,
    BriefcaseIcon,
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    XCircleIcon as XCircleSolid,
    ClockIcon as ClockSolid,
    ExclamationTriangleIcon as ExclamationTriangleSolid
} from '@heroicons/react/24/solid';
import axios from 'axios';
import GlassCard from "@/Components/GlassCard";



const LeaveEmployeeTable = React.forwardRef(({
    leaves,
    allUsers,
    handleClickOpen,
    setCurrentLeave,
    openModal,
    setLeaves,
    setCurrentPage,
    currentPage,
    totalRows,
    lastPage,
    perPage,
    selectedMonth,
    employee,
    isAdminView = false,
    onBulkApprove,
    onBulkReject,
    canApproveLeaves = false,
    canEditLeaves = false,
    canDeleteLeaves = false,
    fetchLeavesStats 
}, ref) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    const [updatingLeaveId, setUpdatingLeaveId] = useState(null);
    const [selectedLeaves, setSelectedLeaves] = useState(new Set());

    // Check permissions using new system
    const canViewLeaves = auth.permissions?.includes('leaves.view') || false;
    const canManageOwnLeaves = auth.permissions?.includes('leave.own.view') || false;
    const hasAdminAccess = isAdminView && (canApproveLeaves || canEditLeaves || canDeleteLeaves);

    // Permission-based access control (replacing role-based checks)
    const userIsAdmin = isAdminView || hasAdminAccess;
    const userIsSE = canApproveLeaves; // SE/Manager can approve leaves

    // Status configuration
    const statusConfig = {
        'New': {
            color: 'primary',
            icon: ExclamationTriangleSolid,
            bgColor: alpha(theme.palette.primary.main, 0.1),
            textColor: theme.palette.primary.main
        },
        'Pending': {
            color: 'warning',
            icon: ClockSolid,
            bgColor: alpha(theme.palette.warning.main, 0.1),
            textColor: theme.palette.warning.main
        },
        'Approved': {
            color: 'success',
            icon: CheckCircleSolid,
            bgColor: alpha(theme.palette.success.main, 0.1),
            textColor: theme.palette.success.main
        },
        'Declined': {
            color: 'danger',
            icon: XCircleSolid,
            bgColor: alpha(theme.palette.error.main, 0.1),
            textColor: theme.palette.error.main
        }
    };

    const getLeaveTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "casual":
                return <BriefcaseIcon className="w-3 h-3 text-blue-500" />;
            case "weekend":
                return <SunIcon className="w-3 h-3 text-yellow-500" />;
            case "sick":
                return <HeartIcon className="w-3 h-3 text-red-500" />;
            case "earned":
                return <ClockIcon className="w-3 h-3 text-green-500" />;
            default:
                return <DocumentTextIcon className="w-3 h-3 text-primary" />;
        }
    };

    const handlePageChange = useCallback((page) => {
        console.log('Pagination page change requested:', page);
        if (setCurrentPage) {
            // When page changes, this will trigger fetchLeavesData in the parent component
            // which will load the correct data for the requested page
            setCurrentPage(page);
        }
    }, [setCurrentPage]);

    


    const updateLeaveStatus = useCallback(async (leave, newStatus) => {
        if (updatingLeaveId === leave.id) return; // Prevent multiple updates for the same leave

        setUpdatingLeaveId(leave.id);
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(route("leave-update-status"), {
                    id: leave.id,
                    status: newStatus
                });

                if (response.status === 200) {
                    setLeaves((prevLeaves) => {
                        return prevLeaves.map((l) =>
                            l.id === leave.id ? { ...l, status: newStatus } : l
                        );
                    });
                    fetchLeavesStats();
                    resolve(response.data.message || "Leave status updated successfully");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || 
                    error.response?.statusText || 
                    "Failed to update leave status";
                reject(errorMsg);
            } finally { // This finally runs after resolve or reject
                setUpdatingLeaveId(null);
            }
        });

        toast.promise(promise, {
            pending: "Updating leave status...",
            success: "Leave status updated successfully!",
            error: "Failed to update leave status"
        });
    }, [setLeaves, isUpdating]);

    const getStatusChip = (status) => {
        const config = statusConfig[status] || statusConfig['New'];
        const StatusIcon = config.icon;

        return (
            <Chip
                size="sm"
                variant="flat"
                color={config.color}
                startContent={<StatusIcon className="w-3 h-3" />}
                classNames={{
                    base: "h-6",
                    content: "text-xs font-medium"
                }}
            >
                {status}
            </Chip>
        );
    };

    const getLeaveDuration = (fromDate, toDate) => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays === 1 ? '1 day' : `${diffDays} days`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getUserInfo = (userId) => {
        return allUsers?.find((u) => String(u.id) === String(userId)) || { name: 'Unknown User', phone: '' };
    };

    // Mobile card component for better mobile experience
    const MobileLeaveCard = ({ leave }) => {
        const user = getUserInfo(leave.user_id);
        const duration = getLeaveDuration(leave.from_date, leave.to_date);
        const statusConf = statusConfig[leave.status] || statusConfig['New'];

        return (
            <GlassCard className="mb-2" shadow="sm">
                <CardContent className="p-3">
                    <Box className="flex items-start justify-between mb-3">
                        <Box className="flex items-center gap-3 flex-1">
                            {isAdminView && (
                                <User
                                    avatarProps={{
                                        radius: "lg",
                                        size: "sm",
                                        src: user?.profile_image,
                                        fallback: <UserIcon className="w-4 h-4" />
                                    }}
                                    name={
                                        <Typography variant="body2" fontWeight="medium">
                                            {user?.name}
                                        </Typography>
                                    }
                                    description={
                                        <Typography variant="caption" color="textSecondary">
                                            {user?.phone}
                                        </Typography>
                                    }
                                />
                            )}
                        </Box>
                        <Box className="flex items-center gap-2">
                            {getStatusChip(leave.status)}
                            {hasAdminAccess && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <IconButton size="small">
                                            <EllipsisVerticalIcon className="w-4 h-4" />
                                        </IconButton>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Leave actions">
                                        {canEditLeaves && (
                                            <DropdownItem
                                                key="edit"
                                                startContent={<PencilIcon className="w-4 h-4" />}
                                                onPress={() => {
                                           
                                                    setCurrentLeave(leave);
                                                    openModal("edit_leave");
                                                }}
                                            >
                                                Edit Leave
                                            </DropdownItem>
                                        )}
                                        {canDeleteLeaves && (
                                            <DropdownItem
                                                key="delete"
                                                className="text-danger"
                                                color="danger"
                                                startContent={<TrashIcon className="w-4 h-4" />}
                                                onPress={() => handleClickOpen(leave.id, "delete_leave")}
                                            >
                                                Delete Leave
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                        </Box>
                    </Box>

                    <Divider className="my-3" />

                    <Stack spacing={2}>
                        <Box className="flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4 text-primary" />
                            <Typography variant="body2" fontWeight="medium">
                                {leave.leave_type}
                            </Typography>
                        </Box>

                        <Box className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-default-500" />
                            <Typography variant="body2" color="textSecondary">
                                {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
                            </Typography>
                            <Chip size="sm" variant="bordered" color="default">
                                {duration}
                            </Chip>
                        </Box>

                        {leave.reason && (
                            <Box className="flex items-start gap-2">
                                <ClockIconOutline className="w-4 h-4 text-default-500 mt-0.5" />
                                <Typography variant="body2" color="textSecondary" className="flex-1">
                                    {leave.reason}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {isAdminView && canApproveLeaves && (
                        <>
                            <Divider className="my-3" />
                            <Box className="flex gap-2">
                                {['Approved', 'Declined'].map((status) => (
                                    <Button
                                        key={status}
                                        size="sm"
                                        variant={leave.status === status ? "solid" : "bordered"}
                                        color={statusConfig[status].color}
                                        isLoading={updatingLeaveId === leave.id}
                                        onPress={() => updateLeaveStatus(leave, status)}
                                        startContent={
                                            !updatingLeave || updatingLeave !== `${leave.id}-${status}` ? 
                                            React.createElement(statusConfig[status].icon, {
                                                className: "w-3 h-3"
                                            }) : null
                                        }
                                        classNames={{
                                            base: "flex-1"
                                        }}
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </Box>
                        </>
                    )}
                </CardContent>
            </GlassCard>
        );
    };

    const renderCell = useCallback((leave, columnKey) => {
        
        const user = getUserInfo(leave.user_id);

        switch (columnKey) {
            case "employee":
                return (
                    <TableCell className="whitespace-nowrap">
                        <User
                            avatarProps={{
                                radius: "lg",
                                size: "sm",
                                src: user?.profile_image,
                                fallback: <UserIcon className="w-4 h-4" />
                            }}
                            description={
                                <Typography variant="caption" className="text-xs">
                                    {user?.phone}
                                </Typography>
                            }
                            name={
                                <Typography variant="body2" className="text-sm font-medium">
                                    {user?.name}
                                </Typography>
                            }
                        />
                    </TableCell>
                );

            case "leave_type":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            {getLeaveTypeIcon(leave.leave_type)}
                            <Typography variant="body2" className="text-sm font-medium capitalize">
                                {leave.leave_type}
                            </Typography>
                        </Box>
                    </TableCell>
                );
            case "from_date":
         
            case "to_date":
 
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-3 h-3 text-default-500" />
                            <Box>
                                <Typography variant="body2" className="text-sm">
                                    {formatDate(leave[columnKey])}
                                </Typography>
                                {columnKey === "from_date" && (
                                    <Typography variant="caption" className="text-xs" color="textSecondary">
                                        {getLeaveDuration(leave.from_date, leave.to_date)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </TableCell>
                );

            case "status":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-2">
                            {getStatusChip(leave.status)}
                            {isAdminView && canApproveLeaves && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button 
                                            isIconOnly 
                                            size="sm" 
                                            variant="light"
                                            isDisabled={updatingLeaveId === leave.id}
                                        >
                                            <EllipsisVerticalIcon className="w-4 h-4" />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Status actions"
                                        onAction={(key) => updateLeaveStatus(leave, key)}
                                    >
                                        {Object.keys(statusConfig).map((status) => {
                                            const config = statusConfig[status];
                                            const StatusIcon = config.icon;
                                            return (
                                                <DropdownItem
                                                    key={status}
                                                    startContent={<StatusIcon className="w-4 h-4" />}
                                                    color={config.color}
                                                >
                                                    {status}
                                                </DropdownItem>
                                            );
                                        })}
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                        </Box>
                    </TableCell>
                );

            case "reason":
                return (
                    <TableCell>
                        <MuiTooltip title={leave.reason || "No reason provided"}>
                            <Typography 
                                variant="caption" 
                                className="max-w-xs truncate cursor-help text-xs"
                                color="textSecondary"
                            >
                                {leave.reason || "No reason provided"}
                            </Typography>
                        </MuiTooltip>
                    </TableCell>
                );

            case "actions":
          
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            {canEditLeaves && (
                                <Tooltip content="Edit Leave">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            if (updatingLeaveId === leave.id) return;
                                       
                                            setCurrentLeave(leave);
                                            openModal("edit_leave");
                                        }}
                                        sx={{
                                            background: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': {
                                                background: alpha(theme.palette.primary.main, 0.2)
                                            }
                                        }}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {canDeleteLeaves && (
                                <Tooltip content="Delete Leave" color="danger">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            if (updatingLeaveId === leave.id) return;
                                            setCurrentLeave(leave);
                                            handleClickOpen(leave.id, "delete_leave");
                                        }}
                                        sx={{
                                            background: alpha(theme.palette.error.main, 0.1),
                                            '&:hover': {
                                                background: alpha(theme.palette.error.main, 0.2)
                                            }
                                        }}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </TableCell>
                );

            default:
                return <TableCell>{leave[columnKey]}</TableCell>;
        }
    }, [isAdminView, canApproveLeaves, isLargeScreen, updatingLeaveId, theme, setCurrentLeave, openModal, handleClickOpen, updateLeaveStatus]);

    const columns = [
        ...(isAdminView ? [{ name: "Employee", uid: "employee", icon: UserIcon }] : []),
        { name: "Leave Type", uid: "leave_type", icon: DocumentTextIcon },
        { name: "From Date", uid: "from_date", icon: CalendarDaysIcon },
        { name: "To Date", uid: "to_date", icon: CalendarDaysIcon },
        { name: "Status", uid: "status", icon: ClockIconOutline },
        { name: "Reason", uid: "reason", icon: DocumentTextIcon },
        ...(isAdminView ? [{ name: "Actions", uid: "actions" }] : [])
    ];

    if (isMobile) {
        return (
            <Box className="space-y-4">
                <ScrollShadow className="max-h-[70vh]">
                    {leaves.map((leave) => ( // Use the leave.id directly for disabling buttons on the card
                        // Need to pass updatingLeaveId and handle disabled state within MobileLeaveCard
                        // Or, render a different component or add overlay/spinner based on updatingLeaveId
                        // For simplicity here, let's assume MobileLeaveCard uses updatingLeaveId prop
                        // and disables its internal buttons if leave.id matches updatingLeaveId
                        // Note: This requires modifying MobileLeaveCard to accept updatingLeaveId
                        // For this diff, we just map and assume the prop is handled inside.
                        // A better approach would be to check updatingLeaveId inside MobileLeaveCard and render a spinner/disable actions.
                        <MobileLeaveCard key={leave.id} leave={leave} />
                    ))}
                </ScrollShadow>
                {totalRows > perPage && (
                    <Box className="flex justify-center pt-4">
                        <Pagination
                            showControls
                            showShadow
                            color="primary"
                            variant="bordered"
                            page={currentPage}
                            total={lastPage}
                            onChange={handlePageChange}
                            size="sm"
                        />
                    </Box>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ maxHeight: "84vh", overflowY: "auto" }}>


            <ScrollShadow className="max-h-[70vh]">
                <Table
                    isStriped
                    selectionMode="none"
                    isCompact
                    isHeaderSticky
                    removeWrapper
                    aria-label="Leave Management Table"
                    classNames={{
                        wrapper: "min-h-[200px]",
                        table: "min-h-[300px]",
                        thead: "[&>tr]:first:shadow-small bg-default-100/80",
                        tbody: "divide-y divide-default-200/50",
                        tr: "group hover:bg-default-50/50 transition-colors h-12",
                        td: "py-2 px-3 text-sm",
                        th: "py-2 px-3 text-xs font-semibold"
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn 
                                key={column.uid} 
                                align={column.uid === "actions" ? "center" : "start"}
                                className="bg-default-100/80 backdrop-blur-md"
                            >
                                <Box className="flex items-center gap-1">
                                    {column.icon && <column.icon className="w-3 h-3" />}
                                    <span className="text-xs font-semibold">{column.name}</span>
                                </Box>
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody 
                        items={leaves}
                        emptyContent={
                            <Box className="flex flex-col items-center justify-center py-8 text-center">
                                <CalendarDaysIcon className="w-12 h-12 text-default-300 mb-4" />
                                <Typography variant="h6" color="textSecondary">
                                    No leaves found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {employee ? `No leaves found for "${employee}"` : "No leave requests for the selected period"}
                                </Typography>
                            </Box>
                        }
                    >
                        {(leave) => (
                            <TableRow 
                                key={leave.id} 
                            >
                                {(columnKey) => renderCell(leave, columnKey)}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollShadow>
            {totalRows > perPage && (
                <Box className="py-4 flex justify-center">
                    <Pagination
                        showControls
                        showShadow
                        color="primary"
                        variant="bordered"
                        page={currentPage}
                        total={lastPage}
                        onChange={handlePageChange}
                        size={isMediumScreen ? "sm" : "md"}
                    />
                    <div className="ml-4 text-xs text-gray-500">
                        Page {currentPage} of {lastPage} (Total: {totalRows} records)
                    </div>
                </Box>
            )}
        </Box>
    );
});

LeaveEmployeeTable.displayName = 'LeaveEmployeeTable';

export default LeaveEmployeeTable;