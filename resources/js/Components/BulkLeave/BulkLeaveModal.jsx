import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Avatar,
    Box,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import LoadingButton from "@mui/lab/LoadingButton";
import { 
    CalendarDaysIcon, 
    ExclamationTriangleIcon,
    CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from "@mui/material/styles";
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import GlassDialog from "@/Components/GlassDialog.jsx";
import BulkCalendar from './BulkCalendar';
import BulkValidationPreview from './BulkValidationPreview';

const BulkLeaveModal = ({ 
    open, 
    onClose, 
    onSuccess,
    allUsers = [],
    leavesData = { leaveTypes: [], leaveCountsByUser: {} },
    isAdmin = false,
    existingLeaves = [],
    publicHolidays = []
}) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    
    // Form state
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(auth?.user?.id || '');
    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [reason, setReason] = useState('');
    const [allowPartialSuccess, setAllowPartialSuccess] = useState(false);
    
    // Dynamic leave types state (updated per user)
    const [userLeaveTypes, setUserLeaveTypes] = useState([]);
    const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
    
    // Validation state
    const [validationResults, setValidationResults] = useState([]);
    const [balanceImpact, setBalanceImpact] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [hasValidated, setHasValidated] = useState(false);
    
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Filter existing leaves for the selected user (only used as fallback)
    const userExistingLeaves = useMemo(() => {
        if (!existingLeaves || existingLeaves.length === 0) return [];
        return existingLeaves.filter(leave => leave.user_id === parseInt(selectedUserId));
    }, [existingLeaves, selectedUserId]);

    // Available leave types and counts
    const leaveTypes = useMemo(() => {
        return userLeaveTypes.length > 0 ? userLeaveTypes : (leavesData?.leaveTypes || []);
    }, [userLeaveTypes, leavesData]);

    const leaveCounts = useMemo(() => {
        // If we have user-specific leave types with balance info, use that
        if (userLeaveTypes.length > 0) {
            return userLeaveTypes.map(type => ({
                leave_type: type.type,
                days_used: type.used,
                total_days: type.days,
                remaining_days: type.remaining
            }));
        }
        // Fallback to leavesData
        return leavesData?.leaveCountsByUser?.[selectedUserId] || [];
    }, [userLeaveTypes, leavesData, selectedUserId]);

    // Fetch leave types with balances for specific user
    const fetchUserLeaveTypes = useCallback(async (userId) => {
        if (!userId) return;
        
        setLoadingLeaveTypes(true);
        try {
            const response = await axios.get(route('leaves.bulk.leave-types'), {
                params: {
                    user_id: userId,
                    year: new Date().getFullYear()
                }
            });

            if (response.data.success) {
                setUserLeaveTypes(response.data.leave_types);
            }
        } catch (error) {
            console.error('Failed to fetch user leave types:', error);
            // Fallback to original leaveTypes
            setUserLeaveTypes([]);
        } finally {
            setLoadingLeaveTypes(false);
        }
    }, []);

    // Fetch leave types when user changes
    useEffect(() => {
        if (open && selectedUserId && isAdmin) {
            fetchUserLeaveTypes(selectedUserId);
        }
    }, [selectedUserId, open, isAdmin, fetchUserLeaveTypes]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedDates([]);
            setSelectedUserId(auth?.user?.id || '');
            setSelectedLeaveType('');
            setReason('');
            setAllowPartialSuccess(false);
            setValidationResults([]);
            setBalanceImpact(null);
            setHasValidated(false);
            setErrors({});
            setUserLeaveTypes([]);
        }
    }, [open, auth?.user?.id]);

    // Set initial leave type when leave types are available (only for new requests)
    useEffect(() => {
        if (leaveTypes.length > 0 && !selectedLeaveType && open && selectedUserId) {
            // Find a leave type with remaining days for the selected user
            const availableLeaveType = leaveTypes.find(lt => {
                // For user-specific leave types (with balance info)
                if (userLeaveTypes.length > 0) {
                    return lt.remaining > 0;
                }
                // For fallback to leavesData
                const leaveCount = leaveCounts?.find(lc => lc.leave_type === lt.type);
                const remaining = leaveCount ? (lt.days - leaveCount.days_used) : lt.days;
                return remaining > 0;
            });
            
            if (availableLeaveType) {
                setSelectedLeaveType(availableLeaveType.type);
            }
        }
    }, [leaveTypes, leaveCounts, userLeaveTypes, selectedLeaveType, open, selectedUserId]);

    // Validate dates
    const handleValidate = useCallback(async () => {
        if (selectedDates.length === 0) {
            const toastPromise = Promise.reject(new Error('No dates selected'));
            toast.promise(toastPromise, {
                error: 'Please select at least one date'
            });
            return;
        }
        
        if (!selectedLeaveType) {
            const toastPromise = Promise.reject(new Error('No leave type selected'));
            toast.promise(toastPromise, {
                error: 'Please select a leave type'
            });
            return;
        }
        
        if (!reason.trim() || reason.trim().length < 5) {
            const toastPromise = new Promise((resolve, reject) => {
                reject('Please provide a reason for leave (at least 5 characters)');
            });
            
            toast.promise(toastPromise, {
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
            });
            return;
        }

        setIsValidating(true);
        setErrors({});
        
        try {
            const selectedLeaveTypeData = leaveTypes.find(lt => lt.type === selectedLeaveType);
            
            const response = await axios.post(route('leaves.bulk.validate'), {
                user_id: parseInt(selectedUserId),
                dates: selectedDates,
                leave_type_id: selectedLeaveTypeData?.id,
                reason: reason.trim()
            });

            if (response.data.success) {
                setValidationResults(response.data.validation_results);
                setBalanceImpact(response.data.estimated_balance_impact);
                setHasValidated(true);
                
                const conflictCount = response.data.validation_results.filter(r => r.status === 'conflict').length;
                const warningCount = response.data.validation_results.filter(r => r.status === 'warning').length;
                
                const toastPromise = Promise.resolve();
                if (conflictCount > 0) {
                    toast.promise(toastPromise, {
                        success: `${conflictCount} date(s) have conflicts. Please review before submitting.`
                    });
                } else if (warningCount > 0) {
                    toast.promise(toastPromise, {
                        success: `${warningCount} date(s) have warnings. You may proceed if acceptable.`
                    });
                } else {
                    toast.promise(toastPromise, {
                        success: 'All dates validated successfully!'
                    });
                }
            }
        } catch (error) {
            console.error('Validation error:', error);
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            }
            const toastPromise = Promise.reject(error);
            toast.promise(toastPromise, {
                error: error.response?.data?.message || 'Failed to validate dates'
            });
        } finally {
            setIsValidating(false);
        }
    }, [selectedDates, selectedLeaveType, reason, selectedUserId, leaveTypes]);

    // Submit bulk leave request
    const handleSubmit = useCallback(async () => {
        if (!hasValidated) {
            const toastPromise = Promise.reject(new Error('Not validated'));
            toast.promise(toastPromise, {
                error: 'Please validate dates before submitting'
            });
            return;
        }

        const conflictCount = validationResults.filter(r => r.status === 'conflict').length;
        if (conflictCount > 0 && !allowPartialSuccess) {
            const toastPromise = new Promise((resolve, reject) => {
                reject('Please resolve conflicts or enable partial success mode');
            });
            
            toast.promise(toastPromise, {
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
            });
            return;
        }

        setIsSubmitting(true);

        // Follow exact same promise pattern as LeaveForm
        const promise = new Promise(async (resolve, reject) => {
            try {
                const selectedLeaveTypeData = leaveTypes.find(lt => lt.type === selectedLeaveType);
                
                const response = await axios.post(route('leaves.bulk.store'), {
                    user_id: parseInt(selectedUserId),
                    dates: selectedDates,
                    leave_type_id: selectedLeaveTypeData?.id,
                    reason: reason.trim(),
                    allow_partial_success: allowPartialSuccess
                });

             

                if (response.status === 200 || response.status === 201) {
                    // Pass the response data to parent component for optimized updates
                    // Follow the same pattern as single leave form
                    onSuccess?.(response.data);
                    onClose();
                    resolve([response.data.message || 'Bulk leave requests created successfully']);
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
                        reject(error.response.data.error || 'Failed to submit bulk leave requests');
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
                setIsSubmitting(false);
            }
        });

        // Use exact same toast promise structure as LeaveForm
        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Creating bulk leave requests...</span>
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
    }, [hasValidated, validationResults, allowPartialSuccess, selectedUserId, selectedDates, selectedLeaveType, reason, onSuccess, onClose, leaveTypes, theme]);

    // Check if form is valid for validation
    const canValidate = selectedDates.length > 0 && selectedLeaveType && reason.trim().length >= 5;
    
    // Check if can submit
    const canSubmit = hasValidated && 
                     (validationResults.filter(r => r.status === 'conflict').length === 0 || allowPartialSuccess);

    return (
        <GlassDialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <CalendarDaysIcon style={{ width: 24, height: 24, color: theme.palette.primary.main }} />
                    <Box>
                        <Typography variant="h6" component="h2">
                            Add Bulk Leave
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Select multiple dates and create leave requests in batch
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 8, right: 16 }}
                    disabled={isSubmitting}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
                <Grid container spacing={3}>
                    {/* Left Column: Calendar */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{ position: 'sticky', top: 0 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarDaysIcon style={{ width: 20, height: 20 }} />
                                Select Dates
                            </Typography>
                            <BulkCalendar
                                selectedDates={selectedDates}
                                onDatesChange={(dates) => {
                                    setSelectedDates(dates);
                                    setHasValidated(false); // Reset validation when dates change
                                }}
                                userId={selectedUserId}
                                fetchFromAPI={true} // Enable API-driven data fetching
                            />
                        </Box>
                    </Grid>
                    
                    {/* Right Column: Form and Validation */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Form Controls */}
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Leave Details
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {/* User Selection (Admin only) */}
                                    {isAdmin && allUsers.length > 0 && (
                                        <FormControl fullWidth error={Boolean(errors.user_id)}>
                                            <InputLabel id="bulk-employee-label">Employee</InputLabel>
                                            <Select
                                                labelId="bulk-employee-label"
                                                value={selectedUserId || ""}
                                                onChange={(e) => {
                                                    setSelectedUserId(e.target.value);
                                                    setSelectedLeaveType(''); // Reset leave type when user changes
                                                    setHasValidated(false);
                                                    setUserLeaveTypes([]); // Clear current user leave types
                                                }}
                                                label="Employee"
                                                disabled={isSubmitting || isValidating}
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
                                                <MenuItem value="" disabled>Please select employee</MenuItem>
                                                {allUsers.map(user => (
                                                    <MenuItem key={user.id} value={user.id}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar
                                                                src={user.profile_image}
                                                                alt={user.name || 'Not assigned'}
                                                                sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                }}
                                                            />
                                                            {user.name}
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>{errors.user_id}</FormHelperText>
                                        </FormControl>
                                    )}

                                    {/* Leave Type Selection */}
                                    <FormControl fullWidth error={Boolean(errors.leave_type_id)}>
                                        <InputLabel id="bulk-leave-type-label">Leave Type</InputLabel>
                                        <Select
                                            labelId="bulk-leave-type-label"
                                            value={selectedLeaveType || ''}
                                            onChange={(e) => {
                                                setSelectedLeaveType(e.target.value);
                                                setHasValidated(false);
                                            }}
                                            label="Leave Type"
                                            disabled={isSubmitting || isValidating || loadingLeaveTypes}
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
                                            <MenuItem value="" disabled>
                                                {loadingLeaveTypes ? 'Loading leave types...' : 'Select Leave Type'}
                                            </MenuItem>
                                            {leaveTypes.map((type) => {
                                                // Handle both new structure (with balance info) and old structure
                                                let remaining, isDisabled;
                                                
                                                if (userLeaveTypes.length > 0) {
                                                    // New structure with balance info
                                                    remaining = type.remaining;
                                                    isDisabled = remaining <= 0;
                                                } else {
                                                    // Fallback to old structure
                                                    const leaveCount = leaveCounts?.find(lc => lc.leave_type === type.type);
                                                    remaining = leaveCount ? (type.days - leaveCount.days_used) : type.days;
                                                    isDisabled = remaining <= 0;
                                                }
                                                
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
                                                                ({remaining} remaining)
                                                            </span>
                                                        </Box>
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                        <FormHelperText>{errors.leave_type_id}</FormHelperText>
                                    </FormControl>

                                    {/* Remaining Leaves Display */}
                                    {selectedLeaveType && (
                                        <TextField
                                            label="Remaining Leaves"
                                            type="text"
                                            fullWidth
                                            value={(() => {
                                                const selectedType = leaveTypes.find(lt => lt.type === selectedLeaveType);
                                                
                                                // Handle both new structure (with balance info) and old structure
                                                let remaining, totalDays;
                                                
                                                if (userLeaveTypes.length > 0 && selectedType) {
                                                    // New structure with balance info
                                                    remaining = selectedType.remaining;
                                                    totalDays = selectedType.days;
                                                } else {
                                                    // Fallback to old structure
                                                    const leaveCount = leaveCounts?.find(lc => lc.leave_type === selectedLeaveType);
                                                    remaining = leaveCount ? (selectedType?.days - leaveCount.days_used) : selectedType?.days;
                                                    totalDays = selectedType?.days;
                                                }
                                                
                                                return `${remaining || 0} remaining`;
                                            })()}
                                            InputProps={{ 
                                                readOnly: true,
                                                endAdornment: (
                                                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                                        of {(() => {
                                                            const selectedType = leaveTypes.find(lt => lt.type === selectedLeaveType);
                                                            return userLeaveTypes.length > 0 ? selectedType?.days : selectedType?.days;
                                                        })()} total
                                                    </Typography>
                                                )
                                            }}
                                        />
                                    )}

                                    {/* Reason */}
                                    <TextField
                                        label="Reason for Leave"
                                        placeholder="Please provide a detailed reason for your leave request..."
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            setHasValidated(false);
                                        }}
                                        multiline
                                        rows={3}
                                        fullWidth
                                        required
                                        error={Boolean(errors.reason) || (reason.length > 0 && reason.length < 5)}
                                        helperText={
                                            errors.reason || 
                                            (reason.length > 0 && reason.length < 5 ? "Reason must be at least 5 characters" : 
                                            `${reason.length}/500 characters`)
                                        }
                                        inputProps={{ maxLength: 500 }}
                                        disabled={isSubmitting || isValidating}
                                    />

                                    {/* Options */}
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={allowPartialSuccess}
                                                onChange={(e) => setAllowPartialSuccess(e.target.checked)}
                                                size="small"
                                                disabled={isSubmitting || isValidating}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2">
                                                    Allow partial success
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Valid dates will be processed even if some dates fail validation
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Box>
                            </Box>

                            {/* Summary Information */}
                            {selectedDates.length > 0 && (
                                <Box 
                                    sx={{ 
                                        p: 2, 
                                        borderRadius: 2, 
                                        background: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Selected Dates Summary
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>{selectedDates.length}</strong> date{selectedDates.length !== 1 ? 's' : ''} selected
                                    </Typography>
                                    {selectedLeaveType && (
                                        <Typography variant="body2" color="text.secondary">
                                            Leave type: {selectedLeaveType}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {/* Validation and Preview */}
                            <BulkValidationPreview
                                validationResults={validationResults}
                                balanceImpact={balanceImpact}
                                isValidating={isValidating}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ padding: '16px 24px', justifyContent: 'space-between', gap: 2 }}>
                <LoadingButton
                    variant="outlined"
                    onClick={onClose}
                    disabled={isSubmitting}
                    sx={{ borderRadius: '50px' }}
                >
                    Cancel
                </LoadingButton>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <LoadingButton
                        variant="outlined"
                        color="primary"
                        onClick={handleValidate}
                        loading={isValidating}
                        disabled={!canValidate || isSubmitting}
                        startIcon={!isValidating && <ExclamationTriangleIcon style={{ width: 16, height: 16 }} />}
                        sx={{ borderRadius: '50px' }}
                    >
                        {isValidating ? 'Validating...' : 'Validate Dates'}
                    </LoadingButton>
                    
                    <LoadingButton
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!canSubmit || isValidating}
                        startIcon={!isSubmitting && <CheckCircleIcon style={{ width: 16, height: 16 }} />}
                        sx={{ borderRadius: '50px' }}
                    >
                        {isSubmitting ? 'Creating...' : `Create ${selectedDates.length} Leave Request${selectedDates.length !== 1 ? 's' : ''}`}
                    </LoadingButton>
                </Box>
            </DialogActions>
        </GlassDialog>
    );
};

export default BulkLeaveModal;
