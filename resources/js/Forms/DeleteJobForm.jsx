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

const DeleteJobForm = ({ open, onClose, job, fetchData, currentPage, perPage, filterData }) => {
    const [loading, setLoading] = useState(false);
    
    const handleDelete = async () => {
        if (!job || !job.id) return;
        
        setLoading(true);
        
        try {
            await axios.delete(route('hr.recruitment.jobs.destroy', job.id));
            toast.success('Job posting deleted successfully');
            fetchData({ page: currentPage, perPage, ...filterData });
            onClose();
        } catch (error) {
            console.error('Error deleting job posting:', error);
            toast.error('Failed to delete job posting');
        } finally {
            setLoading(false);
        }
    };
    
    if (!job) return null;
    
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
                    Delete Job Posting
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
                    Are you sure you want to delete the job posting: <strong>{job.title}</strong>?
                </Typography>
                <Typography variant="body2" color="error">
                    This action cannot be undone.
                </Typography>
                
                {job.applications_count > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                        <Typography variant="body2" color="error">
                            Warning: This job posting has {job.applications_count} active applications. 
                            Deleting it will also remove all associated applications, interview schedules, and candidate records.
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

export default DeleteJobForm;
