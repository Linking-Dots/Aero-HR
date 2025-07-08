import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Tooltip,
    Avatar,
    LinearProgress,
    Stack,
    Divider,
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    MoreVert as MoreVertIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as MoneyIcon,
    BusinessCenter as BusinessIcon,
    Public as PublicIcon,
    Lock as LockIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const JobPostingsTable = ({ 
    data = [], 
    loading = false, 
    permissions = [], 
    onView, 
    onEdit, 
    onDelete, 
    onApplications 
}) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedJob, setSelectedJob] = React.useState(null);

    const handleMenuOpen = (event, job) => {
        setAnchorEl(event.currentTarget);
        setSelectedJob(job);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedJob(null);
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            draft: {
                color: 'default',
                label: 'Draft',
                icon: <EditIcon sx={{ fontSize: 14 }} />
            },
            pending: {
                color: 'warning',
                label: 'Pending Approval',
                icon: <CalendarIcon sx={{ fontSize: 14 }} />
            },
            published: {
                color: 'success',
                label: 'Published',
                icon: <PublicIcon sx={{ fontSize: 14 }} />
            },
            closed: {
                color: 'error',
                label: 'Closed',
                icon: <LockIcon sx={{ fontSize: 14 }} />
            },
            on_hold: {
                color: 'secondary',
                label: 'On Hold',
                icon: <CalendarIcon sx={{ fontSize: 14 }} />
            }
        };

        const config = statusConfig[status] || statusConfig.draft;
        
        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                icon={config.icon}
                variant="outlined"
                sx={{ 
                    fontWeight: 500,
                    '& .MuiChip-icon': {
                        fontSize: 14
                    }
                }}
            />
        );
    };

    const getJobTypeChip = (jobType) => {
        const typeConfig = {
            full_time: { color: 'primary', label: 'Full Time' },
            part_time: { color: 'secondary', label: 'Part Time' },
            contract: { color: 'info', label: 'Contract' },
            temporary: { color: 'warning', label: 'Temporary' },
            internship: { color: 'success', label: 'Internship' }
        };

        const config = typeConfig[jobType] || { color: 'default', label: jobType };
        
        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                variant="filled"
                sx={{ 
                    fontWeight: 500,
                    fontSize: '0.75rem'
                }}
            />
        );
    };

    const formatSalary = (min, max, currency = 'USD') => {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
            JPY: '¥',
            CAD: 'C$',
            AUD: 'A$'
        };
        
        const symbol = symbols[currency] || '$';
        
        if (min && max) {
            return `${symbol}${parseInt(min).toLocaleString()} - ${symbol}${parseInt(max).toLocaleString()}`;
        } else if (min) {
            return `${symbol}${parseInt(min).toLocaleString()}+`;
        } else if (max) {
            return `Up to ${symbol}${parseInt(max).toLocaleString()}`;
        }
        
        return 'Competitive';
    };

    const canView = permissions.includes('jobs.view');
    const canEdit = permissions.includes('jobs.update');
    const canDelete = permissions.includes('jobs.delete');

    if (loading) {
        return (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        Loading job postings...
                    </Typography>
                </Box>
            </Paper>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No job postings found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Create your first job posting to start recruiting talent.
                    </Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="job-postings-table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Job Details
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Department & Type
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Location & Remote
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Salary Range
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Status & Dates
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Hiring Manager
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Positions
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((job) => (
                            <TableRow
                                key={job.id}
                                hover
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover
                                    }
                                }}
                            >
                                {/* Job Details */}
                                <TableCell component="th" scope="row">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: theme.palette.primary.main,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {job.title?.charAt(0) || 'J'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {job.title || 'Untitled Job'}
                                                {job.is_featured && (
                                                    <StarIcon sx={{ fontSize: 16, color: 'gold', ml: 0.5 }} />
                                                )}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {job.designation?.name || 'No designation'}
                                            </Typography>
                                            <br />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                {job.is_internal && (
                                                    <Chip
                                                        label="Internal"
                                                        size="small"
                                                        color="info"
                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                    />
                                                )}
                                                {job.is_featured && (
                                                    <Chip
                                                        label="Featured"
                                                        size="small"
                                                        color="warning"
                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Department & Type */}
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                            {job.department?.name || 'No department'}
                                        </Typography>
                                        {getJobTypeChip(job.job_type)}
                                    </Box>
                                </TableCell>

                                {/* Location & Remote */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {job.is_remote ? 'Remote' : (job.location || 'Not specified')}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Salary Range */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Status & Dates */}
                                <TableCell>
                                    <Box>
                                        {getStatusChip(job.status)}
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                            Posted: {dayjs(job.posted_date).format('MMM D, YYYY')}
                                        </Typography>
                                        {job.closing_date && (
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                Closes: {dayjs(job.closing_date).format('MMM D, YYYY')}
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>

                                {/* Hiring Manager */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {job.hiring_manager?.name || 'Not assigned'}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Positions */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {job.positions_count || 1}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Actions */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {canView && (
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onView && onView(job)}
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <ViewIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        
                                        {canEdit && (
                                            <Tooltip title="Edit Job">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit && onEdit(job)}
                                                    sx={{ color: 'warning.main' }}
                                                >
                                                    <EditIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        <Tooltip title="More Options">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, job)}
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                <MoreVertIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {canView && (
                    <MenuItem onClick={() => { onView && onView(selectedJob); handleMenuClose(); }}>
                        <ViewIcon sx={{ fontSize: 16, mr: 1 }} />
                        View Details
                    </MenuItem>
                )}
                
                {canEdit && (
                    <MenuItem onClick={() => { onEdit && onEdit(selectedJob); handleMenuClose(); }}>
                        <EditIcon sx={{ fontSize: 16, mr: 1 }} />
                        Edit Job
                    </MenuItem>
                )}
                
                <MenuItem onClick={() => { onApplications && onApplications(selectedJob); handleMenuClose(); }}>
                    <PersonIcon sx={{ fontSize: 16, mr: 1 }} />
                    View Applications
                </MenuItem>
                
                <Divider />
                
                {canDelete && (
                    <MenuItem 
                        onClick={() => { onDelete && onDelete(selectedJob); handleMenuClose(); }}
                        sx={{ color: 'error.main' }}
                    >
                        <DeleteIcon sx={{ fontSize: 16, mr: 1 }} />
                        Delete Job
                    </MenuItem>
                )}
            </Menu>
        </Paper>
    );
};

export default JobPostingsTable;
