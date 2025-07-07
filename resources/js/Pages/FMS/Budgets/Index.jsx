import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    CurrencyDollarIcon, 
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    PlusIcon,
    EyeIcon,
    CheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Tooltip,
    Pagination,
    Input,
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Textarea,
    Card,
    CardBody,
    CardHeader,
    Progress
} from "@heroui/react";
import { toast } from "react-toastify";

export default function BudgetsIndex({ budgets, departments, categories, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [filteredBudgets, setFilteredBudgets] = useState(budgets?.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
    
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        department_id: '',
        category_id: '',
        budgeted_amount: '',
        period_start: '',
        period_end: '',
        status: 'draft',
        description: '',
        notes: ''
    });

    const statusOptions = [
        { key: 'draft', label: 'Draft', color: 'default' },
        { key: 'active', label: 'Active', color: 'success' },
        { key: 'review', label: 'Under Review', color: 'warning' },
        { key: 'approved', label: 'Approved', color: 'primary' },
        { key: 'expired', label: 'Expired', color: 'danger' }
    ];

    useEffect(() => {
        let filtered = budgets?.data || [];
        
        if (searchTerm) {
            filtered = filtered.filter(budget => 
                budget.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                budget.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                budget.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(budget => budget.status === statusFilter);
        }
        
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(budget => budget.department_id == departmentFilter);
        }
        
        setFilteredBudgets(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, departmentFilter, budgets]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.key === status);
        return option?.color || 'default';
    };

    const calculateBudgetVariance = (budgeted, actual) => {
        if (!budgeted || budgeted === 0) return 0;
        return ((actual - budgeted) / budgeted) * 100;
    };

    const getBudgetUtilization = (budgeted, spent) => {
        if (!budgeted || budgeted === 0) return 0;
        return (spent / budgeted) * 100;
    };

    const getUtilizationColor = (percentage) => {
        if (percentage <= 75) return 'success';
        if (percentage <= 90) return 'warning';
        return 'danger';
    };

    const handleViewBudget = (budget) => {
        setSelectedBudget(budget);
        setModalMode('view');
        setData({
            name: budget.name || '',
            department_id: budget.department_id || '',
            category_id: budget.category_id || '',
            budgeted_amount: budget.budgeted_amount || '',
            period_start: budget.period_start || '',
            period_end: budget.period_end || '',
            status: budget.status || 'draft',
            description: budget.description || '',
            notes: budget.notes || ''
        });
        onOpen();
    };

    const handleEditBudget = (budget) => {
        setSelectedBudget(budget);
        setModalMode('edit');
        setData({
            name: budget.name || '',
            department_id: budget.department_id || '',
            category_id: budget.category_id || '',
            budgeted_amount: budget.budgeted_amount || '',
            period_start: budget.period_start || '',
            period_end: budget.period_end || '',
            status: budget.status || 'draft',
            description: budget.description || '',
            notes: budget.notes || ''
        });
        onOpen();
    };

    const handleCreateBudget = () => {
        setSelectedBudget(null);
        setModalMode('create');
        reset();
        onOpen();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'edit') {
            put(route('fms.budgets.update', selectedBudget.id), {
                onSuccess: () => {
                    toast.success('Budget updated successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update budget');
                }
            });
        } else if (modalMode === 'create') {
            post(route('fms.budgets.store'), {
                onSuccess: () => {
                    toast.success('Budget created successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to create budget');
                }
            });
        }
    };

    const handleDelete = (budgetId) => {
        if (confirm('Are you sure you want to delete this budget?')) {
            destroy(route('fms.budgets.destroy', budgetId), {
                onSuccess: () => {
                    toast.success('Budget deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete budget');
                }
            });
        }
    };

    const handleApproveBudget = (budgetId) => {
        if (confirm('Approve this budget?')) {
            put(route('fms.budgets.approve', budgetId), {
                onSuccess: () => {
                    toast.success('Budget approved successfully');
                },
                onError: () => {
                    toast.error('Failed to approve budget');
                }
            });
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
    const currentBudgets = filteredBudgets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Summary calculations
    const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + (budget.budgeted_amount || 0), 0);
    const totalSpent = filteredBudgets.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const overBudgetCount = filteredBudgets.filter(budget => {
        const utilization = getBudgetUtilization(budget.budgeted_amount, budget.spent_amount);
        return utilization > 100;
    }).length;

    const columns = [
        { name: "Budget Name", uid: "name", sortable: true },
        { name: "Department", uid: "department", sortable: true },
        { name: "Category", uid: "category", sortable: true },
        { name: "Budgeted Amount", uid: "budgeted_amount", sortable: true },
        { name: "Spent", uid: "spent_amount", sortable: true },
        { name: "Utilization", uid: "utilization", sortable: false },
        { name: "Status", uid: "status", sortable: true },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (budget, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{budget.name}</span>
                    </div>
                );
            case "department":
                return budget.department?.name || 'Unassigned';
            case "category":
                return budget.category?.name || 'Uncategorized';
            case "budgeted_amount":
                return (
                    <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-600">
                            {formatCurrency(budget.budgeted_amount)}
                        </span>
                    </div>
                );
            case "spent_amount":
                return (
                    <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-600">
                            {formatCurrency(budget.spent_amount || 0)}
                        </span>
                    </div>
                );
            case "utilization":
                const utilization = getBudgetUtilization(budget.budgeted_amount, budget.spent_amount || 0);
                return (
                    <div className="flex flex-col gap-1">
                        <Progress
                            size="sm"
                            value={Math.min(utilization, 100)}
                            color={getUtilizationColor(utilization)}
                            className="w-20"
                        />
                        <span className={`text-xs ${
                            utilization > 100 ? 'text-red-600' : 
                            utilization > 90 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                            {utilization.toFixed(1)}%
                        </span>
                    </div>
                );
            case "status":
                return (
                    <Chip
                        color={getStatusColor(budget.status)}
                        variant="flat"
                        size="sm"
                    >
                        {statusOptions.find(opt => opt.key === budget.status)?.label || budget.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewBudget(budget)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Budget">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleEditBudget(budget)}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        {budget.status === 'review' && (
                            <Tooltip content="Approve Budget">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="success"
                                    onPress={() => handleApproveBudget(budget.id)}
                                >
                                    <CheckIcon className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip content="Delete Budget" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDelete(budget.id)}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return budget[columnKey];
        }
    };

    return (
        <AppLayout title="Budget Management">
            <Head title="Budgets" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Plan, track, and control organizational budgets
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={handleCreateBudget}
                            startContent={<PlusIcon className="w-5 h-5" />}
                        >
                            Create Budget
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Budgeted</p>
                                        <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                        <CurrencyDollarIcon className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRemaining)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Over Budget</p>
                                        <p className="text-2xl font-bold text-orange-600">{overBudgetCount}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Input
                            placeholder="Search budgets..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<DocumentTextIcon className="w-4 h-4 text-gray-400" />}
                        />
                        <Select
                            placeholder="Filter by status"
                            selectedKeys={statusFilter !== 'all' ? [statusFilter] : []}
                            onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Statuses</SelectItem>
                            {statusOptions.map((status) => (
                                <SelectItem key={status.key} value={status.key}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select
                            placeholder="Filter by department"
                            selectedKeys={departmentFilter !== 'all' ? [departmentFilter] : []}
                            onSelectionChange={(keys) => setDepartmentFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Departments</SelectItem>
                            {departments?.map((department) => (
                                <SelectItem key={department.id} value={department.id.toString()}>
                                    {department.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table
                            aria-label="Budgets table"
                            isHeaderSticky
                            classNames={{
                                wrapper: "max-h-[600px]",
                                th: "bg-gray-50 dark:bg-gray-700",
                                td: "group-data-[hover=true]:bg-gray-50 dark:group-data-[hover=true]:bg-gray-700",
                            }}
                            bottomContent={
                                totalPages > 1 ? (
                                    <div className="flex w-full justify-center">
                                        <Pagination
                                            isCompact
                                            showControls
                                            showShadow
                                            color="primary"
                                            page={currentPage}
                                            total={totalPages}
                                            onChange={setCurrentPage}
                                        />
                                    </div>
                                ) : null
                            }
                        >
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn
                                        key={column.uid}
                                        align={column.uid === "actions" ? "center" : "start"}
                                        allowsSorting={column.sortable}
                                    >
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody
                                items={currentBudgets}
                                emptyContent="No budgets found"
                            >
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => (
                                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Budget Modal */}
            <Modal 
                isOpen={isOpen} 
                onClose={onClose} 
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit}>
                            <ModalHeader className="flex flex-col gap-1">
                                {modalMode === 'view' ? 'Budget Details' : 
                                 modalMode === 'edit' ? 'Edit Budget' : 'Create New Budget'}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Budget Name"
                                        placeholder="Enter budget name"
                                        value={data.name}
                                        onValueChange={(value) => setData('name', value)}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                        className="md:col-span-2"
                                    />
                                    <Select
                                        label="Department"
                                        placeholder="Select department"
                                        selectedKeys={data.department_id ? [data.department_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('department_id', Array.from(keys)[0])}
                                        isDisabled={modalMode === 'view'}
                                    >
                                        {departments?.map((department) => (
                                            <SelectItem key={department.id} value={department.id.toString()}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Category"
                                        placeholder="Select category"
                                        selectedKeys={data.category_id ? [data.category_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('category_id', Array.from(keys)[0])}
                                        isDisabled={modalMode === 'view'}
                                    >
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Budgeted Amount"
                                        type="number"
                                        placeholder="Enter budgeted amount"
                                        value={data.budgeted_amount}
                                        onValueChange={(value) => setData('budgeted_amount', value)}
                                        startContent={<CurrencyDollarIcon className="w-4 h-4 text-gray-400" />}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                        className="md:col-span-2"
                                    />
                                    <Input
                                        label="Period Start"
                                        type="date"
                                        value={data.period_start}
                                        onValueChange={(value) => setData('period_start', value)}
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Input
                                        label="Period End"
                                        type="date"
                                        value={data.period_end}
                                        onValueChange={(value) => setData('period_end', value)}
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Select
                                        label="Status"
                                        placeholder="Select status"
                                        selectedKeys={data.status ? [data.status] : []}
                                        onSelectionChange={(keys) => setData('status', Array.from(keys)[0])}
                                        isDisabled={modalMode === 'view'}
                                        className="md:col-span-2"
                                    >
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.key} value={status.key}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Textarea
                                        label="Description"
                                        placeholder="Enter budget description"
                                        value={data.description}
                                        onValueChange={(value) => setData('description', value)}
                                        className="md:col-span-2"
                                        minRows={2}
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Textarea
                                        label="Notes"
                                        placeholder="Add notes"
                                        value={data.notes}
                                        onValueChange={(value) => setData('notes', value)}
                                        className="md:col-span-2"
                                        minRows={2}
                                        isDisabled={modalMode === 'view'}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                                </Button>
                                {modalMode !== 'view' && (
                                    <Button 
                                        color="primary" 
                                        type="submit" 
                                        isLoading={processing}
                                    >
                                        {modalMode === 'edit' ? 'Update' : 'Create'} Budget
                                    </Button>
                                )}
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </AppLayout>
    );
}
