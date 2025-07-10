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
    Progress,
} from "@heroui/react";
import { 
    UserGroupIcon, 
    EyeIcon, 
    PencilIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    UserIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import StatsCards from '@/Components/StatsCards.jsx';
import App from '@/Layouts/App.jsx';

const GlobalIndex = ({ resources }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const getRoleColor = (role) => {
        const colors = {
            'manager': 'secondary',
            'developer': 'primary',
            'designer': 'success',
            'analyst': 'warning',
            'tester': 'danger',
        };
        return colors[role] || 'default';
    };

    const filteredResources = useMemo(() => {
        if (!resources?.data) return [];
        
        return resources.data.filter(resource => {
            const matchesSearch = resource.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                resource.project?.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                resource.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                resource.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || resource.role === roleFilter;
            
            return matchesSearch && matchesRole;
        });
    }, [resources?.data, searchTerm, roleFilter]);

    // Stats calculation
    const stats = useMemo(() => {
        if (!resources?.data) return [];
        
        const total = resources.data.length;
        const uniqueUsers = new Set(resources.data.map(r => r.user?.id)).size;
        const uniqueProjects = new Set(resources.data.map(r => r.project?.id)).size;
        const avgAllocation = resources.data.reduce((sum, r) => sum + (r.allocation_percentage || 0), 0) / total;

        return [
            {
                title: 'Total Allocations',
                value: total,
                icon: <UserGroupIcon className="w-6 h-6" />,
                color: 'primary',
                change: null,
            },
            {
                title: 'Active Users',
                value: uniqueUsers,
                icon: <UserIcon className="w-6 h-6" />,
                color: 'success',
                change: `${uniqueProjects} projects`,
            },
            {
                title: 'Projects',
                value: uniqueProjects,
                icon: <FolderIcon className="w-6 h-6" />,
                color: 'warning',
                change: `${total} allocations`,
            },
            {
                title: 'Avg Allocation',
                value: `${avgAllocation.toFixed(1)}%`,
                icon: <CurrencyDollarIcon className="w-6 h-6" />,
                color: 'secondary',
                change: total > 0 ? `${total} resources` : '0 resources',
            },
        ];
    }, [resources?.data]);

    return (
        <>
            <Head title="Project Resources - All Projects" />
            <Box className="min-h-screen">
                <Grow in timeout={1000}>
                    <GlassCard>
                        <PageHeader
                            title="All Project Resources"
                            subtitle="Comprehensive view of resource allocations across all projects"
                            icon={<UserGroupIcon className="w-8 h-8" />}
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
                                        placeholder="Search resources, projects, or roles..."
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
                                        placeholder="Filter by role"
                                        selectedKeys={roleFilter === 'all' ? [] : [roleFilter]}
                                        onSelectionChange={(keys) => setRoleFilter(Array.from(keys)[0] || 'all')}
                                        classNames={{
                                            trigger: "bg-white/10 backdrop-blur-md border-white/20",
                                        }}
                                    >
                                        <SelectItem key="all" value="all">All Roles</SelectItem>
                                        <SelectItem key="manager" value="manager">Manager</SelectItem>
                                        <SelectItem key="developer" value="developer">Developer</SelectItem>
                                        <SelectItem key="designer" value="designer">Designer</SelectItem>
                                        <SelectItem key="analyst" value="analyst">Analyst</SelectItem>
                                        <SelectItem key="tester" value="tester">Tester</SelectItem>
                                    </Select>
                                </div>
                            </div>

                            {/* Resources Grid */}
                            <div className="space-y-4">
                                {filteredResources.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {filteredResources.map((resource) => (
                                            <Grid item xs={12} sm={6} lg={4} key={resource.id}>
                                                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start w-full">
                                                            <div className="flex-1 min-w-0">
                                                                <Typography variant="h6" className="font-semibold truncate">
                                                                    {resource.user?.name}
                                                                </Typography>
                                                                <Link
                                                                    href={route('project-management.projects.show', resource.project.id)}
                                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                                >
                                                                    {resource.project?.project_name}
                                                                </Link>
                                                            </div>
                                                            <div className="flex space-x-2 ml-2">
                                                                <Link
                                                                    href={route('project-management.resources.show', [resource.project.id, resource.id])}
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
                                                                    href={route('project-management.resources.edit', [resource.project.id, resource.id])}
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
                                                                <span className="text-sm text-default-400">Role:</span>
                                                                <Chip
                                                                    size="sm"
                                                                    color={getRoleColor(resource.role)}
                                                                    variant="flat"
                                                                >
                                                                    {resource.role}
                                                                </Chip>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-default-400">Allocation:</span>
                                                                    <span className="text-sm font-medium">{resource.allocation_percentage}%</span>
                                                                </div>
                                                                <Progress 
                                                                    value={resource.allocation_percentage} 
                                                                    size="sm"
                                                                    color={resource.allocation_percentage > 80 ? 'danger' : resource.allocation_percentage > 60 ? 'warning' : 'success'}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Hourly Rate:</span>
                                                                <span className="text-sm">${resource.hourly_rate || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Start Date:</span>
                                                                <span className="text-sm">
                                                                    {resource.start_date ? new Date(resource.start_date).toLocaleDateString() : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">End Date:</span>
                                                                <span className="text-sm">
                                                                    {resource.end_date ? new Date(resource.end_date).toLocaleDateString() : 'Ongoing'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-default-400">Email:</span>
                                                                <span className="text-sm truncate">{resource.user?.email}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <Divider className="bg-white/20 my-4" />
                                                        
                                                        <div className="flex justify-between text-sm">
                                                            <Link
                                                                href={route('project-management.resources.index', resource.project.id)}
                                                                className="text-blue-400 hover:text-blue-300"
                                                            >
                                                                Project Resources
                                                            </Link>
                                                            <Link
                                                                href={route('project-management.projects.show', resource.project.id)}
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
                                            <UserGroupIcon className="w-16 h-16 text-default-400 mx-auto mb-4" />
                                            <Typography variant="h6" className="mb-2">
                                                No Resources Found
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {searchTerm || roleFilter !== 'all'
                                                    ? 'No resources match your current filters.' 
                                                    : 'No resources found across all projects.'}
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
