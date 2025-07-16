import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    CurrencyDollarIcon, 
    DocumentTextIcon,
    CalendarIcon,
    PlusIcon,
    EyeIcon,
    FunnelIcon,
    ArrowUpIcon,
    ArrowDownIcon
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
    DateRangePicker
} from "@heroui/react";
import { toast } from "react-toastify";

export default function GeneralLedgerIndex({ transactions, accounts, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [accountFilter, setAccountFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [filteredTransactions, setFilteredTransactions] = useState(transactions?.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
    
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        account_id: '',
        description: '',
        debit_amount: '',
        credit_amount: '',
        reference: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const transactionTypes = [
        { key: 'debit', label: 'Debit', icon: ArrowUpIcon, color: 'danger' },
        { key: 'credit', label: 'Credit', icon: ArrowDownIcon, color: 'success' }
    ];

    const accountTypes = [
        { key: 'asset', label: 'Assets', color: 'primary' },
        { key: 'liability', label: 'Liabilities', color: 'warning' },
        { key: 'equity', label: 'Equity', color: 'secondary' },
        { key: 'revenue', label: 'Revenue', color: 'success' },
        { key: 'expense', label: 'Expenses', color: 'danger' }
    ];

    useEffect(() => {
        let filtered = transactions?.data || [];
        
        if (searchTerm) {
            filtered = filtered.filter(transaction => 
                transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.account?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (accountFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.account_id == accountFilter);
        }
        
        if (typeFilter !== 'all') {
            filtered = filtered.filter(transaction => {
                if (typeFilter === 'debit') return transaction.debit_amount > 0;
                if (typeFilter === 'credit') return transaction.credit_amount > 0;
                return true;
            });
        }
        
        setFilteredTransactions(filtered);
        setCurrentPage(1);
    }, [searchTerm, accountFilter, typeFilter, transactions]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getAccountTypeColor = (accountType) => {
        const type = accountTypes.find(t => t.key === accountType);
        return type?.color || 'default';
    };

    const handleViewTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setModalMode('view');
        setData({
            account_id: transaction.account_id || '',
            description: transaction.description || '',
            debit_amount: transaction.debit_amount || '',
            credit_amount: transaction.credit_amount || '',
            reference: transaction.reference || '',
            transaction_date: transaction.transaction_date || '',
            notes: transaction.notes || ''
        });
        onOpen();
    };

    const handleEditTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setModalMode('edit');
        setData({
            account_id: transaction.account_id || '',
            description: transaction.description || '',
            debit_amount: transaction.debit_amount || '',
            credit_amount: transaction.credit_amount || '',
            reference: transaction.reference || '',
            transaction_date: transaction.transaction_date || '',
            notes: transaction.notes || ''
        });
        onOpen();
    };

    const handleCreateTransaction = () => {
        setSelectedTransaction(null);
        setModalMode('create');
        reset();
        setData('transaction_date', new Date().toISOString().split('T')[0]);
        onOpen();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'edit') {
            put(route('fms.general-ledger.update', selectedTransaction.id), {
                onSuccess: () => {
                    toast.success('Transaction updated successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update transaction');
                }
            });
        } else if (modalMode === 'create') {
            post(route('fms.general-ledger.store'), {
                onSuccess: () => {
                    toast.success('Transaction created successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to create transaction');
                }
            });
        }
    };

    const handleDelete = (transactionId) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            destroy(route('fms.general-ledger.destroy', transactionId), {
                onSuccess: () => {
                    toast.success('Transaction deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete transaction');
                }
            });
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const currentTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Summary calculations
    const totalDebits = filteredTransactions.reduce((sum, t) => sum + (t.debit_amount || 0), 0);
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + (t.credit_amount || 0), 0);
    const balance = totalDebits - totalCredits;

    const columns = [
        { name: "Date", uid: "transaction_date", sortable: true },
        { name: "Account", uid: "account", sortable: true },
        { name: "Description", uid: "description", sortable: true },
        { name: "Reference", uid: "reference", sortable: true },
        { name: "Debit", uid: "debit_amount", sortable: true },
        { name: "Credit", uid: "credit_amount", sortable: true },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (transaction, columnKey) => {
        switch (columnKey) {
            case "transaction_date":
                return (
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                    </div>
                );
            case "account":
                return (
                    <div>
                        <p className="font-medium">{transaction.account?.name || 'Unknown Account'}</p>
                        <Chip
                            size="sm"
                            variant="flat"
                            color={getAccountTypeColor(transaction.account?.type)}
                        >
                            {transaction.account?.type || 'Unknown'}
                        </Chip>
                    </div>
                );
            case "description":
                return (
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                        <span>{transaction.description}</span>
                    </div>
                );
            case "reference":
                return transaction.reference || '-';
            case "debit_amount":
                return transaction.debit_amount > 0 ? (
                    <div className="flex items-center gap-2">
                        <ArrowUpIcon className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-600">
                            {formatCurrency(transaction.debit_amount)}
                        </span>
                    </div>
                ) : '-';
            case "credit_amount":
                return transaction.credit_amount > 0 ? (
                    <div className="flex items-center gap-2">
                        <ArrowDownIcon className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">
                            {formatCurrency(transaction.credit_amount)}
                        </span>
                    </div>
                ) : '-';
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewTransaction(transaction)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Transaction">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleEditTransaction(transaction)}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Delete Transaction" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDelete(transaction.id)}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return transaction[columnKey];
        }
    };

    return (
        <AppLayout title="General Ledger">
            <Head title="General Ledger" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">General Ledger</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Complete record of all financial transactions
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={handleCreateTransaction}
                            startContent={<PlusIcon className="w-5 h-5" />}
                        >
                            Add Transaction
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                        <ArrowUpIcon className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Debits</p>
                                        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <ArrowDownIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Credits</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        balance >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-orange-100 dark:bg-orange-900'
                                    }`}>
                                        <CurrencyDollarIcon className={`w-5 h-5 ${
                                            balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                                        }`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                                        <p className={`text-2xl font-bold ${
                                            balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                                        }`}>
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Input
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<DocumentTextIcon className="w-4 h-4 text-gray-400" />}
                        />
                        <Select
                            placeholder="Filter by account"
                            selectedKeys={accountFilter !== 'all' ? [accountFilter] : []}
                            onSelectionChange={(keys) => setAccountFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Accounts</SelectItem>
                            {accounts?.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select
                            placeholder="Filter by type"
                            selectedKeys={typeFilter !== 'all' ? [typeFilter] : []}
                            onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Types</SelectItem>
                            <SelectItem key="debit" value="debit">Debits Only</SelectItem>
                            <SelectItem key="credit" value="credit">Credits Only</SelectItem>
                        </Select>
                        <Button
                            variant="outline"
                            startContent={<FunnelIcon className="w-4 h-4" />}
                        >
                            More Filters
                        </Button>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table
                            aria-label="General Ledger table"
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
                                items={currentTransactions}
                                emptyContent="No transactions found"
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

            {/* Transaction Modal */}
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
                                {modalMode === 'view' ? 'Transaction Details' : 
                                 modalMode === 'edit' ? 'Edit Transaction' : 'Create New Transaction'}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Account"
                                        placeholder="Select account"
                                        selectedKeys={data.account_id ? [data.account_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('account_id', Array.from(keys)[0])}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                    >
                                        {accounts?.map((account) => (
                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                {account.name} ({account.type})
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Transaction Date"
                                        type="date"
                                        value={data.transaction_date}
                                        onValueChange={(value) => setData('transaction_date', value)}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Input
                                        label="Reference"
                                        placeholder="Enter reference number"
                                        value={data.reference}
                                        onValueChange={(value) => setData('reference', value)}
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            label="Debit Amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={data.debit_amount}
                                            onValueChange={(value) => setData('debit_amount', value)}
                                            startContent={<CurrencyDollarIcon className="w-4 h-4 text-red-400" />}
                                            isDisabled={modalMode === 'view'}
                                        />
                                        <Input
                                            label="Credit Amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={data.credit_amount}
                                            onValueChange={(value) => setData('credit_amount', value)}
                                            startContent={<CurrencyDollarIcon className="w-4 h-4 text-green-400" />}
                                            isDisabled={modalMode === 'view'}
                                        />
                                    </div>
                                    <Textarea
                                        label="Description"
                                        placeholder="Enter transaction description"
                                        value={data.description}
                                        onValueChange={(value) => setData('description', value)}
                                        className="md:col-span-2"
                                        minRows={2}
                                        isRequired
                                        isDisabled={modalMode === 'view'}
                                    />
                                    <Textarea
                                        label="Notes"
                                        placeholder="Add additional notes"
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
                                        {modalMode === 'edit' ? 'Update' : 'Create'} Transaction
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
