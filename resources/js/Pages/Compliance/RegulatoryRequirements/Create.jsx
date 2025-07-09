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
    Chip
} from "@heroui/react";
import { 
    ScaleIcon,
    ArrowLeftIcon,
    DocumentCheckIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { parseDate } from '@internationalized/date';

const CreateRegulatoryRequirement = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        regulatory_body: '',
        requirement_number: '',
        category: 'general',
        priority: 'medium',
        compliance_status: 'under_review',
        deadline: null,
        evidence_required: '',
        responsible_person: '',
        review_frequency: 'annually',
        status: 'active'
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            deadline: date ? date.toString() : null
        }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        
        if (!formData.regulatory_body.trim()) {
            newErrors.regulatory_body = 'Regulatory body is required';
        }
        
        if (!formData.requirement_number.trim()) {
            newErrors.requirement_number = 'Requirement number is required';
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
            await axios.post('/api/compliance/regulatory-requirements', formData);
            toast.success('Regulatory requirement created successfully');
            router.visit('/compliance/regulatory-requirements');
        } catch (error) {
            console.error('Error creating regulatory requirement:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error('Failed to create regulatory requirement');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.visit('/compliance/regulatory-requirements');
    };

    return (
        <App title="Create Regulatory Requirement">
            <Head title="Create Regulatory Requirement" />
            
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Grow in timeout={300}>
                    <Box>
                        {/* Page Header */}
                        <PageHeader
                            title="Create Regulatory Requirement"
                            subtitle="Add a new regulatory compliance requirement"
                            icon={<ScaleIcon className="w-8 h-8" />}
                            actions={[
                                <Button
                                    key="back"
                                    variant="flat"
                                    startContent={<ArrowLeftIcon className="w-4 h-4" />}
                                    onPress={handleCancel}
                                >
                                    Back to Requirements
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
                                                        label="Requirement Title"
                                                        placeholder="Enter requirement title"
                                                        value={formData.title}
                                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                                        isInvalid={!!errors.title}
                                                        errorMessage={errors.title}
                                                        isRequired
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Regulatory Body"
                                                        placeholder="e.g., SEC, GDPR, SOX"
                                                        value={formData.regulatory_body}
                                                        onChange={(e) => handleInputChange('regulatory_body', e.target.value)}
                                                        isInvalid={!!errors.regulatory_body}
                                                        errorMessage={errors.regulatory_body}
                                                        isRequired
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Requirement Number"
                                                        placeholder="e.g., REQ-001, SOX-404"
                                                        value={formData.requirement_number}
                                                        onChange={(e) => handleInputChange('requirement_number', e.target.value)}
                                                        isInvalid={!!errors.requirement_number}
                                                        errorMessage={errors.requirement_number}
                                                        isRequired
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <Textarea
                                                        label="Description"
                                                        placeholder="Enter detailed description of the requirement"
                                                        value={formData.description}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        isInvalid={!!errors.description}
                                                        errorMessage={errors.description}
                                                        minRows={4}
                                                        isRequired
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <Textarea
                                                        label="Evidence Required"
                                                        placeholder="Describe what evidence is needed to demonstrate compliance"
                                                        value={formData.evidence_required}
                                                        onChange={(e) => handleInputChange('evidence_required', e.target.value)}
                                                        minRows={3}
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
                                                <SelectItem key="financial" value="financial">Financial</SelectItem>
                                                <SelectItem key="data_protection" value="data_protection">Data Protection</SelectItem>
                                                <SelectItem key="safety" value="safety">Safety</SelectItem>
                                                <SelectItem key="environmental" value="environmental">Environmental</SelectItem>
                                                <SelectItem key="quality" value="quality">Quality</SelectItem>
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
                                                label="Compliance Status"
                                                placeholder="Select compliance status"
                                                selectedKeys={[formData.compliance_status]}
                                                onSelectionChange={(keys) => handleInputChange('compliance_status', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="compliant" value="compliant">Compliant</SelectItem>
                                                <SelectItem key="non_compliant" value="non_compliant">Non-Compliant</SelectItem>
                                                <SelectItem key="partial" value="partial">Partial</SelectItem>
                                                <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                            </Select>

                                            <DatePicker
                                                label="Compliance Deadline"
                                                value={formData.deadline ? parseDate(formData.deadline) : null}
                                                onChange={handleDateChange}
                                                showMonthAndYearPickers
                                            />

                                            <Input
                                                label="Responsible Person"
                                                placeholder="Enter responsible person"
                                                value={formData.responsible_person}
                                                onChange={(e) => handleInputChange('responsible_person', e.target.value)}
                                            />

                                            <Select
                                                label="Review Frequency"
                                                placeholder="Select review frequency"
                                                selectedKeys={[formData.review_frequency]}
                                                onSelectionChange={(keys) => handleInputChange('review_frequency', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                                                <SelectItem key="quarterly" value="quarterly">Quarterly</SelectItem>
                                                <SelectItem key="semi_annually" value="semi_annually">Semi-Annually</SelectItem>
                                                <SelectItem key="annually" value="annually">Annually</SelectItem>
                                                <SelectItem key="biannually" value="biannually">Biannually</SelectItem>
                                            </Select>

                                            <Select
                                                label="Status"
                                                placeholder="Select status"
                                                selectedKeys={[formData.status]}
                                                onSelectionChange={(keys) => handleInputChange('status', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="active" value="active">Active</SelectItem>
                                                <SelectItem key="pending" value="pending">Pending</SelectItem>
                                                <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                                            </Select>
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
                                                    color="primary"
                                                    type="submit"
                                                    isLoading={loading}
                                                    startContent={!loading ? <DocumentCheckIcon className="w-4 h-4" /> : null}
                                                >
                                                    {loading ? 'Creating...' : 'Create Requirement'}
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

export default CreateRegulatoryRequirement;
