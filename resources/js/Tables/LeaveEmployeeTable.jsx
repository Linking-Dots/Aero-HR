import React, { useState } from "react";
import {
    Avatar,
    Typography,
    Link,
    FormControl,
    InputLabel,
    MenuItem,
    IconButton,
    Button,
    Box,
    CircularProgress,
    FormHelperText,
    Menu
} from "@mui/material";
import {
    AccountCircle,
    Edit as EditIcon,
    Delete as DeleteIcon,
    RadioButtonChecked as RadioButtonCheckedIcon,
    FiberNew as NewIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import {
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Tooltip,
    Pagination
} from "@heroui/react";

const LeaveEmployeeTable = ({
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
                                employee
                            }) => {



    const { auth } = usePage().props;
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();

    const userIsAdmin = auth.roles.includes("Administrator");
    const userIsSe = auth.roles.includes("Supervision Engineer");

    const handlePageChange = (page) => setCurrentPage(page);

    const handleClick = (event) => setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    const handleMenuItemClick = async (leave, newStatus) => {
        console.error(leave)
        handleClose();
        await updateLeaveStatus(leave, "status", newStatus);
    };

    const updateLeaveStatus = async (leave, key, value) => {
      
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(route("leave-update-status"), {
                    id: leave.id,
                    [key]: value
                });

                if (response.status === 200) {

                    // Update the specific leave in the local allLeaves state
                    setLeaves((prevLeaves) => {
                        return prevLeaves.map((l) =>
                            l.id === leave.id ? { ...l, [key]: value } : l
                        );
                    });
                    resolve([response.data.message || "Leave status updated successfully"]);
                }
            } catch (error) {
                const errorMsg = error.response
                    ? error.response.status === 422
                        ? error.response.statusText || "Failed to update leave status"
                        : "An unexpected error occurred. Please try again later."
                    : error.request
                        ? "No response received from the server. Please check your internet connection."
                        : "An error occurred while setting up the request.";
                reject(errorMsg);
                console.error(error);
            }
        });

        toast.promise(promise, {
            pending: {
                render: () => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <CircularProgress />
                        <span style={{ marginLeft: "8px" }}>Updating leave status...</span>
                    </div>
                ),
                icon: false,
                style: getToastStyle(theme)
            },
            success: {
                render: ({ data }) => <>{data.map((msg, index) => <div key={index}>{msg}</div>)}</>,
                icon: "🟢",
                style: getToastStyle(theme)
            },
            error: {
                render: ({ data }) => <>{data}</>,
                icon: "🔴",
                style: getToastStyle(theme)
            }
        });
    };


    const getToastStyle = (theme) => ({
        backdropFilter: "blur(16px) saturate(200%)",
        background: theme.glassCard.background,
        border: theme.glassCard.border,
        color: theme.palette.text.primary
    });

    const getMenuItemColor = (option) => {
        const colors = {
            New: "primary",
            Pending: "secondary",
            Approved: "success",
            Declined: "danger"
        };
        return colors[option] || "primary";
    };

    const renderCell = (leave, columnKey) => {
        const cellValue = leave[columnKey];
        switch (columnKey) {
            case "employee":
                const user = allUsers.find((u) => String(u.id) === String(leave.user_id));
                return (
                    <User
                        avatarProps={{ radius: "lg", src: user?.profile_image }}
                        description={user?.phone}
                        name={user?.name}
                    >
                        {user?.email}
                    </User>
                );
            case "from_date":
            case "to_date":
                return new Date(cellValue).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
            case "status":
                return (
                    <Select
                        isDisabled={!userIsAdmin && route().current() !== "leaves"}
                        aria-label="Leave Status"
                        color={getMenuItemColor(leave.status)}
                        placeholder="Select status"
                        size="sm"
                        selectedKeys={[leave.status]}
                        onChange={(e) => handleMenuItemClick(leave, e.target.value)}
                        css={{ width: "110px" }}
                    >
                        {["New", "Pending", "Approved", "Declined"].map((option) => (
                            <SelectItem key={option} value={option}>
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
                                    openModal("edit_leave");
                                }}
                            >
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip content="Delete Leave" color="danger">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleClickOpen(leave.id, "delete_leave")}
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
        ...(userIsAdmin ? [{ name: "Employee", uid: "employee" }] : []),
        { name: "Leave Type", uid: "leave_type" },
        { name: "From Date", uid: "from_date" },
        { name: "To Date", uid: "to_date" },
        { name: "Status", uid: "status" },
        { name: "Reason", uid: "reason" },
        ...(userIsAdmin ? [{ name: "Actions", uid: "actions" }] : [])
    ];

    return (
        <div style={{ maxHeight: "84vh", overflowY: "auto" }}>
            <Table
                isStriped
                selectionMode="multiple"
                selectionBehavior="toggle"
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
                <TableBody items={leaves}>
                    {(leave) => (
                        <TableRow key={leave.id}>
                            {(columnKey) => (
                                <TableCell style={{ whiteSpace: "nowrap" }}>
                                    {renderCell(leave, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {totalRows > 30 && (
                <div className="py-2 px-2 flex justify-center items-end" style={{ height: "100%" }}>
                    <Pagination
                        initialPage={1}
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        variant="bordered"
                        page={currentPage}
                        total={lastPage}
                        onChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default LeaveEmployeeTable;
