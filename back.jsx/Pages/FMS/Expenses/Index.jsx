import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    DocumentArrowUpIcon, 
    CalendarIcon, 
    CurrencyDollarIcon,
    UserIcon,
    TagIcon,
    PlusIcon,
    EyeIcon,
    DocumentIcon
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
    Textarea
} from "@heroui/react";
import { toast } from "react-toastify";

export default function ExpensesIndex({ expenses, categories, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [filteredExpenses, setFilteredExpenses] = useState(expenses?.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedExpense, setSelectedExpense] = useState(null);
    
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        description: '',
        amount: '',
        category_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        submitted_by: '',
        receipt_file: null,
        notes: ''
    });

    const statusOptions = [
        { key: 'pending', label: 'Pending', color: 'warning' },
        { key: 'approved', label: 'Approved', color: 'success' },
        { key: 'rejected', label: 'Rejected', color: 'danger' },
        { key: 'paid', label: 'Paid', color: 'primary' }
    ];

    useEffect(() => {
        let filtered = expenses?.data || [];
        
        if (searchTerm) {
            filtered = filtered.filter(expense => 
                expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.submitter?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(expense => expense.status === statusFilter);
        }
        
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(expense => expense.category_id == categoryFilter);
        }
        
        setFilteredExpenses(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, categoryFilter, expenses]);

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

    const handleViewExpense = (expense) => {
        setSelectedExpense(expense);
        setData({
            description: expense.description || '',
            amount: expense.amount || '',
            category_id: expense.category_id || '',
            expense_date: expense.expense_date || '',
            submitted_by: expense.submitted_by || '',
            receipt_file: null,
            notes: expense.notes || ''
        });
        onOpen();
    };

    const handleCreateExpense = () => {
        setSelectedExpense(null);
        reset();
        setData('expense_date', new Date().toISOString().split('T')[0]);
        onOpen();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });
        
        if (selectedExpense) {
            put(route('fms.expenses.update', selectedExpense.id), {
                data: formData,
                onSuccess: () => {
                    toast.success('Expense updated successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update expense');
                }
            });
        } else {
            post(route('fms.expenses.store'), {
                data: formData,
                onSuccess: () => {
                    toast.success('Expense created successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to create expense');
                }
            });
        }
    };

    const handleDelete = (expenseId) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            destroy(route('fms.expenses.destroy', expenseId), {
                onSuccess: () => {
                    toast.success('Expense deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete expense');
                }
            });
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const currentExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns = [
        { name: "Description", uid: "description", sortable: true },
        { name: "Amount", uid: "amount", sortable: true },
        { name: "Category", uid: "category", sortable: true },
        { name: "Date", uid: "expense_date", sortable: true },
        { name: "Submitted By", uid: "submitted_by", sortable: true },
        { name: "Status", uid: "status", sortable: true },
        { name: "Receipt", uid: "receipt", sortable: false },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (expense, columnKey) => {
        switch (columnKey) {
            case "description":
                return (
                    <div className="flex items-center gap-2">
                        <DocumentArrowUpIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <span className="font-medium">{expense.description}</span>
                            {expense.notes && (
                                <p className="text-sm text-gray-500 truncate max-w-32">
                                    {expense.notes}
                                </p>
                            )}
                        </div>
                    </div>
                );
            case "amount":
                return (
                    <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">
                            {formatCurrency(expense.amount)}
                        </span>
                    </div>
                );
            case "category":
                const category = categories?.find(c => c.id === expense.category_id);
                return (
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-gray-400" />
                        <span>{category?.name || 'Uncategorized'}</span>
                    </div>
                );
            case "expense_date":
                return expense.expense_date ? (
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                    </div>
                ) : '-';
            case "submitted_by":
                const submitter = users?.find(u => u.id === expense.submitted_by);
                return (
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>{submitter?.name || 'Unknown'}</span>
                    </div>
                );
            case "status":
                return (
                    <Chip
                        color={getStatusColor(expense.status)}
                        variant="flat"
                        size="sm"
                    >
                        {statusOptions.find(opt => opt.key === expense.status)?.label || expense.status}
                    </Chip>
                );
            case "receipt":
                return expense.receipt_file ? (
                    <Tooltip content="View Receipt">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                        >
                            <DocumentIcon className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                ) : (
                    <span className="text-gray-400">No receipt</span>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewExpense(expense)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Expense">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewExpense(expense)}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Delete Expense" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDelete(expense.id)}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return expense[columnKey];
        }
    };

    return (
        <AppLayout title="Expense Management">
            <Head title="Expenses" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Track and manage business expenses
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={handleCreateExpense}
                            startContent={<PlusIcon className="w-5 h-5" />}
                        >
                            Add Expense
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                    <DocumentArrowUpIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {filteredExpenses.filter(exp => exp.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <DocumentArrowUpIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {filteredExpenses.filter(exp => exp.status === 'approved').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                    <DocumentArrowUpIcon className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            filteredExpenses
                                                .filter(exp => new Date(exp.expense_date).getMonth() === new Date().getMonth())
                                                .reduce((sum, exp) => sum + (exp.amount || 0), 0)
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Input
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<DocumentArrowUpIcon className="w-4 h-4 text-gray-400" />}
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
                            placeholder="Filter by category"
                            selectedKeys={categoryFilter !== 'all' ? [categoryFilter] : []}
                            onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Categories</SelectItem>
                            {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table
                            aria-label="Expenses table"
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
                                items={currentExpenses}
                                emptyContent="No expenses found"
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

            {/* Expense Modal */}
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
                                {selectedExpense ? 'Edit Expense' : 'Create New Expense'}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Description"
                                        placeholder="Enter expense description"
                                        value={data.description}
                                        onValueChange={(value) => setData('description', value)}
                                        isRequired
                                        className="md:col-span-2"
                                    />
                                    <Input
                                        label="Amount"
                                        type="number"
                                        placeholder="Enter amount"
                                        value={data.amount}
                                        onValueChange={(value) => setData('amount', value)}
                                        startContent={<CurrencyDollarIcon className="w-4 h-4 text-gray-400" />}
                                        isRequired
                                    />
                                    <Select
                                        label="Category"
                                        placeholder="Select category"
                                        selectedKeys={data.category_id ? [data.category_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('category_id', Array.from(keys)[0])}
                                        isRequired
                                    >
                                        {categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Expense Date"
                                        type="date"
                                        value={data.expense_date}
                                        onValueChange={(value) => setData('expense_date', value)}
                                        isRequired
                                    />
                                    <Select
                                        label="Submitted By"
                                        placeholder="Select user"
                                        selectedKeys={data.submitted_by ? [data.submitted_by.toString()] : []}
                                        onSelectionChange={(keys) => setData('submitted_by', Array.from(keys)[0])}
                                        isRequired
                                    >
                                        {users?.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setData('receipt_file', e.target.files[0])}
                                        className="md:col-span-2 p-2 border border-gray-300 rounded-lg"
                                    />
                                    <Textarea
                                        label="Notes"
                                        placeholder="Additional notes..."
                                        value={data.notes}
                                        onValueChange={(value) => setData('notes', value)}
                                        className="md:col-span-2"
                                        minRows={3}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button 
                                    color="primary" 
                                    type="submit" 
                                    isLoading={processing}
                                >
                                    {selectedExpense ? 'Update' : 'Create'} Expense
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </AppLayout>
    );
}
