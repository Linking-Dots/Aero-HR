import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, Link, usePage } from "@inertiajs/react";
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Chip,
    Divider,
    CardHeader as MuiCardHeader,
    CardContent as MuiCardContent,
    Grow,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    BriefcaseIcon,
    CalendarIcon,
    CheckCircleIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    ArrowDownOnSquareIcon,
    UserIcon,
    UsersIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ClipboardDocumentListIcon,
    DocumentDuplicateIcon,
    ChevronRightIcon,
    AcademicCapIcon,
    GiftIcon,
    ChartBarIcon,
    ClockIcon,
    EyeIcon,
    UserGroupIcon,
    TrophyIcon,
    ExclamationTriangleIcon,
    PresentationChartLineIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { Refresh, FileDownload, Share, Edit as EditIcon } from '@mui/icons-material';
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { Button } from "@heroui/react";
import DeleteJobForm from '@/Forms/DeleteJobForm.jsx';
import AddEditJobForm from '@/Forms/AddEditJobForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from 'dayjs';

const JobPostingDetail = ({ auth, job: initialJob, title, applicationStats, jobMetrics, hiringStages, applicationsByStage, recentApplications, departments, managers, jobTypes, statuses }) => {
    const { props } = usePage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const [job, setJob] = useState(initialJob);
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editMode, setEditMode] = useState('all'); // 'all', 'info', 'details'
    // Variables for dropdown data
    const [departmentsData, setDepartmentsData] = useState(departments || []);
    const [managersData, setManagersData] = useState(managers || []);
    const [jobTypesData, setJobTypesData] = useState(jobTypes || []);
    const [statusesData, setStatusesData] = useState(statuses || []);
    const [applications, setApplications] = useState(recentApplications || []);
    const [stats, setStats] = useState(applicationStats || {});
    const [metrics, setMetrics] = useState(jobMetrics || {});
    
    // Fetch the most up-to-date job data with all statistics
    // This should only be called after user actions or explicit refresh requests, not on initial page load
    const fetchJobData = useCallback(async () => {
        if (!job?.id) return;
        
        setLoading(true);
        try {
            // Use the dedicated data endpoint for AJAX refreshes
            const response = await axios.get(route('hr.recruitment.data.show', job.id));
            const data = response.data;
            
            setJob(data.job);
            setStats(data.applicationStats || {});
            setMetrics(data.jobMetrics || {});
            setApplications(data.recentApplications || []);
            
            // Update dropdown data if provided
            if (data.departments) setDepartmentsData(data.departments);
            if (data.managers) setManagersData(data.managers);
            if (data.jobTypes) setJobTypesData(data.jobTypes);
            if (data.statuses) setStatusesData(data.statuses);
        } catch (error) {
            console.error('Error fetching job data:', error);
            toast.error('Failed to load job details');
        } finally {
            setLoading(false);
        }
    }, [job?.id]);
    
    // Don't fetch data on initial load - use the data provided by Inertia
    // Only fetchJobData when user explicitly requests refresh or after actions
    
    const handlePublish = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.recruitment.publish', job.id));
            toast.success(response.data.message || 'Job posting published successfully');
            fetchJobData();
        } catch (error) {
            console.error('Error publishing job:', error);
            toast.error('Failed to publish job posting');
        } finally {
            setLoading(false);
        }
    };
    
    const handleUnpublish = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.recruitment.unpublish', job.id));
            toast.success(response.data.message || 'Job posting unpublished successfully');
            fetchJobData();
        } catch (error) {
            console.error('Error unpublishing job:', error);
            toast.error('Failed to unpublish job posting');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCloseJob = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.recruitment.close', job.id));
            toast.success(response.data.message || 'Job posting closed successfully');
            fetchJobData();
        } catch (error) {
            console.error('Error closing job:', error);
            toast.error('Failed to close job posting');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePrint = () => {
        window.print();
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.title,
                text: `Check out this job opportunity: ${job?.title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        }
    };
    
    // Format status for display
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return { color: 'default', variant: 'outlined' };
            case 'pending': return { color: 'warning', variant: 'filled' };
            case 'published': return { color: 'success', variant: 'filled' };
            case 'closed': return { color: 'error', variant: 'filled' };
            case 'on_hold': return { color: 'secondary', variant: 'filled' };
            default: return { color: 'default', variant: 'outlined' };
        }
    };
    
    const formatStatus = (status) => {
        if (!status) return 'Unknown';
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const formatJobType = (jobType) => {
        if (!jobType) return 'Not specified';
        return jobType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    // Prepare stats data for StatsCards component
    const jobStatsData = [
        {
            title: "Total Applications",
            value: stats.total || 0,
            icon: <UserGroupIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "All applications received"
        },
        {
            title: "New Applications",
            value: stats.new || 0,
            icon: <ExclamationTriangleIcon />,
            color: "text-amber-400",
            iconBg: "bg-amber-500/20",
            description: "Awaiting review"
        },
        {
            title: "In Review",
            value: stats.in_review || 0,
            icon: <EyeIcon />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20",
            description: "Currently being reviewed"
        },
        {
            title: "Interviewed",
            value: stats.interviewed || 0,
            icon: <UsersIcon />,
            color: "text-indigo-400",
            iconBg: "bg-indigo-500/20",
            description: "Completed interviews"
        },
        {
            title: "Hired",
            value: stats.hired || 0,
            icon: <TrophyIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "Successfully hired"
        },
        {
            title: "Days Active",
            value: metrics.days_active || 0,
            icon: <CalendarIcon />,
            color: "text-emerald-400",
            iconBg: "bg-emerald-500/20",
            description: "Since posting date"
        },
        {
            title: "Applications/Day",
            value: metrics.applications_per_day || 0,
            icon: <ChartBarIcon />,
            color: "text-cyan-400",
            iconBg: "bg-cyan-500/20",
            description: "Average daily applications"
        },
        {
            title: "Hire Rate",
            value: `${metrics.hire_rate || 0}%`,
            icon: <CheckCircleIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "Success rate"
        }
    ];
    
    // If no job or still loading initial data
    if (!job && !loading) {
        return (
            <App>
                <Head title="Job Not Found" />
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Job Posting Not Found
                    </Typography>
                    <Button
                        variant="primary"
                        onClick={() => router.visit(route('hr.recruitment.index'))}
                        startIcon={<ArrowLeftIcon className="w-4 h-4" />}
                        sx={{ mt: 2 }}
                    >
                        Back to Jobs List
                    </Button>
                </Box>
            </App>
        );
    }
    
    return (
        <>
            <Head title={title || `Job Posting - ${job?.title || 'Loading...'}`} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Job Posting Details"
                            subtitle={job?.title || 'Loading...'}
                            icon={<BriefcaseIcon className="w-8 h-8" />}
                            variant="default"
                        >
                            <div className="p-6">
                                {/* Job Header Section */}
                                <div className="mb-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                                                    {job?.title}
                                                </Typography>
                                                <Chip 
                                                    label={formatStatus(job?.status)} 
                                                    {...getStatusColor(job?.status)}
                                                    size="small"
                                                />
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <Chip 
                                                    icon={<BuildingOfficeIcon className="w-4 h-4" />}
                                                    label={job?.department?.name || 'No Department'} 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                                <Chip 
                                                    icon={<MapPinIcon className="w-4 h-4" />}
                                                    label={job?.is_remote_allowed ? 'Remote' : job?.location || 'Not specified'} 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                                <Chip 
                                                    icon={<UserIcon className="w-4 h-4" />}
                                                    label={formatJobType(job?.type)} 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                                {job?.is_featured && (
                                                    <Chip 
                                                        label="Featured" 
                                                        color="warning"
                                                        variant="filled"
                                                        size="small"
                                                    />
                                                )}
                                            </div>
                                            
                                            <Typography variant="body2" color="text.secondary">
                                                Posted: {job?.posting_date ? dayjs(job.posting_date).format('MMM D, YYYY') : 'Not posted yet'}
                                                {job?.closing_date && ` • Closes: ${dayjs(job.closing_date).format('MMM D, YYYY')}`}
                                            </Typography>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {/* Explicit refresh button - calls AJAX endpoint to get fresh data */}
                                            <Tooltip title="Refresh Data">
                                                <IconButton 
                                                    onClick={fetchJobData}
                                                    disabled={loading}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                                                >
                                                    <Refresh />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Share Job">
                                                <IconButton 
                                                    onClick={handleShare}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                                                >
                                                    <Share />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Print/Export">
                                                <IconButton 
                                                    onClick={handlePrint}
                                                    size="small"
                                                    sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                                                >
                                                    <FileDownload />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            {auth.permissions.includes('jobs.update') && (
                                                <Button
                                                    variant="bordered"
                                                    size="sm"
                                                    startContent={<PencilIcon className="w-4 h-4" />}
                                                    onClick={() => {
                                                        setEditMode('all');
                                                        setOpenEditModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            
                                            <Button
                                                variant="bordered"
                                                size="sm"
                                                startContent={<ArrowLeftIcon className="w-4 h-4" />}
                                                onClick={() => router.visit(route('hr.recruitment.index'))}
                                            >
                                                Back to List
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Statistics Cards */}
                                <StatsCards stats={jobStatsData} className="mb-6" />
                                
                                {/* Job Actions */}
                                {(job?.status === 'draft' || job?.status === 'published') && (
                                    <div className="mb-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                                        <Typography variant="h6" className="mb-3">Quick Actions</Typography>
                                        <div className="flex flex-wrap gap-3">
                                            {job?.status === 'draft' && auth.permissions.includes('jobs.publish') && (
                                                <Button 
                                                    variant="solid"
                                                    color="success" 
                                                    onClick={handlePublish}
                                                    isLoading={loading}
                                                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                >
                                                    Publish Job
                                                </Button>
                                            )}
                                            
                                            {job?.status === 'published' && auth.permissions.includes('jobs.unpublish') && (
                                                <>
                                                    <Button 
                                                        variant="bordered" 
                                                        onClick={handleUnpublish}
                                                        isLoading={loading}
                                                        startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
                                                    >
                                                        Unpublish
                                                    </Button>
                                                    
                                                    <Button 
                                                        variant="solid"
                                                        color="danger" 
                                                        onClick={handleCloseJob}
                                                        isLoading={loading}
                                                        startContent={<ClockIcon className="w-4 h-4" />}
                                                    >
                                                        Close Position
                                                    </Button>
                                                </>
                                            )}
                                            
                                            <Button 
                                                variant="bordered"
                                                color="primary"
                                                as={Link}
                                                href={route('hr.recruitment.applications.create', job.id)}
                                                startContent={<UserIcon className="w-4 h-4" />}
                                            >
                                                Add Application
                                            </Button>
                                            
                                            <Button 
                                                variant="bordered"
                                                onClick={() => router.visit(route('hr.recruitment.applications.index', job.id))}
                                                startContent={<UserGroupIcon className="w-4 h-4" />}
                                            >
                                                View All Applications
                                            </Button>
                                            
                                            {auth.permissions.includes('jobs.delete') && (
                                                <Button 
                                                    variant="solid"
                                                    color="danger"
                                                    onClick={() => setOpenDeleteModal(true)}
                                                    startContent={<TrashIcon className="w-4 h-4" />}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Main Content Grid */}
                                <Grid container spacing={3}>
                                    {/* Job Details */}
                                    <Grid item xs={12} lg={8}>
                                        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                                            <MuiCardHeader
                                                title={
                                                    <Box className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
                                                            <Typography variant="h6" component="h2">
                                                                Job Information
                                                            </Typography>
                                                        </div>
                                                        {auth.permissions.includes('jobs.edit') && (
                                                            <IconButton 
                                                                size="small" 
                                                                color="primary"
                                                                onClick={() => {
                                                                    setEditMode('info');
                                                                    setOpenEditModal(true);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                }
                                                sx={{ padding: '24px' }}
                                            />
                                            <Divider />
                                            <MuiCardContent>
                                                {/* Job Description */}
                                                <div className="mb-6">
                                                    <Typography variant="subtitle1" className="mb-2 font-semibold">
                                                        Description
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                                        {job?.description || 'No description provided.'}
                                                    </Typography>
                                                </div>
                                                
                                                {/* Job Requirements */}
                                                {job?.requirements && job.requirements.length > 0 && (
                                                    <div className="mb-6">
                                                        <Typography variant="subtitle1" className="mb-3 font-semibold flex items-center gap-2">
                                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                                            Requirements
                                                        </Typography>
                                                        <List dense>
                                                            {job.requirements.map((item, index) => (
                                                                <ListItem key={index} disableGutters>
                                                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                                                        <ChevronRightIcon className="w-4 h-4 text-primary" />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={item} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </div>
                                                )}
                                                
                                                {/* Job Responsibilities */}
                                                {job?.responsibilities && job.responsibilities.length > 0 && (
                                                    <div className="mb-6">
                                                        <Typography variant="subtitle1" className="mb-3 font-semibold flex items-center gap-2">
                                                            <ClipboardDocumentListIcon className="w-5 h-5" />
                                                            Responsibilities
                                                        </Typography>
                                                        <List dense>
                                                            {job.responsibilities.map((item, index) => (
                                                                <ListItem key={index} disableGutters>
                                                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                                                        <ChevronRightIcon className="w-4 h-4 text-primary" />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={item} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </div>
                                                )}
                                                
                                                {/* Qualifications */}
                                                {job?.qualifications && job.qualifications.length > 0 && (
                                                    <div className="mb-6">
                                                        <Typography variant="subtitle1" className="mb-3 font-semibold flex items-center gap-2">
                                                            <AcademicCapIcon className="w-5 h-5" />
                                                            Qualifications
                                                        </Typography>
                                                        <List dense>
                                                            {job.qualifications.map((item, index) => (
                                                                <ListItem key={index} disableGutters>
                                                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                                                        <ChevronRightIcon className="w-4 h-4 text-primary" />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={item} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </div>
                                                )}
                                                
                                                {/* Benefits */}
                                                {job?.benefits && job.benefits.length > 0 && (
                                                    <div className="mb-6">
                                                        <Typography variant="subtitle1" className="mb-3 font-semibold flex items-center gap-2">
                                                            <GiftIcon className="w-5 h-5" />
                                                            Benefits
                                                        </Typography>
                                                        <List dense>
                                                            {job.benefits.map((item, index) => (
                                                                <ListItem key={index} disableGutters>
                                                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                                                        <ChevronRightIcon className="w-4 h-4 text-primary" />
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={item} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </div>
                                                )}
                                            </MuiCardContent>
                                        </div>
                                    </Grid>
                                    
                                    {/* Sidebar */}
                                    <Grid item xs={12} lg={4}>
                                        <Stack spacing={3}>
                                            {/* Job Details */}
                                            <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                                                <Typography variant="h6" className="mb-4 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Cog6ToothIcon className="w-5 h-5" />
                                                        Job Details
                                                    </div>
                                                    {auth.permissions.includes('jobs.edit') && (
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary"
                                                            onClick={() => {
                                                                setEditMode('details');
                                                                setOpenEditModal(true);
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Typography>
                                                
                                                <List dense disablePadding>
                                                    <ListItem disableGutters disablePadding>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <UsersIcon className="w-5 h-5 text-gray-400" />
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary="Positions" 
                                                            secondary={job?.positions || '1'} 
                                                        />
                                                    </ListItem>
                                                    
                                                    <ListItem disableGutters disablePadding>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary="Salary Range" 
                                                            secondary={
                                                                job?.salary_min && job?.salary_max
                                                                    ? `${job.salary_currency || '$'} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                                                                    : 'Not specified'
                                                            } 
                                                        />
                                                    </ListItem>
                                                    
                                                    <ListItem disableGutters disablePadding>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary="Closing Date" 
                                                            secondary={
                                                                job?.closing_date
                                                                    ? dayjs(job.closing_date).format('MMM D, YYYY')
                                                                    : 'Open until filled'
                                                            } 
                                                        />
                                                    </ListItem>
                                                    
                                                    <ListItem disableGutters disablePadding>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <UserIcon className="w-5 h-5 text-gray-400" />
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary="Hiring Manager" 
                                                            secondary={job?.hiring_manager?.name || 'Not assigned'} 
                                                        />
                                                    </ListItem>
                                                </List>
                                            </div>
                                            
                                            {/* Recent Applications */}
                                            <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <Typography variant="h6" className="flex items-center gap-2">
                                                        <UserGroupIcon className="w-5 h-5" />
                                                        Recent Applications
                                                    </Typography>
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={() => router.visit(route('hr.recruitment.applications.index', job.id))}
                                                    >
                                                        View All
                                                    </Button>
                                                </div>
                                                
                                                {applications && applications.length > 0 ? (
                                                    <List dense>
                                                        {applications.map((application) => (
                                                            <ListItem 
                                                                key={application.id} 
                                                                sx={{ 
                                                                    mb: 1, 
                                                                    borderRadius: 1, 
                                                                    ':hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                                                                    cursor: 'pointer',
                                                                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                                                                }}
                                                                onClick={() => router.visit(route('hr.recruitment.applications.show', [job.id, application.id]))}
                                                            >
                                                                <ListItemIcon>
                                                                    <Avatar 
                                                                        src={application.applicant?.profile_photo_url} 
                                                                        alt={application.applicant?.name}
                                                                        sx={{ width: 32, height: 32 }}
                                                                    >
                                                                        {application.applicant?.name?.charAt(0)}
                                                                    </Avatar>
                                                                </ListItemIcon>
                                                                <ListItemText 
                                                                    primary={
                                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                            {application.applicant?.name}
                                                                        </Typography>
                                                                    }
                                                                    secondary={
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {dayjs(application.created_at).format('MMM D, YYYY')}
                                                                        </Typography>
                                                                    }
                                                                />
                                                                <Chip 
                                                                    label={application.status} 
                                                                    size="small"
                                                                    color={
                                                                        application.status === 'new' ? 'primary' :
                                                                        application.status === 'shortlisted' ? 'success' :
                                                                        application.status === 'interviewed' ? 'info' :
                                                                        application.status === 'hired' ? 'success' :
                                                                        application.status === 'rejected' ? 'error' :
                                                                        'default'
                                                                    }
                                                                    variant="outlined"
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : (
                                                    <Box sx={{ textAlign: 'center', py: 3, opacity: 0.7 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            No applications yet
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </div>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
            
            {/* Delete Modal */}
            <DeleteJobForm
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                job={job}
                fetchData={() => {
                    router.visit(route('hr.recruitment.index'));
                }}
                currentPage={1}
                perPage={30}
                filterData={{}}
            />
            
            {/* Edit Job Modal */}
            <AddEditJobForm
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                job={job}
                departments={departmentsData || []}
                managers={managersData || []}
                jobTypes={jobTypesData || []}
                statuses={statusesData || []}
                addJobOptimized={() => {}}
                updateJobOptimized={(updatedJob) => {
                    setJob(updatedJob);
                }}
                fetchJobStats={fetchJobData}
                onSuccess={() => {
                    setOpenEditModal(false);
                    fetchJobData();
                    toast.success('Job updated successfully');
                }}
            />
        </>
    );
};

JobPostingDetail.layout = (page) => <App>{page}</App>;

export default JobPostingDetail;
