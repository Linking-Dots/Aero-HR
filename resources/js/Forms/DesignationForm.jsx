import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    FormControl,
    FormHelperText,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Divider,
    IconButton,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import GlassDialog from '@/Components/GlassDialog';

const DesignationForm = ({ open, onClose, onSuccess, designation = null, departments = [], }) => {
    console.log('DesignationForm rendered with departments:', departments);
    console.log('DesignationForm rendered with designation:', designation);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Initial form state
    const initialFormState = {
        title: '',
        department_id: '',
        is_active: true,
    };

    const [formData, setFormData] = useState(initialFormState);

    // Update form if editing existing designation
    useEffect(() => {
        if (designation) {
            setFormData({
                title: designation.title || '',
                department_id: designation.department_id || '',
                is_active: designation.is_active ?? true,
            });
        } else {
            setFormData(initialFormState);
        }
        setErrors({});
    }, [designation, open]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});
        try {
            const apiData = { ...formData };
            let response;
            if (designation?.id) {
                response = await axios.put(`/designations/${designation.id}`, apiData);
                toast.success('Designation updated successfully');
            } else {
                response = await axios.post('/designations', apiData);
                toast.success('Designation created successfully');
            }
            onSuccess(response.data.designation);
            onClose();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                const firstError = Object.values(error.response.data.errors)[0];
                if (firstError) {
                    toast.error(firstError[0]);
                }
            } else {
                toast.error('An error occurred while saving the designation');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassDialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreen}
            aria-labelledby="designation-form-dialog"
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="div">
                    {designation ? 'Edit Designation' : 'Create New Designation'}
                </Typography>
                <IconButton edge="end" color="inherit" onClick={onClose} disabled={loading} aria-label="close">
                    <XMarkIcon className="w-5 h-5" />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Designation Information
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="title"
                            label="Designation Title"
                            fullWidth
                            required
                            value={formData.title}
                            onChange={handleChange}
                            error={Boolean(errors.title)}
                            helperText={errors.title?.[0] || ''}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={Boolean(errors.department_id)}>
                            <InputLabel id="department-label">Department</InputLabel>
                            <Select
                                labelId="department-label"
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                label="Department"
                                disabled={loading}
                            >
                                <MenuItem value="">
                                    <em>Select Department</em>
                                </MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.department_id && <FormHelperText>{errors.department_id[0]}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    name="is_active"
                                    color="success"
                                    disabled={loading}
                                />
                            }
                            label="Designation is active"
                        />
                        {errors.is_active && (
                            <FormHelperText error>{errors.is_active[0]}</FormHelperText>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button 
                    onClick={onClose} 
                    disabled={loading}
                    color="inherit"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : designation ? 'Update Designation' : 'Create Designation'}
                </Button>
            </DialogActions>
        </GlassDialog>
    );
};

export default DesignationForm;
