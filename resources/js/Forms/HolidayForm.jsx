
import React, {useState, useEffect} from 'react';
import {
    Avatar,
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";
import {router, usePage} from "@inertiajs/react";
import { Inertia } from '@inertiajs/inertia';

const HolidayForm = ({ open, closeModal, holidaysData, setHolidaysData, currentHoliday }) => {
    const {auth} = usePage().props;
    const theme = useTheme();
    const [title, setTitle] = useState(currentHoliday?.title || '');
    const [fromDate, setFromDate] = useState(currentHoliday?.from_date || '');
    const [toDate, setToDate] = useState(currentHoliday?.to_date || '');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        const promise = new Promise(async (resolve, reject) => {
            try {
                const data = {
                    title,
                    fromDate,
                    toDate,
                };

                if (currentHoliday) {
                    data.id = currentHoliday.id;
                }

                const response = await axios.post(route('holiday-add'), data);

                if (response.status === 200) {
                    setHolidaysData(response.data.holidays);
                    resolve([response.data.message || 'Holiday added successfully']);
                    closeModal();
                }
            } catch (error) {
                setProcessing(false);

                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (error.response.status === 422) {
                        // Handle validation errors
                        setErrors(error.response.data.errors || {});
                        reject(error.response.statusText || 'Failed to add holiday');
                    } else {
                        // Handle other HTTP errors
                        reject('An unexpected error occurred. Please try again later.');
                    }
                    console.error(error.response);
                } else if (error.request) {
                    // The request was made but no response was received
                    reject('No response received from the server. Please check your internet connection.');
                    console.error(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    reject('An error occurred while setting up the request.');
                    console.error('Error', error.message);
                }
            } finally {
                setProcessing(false);
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
                                <span style={{ marginLeft: '8px' }}>Adding holiday...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
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
                        backgroundColor: theme.glassCard.backgroundColor,
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
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    };



    return (
        <GlassDialog open={open} onClose={closeModal} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6">Add Holiday</Typography>
                <IconButton
                    onClick={closeModal}
                    sx={{ position: 'absolute', top: 8, right: 16 }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Title"
                                type="text"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.title)}
                                helperText={errors.title}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="From"
                                type="date"
                                fullWidth
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.fromDate)}
                                helperText={errors.fromDate}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="To"
                                type="date"
                                fullWidth
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.toDate)}
                                helperText={errors.toDate}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ padding: '16px', justifyContent: 'center' }}>
                    <LoadingButton
                        type="submit"
                        variant="outlined"
                        color="primary"
                        loading={processing}
                        disabled={processing}
                        sx={{ borderRadius: '50px' }}
                    >
                        Submit
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default HolidayForm;
