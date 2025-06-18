import {Button, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import GlassDialog from "../components/ui/GlassDialog.jsx";
import React from "react";
import {toast} from "react-toastify";
import {useTheme} from "@mui/material/styles";


const DeleteLeaveForm = ({ open, handleClose, leaveIdToDelete, setLeavesData, setLeaves, setTotalRows, setLastPage, setError }) => {
    const theme = useTheme();
 
    const handleDelete = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.delete(route('leave-delete', { id: leaveIdToDelete, route: route().current() }));


                if (response.status === 200) {
                    // Assuming dailyWorkData contains the updated list of daily works after deletion
                    
                    
                    setLeavesData(response.data.leavesData);
                    setTotalRows(response.data.leaves.total);
                    setLastPage(response.data.leaves.last_page);
                    setLeaves(response.data.leaves.data);
                    setError(false);
                    resolve('Leave application deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                if (error.response.status === 404) {
                    const { leavesData } = error.response.data;
                    setLeavesData(leavesData)
                    setError(error.response?.data?.message || 'Error retrieving data.');
                 
                }
                reject(error.response.data.error || 'Failed to delete leave application');
            } finally {
                handleClose();
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
            onClose={handleClose}
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
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleDelete} color="error" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </GlassDialog>

    );
}


export default DeleteLeaveForm;
