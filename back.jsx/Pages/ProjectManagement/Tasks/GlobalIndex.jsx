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
    ClipboardDocumentCheckIcon, 
    EyeIcon, 
    PencilIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';

const GlobalIndex = ({ tasks }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const getStatusColor = (status) => {
        const colors = {
            'todo': 'default',
            'in_progress': 'primary',
            'in_review': 'warning',
            'completed': 'success',
            'blocked': 'danger',
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger',
            'urgent': 'danger',
        };
        return colors[priority] || 'default';
    };

    const filteredTasks = useMemo(() => {
        if (!tasks?.data) return [];
        
        return tasks.data.filter(task => {
            const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                task.project?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                task.assigned_user?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks?.data, searchTerm, statusFilter, priorityFilter]);

    // Stats calculation
    const stats = useMemo(() => {
        if (!tasks?.data) return [];
        
        const total = tasks.data.length;
        const completed = tasks.data.filter(t => t.status === 'completed').length;
        const inProgress = tasks.data.filter(t => t.status === 'in_progress').length;
        const overdue = tasks.data.filter(t => {
            return t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed';
        }).length;

        return [
            {
                title: 'Total Tasks',
                value: total,
                icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
                color: 'primary',
                change: null,
            },
            {
                title: 'Completed',
                value: completed,
                icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
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
    }, [tasks?.data]);

    return (
        <>
            <Head title="Project Tasks - All Projects" />
            <Box className="min-h-screen">
                <Grow in timeout={1000}>
                    <GlassCard>
                        <PageHeader
                            title="All Project Tasks"
                            subtitle="Comprehensive view of tasks across all projects"
                            icon={<ClipboardDocumentCheckIcon className="w-8 h-8" />}
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
                                        placeholder="Search tasks, projects, or assignees..."
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
                                        <SelectItem key="todo" value="todo">To Do</SelectItem>
                                        <SelectItem key="in_progress" value="in_progress">In Progress</SelectItem>
                                        <SelectItem key="in_review" value="in_review">In Review</SelectItem>
                                        <SelectItem key="completed" value="completed">Completed</SelectItem>
                                        <SelectItem key="blocked" value="blocked">Blocked</SelectItem>
                                    </Select>
                                </div>
                                <div className="w-full sm:w-48">
                                    <Select
                                        placeholder="Filter by priority"
                                        selectedKeys={priorityFilter === 'all' ? [] : [priorityFilter]}
                                        onSelectionChange={(keys) => setPriorityFilter(Array.from(keys)[0] || 'all')}
                                        classNames={{
                                            trigger: "bg-white/10 backdrop-blur-md border-white/20",
                                        }}
                                    >
                                        <SelectItem key="all" value="all">All Priorities</SelectItem>
                                        <SelectItem key="low" value="low">Low</SelectItem>
                                        <SelectItem key="medium" value="medium">Medium</SelectItem>
                                        <SelectItem key="high" value="high">High</SelectItem>
                                        <SelectItem key="urgent" value="urgent">Urgent</SelectItem>
                                    </Select>
                                </div>
                            </div>

                            {/* Tasks Grid */}
                            <div className="space-y-4">
                                {filteredTasks.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {filteredTasks.map((task) => (
                                            <Grid item xs={12} sm={6} lg={4} key={task.id}>
                                                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start w-full">
                                                            <div className="flex-1 min-w-0">
                                                                <Typography variant="h6" className="font-semibold truncate">
                                                                    {task.name}
                                                                </Typography>
                                                                <Link
                                                                    href={route('project-management.projects.show', task.project.id)}
                                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                                >
                                                                    {task.project?.project_name}
                                                                </Link>
                                                            </div>
                                                            <div className="flex space-x-2 ml-2">
                                                                <Link
                                                                    href={route('project-management.tasks.show', [task.project.id, task.id])}
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
                                                                    href={route('project-management.tasks.edit', [task.project.id, task.id])}
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
                                                                    color={getStatusColor(task.status)}
                                                                    variant="flat"
                                                                >
                                                                    {task.status.replace('_', ' ')}
                                                                </Chip>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Priority:</span>
                                                                <Chip
                                                                    size="sm"
                                                                    color={getPriorityColor(task.priority)}
                                                                    variant="flat"
                                                                >
                                                                    {task.priority}
                                                                </Chip>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Assigned To:</span>
                                                                <span className="text-sm">
                                                                    {task.assigned_user?.name || 'Unassigned'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Due Date:</span>
                                                                <span className="text-sm">
                                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                                                                </span>
                                                            </div>
                                                            {task.milestone && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-default-400">Milestone:</span>
                                                                    <span className="text-sm">{task.milestone.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <Divider className="bg-white/20 my-4" />
                                                        
                                                        <div className="flex justify-between text-sm">
                                                            <Link
                                                                href={route('project-management.tasks.index', task.project.id)}
                                                                className="text-blue-400 hover:text-blue-300"
                                                            >
                                                                Project Tasks
                                                            </Link>
                                                            <Link
                                                                href={route('project-management.projects.show', task.project.id)}
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
                                            <ClipboardDocumentCheckIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                            <Typography variant="h6" className="mb-2">
                                                No Tasks Found
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                                                    ? 'No tasks match your current filters.' 
                                                    : 'No tasks found across all projects.'}
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
