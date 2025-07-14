import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeleteDesignationForm = ({ open, onClose, onSuccess, designation }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle designation deletion
    const handleDelete = async () => {
        if (!designation) return;
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`/hr/designations/${designation.id}`);
            toast.success('Designation deleted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
                toast.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0];
                setError(firstError);
                toast.error(firstError);
            } else {
                setError('An error occurred while deleting the designation');
                toast.error('An error occurred while deleting the designation');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!designation) return null;

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="delete-designation-dialog"
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Delete Designation</Typography>
                <IconButton edge="end" color="inherit" onClick={onClose} disabled={loading} aria-label="close">
                    <XMarkIcon className="w-5 h-5" />
                </IconButton>
            </DialogTitle>
            
            <Divider />
            
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
                        <Typography variant="body1">
                            Are you sure you want to delete the designation <strong>{designation.title}</strong>?
                        </Typography>
                    </Box>
                    
                    {designation.employee_count > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            This designation has {designation.employee_count} employees assigned to it. You cannot delete a designation with active employees. Please reassign these employees to other designations first.
                        </Alert>
                    )}
                    
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This action cannot be undone. All associated data will be permanently removed.
                    </Typography>
                </Box>
            </DialogContent>
            
            <Divider />
            
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                    disabled={loading || designation.employee_count > 0}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                    {loading ? 'Deleting...' : 'Delete Designation'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDesignationForm;
