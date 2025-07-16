import React, { useState, useCallback } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Divider,
    Chip,
    Spacer,
    User,
    DatePicker,
    Switch,
    Progress,
    CheckboxGroup,
    Checkbox
} from "@heroui/react";
import { 
    ShieldExclamationIcon,
    ArrowLeftIcon,
    PlusIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    TagIcon,
    BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const CreateAudit = ({ 
    users = [], 
    departments = [], 
    audit_types = [], 
    compliance_areas = [],
    risk_levels = []
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAuditors, setSelectedAuditors] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        audit_type_id: '',
        department_id: '',
        lead_auditor_id: '',
        scheduled_date: dayjs().add(1, 'week').format('YYYY-MM-DD'),
        estimated_duration: '4', // hours
        objective: '',
        scope: '',
        criteria: '',
        methodology: '',
        risk_level: 'medium',
        compliance_areas: [],
        auditor_ids: [],
        preparation_checklist: '',
        special_requirements: '',
        notification_date: dayjs().format('YYYY-MM-DD'),
        status: 'planned',
        is_internal: true,
        requires_certification: false,
        budget_allocated: '',
        priority: 'medium'
    });

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = {
            ...data,
            auditor_ids: selectedAuditors,
            compliance_areas: selectedAreas
        };

        post(route('compliance.audits.store'), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Audit scheduled successfully');
                reset();
                setSelectedAuditors([]);
                setSelectedAreas([]);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Please check the form for errors');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    }, [data, selectedAuditors, selectedAreas, post, reset]);

    const goBack = () => {
        router.visit(route('compliance.audits.index'));
    };

    const auditTypeOptions = [
        { id: 'internal', name: 'Internal Audit' },
        { id: 'external', name: 'External Audit' },
        { id: 'compliance', name: 'Compliance Audit' },
        { id: 'financial', name: 'Financial Audit' },
        { id: 'operational', name: 'Operational Audit' },
        { id: 'quality', name: 'Quality Audit' },
        { id: 'safety', name: 'Safety Audit' },
        { id: 'environmental', name: 'Environmental Audit' }
    ];

    const riskLevelOptions = [
        { key: 'low', label: 'Low Risk', color: 'success' },
        { key: 'medium', label: 'Medium Risk', color: 'warning' },
        { key: 'high', label: 'High Risk', color: 'danger' },
        { key: 'critical', label: 'Critical Risk', color: 'danger' }
    ];

    const priorityOptions = [
        { key: 'low', label: 'Low Priority', color: 'default' },
        { key: 'medium', label: 'Medium Priority', color: 'warning' },
        { key: 'high', label: 'High Priority', color: 'danger' },
        { key: 'urgent', label: 'Urgent', color: 'danger' }
    ];

    return (
        <App>
            <Head title="Schedule New Audit - Compliance Management" />
            
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <PageHeader
                    title="Schedule New Audit"
                    subtitle="Plan and schedule a new compliance audit"
                    icon={ShieldExclamationIcon}
                    breadcrumbs={[
                        { label: 'Compliance', href: route('compliance.dashboard') },
                        { label: 'Audits', href: route('compliance.audits.index') },
                        { label: 'Schedule', href: '#' }
                    ]}
                    actions={
                        <Button
                            color="default"
                            variant="flat"
                            startContent={<ArrowLeftIcon className="w-4 h-4" />}
                            onPress={goBack}
                        >
                            Back to Audits
                        </Button>
                    }
                />

                <Grow in timeout={800}>
                    <Box>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Form */}
                                <div className="lg:col-span-2 space-y-6">
                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Audit Information</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Audit Title"
                                                    placeholder="Enter audit title"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    isInvalid={!!errors.title}
                                                    errorMessage={errors.title}
                                                    isRequired
                                                />
                                                <Select
                                                    label="Audit Type"
                                                    placeholder="Select audit type"
                                                    selectedKeys={data.audit_type_id ? [data.audit_type_id] : []}
                                                    onSelectionChange={(keys) => setData('audit_type_id', Array.from(keys)[0] || '')}
                                                    isInvalid={!!errors.audit_type_id}
                                                    errorMessage={errors.audit_type_id}
                                                    isRequired
                                                >
                                                    {auditTypeOptions.map((type) => (
                                                        <SelectItem key={type.id} value={type.id}>
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Select
                                                    label="Department"
                                                    placeholder="Select department"
                                                    selectedKeys={data.department_id ? [data.department_id] : []}
                                                    onSelectionChange={(keys) => setData('department_id', Array.from(keys)[0] || '')}
                                                    isInvalid={!!errors.department_id}
                                                    errorMessage={errors.department_id}
                                                    isRequired
                                                >
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                                <Select
                                                    label="Lead Auditor"
                                                    placeholder="Select lead auditor"
                                                    selectedKeys={data.lead_auditor_id ? [data.lead_auditor_id] : []}
                                                    onSelectionChange={(keys) => setData('lead_auditor_id', Array.from(keys)[0] || '')}
                                                    isInvalid={!!errors.lead_auditor_id}
                                                    errorMessage={errors.lead_auditor_id}
                                                    isRequired
                                                >
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>

                                            <Textarea
                                                label="Audit Objective"
                                                placeholder="Describe the main objectives and goals of this audit"
                                                value={data.objective}
                                                onChange={(e) => setData('objective', e.target.value)}
                                                isInvalid={!!errors.objective}
                                                errorMessage={errors.objective}
                                                minRows={3}
                                                isRequired
                                            />

                                            <Textarea
                                                label="Audit Scope"
                                                placeholder="Define what areas, processes, or systems will be audited"
                                                value={data.scope}
                                                onChange={(e) => setData('scope', e.target.value)}
                                                isInvalid={!!errors.scope}
                                                errorMessage={errors.scope}
                                                minRows={3}
                                                isRequired
                                            />

                                            <Textarea
                                                label="Audit Criteria"
                                                placeholder="Specify the standards, regulations, or policies against which the audit will be conducted"
                                                value={data.criteria}
                                                onChange={(e) => setData('criteria', e.target.value)}
                                                isInvalid={!!errors.criteria}
                                                errorMessage={errors.criteria}
                                                minRows={3}
                                            />

                                            <Textarea
                                                label="Methodology"
                                                placeholder="Describe the audit methodology and approach"
                                                value={data.methodology}
                                                onChange={(e) => setData('methodology', e.target.value)}
                                                isInvalid={!!errors.methodology}
                                                errorMessage={errors.methodology}
                                                minRows={3}
                                            />
                                        </CardBody>
                                    </GlassCard>

                                    {/* Additional Requirements */}
                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Additional Requirements</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <Textarea
                                                label="Preparation Checklist"
                                                placeholder="List items that need to be prepared before the audit"
                                                value={data.preparation_checklist}
                                                onChange={(e) => setData('preparation_checklist', e.target.value)}
                                                isInvalid={!!errors.preparation_checklist}
                                                errorMessage={errors.preparation_checklist}
                                                minRows={4}
                                            />

                                            <Textarea
                                                label="Special Requirements"
                                                placeholder="Any special requirements, equipment, or considerations"
                                                value={data.special_requirements}
                                                onChange={(e) => setData('special_requirements', e.target.value)}
                                                isInvalid={!!errors.special_requirements}
                                                errorMessage={errors.special_requirements}
                                                minRows={3}
                                            />

                                            {/* Compliance Areas */}
                                            <div>
                                                <Typography variant="body2" className="font-medium mb-2">
                                                    Compliance Areas to Audit
                                                </Typography>
                                                <CheckboxGroup
                                                    value={selectedAreas}
                                                    onValueChange={setSelectedAreas}
                                                    orientation="horizontal"
                                                    className="gap-4"
                                                >
                                                    {compliance_areas.map((area) => (
                                                        <Checkbox key={area.id} value={area.id.toString()}>
                                                            {area.name}
                                                        </Checkbox>
                                                    ))}
                                                </CheckboxGroup>
                                            </div>

                                            {/* Additional Auditors */}
                                            <div>
                                                <Typography variant="body2" className="font-medium mb-2">
                                                    Additional Auditors
                                                </Typography>
                                                <CheckboxGroup
                                                    value={selectedAuditors}
                                                    onValueChange={setSelectedAuditors}
                                                    orientation="horizontal"
                                                    className="gap-4"
                                                >
                                                    {users.filter(user => user.id.toString() !== data.lead_auditor_id).map((user) => (
                                                        <Checkbox key={user.id} value={user.id.toString()}>
                                                            {user.name}
                                                        </Checkbox>
                                                    ))}
                                                </CheckboxGroup>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Schedule & Timing</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <Input
                                                type="date"
                                                label="Scheduled Date"
                                                value={data.scheduled_date}
                                                onChange={(e) => setData('scheduled_date', e.target.value)}
                                                isInvalid={!!errors.scheduled_date}
                                                errorMessage={errors.scheduled_date}
                                                isRequired
                                            />

                                            <Input
                                                type="number"
                                                label="Estimated Duration (hours)"
                                                placeholder="4"
                                                value={data.estimated_duration}
                                                onChange={(e) => setData('estimated_duration', e.target.value)}
                                                isInvalid={!!errors.estimated_duration}
                                                errorMessage={errors.estimated_duration}
                                                min="1"
                                                max="40"
                                            />

                                            <Input
                                                type="date"
                                                label="Notification Date"
                                                value={data.notification_date}
                                                onChange={(e) => setData('notification_date', e.target.value)}
                                                isInvalid={!!errors.notification_date}
                                                errorMessage={errors.notification_date}
                                                description="When stakeholders should be notified"
                                            />
                                        </CardBody>
                                    </GlassCard>

                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <ExclamationTriangleIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Risk & Priority</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <Select
                                                label="Risk Level"
                                                placeholder="Select risk level"
                                                selectedKeys={[data.risk_level]}
                                                onSelectionChange={(keys) => setData('risk_level', Array.from(keys)[0] || 'medium')}
                                                isInvalid={!!errors.risk_level}
                                                errorMessage={errors.risk_level}
                                            >
                                                {riskLevelOptions.map((level) => (
                                                    <SelectItem key={level.key} value={level.key}>
                                                        <div className="flex items-center gap-2">
                                                            <Chip size="sm" color={level.color} variant="flat">
                                                                {level.label}
                                                            </Chip>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <Select
                                                label="Priority"
                                                placeholder="Select priority"
                                                selectedKeys={[data.priority]}
                                                onSelectionChange={(keys) => setData('priority', Array.from(keys)[0] || 'medium')}
                                                isInvalid={!!errors.priority}
                                                errorMessage={errors.priority}
                                            >
                                                {priorityOptions.map((priority) => (
                                                    <SelectItem key={priority.key} value={priority.key}>
                                                        <div className="flex items-center gap-2">
                                                            <Chip size="sm" color={priority.color} variant="flat">
                                                                {priority.label}
                                                            </Chip>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <Input
                                                type="number"
                                                label="Budget Allocated"
                                                placeholder="0.00"
                                                value={data.budget_allocated}
                                                onChange={(e) => setData('budget_allocated', e.target.value)}
                                                isInvalid={!!errors.budget_allocated}
                                                errorMessage={errors.budget_allocated}
                                                startContent={<span className="text-default-400">$</span>}
                                            />
                                        </CardBody>
                                    </GlassCard>

                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Audit Settings</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        Internal Audit
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        Conducted by internal team
                                                    </Typography>
                                                </div>
                                                <Switch
                                                    isSelected={data.is_internal}
                                                    onValueChange={(checked) => setData('is_internal', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        Requires Certification
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        Audit requires certification
                                                    </Typography>
                                                </div>
                                                <Switch
                                                    isSelected={data.requires_certification}
                                                    onValueChange={(checked) => setData('requires_certification', checked)}
                                                />
                                            </div>
                                        </CardBody>
                                    </GlassCard>

                                    {/* Submit Actions */}
                                    <GlassCard>
                                        <CardBody>
                                            <div className="space-y-3">
                                                <Button
                                                    color="primary"
                                                    size="lg"
                                                    className="w-full"
                                                    type="submit"
                                                    isLoading={isSubmitting || processing}
                                                    startContent={!isSubmitting && !processing && <ClipboardDocumentListIcon className="w-4 h-4" />}
                                                >
                                                    {isSubmitting || processing ? 'Scheduling Audit...' : 'Schedule Audit'}
                                                </Button>
                                                <Button
                                                    color="default"
                                                    variant="flat"
                                                    size="lg"
                                                    className="w-full"
                                                    onPress={goBack}
                                                    isDisabled={isSubmitting || processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                </div>
                            </div>
                        </form>
                    </Box>
                </Grow>
            </Box>
        </App>
    );
};

export default CreateAudit;
