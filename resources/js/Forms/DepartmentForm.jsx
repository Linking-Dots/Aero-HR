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
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepartmentForm = ({ open, onClose, onSuccess, department = null, managers = [], parentDepartments = [] }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Initial form state
    const initialFormState = {
        name: '',
        code: '',
        description: '',
        parent_id: null,
        manager_id: null,
        location: '',
        is_active: true,
        established_date: '',
    };
    
    const [formData, setFormData] = useState(initialFormState);
    
    // Update form if editing existing department
    useEffect(() => {
        if (department) {
            setFormData({
                name: department.name || '',
                code: department.code || '',
                description: department.description || '',
                parent_id: department.parent_id || null,
                manager_id: department.manager_id || null,
                location: department.location || '',
                is_active: department.is_active ?? true,
                established_date: department.established_date ? dayjs(department.established_date).format('YYYY-MM-DD') : '',
            });
        } else {
            setFormData(initialFormState);
        }
        
        // Clear errors when form opens/reopens
        setErrors({});
    }, [department, open]);
    
    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear specific error when field is updated
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});
        
        try {
            // Prepare form data for API
            const apiData = {
                ...formData,
                established_date: formData.established_date || null,
            };
            
            let response;
            
            if (department?.id) {
                // Update existing department
                response = await axios.put(`/departments/${department.id}`, apiData);
                toast.success('Department updated successfully');
            } else {
                // Create new department
                response = await axios.post('/departments', apiData);
                toast.success('Department created successfully');
            }
            
            // Close modal and refresh data
            onSuccess(response.data.department);
            onClose();
        } catch (error) {
            console.error('Error saving department:', error);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                
                // Show toast for the first error
                const firstError = Object.values(error.response.data.errors)[0];
                if (firstError) {
                    toast.error(firstError[0]);
                }
            } else {
                toast.error('An error occurred while saving the department');
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="md"
            fullWidth
            fullScreen={fullScreen}
            aria-labelledby="department-form-dialog"
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="div">
                    {department ? 'Edit Department' : 'Create New Department'}
                </Typography>
                <IconButton edge="end" color="inherit" onClick={onClose} disabled={loading} aria-label="close">
                    <XMarkIcon className="w-5 h-5" />
                </IconButton>
            </DialogTitle>
            
            <Divider />
            
            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Basic Information
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="name"
                            label="Department Name"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={handleChange}
                            error={Boolean(errors.name)}
                            helperText={errors.name?.[0] || ''}
                            disabled={loading}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="code"
                            label="Department Code"
                            fullWidth
                            value={formData.code || ''}
                            onChange={handleChange}
                            error={Boolean(errors.code)}
                            helperText={errors.code?.[0] || 'Unique identifier (e.g., HR001, FIN002)'}
                            disabled={loading}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description || ''}
                            onChange={handleChange}
                            error={Boolean(errors.description)}
                            helperText={errors.description?.[0] || ''}
                            disabled={loading}
                        />
                    </Grid>
                    
                    {/* Organizational Information */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Organizational Information
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={Boolean(errors.parent_id)}>
                            <InputLabel id="parent-department-label">Parent Department</InputLabel>
                            <Select
                                labelId="parent-department-label"
                                name="parent_id"
                                value={formData.parent_id || ''}
                                onChange={handleChange}
                                label="Parent Department"
                                disabled={loading}
                            >
                                <MenuItem value="">
                                    <em>None (Top-Level Department)</em>
                                </MenuItem>
                                {parentDepartments.map((parent) => (
                                    // Don't allow setting self as parent
                                    department?.id !== parent.id && (
                                        <MenuItem key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </MenuItem>
                                    )
                                ))}
                            </Select>
                            {errors.parent_id && <FormHelperText>{errors.parent_id[0]}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={Boolean(errors.manager_id)}>
                            <InputLabel id="manager-label">Department Manager</InputLabel>
                            <Select
                                labelId="manager-label"
                                name="manager_id"
                                value={formData.manager_id || ''}
                                onChange={handleChange}
                                label="Department Manager"
                                disabled={loading}
                            >
                                <MenuItem value="">
                                    <em>Not Assigned</em>
                                </MenuItem>
                                {managers.map((manager) => (
                                    <MenuItem key={manager.id} value={manager.id}>
                                        {manager.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.manager_id && <FormHelperText>{errors.manager_id[0]}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="location"
                            label="Location"
                            fullWidth
                            value={formData.location || ''}
                            onChange={handleChange}
                            error={Boolean(errors.location)}
                            helperText={errors.location?.[0] || 'Physical location of the department'}
                            disabled={loading}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="established_date"
                            label="Established Date"
                            type="date"
                            fullWidth
                            value={formData.established_date || ''}
                            onChange={handleChange}
                            error={Boolean(errors.established_date)}
                            helperText={errors.established_date?.[0] || ''}
                            disabled={loading}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
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
                            label="Department is active"
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
                    {loading ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DepartmentForm;
