import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Box,
    Typography,
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
} from "@heroui/react";
import { 
    ExclamationTriangleIcon, 
    EyeIcon, 
    PencilIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    ClockIcon,
    UserIcon,
    BugAntIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';

const GlobalIndex = ({ issues }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');

    const getStatusColor = (status) => {
        const colors = {
            'open': 'danger',
            'in_progress': 'warning',
            'resolved': 'success',
            'closed': 'default',
        };
        return colors[status] || 'default';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger',
            'critical': 'danger',
        };
        return colors[severity] || 'default';
    };

    const filteredIssues = useMemo(() => {
        if (!issues?.data) return [];
        
        return issues.data.filter(issue => {
            const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                issue.project?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                issue.assigned_user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                issue.reported_by?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
            const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
            
            return matchesSearch && matchesStatus && matchesSeverity;
        });
    }, [issues?.data, searchTerm, statusFilter, severityFilter]);

    // Stats calculation
    const stats = useMemo(() => {
        if (!issues?.data) return [];
        
        const total = issues.data.length;
        const open = issues.data.filter(i => i.status === 'open').length;
        const inProgress = issues.data.filter(i => i.status === 'in_progress').length;
        const critical = issues.data.filter(i => i.severity === 'critical').length;

        return [
            {
                title: 'Total Issues',
                value: total,
                icon: <BugAntIcon className="w-6 h-6" />,
                color: 'primary',
                change: null,
            },
            {
                title: 'Open Issues',
                value: open,
                icon: <ExclamationTriangleIcon className="w-6 h-6" />,
                color: 'danger',
                change: total > 0 ? `${((open / total) * 100).toFixed(1)}%` : '0%',
            },
            {
                title: 'In Progress',
                value: inProgress,
                icon: <ClockIcon className="w-6 h-6" />,
                color: 'warning',
                change: total > 0 ? `${((inProgress / total) * 100).toFixed(1)}%` : '0%',
            },
            {
                title: 'Critical',
                value: critical,
                icon: <ExclamationTriangleIcon className="w-6 h-6" />,
                color: 'danger',
                change: total > 0 ? `${((critical / total) * 100).toFixed(1)}%` : '0%',
            },
        ];
    }, [issues?.data]);

    return (
        <>
            <Head title="Project Issues - All Projects" />
            <Box className="min-h-screen">
                <Grow in timeout={1000}>
                    <GlassCard>
                        <PageHeader
                            title="All Project Issues"
                            subtitle="Comprehensive view of issues across all projects"
                            icon={<BugAntIcon className="w-8 h-8" />}
                            actionComponent={
                                <Link href={route('project-management.projects.index')}>
                                    <Button 
                                        color="primary" 
                                        startContent={<FolderIcon className="w-4 h-4" />}
                                        className="font-semibold"
                                    >
                                        View Projects
                                    </Button>
                                </Link>
                            }
                        >
                            {/* Stats Cards */}
                            <div className="mb-8">
                                <StatsCards stats={stats} />
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search issues, projects, or people..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                        classNames={{
                                            base: "w-full",
                                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20",
                                        }}
                                    />
                                </div>
                                <div className="w-full sm:w-48">
                                    <Select
                                        placeholder="Filter by status"
                                        selectedKeys={statusFilter === 'all' ? [] : [statusFilter]}
                                        onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] || 'all')}
                                        classNames={{
                                            trigger: "bg-white/10 backdrop-blur-md border-white/20",
                                        }}
                                    >
                                        <SelectItem key="all" value="all">All Statuses</SelectItem>
                                        <SelectItem key="open" value="open">Open</SelectItem>
                                        <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                        <SelectItem key="resolved" value="resolved">Resolved</SelectItem>
                                        <SelectItem key="closed" value="closed">Closed</SelectItem>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-48">
                                    <Select
                                        placeholder="Filter by severity"
                                        selectedKeys={severityFilter === 'all' ? [] : [severityFilter]}
                                        onSelectionChange={(keys) => setSeverityFilter(Array.from(keys)[0] || 'all')}
                                        classNames={{
                                            trigger: "bg-white/10 backdrop-blur-md border-white/20",
                                        }}
                                    >
                                        <SelectItem key="all" value="all">All Severities</SelectItem>
                                        <SelectItem key="low" value="low">Low</SelectItem>
                                        <SelectItem key="medium" value="medium">Medium</SelectItem>
                                        <SelectItem key="high" value="high">High</SelectItem>
                                        <SelectItem key="critical" value="critical">Critical</SelectItem>
                                    </Select>
                                </div>
                            </div>

                            {/* Issues Grid */}
                            <div className="space-y-4">
                                {filteredIssues.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {filteredIssues.map((issue) => (
                                            <Grid item xs={12} sm={6} lg={4} key={issue.id}>
                                                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start w-full">
                                                            <div className="flex-1 min-w-0">
                                                                <Typography variant="h6" className="font-semibold truncate">
                                                                    {issue.title}
                                                                </Typography>
                                                                <Link
                                                                    href={route('project-management.projects.show', issue.project.id)}
                                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                                >
                                                                    {issue.project?.project_name}
                                                                </Link>
                                                            </div>
                                                            <div className="flex space-x-2 ml-2">
                                                                <Link
                                                                    href={route('project-management.issues.show', [issue.project.id, issue.id])}
                                                                >
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="light"
                                                                        className="text-blue-400 hover:text-blue-300"
                                                                    >
                                                                        <EyeIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Link
                                                                    href={route('project-management.issues.edit', [issue.project.id, issue.id])}
                                                                >
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="light"
                                                                        className="text-amber-400 hover:text-amber-300"
                                                                    >
                                                                        <PencilIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <Divider className="bg-white/20" />
                                                    <CardBody className="pt-4">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Status:</span>
                                                                <Chip
                                                                    size="sm"
                                                                    color={getStatusColor(issue.status)}
                                                                    variant="flat"
                                                                >
                                                                    {issue.status.replace('_', ' ')}
                                                                </Chip>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Severity:</span>
                                                                <Chip
                                                                    size="sm"
                                                                    color={getSeverityColor(issue.severity)}
                                                                    variant="flat"
                                                                >
                                                                    {issue.severity}
                                                                </Chip>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Assigned To:</span>
                                                                <span className="text-sm">
                                                                    {issue.assigned_user?.name || 'Unassigned'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Reported By:</span>
                                                                <span className="text-sm">{issue.reported_by?.name}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Created:</span>
                                                                <span className="text-sm">
                                                                    {new Date(issue.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            {issue.description && (
                                                                <div className="mt-3">
                                                                    <Typography variant="body2" className="text-default-500 line-clamp-2">
                                                                        {issue.description}
                                                                    </Typography>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <Divider className="bg-white/20 my-4" />
                                                        
                                                        <div className="flex justify-between text-sm">
                                                            <Link
                                                                href={route('project-management.issues.index', issue.project.id)}
                                                                className="text-blue-400 hover:text-blue-300"
                                                            >
                                                                Project Issues
                                                            </Link>
                                                            <Link
                                                                href={route('project-management.projects.show', issue.project.id)}
                                                                className="text-blue-400 hover:text-blue-300"
                                                            >
                                                                View Project
                                                            </Link>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                        <CardBody className="text-center py-12">
                                            <BugAntIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                            <Typography variant="h6" className="mb-2">
                                                No Issues Found
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                                                    ? 'No issues match your current filters.' 
                                                    : 'No issues found across all projects.'}
                                            </Typography>
                                        </CardBody>
                                    </Card>
                                )}
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};

GlobalIndex.layout = (page) => <App>{page}</App>;

export default GlobalIndex;
