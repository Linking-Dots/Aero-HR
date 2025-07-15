
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

const LeaveForm = ({
                       open,
                       closeModal,
                       leavesData,
                       setLeavesData,
                       currentLeave,
                       allUsers,
                       setTotalRows,
                       setLastPage,
                       setLeaves,
                       handleMonthChange,
                       employee,
                       selectedMonth,
                       addLeaveOptimized,
                       updateLeaveOptimized,
                       fetchLeavesStats
}) => {
   

    const {auth} = usePage().props;
    const theme = useTheme();
    const [user_id, setUserId] = useState(currentLeave?.user_id || auth.user.id);
    // Initialize state variables
    const [leaveTypes, setLeaveTypes] = useState(leavesData?.leaveTypes || []);
    const [leaveCounts, setLeaveCounts] = useState([]);
    const [leaveType, setLeaveType] = useState(currentLeave?.leave_type || "");
    const formatDate = (dateString) => {
 
        
        if (!dateString) return new Date().toISOString().split('T')[0];
        
        // For date strings like 'YYYY-MM-DD', return as-is (handled by backend now)
        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
       
            return dateString;
        }
        
        // Handle legacy ISO datetime strings with timezone (e.g., "2025-07-17T18:00:00.000000Z")
        if (typeof dateString === 'string' && dateString.includes('T')) {
            // For dates stored at 6 PM UTC, they represent the following day in most timezones
            if (dateString.includes('T18:00:00')) {
                const dateParts = dateString.split('T')[0].split('-');
                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]);
                const day = parseInt(dateParts[2]) + 1; // Add one day
                
                // Create a proper date object and format it
                const adjustedDate = new Date(year, month - 1, day);
                const formattedDate = adjustedDate.toISOString().split('T')[0];
              
                return formattedDate;
            }
            
            // For other ISO strings, just take the date part
            const formattedDate = dateString.split('T')[0];
        
            return formattedDate;
        }
        
        // For other formats, use local date components to avoid timezone issues
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
          
                return new Date().toISOString().split('T')[0];
            }
            
            // Use local date components to avoid timezone shifting
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
          
            return formattedDate;
        } catch (error) {
            console.error("Error formatting date:", error);
            return new Date().toISOString().split('T')[0];
        }
    };
    
    const [fromDate, setFromDate] = useState(currentLeave?.from_date ? formatDate(currentLeave.from_date) : '');
    const [toDate, setToDate] = useState(currentLeave?.to_date ? formatDate(currentLeave.to_date) : '');
    const [daysCount, setDaysCount] = useState(currentLeave?.no_of_days || '');
    const [remainingLeaves, setRemainingLeaves] = useState(''); // Default remaining leaves
    const [leaveReason, setLeaveReason] = useState(currentLeave?.reason ||'');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [daysUsed, setDaysUsed] = useState('');



    // Populate state when leavesData or auth changes
    useEffect(() => {
        if (leavesData) {
            setLeaveTypes(leavesData.leaveTypes || []);
            const userLeaveCounts = leavesData.leaveCountsByUser?.[user_id] || [];
            setLeaveCounts(userLeaveCounts);
            
            // Set initial leave type if not set and we have leave types (only for new leaves)
            if (leaveTypes.length > 0 && !leaveType && !currentLeave) {
                setLeaveType(leaveTypes[0].type);
            }
            
            // For edit mode, ensure leave type is set from current leave
            if (currentLeave && !leaveType) {
                const leaveTypeFromSettings = leavesData.leaveTypes?.find(lt => lt.id === currentLeave.leave_type);
                if (leaveTypeFromSettings) {
                    setLeaveType(leaveTypeFromSettings.type);
                }
            }
        }
    }, [leavesData, user_id, currentLeave]);

    // Update remaining leaves when user or leave type changes
    useEffect(() => {
        if (!leaveType || !leaveCounts || !leaveTypes) return;
        
        // Find the leave count for the selected leave type
        const leaveCount = leaveCounts.find(lc => lc.leave_type === leaveType);
        const daysUsed = leaveCount?.days_used || 0;
        setDaysUsed(daysUsed);

        // Find the leave type definition
        const selectedLeaveType = leaveTypes.find(lt => lt.type === leaveType);
        if (selectedLeaveType) {
            const remaining = selectedLeaveType.days - daysUsed;
            setRemainingLeaves(remaining);
            
            // If editing and days exceed remaining, adjust the days count
            if (currentLeave && daysCount > remaining) {
                setDaysCount(remaining);
            }
        }
    }, [leaveType, leaveCounts, leaveTypes, currentLeave, daysCount]);

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
                    employee,
                    month: selectedMonth,
                };

                const apiRoute = currentLeave ? route('leave-update') : route('leave-add');

                if (currentLeave) {
                    data.id = currentLeave.id;
                }

                const response = await axios.post(apiRoute, data);
    

                if (response.status === 200) {
                    // Update leave data
                    setLeavesData(response.data.leavesData);
                    
                    // Use optimized data manipulation without triggering full reloads
                    if (currentLeave && updateLeaveOptimized && response.data.leave) {
                        // Update existing leave in-place without re-fetching
                        updateLeaveOptimized(response.data.leave);
                        fetchLeavesStats();
                    } else if (addLeaveOptimized && response.data.leave) {
                        // Add new leave in-place without re-fetching
                        addLeaveOptimized(response.data.leave);
                        fetchLeavesStats();
                        
                        // Only update total counts, don't reload the entire table
                        if (response.data.leaves && response.data.leaves.total) {
                            setTotalRows(response.data.leaves.total);
                            setLastPage(response.data.leaves.last_page || 1);
                        }
                    } else {
                        // Only as a last resort, use the server response data
                        // This should rarely happen since we have optimized functions
                        console.log("Using fallback data update mode");
                        if (response.data.leaves) {
                            if (response.data.leaves.data) {
                                setLeaves(response.data.leaves.data);
                                setTotalRows(response.data.leaves.total || response.data.leaves.data.length);
                                setLastPage(response.data.leaves.last_page || 1);
                            } else if (Array.isArray(response.data.leaves)) {
                                setLeaves(response.data.leaves);
                                setTotalRows(response.data.leaves.length);
                                setLastPage(1);
                            }
                        }
                    }
                    
                    closeModal();
                    resolve([response.data.message || 'Leave application submitted successfully']);
                }
            } catch (error) {
                console.error(error)
                setProcessing(false);

                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (error.response.status === 422) {
                        // Handle validation errors
                        setErrors(error.response.data.errors || {});
 reject(error.response.data.message || 'Failed to submit leave application');
                    } else {
                        // Handle other HTTP errors
                        reject('An unexpected error occurred. Please try again later.');
                    }
                    console.error(error.response.data.error);
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
    };

    return (
        <GlassDialog open={open} onClose={closeModal} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6">{currentLeave ? 'Edit Leave' : 'Add Leave'}</Typography>
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
                                    value={leaveType || ''}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    label="Leave Type"
                                    error={Boolean(errors.leaveType)}
                                    disabled={false}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard.background,
                                                border: theme.glassCard.border,
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard.boxShadow,
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>Select Leave Type</MenuItem>
                                    {leaveTypes.map((type) => {
                                        const leaveCount = leaveCounts?.find(lc => lc.leave_type === type.type);
                                        const remaining = leaveCount ? (type.days - leaveCount.days_used) : type.days;
                                        const isDisabled = remaining <= 0;
                                        
                                        return (
                                            <MenuItem 
                                                key={type.id} 
                                                value={type.type}
                                                disabled={isDisabled}
                                                title={isDisabled ? 'No remaining leaves available' : ''}
                                            >
                                                <Box display="flex" justifyContent="space-between" width="100%">
                                                    <span>{type.type}</span>
                                                    <span>
                                                        {leaveCount ? 
                                                            `${leaveCount.days_used} / ${type.days} days` : 
                                                            `${type.days} days`}
                                                    </span>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
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
                                value={`${remainingLeaves} day${remainingLeaves !== 1 ? 's' : ''}`}
                                InputProps={{ 
                                    readOnly: true,
                                    endAdornment: (
                                        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                            of {leaveTypes.find(lt => lt.type === leaveType)?.days || 0} total
                                        </Typography>
                                    )
                                }}
                                error={Boolean(errors.remainingLeaves)}
                                helperText={errors.remainingLeaves}
                            />
                        </Grid>
                        {route().current() === 'leaves' &&
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
                                                    background: theme.glassCard.background,
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
