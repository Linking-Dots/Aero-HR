import React, { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
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
    Chip,
    Divider,
    User,
    Progress,
    Badge,
    Tabs,
    Tab,
    Avatar,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Listbox,
    ListboxItem
} from "@heroui/react";
import { 
    ShieldExclamationIcon,
    ArrowLeftIcon,
    PencilIcon,
    PlayIcon,
    PauseIcon,
    CheckCircleIcon,
    XMarkIcon,
    ClockIcon,
    UserIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    DocumentChartBarIcon,
    UsersIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    PrinterIcon,
    ShareIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ShowAudit = ({ 
    audit, 
    findings = [], 
    audit_team = [], 
    timeline = [],
    can_edit = false, 
    can_manage = false 
}) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [activeTab, setActiveTab] = useState('overview');
    const [isUpdating, setIsUpdating] = useState(false);
    const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();
    const { isOpen: isCompleteOpen, onOpen: onCompleteOpen, onClose: onCompleteClose } = useDisclosure();

    const goBack = () => {
        router.visit(route('compliance.audits.index'));
    };

    const goToEdit = () => {
        router.visit(route('compliance.audits.edit', audit.id));
    };

    const handleStatusChange = useCallback(async (newStatus) => {
        setIsUpdating(true);
        try {
            await router.patch(route('compliance.audits.update-status', audit.id), {
                status: newStatus
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Audit status updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update audit status');
                }
            });
        } catch (error) {
            toast.error('An error occurred while updating status');
        }
        setIsUpdating(false);
        onStatusClose();
    }, [audit.id, onStatusClose]);

    const handleStartAudit = () => {
        handleStatusChange('in_progress');
    };

    const handleCompleteAudit = () => {
        handleStatusChange('completed');
        onCompleteClose();
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'planned': 'default',
            'in_progress': 'primary',
            'on_hold': 'warning',
            'completed': 'success',
            'cancelled': 'danger',
            'draft': 'default'
        };
        return statusColors[status] || 'default';
    };

    const getRiskLevelColor = (level) => {
        const colors = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger',
            'critical': 'danger'
        };
        return colors[level] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'default',
            'medium': 'warning',
            'high': 'danger',
            'urgent': 'danger'
        };
        return colors[priority] || 'default';
    };

    const getFindingSeverityColor = (severity) => {
        const colors = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger',
            'critical': 'danger'
        };
        return colors[severity] || 'default';
    };

    const getProgressPercentage = () => {
        if (audit.status === 'completed') return 100;
        if (audit.status === 'in_progress') return 65;
        if (audit.status === 'planned') return 25;
        return 0;
    };

    const getDaysUntilScheduled = () => {
        return dayjs(audit.scheduled_date).diff(dayjs(), 'day');
    };

    const statusOptions = [
        { key: 'planned', label: 'Planned', color: 'default' },
        { key: 'in_progress', label: 'In Progress', color: 'primary' },
        { key: 'on_hold', label: 'On Hold', color: 'warning' },
        { key: 'completed', label: 'Completed', color: 'success' },
        { key: 'cancelled', label: 'Cancelled', color: 'danger' }
    ];

    return (
        <App>
            <Head title={`${audit.title} - Audit Details`} />
            
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <PageHeader
                    title={audit.title}
                    subtitle={`${audit.audit_type} • ${audit.department?.name || 'All Departments'}`}
                    icon={ShieldExclamationIcon}
                    breadcrumbs={[
                        { label: 'Compliance', href: route('compliance.dashboard') },
                        { label: 'Audits', href: route('compliance.audits.index') },
                        { label: audit.title, href: '#' }
                    ]}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="default"
                                variant="flat"
                                startContent={<PrinterIcon className="w-4 h-4" />}
                                size="sm"
                            >
                                Print
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<ShareIcon className="w-4 h-4" />}
                                size="sm"
                            >
                                Share
                            </Button>
                            {can_manage && audit.status === 'planned' && (
                                <Button
                                    color="success"
                                    startContent={<PlayIcon className="w-4 h-4" />}
                                    onPress={handleStartAudit}
                                    size="sm"
                                    isLoading={isUpdating}
                                >
                                    Start Audit
                                </Button>
                            )}
                            {can_manage && audit.status === 'in_progress' && (
                                <Button
                                    color="primary"
                                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                                    onPress={onCompleteOpen}
                                    size="sm"
                                >
                                    Mark Complete
                                </Button>
                            )}
                            {can_edit && (
                                <Button
                                    color="primary"
                                    startContent={<PencilIcon className="w-4 h-4" />}
                                    onPress={goToEdit}
                                    size="sm"
                                >
                                    Edit
                                </Button>
                            )}
                            <Button
                                color="default"
                                variant="flat"
                                startContent={<ArrowLeftIcon className="w-4 h-4" />}
                                onPress={goBack}
                                size="sm"
                            >
                                Back
                            </Button>
                        </div>
                    }
                />

                <Grow in timeout={800}>
                    <Box>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Status Progress */}
                                <GlassCard>
                                    <CardBody>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Typography variant="h6">Audit Progress</Typography>
                                                <Chip 
                                                    color={getStatusColor(audit.status)} 
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {audit.status?.replace('_', ' ').toUpperCase()}
                                                </Chip>
                                            </div>
                                            {can_manage && (
                                                <Button
                                                    color="primary"
                                                    variant="flat"
                                                    size="sm"
                                                    onPress={onStatusOpen}
                                                >
                                                    Update Status
                                                </Button>
                                            )}
                                        </div>
                                        <Progress 
                                            value={getProgressPercentage()} 
                                            color={getStatusColor(audit.status)}
                                            className="mb-2"
                                        />
                                        <Typography variant="body2" className="text-default-600">
                                            {getProgressPercentage()}% Complete
                                        </Typography>
                                    </CardBody>
                                </GlassCard>

                                {/* Tabs */}
                                <GlassCard>
                                    <CardBody className="p-0">
                                        <Tabs
                                            selectedKey={activeTab}
                                            onSelectionChange={setActiveTab}
                                            variant="underlined"
                                            classNames={{
                                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                                cursor: "w-full bg-primary",
                                                tab: "max-w-fit px-6 h-12",
                                                tabContent: "group-data-[selected=true]:text-primary"
                                            }}
                                        >
                                            <Tab key="overview" title="Overview" />
                                            <Tab key="team" title={`Team (${audit_team.length})`} />
                                            <Tab key="findings" title={`Findings (${findings.length})`} />
                                            <Tab key="timeline" title={`Timeline (${timeline.length})`} />
                                        </Tabs>
                                    </CardBody>
                                </GlassCard>

                                {/* Tab Content */}
                                {activeTab === 'overview' && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Audit Overview</Typography>
                                        </CardHeader>
                                        <CardBody className="space-y-6">
                                            <div>
                                                <Typography variant="body2" className="font-medium mb-2">
                                                    Objective
                                                </Typography>
                                                <Typography variant="body2" className="text-default-600">
                                                    {audit.objective}
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant="body2" className="font-medium mb-2">
                                                    Scope
                                                </Typography>
                                                <Typography variant="body2" className="text-default-600">
                                                    {audit.scope}
                                                </Typography>
                                            </div>

                                            {audit.criteria && (
                                                <div>
                                                    <Typography variant="body2" className="font-medium mb-2">
                                                        Criteria
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-600">
                                                        {audit.criteria}
                                                    </Typography>
                                                </div>
                                            )}

                                            {audit.methodology && (
                                                <div>
                                                    <Typography variant="body2" className="font-medium mb-2">
                                                        Methodology
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-600">
                                                        {audit.methodology}
                                                    </Typography>
                                                </div>
                                            )}

                                            {audit.preparation_checklist && (
                                                <div>
                                                    <Typography variant="body2" className="font-medium mb-2">
                                                        Preparation Checklist
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-600 whitespace-pre-wrap">
                                                        {audit.preparation_checklist}
                                                    </Typography>
                                                </div>
                                            )}

                                            {audit.special_requirements && (
                                                <div>
                                                    <Typography variant="body2" className="font-medium mb-2">
                                                        Special Requirements
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-600">
                                                        {audit.special_requirements}
                                                    </Typography>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {activeTab === 'team' && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Audit Team</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            {audit_team.length > 0 ? (
                                                <div className="space-y-4">
                                                    {audit_team.map((member, index) => (
                                                        <div key={member.id} className="flex items-center gap-4 p-4 bg-default-50 rounded-lg">
                                                            <Avatar
                                                                size="md"
                                                                name={member.name}
                                                                src={member.avatar}
                                                            />
                                                            <div className="flex-1">
                                                                <Typography variant="body2" className="font-medium">
                                                                    {member.name}
                                                                </Typography>
                                                                <Typography variant="body2" className="text-default-600">
                                                                    {member.role || 'Auditor'}
                                                                </Typography>
                                                                <Typography variant="body2" className="text-default-500 text-xs">
                                                                    {member.department?.name}
                                                                </Typography>
                                                            </div>
                                                            {member.is_lead && (
                                                                <Chip size="sm" color="primary" variant="flat">
                                                                    Lead Auditor
                                                                </Chip>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <UsersIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                                                    <Typography variant="body2" className="text-default-500">
                                                        No team members assigned
                                                    </Typography>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {activeTab === 'findings' && (
                                    <GlassCard>
                                        <CardHeader className="flex justify-between">
                                            <Typography variant="h6">Audit Findings</Typography>
                                            {can_manage && (
                                                <Button
                                                    color="primary"
                                                    size="sm"
                                                    startContent={<DocumentTextIcon className="w-4 h-4" />}
                                                >
                                                    Add Finding
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardBody>
                                            {findings.length > 0 ? (
                                                <div className="space-y-4">
                                                    {findings.map((finding, index) => (
                                                        <div key={finding.id} className="border border-divider rounded-lg p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Typography variant="body2" className="font-medium">
                                                                        {finding.title}
                                                                    </Typography>
                                                                    <Chip 
                                                                        size="sm" 
                                                                        color={getFindingSeverityColor(finding.severity)}
                                                                        variant="flat"
                                                                    >
                                                                        {finding.severity?.toUpperCase()}
                                                                    </Chip>
                                                                </div>
                                                                <Typography variant="body2" className="text-default-500 text-xs">
                                                                    {dayjs(finding.identified_date).format('MMM DD, YYYY')}
                                                                </Typography>
                                                            </div>
                                                            <Typography variant="body2" className="text-default-600 mb-2">
                                                                {finding.description}
                                                            </Typography>
                                                            {finding.recommendation && (
                                                                <div className="p-3 bg-default-100 rounded-lg">
                                                                    <Typography variant="body2" className="text-default-700">
                                                                        <strong>Recommendation:</strong> {finding.recommendation}
                                                                    </Typography>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                                                    <Typography variant="body2" className="text-default-500">
                                                        No findings recorded yet
                                                    </Typography>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {activeTab === 'timeline' && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Audit Timeline</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            {timeline.length > 0 ? (
                                                <div className="space-y-4">
                                                    {timeline.map((event, index) => (
                                                        <div key={event.id} className="flex items-start gap-4 pb-4 border-b border-divider last:border-b-0">
                                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                                                <ClockIcon className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Typography variant="body2" className="font-medium">
                                                                        {event.title}
                                                                    </Typography>
                                                                    <Chip size="sm" variant="flat">
                                                                        {event.type}
                                                                    </Chip>
                                                                </div>
                                                                <Typography variant="body2" className="text-default-600 mb-1">
                                                                    {event.description}
                                                                </Typography>
                                                                <Typography variant="body2" className="text-default-500 text-xs">
                                                                    {event.created_by?.name} • {dayjs(event.created_at).fromNow()}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <ClockIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                                                    <Typography variant="body2" className="text-default-500">
                                                        No timeline events recorded
                                                    </Typography>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Audit Info */}
                                <GlassCard>
                                    <CardHeader>
                                        <Typography variant="h6">Audit Information</Typography>
                                    </CardHeader>
                                    <CardBody className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Type
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {audit.audit_type?.replace('_', ' ').toUpperCase()}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Risk Level
                                            </Typography>
                                            <Chip 
                                                color={getRiskLevelColor(audit.risk_level)} 
                                                variant="flat"
                                                size="sm"
                                            >
                                                {audit.risk_level?.toUpperCase()}
                                            </Chip>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Priority
                                            </Typography>
                                            <Chip 
                                                color={getPriorityColor(audit.priority)} 
                                                variant="flat"
                                                size="sm"
                                            >
                                                {audit.priority?.toUpperCase()}
                                            </Chip>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Duration
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {audit.estimated_duration} hours
                                            </Typography>
                                        </div>

                                        {audit.budget_allocated && (
                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2" className="text-default-600">
                                                    Budget
                                                </Typography>
                                                <Typography variant="body2" className="font-medium">
                                                    ${audit.budget_allocated}
                                                </Typography>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Internal
                                            </Typography>
                                            <Chip 
                                                color={audit.is_internal ? 'success' : 'warning'} 
                                                variant="flat"
                                                size="sm"
                                            >
                                                {audit.is_internal ? 'Yes' : 'No'}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                </GlassCard>

                                {/* Schedule */}
                                <GlassCard>
                                    <CardHeader>
                                        <Typography variant="h6">Schedule</Typography>
                                    </CardHeader>
                                    <CardBody className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Scheduled Date
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {dayjs(audit.scheduled_date).format('MMM DD, YYYY')}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Days Until
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {getDaysUntilScheduled()} days
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Notification Date
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {dayjs(audit.notification_date).format('MMM DD, YYYY')}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Created
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {dayjs(audit.created_at).format('MMM DD, YYYY')}
                                            </Typography>
                                        </div>
                                    </CardBody>
                                </GlassCard>

                                {/* Lead Auditor */}
                                {audit.lead_auditor && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Lead Auditor</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    size="md"
                                                    name={audit.lead_auditor.name}
                                                    src={audit.lead_auditor.avatar}
                                                />
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        {audit.lead_auditor.name}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        {audit.lead_auditor.department?.name}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {/* Department */}
                                {audit.department && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Department</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        {audit.department.name}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        Target Department
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                )}
                            </div>
                        </div>
                    </Box>
                </Grow>

                {/* Status Update Modal */}
                <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md">
                    <ModalContent>
                        <ModalHeader>
                            Update Audit Status
                        </ModalHeader>
                        <ModalBody>
                            <Typography variant="body2" className="mb-4">
                                Change the status of this audit:
                            </Typography>
                            <Listbox
                                selectionMode="single"
                                selectedKeys={[audit.status]}
                                onSelectionChange={(keys) => {
                                    const selectedStatus = Array.from(keys)[0];
                                    handleStatusChange(selectedStatus);
                                }}
                            >
                                {statusOptions.map((option) => (
                                    <ListboxItem key={option.key} textValue={option.label}>
                                        <div className="flex items-center gap-2">
                                            <Chip size="sm" color={option.color} variant="flat">
                                                {option.label}
                                            </Chip>
                                        </div>
                                    </ListboxItem>
                                ))}
                            </Listbox>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="flat" onPress={onStatusClose}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Complete Audit Modal */}
                <Modal isOpen={isCompleteOpen} onClose={onCompleteClose} size="md">
                    <ModalContent>
                        <ModalHeader>
                            Complete Audit
                        </ModalHeader>
                        <ModalBody>
                            <Typography variant="body2" className="mb-4">
                                Are you sure you want to mark this audit as completed?
                            </Typography>
                            <Typography variant="body2" className="text-default-600">
                                This will finalize the audit and generate the completion report.
                            </Typography>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="flat" onPress={onCompleteClose}>
                                Cancel
                            </Button>
                            <Button 
                                color="success" 
                                onPress={handleCompleteAudit}
                                isLoading={isUpdating}
                            >
                                Complete Audit
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </App>
    );
};

export default ShowAudit;
