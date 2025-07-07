import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    BriefcaseIcon, 
    CurrencyDollarIcon, 
    CalendarIcon,
    TrendingUpIcon,
    PlusIcon,
    EyeIcon
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

export default function OpportunitiesIndex({ opportunities, customers, salesStages, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('all');
    const [customerFilter, setCustomerFilter] = useState('all');
    const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities?.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        title: '',
        customer_id: '',
        value: '',
        stage_id: '',
        probability: '',
        expected_close_date: '',
        assigned_to: '',
        description: ''
    });

    useEffect(() => {
        let filtered = opportunities?.data || [];
        
        if (searchTerm) {
            filtered = filtered.filter(opportunity => 
                opportunity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                opportunity.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (stageFilter !== 'all') {
            filtered = filtered.filter(opportunity => opportunity.stage_id == stageFilter);
        }
        
        if (customerFilter !== 'all') {
            filtered = filtered.filter(opportunity => opportunity.customer_id == customerFilter);
        }
        
        setFilteredOpportunities(filtered);
        setCurrentPage(1);
    }, [searchTerm, stageFilter, customerFilter, opportunities]);

    const getStageColor = (stageId) => {
        const stage = salesStages?.find(s => s.id === stageId);
        switch (stage?.name?.toLowerCase()) {
            case 'prospecting':
                return 'primary';
            case 'qualification':
                return 'warning';
            case 'proposal':
                return 'secondary';
            case 'negotiation':
                return 'success';
            case 'closed won':
                return 'success';
            case 'closed lost':
                return 'danger';
            default:
                return 'default';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const handleViewOpportunity = (opportunity) => {
        setSelectedOpportunity(opportunity);
        setData({
            title: opportunity.title || '',
            customer_id: opportunity.customer_id || '',
            value: opportunity.value || '',
            stage_id: opportunity.stage_id || '',
            probability: opportunity.probability || '',
            expected_close_date: opportunity.expected_close_date || '',
            assigned_to: opportunity.assigned_to || '',
            description: opportunity.description || ''
        });
        onOpen();
    };

    const handleCreateOpportunity = () => {
        setSelectedOpportunity(null);
        reset();
        onOpen();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (selectedOpportunity) {
            put(route('crm.opportunities.update', selectedOpportunity.id), {
                onSuccess: () => {
                    toast.success('Opportunity updated successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update opportunity');
                }
            });
        } else {
            post(route('crm.opportunities.store'), {
                onSuccess: () => {
                    toast.success('Opportunity created successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to create opportunity');
                }
            });
        }
    };

    const handleDelete = (opportunityId) => {
        if (confirm('Are you sure you want to delete this opportunity?')) {
            destroy(route('crm.opportunities.destroy', opportunityId), {
                onSuccess: () => {
                    toast.success('Opportunity deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete opportunity');
                }
            });
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
    const currentOpportunities = filteredOpportunities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns = [
        { name: "Title", uid: "title", sortable: true },
        { name: "Customer", uid: "customer", sortable: true },
        { name: "Value", uid: "value", sortable: true },
        { name: "Stage", uid: "stage", sortable: true },
        { name: "Probability", uid: "probability", sortable: true },
        { name: "Expected Close", uid: "expected_close_date", sortable: true },
        { name: "Assigned To", uid: "assigned_to", sortable: true },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (opportunity, columnKey) => {
        switch (columnKey) {
            case "title":
                return (
                    <div className="flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{opportunity.title}</span>
                    </div>
                );
            case "customer":
                return opportunity.customer?.name || '-';
            case "value":
                return (
                    <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">
                            {formatCurrency(opportunity.value)}
                        </span>
                    </div>
                );
            case "stage":
                const stage = salesStages?.find(s => s.id === opportunity.stage_id);
                return (
                    <Chip
                        color={getStageColor(opportunity.stage_id)}
                        variant="flat"
                        size="sm"
                    >
                        {stage?.name || 'Unknown'}
                    </Chip>
                );
            case "probability":
                return (
                    <div className="flex items-center gap-2">
                        <TrendingUpIcon className="w-4 h-4 text-blue-500" />
                        <span>{opportunity.probability}%</span>
                    </div>
                );
            case "expected_close_date":
                return opportunity.expected_close_date ? (
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{new Date(opportunity.expected_close_date).toLocaleDateString()}</span>
                    </div>
                ) : '-';
            case "assigned_to":
                const assignedUser = users?.find(u => u.id === opportunity.assigned_to);
                return assignedUser?.name || 'Unassigned';
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewOpportunity(opportunity)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Opportunity">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewOpportunity(opportunity)}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Delete Opportunity" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDelete(opportunity.id)}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return opportunity[columnKey];
        }
    };

    return (
        <AppLayout title="Opportunities Management">
            <Head title="Opportunities" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Opportunities</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Track and manage your sales opportunities
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={handleCreateOpportunity}
                            startContent={<PlusIcon className="w-5 h-5" />}
                        >
                            Add Opportunity
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Input
                            placeholder="Search opportunities..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<BriefcaseIcon className="w-4 h-4 text-gray-400" />}
                        />
                        <Select
                            placeholder="Filter by stage"
                            selectedKeys={stageFilter !== 'all' ? [stageFilter] : []}
                            onSelectionChange={(keys) => setStageFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Stages</SelectItem>
                            {salesStages?.map((stage) => (
                                <SelectItem key={stage.id} value={stage.id.toString()}>
                                    {stage.name}
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
                            aria-label="Opportunities table"
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
                                items={currentOpportunities}
                                emptyContent="No opportunities found"
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

            {/* Opportunity Modal */}
            <Modal 
                isOpen={isOpen} 
                onClose={onClose} 
                size="3xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit}>
                            <ModalHeader className="flex flex-col gap-1">
                                {selectedOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Title"
                                        placeholder="Enter opportunity title"
                                        value={data.title}
                                        onValueChange={(value) => setData('title', value)}
                                        isRequired
                                        className="md:col-span-2"
                                    />
                                    <Select
                                        label="Customer"
                                        placeholder="Select customer"
                                        selectedKeys={data.customer_id ? [data.customer_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('customer_id', Array.from(keys)[0])}
                                        isRequired
                                    >
                                        {customers?.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Value"
                                        type="number"
                                        placeholder="Enter opportunity value"
                                        value={data.value}
                                        onValueChange={(value) => setData('value', value)}
                                        startContent={<CurrencyDollarIcon className="w-4 h-4 text-gray-400" />}
                                    />
                                    <Select
                                        label="Stage"
                                        placeholder="Select stage"
                                        selectedKeys={data.stage_id ? [data.stage_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('stage_id', Array.from(keys)[0])}
                                        isRequired
                                    >
                                        {salesStages?.map((stage) => (
                                            <SelectItem key={stage.id} value={stage.id.toString()}>
                                                {stage.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Probability (%)"
                                        type="number"
                                        placeholder="Enter probability"
                                        value={data.probability}
                                        onValueChange={(value) => setData('probability', value)}
                                        min="0"
                                        max="100"
                                    />
                                    <Input
                                        label="Expected Close Date"
                                        type="date"
                                        value={data.expected_close_date}
                                        onValueChange={(value) => setData('expected_close_date', value)}
                                    />
                                    <Select
                                        label="Assigned To"
                                        placeholder="Select user"
                                        selectedKeys={data.assigned_to ? [data.assigned_to.toString()] : []}
                                        onSelectionChange={(keys) => setData('assigned_to', Array.from(keys)[0])}
                                    >
                                        {users?.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Textarea
                                        label="Description"
                                        placeholder="Enter opportunity description"
                                        value={data.description}
                                        onValueChange={(value) => setData('description', value)}
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
                                    {selectedOpportunity ? 'Update' : 'Create'} Opportunity
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </AppLayout>
    );
}
