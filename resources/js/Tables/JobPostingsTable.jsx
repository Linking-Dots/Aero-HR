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
    MoreVert as MoreVertIcon,
    Visibility as ViewIcon
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
    BriefcaseIcon,
    UserIcon,
    ClockIcon,
    DocumentTextIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    UsersIcon,
    StarIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    XCircleIcon as XCircleSolid,
    ClockIcon as ClockSolid,
    ExclamationTriangleIcon as ExclamationTriangleSolid,
    StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import GlassCard from "@/Components/GlassCard";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const JobPostingsTable = React.forwardRef(({
    data = [],
    totalRows = 0,
    lastPage = 1,
    currentPage = 1,
    perPage = 10,
    onPageChange,
    onPerPageChange,
    onView,
    onEdit,
    onDelete,
    onApplications,
    canEdit = false,
    canDelete = false,
    loading = false
}, ref) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    // Status configuration
    const statusConfig = {
        'draft': {
            color: 'default',
            icon: ExclamationTriangleSolid,
            bgColor: alpha(theme.palette.grey[500], 0.1),
            textColor: theme.palette.grey[700]
        },
        'open': {
            color: 'success',
            icon: CheckCircleSolid,
            bgColor: alpha(theme.palette.success.main, 0.1),
            textColor: theme.palette.success.main
        },
        'closed': {
            color: 'danger',
            icon: XCircleSolid,
            bgColor: alpha(theme.palette.error.main, 0.1),
            textColor: theme.palette.error.main
        },
        'on_hold': {
            color: 'warning',
            icon: ClockSolid,
            bgColor: alpha(theme.palette.warning.main, 0.1),
            textColor: theme.palette.warning.main
        },
        'cancelled': {
            color: 'danger',
            icon: XCircleSolid,
            bgColor: alpha(theme.palette.error.main, 0.1),
            textColor: theme.palette.error.main
        }
    };

    const getJobTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "full_time":
                return <BriefcaseIcon className="w-3 h-3 text-blue-500" />;
            case "part_time":
                return <ClockIcon className="w-3 h-3 text-orange-500" />;
            case "contract":
                return <DocumentTextIcon className="w-3 h-3 text-purple-500" />;
            case "temporary":
                return <CalendarDaysIcon className="w-3 h-3 text-yellow-500" />;
            case "internship":
                return <UsersIcon className="w-3 h-3 text-green-500" />;
            case "remote":
                return <MapPinIcon className="w-3 h-3 text-indigo-500" />;
            default:
                return <BriefcaseIcon className="w-3 h-3 text-primary" />;
        }
    };

    const handlePageChange = useCallback((page) => {
        console.log('Pagination page change requested:', page);
        if (onPageChange) {
            onPageChange(page);
        }
    }, [onPageChange]);

    const getStatusChip = (status) => {
        const config = statusConfig[status] || statusConfig['draft'];
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
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Chip>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return dayjs(dateString).format('MMM DD, YYYY');
    };

    const formatSalary = (min, max, currency = 'USD') => {
        if (!min && !max) return 'Not disclosed';
        
        const formatNumber = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
            return num.toString();
        };

        const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
        
        if (min && max) {
            return `${symbol}${formatNumber(min)} - ${symbol}${formatNumber(max)}`;
        }
        return min ? `${symbol}${formatNumber(min)}+` : `Up to ${symbol}${formatNumber(max)}`;
    };

    // Mobile card component for better mobile experience
    const MobileJobCard = ({ job }) => {
        const statusConf = statusConfig[job.status] || statusConfig['draft'];

        return (
            <GlassCard className="mb-2" shadow="sm">
                <CardContent className="p-3">
                    <Box className="flex items-start justify-between mb-3">
                        <Box className="flex items-center gap-3 flex-1">
                            <Box className="flex items-center gap-2">
                                <BriefcaseIcon className="w-5 h-5 text-primary" />
                                <Box>
                                    <Typography variant="body2" fontWeight="medium" className="flex items-center gap-1">
                                        {job.title}
                                        {job.is_featured && <StarSolid className="w-3 h-3 text-yellow-500" />}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {job.department?.name || 'No Department'} • {job.hiring_manager?.name || 'No Manager'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box className="flex items-center gap-2">
                            {getStatusChip(job.status)}
                            <Dropdown>
                                <DropdownTrigger>
                                    <IconButton size="small">
                                        <EllipsisVerticalIcon className="w-4 h-4" />
                                    </IconButton>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Job actions">
                                    {onView && (
                                        <DropdownItem
                                            key="view"
                                            startContent={<EyeIcon className="w-4 h-4" />}
                                            onPress={() => onView(job)}
                                        >
                                            View Details
                                        </DropdownItem>
                                    )}
                                    {canEdit && onEdit && (
                                        <DropdownItem
                                            key="edit"
                                            startContent={<PencilIcon className="w-4 h-4" />}
                                            onPress={() => onEdit(job)}
                                        >
                                            Edit Job
                                        </DropdownItem>
                                    )}
                                    {onApplications && (
                                        <DropdownItem
                                            key="applications"
                                            startContent={<UsersIcon className="w-4 h-4" />}
                                            onPress={() => onApplications(job)}
                                        >
                                            View Applications ({job.applications_count || 0})
                                        </DropdownItem>
                                    )}
                                    {canDelete && onDelete && (
                                        <DropdownItem
                                            key="delete"
                                            className="text-danger"
                                            color="danger"
                                            startContent={<TrashIcon className="w-4 h-4" />}
                                            onPress={() => onDelete(job)}
                                        >
                                            Delete Job
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </Box>
                    </Box>

                    <Divider className="my-3" />

                    <Stack spacing={2}>
                        <Box className="flex items-center gap-2">
                            {getJobTypeIcon(job.type)}
                            <Typography variant="body2" fontWeight="medium" className="capitalize">
                                {job.type?.replace('_', ' ')}
                            </Typography>
                            <Chip size="sm" variant="bordered" color="default">
                                {job.positions} position{job.positions > 1 ? 's' : ''}
                            </Chip>
                        </Box>

                        <Box className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-default-500" />
                            <Typography variant="body2" color="textSecondary">
                                {job.is_remote_allowed ? 'Remote' : job.location || 'Location not specified'}
                            </Typography>
                        </Box>

                        <Box className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-default-500" />
                            <Typography variant="body2" color="textSecondary">
                                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                                {!job.salary_visible && <span className="text-orange-500 ml-1">(Hidden)</span>}
                            </Typography>
                        </Box>

                        <Box className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-default-500" />
                            <Typography variant="body2" color="textSecondary">
                                Posted: {formatDate(job.posting_date)}
                                {job.closing_date && ` • Closes: ${formatDate(job.closing_date)}`}
                            </Typography>
                        </Box>

                        {/* Applications Summary */}
                        <Box className="space-y-1">
                            <Box className="flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-default-500" />
                                <Typography variant="body2" color="textSecondary">
                                    Total Applications: {job.applications_count || 0}
                                </Typography>
                            </Box>
                            <Box className="flex gap-1">
                                <Chip size="sm" color="primary" variant="flat" className="h-4 text-xs">
                                    New: {job.new_applications_count || 0}
                                </Chip>
                                <Chip size="sm" color="warning" variant="flat" className="h-4 text-xs">
                                    Shortlisted: {job.shortlisted_applications_count || 0}
                                </Chip>
                                <Chip size="sm" color="success" variant="flat" className="h-4 text-xs">
                                    Hired: {job.hired_applications_count || 0}
                                </Chip>
                            </Box>
                        </Box>

                        {/* Skills and Requirements */}
                        {(job.skills_required?.length > 0 || job.requirements?.length > 0) && (
                            <Box className="space-y-1">
                                {job.skills_required?.length > 0 && (
                                    <Typography variant="caption" color="textSecondary">
                                        Skills Required: {job.skills_required.length}
                                    </Typography>
                                )}
                                {job.requirements?.length > 0 && (
                                    <Typography variant="caption" color="textSecondary">
                                        Requirements: {job.requirements.length}
                                    </Typography>
                                )}
                                {job.benefits?.length > 0 && (
                                    <Typography variant="caption" color="textSecondary">
                                        Benefits: {job.benefits.length}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Hiring Stages */}
                        {job.hiring_stages?.length > 0 && (
                            <Box className="space-y-1">
                                <Typography variant="caption" color="textSecondary">
                                    Hiring Stages: {job.hiring_stages.length}
                                </Typography>
                                <Box className="flex flex-wrap gap-1">
                                    {job.hiring_stages.slice(0, 3).map((stage) => (
                                        <Chip key={stage.id} size="sm" variant="bordered" className="h-4 text-xs">
                                            {stage.name}
                                        </Chip>
                                    ))}
                                    {job.hiring_stages.length > 3 && (
                                        <Chip size="sm" variant="bordered" className="h-4 text-xs">
                                            +{job.hiring_stages.length - 3} more
                                        </Chip>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </GlassCard>
        );
    };

    const renderCell = useCallback((job, columnKey) => {
        switch (columnKey) {
            case "title":
                return (
                    <TableCell className="whitespace-nowrap min-w-[200px]">
                        <Box className="flex items-center gap-2">
                            <BriefcaseIcon className="w-4 h-4 text-primary" />
                            <Box>
                                <Typography variant="body2" className="text-sm font-medium flex items-center gap-1">
                                    {job.title}
                                    {job.is_featured && <StarSolid className="w-3 h-3 text-yellow-500" />}
                                </Typography>
                                <Typography variant="caption" className="text-xs" color="textSecondary">
                                    {job.department?.name || 'No Department'}
                                </Typography>
                            </Box>
                        </Box>
                    </TableCell>
                );

            case "department":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <BuildingOfficeIcon className="w-3 h-3 text-default-500" />
                            <Typography variant="body2" className="text-sm">
                                {job.department?.name || 'Not assigned'}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "hiring_manager":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-default-500" />
                            <Typography variant="body2" className="text-sm">
                                {job.hiring_manager?.name || 'Not assigned'}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "type":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            {getJobTypeIcon(job.type)}
                            <Typography variant="body2" className="text-sm font-medium capitalize">
                                {job.type?.replace('_', ' ')}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "location":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3 text-default-500" />
                            <Typography variant="body2" className="text-sm">
                                {job.is_remote_allowed ? 'Remote' : job.location || 'Not specified'}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "salary":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3 h-3 text-default-500" />
                            <Typography variant="body2" className="text-sm">
                                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                            </Typography>
                            {!job.salary_visible && (
                                <Typography variant="caption" className="text-xs text-orange-500">
                                    (Hidden)
                                </Typography>
                            )}
                        </Box>
                    </TableCell>
                );

            case "positions":
                return (
                    <TableCell>
                        <Chip size="sm" variant="bordered" color="default">
                            {job.positions} position{job.positions > 1 ? 's' : ''}
                        </Chip>
                    </TableCell>
                );

            case "applications_summary":
                return (
                    <TableCell>
                        <Box className="space-y-1">
                            <Box className="flex items-center gap-1">
                                <UsersIcon className="w-3 h-3 text-default-500" />
                                <Typography variant="body2" className="text-sm font-medium">
                                    Total: {job.applications_count || 0}
                                </Typography>
                            </Box>
                            <Box className="flex gap-1 text-xs">
                                <Chip size="sm" color="primary" variant="flat" className="h-4 text-xs">
                                    New: {job.new_applications_count || 0}
                                </Chip>
                                <Chip size="sm" color="warning" variant="flat" className="h-4 text-xs">
                                    Short: {job.shortlisted_applications_count || 0}
                                </Chip>
                                <Chip size="sm" color="success" variant="flat" className="h-4 text-xs">
                                    Hired: {job.hired_applications_count || 0}
                                </Chip>
                            </Box>
                        </Box>
                    </TableCell>
                );

            case "status":
                return (
                    <TableCell>
                        {getStatusChip(job.status)}
                    </TableCell>
                );

            case "dates":
                return (
                    <TableCell>
                        <Box className="space-y-1">
                            <Box className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-3 h-3 text-default-500" />
                                <Typography variant="body2" className="text-xs">
                                    Posted: {formatDate(job.posting_date)}
                                </Typography>
                            </Box>
                            {job.closing_date && (
                                <Box className="flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3 text-red-500" />
                                    <Typography variant="body2" className="text-xs">
                                        Closes: {formatDate(job.closing_date)}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </TableCell>
                );

            case "skills_benefits":
                return (
                    <TableCell>
                        <Box className="space-y-1 max-w-[150px]">
                            {job.skills_required && job.skills_required.length > 0 && (
                                <Box>
                                    <Typography variant="caption" className="text-xs font-medium">
                                        Skills ({job.skills_required.length}):
                                    </Typography>
                                    <Box className="flex flex-wrap gap-1 mt-1">
                                        {job.skills_required.slice(0, 2).map((skill, index) => (
                                            <Chip key={index} size="sm" variant="bordered" className="h-4 text-xs">
                                                {skill.length > 10 ? skill.substring(0, 10) + '...' : skill}
                                            </Chip>
                                        ))}
                                        {job.skills_required.length > 2 && (
                                            <Chip size="sm" variant="bordered" className="h-4 text-xs">
                                                +{job.skills_required.length - 2}
                                            </Chip>
                                        )}
                                    </Box>
                                </Box>
                            )}
                            {job.benefits && job.benefits.length > 0 && (
                                <Box>
                                    <Typography variant="caption" className="text-xs font-medium">
                                        Benefits ({job.benefits.length})
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </TableCell>
                );

            case "requirements_qualifications":
                return (
                    <TableCell>
                        <Box className="space-y-1 max-w-[150px]">
                            {job.requirements && job.requirements.length > 0 && (
                                <Box>
                                    <Typography variant="caption" className="text-xs font-medium">
                                        Requirements: {job.requirements.length}
                                    </Typography>
                                </Box>
                            )}
                            {job.qualifications && job.qualifications.length > 0 && (
                                <Box>
                                    <Typography variant="caption" className="text-xs font-medium">
                                        Qualifications: {job.qualifications.length}
                                    </Typography>
                                </Box>
                            )}
                            {job.responsibilities && job.responsibilities.length > 0 && (
                                <Box>
                                    <Typography variant="caption" className="text-xs font-medium">
                                        Responsibilities: {job.responsibilities.length}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </TableCell>
                );

            case "hiring_stages":
                return (
                    <TableCell>
                        <Box className="max-w-[120px]">
                            {job.hiring_stages && job.hiring_stages.length > 0 ? (
                                <Box className="space-y-1">
                                    <Typography variant="caption" className="text-xs font-medium">
                                        {job.hiring_stages.length} Stage{job.hiring_stages.length > 1 ? 's' : ''}
                                    </Typography>
                                    <Box className="flex flex-wrap gap-1">
                                        {job.hiring_stages.slice(0, 2).map((stage, index) => (
                                            <Chip key={stage.id} size="sm" variant="bordered" className="h-4 text-xs">
                                                {stage.name.length > 8 ? stage.name.substring(0, 8) + '...' : stage.name}
                                            </Chip>
                                        ))}
                                        {job.hiring_stages.length > 2 && (
                                            <Chip size="sm" variant="bordered" className="h-4 text-xs">
                                                +{job.hiring_stages.length - 2}
                                            </Chip>
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="caption" className="text-xs" color="textSecondary">
                                    No stages
                                </Typography>
                            )}
                        </Box>
                    </TableCell>
                );

            case "actions":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            {onView && (
                                <Tooltip content="View Details">
                                    <IconButton
                                        size="small"
                                        onClick={() => onView(job)}
                                        sx={{
                                            background: alpha(theme.palette.info.main, 0.1),
                                            '&:hover': {
                                                background: alpha(theme.palette.info.main, 0.2)
                                            }
                                        }}
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {canEdit && onEdit && (
                                <Tooltip content="Edit Job">
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(job)}
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
                            {onApplications && (
                                <Tooltip content={`View Applications (${job.applications_count || 0})`}>
                                    <IconButton
                                        size="small"
                                        onClick={() => onApplications(job)}
                                        sx={{
                                            background: alpha(theme.palette.success.main, 0.1),
                                            '&:hover': {
                                                background: alpha(theme.palette.success.main, 0.2)
                                            }
                                        }}
                                    >
                                        <UsersIcon className="w-4 h-4" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {canDelete && onDelete && (
                                <Tooltip content="Delete Job" color="danger">
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(job)}
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
                return <TableCell>{job[columnKey]}</TableCell>;
        }
    }, [theme, onView, onEdit, onDelete, onApplications, canEdit, canDelete]);

    const columns = [
        { name: "Job Title", uid: "title", icon: BriefcaseIcon },
        { name: "Department", uid: "department", icon: BuildingOfficeIcon },
        { name: "Hiring Manager", uid: "hiring_manager", icon: UserIcon },
        { name: "Type", uid: "type", icon: ClockIcon },
        { name: "Location", uid: "location", icon: MapPinIcon },
        { name: "Salary", uid: "salary", icon: CurrencyDollarIcon },
        { name: "Positions", uid: "positions", icon: ChartBarIcon },
        { name: "Applications", uid: "applications_summary", icon: UsersIcon },
        { name: "Status", uid: "status", icon: ClockIcon },
        { name: "Dates", uid: "dates", icon: CalendarDaysIcon },
        { name: "Skills & Benefits", uid: "skills_benefits", icon: StarIcon },
        { name: "Requirements", uid: "requirements_qualifications", icon: DocumentTextIcon },
        { name: "Hiring Stages", uid: "hiring_stages", icon: ChartBarIcon },
        { name: "Actions", uid: "actions" }
    ];

    if (isMobile) {
        return (
            <Box className="space-y-4">
                <ScrollShadow className="max-h-[70vh]">
                    {data.map((job) => (
                        <MobileJobCard key={job.id} job={job} />
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
            <ScrollShadow className="max-h-[70vh] w-full overflow-x-auto">
                <Table
                    isStriped
                    selectionMode="none"
                    isCompact
                    isHeaderSticky
                    removeWrapper
                    aria-label="Job Postings Management Table"
                    classNames={{
                        wrapper: "min-h-[200px] min-w-[1400px]",
                        table: "min-h-[300px] min-w-[1400px]",
                        thead: "[&>tr]:first:shadow-small bg-default-100/80",
                        tbody: "divide-y divide-default-200/50",
                        tr: "group hover:bg-default-50/50 transition-colors h-14",
                        td: "py-2 px-2 text-sm align-top",
                        th: "py-2 px-2 text-xs font-semibold"
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn 
                                key={column.uid} 
                                align={column.uid === "actions" ? "center" : "start"}
                                className="bg-default-100/80 backdrop-blur-md"
                                width={
                                    column.uid === "title" ? 200 :
                                    column.uid === "applications_summary" ? 180 :
                                    column.uid === "skills_benefits" ? 150 :
                                    column.uid === "requirements_qualifications" ? 150 :
                                    column.uid === "hiring_stages" ? 120 :
                                    column.uid === "dates" ? 160 :
                                    column.uid === "actions" ? 150 :
                                    120
                                }
                            >
                                <Box className="flex items-center gap-1">
                                    {column.icon && <column.icon className="w-3 h-3" />}
                                    <span className="text-xs font-semibold">{column.name}</span>
                                </Box>
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody 
                        items={data}
                        emptyContent={
                            <Box className="flex flex-col items-center justify-center py-8 text-center">
                                <BriefcaseIcon className="w-12 h-12 text-default-300 mb-4" />
                                <Typography variant="h6" color="textSecondary">
                                    No job postings found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    No job postings found for the selected criteria.
                                </Typography>
                            </Box>
                        }
                    >
                        {(job) => (
                            <TableRow key={job.id}>
                                {(columnKey) => renderCell(job, columnKey)}
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

JobPostingsTable.displayName = 'JobPostingsTable';

export default JobPostingsTable;
