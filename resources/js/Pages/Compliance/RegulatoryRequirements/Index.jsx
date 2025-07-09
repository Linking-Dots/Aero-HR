import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
    Grid,
} from '@mui/material';
import { 
    Select, 
    SelectItem, 
    Card, 
    CardBody, 
    CardHeader,
    Divider,
    Chip,
    Button,
    Input,
    Spacer,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Progress
} from "@heroui/react";
import { 
    ScaleIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { 
    MagnifyingGlassIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegulatoryRequirementsIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [requirements, setRequirements] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRequirements: 0,
        activeRequirements: 0,
        pendingCompliance: 0,
        averageCompliance: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        regulatoryBody: 'all',
        category: 'all',
        priority: 'all',
        complianceStatus: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch requirements
    const fetchRequirements = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/compliance/regulatory-requirements', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });
            setRequirements(response.data.data);
            setTotalRows(response.data.total);
            setStatistics(response.data.statistics);
        } catch (error) {
            console.error('Error fetching regulatory requirements:', error);
            toast.error('Failed to load regulatory requirements');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const response = await axios.get('/api/compliance/regulatory-requirements/statistics');
            setStatistics(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchRequirements();
        fetchStatistics();
    }, [fetchRequirements, fetchStatistics]);

    // Filter changes
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    }, []);

    // Pagination
    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page
        }));
    }, []);

    // Actions
    const handleView = (requirement) => {
        router.visit(`/compliance/regulatory-requirements/${requirement.id}`);
    };

    const handleEdit = (requirement) => {
        router.visit(`/compliance/regulatory-requirements/${requirement.id}/edit`);
    };

    const handleDelete = async (requirement) => {
        if (window.confirm('Are you sure you want to delete this regulatory requirement?')) {
            try {
                await axios.delete(`/api/compliance/regulatory-requirements/${requirement.id}`);
                toast.success('Regulatory requirement deleted successfully');
                fetchRequirements();
            } catch (error) {
                console.error('Error deleting requirement:', error);
                toast.error('Failed to delete regulatory requirement');
            }
        }
    };

    const handleComplianceUpdate = async (requirement, complianceStatus) => {
        try {
            await axios.patch(`/api/compliance/regulatory-requirements/${requirement.id}`, {
                compliance_status: complianceStatus
            });
            toast.success('Compliance status updated successfully');
            fetchRequirements();
        } catch (error) {
            console.error('Error updating compliance status:', error);
            toast.error('Failed to update compliance status');
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/compliance/regulatory-requirements/export', {
                params: filters,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'regulatory_requirements.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting requirements:', error);
            toast.error('Failed to export requirements');
        }
    };

    // Status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'inactive': return 'danger';
            default: return 'default';
        }
    };

    const getComplianceStatusColor = (status) => {
        switch (status) {
            case 'compliant': return 'success';
            case 'non_compliant': return 'danger';
            case 'partial': return 'warning';
            case 'under_review': return 'primary';
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

    // Statistics cards
    const statsCards = [
        {
            title: 'Total Requirements',
            value: statistics.totalRequirements,
            icon: <ScaleIcon className="w-6 h-6" />,
            color: 'primary',
            description: 'All regulatory requirements'
        },
        {
            title: 'Active Requirements',
            value: statistics.activeRequirements,
            icon: <CheckCircleIcon className="w-6 h-6" />,
            color: 'success',
            description: 'Currently active requirements'
        },
        {
            title: 'Pending Compliance',
            value: statistics.pendingCompliance,
            icon: <ClockIcon className="w-6 h-6" />,
            color: 'warning',
            description: 'Awaiting compliance review'
        },
        {
            title: 'Average Compliance',
            value: `${statistics.averageCompliance}%`,
            icon: <ChartBarIcon className="w-6 h-6" />,
            color: 'info',
            description: 'Overall compliance rate'
        }
    ];

    // Memoized filtered requirements
    const filteredRequirements = useMemo(() => {
        return requirements.filter(requirement => {
            const matchesSearch = !filters.search || 
                requirement.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                requirement.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                requirement.regulatory_body.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchesStatus = filters.status === 'all' || requirement.status === filters.status;
            const matchesBody = filters.regulatoryBody === 'all' || requirement.regulatory_body === filters.regulatoryBody;
            const matchesCategory = filters.category === 'all' || requirement.category === filters.category;
            const matchesPriority = filters.priority === 'all' || requirement.priority === filters.priority;
            const matchesCompliance = filters.complianceStatus === 'all' || requirement.compliance_status === filters.complianceStatus;
            
            return matchesSearch && matchesStatus && matchesBody && matchesCategory && matchesPriority && matchesCompliance;
        });
    }, [requirements, filters]);

    if (loading && requirements.length === 0) {
        return (
            <App title="Regulatory Requirements">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </App>
        );
    }

    return (
        <App title="Regulatory Requirements">
            <Head title="Regulatory Requirements" />
            
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Grow in timeout={300}>
                    <Box>
                        {/* Page Header */}
                        <PageHeader
                            title="Regulatory Requirements"
                            subtitle="Manage regulatory compliance requirements and monitoring"
                            icon={<ScaleIcon className="w-8 h-8" />}
                            actions={[
                                <Button
                                    key="export"
                                    variant="flat"
                                    color="primary"
                                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                                    onPress={handleExport}
                                >
                                    Export
                                </Button>,
                                <Button
                                    key="add"
                                    color="primary"
                                    startContent={<PlusIcon className="w-4 h-4" />}
                                    onPress={() => router.visit('/compliance/regulatory-requirements/create')}
                                >
                                    Add Requirement
                                </Button>
                            ]}
                        />

                        {/* Statistics Cards */}
                        <Box sx={{ mb: 3 }}>
                            <StatsCards cards={statsCards} />
                        </Box>

                        {/* Filters */}
                        <GlassCard className="mb-6">
                            <CardHeader className="flex-col items-start px-4 pb-2">
                                <Typography variant="h6" className="flex items-center gap-2">
                                    <FunnelIcon className="w-5 h-5" />
                                    Filters
                                </Typography>
                            </CardHeader>
                            <CardBody className="px-4">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Input
                                            placeholder="Search requirements..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                            clearable
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Status"
                                            value={filters.status}
                                            onChange={(value) => handleFilterChange('status', value)}
                                        >
                                            <SelectItem key="all" value="all">All Status</SelectItem>
                                            <SelectItem key="active" value="active">Active</SelectItem>
                                            <SelectItem key="pending" value="pending">Pending</SelectItem>
                                            <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Regulatory Body"
                                            value={filters.regulatoryBody}
                                            onChange={(value) => handleFilterChange('regulatoryBody', value)}
                                        >
                                            <SelectItem key="all" value="all">All Bodies</SelectItem>
                                            <SelectItem key="SEC" value="SEC">SEC</SelectItem>
                                            <SelectItem key="GDPR" value="GDPR">GDPR</SelectItem>
                                            <SelectItem key="SOX" value="SOX">SOX</SelectItem>
                                            <SelectItem key="ISO" value="ISO">ISO</SelectItem>
                                            <SelectItem key="HIPAA" value="HIPAA">HIPAA</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Select
                                            placeholder="Priority"
                                            value={filters.priority}
                                            onChange={(value) => handleFilterChange('priority', value)}
                                        >
                                            <SelectItem key="all" value="all">All Priorities</SelectItem>
                                            <SelectItem key="critical" value="critical">Critical</SelectItem>
                                            <SelectItem key="high" value="high">High</SelectItem>
                                            <SelectItem key="medium" value="medium">Medium</SelectItem>
                                            <SelectItem key="low" value="low">Low</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Select
                                            placeholder="Compliance Status"
                                            value={filters.complianceStatus}
                                            onChange={(value) => handleFilterChange('complianceStatus', value)}
                                        >
                                            <SelectItem key="all" value="all">All Compliance</SelectItem>
                                            <SelectItem key="compliant" value="compliant">Compliant</SelectItem>
                                            <SelectItem key="non_compliant" value="non_compliant">Non-Compliant</SelectItem>
                                            <SelectItem key="partial" value="partial">Partial</SelectItem>
                                            <SelectItem key="under_review" value="under_review">Under Review</SelectItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            </CardBody>
                        </GlassCard>

                        {/* Requirements Table */}
                        <GlassCard>
                            <CardHeader className="flex justify-between items-center px-4 pb-2">
                                <Typography variant="h6">
                                    Regulatory Requirements ({totalRows})
                                </Typography>
                                <Chip color="primary" size="sm">
                                    {filteredRequirements.length} shown
                                </Chip>
                            </CardHeader>
                            <CardBody className="px-0">
                                <Table
                                    aria-label="Regulatory requirements table"
                                    classNames={{
                                        wrapper: "min-h-[200px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>REQUIREMENT</TableColumn>
                                        <TableColumn>REGULATORY BODY</TableColumn>
                                        <TableColumn>CATEGORY</TableColumn>
                                        <TableColumn>PRIORITY</TableColumn>
                                        <TableColumn>COMPLIANCE STATUS</TableColumn>
                                        <TableColumn>DEADLINE</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No regulatory requirements found" isLoading={loading}>
                                        {filteredRequirements.map((requirement) => (
                                            <TableRow key={requirement.id}>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="semibold">
                                                            {requirement.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {requirement.description.substring(0, 100)}...
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color="primary"
                                                        size="sm"
                                                        variant="flat"
                                                        startContent={<GlobeAltIcon className="w-3 h-3" />}
                                                    >
                                                        {requirement.regulatory_body}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {requirement.category || 'General'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getPriorityColor(requirement.priority)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {requirement.priority}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Box className="flex items-center gap-2">
                                                        <Chip
                                                            color={getComplianceStatusColor(requirement.compliance_status)}
                                                            size="sm"
                                                            variant="flat"
                                                        >
                                                            {requirement.compliance_status?.replace('_', ' ')}
                                                        </Chip>
                                                        {requirement.compliance_percentage && (
                                                            <Progress
                                                                value={requirement.compliance_percentage}
                                                                className="w-16"
                                                                color={getComplianceStatusColor(requirement.compliance_status)}
                                                                size="sm"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box className="flex items-center gap-1">
                                                        <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                                                        <Typography variant="caption">
                                                            {requirement.deadline ? dayjs(requirement.deadline).format('MMM DD, YYYY') : 'No deadline'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(requirement.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {requirement.status}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                variant="light"
                                                                size="sm"
                                                                isIconOnly
                                                            >
                                                                <EllipsisVerticalIcon className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu>
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                                onPress={() => handleView(requirement)}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="edit"
                                                                startContent={<PencilIcon className="w-4 h-4" />}
                                                                onPress={() => handleEdit(requirement)}
                                                            >
                                                                Edit
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="compliant"
                                                                startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                onPress={() => handleComplianceUpdate(requirement, 'compliant')}
                                                            >
                                                                Mark Compliant
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="non_compliant"
                                                                startContent={<XCircleIcon className="w-4 h-4" />}
                                                                onPress={() => handleComplianceUpdate(requirement, 'non_compliant')}
                                                            >
                                                                Mark Non-Compliant
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                color="danger"
                                                                startContent={<DocumentTextIcon className="w-4 h-4" />}
                                                                onPress={() => handleDelete(requirement)}
                                                            >
                                                                Delete
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                                {totalRows > pagination.perPage && (
                                    <Box className="flex justify-center mt-4 pb-4">
                                        <Pagination
                                            total={Math.ceil(totalRows / pagination.perPage)}
                                            page={pagination.currentPage}
                                            onChange={handlePageChange}
                                            showControls
                                            showShadow
                                            color="primary"
                                        />
                                    </Box>
                                )}
                            </CardBody>
                        </GlassCard>
                    </Box>
                </Grow>
            </Box>
        </App>
    );
};

export default RegulatoryRequirementsIndex;
