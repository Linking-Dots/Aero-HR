import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText,
    DialogActions, 
    Typography,
    IconButton,
    Box
} from '@mui/material';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DeleteTrainingForm = ({ open, onClose, training, fetchData, currentPage, perPage, filterData }) => {
    const [loading, setLoading] = useState(false);
    
    const handleDelete = async () => {
        if (!training) return;
        
        setLoading(true);
        
        try {
            const response = await axios.delete(route('hr.training.destroy', training.id));
            
            toast.success(response.data.message || 'Training session deleted successfully!');
            onClose();
            fetchData(currentPage, perPage, filterData);
        } catch (error) {
            console.error('Error deleting training:', error);
            toast.error(
                error.response?.data?.message || 
                'Failed to delete training session. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };
    
    if (!training) return null;
    
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
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
                    Delete Training Session
                </Typography>
                <IconButton onClick={onClose} aria-label="close">
                    <XMarkIcon className="w-5 h-5" />
                </IconButton>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 mr-2" />
                    <Typography variant="body1" component="div" fontWeight="medium">
                        Confirm Deletion
                    </Typography>
                </Box>
                
                <DialogContentText>
                    Are you sure you want to delete the training session "{training.title}"? 
                    This action cannot be undone.
                </DialogContentText>
                
                {training.enrollment_count > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                        <Typography variant="body2" color="error">
                            Warning: This training session has {training.enrollment_count} enrollments. 
                            Deleting it will also remove all associated enrollments, materials, and assignments.
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
                    Delete Training
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteTrainingForm;
