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
    ExclamationTriangleIcon,
    PlusIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ShieldExclamationIcon,
    ChartBarIcon,
    WrenchScrewdriverIcon
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

const RiskAssessmentIndex = () => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [loading, setLoading] = useState(false);
    const [riskAssessments, setRiskAssessments] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRisks: 0,
        highRisks: 0,
        activeRisks: 0,
        mitigatedRisks: 0
    });
    const [totalRows, setTotalRows] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        risk_level: 'all',
        category: 'all',
        dateRange: 'all'
    });

    const [pagination, setPagination] = useState({
        perPage: 15,
        currentPage: 1
    });

    // Fetch risk assessments
    const fetchRiskAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/compliance/risks', {
                params: {
                    page: pagination.currentPage,
                    per_page: pagination.perPage,
                    ...filters
                }
            });

            if (response.data.success) {
                setRiskAssessments(response.data.data.data);
                setTotalRows(response.data.data.total);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching risk assessments:', error);
            toast.error('Failed to fetch risk assessments');
        } finally {
            setLoading(false);
        }
    }, [pagination, filters]);

    useEffect(() => {
        fetchRiskAssessments();
    }, [fetchRiskAssessments]);

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

    // Risk level color mapping
    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'critical': return 'danger';
            default: return 'default';
        }
    };

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'identified': return 'warning';
            case 'assessed': return 'primary';
            case 'mitigated': return 'success';
            case 'accepted': return 'secondary';
            case 'transferred': return 'secondary';
            case 'avoided': return 'success';
            default: return 'default';
        }
    };

    // Category color mapping
    const getCategoryColor = (category) => {
        switch (category) {
            case 'operational': return 'primary';
            case 'financial': return 'success';
            case 'legal': return 'secondary';
            case 'regulatory': return 'warning';
            case 'strategic': return 'danger';
            case 'reputational': return 'danger';
            default: return 'default';
        }
    };

    // Statistics cards data
    const statsData = useMemo(() => [
        {
            title: 'Total Risks',
            value: statistics.totalRisks,
            icon: ExclamationTriangleIcon,
            color: 'primary',
            trend: '+15%'
        },
        {
            title: 'High Risk Items',
            value: statistics.highRisks,
            icon: ShieldExclamationIcon,
            color: 'danger',
            trend: '-8%'
        },
        {
            title: 'Active Risks',
            value: statistics.activeRisks,
            icon: ClockIcon,
            color: 'warning',
            trend: '+3%'
        },
        {
            title: 'Mitigated Risks',
            value: statistics.mitigatedRisks,
            icon: CheckCircleIcon,
            color: 'success',
            trend: '+22%'
        }
    ], [statistics]);

    // Actions handler
    const handleAction = (action, risk) => {
        switch (action) {
            case 'view':
                router.visit(`/compliance/risks/${risk.id}`);
                break;
            case 'edit':
                router.visit(`/compliance/risks/${risk.id}/edit`);
                break;
            case 'assess':
                router.visit(`/compliance/risks/${risk.id}/assess`);
                break;
            case 'mitigate':
                router.visit(`/compliance/risks/${risk.id}/mitigate`);
                break;
            case 'accept':
                handleAcceptRisk(risk.id);
                break;
            case 'transfer':
                handleTransferRisk(risk.id);
                break;
        }
    };

    const handleAcceptRisk = async (id) => {
        try {
            await axios.post(`/api/compliance/risks/${id}/accept`);
            toast.success('Risk accepted successfully');
            fetchRiskAssessments();
        } catch (error) {
            toast.error('Failed to accept risk');
        }
    };

    const handleTransferRisk = async (id) => {
        try {
            await axios.post(`/api/compliance/risks/${id}/transfer`);
            toast.success('Risk transferred successfully');
            fetchRiskAssessments();
        } catch (error) {
            toast.error('Failed to transfer risk');
        }
    };

    return (
        <App>
            <Head title="Risk Assessment - Compliance Management" />
            
            <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
                <PageHeader 
                    title="Risk Assessment"
                    subtitle="Identify, assess, and manage organizational risks"
                    icon={ExclamationTriangleIcon}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<ChartBarIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/risks/matrix')}
                            >
                                Risk Matrix
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onPress={() => router.visit('/compliance/risks/create')}
                            >
                                New Risk Assessment
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
                                placeholder="Search risk assessments..."
                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="flex-1"
                            />
                            
                            <Select
                                placeholder="Risk Level"
                                selectedKeys={[filters.risk_level]}
                                onSelectionChange={(keys) => handleFilterChange('risk_level', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Risk Levels</SelectItem>
                                <SelectItem key="low">Low</SelectItem>
                                <SelectItem key="medium">Medium</SelectItem>
                                <SelectItem key="high">High</SelectItem>
                                <SelectItem key="critical">Critical</SelectItem>
                            </Select>

                            <Select
                                placeholder="Status"
                                selectedKeys={[filters.status]}
                                onSelectionChange={(keys) => handleFilterChange('status', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Status</SelectItem>
                                <SelectItem key="identified">Identified</SelectItem>
                                <SelectItem key="assessed">Assessed</SelectItem>
                                <SelectItem key="mitigated">Mitigated</SelectItem>
                                <SelectItem key="accepted">Accepted</SelectItem>
                                <SelectItem key="transferred">Transferred</SelectItem>
                                <SelectItem key="avoided">Avoided</SelectItem>
                            </Select>

                            <Select
                                placeholder="Category"
                                selectedKeys={[filters.category]}
                                onSelectionChange={(keys) => handleFilterChange('category', Array.from(keys)[0])}
                                className="w-full lg:w-48"
                            >
                                <SelectItem key="all">All Categories</SelectItem>
                                <SelectItem key="operational">Operational</SelectItem>
                                <SelectItem key="financial">Financial</SelectItem>
                                <SelectItem key="legal">Legal</SelectItem>
                                <SelectItem key="regulatory">Regulatory</SelectItem>
                                <SelectItem key="strategic">Strategic</SelectItem>
                                <SelectItem key="reputational">Reputational</SelectItem>
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

                    {/* Risk Assessments Table */}
                    <GlassCard>
                        <CardHeader className="pb-0">
                            <Typography variant="h6" component="h2">
                                Risk Assessments
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-auto">
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table
                                    aria-label="Risk assessments table"
                                    classNames={{
                                        wrapper: "min-h-[400px]",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>Risk</TableColumn>
                                        <TableColumn>Category</TableColumn>
                                        <TableColumn>Risk Level</TableColumn>
                                        <TableColumn>Likelihood</TableColumn>
                                        <TableColumn>Impact</TableColumn>
                                        <TableColumn>Score</TableColumn>
                                        <TableColumn>Status</TableColumn>
                                        <TableColumn>Owner</TableColumn>
                                        <TableColumn>Next Review</TableColumn>
                                        <TableColumn>Actions</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {riskAssessments.map((risk) => (
                                            <TableRow key={risk.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{risk.risk_title}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-48">
                                                            {risk.risk_description}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getCategoryColor(risk.category)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {risk.category?.toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getRiskLevelColor(risk.risk_level)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {risk.risk_level?.toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={(risk.likelihood || 0) * 20}
                                                            color="primary"
                                                            size="sm"
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {risk.likelihood || 0}/5
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={(risk.impact || 0) * 20}
                                                            color="warning"
                                                            size="sm"
                                                            className="w-16"
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {risk.impact || 0}/5
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-lg">
                                                        {risk.risk_score || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={getStatusColor(risk.status)}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {risk.status?.replace('_', ' ').toUpperCase()}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{risk.risk_owner?.name}</div>
                                                        <div className="text-sm text-gray-500">{risk.risk_owner?.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {risk.next_review_date ? (
                                                            <span className={
                                                                dayjs(risk.next_review_date).isBefore(dayjs().add(30, 'days')) ? 
                                                                'text-warning font-medium' : ''
                                                            }>
                                                                {dayjs(risk.next_review_date).format('MMM DD, YYYY')}
                                                            </span>
                                                        ) : '-'}
                                                    </div>
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
                                                            onAction={(key) => handleAction(key, risk)}
                                                        >
                                                            <DropdownItem
                                                                key="view"
                                                                startContent={<EyeIcon className="w-4 h-4" />}
                                                            >
                                                                View Details
                                                            </DropdownItem>
                                                            {risk.status === 'identified' && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="edit"
                                                                        startContent={<PencilIcon className="w-4 h-4" />}
                                                                    >
                                                                        Edit
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="assess"
                                                                        startContent={<ChartBarIcon className="w-4 h-4" />}
                                                                        color="primary"
                                                                    >
                                                                        Assess Risk
                                                                    </DropdownItem>
                                                                </>
                                                            )}
                                                            {risk.status === 'assessed' && (
                                                                <DropdownItem
                                                                    key="mitigate"
                                                                    startContent={<WrenchScrewdriverIcon className="w-4 h-4" />}
                                                                    color="warning"
                                                                >
                                                                    Create Mitigation
                                                                </DropdownItem>
                                                            )}
                                                            {['assessed', 'mitigated'].includes(risk.status) && (
                                                                <>
                                                                    <DropdownItem
                                                                        key="accept"
                                                                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                                                                        color="success"
                                                                    >
                                                                        Accept Risk
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        key="transfer"
                                                                        startContent={<XCircleIcon className="w-4 h-4" />}
                                                                        color="secondary"
                                                                    >
                                                                        Transfer Risk
                                                                    </DropdownItem>
                                                                </>
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

export default RiskAssessmentIndex;
