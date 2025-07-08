import React, { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    DialogContent,
    DialogActions,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    FormControlLabel,
    Switch,
    Chip,
    Button,
    InputAdornment
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import GlassDialog from "@/Components/GlassDialog.jsx";
import { usePage } from "@inertiajs/react";
import axios from 'axios';
import dayjs from 'dayjs';

const AddEditJobForm = ({
    open,
    onClose,
    job = null,
    onSuccess
}) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isEditing = !!job;

    // Initialize state variables
    const [loading, setLoading] = useState(false);
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [managers, setManagers] = useState([]);
    const [errors, setErrors] = useState({});

    // Form data state
    const [formData, setFormData] = useState({
        title: '',
        // designation_id field is not in the database schema
        department_id: '',
        type: 'full_time', // Changed from job_type to type to match DB column
        location: '',
        is_remote_allowed: false, // Changed from is_remote to is_remote_allowed to match DB
        description: '',
        responsibilities: [],
        requirements: [],
        qualifications: [],
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        benefits: [],
        posting_date: dayjs().format('YYYY-MM-DD'), // Changed from posted_date to posting_date
        closing_date: '',
        status: 'draft', // Must be one of: draft, open, closed, on_hold, cancelled
        hiring_manager_id: '',
        positions: 1, // Changed from positions_count to positions
        salary_visible: false, // Added to match DB schema
        is_featured: false
    });

    // Array item management - separate states for each type
    const [newResponsibility, setNewResponsibility] = useState('');
    const [newRequirement, setNewRequirement] = useState('');
    const [newQualification, setNewQualification] = useState('');
    const [newBenefit, setNewBenefit] = useState('');

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
        if (typeof dateString === 'string' && dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Date formatting error:', error);
            return '';
        }
    };

    // Load required data
    useEffect(() => {
        const fetchRequiredData = async () => {
            try {
                const [
                    designationsResponse, 
                    departmentsResponse, 
                    managersResponse
                ] = await Promise.all([
                    axios.get(route('designations.list')),
                    axios.get(route('departments.list')),
                    axios.get(route('users.managers.list'))
                ]);
                
                setDesignations(designationsResponse.data || []);
                setDepartments(departmentsResponse.data || []);
                setManagers(managersResponse.data || []);
            } catch (error) {
                console.error('Failed to fetch required data:', error);
                toast.error('Failed to load required data for the form.', {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                        border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                        color: theme.palette.text.primary,
                    }
                });
            }
        };
        
        if (open) {
            fetchRequiredData();
            
            // Set form data if editing
            if (isEditing && job) {
                setFormData({
                    title: job.title || '',
                    // designation_id not used
                    department_id: job.department_id || '',
                    type: job.type || 'full_time',
                    location: job.location || '',
                    is_remote_allowed: job.is_remote_allowed || false,
                    description: job.description || '',
                    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
                    requirements: Array.isArray(job.requirements) ? job.requirements : [],
                    qualifications: Array.isArray(job.qualifications) ? job.qualifications : [],
                    salary_min: job.salary_min || '',
                    salary_max: job.salary_max || '',
                    salary_currency: job.salary_currency || 'USD',
                    benefits: Array.isArray(job.benefits) ? job.benefits : [],
                    posting_date: formatDate(job.posting_date) || dayjs().format('YYYY-MM-DD'),
                    closing_date: formatDate(job.closing_date) || '',
                    status: job.status || 'draft',
                    hiring_manager_id: job.hiring_manager_id || '',
                    positions: job.positions || 1,
                    salary_visible: job.salary_visible || false,
                    is_featured: job.is_featured || false
                });
            } else {
                // Reset form for new job
                setFormData({
                    title: '',
                    // designation_id field is not in the database schema
                    department_id: '',
                    type: 'full_time', // Changed from job_type to type
                    location: '',
                    is_remote_allowed: false, // Changed from is_remote to is_remote_allowed
                    description: '',
                    responsibilities: [],
                    requirements: [],
                    qualifications: [],
                    salary_min: '',
                    salary_max: '',
                    salary_currency: 'USD',
                    benefits: [],
                    posting_date: dayjs().format('YYYY-MM-DD'), // Changed from posted_date to posting_date
                    closing_date: '',
                    status: 'draft', // Must be one of: draft, open, closed, on_hold, cancelled
                    hiring_manager_id: '',
                    positions: 1, // Changed from positions_count to positions
                    salary_visible: false, // Added to match DB schema
                    is_featured: false
                });
            }
            setErrors({});
        }
    }, [open, isEditing, job, theme]);

    // Form handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: fieldValue
        }));
        
        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Array item handlers - separate for each type
    const handleAddResponsibility = () => {
        if (!newResponsibility.trim()) return;
        
        setFormData(prev => ({
            ...prev,
            responsibilities: [...prev.responsibilities, newResponsibility.trim()]
        }));
        
        setNewResponsibility('');
    };

    const handleAddRequirement = () => {
        if (!newRequirement.trim()) return;
        
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, newRequirement.trim()]
        }));
        
        setNewRequirement('');
    };

    const handleAddQualification = () => {
        if (!newQualification.trim()) return;
        
        setFormData(prev => ({
            ...prev,
            qualifications: [...prev.qualifications, newQualification.trim()]
        }));
        
        setNewQualification('');
    };

    const handleAddBenefit = () => {
        if (!newBenefit.trim()) return;
        
        setFormData(prev => ({
            ...prev,
            benefits: [...prev.benefits, newBenefit.trim()]
        }));
        
        setNewBenefit('');
    };
    
    const handleDeleteItem = (item, type) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter(i => i !== item)
        }));
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};
        const validStatuses = ['draft', 'open', 'closed', 'on_hold', 'cancelled'];
        
        if (!formData.title) newErrors.title = 'Job title is required';
        // Removed designation_id validation
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (!formData.type) newErrors.type = 'Job type is required';
        if (!formData.location && !formData.is_remote_allowed) newErrors.location = 'Location is required for non-remote jobs';
        if (!formData.description) newErrors.description = 'Job description is required';
        if (formData.responsibilities.length === 0) newErrors.responsibilities = 'At least one responsibility is required';
        if (formData.requirements.length === 0) newErrors.requirements = 'At least one requirement is required';
        if (!formData.hiring_manager_id) newErrors.hiring_manager_id = 'Hiring manager is required';
        if (!formData.positions || formData.positions < 1) newErrors.positions = 'Number of positions must be at least 1';
        if (!formData.status || !validStatuses.includes(formData.status)) newErrors.status = `Status must be one of: ${validStatuses.join(', ')}`;
        
        // Check salary range
        if (formData.salary_min && formData.salary_max) {
            if (parseFloat(formData.salary_min) > parseFloat(formData.salary_max)) {
                newErrors.salary_max = 'Maximum salary must be greater than or equal to minimum salary';
            }
        }
        
        // Check dates
        if (formData.posting_date && formData.closing_date) {
            const postedDate = new Date(formData.posting_date);
            const closingDate = new Date(formData.closing_date);
            
            if (closingDate < postedDate) {
                newErrors.closing_date = 'Closing date must be after posted date';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please correct the form errors before submitting.', {
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                    border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                    color: theme.palette.text.primary,
                }
            });
            return;
        }
        
        setLoading(true);
        
        try {
            const endpoint = isEditing 
                ? route('hr.recruitment.update', job.id)
                : route('hr.recruitment.store');
            
            const method = isEditing ? 'put' : 'post';
            
            // Debug data being sent
            console.log('Submitting job data:', formData);
            console.log('Endpoint:', endpoint);
            
            // Make sure status is one of the valid values (draft, open, closed, on_hold, cancelled)
            if (!['draft', 'open', 'closed', 'on_hold', 'cancelled'].includes(formData.status)) {
                formData.status = 'draft'; // Default to draft if invalid
            }
            
            // Build correct data structure that matches database schema
            const dataToSubmit = {
                title: formData.title,
                department_id: formData.department_id,
                type: formData.type,
                location: formData.location,
                is_remote_allowed: formData.is_remote_allowed,
                description: formData.description,
                responsibilities: formData.responsibilities,
                requirements: formData.requirements,
                qualifications: formData.qualifications,
                salary_min: formData.salary_min,
                salary_max: formData.salary_max,
                salary_currency: formData.salary_currency,
                salary_visible: formData.salary_visible,
                benefits: formData.benefits,
                posting_date: formData.posting_date,
                closing_date: formData.closing_date,
                status: formData.status,
                hiring_manager_id: formData.hiring_manager_id,
                positions: formData.positions,
                is_featured: formData.is_featured
            };
            
            console.log('Submitting job data:', dataToSubmit);
            
            const response = await axios[method](endpoint, dataToSubmit);
            
            if (response.status === 200 || response.status === 201) {
                toast.success(
                    isEditing ? 'Job updated successfully!' : 'Job created successfully!',
                    {
                        icon: '✅',
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                            border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                            color: theme.palette.text.primary,
                        }
                    }
                );
                
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            console.error('Error details:', error.response?.data);
            
            if (error.response?.status === 422) {
                // Handle validation errors
                const validationErrors = error.response.data.errors || {};
                console.log('Validation errors:', validationErrors);
                setErrors(validationErrors);
                toast.error('Please correct the validation errors.', {
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                        border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                        color: theme.palette.text.primary,
                    }
                });
            } else {
                toast.error(
                    error.response?.data?.message || 
                    `Failed to ${isEditing ? 'update' : 'create'} job posting.`,
                    {
                        icon: '🔴',
                        style: {
                            backdropFilter: 'blur(16px) saturate(200%)',
                            background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                            border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                            color: theme.palette.text.primary,
                        }
                    }
                );
            }
        } finally {
            setLoading(false);
        }
    };
    
    const jobTypeOptions = [
        { value: 'full_time', label: 'Full Time' },
        { value: 'part_time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'temporary', label: 'Temporary' },
        { value: 'internship', label: 'Internship' }
    ];
    
    const currencyOptions = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'INR', label: 'INR (₹)' },
        { value: 'JPY', label: 'JPY (¥)' },
        { value: 'CAD', label: 'CAD ($)' },
        { value: 'AUD', label: 'AUD ($)' }
    ];
    
    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Cancelled' }
    ];
    
    return (
        <GlassDialog 
            open={open} 
            closeModal={onClose} 
            fullWidth 
            maxWidth="xl"
            PaperProps={{
                sx: {
                    minHeight: '80vh',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 2 }}>
                <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
                    {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{ 
                        position: 'absolute', 
                        right: 8, 
                        top: 8,
                        color: theme.palette.grey[500]
                    }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DialogContent sx={{ 
                    pt: 1, 
                    flex: 1,
                    maxHeight: 'calc(90vh - 120px)', 
                    overflowY: 'auto',
                    paddingBottom: '80px', // Add padding to prevent content from hiding behind footer
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.primary.main,
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: theme.palette.primary.dark,
                    }
                }}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                                Basic Information
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Job Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                error={!!errors.title}
                                helperText={errors.title}
                                placeholder="e.g., Senior Software Engineer"
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            {/* Designation removed because it's not in the database schema */}
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required error={!!errors.department_id}>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    name="department_id"
                                    value={formData.department_id}
                                    onChange={(e) => handleSelectChange('department_id', e.target.value)}
                                    label="Department"
                                >
                                    {departments.map((department) => (
                                        <MenuItem key={department.id} value={department.id}>
                                            {department.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.department_id && <FormHelperText>{errors.department_id}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required error={!!errors.type}>
                                <InputLabel>Job Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={(e) => handleSelectChange('type', e.target.value)}
                                    label="Job Type"
                                >
                                    {jobTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {/* Location and Remote */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', height: '56px' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_remote_allowed}
                                            onChange={handleChange}
                                            name="is_remote_allowed"
                                            color="primary"
                                        />
                                    }
                                    label="Remote Job"
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                disabled={formData.is_remote_allowed}
                                required={!formData.is_remote_allowed}
                                error={!!errors.location}
                                helperText={errors.location || (formData.is_remote_allowed ? "Not applicable for remote jobs" : "")}
                                placeholder={formData.is_remote_allowed ? "Not applicable for remote jobs" : "e.g., New York, NY"}
                            />
                        </Grid>

                        {/* Management and Positions */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required error={!!errors.hiring_manager_id}>
                                <InputLabel>Hiring Manager</InputLabel>
                                <Select
                                    name="hiring_manager_id"
                                    value={formData.hiring_manager_id}
                                    onChange={(e) => handleSelectChange('hiring_manager_id', e.target.value)}
                                    label="Hiring Manager"
                                >
                                    {managers.map((manager) => (
                                        <MenuItem key={manager.id} value={manager.id}>
                                            {manager.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.hiring_manager_id && <FormHelperText>{errors.hiring_manager_id}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Number of Positions"
                                name="positions"
                                type="number"
                                value={formData.positions}
                                onChange={handleChange}
                                required
                                error={!!errors.positions}
                                helperText={errors.positions}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>

                        {/* Status and Dates */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth required error={!!errors.status}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => handleSelectChange('status', e.target.value)}
                                    label="Status"
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Posted Date"
                                name="posting_date"
                                type="date"
                                value={formData.posting_date}
                                onChange={handleChange}
                                required
                                error={!!errors.posting_date}
                                helperText={errors.posting_date}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Closing Date"
                                name="closing_date"
                                type="date"
                                value={formData.closing_date}
                                onChange={handleChange}
                                error={!!errors.closing_date}
                                helperText={errors.closing_date}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        {/* Job Description */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 3 }}>
                                Job Description
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Job Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                error={!!errors.description}
                                helperText={errors.description}
                                placeholder="Describe the job role, company culture, and what makes this position attractive..."
                            />
                        </Grid>

                        {/* Responsibilities */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 3 }}>
                                Key Responsibilities
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Add Responsibility"
                                    value={newResponsibility}
                                    onChange={(e) => setNewResponsibility(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddResponsibility();
                                        }
                                    }}
                                    size="small"
                                    placeholder="e.g., Develop and maintain web applications"
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddResponsibility}
                                    disabled={!newResponsibility.trim()}
                                    startIcon={<AddIcon />}
                                    sx={{ minWidth: 100 }}
                                >
                                    Add
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.responsibilities.map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={item}
                                        onDelete={() => handleDeleteItem(item, 'responsibilities')}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                            {errors.responsibilities && (
                                <FormHelperText error sx={{ mt: 1 }}>{errors.responsibilities}</FormHelperText>
                            )}
                        </Grid>

                        {/* Requirements */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 3 }}>
                                Requirements
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Add Requirement"
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddRequirement();
                                        }
                                    }}
                                    size="small"
                                    placeholder="e.g., 3+ years of experience with React"
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleAddRequirement}
                                    disabled={!newRequirement.trim()}
                                    startIcon={<AddIcon />}
                                    sx={{ minWidth: 100 }}
                                >
                                    Add
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.requirements.map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={item}
                                        onDelete={() => handleDeleteItem(item, 'requirements')}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                            {errors.requirements && (
                                <FormHelperText error sx={{ mt: 1 }}>{errors.requirements}</FormHelperText>
                            )}
                        </Grid>

                        {/* Qualifications */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 3 }}>
                                Preferred Qualifications
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Add Qualification"
                                    value={newQualification}
                                    onChange={(e) => setNewQualification(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddQualification();
                                        }
                                    }}
                                    size="small"
                                    placeholder="e.g., Bachelor's degree in Computer Science"
                                />
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleAddQualification}
                                    disabled={!newQualification.trim()}
                                    startIcon={<AddIcon />}
                                    sx={{ minWidth: 100 }}
                                >
                                    Add
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.qualifications.map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={item}
                                        onDelete={() => handleDeleteItem(item, 'qualifications')}
                                        color="success"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Grid>

                        {/* Salary Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 3 }}>
                                Compensation
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Minimum Salary"
                                name="salary_min"
                                type="number"
                                value={formData.salary_min}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">
                                        {currencyOptions.find(c => c.value === formData.salary_currency)?.label.split(' ')[1] || '$'}
                                    </InputAdornment>
                                }}
                                placeholder="50000"
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Maximum Salary"
                                name="salary_max"
                                type="number"
                                value={formData.salary_max}
                                onChange={handleChange}
                                error={!!errors.salary_max}
                                helperText={errors.salary_max}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">
                                        {currencyOptions.find(c => c.value === formData.salary_currency)?.label.split(' ')[1] || '$'}
                                    </InputAdornment>
                                }}
                                placeholder="80000"
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Currency</InputLabel>
                                <Select
                                    name="salary_currency"
                                    value={formData.salary_currency}
                                    onChange={(e) => handleSelectChange('salary_currency', e.target.value)}
                                    label="Currency"
                                >
                                    {currencyOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Benefits */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 3 }}>
                                Benefits & Perks
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Add Benefit"
                                    value={newBenefit}
                                    onChange={(e) => setNewBenefit(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddBenefit();
                                        }
                                    }}
                                    size="small"
                                    placeholder="e.g., Health insurance, Flexible working hours"
                                />
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={handleAddBenefit}
                                    disabled={!newBenefit.trim()}
                                    startIcon={<AddIcon />}
                                    sx={{ minWidth: 100 }}
                                >
                                    Add
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.benefits.map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={item}
                                        onDelete={() => handleDeleteItem(item, 'benefits')}
                                        color="warning"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Grid>

                        {/* Additional Settings */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 3 }}>
                                Additional Settings
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.salary_visible}
                                        onChange={handleChange}
                                        name="salary_visible"
                                        color="primary"
                                    />
                                }
                                label="Display Salary Information"
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_featured}
                                        onChange={handleChange}
                                        name="is_featured"
                                        color="primary"
                                    />
                                }
                                label="Featured Job Listing"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ 
                    padding: '16px', 
                    justifyContent: 'center',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1,
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderTop: `1px solid rgba(255, 255, 255, 0.2)`,
                    gap: 2
                }}>
                    <LoadingButton
                        onClick={onClose}
                        disabled={loading}
                        variant="outlined"
                        color="primary"
                        sx={{ borderRadius: '50px' }}
                    >
                        Cancel
                    </LoadingButton>
                    <LoadingButton
                        type="submit"
                        variant="outlined"
                        color="primary"
                        loading={loading}
                        sx={{ borderRadius: '50px' }}
                    >
                        {isEditing ? 'Update Job Posting' : 'Create Job Posting'}
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default AddEditJobForm;
