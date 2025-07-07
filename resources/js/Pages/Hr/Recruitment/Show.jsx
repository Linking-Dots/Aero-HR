import React, { useState, useEffect } from 'react';
import { Head } from "@inertiajs/react";
import { Box, Grid, Typography, useTheme, useMediaQuery, Divider, Paper, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
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
    GiftIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import { Button } from "@heroui/react";
import DeleteJobForm from '@/Forms/DeleteJobForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import { Link } from '@inertiajs/react';

const JobPostingDetail = ({ auth, job: initialJob, title }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [job, setJob] = useState(initialJob);
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [applications, setApplications] = useState([]);
    
    // Fetch the most up-to-date job data
    const fetchJobData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.recruitment.show', job.id));
            setJob(response.data);
        } catch (error) {
            console.error('Error fetching job data:', error);
            toast.error('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch recent applications
    const fetchApplications = async () => {
        try {
            const response = await axios.get(route('hr.recruitment.applications.list', job.id), {
                params: { limit: 5 }
            });
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };
    
    useEffect(() => {
        if (initialJob?.id) {
            fetchJobData();
            fetchApplications();
        }
    }, [initialJob?.id]);
    
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
    
    const actionButtons = [
        {
            label: "Back to List",
            icon: <ArrowLeftIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.recruitment.index'),
            permission: 'jobs.view'
        },
        {
            label: "Edit Job",
            icon: <PencilIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.recruitment.edit', job.id),
            permission: 'jobs.edit'
        },
        {
            label: "Print / Export",
            icon: <ArrowDownOnSquareIcon className="w-4 h-4" />,
            onPress: handlePrint,
            permission: 'jobs.view'
        },
        {
            label: "Delete",
            icon: <TrashIcon className="w-4 h-4" />,
            onPress: () => setOpenDeleteModal(true),
            variant: "danger",
            permission: 'jobs.delete'
        }
    ].filter(button => !button.permission || auth.permissions.includes(button.permission));
    
    // Format status for display
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return { bg: 'bg-gray-100', text: 'text-gray-800' };
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            case 'published': return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'closed': return { bg: 'bg-red-100', text: 'text-red-800' };
            case 'on_hold': return { bg: 'bg-purple-100', text: 'text-purple-800' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };
    
    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const formatJobType = (jobType) => {
        return jobType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
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
                        onClick={() => window.location.href = route('hr.recruitment.index')}
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
        <App>
            <Head title={title || `Job Posting - ${job?.title || 'Loading...'}`} />
            <PageHeader
                title="Job Posting Details"
                subtitle={job?.title || 'Loading...'}
                actionButtons={actionButtons}
                icon={<BriefcaseIcon className="w-8 h-8" />}
            />
            
            <Box sx={{ mt: 3 }}>
                <GlassCard>
                    {/* Header */}
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" gutterBottom>{job?.title}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Chip 
                                    icon={<BuildingOfficeIcon className="w-4 h-4" />}
                                    label={job?.department?.name} 
                                    size="small"
                                />
                                <Chip 
                                    icon={<UserIcon className="w-4 h-4" />}
                                    label={job?.designation?.name} 
                                    size="small"
                                />
                                <Chip 
                                    icon={<MapPinIcon className="w-4 h-4" />}
                                    label={job?.is_remote ? 'Remote' : job?.location} 
                                    size="small"
                                />
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 2, sm: 0 } }}>
                            <Chip 
                                label={formatStatus(job?.status)} 
                                className={`${getStatusColor(job?.status).bg} ${getStatusColor(job?.status).text}`}
                                sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Posted on: {job?.posted_date ? dayjs(job.posted_date).format('MMM D, YYYY') : 'Not posted yet'}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Divider />
                    
                    {/* Job Information */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Job Description</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                        {job?.description || 'No description provided.'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Job Details</Typography>
                                    
                                    <List dense disablePadding>
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Job Type" 
                                                secondary={formatJobType(job?.job_type) || 'N/A'} 
                                            />
                                        </ListItem>
                                        
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <UsersIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Positions" 
                                                secondary={job?.positions_count || '1'} 
                                            />
                                        </ListItem>
                                        
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Salary Range" 
                                                secondary={
                                                    job?.salary_min && job?.salary_max
                                                        ? `${job.salary_currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                                                        : 'Not specified'
                                                } 
                                            />
                                        </ListItem>
                                        
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <CalendarIcon className="w-5 h-5 text-gray-500" />
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
                                                <UserIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Hiring Manager" 
                                                secondary={job?.hiring_manager?.name || 'Not assigned'} 
                                            />
                                        </ListItem>
                                    </List>
                                    
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        {job?.is_internal && (
                                            <Chip 
                                                label="Internal Only" 
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                        {job?.is_featured && (
                                            <Chip 
                                                label="Featured" 
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                            />
                                        )}
                                        {job?.is_remote && (
                                            <Chip 
                                                label="Remote" 
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Divider />
                    
                    {/* Job Requirements, Responsibilities, etc. */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <ClipboardDocumentListIcon className="w-5 h-5 inline-block mr-1" />
                                        Responsibilities
                                    </Typography>
                                    {job?.responsibilities && job.responsibilities.length > 0 ? (
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
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No specific responsibilities listed.
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <DocumentDuplicateIcon className="w-5 h-5 inline-block mr-1" />
                                        Requirements
                                    </Typography>
                                    {job?.requirements && job.requirements.length > 0 ? (
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
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No specific requirements listed.
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <AcademicCapIcon className="w-5 h-5 inline-block mr-1" />
                                        Qualifications
                                    </Typography>
                                    {job?.qualifications && job.qualifications.length > 0 ? (
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
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No specific qualifications listed.
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <GiftIcon className="w-5 h-5 inline-block mr-1" />
                                        Benefits
                                    </Typography>
                                    {job?.benefits && job.benefits.length > 0 ? (
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
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No specific benefits listed.
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Divider />
                    
                    {/* Applications and Actions */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <Paper elevation={0} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1">Recent Applications</Typography>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => window.location.href = route('hr.recruitment.applications.index', job.id)}
                                        >
                                            View All
                                        </Button>
                                    </Box>
                                    
                                    {applications.length > 0 ? (
                                        <List dense>
                                            {applications.map((application) => (
                                                <ListItem 
                                                    key={application.id} 
                                                    sx={{ 
                                                        mb: 1, 
                                                        borderRadius: 1, 
                                                        ':hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => window.location.href = route('hr.recruitment.applications.show', application.id)}
                                                >
                                                    <ListItemIcon>
                                                        <Avatar src={application.candidate?.profile_photo_url} alt={application.candidate?.name}>
                                                            {application.candidate?.name?.charAt(0)}
                                                        </Avatar>
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={application.candidate?.name} 
                                                        secondary={`Applied on ${dayjs(application.applied_date).format('MMM D, YYYY')}`} 
                                                    />
                                                    <Chip 
                                                        label={application.status} 
                                                        size="small"
                                                        color={
                                                            application.status === 'new' ? 'primary' :
                                                            application.status === 'shortlisted' ? 'success' :
                                                            application.status === 'interviewing' ? 'info' :
                                                            application.status === 'rejected' ? 'error' :
                                                            'default'
                                                        }
                                                        variant="outlined"
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography color="text.secondary">No applications yet</Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={5}>
                                <Paper elevation={0} sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>Job Actions</Typography>
                                    
                                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {job?.status === 'draft' && auth.permissions.includes('jobs.publish') && (
                                            <Button 
                                                variant="primary" 
                                                onClick={handlePublish}
                                                loading={loading}
                                                fullWidth
                                            >
                                                Publish Job Posting
                                            </Button>
                                        )}
                                        
                                        {job?.status === 'published' && auth.permissions.includes('jobs.unpublish') && (
                                            <>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={handleUnpublish}
                                                    loading={loading}
                                                    fullWidth
                                                >
                                                    Unpublish Job Posting
                                                </Button>
                                                
                                                <Button 
                                                    variant="danger" 
                                                    onClick={handleCloseJob}
                                                    loading={loading}
                                                    fullWidth
                                                >
                                                    Close Job Posting
                                                </Button>
                                            </>
                                        )}
                                        
                                        <Link href={route('hr.recruitment.applications.create', job.id)}>
                                            <Button 
                                                variant="secondary"
                                                fullWidth
                                            >
                                                Add Application Manually
                                            </Button>
                                        </Link>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </GlassCard>
            </Box>
            
            {/* Delete Modal */}
            <DeleteJobForm
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                job={job}
                fetchData={() => {
                    // Redirect to list after deletion
                    window.location.href = route('hr.recruitment.index');
                }}
                currentPage={1}
                perPage={30}
                filterData={{}}
            />
        </App>
    );
};

export default JobPostingDetail;
