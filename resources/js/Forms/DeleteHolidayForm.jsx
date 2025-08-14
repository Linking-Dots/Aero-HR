import {Button, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import GlassDialog from "@/Components/GlassDialog.jsx";
import React from "react";
import {toast} from "react-toastify";
import {useTheme} from "@mui/material/styles";
import axios from 'axios';


const DeleteHolidayForm = ({ open, closeModal, holidayIdToDelete, setHolidaysData }) => {
    const theme = useTheme();
    const handleDelete = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.delete(route('holiday-delete'), {
                    params: {
                        id: holidayIdToDelete,
                        route: route().current()
                    }
                });

                if (response.status === 200) {
                    // Assuming holidaysData contains the updated list of holidays after deletion
                    setHolidaysData(response.data.holidays);
                    resolve('Holiday deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting holiday:', error);
                reject(error.response?.data?.error || 'Failed to delete holiday');
            } finally {
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
                                <span style={{ marginLeft: '8px' }}>Deleting holiday...</span>
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
                    Are you sure you want to delete this holiday? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                                        <Button
                            variant="outlined"
                            onClick={closeModal}
                            sx={{ 
                                color: theme.palette.text.secondary,
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                '&:hover': { 
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                <Button onClick={handleDelete} color="error" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </GlassDialog>

    );
}


export default DeleteHolidayForm;
