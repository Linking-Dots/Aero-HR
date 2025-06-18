import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    CardContent,
    CardHeader,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    OutlinedInput,
    Chip,
    FormHelperText,
    Grow,
    CardActions,
    Divider
} from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import GlassCard from '@/Components/GlassCard';
import { PlusIcon, PencilSquareIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import axios from 'axios';

const weekDays = [
    'monday', 'tuesday', 'wednesday', 'thursday',
    'friday', 'saturday', 'sunday'
];

const AttendanceSettings = ({ title, attendanceSettings: initialSettings, attendanceTypes: initialTypes }) => {
    const theme = useTheme();
    const [settings, setSettings] = useState(initialSettings || {});
    const [types, setTypes] = useState(initialTypes || []);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [waypointDialogOpen, setWaypointDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [typeForm, setTypeForm] = useState({ config: {} });

    // Waypoint form state
    const [waypointForm, setWaypointForm] = useState({
        tolerance: 100, // Default tolerance in meters
        waypoints: [
            { lat: '', lng: '' },
            { lat: '', lng: '' },
            { lat: '', lng: '' }
        ]
    });

    const [formData, setFormData] = useState({
        office_start_time: settings?.office_start_time || '09:00',
        office_end_time: settings?.office_end_time || '18:00',
        break_time_duration: settings?.break_time_duration || 60,
        late_mark_after: settings?.late_mark_after || 15,
        early_leave_before: settings?.early_leave_before || 15,
        overtime_after: settings?.overtime_after || 30,
        auto_punch_out: settings?.auto_punch_out ?? false,
        auto_punch_out_time: settings?.auto_punch_out_time || '20:00',
        weekend_days: settings?.weekend_days || ['saturday', 'sunday'],
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (key, value) => {
        setFormData(prevData => ({ ...prevData, [key]: value }));
    };

    const handleSettingsSubmit = async (event) => {
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
            if (error.response && error.response.status === 422) {
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
        } finally {
            setLoading(false);
        }
    };

    // Attendance Type Config Edit
    const openTypeDialog = (type) => {
        // Check if this is a RouteWayPoint type
        if (type.slug === 'route-waypoint' || type.name.toLowerCase().includes('waypoint') || type.name.toLowerCase().includes('route')) {
            openWaypointDialog(type);
        } else {
            setEditingType(type);
            setTypeForm({ config: type.config || {} });
            setTypeDialogOpen(true);
        }
    };

    const closeTypeDialog = () => setTypeDialogOpen(false);

    const handleTypeConfigChange = (key, value) => {
        setTypeForm(f => ({
            ...f,
            config: { ...f.config, [key]: value }
        }));
    };

    const handleTypeConfigSubmit = async () => {
        if (!editingType) return;
        const res = await axios.post(route('attendance-types.update', editingType.id), { config: typeForm.config });
        setTypes(types.map(t => t.id === editingType.id ? res.data.attendanceType : t));
        closeTypeDialog();
    };

    // Waypoint Dialog Functions
    const openWaypointDialog = (type = null) => {
        if (type) {
            setEditingType(type);
            // Load existing waypoints from type config if available
            const existingWaypoints = type.config?.waypoints || [];
            const existingTolerance = type.config?.tolerance || 100;
            
            if (existingWaypoints.length > 0) {
                setWaypointForm({
                    tolerance: existingTolerance,
                    waypoints: existingWaypoints
                });
            } else {
                // Initialize with 3 empty waypoints
                setWaypointForm({
                    tolerance: existingTolerance,
                    waypoints: [
                        { lat: '', lng: '' },
                        { lat: '', lng: '' },
                        { lat: '', lng: '' }
                    ]
                });
            }
        }
        setWaypointDialogOpen(true);
    };

    const closeWaypointDialog = () => {
        setWaypointDialogOpen(false);
        setEditingType(null);
        // Reset form
        setWaypointForm({
            tolerance: 100,
            waypoints: [
                { lat: '', lng: '' },
                { lat: '', lng: '' },
                { lat: '', lng: '' }
            ]
        });
    };

    const handleWaypointChange = (index, field, value) => {
        setWaypointForm(prev => ({
            ...prev,
            waypoints: prev.waypoints.map((waypoint, i) =>
                i === index ? { ...waypoint, [field]: value } : waypoint
            )
        }));
    };

    const addWaypoint = () => {
        setWaypointForm(prev => ({
            ...prev,
            waypoints: [...prev.waypoints, { lat: '', lng: '' }]
        }));
    };

    const removeWaypoint = (index) => {
        if (waypointForm.waypoints.length > 2) {
            setWaypointForm(prev => ({
                ...prev,
                waypoints: prev.waypoints.filter((_, i) => i !== index)
            }));
        }
    };

    const handleToleranceChange = (value) => {
        setWaypointForm(prev => ({
            ...prev,
            tolerance: value
        }));
    };

    const handleWaypointSubmit = async () => {
        // Filter out empty waypoints
        const validWaypoints = waypointForm.waypoints.filter(w => w.lat && w.lng);
        
        if (validWaypoints.length === 0) {
            toast.error('Please add at least one valid waypoint.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
            return;
        }

        if (!waypointForm.tolerance || waypointForm.tolerance <= 0) {
            toast.error('Please enter a valid tolerance value.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
            return;
        }

        try {
            if (editingType) {
                // Update the attendance type with waypoint config
                const updatedConfig = {
                    ...editingType.config,
                    tolerance: waypointForm.tolerance,
                    waypoints: validWaypoints
                };
                
                const response = await axios.post(route('attendance-types.update', editingType.id), { 
                    config: updatedConfig 
                });
                
                // Update the types in state
                setTypes(types.map(t => t.id === editingType.id ? response.data.attendanceType : t));
                
                toast.success('Waypoints updated successfully!', {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            } else {
                // Generic waypoint save (if opened from header button)
                toast.success('Waypoints saved successfully!', {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            }
            closeWaypointDialog();
        } catch (error) {
            toast.error('Failed to save waypoints.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        }
    };

    // Heroicon mapping (expand as needed)
    const heroIconMap = {
        'clock': <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} fill="none"/></svg>,
        'calendar': <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
        'map-pin': <MapPinIcon style={{ width: 20, height: 20 }} className="text-purple-500" />,
        'route': <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.158.69-.158 1.006 0l4.994 2.497c.317.158.69.158 1.007 0z" /></svg>,
        'default': <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
    };

    const renderHeroIcon = (icon) => heroIconMap[icon] || heroIconMap['default'];

    return (
        <>
            <Head title={title} />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Grow in>
                            <GlassCard>
                                <CardHeader 
                                    title="Attendance Settings"
                                
                                />
                                <form onSubmit={handleSettingsSubmit}>
                                    <CardContent>
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
                                        </Grid>

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
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <GlassCard>
                            <CardHeader
                                title="Attendance Types"
                                
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    {types.map(type => (
                                        <Grid item xs={12} key={type.id}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 2,
                                                    borderRadius: 3,
                                                    background: 'rgba(255,255,255,0.12)',
                                                    boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
                                                    border: '1px solid rgba(255,255,255,0.18)',
                                                    backdropFilter: 'blur(12px) saturate(180%)',
                                                    transition: 'box-shadow 0.2s',
                                                    '&:hover': {
                                                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ mr: 1 }}>
                                                        {type.icon}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                            {type.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {type.description}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Slug: {type.slug}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                            Config: {JSON.stringify(type.config)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box>
                                                    <IconButton onClick={() => openTypeDialog(type)}>
                                                        
                                                        <PencilSquareIcon style={{ width: 20, height: 20, color: theme.palette.primary.main }} />
                                                   
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                </Grid>
            </Box>

            {/* Regular Type Config Dialog */}
            <Dialog open={typeDialogOpen} onClose={closeTypeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Attendance Type Config</DialogTitle>
                <DialogContent>
                    {editingType && (
                        <>
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                {editingType.name} ({editingType.slug})
                            </Typography>
                            {Object.keys(typeForm.config).length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No config fields available for this type.
                                </Typography>
                            )}
                            {Object.entries(typeForm.config).map(([key, value]) => (
                                <TextField
                                    key={key}
                                    label={key}
                                    value={value}
                                    onChange={e => handleTypeConfigChange(key, e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                            ))}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeTypeDialog}>Cancel</Button>
                    <Button onClick={handleTypeConfigSubmit} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Waypoint Dialog */}
            <Dialog 
                open={waypointDialogOpen} 
                onClose={closeWaypointDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    pb: 2
                }}>
                    <MapPinIcon style={{ width: 24, height: 24, color: theme.palette.primary.main }} />
                    <Typography variant="h6" component="span">
                        {editingType ? `Manage Waypoints - ${editingType.name}` : 'Manage Waypoints'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Define location waypoints for attendance tracking. Each waypoint requires latitude and longitude coordinates.
                    </Typography>
                    
                    {/* Tolerance Field */}
                    <Box sx={{ mb: 4 }}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.08)',
                                boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(12px) saturate(180%)',
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                mb: 2
                            }}>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Location Tolerance Settings
                            </Typography>
                            
                            <TextField
                                label="Tolerance (meters)"
                                placeholder="e.g., 100"
                                type="number"
                                value={waypointForm.tolerance}
                                onChange={(e) => handleToleranceChange(parseInt(e.target.value) || 0)}
                                fullWidth
                                inputProps={{ 
                                    min: 1,
                                    max: 10000,
                                    step: 1
                                }}
                                helperText="Distance in meters within which attendance can be marked from each waypoint"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            background: 'rgba(255,255,255,0.08)',
                                        },
                                        '&.Mui-focused': {
                                            background: 'rgba(255,255,255,0.1)',
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3, opacity: 0.3 }} />
                    
                    <Grid container spacing={3}>
                        {waypointForm.waypoints.map((waypoint, index) => (
                            <Grid item xs={12} key={index}>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.08)',
                                        boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        backdropFilter: 'blur(12px) saturate(180%)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            color: theme.palette.primary.main,
                                            fontWeight: 600
                                        }}>
                                            <MapPinIcon style={{ width: 16, height: 16 }} />
                                            Waypoint {index + 1}
                                        </Typography>
                                        {waypointForm.waypoints.length > 2 && (
                                            <IconButton 
                                                onClick={() => removeWaypoint(index)}
                                                size="small"
                                                sx={{
                                                    color: theme.palette.error.main,
                                                    '&:hover': {
                                                        background: 'rgba(255,0,0,0.08)'
                                                    }
                                                }}
                                            >
                                                <TrashIcon style={{ width: 16, height: 16 }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Latitude"
                                                placeholder="e.g., 40.7128"
                                                type="number"
                                                value={waypoint.lat}
                                                onChange={(e) => handleWaypointChange(index, 'lat', e.target.value)}
                                                fullWidth
                                                inputProps={{ 
                                                    step: 'any',
                                                    min: -90,
                                                    max: 90
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        background: 'rgba(255,255,255,0.05)',
                                                        backdropFilter: 'blur(10px)',
                                                        '&:hover': {
                                                            background: 'rgba(255,255,255,0.08)',
                                                        },
                                                        '&.Mui-focused': {
                                                            background: 'rgba(255,255,255,0.1)',
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Longitude"
                                                placeholder="e.g., -74.0060"
                                                type="number"
                                                value={waypoint.lng}
                                                onChange={(e) => handleWaypointChange(index, 'lng', e.target.value)}
                                                fullWidth
                                                inputProps={{ 
                                                    step: 'any',
                                                    min: -180,
                                                    max: 180
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        background: 'rgba(255,255,255,0.05)',
                                                        backdropFilter: 'blur(10px)',
                                                        '&:hover': {
                                                            background: 'rgba(255,255,255,0.08)',
                                                        },
                                                        '&.Mui-focused': {
                                                            background: 'rgba(255,255,255,0.1)',
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                                {index < waypointForm.waypoints.length - 1 && (
                                    <Divider sx={{ my: 2, opacity: 0.3 }} />
                                )}
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            startIcon={<PlusIcon style={{ width: 20, height: 20 }} />}
                            onClick={addWaypoint}
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                }
                            }}
                        >
                            Add Another Waypoint
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    p: 3, 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    gap: 2 
                }}>
                    <Button 
                        onClick={closeWaypointDialog}
                        sx={{
                            borderRadius: 3,
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                background: 'rgba(255,255,255,0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        onClick={handleWaypointSubmit}
                        variant="contained"
                        sx={{
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            '&:hover': {
                                boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                            }
                        }}
                    >
                        Save Waypoints
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

AttendanceSettings.layout = (page) => <App>{page}</App>;
export default AttendanceSettings;
