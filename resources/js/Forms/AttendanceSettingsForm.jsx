import React, { useState, useEffect } from 'react';
import {
    CardActions,
    CardContent,
    CardHeader,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Grow,
    Box,
    FormHelperText,
    Switch,
    FormControlLabel,
    Chip,
    OutlinedInput,
    Button
} from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import GlassCard from '@/Components/GlassCard';
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';

const AttendanceSettingsForm = ({ settings, setSettings }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        office_start_time: settings?.office_start_time || '09:00',
        office_end_time: settings?.office_end_time || '18:00',
        break_time_duration: settings?.break_time_duration || 60,
        late_mark_after: settings?.late_mark_after || 15,
        early_leave_before: settings?.early_leave_before || 15,
        overtime_after: settings?.overtime_after || 30,
        allow_punch_from_mobile: settings?.allow_punch_from_mobile || true,
        auto_punch_out: settings?.auto_punch_out || false,
        auto_punch_out_time: settings?.auto_punch_out_time || '20:00',
        attendance_validation_type: settings?.attendance_validation_type || 'location',
        location_radius: settings?.location_radius || 200,
        allowed_ips: settings?.allowed_ips || '',
        require_location_services: settings?.require_location_services || true,
        weekend_days: settings?.weekend_days || ['saturday', 'sunday'],
        active_validation_types: settings?.active_validation_types || [],
    });

    const [validationTypes, setValidationTypes] = useState([]);
    const [locations, setLocations] = useState([]);

    const weekDays = [
        'monday', 'tuesday', 'wednesday', 'thursday', 
        'friday', 'saturday', 'sunday'
    ];

    useEffect(() => {
        fetchValidationTypes();
        fetchLocations();
    }, []);

    const fetchValidationTypes = async () => {
        try {
            const response = await axios.get(route('attendance.validation-types'));
            setValidationTypes(response.data);
        } catch (error) {
            console.error('Error fetching validation types:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await axios.get(route('attendance.locations'));
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleChange = (key, value) => {
        setFormData(prevData => ({ ...prevData, [key]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(route('attendance-settings.update'), formData);
            
            if (response.status === 200) {
                setSettings(response.data.attendanceSettings);
                setErrors({});
                toast.success(response.data.message || 'Attendance settings updated successfully!', {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 422) {
                    setErrors(error.response.data.errors || {});
                    toast.error(error.response.data.error || 'Failed to update attendance settings.', {
                        icon: '🔴',
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            background: theme.glassCard.background,
                            border: theme.glassCard.border,
                            color: theme.palette.text.primary,
                        }
                    });
                } else {
                    toast.error('An unexpected error occurred. Please try again later.', {
                        icon: '🔴',
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            background: theme.glassCard.background,
                            border: theme.glassCard.border,
                            color: theme.palette.text.primary,
                        }
                    });
                }
                console.error(error.response.data);
            } else if (error.request) {
                toast.error('No response received from the server. Please check your internet connection.', {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
                console.error(error.request);
            } else {
                toast.error('An error occurred while setting up the request.', {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
                console.error('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grow in>
            <GlassCard>
                <CardHeader title="Attendance Settings" />
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        {/* Office Timing Section */}
                        <Typography variant="h6" gutterBottom>Office Timing</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Office Start Time"
                                    type="time"
                                    value={formData.office_start_time}
                                    onChange={(e) => handleChange('office_start_time', e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={Boolean(errors.office_start_time)}
                                    helperText={errors.office_start_time}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Office End Time"
                                    type="time"
                                    value={formData.office_end_time}
                                    onChange={(e) => handleChange('office_end_time', e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={Boolean(errors.office_end_time)}
                                    helperText={errors.office_end_time}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Break Time Duration (minutes)"
                                    type="number"
                                    value={formData.break_time_duration}
                                    onChange={(e) => handleChange('break_time_duration', parseInt(e.target.value))}
                                    fullWidth
                                    error={Boolean(errors.break_time_duration)}
                                    helperText={errors.break_time_duration}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Late Mark After (minutes)"
                                    type="number"
                                    value={formData.late_mark_after}
                                    onChange={(e) => handleChange('late_mark_after', parseInt(e.target.value))}
                                    fullWidth
                                    error={Boolean(errors.late_mark_after)}
                                    helperText={errors.late_mark_after}
                                />
                            </Grid>
                        </Grid>

                        {/* Attendance Rules Section */}
                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>Attendance Rules</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Early Leave Before (minutes)"
                                    type="number"
                                    value={formData.early_leave_before}
                                    onChange={(e) => handleChange('early_leave_before', parseInt(e.target.value))}
                                    fullWidth
                                    error={Boolean(errors.early_leave_before)}
                                    helperText={errors.early_leave_before}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Overtime After (minutes)"
                                    type="number"
                                    value={formData.overtime_after}
                                    onChange={(e) => handleChange('overtime_after', parseInt(e.target.value))}
                                    fullWidth
                                    error={Boolean(errors.overtime_after)}
                                    helperText={errors.overtime_after}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="attendance-validation">Attendance Validation</InputLabel>
                                    <Select
                                        labelId="attendance-validation"
                                        label="Attendance Validation"
                                        value={formData.attendance_validation_type}
                                        onChange={(e) => handleChange('attendance_validation_type', e.target.value)}
                                        error={Boolean(errors.attendance_validation_type)}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backdropFilter: 'blur(16px) saturate(200%)',
                                                    background: theme.glassCard.background,
                                                    border: theme.glassCard.border,
                                                    borderRadius: 2,
                                                    boxShadow:
                                                        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="location">Location Based</MenuItem>
                                        <MenuItem value="ip">IP Based</MenuItem>
                                        <MenuItem value="both">Both Location & IP</MenuItem>
                                    </Select>
                                    <FormHelperText>{errors.attendance_validation_type}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Location Radius (meters)"
                                    type="number"
                                    value={formData.location_radius}
                                    onChange={(e) => handleChange('location_radius', parseInt(e.target.value))}
                                    fullWidth
                                    disabled={formData.attendance_validation_type === 'ip'}
                                    error={Boolean(errors.location_radius)}
                                    helperText={errors.location_radius}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Allowed IP Addresses (comma separated)"
                                    value={formData.allowed_ips}
                                    onChange={(e) => handleChange('allowed_ips', e.target.value)}
                                    fullWidth
                                    disabled={formData.attendance_validation_type === 'location'}
                                    placeholder="192.168.1.1, 10.0.0.1"
                                    error={Boolean(errors.allowed_ips)}
                                    helperText={errors.allowed_ips}
                                />
                            </Grid>
                        </Grid>

                        {/* Weekend Settings Section */}
                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>Weekend Settings</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="weekend-days">Weekend Days</InputLabel>
                                    <Select
                                        labelId="weekend-days"
                                        multiple
                                        value={formData.weekend_days}
                                        onChange={(e) => handleChange('weekend_days', e.target.value)}
                                        input={<OutlinedInput label="Weekend Days" />}
                                        error={Boolean(errors.weekend_days)}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value.charAt(0).toUpperCase() + value.slice(1)} />
                                                ))}
                                            </Box>
                                        )}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    backdropFilter: 'blur(16px) saturate(200%)',
                                                    background: theme.glassCard.background,
                                                    border: theme.glassCard.border,
                                                    borderRadius: 2,
                                                    boxShadow:
                                                        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                                },
                                            },
                                        }}
                                    >
                                        {weekDays.map((day) => (
                                            <MenuItem key={day} value={day}>
                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.weekend_days}</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Mobile App Settings Section */}
                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>Mobile App Settings</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.allow_punch_from_mobile}
                                            onChange={(e) => handleChange('allow_punch_from_mobile', e.target.checked)}
                                        />
                                    }
                                    label="Allow Punch from Mobile"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.require_location_services}
                                            onChange={(e) => handleChange('require_location_services', e.target.checked)}
                                        />
                                    }
                                    label="Require Location Services"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.auto_punch_out}
                                            onChange={(e) => handleChange('auto_punch_out', e.target.checked)}
                                        />
                                    }
                                    label="Auto Punch Out"
                                />
                            </Grid>
                            {formData.auto_punch_out && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Auto Punch Out Time"
                                        type="time"
                                        value={formData.auto_punch_out_time}
                                        onChange={(e) => handleChange('auto_punch_out_time', e.target.value)}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(errors.auto_punch_out_time)}
                                        helperText={errors.auto_punch_out_time}
                                    />
                                </Grid>
                            )}
                        </Grid>

                        {/* Validation Types Section */}
                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
                            Validation Types
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Active Validation Methods</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.active_validation_types || []}
                                        onChange={(e) => handleChange('active_validation_types', e.target.value)}
                                        input={<OutlinedInput label="Active Validation Methods" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const type = validationTypes.find(t => t.slug === value);
                                                    return (
                                                        <Chip 
                                                            key={value} 
                                                            label={type?.name || value}
                                                            icon={type?.icon ? <span>{type.icon}</span> : undefined}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {validationTypes.map((type) => (
                                            <MenuItem key={type.slug} value={type.slug}>
                                                {type.icon && <span style={{ marginRight: 8 }}>{type.icon}</span>}
                                                {type.name}
                                                <Typography variant="caption" display="block">
                                                    {type.description}
                                                </Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Location Management Section */}
                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
                            Work Locations
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setLocationDialogOpen(true)}
                                    startIcon={<AddIcon />}
                                >
                                    Add New Location
                                </Button>
                                {/* Location list/management component here */}
                            </Grid>
                        </Grid>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'center' }}>
                        <LoadingButton
                            loading={loading}
                            sx={{
                                borderRadius: '50px',
                                padding: '6px 16px',
                            }}
                            variant="outlined"
                            color="primary"
                            type="submit"
                        >
                            Save
                        </LoadingButton>
                    </CardActions>
                </form>
            </GlassCard>
        </Grow>
    );
};

export default AttendanceSettingsForm;