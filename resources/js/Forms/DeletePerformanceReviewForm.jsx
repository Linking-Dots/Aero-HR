import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Typography,
    IconButton,
    Box
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DeletePerformanceReviewForm = ({ open, onClose, performanceReview, fetchData, currentPage, perPage, filterData }) => {
    const [loading, setLoading] = useState(false);
    
    const handleDelete = async () => {
        if (!performanceReview || !performanceReview.id) return;
        
        setLoading(true);
        
        try {
            await axios.delete(route('hr.performance.reviews.destroy', performanceReview.id));
            toast.success('Performance review deleted successfully');
            fetchData({ page: currentPage, perPage, ...filterData });
            onClose();
        } catch (error) {
            console.error('Error deleting performance review:', error);
            toast.error('Failed to delete performance review');
        } finally {
            setLoading(false);
        }
    };
    
    if (!performanceReview) return null;
    
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                    Delete Performance Review
                </Typography>
                <IconButton onClick={onClose} aria-label="close">
                    <XMarkIcon className="w-5 h-5" />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <XMarkIcon className="w-6 h-6 text-red-500 mr-2" />
                    <Typography variant="body1" component="div" fontWeight="medium">
                        Confirm Deletion
                    </Typography>
                </Box>
                
                <Typography variant="body1" gutterBottom>
                    Are you sure you want to delete the performance review for <strong>{performanceReview.employee?.name}</strong>?
                </Typography>
                <Typography variant="body2" color="error">
                    This action cannot be undone.
                </Typography>
                
                {performanceReview.has_feedback && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                        <Typography variant="body2" color="error">
                            Warning: This performance review has employee feedback and comments. 
                            Deleting it will also remove all associated feedback, ratings, and comments.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <Button 
                    onClick={onClose} 
                    variant="text"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleDelete}
                    variant="danger"
                    loading={loading}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeletePerformanceReviewForm;
