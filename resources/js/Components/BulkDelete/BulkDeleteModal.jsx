import React, { useState, useCallback } from 'react';
import {
    Box,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import LoadingButton from "@mui/lab/LoadingButton";
import { 
    TrashIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from "@mui/material/styles";
import { toast } from 'react-toastify';
import axios from 'axios';
import GlassDialog from "@/Components/GlassDialog.jsx";
import { Chip } from "@heroui/react";

const BulkDeleteModal = ({ 
    open, 
    onClose, 
    onSuccess,
    selectedLeaves = [],
    allUsers = []
}) => {
    const theme = useTheme();
    
    // State
    const [isDeleting, setIsDeleting] = useState(false);
    const [errors, setErrors] = useState({});

    // Get user name helper
    const getUserName = useCallback((userId) => {
        const user = allUsers.find(u => u.id === userId);
        return user?.name || `User ID: ${userId}`;
    }, [allUsers]);

    // Check if any leaves are approved (cannot be deleted)
    const approvedLeaves = selectedLeaves.filter(leave => 
        leave.status && leave.status.toLowerCase() === 'approved'
    );
    const canDelete = approvedLeaves.length === 0;

    // Submit bulk deletion
    const handleDelete = useCallback(async () => {
        if (!canDelete) {
            const toastPromise = Promise.reject('Cannot delete approved leaves');
            toast.promise(toastPromise, {
                error: 'Cannot delete approved leave requests'
            });
            return;
        }

        if (selectedLeaves.length === 0) {
            const toastPromise = Promise.reject('No leaves selected');
            toast.promise(toastPromise, {
                error: 'No leave requests selected for deletion'
            });
            return;
        }

        setIsDeleting(true);

        // Follow exact same promise pattern as other forms
        const promise = new Promise(async (resolve, reject) => {
            try {
                const leaveIds = selectedLeaves.map(leave => leave.id);
                
                const response = await axios.delete(route('leaves.bulk.delete'), {
                    data: {
                        leave_ids: leaveIds
                    }
                });

                console.log('Bulk delete response status:', response.status);
                console.log('Bulk delete response data:', response.data);

                if (response.status === 200 && response.data.success) {
                    // Pass the response data to parent component for optimized updates
                    onSuccess?.(response.data);
                    onClose();
                    resolve([response.data.message || 'Leave requests deleted successfully']);
                } else {
                    console.error('Unexpected response status:', response.status);
                    reject(`Unexpected response status: ${response.status}`);
                }
            } catch (error) {
                console.error('Full error object:', error);

                if (error.response) {
                    console.error('Error response status:', error.response.status);
                    console.error('Error response data:', error.response.data);
                    
                    if (error.response.status === 422) {
                        // Handle validation errors
                        setErrors(error.response.data.errors || {});
                        reject(error.response.data.error || 'Failed to delete leave requests');
                    } else if (error.response.status === 403) {
                        // Handle authorization errors
                        reject(error.response.data.error || 'You are not authorized to delete these leave requests');
                    } else if (error.response.status === 404) {
                        // Handle not found errors
                        reject(error.response.data.error || 'Some leave requests were not found');
                    } else {
                        // Handle other HTTP errors
                        reject(`HTTP Error ${error.response.status}: ${error.response.data.message || 'An unexpected error occurred. Please try again later.'}`);
                    }
                } else if (error.request) {
                    console.error('No response received:', error.request);
                    reject('No response received from the server. Please check your internet connection.');
                } else {
                    console.error('Request setup error:', error.message);
                    reject('An error occurred while setting up the request.');
                }
            } finally {
                setIsDeleting(false);
            }
        });

        // Use exact same toast promise structure as other forms
        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Deleting leave requests...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                success: {
                    render({ data }) {
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                error: {
                    render({ data }) {
                        return (
                            <>
                                {data}
                            </>
                        );
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    }, [selectedLeaves, canDelete, onSuccess, onClose, theme]);

    return (
        <GlassDialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <TrashIcon style={{ width: 24, height: 24, color: theme.palette.error.main }} />
                    <Box>
                        <Typography variant="h6" component="h2">
                            Delete Leave Requests
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Confirm deletion of {selectedLeaves.length} leave request{selectedLeaves.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 8, right: 16 }}
                    disabled={isDeleting}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
                {!canDelete && (
                    <Box 
                        sx={{ 
                            p: 2, 
                            mb: 3,
                            borderRadius: 2, 
                            background: theme.palette.error.main + '20',
                            border: `1px solid ${theme.palette.error.main}40`
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <ExclamationTriangleIcon style={{ width: 20, height: 20, color: theme.palette.error.main }} />
                            <Typography variant="subtitle2" color="error">
                                Cannot Delete Approved Leaves
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="error">
                            {approvedLeaves.length} of the selected leave requests are already approved and cannot be deleted. 
                            Only pending or rejected leaves can be deleted.
                        </Typography>
                    </Box>
                )}

                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleIcon style={{ width: 20, height: 20 }} />
                    Selected Leave Requests ({selectedLeaves.length})
                </Typography>

                <List sx={{ 
                    maxHeight: 300, 
                    overflow: 'auto',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper
                }}>
                    {selectedLeaves.map((leave, index) => {
                        const isApproved = leave.status && leave.status.toLowerCase() === 'approved';
                        
                        return (
                            <React.Fragment key={leave.id}>
                                <ListItem sx={{ 
                                    py: 2,
                                    opacity: isApproved ? 0.6 : 1,
                                    backgroundColor: isApproved ? theme.palette.error.main + '10' : 'transparent'
                                }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                <Typography variant="subtitle2">
                                                    {getUserName(leave.user_id)}
                                                </Typography>
                                                <Chip 
                                                    size="sm" 
                                                    variant="flat"
                                                    color={
                                                        leave.status?.toLowerCase() === 'approved' ? 'success' :
                                                        leave.status?.toLowerCase() === 'pending' ? 'warning' :
                                                        leave.status?.toLowerCase() === 'rejected' ? 'danger' : 'default'
                                                    }
                                                >
                                                    {leave.status || 'Unknown'}
                                                </Chip>
                                                {isApproved && (
                                                    <Chip size="sm" variant="flat" color="danger">
                                                        Cannot Delete
                                                    </Chip>
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {leave.leave_type} - {leave.from_date} to {leave.to_date}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {leave.no_of_days} day{leave.no_of_days !== 1 ? 's' : ''} - {leave.reason}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < selectedLeaves.length - 1 && <Divider />}
                            </React.Fragment>
                        );
                    })}
                </List>

                {canDelete && (
                    <Box 
                        sx={{ 
                            mt: 3,
                            p: 2, 
                            borderRadius: 2, 
                            background: theme.palette.warning.main + '20',
                            border: `1px solid ${theme.palette.warning.main}40`
                        }}
                    >
                        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                            ⚠️ This action cannot be undone. The selected leave requests will be permanently deleted.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={{ padding: '16px 24px', justifyContent: 'space-between', gap: 2 }}>
                <LoadingButton
                    variant="outlined"
                    onClick={onClose}
                    disabled={isDeleting}
                    sx={{ borderRadius: '50px' }}
                >
                    Cancel
                </LoadingButton>
                
                <LoadingButton
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    loading={isDeleting}
                    disabled={!canDelete || isDeleting || selectedLeaves.length === 0}
                    startIcon={!isDeleting && <TrashIcon style={{ width: 16, height: 16 }} />}
                    sx={{ borderRadius: '50px' }}
                >
                    {isDeleting ? 'Deleting...' : `Delete ${selectedLeaves.length} Request${selectedLeaves.length !== 1 ? 's' : ''}`}
                </LoadingButton>
            </DialogActions>
        </GlassDialog>
    );
};

export default BulkDeleteModal;
