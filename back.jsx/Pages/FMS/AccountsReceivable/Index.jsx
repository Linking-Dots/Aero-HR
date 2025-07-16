import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    CurrencyDollarIcon, 
    DocumentTextIcon,
    CalendarIcon,
    UserGroupIcon,
    PlusIcon,
    EyeIcon,
    CheckIcon,
    ClockIcon,
    PaperAirplaneIcon
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
    CardBody
} from "@heroui/react";
import { toast } from "react-toastify";

export default function AccountsReceivableIndex({ invoices, customers, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [customerFilter, setCustomerFilter] = useState('all');
    const [filteredInvoices, setFilteredInvoices] = useState(invoices?.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
    
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        customer_id: '',
        invoice_number: '',
        amount: '',
        due_date: '',
        description: '',
        status: 'draft',
        notes: ''
    });

    const statusOptions = [
        { key: 'draft', label: 'Draft', color: 'default' },
        { key: 'sent', label: 'Sent', color: 'primary' },
        { key: 'viewed', label: 'Viewed', color: 'secondary' },
        { key: 'partial', label: 'Partially Paid', color: 'warning' },
        { key: 'paid', label: 'Paid', color: 'success' },
        { key: 'overdue', label: 'Overdue', color: 'danger' },
        { key: 'cancelled', label: 'Cancelled', color: 'default' }
    ];

    useEffect(() => {
        let filtered = invoices?.data || [];
        
        if (searchTerm) {
            filtered = filtered.filter(invoice => 
                invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.status === statusFilter);
        }
        
        if (customerFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.customer_id == customerFilter);
        }
        
        setFilteredInvoices(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, customerFilter, invoices]);

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

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setModalMode('view');
        setData({
            customer_id: invoice.customer_id || '',
            invoice_number: invoice.invoice_number || '',
            amount: invoice.amount || '',
            due_date: invoice.due_date || '',
            description: invoice.description || '',
            status: invoice.status || 'draft',
            notes: invoice.notes || ''
        });
        onOpen();
    };

    const handleEditInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setModalMode('edit');
        setData({
            customer_id: invoice.customer_id || '',
            invoice_number: invoice.invoice_number || '',
            amount: invoice.amount || '',
            due_date: invoice.due_date || '',
            description: invoice.description || '',
            status: invoice.status || 'draft',
            notes: invoice.notes || ''
        });
        onOpen();
    };

    const handleCreateInvoice = () => {
        setSelectedInvoice(null);
        setModalMode('create');
        reset();
        onOpen();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'edit') {
            put(route('fms.accounts-receivable.update', selectedInvoice.id), {
                onSuccess: () => {
                    toast.success('Invoice updated successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update invoice');
                }
            });
        } else if (modalMode === 'create') {
            post(route('fms.accounts-receivable.store'), {
                onSuccess: () => {
                    toast.success('Invoice created successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to create invoice');
                }
            });
        }
    };

    const handleDelete = (invoiceId) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            destroy(route('fms.accounts-receivable.destroy', invoiceId), {
                onSuccess: () => {
                    toast.success('Invoice deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete invoice');
                }
            });
        }
    };

    const handleSendInvoice = (invoiceId) => {
        if (confirm('Send this invoice to the customer?')) {
            put(route('fms.accounts-receivable.send', invoiceId), {
                onSuccess: () => {
                    toast.success('Invoice sent successfully');
                },
                onError: () => {
                    toast.error('Failed to send invoice');
                }
            });
        }
    };

    const handleMarkPaid = (invoiceId) => {
        if (confirm('Mark this invoice as paid?')) {
            put(route('fms.accounts-receivable.paid', invoiceId), {
                onSuccess: () => {
                    toast.success('Invoice marked as paid');
                },
                onError: () => {
                    toast.error('Failed to mark invoice as paid');
                }
            });
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const currentInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Summary stats
    const totalReceivable = filteredInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const overdueCount = filteredInvoices.filter(invoice => {
        const days = getDaysUntilDue(invoice.due_date);
        return days !== null && days < 0;
    }).length;
    const unpaidInvoices = filteredInvoices.filter(invoice => 
        !['paid', 'cancelled'].includes(invoice.status)
    ).length;

    const columns = [
        { name: "Invoice Number", uid: "invoice_number", sortable: true },
        { name: "Customer", uid: "customer", sortable: true },
        { name: "Amount", uid: "amount", sortable: true },
        { name: "Due Date", uid: "due_date", sortable: true },
        { name: "Status", uid: "status", sortable: true },
        { name: "Days Until Due", uid: "days_due", sortable: false },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (invoice, columnKey) => {
        switch (columnKey) {
            case "invoice_number":
                return (
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{invoice.invoice_number}</span>
                    </div>
                );
            case "customer":
                return (
                    <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span>{invoice.customer?.name || 'Unknown Customer'}</span>
                    </div>
                );
            case "amount":
                return (
                    <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">
                            {formatCurrency(invoice.amount)}
                        </span>
                    </div>
                );
            case "due_date":
                return invoice.due_date ? (
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                    </div>
                ) : '-';
            case "status":
                return (
                    <Chip
                        color={getStatusColor(invoice.status)}
                        variant="flat"
                        size="sm"
                    >
                        {statusOptions.find(opt => opt.key === invoice.status)?.label || invoice.status}
                    </Chip>
                );
            case "days_due":
                const days = getDaysUntilDue(invoice.due_date);
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
                                onPress={() => handleViewInvoice(invoice)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Invoice">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleEditInvoice(invoice)}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        {invoice.status === 'draft' && (
                            <Tooltip content="Send Invoice">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    onPress={() => handleSendInvoice(invoice.id)}
                                >
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        )}
                        {!['paid', 'cancelled'].includes(invoice.status) && (
                            <Tooltip content="Mark as Paid">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color="success"
                                    onPress={() => handleMarkPaid(invoice.id)}
                                >
                                    <CheckIcon className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip content="Delete Invoice" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDelete(invoice.id)}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return invoice[columnKey];
        }
    };

    return (
        <AppLayout title="Accounts Receivable">
            <Head title="Accounts Receivable" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts Receivable</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage customer invoices and payment tracking
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={handleCreateInvoice}
                            startContent={<PlusIcon className="w-5 h-5" />}
                        >
                            Create Invoice
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Receivable</p>
                                        <p className="text-2xl font-bold">{formatCurrency(totalReceivable)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid Invoices</p>
                                        <p className="text-2xl font-bold">{unpaidInvoices}</p>
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Invoices</p>
                                        <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Input
                            placeholder="Search invoices..."
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
                            placeholder="Filter by customer"
                            selectedKeys={customerFilter !== 'all' ? [customerFilter] : []}
                            onSelectionChange={(keys) => setCustomerFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Customers</SelectItem>
                            {customers?.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                    {customer.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table
                            aria-label="Accounts Receivable table"
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
                                items={currentInvoices}
                                emptyContent="No invoices found"
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

            {/* Invoice Modal */}
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
                                {modalMode === 'view' ? 'Invoice Details' : 
                                 modalMode === 'edit' ? 'Edit Invoice' : 'Create New Invoice'}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Customer"
                                        placeholder="Select customer"
                                        selectedKeys={data.customer_id ? [data.customer_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('customer_id', Array.from(keys)[0])}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                    >
                                        {customers?.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Invoice Number"
                                        placeholder="Enter invoice number"
                                        value={data.invoice_number}
                                        onValueChange={(value) => setData('invoice_number', value)}
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
                                        placeholder="Enter invoice description"
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
                                        {modalMode === 'edit' ? 'Update' : 'Create'} Invoice
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
