import { Button, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import GlassDialog from "@/Components/GlassDialog.jsx";
import React, { useState } from "react";
import {toast} from "react-toastify";
import {useTheme} from "@mui/material/styles";
import axios from 'axios'; // Add missing axios import



const DeleteLeaveForm = ({ open, closeModal, leaveId, setLeavesData, setLeaves, setTotalRows, setLastPage, setError, deleteLeaveOptimized, fetchLeavesStats }) => {
    const theme = useTheme();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!leaveId) {
            toast.error('Invalid leave ID provided');
            return;
        }

        setDeleting(true);
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.delete(route('leave-delete', { id: leaveId, route: route().current() }));

                if (response.status === 200) {
                    // Optimistic update approach
                    if (deleteLeaveOptimized) {
                        deleteLeaveOptimized(leaveId);
                        setTotalRows(prev => Math.max(0, prev - 1)); // Ensure total doesn't go negative
                        if (fetchLeavesStats) {
                            fetchLeavesStats();
                        }
                    } else {
                        // Fallback approach
                        if (setLeavesData) setLeavesData(response.data.leavesData);
                        if (setTotalRows) setTotalRows(response.data.leaves.total);
                        if (setLastPage) setLastPage(response.data.leaves.last_page);
                        if (setLeaves) setLeaves(response.data.leaves.data);
                        if (setError) setError(false);
                        if (fetchLeavesStats) fetchLeavesStats();
                    }

                    resolve('Leave application deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting leave:', error);
                
                // Enhanced error handling
                if (error.response?.status === 404) {
                    const { leavesData } = error.response.data || {};
                    if (setLeavesData && leavesData) setLeavesData(leavesData);
                    if (setError) setError(error.response?.data?.message || 'Leave not found.');
                    reject('Leave not found or already deleted');
                } else if (error.response?.status === 403) {
                    reject('You do not have permission to delete this leave');
                } else if (error.response?.status === 422) {
                    reject('Cannot delete leave with current status');
                } else {
                    reject(error.response?.data?.error || 'Failed to delete leave application');
                }
            } finally {
                setDeleting(false);
                closeModal();
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Deleting leave application...</span>
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
                        return <>{data}</>;
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
                        return <>{data}</>;
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
    };
    return(
        <GlassDialog
            open={open}
            onClose={closeModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Confirm Deletion"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this leave? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={closeModal} 
                    color="primary"
                    disabled={deleting} // Disable cancel button while deleting
                    >
                    Cancel
                </Button>
                {/* Use a loading button for the delete action */}
                <Button 
                    loading={deleting} 
                    disabled={deleting} onClick={handleDelete} color="error" autoFocus>Delete
                </Button>
            </DialogActions>
        </GlassDialog>

    );
}


export default DeleteLeaveForm;