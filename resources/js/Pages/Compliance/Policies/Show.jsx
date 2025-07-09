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
    Chip,
    Avatar,
    Progress,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tabs,
    Tab,
    Badge,
    User
} from "@heroui/react";
import { 
    DocumentTextIcon,
    ArrowLeftIcon,
    PencilIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserGroupIcon,
    CalendarDaysIcon,
    DocumentDuplicateIcon,
    ChartBarIcon,
    ShareIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';

const ShowPolicy = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Get policy ID from URL
    const pathSegments = window.location.pathname.split('/');
    const policyId = pathSegments[pathSegments.length - 1];

    // State management
    const [loading, setLoading] = useState(true);
    const [policy, setPolicy] = useState(null);
    const [acknowledgments, setAcknowledgments] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch policy details
    useEffect(() => {
        const fetchPolicyDetails = async () => {
            setLoading(true);
            try {
                const [policyResponse, acknowledgementsResponse, statsResponse] = await Promise.all([
                    axios.get(`/api/compliance/policies/${policyId}`),
                    axios.get(`/api/compliance/policies/${policyId}/acknowledgments`),
                    axios.get(`/api/compliance/policies/${policyId}/statistics`)
                ]);

                setPolicy(policyResponse.data.data);
                setAcknowledgments(acknowledgementsResponse.data.data || []);
                setStatistics(statsResponse.data || {});
            } catch (error) {
                console.error('Error fetching policy details:', error);
                toast.error('Failed to load policy details');
                router.visit('/compliance/policies');
            } finally {
                setLoading(false);
            }
        };

        if (policyId) {
            fetchPolicyDetails();
        }
    }, [policyId]);

    // Handle acknowledgment
    const handleAcknowledge = async () => {
        try {
            await axios.post(`/api/compliance/policies/${policyId}/acknowledge`);
            toast.success('Policy acknowledged successfully');
            // Refresh acknowledgments
            const response = await axios.get(`/api/compliance/policies/${policyId}/acknowledgments`);
            setAcknowledgments(response.data.data || []);
        } catch (error) {
            console.error('Error acknowledging policy:', error);
            toast.error('Failed to acknowledge policy');
        }
    };

    // Handle policy actions
    const handleEdit = () => {
        router.visit(`/compliance/policies/${policyId}/edit`);
    };

    const handleBack = () => {
        router.visit('/compliance/policies');
    };

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'default';
            case 'under_review': return 'warning';
            case 'pending_approval': return 'primary';
            case 'active': return 'success';
            case 'expired': return 'danger';
            case 'archived': return 'secondary';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return 'primary';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <App title="Policy Details">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <div>Loading policy details...</div>
                </Box>
            </App>
        );
    }

    if (!policy) {
        return (
            <App title="Policy Not Found">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <div>Policy not found</div>
                </Box>
            </App>
        );
    }

    // Check if current user has acknowledged the policy
    const currentUserAcknowledgment = acknowledgments.find(ack => ack.user_id === auth?.user?.id);
    const hasAcknowledged = !!currentUserAcknowledgment;

    return (
        <App title={`Policy: ${policy.title}`}>
            <Head title={`Policy: ${policy.title}`} />
            
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Grow in timeout={300}>
                    <Box>
                        {/* Page Header */}
                        <PageHeader
                            title={policy.title}
                            subtitle={`Version ${policy.version} • ${policy.category} Policy`}
                            icon={<DocumentTextIcon className="w-8 h-8" />}
                            actions={[
                                <Button
                                    key="back"
                                    variant="flat"
                                    startContent={<ArrowLeftIcon className="w-4 h-4" />}
                                    onPress={handleBack}
                                >
                                    Back to Policies
                                </Button>,
                                <Button
                                    key="edit"
                                    color="primary"
                                    variant="flat"
                                    startContent={<PencilIcon className="w-4 h-4" />}
                                    onPress={handleEdit}
                                >
                                    Edit Policy
                                </Button>,
                                !hasAcknowledged && policy.acknowledgment_required && (
                                    <Button
                                        key="acknowledge"
                                        color="success"
                                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                                        onPress={handleAcknowledge}
                                    >
                                        Acknowledge
                                    </Button>
                                )
                            ].filter(Boolean)}
                        />

                        {/* Main Content */}
                        <Grid container spacing={3}>
                            {/* Policy Information */}
                            <Grid item xs={12} lg={8}>
                                <Tabs 
                                    selectedKey={activeTab} 
                                    onSelectionChange={setActiveTab}
                                    className="mb-4"
                                >
                                    <Tab key="overview" title="Overview" />
                                    <Tab key="content" title="Policy Content" />
                                    <Tab key="acknowledgments" title="Acknowledgments" />
                                    <Tab key="history" title="History" />
                                </Tabs>

                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <GlassCard>
                                        <CardHeader className="flex-col items-start px-6 pb-4">
                                            <Typography variant="h6">
                                                Policy Overview
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6 space-y-4">
                                            <div>
                                                <Typography variant="body2" color="text.secondary" className="mb-2">
                                                    Description
                                                </Typography>
                                                <Typography variant="body1">
                                                    {policy.description}
                                                </Typography>
                                            </div>

                                            <Divider />

                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <div>
                                                        <Typography variant="body2" color="text.secondary" className="mb-1">
                                                            Target Audience
                                                        </Typography>
                                                        <Chip color="primary" variant="flat">
                                                            {policy.target_audience?.replace('_', ' ')}
                                                        </Chip>
                                                    </div>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <div>
                                                        <Typography variant="body2" color="text.secondary" className="mb-1">
                                                            Policy Owner
                                                        </Typography>
                                                        <User
                                                            name={policy.owner?.name || 'Unassigned'}
                                                            description={policy.owner?.email}
                                                            avatarProps={{
                                                                src: policy.owner?.avatar,
                                                                size: "sm"
                                                            }}
                                                        />
                                                    </div>
                                                </Grid>

                                                {policy.tags && policy.tags.length > 0 && (
                                                    <Grid item xs={12}>
                                                        <div>
                                                            <Typography variant="body2" color="text.secondary" className="mb-2">
                                                                Tags
                                                            </Typography>
                                                            <div className="flex flex-wrap gap-2">
                                                                {policy.tags.map((tag, index) => (
                                                                    <Chip key={index} size="sm" variant="flat">
                                                                        {tag}
                                                                    </Chip>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Grid>
                                                )}
                                            </Grid>

                                            <Divider />

                                            {/* Important Dates */}
                                            <div>
                                                <Typography variant="body2" color="text.secondary" className="mb-3">
                                                    Important Dates
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={4}>
                                                        <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                            <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                                            <Typography variant="caption" color="text.secondary">
                                                                Effective Date
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {policy.effective_date ? dayjs(policy.effective_date).format('MMM DD, YYYY') : 'Not set'}
                                                            </Typography>
                                                        </div>
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                            <ClockIcon className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                                                            <Typography variant="caption" color="text.secondary">
                                                                Review Date
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {policy.review_date ? dayjs(policy.review_date).format('MMM DD, YYYY') : 'Not set'}
                                                            </Typography>
                                                        </div>
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                            <XCircleIcon className="w-6 h-6 mx-auto mb-2 text-red-500" />
                                                            <Typography variant="caption" color="text.secondary">
                                                                Expiry Date
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {policy.expiry_date ? dayjs(policy.expiry_date).format('MMM DD, YYYY') : 'No expiry'}
                                                            </Typography>
                                                        </div>
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {/* Content Tab */}
                                {activeTab === 'content' && (
                                    <GlassCard>
                                        <CardHeader className="flex-col items-start px-6 pb-4">
                                            <Typography variant="h6">
                                                Policy Content
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6">
                                            <div className="prose max-w-none">
                                                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                                                    {policy.content}
                                                </Typography>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {/* Acknowledgments Tab */}
                                {activeTab === 'acknowledgments' && (
                                    <GlassCard>
                                        <CardHeader className="flex justify-between items-center px-6 pb-4">
                                            <Typography variant="h6">
                                                Policy Acknowledgments
                                            </Typography>
                                            <Chip color="primary" size="sm">
                                                {acknowledgments.length} acknowledgments
                                            </Chip>
                                        </CardHeader>
                                        <CardBody className="px-0">
                                            <Table aria-label="Policy acknowledgments table">
                                                <TableHeader>
                                                    <TableColumn>EMPLOYEE</TableColumn>
                                                    <TableColumn>ACKNOWLEDGED DATE</TableColumn>
                                                    <TableColumn>STATUS</TableColumn>
                                                </TableHeader>
                                                <TableBody emptyContent="No acknowledgments yet">
                                                    {acknowledgments.map((ack) => (
                                                        <TableRow key={ack.id}>
                                                            <TableCell>
                                                                <User
                                                                    name={ack.user?.name}
                                                                    description={ack.user?.email}
                                                                    avatarProps={{
                                                                        src: ack.user?.avatar,
                                                                        size: "sm"
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {dayjs(ack.acknowledged_at).format('MMM DD, YYYY HH:mm')}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip color="success" size="sm" variant="flat">
                                                                    Acknowledged
                                                                </Chip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {/* History Tab */}
                                {activeTab === 'history' && (
                                    <GlassCard>
                                        <CardHeader className="flex-col items-start px-6 pb-4">
                                            <Typography variant="h6">
                                                Policy History
                                            </Typography>
                                        </CardHeader>
                                        <CardBody className="px-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                                                    <DocumentDuplicateIcon className="w-5 h-5 text-blue-500 mt-1" />
                                                    <div>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            Policy Created
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {dayjs(policy.created_at).format('MMM DD, YYYY HH:mm')}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                
                                                {policy.updated_at !== policy.created_at && (
                                                    <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                                                        <PencilIcon className="w-5 h-5 text-orange-500 mt-1" />
                                                        <div>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                Last Updated
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {dayjs(policy.updated_at).format('MMM DD, YYYY HH:mm')}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                )}
                            </Grid>

                            {/* Sidebar */}
                            <Grid item xs={12} lg={4}>
                                {/* Status Card */}
                                <GlassCard className="mb-4">
                                    <CardHeader className="flex-col items-start px-6 pb-4">
                                        <Typography variant="h6">
                                            Policy Status
                                        </Typography>
                                    </CardHeader>
                                    <CardBody className="px-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2">Status</Typography>
                                            <Chip color={getStatusColor(policy.status)} variant="flat">
                                                {policy.status?.replace('_', ' ')}
                                            </Chip>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2">Priority</Typography>
                                            <Chip color={getPriorityColor(policy.priority)} variant="flat">
                                                {policy.priority}
                                            </Chip>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2">Category</Typography>
                                            <Chip color="secondary" variant="flat">
                                                {policy.category}
                                            </Chip>
                                        </div>

                                        {hasAcknowledged && (
                                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <div>
                                                    <Typography variant="body2" fontWeight="medium" className="text-green-700">
                                                        You have acknowledged this policy
                                                    </Typography>
                                                    <Typography variant="caption" className="text-green-600">
                                                        {dayjs(currentUserAcknowledgment?.acknowledged_at).format('MMM DD, YYYY')}
                                                    </Typography>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </GlassCard>

                                {/* Statistics Card */}
                                <GlassCard>
                                    <CardHeader className="flex-col items-start px-6 pb-4">
                                        <Typography variant="h6" className="flex items-center gap-2">
                                            <ChartBarIcon className="w-5 h-5" />
                                            Statistics
                                        </Typography>
                                    </CardHeader>
                                    <CardBody className="px-6 space-y-4">
                                        <div className="text-center p-3 border border-gray-200 rounded-lg">
                                            <Typography variant="h4" fontWeight="bold" color="primary">
                                                {statistics.acknowledgment_rate || 0}%
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Acknowledgment Rate
                                            </Typography>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                <Typography variant="h6" fontWeight="bold">
                                                    {statistics.total_employees || 0}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Total Employees
                                                </Typography>
                                            </div>
                                            <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                <Typography variant="h6" fontWeight="bold">
                                                    {statistics.acknowledged_count || 0}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Acknowledged
                                                </Typography>
                                            </div>
                                        </div>

                                        {statistics.acknowledgment_rate !== undefined && (
                                            <Progress 
                                                value={statistics.acknowledgment_rate} 
                                                color={statistics.acknowledgment_rate >= 80 ? "success" : statistics.acknowledgment_rate >= 50 ? "warning" : "danger"}
                                                className="mt-3"
                                            />
                                        )}
                                    </CardBody>
                                </GlassCard>
                            </Grid>
                        </Grid>
                    </Box>
                </Grow>
            </Box>
        </App>
    );
};

export default ShowPolicy;
