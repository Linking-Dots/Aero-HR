
import React, { useState, useEffect, useMemo } from 'react';
import {
    Typography,
    useTheme,
    useMediaQuery,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    IconButton,
    Box,
    Chip
} from "@mui/material";
import {
    Button
} from "@heroui/react";
import {
    CalendarDaysIcon,
    XMarkIcon,
    InformationCircleIcon,
    ClockIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import ClearIcon from '@mui/icons-material/Clear';
import LoadingButton from "@mui/lab/LoadingButton";
import { toast } from "react-toastify";
import { format, differenceInDays, addDays } from 'date-fns';
import axios from 'axios';
import GlassDialog from "@/Components/GlassDialog.jsx";

const HolidayForm = ({ 
    open, 
    closeModal, 
    holidaysData, 
    setHolidaysData, 
    currentHoliday 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        from_date: '',
        to_date: '',
        type: 'company',
        is_recurring: false,
        is_active: true
    });
    
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Holiday type configurations
    const holidayTypes = [
        { key: 'public', label: 'Public Holiday', icon: '🏛️', description: 'Government declared public holiday' },
        { key: 'religious', label: 'Religious Holiday', icon: '🕌', description: 'Religious observance' },
        { key: 'national', label: 'National Holiday', icon: '🇧🇩', description: 'National celebration or commemoration' },
        { key: 'company', label: 'Company Holiday', icon: '🏢', description: 'Company-specific holiday' },
        { key: 'optional', label: 'Optional Holiday', icon: '📅', description: 'Optional observance' }
    ];

    // Initialize form data
    useEffect(() => {
        if (currentHoliday) {
            setFormData({
                title: currentHoliday.title || '',
                description: currentHoliday.description || '',
                from_date: currentHoliday.from_date || '',
                to_date: currentHoliday.to_date || '',
                type: currentHoliday.type || 'company',
                is_recurring: currentHoliday.is_recurring || false,
                is_active: currentHoliday.is_active !== undefined ? currentHoliday.is_active : true
            });
        } else {
            setFormData({
                title: '',
                description: '',
                from_date: '',
                to_date: '',
                type: 'company',
                is_recurring: false,
                is_active: true
            });
        }
        setErrors({});
    }, [currentHoliday, open]);

    // Calculate duration
    const duration = useMemo(() => {
        if (formData.from_date && formData.to_date) {
            const fromDate = new Date(formData.from_date);
            const toDate = new Date(formData.to_date);
            return differenceInDays(toDate, fromDate) + 1;
        }
        return 1;
    }, [formData.from_date, formData.to_date]);

    // Handle form field changes
    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear errors for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }

        // Auto-set to_date if from_date changes and to_date is empty
        if (field === 'from_date' && !formData.to_date) {
            setFormData(prev => ({
                ...prev,
                to_date: value
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const submitData = {
                title: formData.title,
                description: formData.description,
                fromDate: formData.from_date,
                toDate: formData.to_date,
                type: formData.type,
                is_recurring: formData.is_recurring,
                is_active: formData.is_active
            };

            if (currentHoliday) {
                submitData.id = currentHoliday.id;
            }

            const response = await axios.post(route('holidays-add'), submitData);

            if (response.status === 200) {
                setHolidaysData(response.data.holidays);
                toast.success(response.data.message || 'Holiday saved successfully!');
                closeModal();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                toast.error('Please check the form for errors');
            } else {
                toast.error(error.response?.data?.message || 'Failed to save holiday');
            }
        } finally {
            setProcessing(false);
        }
    };

    // Get selected holiday type
    const selectedType = holidayTypes.find(type => type.key === formData.type);

    return (
        <GlassDialog open={open} onClose={closeModal} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarDaysIcon className="w-6 h-6 text-primary" />
                    <Typography variant="h6">
                        {currentHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                    </Typography>
                </Box>
                <IconButton
                    onClick={closeModal}
                    sx={{ position: 'absolute', top: 8, right: 16 }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent 
                    sx={{ 
                        maxHeight: '70vh', 
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '3px',
                            '&:hover': {
                                background: 'rgba(255,255,255,0.5)',
                            },
                        },
                    }}
                >
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                Basic Information
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                label="Holiday Title"
                                placeholder="Enter holiday name"
                                fullWidth
                                value={formData.title}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                                error={!!errors.title}
                                helperText={errors.title}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                placeholder="Optional description or notes"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                                error={!!errors.description}
                                helperText={errors.description}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Holiday Type */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                Holiday Type
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => handleFieldChange('type', e.target.value)}
                                    label="Type"
                                    error={!!errors.type}
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
                                    {holidayTypes.map((type) => (
                                        <MenuItem key={type.key} value={type.key}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{type.icon}</span>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {type.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {type.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.type && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                        {errors.type}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        {selectedType && (
                            <Grid item xs={12} md={6}>
                                <Box 
                                    sx={{ 
                                        p: 2, 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        borderRadius: 1,
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span style={{ fontSize: '1.5rem' }}>{selectedType.icon}</span>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {selectedType.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {selectedType.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        )}

                        {/* Date Range */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Date Range
                                </Typography>
                                {duration > 1 && (
                                    <Chip 
                                        label={`${duration} days`} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                type="date"
                                label="From Date"
                                fullWidth
                                value={formData.from_date}
                                onChange={(e) => handleFieldChange('from_date', e.target.value)}
                                error={!!errors.fromDate}
                                helperText={errors.fromDate}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                type="date"
                                label="To Date"
                                fullWidth
                                value={formData.to_date}
                                onChange={(e) => handleFieldChange('to_date', e.target.value)}
                                error={!!errors.toDate}
                                helperText={errors.toDate}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {formData.from_date && formData.to_date && (
                            <Grid item xs={12}>
                                <Box 
                                    sx={{ 
                                        p: 2, 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        borderRadius: 1,
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <InformationCircleIcon className="w-4 h-4 text-primary" />
                                        <Typography variant="body2">
                                            Holiday period: {format(new Date(formData.from_date), 'MMM dd, yyyy')} 
                                            {duration > 1 && (
                                                <> to {format(new Date(formData.to_date), 'MMM dd, yyyy')}</>
                                            )} ({duration} {duration === 1 ? 'day' : 'days'})
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        )}

                        {/* Settings */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                Settings
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Box 
                                sx={{ 
                                    p: 2, 
                                    backgroundColor: 'rgba(255,255,255,0.05)', 
                                    borderRadius: 1,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ClockIcon className="w-5 h-5 text-default-400" />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Recurring Holiday
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Repeat this holiday annually
                                        </Typography>
                                    </Box>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_recurring}
                                            onChange={(e) => handleFieldChange('is_recurring', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label=""
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box 
                                sx={{ 
                                    p: 2, 
                                    backgroundColor: 'rgba(255,255,255,0.05)', 
                                    borderRadius: 1,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckIcon className="w-5 h-5 text-default-400" />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Active Holiday
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Include in holiday calculations
                                        </Typography>
                                    </Box>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_active}
                                            onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                                            color="success"
                                        />
                                    }
                                    label=""
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ padding: '16px 24px', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={closeModal}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={processing}
                        startIcon={!processing && <CheckIcon className="w-4 h-4" />}
                        sx={{ borderRadius: '8px' }}
                    >
                        {processing ? 'Saving...' : (currentHoliday ? 'Update Holiday' : 'Create Holiday')}
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default HolidayForm;
