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
    CalendarIcon, 
    EyeIcon, 
    PencilIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';

const GlobalIndex = ({ milestones }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getStatusColor = (status) => {
        const colors = {
            'not_started': 'default',
            'in_progress': 'primary',
            'completed': 'success',
            'delayed': 'danger',
        };
        return colors[status] || 'default';
    };

    const filteredMilestones = useMemo(() => {
        if (!milestones?.data) return [];
        
        return milestones.data.filter(milestone => {
            const matchesSearch = milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                milestone.project?.project_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || milestone.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [milestones?.data, searchTerm, statusFilter]);

    // Stats calculation
    const stats = useMemo(() => {
        if (!milestones?.data) return [];
        
        const total = milestones.data.length;
        const completed = milestones.data.filter(m => m.status === 'completed').length;
        const inProgress = milestones.data.filter(m => m.status === 'in_progress').length;
        const overdue = milestones.data.filter(m => {
            return m.due_date && new Date(m.due_date) < new Date() && m.status !== 'completed';
        }).length;

        return [
            {
                title: 'Total Milestones',
                value: total,
                icon: <CalendarIcon className="w-6 h-6" />,
                color: 'primary',
                change: null,
            },
            {
                title: 'Completed',
                value: completed,
                icon: <CalendarIcon className="w-6 h-6" />,
                color: 'success',
                change: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%',
            },
            {
                title: 'In Progress',
                value: inProgress,
                icon: <ClockIcon className="w-6 h-6" />,
                color: 'warning',
                change: total > 0 ? `${((inProgress / total) * 100).toFixed(1)}%` : '0%',
            },
            {
                title: 'Overdue',
                value: overdue,
                icon: <ExclamationTriangleIcon className="w-6 h-6" />,
                color: 'danger',
                change: total > 0 ? `${((overdue / total) * 100).toFixed(1)}%` : '0%',
            },
        ];
    }, [milestones?.data]);

    return (
        <>
            <Head title="Project Milestones - All Projects" />
            <Box className="min-h-screen">
                <Grow in timeout={1000}>
                    <GlassCard>
                        <PageHeader
                            title="All Project Milestones"
                            subtitle="Comprehensive view of milestones across all projects"
                            icon={<CalendarIcon className="w-8 h-8" />}
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
                                        placeholder="Search milestones or projects..."
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
                                        <SelectItem key="not_started" value="not_started">Not Started</SelectItem>
                                        <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                        <SelectItem key="completed" value="completed">Completed</SelectItem>
                                        <SelectItem key="delayed" value="delayed">Delayed</SelectItem>
                                    </Select>
                                </div>
                            </div>

                            {/* Milestones Grid */}
                            <div className="space-y-4">
                                {filteredMilestones.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {filteredMilestones.map((milestone) => (
                                            <Grid item xs={12} sm={6} lg={4} key={milestone.id}>
                                                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start w-full">
                                                            <div className="flex-1 min-w-0">
                                                                <Typography variant="h6" className="font-semibold truncate">
                                                                    {milestone.name}
                                                                </Typography>
                                                                <Link
                                                                    href={route('project-management.projects.show', milestone.project.id)}
                                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                                >
                                                                    {milestone.project?.project_name}
                                                                </Link>
                                                            </div>
                                                            <div className="flex space-x-2 ml-2">
                                                                <Link
                                                                    href={route('project-management.milestones.show', [milestone.project.id, milestone.id])}
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
                                                                    href={route('project-management.milestones.edit', [milestone.project.id, milestone.id])}
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
                                                                    color={getStatusColor(milestone.status)}
                                                                    variant="flat"
                                                                >
                                                                    {milestone.status.replace('_', ' ')}
                                                                </Chip>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Due Date:</span>
                                                                <span className="text-sm">
                                                                    {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'N/A'}
                                                                </span>
                                                            </div>
                                                            {milestone.description && (
                                                                <div className="mt-3">
                                                                    <Typography variant="body2" className="text-default-500 line-clamp-2">
                                                                        {milestone.description}
                                                                    </Typography>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <Divider className="bg-white/20 my-4" />
                                                        
                                                        <div className="flex justify-between text-sm">
                                                            <Link
                                                                href={route('project-management.milestones.index', milestone.project.id)}
                                                                className="text-blue-400 hover:text-blue-300"
                                                            >
                                                                Project Milestones
                                                            </Link>
                                                            <Link
                                                                href={route('project-management.projects.show', milestone.project.id)}
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
                                            <CalendarIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                            <Typography variant="h6" className="mb-2">
                                                No Milestones Found
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {searchTerm || statusFilter !== 'all' 
                                                    ? 'No milestones match your current filters.' 
                                                    : 'No milestones found across all projects.'}
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
