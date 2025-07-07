import React, { useState, useEffect } from 'react';
import { Head } from "@inertiajs/react";
import { Box, Grid, Typography, useTheme, useMediaQuery, Divider, Paper, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText, LinearProgress } from '@mui/material';
import { 
    AcademicCapIcon, 
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
    ClockIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    BookOpenIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import { Button } from "@heroui/react";
import DeleteTrainingForm from '@/Forms/DeleteTrainingForm.jsx';
import AddEditTrainingForm from '@/Forms/AddEditTrainingForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import { Link } from '@inertiajs/react';

const TrainingDetail = ({ auth, training: initialTraining, title }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [training, setTraining] = useState(initialTraining);
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [enrollments, setEnrollments] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // Fetch the most up-to-date training data
    const fetchTrainingData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.training.show', training.id));
            setTraining(response.data);
        } catch (error) {
            console.error('Error fetching training data:', error);
            toast.error('Failed to load training details');
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch recent enrollments
    const fetchEnrollments = async () => {
        try {
            const response = await axios.get(route('hr.training.enrollments.list', training.id), {
                params: { limit: 5 }
            });
            setEnrollments(response.data);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        }
    };
    
    // Fetch training materials
    const fetchMaterials = async () => {
        try {
            const response = await axios.get(route('hr.training.materials.list', training.id), {
                params: { limit: 5 }
            });
            setMaterials(response.data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    // Fetch training feedback
    const [feedback, setFeedback] = useState([]);
    const [feedbackStats, setFeedbackStats] = useState({
        average_rating: 0,
        total_feedback: 0,
        positive_feedback: 0,
        negative_feedback: 0
    });

    const fetchFeedback = async () => {
        try {
            const response = await axios.get(route('hr.training.feedback.list', training.id), {
                params: { limit: 3 }
            });
            setFeedback(response.data.feedback);
            setFeedbackStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    };
    
    useEffect(() => {
        if (initialTraining?.id) {
            fetchTrainingData();
            fetchEnrollments();
            fetchMaterials();
            fetchFeedback();
        }
    }, [initialTraining?.id]);
    
    const handleCompleteTraining = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.training.complete', training.id));
            toast.success(response.data.message || 'Training marked as completed successfully');
            fetchTrainingData();
        } catch (error) {
            console.error('Error completing training:', error);
            toast.error('Failed to mark training as completed');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancelTraining = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.training.cancel', training.id));
            toast.success(response.data.message || 'Training cancelled successfully');
            fetchTrainingData();
        } catch (error) {
            console.error('Error cancelling training:', error);
            toast.error('Failed to cancel training');
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
            onPress: () => window.location.href = route('hr.training.index'),
            permission: 'training-sessions.view'
        },
        {
            label: "Edit Training",
            icon: <PencilIcon className="w-4 h-4" />,
            onPress: () => setOpenEditModal(true),
            permission: 'training-sessions.edit'
        },
        {
            label: "Print / Export",
            icon: <ArrowDownOnSquareIcon className="w-4 h-4" />,
            onPress: handlePrint,
            permission: 'training-sessions.view'
        },
        {
            label: "Delete",
            icon: <TrashIcon className="w-4 h-4" />,
            onPress: () => setOpenDeleteModal(true),
            variant: "danger",
            permission: 'training-sessions.delete'
        }
    ].filter(button => !button.permission || auth.permissions.includes(button.permission));
    
    // Format status for display
    const getStatusColor = (status) => {
        switch (status) {
            case 'planned': return { bg: 'bg-blue-100', text: 'text-blue-800' };
            case 'active': return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'completed': return { bg: 'bg-purple-100', text: 'text-purple-800' };
            case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-800' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };
    
    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };
    
    // Calculate training progress
    const calculateProgress = () => {
        if (!training) return 0;
        
        if (training.status === 'completed') return 100;
        if (training.status === 'cancelled') return 0;
        
        if (training.start_date && training.end_date) {
            const startDate = new Date(training.start_date);
            const endDate = new Date(training.end_date);
            const today = new Date();
            
            if (today < startDate) return 0;
            if (today > endDate) return 100;
            
            const totalDuration = endDate - startDate;
            const elapsedDuration = today - startDate;
            
            return Math.round((elapsedDuration / totalDuration) * 100);
        }
        
        return 0;
    };
    
    // If no training or still loading initial data
    if (!training && !loading) {
        return (
            <App>
                <Head title="Training Not Found" />
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Training Session Not Found
                    </Typography>
                    <Button
                        variant="primary"
                        onClick={() => window.location.href = route('hr.training.index')}
                        startIcon={<ArrowLeftIcon className="w-4 h-4" />}
                        sx={{ mt: 2 }}
                    >
                        Back to Training List
                    </Button>
                </Box>
            </App>
        );
    }
    
    return (
        <App>
            <Head title={title || `Training - ${training?.title || 'Loading...'}`} />
            <PageHeader
                title="Training Session Details"
                subtitle={training?.title || 'Loading...'}
                actionButtons={actionButtons}
                icon={<AcademicCapIcon className="w-8 h-8" />}
            />
            
            <Box sx={{ mt: 3 }}>
                <GlassCard>
                    {/* Header */}
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" gutterBottom>{training?.title}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Chip 
                                    icon={<BuildingOfficeIcon className="w-4 h-4" />}
                                    label={training?.category?.name || 'Uncategorized'} 
                                    size="small"
                                />
                                {training?.is_online ? (
                                    <Chip 
                                        label="Online Training"
                                        size="small"
                                        color="info"
                                    />
                                ) : (
                                    <Chip 
                                        icon={<MapPinIcon className="w-4 h-4" />}
                                        label={training?.location || 'No location specified'} 
                                        size="small"
                                    />
                                )}
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 2, sm: 0 } }}>
                            <Chip 
                                label={formatStatus(training?.status)} 
                                className={`${getStatusColor(training?.status).bg} ${getStatusColor(training?.status).text}`}
                                sx={{ mb: 1 }}
                            />
                            {training?.status === 'active' && (
                                <Box sx={{ width: '100%', maxWidth: 150 }}>
                                    <Typography variant="body2" align="center" gutterBottom>
                                        Progress: {calculateProgress()}%
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={calculateProgress()}
                                        sx={{ height: 8, borderRadius: 2 }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Box>
                    
                    <Divider />
                    
                    {/* Training Information */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Description</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                        {training?.description || 'No description provided.'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Training Details</Typography>
                                    
                                    <List dense disablePadding>
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <ClockIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Duration" 
                                                secondary={`${training?.duration || '-'} ${training?.duration_unit || 'days'}`} 
                                            />
                                        </ListItem>
                                        
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <CalendarIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Start Date" 
                                                secondary={
                                                    training?.start_date
                                                        ? dayjs(training.start_date).format('MMM D, YYYY')
                                                        : 'Not scheduled'
                                                } 
                                            />
                                        </ListItem>
                                        
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <CalendarIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="End Date" 
                                                secondary={
                                                    training?.end_date
                                                        ? dayjs(training.end_date).format('MMM D, YYYY')
                                                        : 'Not scheduled'
                                                } 
                                            />
                                        </ListItem>
                                        
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <UserIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Instructor" 
                                                secondary={training?.instructor || 'Not assigned'} 
                                            />
                                        </ListItem>
                                        
                                        <ListItem disableGutters disablePadding>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <UsersIcon className="w-5 h-5 text-gray-500" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Participants" 
                                                secondary={`${enrollments?.length || 0} / ${training?.max_participants || 'Unlimited'}`} 
                                            />
                                        </ListItem>
                                        
                                        {training?.cost && (
                                            <ListItem disableGutters disablePadding>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Cost" 
                                                    secondary={`${training.cost} ${training.currency || 'USD'}`} 
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Divider />
                    
                    {/* Training Materials and Enrollments */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1">Training Materials</Typography>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => window.location.href = route('hr.training.materials.index', training.id)}
                                        >
                                            View All
                                        </Button>
                                    </Box>
                                    
                                    {materials.length > 0 ? (
                                        <List dense>
                                            {materials.map((material) => (
                                                <ListItem 
                                                    key={material.id} 
                                                    sx={{ 
                                                        mb: 1, 
                                                        borderRadius: 1, 
                                                        ':hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => window.location.href = route('hr.training.materials.show', material.id)}
                                                >
                                                    <ListItemIcon>
                                                        {material.type === 'pdf' ? (
                                                            <DocumentTextIcon className="w-5 h-5 text-red-500" />
                                                        ) : material.type === 'video' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        ) : (
                                                            <BookOpenIcon className="w-5 h-5 text-gray-500" />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={material.title} 
                                                        secondary={
                                                            <>
                                                                {material.type} • {material.created_at ? dayjs(material.created_at).format('MMM D, YYYY') : 'Unknown date'}
                                                            </>
                                                        }
                                                    />
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(material.file_url, '_blank');
                                                        }}
                                                    >
                                                        Download
                                                    </Button>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography color="text.secondary">No materials uploaded yet</Typography>
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => window.location.href = route('hr.training.materials.create', training.id)}
                                                sx={{ mt: 1 }}
                                            >
                                                Add Material
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1">Enrolled Participants</Typography>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => window.location.href = route('hr.training.enrollments.index', training.id)}
                                        >
                                            View All
                                        </Button>
                                    </Box>
                                    
                                    {enrollments.length > 0 ? (
                                        <List dense>
                                            {enrollments.map((enrollment) => (
                                                <ListItem 
                                                    key={enrollment.id} 
                                                    sx={{ 
                                                        mb: 1, 
                                                        borderRadius: 1, 
                                                        ':hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => window.location.href = route('hr.training.enrollments.show', enrollment.id)}
                                                >
                                                    <ListItemIcon>
                                                        <Avatar 
                                                            src={enrollment.user?.profile_photo_url} 
                                                            alt={enrollment.user?.name}
                                                            sx={{
                                                                bgcolor: 
                                                                    enrollment.status === 'completed' ? 'success.light' : 
                                                                    enrollment.status === 'in_progress' ? 'info.light' :
                                                                    enrollment.status === 'enrolled' ? 'primary.light' :
                                                                    'error.light'
                                                            }}
                                                        >
                                                            {enrollment.user?.name?.charAt(0)}
                                                        </Avatar>
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={enrollment.user?.name} 
                                                        secondary={
                                                            <>
                                                                {enrollment.user?.designation?.name || 'No designation'} 
                                                                {enrollment.enrollment_date && ` • Enrolled on ${dayjs(enrollment.enrollment_date).format('MMM D, YYYY')}`}
                                                            </>
                                                        } 
                                                    />
                                                    <Chip 
                                                        label={enrollment.status === 'enrolled' ? 'Enrolled' :
                                                               enrollment.status === 'completed' ? 'Completed' :
                                                               enrollment.status === 'in_progress' ? 'In Progress' :
                                                               enrollment.status === 'cancelled' ? 'Cancelled' :
                                                               enrollment.status} 
                                                        size="small"
                                                        color={
                                                            enrollment.status === 'enrolled' ? 'primary' :
                                                            enrollment.status === 'completed' ? 'success' :
                                                            enrollment.status === 'in_progress' ? 'info' :
                                                            enrollment.status === 'cancelled' ? 'error' :
                                                            'default'
                                                        }
                                                        variant="outlined"
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography color="text.secondary">No enrollments yet</Typography>
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => window.location.href = route('hr.training.enrollments.create', training.id)}
                                                sx={{ mt: 1 }}
                                            >
                                                Enroll Participants
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>Training Actions</Typography>
                                    
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>Training Status</Typography>
                                                
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                                    {training?.status === 'active' && auth.permissions.includes('training-sessions.update') && (
                                                        <Button 
                                                            variant="primary" 
                                                            onClick={handleCompleteTraining}
                                                            loading={loading}
                                                            startIcon={<CheckCircleIcon className="w-4 h-4" />}
                                                        >
                                                            Mark as Completed
                                                        </Button>
                                                    )}
                                                    
                                                    {(training?.status === 'planned' || training?.status === 'active') && 
                                                     auth.permissions.includes('training-sessions.update') && (
                                                        <Button 
                                                            variant="danger" 
                                                            onClick={handleCancelTraining}
                                                            loading={loading}
                                                        >
                                                            Cancel Training
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>
                                        
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>Training Resources</Typography>
                                                
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                                    <Link href={route('hr.training.enrollments.create', training.id)}>
                                                        <Button variant="secondary" startIcon={<UsersIcon className="w-4 h-4" />}>
                                                            Enroll Participants
                                                        </Button>
                                                    </Link>
                                                    
                                                    <Link href={route('hr.training.materials.create', training.id)}>
                                                        <Button variant="outline" startIcon={<DocumentTextIcon className="w-4 h-4" />}>
                                                            Add Training Material
                                                        </Button>
                                                    </Link>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        
                                        {training?.status === 'completed' && (
                                            <Grid item xs={12}>
                                                <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                                                    <Typography variant="subtitle2" gutterBottom>Training Certificates</Typography>
                                                    
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                                        <Button 
                                                            variant="primary" 
                                                            onClick={() => window.location.href = route('hr.training.certificates.generate', training.id)}
                                                            startIcon={<DocumentTextIcon className="w-4 h-4" />}
                                                        >
                                                            Generate Certificates
                                                        </Button>
                                                        
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => window.location.href = route('hr.training.certificates.index', training.id)}
                                                            startIcon={<DocumentTextIcon className="w-4 h-4" />}
                                                        >
                                                            View All Certificates
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Divider />
                    
                    {/* Feedback Section */}
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Training Feedback & Evaluations</Typography>
                        
                        <Grid container spacing={3}>
                            {/* Feedback Stats */}
                            <Grid item xs={12} md={4}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Feedback Overview</Typography>
                                    
                                    {feedbackStats.total_feedback > 0 ? (
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', mr: 1 }}>
                                                    {feedbackStats.average_rating.toFixed(1)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    /5
                                                </Typography>
                                            </Box>
                                            
                                            <Typography variant="body2" align="center" gutterBottom>
                                                Based on {feedbackStats.total_feedback} {feedbackStats.total_feedback === 1 ? 'response' : 'responses'}
                                            </Typography>
                                            
                                            <Box sx={{ mt: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Positive Feedback</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {feedbackStats.positive_feedback} ({feedbackStats.total_feedback > 0 ? 
                                                            Math.round((feedbackStats.positive_feedback / feedbackStats.total_feedback) * 100) : 0}%)
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={feedbackStats.total_feedback > 0 ? 
                                                        (feedbackStats.positive_feedback / feedbackStats.total_feedback) * 100 : 0}
                                                    sx={{ height: 8, borderRadius: 2, mb: 2, bgcolor: 'background.paper', '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }}
                                                />
                                                
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Negative Feedback</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {feedbackStats.negative_feedback} ({feedbackStats.total_feedback > 0 ? 
                                                            Math.round((feedbackStats.negative_feedback / feedbackStats.total_feedback) * 100) : 0}%)
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={feedbackStats.total_feedback > 0 ? 
                                                        (feedbackStats.negative_feedback / feedbackStats.total_feedback) * 100 : 0}
                                                    sx={{ height: 8, borderRadius: 2, bgcolor: 'background.paper', '& .MuiLinearProgress-bar': { bgcolor: 'error.main' } }}
                                                />
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography color="text.secondary">No feedback submitted yet</Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                            
                            {/* Recent Feedback */}
                            <Grid item xs={12} md={8}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1">Recent Feedback</Typography>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => window.location.href = route('hr.training.feedback.index', training.id)}
                                        >
                                            View All
                                        </Button>
                                    </Box>
                                    
                                    {feedback.length > 0 ? (
                                        <List>
                                            {feedback.map((item) => (
                                                <ListItem 
                                                    key={item.id} 
                                                    sx={{ 
                                                        mb: 2, 
                                                        p: 2,
                                                        borderRadius: 2,
                                                        bgcolor: 'background.paper',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                    }}
                                                    disableGutters
                                                >
                                                    <Box sx={{ width: '100%' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Avatar 
                                                                    src={item.user?.profile_photo_url} 
                                                                    alt={item.user?.name}
                                                                    sx={{ mr: 1, width: 32, height: 32 }}
                                                                >
                                                                    {item.user?.name?.charAt(0)}
                                                                </Avatar>
                                                                <Typography variant="subtitle2">{item.user?.name}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                {Array.from(Array(5).keys()).map((i) => (
                                                                    <svg 
                                                                        key={i}
                                                                        xmlns="http://www.w3.org/2000/svg" 
                                                                        className={`w-4 h-4 ${i < item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                ))}
                                                                <Typography variant="caption" sx={{ ml: 1 }}>
                                                                    {dayjs(item.created_at).format('MMM D, YYYY')}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        
                                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                                            {item.comments}
                                                        </Typography>
                                                        
                                                        {item.strengths && (
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Strengths:
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {item.strengths}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        
                                                        {item.improvements && (
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Areas for improvement:
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {item.improvements}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography color="text.secondary">No feedback submitted yet</Typography>
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => window.location.href = route('hr.training.feedback.create', training.id)}
                                                sx={{ mt: 1 }}
                                            >
                                                Request Feedback
                                            </Button>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </GlassCard>
            </Box>
            
            {/* Delete Modal */}
            <DeleteTrainingForm
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                training={training}
                fetchData={() => {
                    // Redirect to list after deletion
                    window.location.href = route('hr.training.index');
                }}
                currentPage={1}
                perPage={30}
                filterData={{}}
            />
            
            {/* Edit Modal */}
            <AddEditTrainingForm
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                training={training}
                fetchData={() => fetchTrainingData()}
                currentPage={1}
                perPage={30}
                filterData={{}}
            />
        </App>
    );
};

export default TrainingDetail;
