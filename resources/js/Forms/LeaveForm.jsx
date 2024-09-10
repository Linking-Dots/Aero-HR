
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

const LeaveForm = ({ open, closeModal, leaveTypes, leaveCounts, setLeavesData, currentLeave, allUsers }) => {
    const {auth} = usePage().props;
    const theme = useTheme();
    const [user_id, setUserId] = useState(currentLeave?.user_id || auth.user.id);
    const [leaveType, setLeaveType] = useState(currentLeave?.leave_type || (leaveTypes.length > 0 ? leaveTypes[0].type : ""));
    const [fromDate, setFromDate] = useState(currentLeave?.from_date || '');
    const [toDate, setToDate] = useState(currentLeave?.to_date || '');
    const [daysCount, setDaysCount] = useState(currentLeave?.no_of_days || '');
    const [remainingLeaves, setRemainingLeaves] = useState(''); // Default remaining leaves
    const [leaveReason, setLeaveReason] = useState(currentLeave?.reason ||'');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [daysUsed, setDaysUsed] = useState('');


    useEffect(() => {
        // Find the days used for the selected leave type
        const daysUsed = leaveCounts?.find((found) => found.leave_type === leaveType)?.days_used || 0;
        setDaysUsed(daysUsed);

        // Calculate remaining leaves for the selected leave type
        const selectedLeaveType = leaveTypes?.find((leave) => leave.type === leaveType);
        if (selectedLeaveType) {
            setRemainingLeaves(selectedLeaveType.days - daysUsed);
        }
    }, [leaveType, leaveCounts, leaveTypes]);




    useEffect(() => {
        // Function to calculate the number of days between two dates, inclusive of both start and end date
        const calculateDaysBetweenDates = (start, end) => {
            if (!start || !end) return '';

            const startDate = new Date(start);
            const endDate = new Date(end);

            if (startDate > endDate) return '';

            const timeDifference = endDate.getTime() - startDate.getTime();
            const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

            return daysDifference;
        };

        // Update daysCount whenever fromDate or toDate changes
        setDaysCount(calculateDaysBetweenDates(fromDate, toDate));
    }, [fromDate, toDate]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        const promise = new Promise(async (resolve, reject) => {
            try {
                const data = {
                    route: route().current(),
                    user_id,
                    leaveType,
                    fromDate,
                    toDate,
                    daysCount,
                    leaveReason,
                };

                if (currentLeave) {
                    data.id = currentLeave.id;
                }

                const response = await axios.post(route('leave-add'), data);

                if (response.status === 200) {
                    setLeavesData(response.data.leavesData);
                    resolve([response.data.message || 'Leave application submitted successfully']);
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
                        reject(error.response.statusText || 'Failed to submit leave application');
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
                                <span style={{ marginLeft: '8px' }}>Submitting leave application...</span>
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
                <Typography variant="h6">Add Leave</Typography>
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
                            <FormControl fullWidth>
                                <InputLabel id="leave-type-label">Leave Type</InputLabel>
                                <Select
                                    labelId="leave-type-label"
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    label="Leave Type"
                                    error={Boolean(errors.leaveType)}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                backgroundColor: theme.glassCard.backgroundColor,
                                                border: theme.glassCard.border,
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard.boxShadow,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>Select Leave Type</MenuItem>
                                    {leaveTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.type}>
                                            {type.type} {type.days} Days
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.leaveType}</FormHelperText>
                            </FormControl>
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
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Number of days"
                                type="text"
                                fullWidth
                                value={daysCount}
                                InputProps={{ readOnly: true }}
                                error={Boolean(errors.daysCount)}
                                helperText={errors.daysCount}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Remaining Leaves"
                                type="text"
                                fullWidth
                                value={remainingLeaves}
                                InputProps={{ readOnly: true }}
                                error={Boolean(errors.remainingLeaves)}
                                helperText={errors.remainingLeaves}
                            />
                        </Grid>
                        {auth.roles.includes('admin') && route().current() === 'leaves' &&
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="leave-employee-label">Employee</InputLabel>
                                    <Select
                                        variant="outlined"
                                        fullWidth
                                        labelId="leave-employee-label"
                                        value={user_id || "na"}
                                        error={Boolean(errors.user_id)}
                                        onChange={(e) => setUserId(e.target.value)}
                                        label="Employee"
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backdropFilter: 'blur(16px) saturate(200%)',
                                                    backgroundColor: theme.glassCard.backgroundColor,
                                                    border: theme.glassCard.border,
                                                    borderRadius: 2,
                                                    boxShadow: theme.glassCard.boxShadow,
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="na" disabled>Please select</MenuItem>
                                        {allUsers.map(user => (
                                            <MenuItem key={user.id} value={user.id}>
                                                <Box sx={{display: 'flex'}}>
                                                    <Avatar
                                                        src={user.profile_image}
                                                        alt={user.name || 'Not assigned'}
                                                        sx={{
                                                            borderRadius: '50%',
                                                            width: 23,
                                                            height: 23,
                                                            display: 'flex',
                                                            mr: 1,
                                                        }}
                                                    />
                                                    {user.name}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.user_id}</FormHelperText>
                                </FormControl>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <TextField
                                label="Leave Reason"
                                multiline
                                rows={4}
                                fullWidth
                                value={leaveReason}
                                onChange={(e) => setLeaveReason(e.target.value)}
                                error={Boolean(errors.leaveReason)}
                                helperText={errors.leaveReason}
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

export default LeaveForm;
