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

const DeleteDepartmentForm = ({ open, onClose, onSuccess, department }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Handle department deletion
    const handleDelete = async () => {
        if (!department) return;
        
        setLoading(true);
        setError(null);
        
        try {
            await axios.delete(`/departments/${department.id}`);
            toast.success('Department deleted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error deleting department:', error);
            
            if (error.response?.data?.message) {
                setError(error.response.data.message);
                toast.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0];
                setError(firstError);
                toast.error(firstError);
            } else {
                setError('An error occurred while deleting the department');
                toast.error('An error occurred while deleting the department');
            }
        } finally {
            setLoading(false);
        }
    };
    
    if (!department) return null;
    
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="delete-department-dialog"
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Delete Department</Typography>
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
                            Are you sure you want to delete the department <strong>{department.name}</strong>?
                        </Typography>
                    </Box>
                    
                    {department.employee_count > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            This department has {department.employee_count} employees assigned to it. You cannot delete a department with active employees. Please reassign these employees to other departments first.
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
                    disabled={loading || department.employee_count > 0}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                    {loading ? 'Deleting...' : 'Delete Department'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDepartmentForm;
