import React, { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    DialogContent,
    DialogActions,
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
    Button
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
        designation_id: '',
        department_id: '',
        job_type: 'full_time',
        location: '',
        is_remote: false,
        description: '',
        responsibilities: [],
        requirements: [],
        qualifications: [],
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        benefits: [],
        posted_date: dayjs().format('YYYY-MM-DD'),
        closing_date: '',
        status: 'draft',
        hiring_manager_id: '',
        positions_count: 1,
        is_internal: false,
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
                    designation_id: job.designation_id || '',
                    department_id: job.department_id || '',
                    job_type: job.job_type || 'full_time',
                    location: job.location || '',
                    is_remote: job.is_remote || false,
                    description: job.description || '',
                    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
                    requirements: Array.isArray(job.requirements) ? job.requirements : [],
                    qualifications: Array.isArray(job.qualifications) ? job.qualifications : [],
                    salary_min: job.salary_min || '',
                    salary_max: job.salary_max || '',
                    salary_currency: job.salary_currency || 'USD',
                    benefits: Array.isArray(job.benefits) ? job.benefits : [],
                    posted_date: formatDate(job.posted_date) || dayjs().format('YYYY-MM-DD'),
                    closing_date: formatDate(job.closing_date) || '',
                    status: job.status || 'draft',
                    hiring_manager_id: job.hiring_manager_id || '',
                    positions_count: job.positions_count || 1,
                    is_internal: job.is_internal || false,
                    is_featured: job.is_featured || false
                });
            } else {
                // Reset form for new job
                setFormData({
                    title: '',
                    designation_id: '',
                    department_id: '',
                    job_type: 'full_time',
                    location: '',
                    is_remote: false,
                    description: '',
                    responsibilities: [],
                    requirements: [],
                    qualifications: [],
                    salary_min: '',
                    salary_max: '',
                    salary_currency: 'USD',
                    benefits: [],
                    posted_date: dayjs().format('YYYY-MM-DD'),
                    closing_date: '',
                    status: 'draft',
                    hiring_manager_id: '',
                    positions_count: 1,
                    is_internal: false,
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

    const handleAddItem = () => {
        if (!newItem.trim()) return;
        
        setFormData(prev => ({
            ...prev,
            [itemType]: [...prev[itemType], newItem.trim()]
        }));
        
        setNewItem('');
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
        
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.designation_id) newErrors.designation_id = 'Designation is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (!formData.job_type) newErrors.job_type = 'Job type is required';
        if (!formData.location && !formData.is_remote) newErrors.location = 'Location is required for non-remote jobs';
        if (!formData.description) newErrors.description = 'Description is required';
        if (formData.responsibilities.length === 0) newErrors.responsibilities = 'At least one responsibility is required';
        if (formData.requirements.length === 0) newErrors.requirements = 'At least one requirement is required';
        if (!formData.hiring_manager_id) newErrors.hiring_manager_id = 'Hiring manager is required';
        if (!formData.positions_count || formData.positions_count < 1) newErrors.positions_count = 'Positions count must be at least 1';
        
        // Check salary range
        if (formData.salary_min && formData.salary_max) {
            if (parseFloat(formData.salary_min) > parseFloat(formData.salary_max)) {
                newErrors.salary_max = 'Maximum salary must be greater than or equal to minimum salary';
            }
        }
        
        // Check dates
        if (formData.posted_date && formData.closing_date) {
            const postedDate = new Date(formData.posted_date);
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
            
            const response = await axios[method](endpoint, formData);
            
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
            
            if (error.response?.status === 422) {
                // Handle validation errors
                const validationErrors = error.response.data.errors || {};
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
        { value: 'pending', label: 'Pending Approval' },
        { value: 'published', label: 'Published' },
        { value: 'closed', label: 'Closed' },
        { value: 'on_hold', label: 'On Hold' }
    ];
    
    return (
        <GlassDialog
            open={open}
            onClose={onClose}
            title={isEditing ? 'Edit Job Posting' : 'Add New Job Posting'}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Basic Information
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Job Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                fullWidth
                                error={!!errors.title}
                                helperText={errors.title}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.designation_id}>
                                <InputLabel>Designation</InputLabel>
                                <Select
                                    name="designation_id"
                                    value={formData.designation_id || ''}
                                    label="Designation"
                                    onChange={(e) => handleSelectChange('designation_id', e.target.value)}
                                    required
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                                                border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard?.boxShadow,
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>Select Designation</MenuItem>
                                    {designations.map((designation) => (
                                        <MenuItem key={designation.id} value={designation.id}>
                                            {designation.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.designation_id}</FormHelperText>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.department_id}>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    name="department_id"
                                    value={formData.department_id || ''}
                                    label="Department"
                                    onChange={(e) => handleSelectChange('department_id', e.target.value)}
                                    required
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                                                border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard?.boxShadow,
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>Select Department</MenuItem>
                                    {departments.map((department) => (
                                        <MenuItem key={department.id} value={department.id}>
                                            {department.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.department_id}</FormHelperText>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.job_type}>
                                <InputLabel>Job Type</InputLabel>
                                <Select
                                    name="job_type"
                                    value={formData.job_type}
                                    label="Job Type"
                                    onChange={(e) => handleSelectChange('job_type', e.target.value)}
                                    required
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                                                border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard?.boxShadow,
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {jobTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.job_type}</FormHelperText>
                            </FormControl>
                        </Grid>

                        {/* Location and Remote */}
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_remote}
                                        onChange={handleChange}
                                        name="is_remote"
                                    />
                                }
                                label="Remote Job"
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                fullWidth
                                disabled={formData.is_remote}
                                required={!formData.is_remote}
                                error={!!errors.location}
                                helperText={errors.location || (formData.is_remote ? "Not applicable for remote jobs" : "")}
                                placeholder={formData.is_remote ? "Not applicable for remote jobs" : "Enter job location"}
                            />
                        </Grid>

                        {/* Management and Counts */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.hiring_manager_id}>
                                <InputLabel>Hiring Manager</InputLabel>
                                <Select
                                    name="hiring_manager_id"
                                    value={formData.hiring_manager_id || ''}
                                    label="Hiring Manager"
                                    onChange={(e) => handleSelectChange('hiring_manager_id', e.target.value)}
                                    required
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                                                border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard?.boxShadow,
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>Select Hiring Manager</MenuItem>
                                    {managers.map((manager) => (
                                        <MenuItem key={manager.id} value={manager.id}>
                                            {manager.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.hiring_manager_id}</FormHelperText>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Number of Positions"
                                name="positions_count"
                                type="number"
                                value={formData.positions_count}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.positions_count}
                                helperText={errors.positions_count}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>

                        {/* Status and Dates */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={!!errors.status}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    label="Status"
                                    onChange={(e) => handleSelectChange('status', e.target.value)}
                                    required
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                                                border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard?.boxShadow,
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.status}</FormHelperText>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Posted Date"
                                name="posted_date"
                                type="date"
                                value={formData.posted_date}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.posted_date}
                                helperText={errors.posted_date}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Closing Date"
                                name="closing_date"
                                type="date"
                                value={formData.closing_date}
                                onChange={handleChange}
                                fullWidth
                                error={!!errors.closing_date}
                                helperText={errors.closing_date}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                label="Job Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                fullWidth
                                multiline
                                rows={4}
                                error={!!errors.description}
                                helperText={errors.description}
                                placeholder="Describe the job role, company culture, and what makes this position attractive..."
                            />
                        </Grid>

                        {/* Responsibilities */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Job Requirements
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                    Responsibilities
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        placeholder="Add responsibility"
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (itemType === 'responsibilities') handleAddItem();
                                            }
                                        }}
                                        size="small"
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setItemType('responsibilities');
                                            handleAddItem();
                                        }}
                                        disabled={!newItem.trim()}
                                        startIcon={<AddIcon />}
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
                                            deleteIcon={<ClearIcon />}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                                {errors.responsibilities && (
                                    <FormHelperText error>{errors.responsibilities}</FormHelperText>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                    Requirements
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        placeholder="Add requirement"
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (itemType === 'requirements') handleAddItem();
                                            }
                                        }}
                                        size="small"
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setItemType('requirements');
                                            handleAddItem();
                                        }}
                                        disabled={!newItem.trim()}
                                        startIcon={<AddIcon />}
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
                                            deleteIcon={<ClearIcon />}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                                {errors.requirements && (
                                    <FormHelperText error>{errors.requirements}</FormHelperText>
                                )}
                            </Box>
                        </Grid>

                        {/* Qualifications */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                    Qualifications
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        placeholder="Add qualification"
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (itemType === 'qualifications') handleAddItem();
                                            }
                                        }}
                                        size="small"
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setItemType('qualifications');
                                            handleAddItem();
                                        }}
                                        disabled={!newItem.trim()}
                                        startIcon={<AddIcon />}
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
                                            deleteIcon={<ClearIcon />}
                                            color="success"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Grid>

                        {/* Benefits */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                    Benefits
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        placeholder="Add benefit"
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (itemType === 'benefits') handleAddItem();
                                            }
                                        }}
                                        size="small"
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            setItemType('benefits');
                                            handleAddItem();
                                        }}
                                        disabled={!newItem.trim()}
                                        startIcon={<AddIcon />}
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
                                            deleteIcon={<ClearIcon />}
                                            color="warning"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Grid>

                        {/* Salary Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Compensation
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Minimum Salary"
                                name="salary_min"
                                type="number"
                                value={formData.salary_min}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: currencyOptions.find(c => c.value === formData.salary_currency)?.label.split(' ')[1] || '$'
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Maximum Salary"
                                name="salary_max"
                                type="number"
                                value={formData.salary_max}
                                onChange={handleChange}
                                fullWidth
                                error={!!errors.salary_max}
                                helperText={errors.salary_max}
                                InputProps={{
                                    startAdornment: currencyOptions.find(c => c.value === formData.salary_currency)?.label.split(' ')[1] || '$'
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Currency</InputLabel>
                                <Select
                                    name="salary_currency"
                                    value={formData.salary_currency}
                                    label="Currency"
                                    onChange={(e) => handleSelectChange('salary_currency', e.target.value)}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                background: theme.glassCard?.background || 'rgba(255, 255, 255, 0.1)',
                                                border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 2,
                                                boxShadow: theme.glassCard?.boxShadow,
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {currencyOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Additional Settings */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Additional Settings
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_internal}
                                        onChange={handleChange}
                                        name="is_internal"
                                    />
                                }
                                label="Internal Job Posting"
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_featured}
                                        onChange={handleChange}
                                        name="is_featured"
                                    />
                                }
                                label="Featured Job"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ padding: '16px', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={loading}
                        sx={{ borderRadius: '50px' }}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        type="submit"
                        variant="outlined"
                        color="primary"
                        loading={loading}
                        disabled={loading}
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
