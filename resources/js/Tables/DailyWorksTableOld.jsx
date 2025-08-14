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
    TextField,
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
    ScrollShadow,
    Select,
    SelectItem,
    Input,
    Link
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
    MapPinIcon,
    BuildingIcon,
    DocumentIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    ArrowPathIcon,
    NoSymbolIcon,
    DocumentArrowUpIcon,
    DocumentCheckIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    XCircleIcon as XCircleSolid,
    ClockIcon as ClockSolid,
    ExclamationTriangleIcon as ExclamationTriangleSolid,
    PlayCircleIcon as PlayCircleSolid,
    ArrowPathIcon as ArrowPathSolid
} from '@heroicons/react/24/solid';
import axios from 'axios';
import GlassCard from "@/Components/GlassCard";
import { jsPDF } from "jspdf";

const DailyWorksTable = ({ 
    allData, 
    setData, 
    loading, 
    handleClickOpen, 
    allInCharges, 
    reports, 
    juniors, 
    reports_with_daily_works, 
    openModal, 
    setCurrentRow, 
    filteredData, 
    setFilteredData,
    currentPage,
    totalRows,
    lastPage,
    onPageChange
}) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    const [isUpdating, setIsUpdating] = useState(false);
    const [updatingWorkId, setUpdatingWorkId] = useState(null);

    // Permission-based access control
    const userIsAdmin = auth.roles?.includes('Administrator') || false;
    const userIsSE = auth.roles?.includes('Supervision Engineer') || false;
    const userIsQCI = auth.roles?.includes('Quality Control Inspector') || auth.roles?.includes('Asst. Quality Control Inspector') || false;

    // Status configuration - matching Leave page pattern
    const statusConfig = {
        'new': {
            color: 'primary',
            icon: ExclamationTriangleSolid,
            bgColor: alpha(theme.palette.primary.main, 0.1),
            textColor: theme.palette.primary.main,
            label: 'New'
        },
        'resubmission': {
            color: 'warning',
            icon: ArrowPathSolid,
            bgColor: alpha(theme.palette.warning.main, 0.1),
            textColor: theme.palette.warning.main,
            label: 'Resubmission'
        },
        'completed': {
            color: 'success',
            icon: CheckCircleSolid,
            bgColor: alpha(theme.palette.success.main, 0.1),
            textColor: theme.palette.success.main,
            label: 'Completed'
        },
        'emergency': {
            color: 'danger',
            icon: ExclamationTriangleSolid,
            bgColor: alpha(theme.palette.error.main, 0.1),
            textColor: theme.palette.error.main,
            label: 'Emergency'
        }
    };

    const getWorkTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "embankment":
                return <BuildingIcon className="w-3 h-3 text-amber-500" />;
            case "structure":
                return <DocumentIcon className="w-3 h-3 text-blue-500" />;
            case "pavement":
                return <MapPinIcon className="w-3 h-3 text-gray-500" />;
            default:
                return <DocumentTextIcon className="w-3 h-3 text-primary" />;
        }
    };

    const getStatusChip = (status) => {
        const config = statusConfig[status] || statusConfig['new'];
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
                {config.label}
            </Chip>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getUserInfo = (userId) => {
        const user = allInCharges?.find((u) => String(u.id) === String(userId)) || 
                    juniors?.find((u) => String(u.id) === String(userId));
        return user || { name: 'Unassigned', profile_image: null };
    };

    // Handle status updates
    const updateWorkStatus = useCallback(async (work, newStatus) => {
        if (updatingWorkId === work.id) return;

        setUpdatingWorkId(work.id);
        const promise = new Promise(async (resolve, reject) => {
            try {
                // If status is completed and not structure, capture image
                if (newStatus === 'completed' && !(work.type?.toLowerCase() === 'structure')) {
                    const pdfFile = await captureDocument(work.number);
                    if (pdfFile) {
                        await uploadImage(work.id, pdfFile);
                    }
                }

                const response = await axios.post(route('dailyWorks.update'), {
                    id: work.id,
                    status: newStatus,
                });

                if (response.status === 200) {
                    setData(prevWorks =>
                        prevWorks.map(w =>
                            w.id === work.id ? { ...w, status: newStatus } : w
                        )
                    );
                    resolve(response.data.message || "Work status updated successfully");
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || 
                    error.response?.statusText || 
                    "Failed to update work status";
                reject(errorMsg);
            } finally {
                setUpdatingWorkId(null);
            }
        });

        toast.promise(promise, {
            pending: "Updating work status...",
            success: "Work status updated successfully!",
            error: "Failed to update work status"
        });
    }, [setData, updatingWorkId]);

    // Handle general field updates
    const handleChange = async (taskId, taskNumber, key, value, type) => {
        try {
            if (key === 'status' && value === 'completed' && !(type === 'Structure')) {
                const pdfFile = await captureDocument(taskNumber);
                if (pdfFile) {
                    await uploadImage(taskId, pdfFile);
                }
            }

            const response = await axios.post(route('dailyWorks.update'), {
                id: taskId,
                [key]: value,
            });

            if (response.status === 200) {
                setData(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, [key]: value } : task
                    )
                );

                toast.success(response.data.message || `Task updated successfully`, {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard?.background || 'rgba(255,255,255,0.1)',
                        border: theme.glassCard?.border || '1px solid rgba(255,255,255,0.2)',
                        color: theme.palette.text.primary,
                    }
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'An unexpected error occurred.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard?.background || 'rgba(255,255,255,0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255,255,255,0.2)',
                    color: theme.palette.text.primary,
                }
            });
        }
    };

    // Mobile card component - matching Leave page pattern
    const MobileDailyWorkCard = ({ work }) => {
        const inchargeUser = getUserInfo(work.incharge);
        const assignedUser = getUserInfo(work.assigned);
        const statusConf = statusConfig[work.status] || statusConfig['new'];

        return (
            <GlassCard className="mb-2" shadow="sm">
                <CardContent className="p-3">
                    <Box className="flex items-start justify-between mb-3">
                        <Box className="flex items-center gap-3 flex-1">
                            <Box className="flex flex-col">
                                <Typography variant="body2" fontWeight="bold" className="text-primary">
                                    {work.number}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {formatDate(work.date)}
                                </Typography>
                            </Box>
                        </Box>
                        <Box className="flex items-center gap-2">
                            {getStatusChip(work.status)}
                            {(userIsAdmin) && (
                                <Dropdown>
                                    <DropdownTrigger>
                                        <IconButton size="small">
                                            <EllipsisVerticalIcon className="w-4 h-4" />
                                        </IconButton>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Work actions">
                                        <DropdownItem
                                            key="edit"
                                            startContent={<PencilIcon className="w-4 h-4" />}
                                            onPress={() => {
                                                setCurrentRow(work);
                                                openModal("editDailyWork");
                                            }}
                                            textValue="Edit Work"
                                        >
                                            Edit Work
                                        </DropdownItem>
                                        <DropdownItem
                                            key="delete"
                                            className="text-danger"
                                            color="danger"
                                            startContent={<TrashIcon className="w-4 h-4" />}
                                            textValue="Delete Work"
                                            onPress={() => handleClickOpen(work.id, "deleteDailyWork")}
                                        >
                                            Delete Work
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            )}
                        </Box>
                    </Box>

                    <Divider className="my-3" />

                    <Stack spacing={2}>
                        <Box className="flex items-center gap-2">
                            {getWorkTypeIcon(work.type)}
                            <Typography variant="body2" fontWeight="medium">
                                {work.type}
                            </Typography>
                        </Box>

                        <Box className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-default-500" />
                            <Typography variant="body2" color="textSecondary">
                                {work.location}
                            </Typography>
                        </Box>

                        {work.description && (
                            <Box className="flex items-start gap-2">
                                <DocumentTextIcon className="w-4 h-4 text-default-500 mt-0.5" />
                                <Typography variant="body2" color="textSecondary" className="flex-1">
                                    {work.description}
                                </Typography>
                            </Box>
                        )}

                        {userIsAdmin && inchargeUser.name !== 'Unassigned' && (
                            <Box className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-default-500" />
                                <Typography variant="body2" color="textSecondary">
                                    In-charge: {inchargeUser.name}
                                </Typography>
                            </Box>
                        )}

                        {userIsSE && assignedUser.name !== 'Unassigned' && (
                            <Box className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-default-500" />
                                <Typography variant="body2" color="textSecondary">
                                    Assigned: {assignedUser.name}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {(userIsAdmin || userIsSE) && (
                        <>
                            <Divider className="my-3" />
                            <Box className="flex gap-2 flex-wrap">
                                {Object.keys(statusConfig).map((status) => (
                                    <Button
                                        key={status}
                                        size="sm"
                                        variant={work.status === status ? "solid" : "bordered"}
                                        color={statusConfig[status].color}
                                        isLoading={updatingWorkId === work.id}
                                        onPress={() => updateWorkStatus(work, status)}
                                        startContent={
                                            updatingWorkId !== work.id ? 
                                            React.createElement(statusConfig[status].icon, {
                                                className: "w-3 h-3"
                                            }) : null
                                        }
                                        classNames={{
                                            base: "flex-1 min-w-[80px]"
                                        }}
                                    >
                                        {statusConfig[status].label}
                                    </Button>
                                ))}
                            </Box>
                        </>
                    )}
                </CardContent>
            </GlassCard>
        );
    };

    const columns = [
        {
            name: 'Date',
            selector: row => row.date,
            sortable: 'true',
            center: "true",
            width: '110px'
        },
        {
            name: 'RFI NO',
            selector: row => row.number,
            sortable: 'true',
            center: 'true',
            width: '160px',
            cell: row => (

                <>
                    {row.status === 'completed' && row.file ? (
                        <Link
                            isExternal
                            isBlock
                            showAnchorIcon
                            anchorIcon={<AssignmentTurnedInIcon />}
                            href={row.file}
                            color="success"
                            size={'sm'}
                        >
                            {row.number}
                        </Link>
                    ) : row.status === 'completed' && !row.file ? (
                        <Link
                            isBlock
                            showAnchorIcon
                            anchorIcon={<CloseIcon />}
                            href="#"
                            color="danger"
                            size={'sm'}
                            onClick={async (e) => {
                                e.preventDefault(); // Prevent default link behavior
                                const pdfFile = await captureDocument(row.number);
                                if (pdfFile) {
                                    // Send image to the backend
                                    await uploadImage(row.id, pdfFile);
                                }
                            }}
                        >
                            {row.number}
                        </Link>
                    ) : (row.number)}

                    {row.reports && row.reports.map(report => (
                        <div key={report.ref_no}>
                        <span>
                            <i className="mdi mdi-circle-medium"></i> {report.ref_no}
                        </span>
                        </div>
                    ))}
                </>
            ),
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: 'true',
            center: 'true',
            width: '220px',
            style: { padding: '0px 10px 0px 10px' },
            cell: row => (
                <Select
                    items={allStatuses}
                    aria-label="Status"
                    fullWidth
                    value={row.status || 'na'} // Set the value to 'na' if no status is assigned
                    onChange={(e) => handleChange(row.id,row.number, 'status', e.target.value, row.type)}
                    selectedKeys={[String(row.status)]}
                    style={{
                        minWidth: '220px',  // Optionally set a minimum width
                    }}
                    color={getStatusColor(row.status)}
                    popoverProps={{
                        classNames: {
                            content: 'bg-transparent backdrop-blur-lg border-inherit',
                        },
                        style: {
                            whiteSpace: 'nowrap', // Ensure content wraps
                            minWidth: 'fit-content',  // Optionally set a minimum width
                        },
                    }}
                    placeholder="Select Status"
                    renderValue={(selectedStatuses) => {
                        return selectedStatuses.map((selectedStatus) => (
                            <div key={selectedStatus.key} className="flex items-center gap-2 m-1">
                                {allStatuses.find(status => status.value === selectedStatus.data.value)?.icon} {/* Get the icon */}
                                <span>
                                    {selectedStatus.data.label}
                                </span>
                            </div>
                        ));
                    }}
                >
                    {(status) => (
                        <SelectItem key={status.value} textValue={status.value}>
                            <div className="flex items-center gap-2">
                                {status.icon} {/* Directly display the icon */}
                                <span style={{ color: getStatusColor(status.value) }}>
                                {status.label} {/* Display status label */}
                            </span>
                            </div>
                        </SelectItem>
                    )}
                </Select>
            ),
        },
        ...(userIsSe ? [{
            name: 'Assigned',
            selector: row => row.assigned,
            sortable: 'true',
            center: 'true',
            cell: row => (
                <Select
                    items={juniors}
                    variant="underlined"
                    aria-label="Assigned"
                    fullWidth
                    size="small"
                    value={row.assigned || 'na'}
                    style={{
                        minWidth: '260px',  // Optionally set a minimum width
                    }}
                    onChange={(e) => handleChange(row.id,row.number, 'assigned', e.target.value)}
                    popoverProps={{
                        classNames: {
                            content: 'bg-transparent backdrop-blur-lg border-inherit',
                        },
                        style: {
                            whiteSpace: 'nowrap', // Ensure content wraps
                            minWidth: 'fit-content',  // Optionally set a minimum width
                        },
                    }}
                    placeholder="Select a junior"
                    selectedKeys={[String(row.assigned || '')]}
                    renderValue={(selectedJuniors) => {
                        // Handle display of selected value(s)
                        return selectedJuniors.map((selectedJunior) => (
                            <div key={selectedJunior.key} className="flex items-center gap-2 m-1">
                                <User
                                    style={{
                                        whiteSpace: 'nowrap',  // Ensure content wraps
                                    }}
                                    size="sm"
                                    name={selectedJunior.data.name}
                                    avatarProps={{
                                        radius: "sm",
                                        size: "sm",
                                        src: selectedJunior.data.profile_image,
                                    }}
                                />
                            </div>
                        ));
                    }}
                >
                    {(junior) => (
                        <SelectItem key={junior.id} textValue={junior.id}>
                            <Box sx={{ display: 'flex' }}>
                                <Avatar
                                    src={junior.profile_image}
                                    alt={junior.name || 'Not assigned'}
                                    sx={{
                                        borderRadius: '50%',
                                        width: 23,
                                        height: 23,
                                        display: 'flex',
                                        marginRight: 1,
                                    }}
                                />
                                {junior.name}
                            </Box>
                        </SelectItem>
                    )}
                </Select>

            ),
        }] : []),
        {
            name: 'Type',
            selector: row => row.type,
            sortable: 'true',
            center: 'true',
            width: '140px',
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: 'true',
            left: 'true',
            width: '260px',

            cell: row => (
                <Box sx={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                }}>
                    {row.description}
                </Box>
            ),
        },
        {
            name: 'Location',
            selector: row => row.location,
            sortable: 'true',
            center: 'true',
            width: '200px',
            cell: row => (
                <Box sx={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                }}>
                    {row.location}
                </Box>
            ),
        },
        {
            name: 'Results',
            selector: row => row.inspection_details,
            sortable: 'true',
            width: '200px',
            center: 'true',
            cell: row => {
                const [isEditing, setIsEditing] = React.useState(false);
                const [inputValue, setInputValue] = React.useState(row.inspection_details || '');

                const handleClick = () => {
                    setIsEditing(true);
                };

                const handleInputChange = (event) => {
                    setInputValue(event.target.value);
                };

                const handleBlur = () => {
                    setIsEditing(false);
                    handleChange(row.id,row.number,'inspection_details', inputValue);
                };

                return (
                    <Box
                        sx={{
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                            cursor: 'pointer',
                        }}
                        onClick={!isEditing ? handleClick : undefined}
                    >
                        {!isEditing ? (
                            <>
                                {row.inspection_details || 'N/A'}
                            </>
                        ) : (
                            <TextField
                                fullWidth
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                autoFocus
                                variant="standard"
                                InputProps={{
                                    style: {
                                        marginBottom: 0,
                                        border: 'none',
                                        outline: 'none',
                                        backgroundColor: 'transparent',
                                        textAlign: 'center',
                                    },
                                }}
                            />
                        )}
                    </Box>
                );
            },
        },
        {
            name: 'Road Type',
            selector: row => row.side,
            sortable: 'true',
            center: 'true',
            width: '120px',
        },
        {
            name: 'Quantity/Layer No.',
            selector: row => row.qty_layer,
            sortable: 'true',
            center: 'true',
            width: '150px',
        },
        ...(userIsAdmin ? [{
            name: 'In charge',
            selector: row => row.incharge,
            sortable: 'true',
            center: 'true',
            cell: row => (
                <Select
                    items={allInCharges}
                    variant="underlined"
                    aria-label="Incharge"
                    fullWidth
                    value={row.incharge || 'na'}  // Set the value to 'na' if no incharge is assigned
                    onChange={(e) => handleChange(row.id,row.number, 'incharge', e.target.value)}
                    selectedKeys={[String(row.incharge)]}
                    style={{
                        minWidth: '260px',  // Optionally set a minimum width
                    }}
                    popoverProps={{
                        classNames: {
                            content: 'bg-transparent backdrop-blur-lg border-inherit',
                        },
                        style: {
                            whiteSpace: 'nowrap', // Ensure content wraps
                            minWidth: 'fit-content',  // Optionally set a minimum width
                        },
                    }}
                    placeholder="Select Incharge"
                    renderValue={(selectedIncharges) => {
                        // Handle display of selected value(s)
                        return selectedIncharges.map((selectedIncharge) => (
                            <div key={selectedIncharge.key} className="flex items-center gap-2 m-1">
                                <User
                                    style={{
                                        whiteSpace: 'nowrap',  // Ensure content wraps
                                    }}
                                    size="sm"
                                    name={selectedIncharge.data.name}
                                    avatarProps={{
                                        radius: "sm",
                                        size: "sm",
                                        src: selectedIncharge.data.profile_image,
                                    }}
                                />
                            </div>
                        ));
                    }}
                >
                    {(incharge) => (
                        <SelectItem key={incharge.id} textValue={incharge.id}>
                            <User
                                style={{
                                    whiteSpace: 'nowrap',  // Ensure content wraps
                                }}
                                size="sm"
                                name={incharge.name}
                                description={incharge.designation?.title || 'Incharge'}
                                avatarProps={{
                                    radius: "sm",
                                    size: "sm",
                                    src: incharge.profile_image,
                                }}
                            />
                        </SelectItem>
                    )}
                </Select>

            ),
        }] : []),
        {
            name: 'Planned Time',
            selector: row => row.planned_time,
            sortable: 'true',
            center: 'true',
            width: '130px',
        },
        {
            name: 'Completion Time',
            selector: row => row.completion_time,
            sortable: 'true',
            center: 'true',
            width: '250px',
            cell: row => (
                <Input
                    fullWidth
                    size="sm"
                    variant={'underlined'}
                    type={'datetime-local'}
                    value={row.completion_time
                        ? new Date(row.completion_time).toLocaleString('sv-SE').replace(' ', 'T')
                        : ''
                    }
                    onChange={(e) => handleChange(row.id,row.number, 'completion_time', e.target.value)}
                    inputProps={{
                        placeholder: 'YYYY-MM-DDTHH:MM',
                    }}
                />
            ),
        },
        {
            name: 'Resubmission Count',
            selector: row => row.resubmission_count,
            sortable: 'true',
            center: 'true',
            width: '160px',
            cell: row => (
                <>
                    {
                        row.resubmission_count
                            ? `${row.resubmission_count} ${row.resubmission_count > 1 ? 'times' : 'time'}`
                            : ''
                    }
                </>
            ),
        },
        ...(userIsAdmin ? [{
            name: 'RFI Submission Date',
            selector: row => row.rfi_submission_date,
            sortable: 'true',
            center: 'true',
            width: '180px',
            cell: row => (
                <Input
                    fullWidth
                    size="sm"
                    type="date"
                    variant={'underlined'}
                    onChange={(e) => handleChange(row.id,row.number, 'rfi_submission_date', e.target.value)}
                    value={row.rfi_submission_date ? new Date(row.rfi_submission_date).toISOString().slice(0, 10) : ''}
                    style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                    inputProps={{
                        placeholder: 'yyyy-MM-dd'
                    }}
                />
            ),
        }] : []),
        ...(userIsAdmin ? [{
            name: 'Actions',
            center: 'true',
            width: '150px',
            cell: row => (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <IconButton
                        sx={{m:1}}
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => {
                            setCurrentRow(row);
                            openModal('editDailyWork');
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        sx={{ m: 1 }}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleClickOpen(row.id, 'deleteDailyWork')}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        }] : []),
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'primary';
            case 'resubmission':
                return 'warning';
            case 'completed':
                return 'success';
            case 'emergency':
                return 'danger';
            default:
                return '';
        }
    };

    const captureDocument = (taskNumber) => {
        return new Promise((resolve, reject) => {
            // Create a file input element
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            // fileInput.capture = "camera"; // Open the camera directly
            fileInput.multiple = true; // Allow multiple image selection

            // Append the file input to the body (it won't be visible)
            document.body.appendChild(fileInput);

            // Handle the file selection
            fileInput.onchange = async () => {
                const files = Array.from(fileInput.files);
                if (files.length > 0) {
                    try {
                        const images = [];

                        // Load each selected file into an Image object and resize it
                        for (let file of files) {
                            const img = await loadImage(file);
                            const resizedCanvas = resizeImage(img, 1024); // Resize to a consistent height
                            images.push(resizedCanvas);
                        }

                        // Combine images into a single PDF document
                        const pdfBlob = await combineImagesToPDF(images);

                        // Resolve the final PDF file
                        const pdfFile = new File([pdfBlob], `${taskNumber}_scanned_document.pdf`, { type: "application/pdf" });
                        resolve(pdfFile);

                        // Clean up
                        document.body.removeChild(fileInput);
                    } catch (error) {
                        reject(error);
                        document.body.removeChild(fileInput);
                    }
                } else {
                    reject(new Error("No files selected"));
                    document.body.removeChild(fileInput);
                }
            };

            // Trigger the file input click to open the camera
            fileInput.click();
        });
    };

