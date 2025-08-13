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
    CircularProgress
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
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
    BuildingOfficeIcon,
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
    const { auth, users, jurisdictions } = usePage().props;
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    const [isUpdating, setIsUpdating] = useState(false);
    const [updatingWorkId, setUpdatingWorkId] = useState(null);

    // Permission-based access control using designations
    const userIsAdmin = auth.roles?.includes('Administrator') || auth.roles?.includes('Super Administrator') || false;
    const userIsSE = auth.designation === 'Supervision Engineer' || false;
    const userIsQCI = auth.designation === 'Quality Control Inspector' || auth.designation === 'Asst. Quality Control Inspector' || false;

    // Use available data with fallbacks
    const availableInCharges = allInCharges || users || [];
    const availableJuniors = juniors || users || [];
    const availableJurisdictions = jurisdictions || [];

    // Status configuration - standardized across the application
    const statusConfig = {
        'new': {
            color: 'primary',
            icon: ExclamationTriangleSolid,
            bgColor: alpha(theme.palette.primary.main, 0.1),
            textColor: theme.palette.primary.main,
            label: 'New Work',
            description: 'Newly created work item'
        },
        'resubmission': {
            color: 'warning',
            icon: ArrowPathSolid,
            bgColor: alpha(theme.palette.warning.main, 0.1),
            textColor: theme.palette.warning.main,
            label: 'Resubmission Required',
            description: 'Work needs to be resubmitted'
        },
        'completed': {
            color: 'success',
            icon: CheckCircleSolid,
            bgColor: alpha(theme.palette.success.main, 0.1),
            textColor: theme.palette.success.main,
            label: 'Completed',
            description: 'Work has been completed successfully'
        },
        'emergency': {
            color: 'danger',
            icon: ExclamationTriangleSolid,
            bgColor: alpha(theme.palette.error.main, 0.1),
            textColor: theme.palette.error.main,
            label: 'Emergency Work',
            description: 'Urgent work requiring immediate attention'
        }
    };

    const getWorkTypeIcon = (type, className = "w-4 h-4") => {
        const iconClass = `${className} flex-shrink-0`;
        
        switch (type?.toLowerCase()) {
            case "embankment":
                return <BuildingOfficeIcon className={`${iconClass} text-amber-600 dark:text-amber-400`} />;
            case "structure":
                return <DocumentIcon className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
            case "pavement":
                return <MapPinIcon className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
            case "earthwork":
                return <BuildingOfficeIcon className={`${iconClass} text-green-600 dark:text-green-400`} />;
            case "drainage":
                return <DocumentIcon className={`${iconClass} text-cyan-600 dark:text-cyan-400`} />;
            case "roadwork":
                return <MapPinIcon className={`${iconClass} text-orange-600 dark:text-orange-400`} />;
            case "bridge":
                return <BuildingOfficeIcon className={`${iconClass} text-purple-600 dark:text-purple-400`} />;
            case "culvert":
                return <DocumentIcon className={`${iconClass} text-indigo-600 dark:text-indigo-400`} />;
            case "standard":
            default:
                return <DocumentTextIcon className={`${iconClass} text-default-500`} />;
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
        if (!dateString) return 'No date';
        
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'Not set';
        
        try {
            return new Date(dateTimeString).toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (error) {
            return 'Invalid datetime';
        }
    };

    const getUserInfo = (userId) => {
        if (!userId) return { name: 'Unassigned', profile_image: null };
        
        const user = availableInCharges?.find((u) => String(u.id) === String(userId)) || 
                    availableJuniors?.find((u) => String(u.id) === String(userId)) ||
                    users?.find((u) => String(u.id) === String(userId));
        return user || { name: 'Unassigned', profile_image: null };
    };

    const getJurisdictionInfo = (jurisdictionId) => {
        if (!jurisdictionId) return { name: 'No jurisdiction assigned', location: 'Unknown' };
        
        const jurisdiction = availableJurisdictions?.find((j) => String(j.id) === String(jurisdictionId));
        return jurisdiction || { name: 'Unknown jurisdiction', location: 'Unknown' };
    };

    // Image capture functions
    const captureDocument = (taskNumber) => {
        return new Promise((resolve, reject) => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.multiple = true;

            document.body.appendChild(fileInput);

            fileInput.onchange = async () => {
                const files = Array.from(fileInput.files);
                if (files.length > 0) {
                    try {
                        const images = [];

                        for (let file of files) {
                            const img = await loadImage(file);
                            const resizedCanvas = resizeImage(img, 1024);
                            images.push(resizedCanvas);
                        }

                        const pdfBlob = await combineImagesToPDF(images);
                        const pdfFile = new File([pdfBlob], `${taskNumber}_scanned_document.pdf`, { type: "application/pdf" });
                        resolve(pdfFile);

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

            fileInput.click();
        });
    };

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

    const combineImagesToPDF = (images) => {
        return new Promise((resolve, reject) => {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [images[0].width, images[0].height],
            });

            images.forEach((canvas, index) => {
                if (index > 0) pdf.addPage();
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
                console.error(error);
                reject(error.response.statusText || 'Failed to upload RFI file');
            }
        });

        toast.promise(promise, {
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
                    background: theme.glassCard?.background || 'rgba(255,255,255,0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255,255,255,0.2)',
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
                    background: theme.glassCard?.background || 'rgba(255,255,255,0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255,255,255,0.2)',
                    color: theme.palette.text.primary,
                },
            },
            error: {
                render({ data }) {
                    return <>{data}</>;
                },
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard?.background || 'rgba(255,255,255,0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255,255,255,0.2)',
                    color: theme.palette.text.primary,
                },
            },
        });
    };

    // Handle status updates
    const updateWorkStatus = useCallback(async (work, newStatus) => {
        if (updatingWorkId === work.id) return;

        setUpdatingWorkId(work.id);
        const promise = new Promise(async (resolve, reject) => {
            try {
                // Prepare update data with logical field assignments
                const updateData = {
                    id: work.id,
                    status: newStatus,
                    // Include required fields with standardized fallbacks
                    date: work.date || new Date().toISOString().split('T')[0],
                    number: work.number || `RFI-${Date.now()}`,
                    planned_time: work.planned_time || '09:00',
                    type: work.type || 'Standard',
                    description: work.description || 'Work description pending',
                    location: work.location || 'Location to be determined',
                    side: work.side || 'Both'
                };

                // Logical field assignments based on status
                if (newStatus === 'completed') {
                    // Auto-set completion time to current time if not already set
                    updateData.completion_time = work.completion_time || new Date().toISOString();
                    
                    // Auto-set submission time to current time if not already set
                    updateData.submission_time = work.submission_time || new Date().toISOString();
                    
                    // If not structure type, capture document
                    if (!(work.type?.toLowerCase() === 'structure')) {
                        const pdfFile = await captureDocument(work.number);
                        if (pdfFile) {
                            await uploadImage(work.id, pdfFile);
                        }
                    }
                } else if (newStatus === 'resubmission') {
                    // Increment resubmission count
                    updateData.resubmission_count = (work.resubmission_count || 0) + 1;
                } else if (newStatus === 'new') {
                    // Reset completion and submission times for new status
                    updateData.completion_time = null;
                    updateData.submission_time = null;
                }

                const response = await axios.post(route('dailyWorks.update'), updateData);

                if (response.status === 200) {
                    setData(prevWorks =>
                        prevWorks.map(w =>
                            w.id === work.id ? { 
                                ...w, 
                                status: newStatus,
                                ...(newStatus === 'completed' && {
                                    completion_time: updateData.completion_time,
                                    submission_time: updateData.submission_time
                                }),
                                ...(newStatus === 'resubmission' && {
                                    resubmission_count: updateData.resubmission_count
                                }),
                                ...(newStatus === 'new' && {
                                    completion_time: null,
                                    submission_time: null
                                })
                            } : w
                        )
                    );
                    resolve(response.data.message || "Work status updated successfully");
                }
            } catch (error) {
                let errorMsg = "Failed to update work status";
                
                if (error.response?.status === 422 && error.response.data?.errors) {
                    // Handle validation errors
                    const errors = error.response.data.errors;
                    const errorMessages = Object.values(errors).flat();
                    errorMsg = errorMessages.join(', ');
                } else if (error.response?.data?.message) {
                    errorMsg = error.response.data.message;
                } else if (error.response?.statusText) {
                    errorMsg = error.response.statusText;
                }
                
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
            // Find the current work to get all its data
            const currentWork = allData?.find(work => work.id === taskId);
            if (!currentWork) {
                toast.error('Work not found');
                return;
            }

            // Prepare update data with logical field assignments
            const updateData = {
                id: taskId,
                [key]: value,
                // Include required fields with standardized fallbacks
                date: currentWork.date || new Date().toISOString().split('T')[0],
                number: currentWork.number || `RFI-${Date.now()}`,
                planned_time: currentWork.planned_time || '09:00',
                status: key === 'status' ? value : (currentWork.status || 'new'),
                type: currentWork.type || 'Standard',
                description: currentWork.description || 'Work description pending',
                location: currentWork.location || 'Location to be determined',
                side: currentWork.side || 'Both'
            };

            // Logical field assignments
            if (key === 'status') {
                if (value === 'completed') {
                    // Auto-set completion time and submission time if not already set
                    updateData.completion_time = currentWork.completion_time || new Date().toISOString();
                    updateData.submission_time = currentWork.submission_time || new Date().toISOString();
                    
                    // Capture document if not structure type
                    if (!(type === 'Structure')) {
                        const pdfFile = await captureDocument(taskNumber);
                        if (pdfFile) {
                            await uploadImage(taskId, pdfFile);
                        }
                    }
                } else if (value === 'resubmission') {
                    // Increment resubmission count
                    updateData.resubmission_count = (currentWork.resubmission_count || 0) + 1;
                } else if (value === 'new') {
                    // Reset completion and submission times for new status
                    updateData.completion_time = null;
                    updateData.submission_time = null;
                }
            }

            const response = await axios.post(route('dailyWorks.update'), updateData);

            if (response.status === 200) {
                setData(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { 
                            ...task, 
                            [key]: value,
                            // Update logical fields based on status change
                            ...(key === 'status' && value === 'completed' && {
                                completion_time: updateData.completion_time,
                                submission_time: updateData.submission_time
                            }),
                            ...(key === 'status' && value === 'resubmission' && {
                                resubmission_count: updateData.resubmission_count
                            }),
                            ...(key === 'status' && value === 'new' && {
                                completion_time: null,
                                submission_time: null
                            })
                        } : task
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
            let errorMessage = 'An unexpected error occurred.';
            
            if (error.response?.status === 422 && error.response.data?.errors) {
                // Handle validation errors
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat();
                errorMessage = errorMessages.join(', ');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.statusText) {
                errorMessage = error.response.statusText;
            }

            toast.error(errorMessage, {
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
                            {userIsAdmin && (
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
                                        >
                                            Edit Work
                                        </DropdownItem>
                                        <DropdownItem
                                            key="delete"
                                            className="text-danger"
                                            color="danger"
                                            startContent={<TrashIcon className="w-4 h-4" />}
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
                            {getWorkTypeIcon(work.type, "w-4 h-4")}
                            <Typography variant="body2" fontWeight="medium" className="capitalize">
                                {work.type || 'Standard Work'}
                            </Typography>
                        </Box>

                        <Box className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-default-500" />
                            <Typography variant="body2" color="textSecondary">
                                {work.location || 'Location not specified'}
                            </Typography>
                        </Box>

                        {work.description && (
                            <Box className="flex items-start gap-2">
                                <DocumentTextIcon className="w-4 h-4 text-default-500 mt-0.5 flex-shrink-0" />
                                <Typography variant="body2" color="textSecondary" className="flex-1 break-words">
                                    {work.description}
                                </Typography>
                            </Box>
                        )}

                        <Box className="flex items-center gap-2">
                            <BuildingOfficeIcon className="w-4 h-4 text-default-500" />
                            <Typography variant="body2" color="textSecondary">
                                Jurisdiction: {getJurisdictionInfo(work.jurisdiction_id)?.name || 'Not assigned'}
                            </Typography>
                        </Box>

                        {work.side && (
                            <Box className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-default-500" />
                                <Typography variant="body2" color="textSecondary">
                                    Road Side: {work.side}
                                </Typography>
                            </Box>
                        )}

                        {work.qty_layer && (
                            <Box className="flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4 text-default-500" />
                                <Typography variant="body2" color="textSecondary">
                                    Layers: {work.qty_layer}
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

                        {userIsAdmin && inchargeUser.name === 'Unassigned' && (
                            <Box className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-default-500" />
                                <Chip size="sm" variant="flat" color="default">
                                    No In-charge
                                </Chip>
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

                        {userIsSE && assignedUser.name === 'Unassigned' && (
                            <Box className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-default-500" />
                                <Chip size="sm" variant="flat" color="default">
                                    Unassigned
                                </Chip>
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

    const handlePageChange = useCallback((page) => {
        if (onPageChange) {
            onPageChange(page);
        }
    }, [onPageChange]);

    const renderCell = useCallback((work, columnKey) => {
        const inchargeUser = getUserInfo(work.incharge);
        const assignedUser = getUserInfo(work.assigned);

        switch (columnKey) {
            case "date":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-3 h-3 text-default-500" />
                            <Typography variant="body2" className="text-sm font-medium">
                                {formatDate(work.date)}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "number":
                return (
                    <TableCell>
                        <Box className="flex flex-col">
                            {work.status === 'completed' && work.file ? (
                                <Link
                                    isExternal
                                    href={work.file}
                                    color="success"
                                    size="sm"
                                    className="font-medium"
                                >
                                    {work.number}
                                </Link>
                            ) : work.status === 'completed' && !work.file ? (
                                <Link
                                    href="#"
                                    color="danger"
                                    size="sm"
                                    className="font-medium"
                                    onPress={async () => {
                                        const pdfFile = await captureDocument(work.number);
                                        if (pdfFile) {
                                            await uploadImage(work.id, pdfFile);
                                        }
                                    }}
                                >
                                    {work.number}
                                </Link>
                            ) : (
                                <Typography variant="body2" className="text-sm font-medium text-primary">
                                    {work.number}
                                </Typography>
                            )}
                            {work.reports?.map(report => (
                                <Typography key={report.ref_no} variant="caption" color="textSecondary" className="text-xs">
                                    • {report.ref_no}
                                </Typography>
                            ))}
                        </Box>
                    </TableCell>
                );

            case "status":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-2">
                            {(userIsAdmin || userIsSE) ? (
                                <Select
                                    size="sm"
                                    variant="bordered"
                                    placeholder="Select status"
                                    aria-label="Select work status"
                                    selectedKeys={work.status ? [work.status] : []}
                                    onSelectionChange={(keys) => {
                                        const selectedKey = Array.from(keys)[0];
                                        if (selectedKey) {
                                            updateWorkStatus(work, selectedKey);
                                        }
                                    }}
                                    isDisabled={updatingWorkId === work.id}
                                    classNames={{
                                        trigger: "min-h-10 w-full bg-white/50 hover:bg-white/80 focus:bg-white/90 transition-colors",
                                        value: "text-xs",
                                        popoverContent: "min-w-[240px]"
                                    }}
                                    renderValue={(items) => {
                                        if (items.length === 0) {
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <ExclamationTriangleSolid className="w-4 h-4 text-default-400" />
                                                    <span className="text-xs">Select status</span>
                                                </div>
                                            );
                                        }
                                        const currentStatus = statusConfig[work.status] || statusConfig['new'];
                                        const StatusIcon = currentStatus.icon;
                                        return (
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className="w-4 h-4" style={{ color: currentStatus.textColor }} />
                                                <span className="text-xs font-medium">{currentStatus.label}</span>
                                            </div>
                                        );
                                    }}
                                >
                                    {Object.keys(statusConfig).map((status) => {
                                        const config = statusConfig[status];
                                        const StatusIcon = config.icon;
                                        return (
                                            <SelectItem 
                                                key={status} 
                                                textValue={config.label}
                                                startContent={<StatusIcon className="w-4 h-4" style={{ color: config.textColor }} />}
                                                description={config.description}
                                                classNames={{
                                                    title: "text-sm font-medium",
                                                    description: "text-xs"
                                                }}
                                            >
                                                {config.label}
                                            </SelectItem>
                                        );
                                    })}
                                </Select>
                            ) : (
                                getStatusChip(work.status)
                            )}
                        </Box>
                    </TableCell>
                );

            case "type":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-2">
                            {getWorkTypeIcon(work.type, "w-4 h-4")}
                            <Typography variant="body2" className="text-sm font-medium capitalize">
                                {work.type || 'Standard Work'}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "description":
                return (
                    <TableCell>
                        <MuiTooltip title={work.description || "No description provided"} arrow>
                            <Typography 
                                variant="body2" 
                                className="max-w-xs truncate cursor-help text-sm"
                                color="textSecondary"
                            >
                                {work.description || "No description provided"}
                            </Typography>
                        </MuiTooltip>
                    </TableCell>
                );

            case "location":
                return (
                    <TableCell>
                        <Box className="flex flex-col gap-1">
                            <Box className="flex items-center gap-2">
                                <MapPinIcon className="w-3 h-3 text-default-500" />
                                <Typography variant="body2" className="text-sm font-medium">
                                    {work.location || 'Location not specified'}
                                </Typography>
                            </Box>
                            
                        </Box>
                    </TableCell>
                );

            case "inspection_details":
                return (
                    <TableCell>
                        <Input
                            size="sm"
                            variant="bordered"
                            placeholder="Enter inspection details..."
                            value={work.inspection_details || ''}
                            onChange={(e) => handleChange(work.id, work.number, 'inspection_details', e.target.value)}
                            classNames={{
                                input: "text-xs",
                                inputWrapper: "min-h-10 bg-white/50 hover:bg-white/80 focus-within:bg-white/90 transition-colors",
                                innerWrapper: "text-xs"
                            }}
                            startContent={<DocumentCheckIcon className="w-4 h-4 text-default-400" />}
                        />
                    </TableCell>
                );

            case "side":
                return (
                    <TableCell>
                        <Chip 
                            size="sm" 
                            variant="flat" 
                            color="default"
                            className="capitalize"
                        >
                            {work.side || 'Both Sides'}
                        </Chip>
                    </TableCell>
                );

            case "qty_layer":
                return (
                    <TableCell>
                        <Typography variant="body2" className="text-sm">
                            {work.qty_layer ? `${work.qty_layer} layers` : 'N/A'}
                        </Typography>
                    </TableCell>
                );

            case "planned_time":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3 text-default-500" />
                            <Typography variant="body2" className="text-sm">
                                {work.planned_time || 'Not set'}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "resubmission_count":
                return (
                    <TableCell>
                        <Chip 
                            size="sm" 
                            variant="flat" 
                            color={work.resubmission_count > 0 ? "warning" : "default"}
                        >
                            {work.resubmission_count || 0}
                        </Chip>
                    </TableCell>
                );

            case "incharge":
                return (
                    <TableCell>
                        {userIsAdmin ? (
                            <Select
                                size="sm"
                                variant="bordered"
                                placeholder="Select in-charge"
                                aria-label="Select in-charge person"
                                selectedKeys={work.incharge ? [String(work.incharge)] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0];
                                    if (selectedKey) {
                                        handleChange(work.id, work.number, 'incharge', selectedKey);
                                    }
                                }}
                                classNames={{
                                    trigger: "min-h-10 w-full bg-white/50 hover:bg-white/80 focus:bg-white/90 transition-colors",
                                    value: "text-xs",
                                    popoverContent: "min-w-[280px]"
                                }}
                                renderValue={(items) => {
                                    if (items.length === 0) {
                                        return (
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-4 h-4 text-default-400" />
                                                <span className="text-xs">Select in-charge</span>
                                            </div>
                                        );
                                    }
                                    return items.map((item) => (
                                        <div key={item.key} className="flex items-center gap-2">
                                            <img
                                                src={inchargeUser.profile_image || '/default-avatar.png'}
                                                alt={inchargeUser.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                            <span className="text-xs font-medium">{inchargeUser.name}</span>
                                        </div>
                                    ));
                                }}
                            >
                                {availableInCharges?.map((incharge) => (
                                    <SelectItem key={incharge.id} textValue={incharge.name}>
                                        <User
                                            size="sm"
                                            name={incharge.name}
                                            description={`Employee ID: ${incharge.employee_id || 'N/A'}`}
                                            avatarProps={{
                                                size: "sm",
                                                src: incharge.profile_image,
                                            }}
                                        />
                                    </SelectItem>
                                ))}
                            </Select>
                        ) : (
                            <Box className="flex items-center gap-2">
                                {inchargeUser.name !== 'Unassigned' ? (
                                    <User
                                        size="sm"
                                        name={inchargeUser.name}
                                        description="In-charge"
                                        avatarProps={{
                                            size: "sm",
                                            src: inchargeUser.profile_image,
                                        }}
                                        classNames={{
                                            name: "text-xs font-medium",
                                            description: "text-xs text-default-400"
                                        }}
                                    />
                                ) : (
                                    <Chip size="sm" variant="flat" color="default">
                                        Unassigned
                                    </Chip>
                                )}
                            </Box>
                        )}
                    </TableCell>
                );

            case "assigned":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-2">
                            {assignedUser.name !== 'Unassigned' ? (
                                <User
                                    size="sm"
                                    name={assignedUser.name}
                                    description="Assigned"
                                    avatarProps={{
                                        size: "sm",
                                        src: assignedUser.profile_image,
                                    }}
                                    classNames={{
                                        name: "text-xs font-medium",
                                        description: "text-xs text-default-400"
                                    }}
                                />
                            ) : (
                                <Chip size="sm" variant="flat" color="default">
                                    Unassigned
                                </Chip>
                            )}
                        </Box>
                    </TableCell>
                );

            case "completion_time":
                return (
                    <TableCell>
                        <Input
                            size="sm"
                            type="datetime-local"
                            variant="bordered"
                            value={work.completion_time
                                ? new Date(work.completion_time).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16)
                                : ''
                            }
                            onChange={(e) => handleChange(work.id, work.number, 'completion_time', e.target.value)}
                            classNames={{
                                input: "text-xs",
                                inputWrapper: "min-h-10 bg-white/50 hover:bg-white/80 focus-within:bg-white/90 transition-colors"
                            }}
                            startContent={<CheckCircleIcon className="w-4 h-4 text-default-400" />}
                        />
                    </TableCell>
                );

           

            case "rfi_submission_date":
                return (
                    <TableCell>
                        {userIsAdmin ? (
                            <Input
                                size="sm"
                                type="date"
                                variant="bordered"
                                value={work.rfi_submission_date ? 
                                    new Date(work.rfi_submission_date).toISOString().slice(0, 10) : ''
                                }
                                onChange={(e) => handleChange(work.id, work.number, 'rfi_submission_date', e.target.value)}
                                classNames={{
                                    input: "text-xs",
                                    inputWrapper: "min-h-10 bg-white/50 hover:bg-white/80 focus-within:bg-white/90 transition-colors"
                                }}
                                startContent={<CalendarDaysIcon className="w-4 h-4 text-default-400" />}
                            />
                        ) : (
                            <Box className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-3 h-3 text-default-500" />
                                <Typography variant="body2" className="text-sm">
                                    {work.rfi_submission_date ? formatDate(work.rfi_submission_date) : 'Not set'}
                                </Typography>
                            </Box>
                        )}
                    </TableCell>
                );

            case "actions":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <Tooltip content="Edit Work">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        if (updatingWorkId === work.id) return;
                                        setCurrentRow(work);
                                        openModal("editDailyWork");
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
                            <Tooltip content="Delete Work" color="danger">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        if (updatingWorkId === work.id) return;
                                        setCurrentRow(work);
                                        handleClickOpen(work.id, "deleteDailyWork");
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
                        </Box>
                    </TableCell>
                );

            default:
                return <TableCell>{work[columnKey]}</TableCell>;
        }
    }, [userIsAdmin, userIsSE, updatingWorkId, theme, setCurrentRow, openModal, handleClickOpen, handleChange]);

    const columns = [
        { name: "Date", uid: "date", icon: CalendarDaysIcon, sortable: true },
        { name: "RFI Number", uid: "number", icon: DocumentIcon, sortable: true },
        { name: "Status", uid: "status", icon: ClockIconOutline, sortable: true },
        { name: "Work Type", uid: "type", icon: DocumentTextIcon, sortable: true },
        { name: "Description", uid: "description", icon: DocumentTextIcon, sortable: false },
        { name: "Location", uid: "location", icon: MapPinIcon, sortable: true },
        { name: "Inspection Results", uid: "inspection_details", icon: DocumentCheckIcon, sortable: false },
        { name: "Road Side", uid: "side", sortable: true },
        { name: "Layer Quantity", uid: "qty_layer", sortable: true },
        ...(userIsAdmin ? [{ name: "In-Charge", uid: "incharge", icon: UserIcon, sortable: true }] : []),
        { name: "Assigned To", uid: "assigned", icon: UserIcon, sortable: true },
        { name: "Planned Time", uid: "planned_time", icon: ClockIcon, sortable: true },
        { name: "Completion Time", uid: "completion_time", icon: CheckCircleIcon, sortable: true },
        { name: "Resubmissions", uid: "resubmission_count", icon: ArrowPathIcon, sortable: true },
        ...(userIsAdmin ? [{ name: "RFI Submission Date", uid: "rfi_submission_date", icon: CalendarDaysIcon, sortable: true }] : []),
        ...(userIsAdmin ? [{ name: "Actions", uid: "actions", sortable: false }] : [])
    ];

    if (isMobile) {
        return (
            <Box className="space-y-4">
                <ScrollShadow className="max-h-[70vh]">
                    {allData?.map((work) => (
                        <MobileDailyWorkCard key={work.id} work={work} />
                    ))}
                </ScrollShadow>
                {totalRows > 30 && (
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
                    aria-label="Daily Works Management Table"
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
                        items={allData || []}
                        emptyContent={
                            <Box className="flex flex-col items-center justify-center py-8 text-center">
                                <DocumentTextIcon className="w-12 h-12 text-default-300 mb-4" />
                                <Typography variant="h6" color="textSecondary">
                                    No daily works found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    No work logs available for the selected period
                                </Typography>
                            </Box>
                        }
                        isLoading={loading}
                        loadingContent={<CircularProgress size={40} />}
                    >
                        {(work) => (
                            <TableRow 
                                key={work.id} 
                            >
                                {(columnKey) => renderCell(work, columnKey)}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollShadow>
            {totalRows > 30 && (
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
};

export default DailyWorksTable;
