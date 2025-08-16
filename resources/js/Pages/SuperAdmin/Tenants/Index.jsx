import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Chip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Pagination,
    Avatar,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";
import {
    MagnifyingGlassIcon,
    EllipsisVerticalIcon,
    PlusIcon,
    BuildingOfficeIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    PauseIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ChartBarSquareIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import App from '@/Layouts/App';
import StatsCard from '@/Components/StatsCard';
import { toast } from 'react-toastify';

const TenantsIndex = ({ tenants, plans, stats, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedPlan, setSelectedPlan] = useState(filters.plan || '');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Handle search
    const handleSearch = () => {
        router.get('/admin/tenants', {
            search: search || undefined,
            status: selectedStatus || undefined,
            plan: selectedPlan || undefined
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Clear filters
    const clearFilters = () => {
        setSearch('');
        setSelectedStatus('');
        setSelectedPlan('');
        router.get('/admin/tenants', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle tenant actions
    const handleTenantAction = async (tenant, action) => {
        try {
            const response = await fetch(`/admin/tenants/${tenant.id}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                toast.success(`Tenant ${action}d successfully`);
                router.reload();
            } else {
                throw new Error(`Failed to ${action} tenant`);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Handle tenant deletion
    const handleDeleteTenant = async () => {
        if (!selectedTenant) return;

        try {
            const response = await fetch(`/admin/tenants/${selectedTenant.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                toast.success('Tenant deleted successfully');
                router.reload();
                onDeleteClose();
            } else {
                throw new Error('Failed to delete tenant');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'trial': return 'warning';
            case 'suspended': return 'danger';
            default: return 'default';
        }
    };

    const statusOptions = [
        { key: '', label: 'All Status' },
        { key: 'active', label: 'Active' },
        { key: 'trial', label: 'Trial' },
        { key: 'suspended', label: 'Suspended' }
    ];

    const planOptions = [
        { key: '', label: 'All Plans' },
        ...plans.map(plan => ({ key: plan.id, label: plan.name }))
    ];

    const columns = [
        { name: "TENANT", uid: "tenant" },
        { name: "PLAN", uid: "plan" },
        { name: "STATUS", uid: "status" },
        { name: "USERS", uid: "users" },
        { name: "CREATED", uid: "created" },
        { name: "ACTIONS", uid: "actions" },
    ];

    const renderCell = (tenant, columnKey) => {
        switch (columnKey) {
            case "tenant":
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            name={tenant.name}
                            size="sm"
                            className="text-tiny"
                        />
                        <div className="flex flex-col">
                            <p className="text-bold text-sm capitalize">{tenant.name}</p>
                            <p className="text-bold text-tiny capitalize text-default-400">
                                {tenant.domain}
                            </p>
                        </div>
                    </div>
                );

            case "plan":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">
                            {tenant.plan?.name || 'No Plan'}
                        </p>
                        <p className="text-bold text-tiny capitalize text-default-400">
                            ${tenant.plan?.price || 0}/month
                        </p>
                    </div>
                );

            case "status":
                return (
                    <Chip 
                        className="capitalize" 
                        color={getStatusColor(tenant.status)} 
                        size="sm" 
                        variant="flat"
                    >
                        {tenant.status}
                    </Chip>
                );

            case "users":
                return (
                    <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4 text-default-400" />
                        <span className="text-sm">{tenant.tenant_users_count || 0}</span>
                    </div>
                );

            case "created":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">
                            {new Date(tenant.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-bold text-tiny capitalize text-default-400">
                            {new Date(tenant.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                );

            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                as={Link}
                                href={`/admin/tenants/${tenant.id}`}
                            >
                                <EyeIcon className="text-lg text-default-400 pointer-events-none" />
                            </Button>
                        </Tooltip>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <EllipsisVerticalIcon className="text-lg text-default-400" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    as={Link}
                                    href={`/admin/tenants/${tenant.id}/edit`}
                                    startContent={<PencilIcon className="w-4 h-4" />}
                                >
                                    Edit
                                </DropdownItem>
                                
                                {tenant.status === 'active' ? (
                                    <DropdownItem
                                        startContent={<PauseIcon className="w-4 h-4" />}
                                        onPress={() => handleTenantAction(tenant, 'suspend')}
                                    >
                                        Suspend
                                    </DropdownItem>
                                ) : (
                                    <DropdownItem
                                        startContent={<PlayIcon className="w-4 h-4" />}
                                        onPress={() => handleTenantAction(tenant, 'activate')}
                                    >
                                        Activate
                                    </DropdownItem>
                                )}
                                
                                <DropdownItem
                                    color="danger"
                                    startContent={<TrashIcon className="w-4 h-4" />}
                                    onPress={() => {
                                        setSelectedTenant(tenant);
                                        onDeleteOpen();
                                    }}
                                >
                                    Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <App>
            <Head title="Tenant Management" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Tenant Management
                        </h1>
                        <p className="text-default-500 mt-1">
                            Manage all company tenants and their subscriptions
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            color="default"
                            variant="flat"
                            startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                        >
                            Export
                        </Button>
                        <Button
                            color="primary"
                            startContent={<PlusIcon className="w-4 h-4" />}
                            as={Link}
                            href="/admin/tenants/create"
                        >
                            Add Tenant
                        </Button>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatsCard
                        title="Total Tenants"
                        value={stats.total}
                        icon={<BuildingOfficeIcon className="w-6 h-6" />}
                        color="primary"
                    />
                    
                    <StatsCard
                        title="Active"
                        value={stats.active}
                        icon={<ChartBarSquareIcon className="w-6 h-6" />}
                        color="success"
                    />
                    
                    <StatsCard
                        title="Trial"
                        value={stats.trial}
                        icon={<ClockIcon className="w-6 h-6" />}
                        color="warning"
                    />
                    
                    <StatsCard
                        title="Suspended"
                        value={stats.suspended}
                        icon={<ExclamationTriangleIcon className="w-6 h-6" />}
                        color="danger"
                    />
                </motion.div>

                {/* Filters and Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <div className="flex gap-3 flex-1">
                                    <Input
                                        placeholder="Search tenants..."
                                        value={search}
                                        onValueChange={setSearch}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                        className="max-w-xs"
                                    />
                                    
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button 
                                                variant="flat" 
                                                startContent={<FunnelIcon className="w-4 h-4" />}
                                            >
                                                {selectedStatus || 'Status'}
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            selectionMode="single"
                                            selectedKeys={selectedStatus ? [selectedStatus] : []}
                                            onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] || '')}
                                        >
                                            {statusOptions.map((option) => (
                                                <DropdownItem key={option.key}>
                                                    {option.label}
                                                </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </Dropdown>

                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button 
                                                variant="flat" 
                                                startContent={<CurrencyDollarIcon className="w-4 h-4" />}
                                            >
                                                {selectedPlan ? plans.find(p => p.id == selectedPlan)?.name : 'Plan'}
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            selectionMode="single"
                                            selectedKeys={selectedPlan ? [selectedPlan] : []}
                                            onSelectionChange={(keys) => setSelectedPlan(Array.from(keys)[0] || '')}
                                        >
                                            {planOptions.map((option) => (
                                                <DropdownItem key={option.key}>
                                                    {option.label}
                                                </DropdownItem>
                                            ))}
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        color="primary" 
                                        variant="flat"
                                        onPress={handleSearch}
                                    >
                                        Search
                                    </Button>
                                    <Button 
                                        color="default" 
                                        variant="light"
                                        onPress={clearFilters}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardBody className="px-0">
                            <Table aria-label="Tenants table">
                                <TableHeader columns={columns}>
                                    {(column) => (
                                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                            {column.name}
                                        </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody items={tenants.data}>
                                    {(item) => (
                                        <TableRow key={item.id}>
                                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex justify-center mt-4">
                                <Pagination
                                    total={tenants.last_page}
                                    page={tenants.current_page}
                                    onChange={(page) => {
                                        router.get('/admin/tenants', {
                                            ...filters,
                                            page
                                        }, {
                                            preserveState: true,
                                            preserveScroll: true
                                        });
                                    }}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        Confirm Deletion
                    </ModalHeader>
                    <ModalBody>
                        <p>
                            Are you sure you want to delete <strong>{selectedTenant?.name}</strong>? 
                            This action cannot be undone and will permanently remove all data 
                            associated with this tenant.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="default" variant="light" onPress={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button color="danger" onPress={handleDeleteTenant}>
                            Delete Tenant
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </App>
    );
};

export default TenantsIndex;