// Helper function to load image from file
    const loadImage = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                resolve(img);
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
        });
    };

// Helper function to resize an image and return a canvas
    const resizeImage = (img, targetHeight) => {
        const aspectRatio = img.width / img.height;
        const targetWidth = targetHeight * aspectRatio;
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        return canvas;
    };

// Helper function to combine images into a PDF using jsPDF
    const combineImagesToPDF = (images) => {
        return new Promise((resolve, reject) => {

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [images[0].width, images[0].height],
            });

            images.forEach((canvas, index) => {
                if (index > 0) pdf.addPage(); // Add a new page for each image
                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
            });

            try {
                const pdfBlob = pdf.output("blob");
                resolve(pdfBlob);
            } catch (error) {
                reject(error);
            }
        });
    };

    const uploadImage = async (taskId, imageFile) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const formData = new FormData();
                formData.append("taskId", taskId);
                formData.append("file", imageFile);

                const response = await axios.post(route('dailyWorks.uploadRFI'), formData, {
                    headers: {"Content-Type": "multipart/form-data"},
                });

                if (response.status === 200) {
                    setData(prevTasks =>
                        prevTasks.map(task =>
                            task.id === taskId ? {...task, file: response.data.url} : task
                        )
                    );
                    resolve([response.data.message || 'RFI file uploaded successfully']);
                }
            } catch (error) {

                console.error(error)
                reject(error.response.statusText || 'Failed to upload RFI file');
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
                                <span style={{ marginLeft: '8px' }}>Uploading RFI file...</span>
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
                                {data}
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

    const handleChange = async (taskId,taskNumber, key, value, type) => {
        try {
            if (key === 'status' && value === 'completed' && !(type === 'Structure')) {
                // Open camera and capture image
                const pdfFile = await captureDocument(taskNumber);
                if (pdfFile) {
                    // Send image to the backend
                    await uploadImage(taskId, pdfFile);
                }
            }


            const response = await axios.post(route('dailyWorks.update'), {
                id: taskId,
                [key]: value,
            });


            if (response.status === 200) {
                setData(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, [key]: value } : task
                    )
                );

                toast.success(...(response.data.messages || `Task updated successfully`), {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            } else {
                toast.error(response.data.error || `Failed to update task ${[key]}.`, {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'An unexpected error occurred.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        }
    };





    return (
        <div>
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

export default DailyWorksTable;
