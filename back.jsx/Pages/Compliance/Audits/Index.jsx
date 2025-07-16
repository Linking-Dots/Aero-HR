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
    ShieldCheckIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PlayIcon,
    PauseIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
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

const AuditManagementIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [audits, setAudits] = useState([]);
    const [statistics, setStatistics] = useState({
        totalAudits: 0,
        plannedAudits: 0,
        inProgressAudits: 0,
        completedAudits: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        audit_type: 'all',
        scope: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch audits
    const fetchAudits = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/compliance/audits', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setAudits(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching audits:', error);
            toast.error('Failed to fetch audits');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    useEffect(() => {
        fetchAudits();
    }, [fetchAudits]);

    // Filter handlers
    const handleFilterChange = useCallback((filterKey, filterValue) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: filterValue
        }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    }, []);

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'planned': return 'warning';
            case 'in_progress': return 'primary';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            case 'postponed': return 'secondary';
            default: return 'default';
        }
    };

    // Audit type color mapping
    const getAuditTypeColor = (type) => {
        switch (type) {
            case 'internal': return 'primary';
            case 'external': return 'secondary';
            case 'regulatory': return 'warning';
            case 'certification': return 'success';
            default: return 'default';
        }
    };

    // Priority color mapping
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'critical': return 'danger';
            default: return 'default';
        }
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Audits',
            value: statistics.totalAudits,
            icon: ShieldCheckIcon,
            color: 'primary',
            trend: '+10%'
        },
        {
            title: 'Planned Audits',
            value: statistics.plannedAudits,
            icon: ClockIcon,
            color: 'warning',
            trend: '+5%'
        },
        {
            title: 'In Progress',
            value: statistics.inProgressAudits,
            icon: PlayIcon,
            color: 'primary',
            trend: '+15%'
        },
        {
            title: 'Completed',
            value: statistics.completedAudits,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+20%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, audit) => {
        switch (action) {
            case 'view':
                router.visit(`/compliance/audits/${audit.id}`);
                break;
            case 'edit':
                router.visit(`/compliance/audits/${audit.id}/edit`);
                break;
            case 'start':
                handleStartAudit(audit.id);
                break;
            case 'complete':
                handleCompleteAudit(audit.id);
                break;
            case 'postpone':
                handlePostponeAudit(audit.id);
                break;
            case 'cancel':
                handleCancelAudit(audit.id);
                break;
            case 'findings':
                router.visit(`/compliance/audits/${audit.id}/findings`);
                break;
            case 'report':
                router.visit(`/compliance/audits/${audit.id}/report`);
                break;
        }
    };

    const handleStartAudit = async (id) => {
        try {
            await axios.post(`/api/compliance/audits/${id}/start`);
            toast.success('Audit started successfully');
            fetchAudits();
        } catch (error) {
            toast.error('Failed to start audit');
        }
    };

    const handleCompleteAudit = async (id) => {
        try {
            await axios.post(`/api/compliance/audits/${id}/complete`);
            toast.success('Audit completed successfully');
            fetchAudits();
        } catch (error) {
            toast.error('Failed to complete audit');
        }
    };

    const handlePostponeAudit = async (id) => {
        try {
            await axios.post(`/api/compliance/audits/${id}/postpone`);
            toast.success('Audit postponed');
            fetchAudits();
        } catch (error) {
            toast.error('Failed to postpone audit');
        }
    };

    const handleCancelAudit = async (id) => {
        try {
            await axios.post(`/api/compliance/audits/${id}/cancel`);
            toast.success('Audit cancelled');
            fetchAudits();
        } catch (error) {
            toast.error('Failed to cancel audit');
        }
    };

    return (
        <App>
            <Head title="Audit Management - Compliance Management" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Audit Management"
                    subtitle="Plan, execute, and track compliance audits"
                    icon={ShieldCheckIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<DocumentTextIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/audits/findings')}
                            >
                                All Findings
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/audits/create')}
                            >
                                Plan New Audit
                            </Button>
                        </div>
                    }
                />

                <Box sx={{ p: 3 }}>
                    {/* Statistics Cards */}
                    <StatsCards data={statsData} />

                    <Spacer y={6} />

                    {/* Filters */}
                    <GlassCard className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <Input
                                placeholder="Search audits..."
                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="flex-1"
                            />
                            
                            <Select
                                placeholder="Status"
                                selectedKeys={[filters.status]}
                                onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Status</SelectItem>
                                <SelectItem key="planned">Planned</SelectItem>
                                <SelectItem key="in_progress">In Progress</SelectItem>
                                <SelectItem key="completed">Completed</SelectItem>
                                <SelectItem key="cancelled">Cancelled</SelectItem>
                                <SelectItem key="postponed">Postponed</SelectItem>
                            </Select>

                            <Select
                                placeholder="Audit Type"
                                selectedKeys={[filters.audit_type]}
                                onSelectionChange={(keys) => handleFilterChange('audit_type', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Types</SelectItem>
                                <SelectItem key="internal">Internal</SelectItem>
                                <SelectItem key="external">External</SelectItem>
                                <SelectItem key="regulatory">Regulatory</SelectItem>
                                <SelectItem key="certification">Certification</SelectItem>
                            </Select>

                            <Select
                                placeholder="Scope"
                                selectedKeys={[filters.scope]}
                                onSelectionChange={(keys) => handleFilterChange('scope', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Scopes</SelectItem>
                                <SelectItem key="company_wide">Company Wide</SelectItem>
                                <SelectItem key="department">Department</SelectItem>
                                <SelectItem key="process">Process</SelectItem>
                                <SelectItem key="system">System</SelectItem>
                            </Select>

                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                            >
                                Export
                            </Button>
                        </div>
                    </GlassCard>

                    <Spacer y={6} />

                    {/* Audits Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Compliance Audits
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Audits table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>Audit</TableColumn>
                                        <TableColumn>Type</TableColumn>
                                        <TableColumn>Scope</TableColumn>
                                        <TableColumn>Lead Auditor</TableColumn>
                                        <TableColumn>Start Date</TableColumn>
                                        <TableColumn>End Date</TableColumn>
                                        <TableColumn>Progress</TableColumn>
                                        <TableColumn>Findings</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {audits.map((audit) => (
                                            <TableRow key={audit.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{audit.audit_title}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-48">
                                                            {audit.audit_description}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getAuditTypeColor(audit.audit_type)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {audit.audit_type?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {audit.audit_scope}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{audit.lead_auditor?.name}</div>
                                                        <div className="text-sm text-gray-500">{audit.lead_auditor?.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {dayjs(audit.start_date).format('MMM DD, YYYY')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {dayjs(audit.end_date).format('MMM DD, YYYY')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={audit.completion_percentage || 0}
                                                            color={audit.completion_percentage >= 100 ? 'success' : audit.completion_percentage >= 75 ? 'warning' : 'primary'}
                                                            size="sm"
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {(audit.completion_percentage || 0).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {audit.findings_count > 0 ? (
                                                            <Chip
                                                                color={audit.critical_findings_count > 0 ? 'danger' : audit.major_findings_count > 0 ? 'warning' : 'success'}
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {audit.findings_count} Finding{audit.findings_count !== 1 ? 's' : ''}
                                                            </Chip>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">No findings</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(audit.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {audit.status?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                            >
                                                                <EllipsisVerticalIcon className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu
                                                            onAction={(key) => handleAction(key, audit)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            {audit.status === 'planned' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="edit"
                                                                        startContent={<PencilIcon className="w-4 h-4" />}
                                                                    >
                                                                        Edit
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="start"
                                                                        startContent={<PlayIcon className="w-4 h-4" />}
                                                                        color="success"
                                                                    >
                                                                        Start Audit
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="postpone"
                                                                        startContent={<PauseIcon className="w-4 h-4" />}
                                                                        color="warning"
                                                                    >
                                                                        Postpone
                                                                    </DropdownItem>
                                                                </>
                                                            )}
                                                            {audit.status === 'in_progress' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="findings"
                                                                        startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
                                                                    >
                                                                        Manage Findings
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="complete"
                                                                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                        color="success"
                                                                    >
                                                                        Complete Audit
                                                                    </DropdownItem>
                                                                </>
                                                            )}
                                                            {audit.status === 'completed' && (
                                                                <DropdownItem
                                                                    key="report"
                                                                    startContent={<DocumentTextIcon className="w-4 h-4" />}
                                                                    color="primary"
                                                                >
                                                                    Generate Report
                                                                </DropdownItem>
                                                            )}
                                                            {['planned', 'in_progress'].includes(audit.status) && (
                                                                <DropdownItem
                                                                    key="cancel"
                                                                    startContent={<XCircleIcon className="w-4 h-4" />}
                                                                    color="danger"
                                                                >
                                                                    Cancel
                                                                </DropdownItem>
                                                            )}
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardBody>
                        {!loading && totalRows > 0 && (
                            <div className="flex justify-center p-4">
                                <Pagination
                                    total={Math.ceil(totalRows / pagination.perPage)}
                                    page={pagination.currentPage}
                                    onChange={handlePageChange}
                                    showControls
                                    showShadow
                                    color="primary"
                                />
                            </div>
                        )}
                    </GlassCard>
                </Box>
            </Box>
        </App>
    );
};

export default AuditManagementIndex;
