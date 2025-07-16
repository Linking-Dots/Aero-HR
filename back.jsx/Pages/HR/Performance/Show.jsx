import React, { useState, useEffect } from 'react';
import { Head } from "@inertiajs/react";
import { Box, Grid, Typography, useTheme, useMediaQuery, Divider, Paper, Chip, Rating, Avatar } from '@mui/material';
import { 
    UserGroupIcon, 
    CalendarIcon, 
    CheckCircleIcon, 
    DocumentTextIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    ArrowDownOnSquareIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import { Button } from "@heroui/react";
import DeletePerformanceReviewForm from '@/Forms/DeletePerformanceReviewForm.jsx';
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import { Link } from '@inertiajs/react';

const PerformanceReviewDetail = ({ auth, review: initialReview, title }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [review, setReview] = useState(initialReview);
    const [loading, setLoading] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    
    // Fetch the most up-to-date review data
    const fetchReviewData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.performance.show', review.id));
            setReview(response.data);
        } catch (error) {
            console.error('Error fetching review data:', error);
            toast.error('Failed to load review details');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (initialReview?.id) {
            fetchReviewData();
        }
    }, [initialReview?.id]);
    
    const handleApprove = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.performance.approve', review.id));
            toast.success(response.data.message || 'Review approved successfully');
            fetchReviewData();
        } catch (error) {
            console.error('Error approving review:', error);
            toast.error('Failed to approve review');
        } finally {
            setLoading(false);
        }
    };
    
    const handleReject = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.performance.reject', review.id));
            toast.success(response.data.message || 'Review rejected successfully');
            fetchReviewData();
        } catch (error) {
            console.error('Error rejecting review:', error);
            toast.error('Failed to reject review');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSendReminder = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('hr.performance.reminder', review.id));
            toast.success(response.data.message || 'Reminder sent successfully');
        } catch (error) {
            console.error('Error sending reminder:', error);
            toast.error('Failed to send reminder');
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
            onPress: () => window.location.href = route('hr.performance.index'),
            permission: 'performance-reviews.view'
        },
        {
            label: "Edit Review",
            icon: <PencilIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.performance.edit', review.id),
            permission: 'performance-reviews.edit'
        },
        {
            label: "Print / Export",
            icon: <ArrowDownOnSquareIcon className="w-4 h-4" />,
            onPress: handlePrint,
            permission: 'performance-reviews.view'
        },
        {
            label: "Delete",
            icon: <TrashIcon className="w-4 h-4" />,
            onPress: () => setOpenDeleteModal(true),
            variant: "danger",
            permission: 'performance-reviews.delete'
        }
    ].filter(button => !button.permission || auth.permissions.includes(button.permission));
    
    // Format status for display
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return { bg: 'bg-gray-100', text: 'text-gray-800' };
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-800' };
            case 'completed': return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'approved': return { bg: 'bg-purple-100', text: 'text-purple-800' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };
    
    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    // If no review or still loading initial data
    if (!review && !loading) {
        return (
            <App>
                <Head title="Review Not Found" />
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Performance Review Not Found
                    </Typography>
                    <Button
                        variant="primary"
                        onClick={() => window.location.href = route('hr.performance.index')}
                        startIcon={<ArrowLeftIcon className="w-4 h-4" />}
                        sx={{ mt: 2 }}
                    >
                        Back to Reviews List
                    </Button>
                </Box>
            </App>
        );
    }
    
    return (
        <App>
            <Head title={title || `Performance Review - ${review?.employee?.name || 'Loading...'}`} />
            <PageHeader
                title="Performance Review Details"
                subtitle={`Reviewing ${review?.employee?.name || 'Loading...'}`}
                actionButtons={actionButtons}
                icon={<UserGroupIcon className="w-8 h-8" />}
            />
            
            <Box sx={{ mt: 3 }}>
                <GlassCard>
                    {/* Header */}
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                            <Avatar 
                                src={review?.employee?.profile_photo_url} 
                                alt={review?.employee?.name}
                                sx={{ width: 64, height: 64, mr: 2 }}
                            />
                            <Box>
                                <Typography variant="h5" gutterBottom>{review?.employee?.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {review?.employee?.designation?.name} • {review?.department?.name}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Chip 
                                label={formatStatus(review?.status)} 
                                className={`${getStatusColor(review?.status).bg} ${getStatusColor(review?.status).text}`}
                                sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                Review ID: {review?.id}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Divider />
                    
                    {/* Review Period Info */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Review Period</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                                        <Typography>
                                            From: {dayjs(review?.review_period_start).format('MMM D, YYYY')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                                        <Typography>
                                            To: {dayjs(review?.review_period_end).format('MMM D, YYYY')}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Review Information</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-500" />
                                        <Typography>
                                            Template: {review?.template?.name || 'Standard Review'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <UserGroupIcon className="w-5 h-5 mr-2 text-gray-500" />
                                        <Typography>
                                            Reviewer: {review?.reviewer?.name || 'Not Assigned'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1">Overall Rating</Typography>
                                        <Typography variant="h4" color="primary">
                                            {review?.overall_rating?.toFixed(1) || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Rating 
                                        value={review?.overall_rating || 0} 
                                        precision={0.5} 
                                        readOnly 
                                        size="large"
                                        sx={{ mb: 1 }}
                                    />
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        {review?.status === 'completed' && auth.permissions.includes('performance-reviews.approve') && (
                                            <>
                                                <Button 
                                                    variant="danger" 
                                                    onClick={handleReject}
                                                    loading={loading}
                                                    sx={{ mr: 2 }}
                                                >
                                                    Reject Review
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    onClick={handleApprove}
                                                    loading={loading}
                                                >
                                                    Approve Review
                                                </Button>
                                            </>
                                        )}
                                        
                                        {(review?.status === 'pending' || review?.status === 'in_progress') && 
                                         auth.permissions.includes('performance-reviews.send-reminder') && (
                                            <Button 
                                                variant="secondary" 
                                                onClick={handleSendReminder}
                                                loading={loading}
                                                startIcon={<EnvelopeIcon className="w-4 h-4" />}
                                            >
                                                Send Reminder
                                            </Button>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <Divider />
                    
                    {/* Review Details */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Goals Achieved</Typography>
                                    <Typography variant="body1">
                                        {review?.goals_achieved || 'No goals have been recorded.'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Strengths</Typography>
                                    <Typography variant="body1">
                                        {review?.strengths || 'No strengths have been recorded.'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Areas for Improvement</Typography>
                                    <Typography variant="body1">
                                        {review?.areas_for_improvement || 'No areas for improvement have been recorded.'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" gutterBottom>Reviewer Comments</Typography>
                                    <Typography variant="body1">
                                        {review?.comments || 'No comments have been provided.'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            
                            {review?.employee_comments && (
                                <Grid item xs={12}>
                                    <Paper elevation={0} sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>Employee Comments</Typography>
                                        <Typography variant="body1">
                                            {review?.employee_comments}
                                        </Typography>
                                        {review?.acknowledgment_date && (
                                            <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'right' }}>
                                                Acknowledged on {dayjs(review.acknowledgment_date).format('MMMM D, YYYY')}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            )}
                            
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>Next Steps</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                                        <Typography>
                                            Next Review: {review?.next_review_date ? dayjs(review.next_review_date).format('MMMM D, YYYY') : 'Not scheduled'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    {/* Review History - can be expanded in the future */}
                    <Divider />
                    <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Review History</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Created on {dayjs(review?.created_at).format('MMMM D, YYYY')}
                            {review?.updated_at && review?.updated_at !== review?.created_at && (
                                <> • Last updated on {dayjs(review?.updated_at).format('MMMM D, YYYY')}</>
                            )}
                        </Typography>
                    </Box>
                </GlassCard>
            </Box>
            
            {/* Delete Modal */}
            <DeletePerformanceReviewForm
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                performanceReview={review}
                fetchData={() => {
                    // Redirect to list after deletion
                    window.location.href = route('hr.performance.index');
                }}
                currentPage={1}
                perPage={30}
                filterData={{}}
            />
        </App>
    );
};

export default PerformanceReviewDetail;
