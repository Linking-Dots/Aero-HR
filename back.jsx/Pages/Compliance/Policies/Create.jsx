import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    Grow,
    useTheme,
    useMediaQuery,
    Grid,
} from '@mui/material';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Divider,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    DatePicker,
    Chip,
    Switch,
    Avatar,
    User
} from "@heroui/react";
import { 
    DocumentTextIcon,
    ArrowLeftIcon,
    DocumentCheckIcon,
    UserGroupIcon,
    CalendarDaysIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { parseDate } from '@internationalized/date';

const CreatePolicy = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: 'general',
        priority: 'medium',
        status: 'draft',
        effective_date: null,
        review_date: null,
        expiry_date: null,
        version: '1.0',
        approval_required: true,
        acknowledgment_required: true,
        target_audience: 'all',
        tags: '',
        owner_id: auth?.user?.id || null
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);

    // Fetch users for owner selection
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users');
                setUsers(response.data.data || []);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Handle date change
    const handleDateChange = (field, date) => {
        setFormData(prev => ({
            ...prev,
            [field]: date ? date.toString() : null
        }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Policy title is required';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Policy description is required';
        }
        
        if (!formData.content.trim()) {
            newErrors.content = 'Policy content is required';
        }
        
        if (formData.effective_date && formData.expiry_date) {
            const effectiveDate = new Date(formData.effective_date);
            const expiryDate = new Date(formData.expiry_date);
            if (effectiveDate >= expiryDate) {
                newErrors.expiry_date = 'Expiry date must be after effective date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/compliance/policies', {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            });
            toast.success('Policy created successfully');
            router.visit('/compliance/policies');
        } catch (error) {
            console.error('Error creating policy:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error('Failed to create policy');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.visit('/compliance/policies');
    };

    return (
        <App title="Create Policy">
            <Head title="Create Policy" />
            
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Grow in timeout={300}>
                    <Box>
                        {/* Page Header */}
                        <PageHeader
                            title="Create Policy"
                            subtitle="Add a new compliance policy"
                            icon={<DocumentTextIcon className="w-8 h-8" />}
                            actions={[
                                <Button
                                    key="back"
                                    variant="flat"
                                    startContent={<ArrowLeftIcon className="w-4 h-4" />}
                                    onPress={handleCancel}
                                >
                                    Back to Policies
                                </Button>
                            ]}
                        />

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Basic Information */}
                                <Grid item xs={12} lg={8}>
                                    <GlassCard>
                                        <CardHeader className="flex-col items-start px-6 pb-4">
                                            <Typography variant="h6" className="flex items-center gap-2">
                                                <DocumentCheckIcon className="w-5 h-5" />
                                                Basic Information
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6 space-y-4">
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <Input
                                                        label="Policy Title"
                                                        placeholder="Enter policy title"
                                                        value={formData.title}
                                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                                        isInvalid={!!errors.title}
                                                        errorMessage={errors.title}
                                                        isRequired
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Version"
                                                        placeholder="e.g., 1.0, 2.1"
                                                        value={formData.version}
                                                        onChange={(e) => handleInputChange('version', e.target.value)}
                                                        isInvalid={!!errors.version}
                                                        errorMessage={errors.version}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Tags"
                                                        placeholder="e.g., security, hr, finance (comma separated)"
                                                        value={formData.tags}
                                                        onChange={(e) => handleInputChange('tags', e.target.value)}
                                                        description="Separate tags with commas"
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <Textarea
                                                        label="Description"
                                                        placeholder="Enter brief description of the policy"
                                                        value={formData.description}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        isInvalid={!!errors.description}
                                                        errorMessage={errors.description}
                                                        minRows={3}
                                                        isRequired
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <Textarea
                                                        label="Policy Content"
                                                        placeholder="Enter the full policy content, procedures, and guidelines"
                                                        value={formData.content}
                                                        onChange={(e) => handleInputChange('content', e.target.value)}
                                                        isInvalid={!!errors.content}
                                                        errorMessage={errors.content}
                                                        minRows={8}
                                                        isRequired
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardBody>
                                    </GlassCard>
                                </Grid>

                                {/* Configuration */}
                                <Grid item xs={12} lg={4}>
                                    <GlassCard>
                                        <CardHeader className="flex-col items-start px-6 pb-4">
                                            <Typography variant="h6">
                                                Configuration
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6 space-y-4">
                                            <Select
                                                label="Category"
                                                placeholder="Select category"
                                                selectedKeys={[formData.category]}
                                                onSelectionChange={(keys) => handleInputChange('category', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="general" value="general">General</SelectItem>
                                                <SelectItem key="hr" value="hr">Human Resources</SelectItem>
                                                <SelectItem key="finance" value="finance">Finance</SelectItem>
                                                <SelectItem key="security" value="security">Security</SelectItem>
                                                <SelectItem key="safety" value="safety">Safety</SelectItem>
                                                <SelectItem key="quality" value="quality">Quality</SelectItem>
                                                <SelectItem key="it" value="it">Information Technology</SelectItem>
                                            </Select>

                                            <Select
                                                label="Priority"
                                                placeholder="Select priority"
                                                selectedKeys={[formData.priority]}
                                                onSelectionChange={(keys) => handleInputChange('priority', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="critical" value="critical">Critical</SelectItem>
                                                <SelectItem key="high" value="high">High</SelectItem>
                                                <SelectItem key="medium" value="medium">Medium</SelectItem>
                                                <SelectItem key="low" value="low">Low</SelectItem>
                                            </Select>

                                            <Select
                                                label="Status"
                                                placeholder="Select status"
                                                selectedKeys={[formData.status]}
                                                onSelectionChange={(keys) => handleInputChange('status', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="draft" value="draft">Draft</SelectItem>
                                                <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                                <SelectItem key="pending_approval" value="pending_approval">Pending Approval</SelectItem>
                                                <SelectItem key="active" value="active">Active</SelectItem>
                                            </Select>

                                            <Select
                                                label="Target Audience"
                                                placeholder="Select target audience"
                                                selectedKeys={[formData.target_audience]}
                                                onSelectionChange={(keys) => handleInputChange('target_audience', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="all" value="all">All Employees</SelectItem>
                                                <SelectItem key="management" value="management">Management</SelectItem>
                                                <SelectItem key="hr" value="hr">HR Department</SelectItem>
                                                <SelectItem key="finance" value="finance">Finance Department</SelectItem>
                                                <SelectItem key="it" value="it">IT Department</SelectItem>
                                                <SelectItem key="sales" value="sales">Sales Team</SelectItem>
                                            </Select>

                                            <Select
                                                label="Policy Owner"
                                                placeholder="Select policy owner"
                                                selectedKeys={formData.owner_id ? [formData.owner_id.toString()] : []}
                                                onSelectionChange={(keys) => handleInputChange('owner_id', Array.from(keys)[0])}
                                            >
                                                {users.map((user) => (
                                                    <SelectItem key={user.id.toString()} value={user.id.toString()}>
                                                        {user.name} - {user.email}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <Divider />

                                            {/* Date Configuration */}
                                            <DatePicker
                                                label="Effective Date"
                                                value={formData.effective_date ? parseDate(formData.effective_date) : null}
                                                onChange={(date) => handleDateChange('effective_date', date)}
                                                showMonthAndYearPickers
                                            />

                                            <DatePicker
                                                label="Review Date"
                                                value={formData.review_date ? parseDate(formData.review_date) : null}
                                                onChange={(date) => handleDateChange('review_date', date)}
                                                showMonthAndYearPickers
                                            />

                                            <DatePicker
                                                label="Expiry Date"
                                                value={formData.expiry_date ? parseDate(formData.expiry_date) : null}
                                                onChange={(date) => handleDateChange('expiry_date', date)}
                                                showMonthAndYearPickers
                                                isInvalid={!!errors.expiry_date}
                                                errorMessage={errors.expiry_date}
                                            />

                                            <Divider />

                                            {/* Workflow Configuration */}
                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2">
                                                    Approval Required
                                                </Typography>
                                                <Switch
                                                    isSelected={formData.approval_required}
                                                    onValueChange={(value) => handleInputChange('approval_required', value)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2">
                                                    Acknowledgment Required
                                                </Typography>
                                                <Switch
                                                    isSelected={formData.acknowledgment_required}
                                                    onValueChange={(value) => handleInputChange('acknowledgment_required', value)}
                                                />
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                </Grid>

                                {/* Form Actions */}
                                <Grid item xs={12}>
                                    <GlassCard>
                                        <CardBody className="px-6 py-4">
                                            <Box className="flex gap-3 justify-end">
                                                <Button
                                                    variant="flat"
                                                    onPress={handleCancel}
                                                    isDisabled={loading}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    color="secondary"
                                                    variant="flat"
                                                    type="submit"
                                                    isDisabled={loading}
                                                    onPress={() => handleInputChange('status', 'draft')}
                                                >
                                                    Save as Draft
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    isLoading={loading}
                                                    startContent={!loading ? <DocumentCheckIcon className="w-4 h-4" /> : null}
                                                >
                                                    {loading ? 'Creating...' : 'Create Policy'}
                                                </Button>
                                            </Box>
                                        </CardBody>
                                    </GlassCard>
                                </Grid>
                            </Grid>
                        </form>
                    </Box>
                </Grow>
            </Box>
        </App>
    );
};

export default CreatePolicy;
