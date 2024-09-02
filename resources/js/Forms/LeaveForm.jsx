
import React, {useState, useEffect} from 'react';
import {
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

const LeaveForm = ({ open, closeModal, leaveTypes, leaveCounts, setLeavesData }) => {
    const [leaveType, setLeaveType] = useState('Casual');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [daysCount, setDaysCount] = useState('');
    const [remainingLeaves, setRemainingLeaves] = useState(''); // Default remaining leaves
    const [leaveReason, setLeaveReason] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);





    useEffect(() => {
        console.log(leaveType)
        // Find the leave type in leaveCounts
        const leaveTypeData = leaveCounts.find(
            (leave) => leave.leave_type === leaveType
        );
        console.log(leaveTypeData)


            setRemainingLeaves(leaveTypeData.remaining_days);
    }, [leaveType]);



    useEffect(() => {
        // Function to calculate the number of days between two dates
        const calculateDaysBetweenDates = (start, end) => {
            if (!start || !end) return '';

            const startDate = new Date(start);
            const endDate = new Date(end);

            if (startDate > endDate) return '';

            const timeDifference = endDate.getTime() - startDate.getTime();
            const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

            return daysDifference;
        };

        // Update daysCount whenever fromDate or toDate changes
        setDaysCount(calculateDaysBetweenDates(fromDate, toDate));
    }, [fromDate, toDate]);

    const theme = useTheme();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('/leave-add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        leaveType,
                        fromDate,
                        toDate,
                        daysCount,
                        leaveReason,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setLeavesData(data.leavesData);
                    // Resolve the promise with the success messages
                    resolve([data.message || 'Leave application submitted successfully']);
                    closeModal();
                } else {
                    // Reject the promise with the error message
                    reject(data.error || 'Failed to submit leave application');
                }
            } catch (error) {
                // Reject the promise with the error message
                reject(error.message || 'An unexpected error occurred.');
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
