import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    CurrencyDollarIcon, 
    DocumentTextIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    PlusIcon,
    EyeIcon,
    CheckIcon,
    ClockIcon
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
    DatePicker,
    Card,
    CardBody
} from "@heroui/react";
import { toast } from "react-toastify";

export default function AccountsPayableIndex({ bills, vendors, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vendorFilter, setVendorFilter] = useState('all');
    const [filteredBills, setFilteredBills] = useState(bills?.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedBill, setSelectedBill] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
    
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        vendor_id: '',
        bill_number: '',
        amount: '',
        due_date: '',
        description: '',
        status: 'pending',
        notes: ''
    });

    const statusOptions = [
        { key: 'pending', label: 'Pending', color: 'warning' },
        { key: 'approved', label: 'Approved', color: 'primary' },
        { key: 'paid', label: 'Paid', color: 'success' },
        { key: 'overdue', label: 'Overdue', color: 'danger' },
        { key: 'cancelled', label: 'Cancelled', color: 'default' }
    ];

    useEffect(() => {
        let filtered = bills?.data || [];
        
        if (searchTerm) {
            filtered = filtered.filter(bill => 
                bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(bill => bill.status === statusFilter);
        }
        
        if (vendorFilter !== 'all') {
            filtered = filtered.filter(bill => bill.vendor_id == vendorFilter);
        }
        
        setFilteredBills(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, vendorFilter, bills]);

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

    const getDaysUntilDue = (dueDate) => {
        if (!dueDate) return null;
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleViewBill = (bill) => {
        setSelectedBill(bill);
        setModalMode('view');
        setData({
            vendor_id: bill.vendor_id || '',
            bill_number: bill.bill_number || '',
            amount: bill.amount || '',
            due_date: bill.due_date || '',
            description: bill.description || '',
            status: bill.status || 'pending',
            notes: bill.notes || ''
        });
        onOpen();
    };

    const handleEditBill = (bill) => {
        setSelectedBill(bill);
        setModalMode('edit');
        setData({
            vendor_id: bill.vendor_id || '',
            bill_number: bill.bill_number || '',
            amount: bill.amount || '',
            due_date: bill.due_date || '',
            description: bill.description || '',
            status: bill.status || 'pending',
            notes: bill.notes || ''
        });
        onOpen();
    };

    const handleCreateBill = () => {
        setSelectedBill(null);
        setModalMode('create');
        reset();
        onOpen();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'edit') {
            put(route('fms.accounts-payable.update', selectedBill.id), {
                onSuccess: () => {
                    toast.success('Bill updated successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update bill');
                }
            });
        } else if (modalMode === 'create') {
            post(route('fms.accounts-payable.store'), {
                onSuccess: () => {
                    toast.success('Bill created successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to create bill');
                }
            });
        }
    };

    const handleDelete = (billId) => {
        if (confirm('Are you sure you want to delete this bill?')) {
            destroy(route('fms.accounts-payable.destroy', billId), {
                onSuccess: () => {
                    toast.success('Bill deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete bill');
                }
            });
        }
    };

    const handlePayBill = (billId) => {
        if (confirm('Mark this bill as paid?')) {
            put(route('fms.accounts-payable.pay', billId), {
                onSuccess: () => {
                    toast.success('Bill marked as paid');
                },
                onError: () => {
                    toast.error('Failed to mark bill as paid');
                }
            });
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const currentBills = filteredBills.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Summary stats
    const totalOwed = filteredBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const overdueCount = filteredBills.filter(bill => {
        const days = getDaysUntilDue(bill.due_date);
        return days !== null && days < 0;
    }).length;

    const columns = [
        { name: "Bill Number", uid: "bill_number", sortable: true },
        { name: "Vendor", uid: "vendor", sortable: true },
        { name: "Amount", uid: "amount", sortable: true },
        { name: "Due Date", uid: "due_date", sortable: true },
        { name: "Status", uid: "status", sortable: true },
        { name: "Days Until Due", uid: "days_due", sortable: false },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (bill, columnKey) => {
        switch (columnKey) {
            case "bill_number":
                return (
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{bill.bill_number}</span>
                    </div>
                );
            case "vendor":
                return (
                    <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                        <span>{bill.vendor?.name || 'Unknown Vendor'}</span>
                    </div>
                );
            case "amount":
                return (
                    <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">
                            {formatCurrency(bill.amount)}
                        </span>
                    </div>
                );
            case "due_date":
                return bill.due_date ? (
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{new Date(bill.due_date).toLocaleDateString()}</span>
                    </div>
                ) : '-';
            case "status":
                return (
                    <Chip
                        color={getStatusColor(bill.status)}
                        variant="flat"
                        size="sm"
                    >
                        {statusOptions.find(opt => opt.key === bill.status)?.label || bill.status}
                    </Chip>
                );
            case "days_due":
                const days = getDaysUntilDue(bill.due_date);
                if (days === null) return '-';
                
                return (
                    <div className="flex items-center gap-2">
                        {days < 0 ? (
                            <>
                                <ClockIcon className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 font-medium">
                                    {Math.abs(days)} days overdue
                                </span>
                            </>
                        ) : (
                            <>
                                <ClockIcon className="w-4 h-4 text-blue-500" />
                                <span className="text-blue-600">
                                    {days} days
                                </span>
                            </>
                        )}
                    </div>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewBill(bill)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Bill">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleEditBill(bill)}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        {bill.status !== 'paid' && (
                            <Tooltip content="Mark as Paid">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="success"
                                    onPress={() => handlePayBill(bill.id)}
                                >
                                    <CheckIcon className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip content="Delete Bill" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDelete(bill.id)}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return bill[columnKey];
        }
    };

    return (
        <AppLayout title="Accounts Payable">
            <Head title="Accounts Payable" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts Payable</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage vendor bills and payment obligations
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={handleCreateBill}
                            startContent={<PlusIcon className="w-5 h-5" />}
                        >
                            Add Bill
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</p>
                                        <p className="text-2xl font-bold">{formatCurrency(totalOwed)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <DocumentTextIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Bills</p>
                                        <p className="text-2xl font-bold">{filteredBills.length}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                        <ClockIcon className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Bills</p>
                                        <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Input
                            placeholder="Search bills..."
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
                            placeholder="Filter by vendor"
                            selectedKeys={vendorFilter !== 'all' ? [vendorFilter] : []}
                            onSelectionChange={(keys) => setVendorFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Vendors</SelectItem>
                            {vendors?.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                    {vendor.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table
                            aria-label="Accounts Payable table"
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
                                items={currentBills}
                                emptyContent="No bills found"
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

            {/* Bill Modal */}
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
                                {modalMode === 'view' ? 'Bill Details' : 
                                 modalMode === 'edit' ? 'Edit Bill' : 'Create New Bill'}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Vendor"
                                        placeholder="Select vendor"
                                        selectedKeys={data.vendor_id ? [data.vendor_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('vendor_id', Array.from(keys)[0])}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                    >
                                        {vendors?.map((vendor) => (
                                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Bill Number"
                                        placeholder="Enter bill number"
                                        value={data.bill_number}
                                        onValueChange={(value) => setData('bill_number', value)}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Input
                                        label="Amount"
                                        type="number"
                                        placeholder="Enter amount"
                                        value={data.amount}
                                        onValueChange={(value) => setData('amount', value)}
                                        startContent={<CurrencyDollarIcon className="w-4 h-4 text-gray-400" />}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Input
                                        label="Due Date"
                                        type="date"
                                        value={data.due_date}
                                        onValueChange={(value) => setData('due_date', value)}
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Select
                                        label="Status"
                                        placeholder="Select status"
                                        selectedKeys={data.status ? [data.status] : []}
                                        onSelectionChange={(keys) => setData('status', Array.from(keys)[0])}
                                        isDisabled={modalMode === 'view'}
                                    >
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.key} value={status.key}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Textarea
                                        label="Description"
                                        placeholder="Enter bill description"
                                        value={data.description}
                                        onValueChange={(value) => setData('description', value)}
                                        className="md:col-span-2"
                                        minRows={2}
                                        isDisabled={modalMode === 'view'}
                                    />
                                    {modalMode !== 'create' && (
                                        <Textarea
                                            label="Notes"
                                            placeholder="Add notes"
                                            value={data.notes}
                                            onValueChange={(value) => setData('notes', value)}
                                            className="md:col-span-2"
                                            minRows={2}
                                            isDisabled={modalMode === 'view'}
                                        />
                                    )}
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
                                        {modalMode === 'edit' ? 'Update' : 'Create'} Bill
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
