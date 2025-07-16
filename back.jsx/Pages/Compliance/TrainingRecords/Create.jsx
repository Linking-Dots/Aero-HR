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
    Progress
} from "@heroui/react";
import { 
    AcademicCapIcon,
    ArrowLeftIcon,
    DocumentCheckIcon,
    UserIcon,
    CalendarDaysIcon,
    CertificateIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { parseDate } from '@internationalized/date';

const CreateTrainingRecord = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Form state
    const [formData, setFormData] = useState({
        user_id: '',
        training_name: '',
        training_type: 'compliance',
        training_provider: '',
        description: '',
        required: true,
        completion_status: 'not_started',
        completion_percentage: 0,
        start_date: null,
        target_completion_date: null,
        completion_date: null,
        certification_earned: false,
        certification_name: '',
        certification_expiry_date: null,
        training_hours: '',
        cost: '',
        notes: '',
        department: '',
        supervisor_approval_required: false
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);

    // Fetch users for selection
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

        // Auto-update completion status based on percentage
        if (field === 'completion_percentage') {
            const percentage = parseInt(value) || 0;
            let status = 'not_started';
            if (percentage === 0) status = 'not_started';
            else if (percentage < 100) status = 'in_progress';
            else if (percentage === 100) status = 'completed';
            
            setFormData(prev => ({
                ...prev,
                completion_status: status,
                completion_date: percentage === 100 ? new Date().toISOString().split('T')[0] : null
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
        
        if (!formData.user_id) {
            newErrors.user_id = 'Employee selection is required';
        }
        
        if (!formData.training_name.trim()) {
            newErrors.training_name = 'Training name is required';
        }
        
        if (!formData.training_type) {
            newErrors.training_type = 'Training type is required';
        }
        
        if (formData.start_date && formData.target_completion_date) {
            const startDate = new Date(formData.start_date);
            const targetDate = new Date(formData.target_completion_date);
            if (startDate >= targetDate) {
                newErrors.target_completion_date = 'Target completion date must be after start date';
            }
        }

        if (formData.certification_earned && !formData.certification_name.trim()) {
            newErrors.certification_name = 'Certification name is required when certification is earned';
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
            await axios.post('/api/compliance/training-records', formData);
            toast.success('Training record created successfully');
            router.visit('/compliance/training-records');
        } catch (error) {
            console.error('Error creating training record:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error('Failed to create training record');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.visit('/compliance/training-records');
    };

    return (
        <App title="Create Training Record">
            <Head title="Create Training Record" />
            
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Grow in timeout={300}>
                    <Box>
                        {/* Page Header */}
                        <PageHeader
                            title="Create Training Record"
                            subtitle="Add a new training compliance record"
                            icon={<AcademicCapIcon className="w-8 h-8" />}
                            actions={[
                                <Button
                                    key="back"
                                    variant="flat"
                                    startContent={<ArrowLeftIcon className="w-4 h-4" />}
                                    onPress={handleCancel}
                                >
                                    Back to Training Records
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
                                                Training Information
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6 space-y-4">
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <Select
                                                        label="Employee"
                                                        placeholder="Select employee"
                                                        selectedKeys={formData.user_id ? [formData.user_id.toString()] : []}
                                                        onSelectionChange={(keys) => handleInputChange('user_id', Array.from(keys)[0])}
                                                        isInvalid={!!errors.user_id}
                                                        errorMessage={errors.user_id}
                                                        isRequired
                                                        startContent={<UserIcon className="w-4 h-4" />}
                                                    >
                                                        {users.map((user) => (
                                                            <SelectItem key={user.id.toString()} value={user.id.toString()}>
                                                                {user.name} - {user.email}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Department"
                                                        placeholder="Employee department"
                                                        value={formData.department}
                                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <Input
                                                        label="Training Name"
                                                        placeholder="Enter training name/title"
                                                        value={formData.training_name}
                                                        onChange={(e) => handleInputChange('training_name', e.target.value)}
                                                        isInvalid={!!errors.training_name}
                                                        errorMessage={errors.training_name}
                                                        isRequired
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12} sm={6}>
                                                    <Select
                                                        label="Training Type"
                                                        placeholder="Select training type"
                                                        selectedKeys={[formData.training_type]}
                                                        onSelectionChange={(keys) => handleInputChange('training_type', Array.from(keys)[0])}
                                                        isInvalid={!!errors.training_type}
                                                        errorMessage={errors.training_type}
                                                        isRequired
                                                    >
                                                        <SelectItem key="compliance" value="compliance">Compliance</SelectItem>
                                                        <SelectItem key="safety" value="safety">Safety</SelectItem>
                                                        <SelectItem key="security" value="security">Security</SelectItem>
                                                        <SelectItem key="technical" value="technical">Technical</SelectItem>
                                                        <SelectItem key="leadership" value="leadership">Leadership</SelectItem>
                                                        <SelectItem key="soft_skills" value="soft_skills">Soft Skills</SelectItem>
                                                        <SelectItem key="mandatory" value="mandatory">Mandatory</SelectItem>
                                                    </Select>
                                                </Grid>
                                                
                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Training Provider"
                                                        placeholder="Training provider/organization"
                                                        value={formData.training_provider}
                                                        onChange={(e) => handleInputChange('training_provider', e.target.value)}
                                                    />
                                                </Grid>
                                                
                                                <Grid item xs={12}>
                                                    <Textarea
                                                        label="Description"
                                                        placeholder="Enter training description and objectives"
                                                        value={formData.description}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        minRows={3}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Training Hours"
                                                        placeholder="Total training hours"
                                                        type="number"
                                                        value={formData.training_hours}
                                                        onChange={(e) => handleInputChange('training_hours', e.target.value)}
                                                        endContent={<span className="text-gray-500">hours</span>}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Input
                                                        label="Cost"
                                                        placeholder="Training cost"
                                                        type="number"
                                                        value={formData.cost}
                                                        onChange={(e) => handleInputChange('cost', e.target.value)}
                                                        startContent={<span className="text-gray-500">$</span>}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Textarea
                                                        label="Notes"
                                                        placeholder="Additional notes or comments"
                                                        value={formData.notes}
                                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                                        minRows={2}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardBody>
                                    </GlassCard>
                                </Grid>

                                {/* Configuration & Progress */}
                                <Grid item xs={12} lg={4}>
                                    <GlassCard>
                                        <CardHeader className="flex-col items-start px-6 pb-4">
                                            <Typography variant="h6">
                                                Progress & Status
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6 space-y-4">
                                            <Select
                                                label="Completion Status"
                                                placeholder="Select status"
                                                selectedKeys={[formData.completion_status]}
                                                onSelectionChange={(keys) => handleInputChange('completion_status', Array.from(keys)[0])}
                                            >
                                                <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
                                                <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                                <SelectItem key="completed" value="completed">Completed</SelectItem>
                                                <SelectItem key="overdue" value="overdue">Overdue</SelectItem>
                                            </Select>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Typography variant="body2">Completion Percentage</Typography>
                                                    <Chip size="sm" variant="flat">{formData.completion_percentage}%</Chip>
                                                </div>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={formData.completion_percentage}
                                                    onChange={(e) => handleInputChange('completion_percentage', e.target.value)}
                                                    endContent={<span className="text-gray-500">%</span>}
                                                />
                                                <Progress 
                                                    value={formData.completion_percentage} 
                                                    color={formData.completion_percentage === 100 ? "success" : "primary"}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <Divider />

                                            {/* Date Configuration */}
                                            <DatePicker
                                                label="Start Date"
                                                value={formData.start_date ? parseDate(formData.start_date) : null}
                                                onChange={(date) => handleDateChange('start_date', date)}
                                                showMonthAndYearPickers
                                            />

                                            <DatePicker
                                                label="Target Completion Date"
                                                value={formData.target_completion_date ? parseDate(formData.target_completion_date) : null}
                                                onChange={(date) => handleDateChange('target_completion_date', date)}
                                                showMonthAndYearPickers
                                                isInvalid={!!errors.target_completion_date}
                                                errorMessage={errors.target_completion_date}
                                            />

                                            {formData.completion_status === 'completed' && (
                                                <DatePicker
                                                    label="Completion Date"
                                                    value={formData.completion_date ? parseDate(formData.completion_date) : null}
                                                    onChange={(date) => handleDateChange('completion_date', date)}
                                                    showMonthAndYearPickers
                                                />
                                            )}

                                            <Divider />

                                            {/* Training Configuration */}
                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2">
                                                    Required Training
                                                </Typography>
                                                <Switch
                                                    isSelected={formData.required}
                                                    onValueChange={(value) => handleInputChange('required', value)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2">
                                                    Supervisor Approval Required
                                                </Typography>
                                                <Switch
                                                    isSelected={formData.supervisor_approval_required}
                                                    onValueChange={(value) => handleInputChange('supervisor_approval_required', value)}
                                                />
                                            </div>
                                        </CardBody>
                                    </GlassCard>

                                    {/* Certification Section */}
                                    <GlassCard className="mt-4">
                                        <CardHeader className="flex-col items-start px-6 pb-4">
                                            <Typography variant="h6" className="flex items-center gap-2">
                                                <CertificateIcon className="w-5 h-5" />
                                                Certification
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2">
                                                    Certification Earned
                                                </Typography>
                                                <Switch
                                                    isSelected={formData.certification_earned}
                                                    onValueChange={(value) => handleInputChange('certification_earned', value)}
                                                />
                                            </div>

                                            {formData.certification_earned && (
                                                <>
                                                    <Input
                                                        label="Certification Name"
                                                        placeholder="Enter certification name"
                                                        value={formData.certification_name}
                                                        onChange={(e) => handleInputChange('certification_name', e.target.value)}
                                                        isInvalid={!!errors.certification_name}
                                                        errorMessage={errors.certification_name}
                                                        isRequired={formData.certification_earned}
                                                    />

                                                    <DatePicker
                                                        label="Certification Expiry Date"
                                                        value={formData.certification_expiry_date ? parseDate(formData.certification_expiry_date) : null}
                                                        onChange={(date) => handleDateChange('certification_expiry_date', date)}
                                                        showMonthAndYearPickers
                                                    />
                                                </>
                                            )}
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
                                                    {loading ? 'Creating...' : 'Create Training Record'}
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

export default CreateTrainingRecord;
