import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilIcon, 
    TrashIcon, 
    UserIcon, 
    PhoneIcon, 
    EnvelopeIcon,
    BuildingOfficeIcon,
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
    useDisclosure
} from "@heroui/react";
import { toast } from "react-toastify";

export default function LeadsIndex({ leads, leadSources, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [filteredLeads, setFilteredLeads] = useState(leads?.data || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedLead, setSelectedLead] = useState(null);
    
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        source_id: '',
        status: 'new',
        assigned_to: '',
        notes: ''
    });

    const statusOptions = [
        { key: 'new', label: 'New', color: 'primary' },
        { key: 'contacted', label: 'Contacted', color: 'warning' },
        { key: 'qualified', label: 'Qualified', color: 'success' },
        { key: 'unqualified', label: 'Unqualified', color: 'danger' },
        { key: 'converted', label: 'Converted', color: 'success' }
    ];

    useEffect(() => {
        let filtered = leads?.data || [];
        
        if (searchTerm) {
            filtered = filtered.filter(lead => 
                lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone?.includes(searchTerm) ||
                lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }
        
        if (sourceFilter !== 'all') {
            filtered = filtered.filter(lead => lead.source_id == sourceFilter);
        }
        
        setFilteredLeads(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sourceFilter, leads]);

    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.key === status);
        return option?.color || 'default';
    };

    const handleViewLead = (lead) => {
        setSelectedLead(lead);
        setData({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            company: lead.company || '',
            source_id: lead.source_id || '',
            status: lead.status || 'new',
            assigned_to: lead.assigned_to || '',
            notes: lead.notes || ''
        });
        onOpen();
    };

    const handleCreateLead = () => {
        setSelectedLead(null);
        reset();
        onOpen();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (selectedLead) {
            put(route('crm.leads.update', selectedLead.id), {
                onSuccess: () => {
                    toast.success('Lead updated successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update lead');
                }
            });
        } else {
            post(route('crm.leads.store'), {
                onSuccess: () => {
                    toast.success('Lead created successfully');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to create lead');
                }
            });
        }
    };

    const handleDelete = (leadId) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            destroy(route('crm.leads.destroy', leadId), {
                onSuccess: () => {
                    toast.success('Lead deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete lead');
                }
            });
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const currentLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns = [
        { name: "Name", uid: "name", sortable: true },
        { name: "Company", uid: "company", sortable: true },
        { name: "Email", uid: "email", sortable: true },
        { name: "Phone", uid: "phone", sortable: false },
        { name: "Source", uid: "source", sortable: true },
        { name: "Status", uid: "status", sortable: true },
        { name: "Assigned To", uid: "assigned_to", sortable: true },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (lead, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{lead.name}</span>
                    </div>
                );
            case "company":
                return lead.company || '-';
            case "email":
                return (
                    <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <span>{lead.email}</span>
                    </div>
                );
            case "phone":
                return lead.phone ? (
                    <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span>{lead.phone}</span>
                    </div>
                ) : '-';
            case "source":
                const source = leadSources?.find(s => s.id === lead.source_id);
                return source?.name || '-';
            case "status":
                return (
                    <Chip
                        color={getStatusColor(lead.status)}
                        variant="flat"
                        size="sm"
                    >
                        {statusOptions.find(opt => opt.key === lead.status)?.label || lead.status}
                    </Chip>
                );
            case "assigned_to":
                const assignedUser = users?.find(u => u.id === lead.assigned_to);
                return assignedUser?.name || 'Unassigned';
            case "actions":
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewLead(lead)}
                            >
                                <EyeIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Edit Lead">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleViewLead(lead)}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Delete Lead" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleDelete(lead.id)}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return lead[columnKey];
        }
    };

    return (
        <AppLayout title="Leads Management">
            <Head title="Leads" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage your sales leads and prospects
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={handleCreateLead}
                            startContent={<PlusIcon className="w-5 h-5" />}
                        >
                            Add Lead
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Input
                            placeholder="Search leads..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<UserIcon className="w-4 h-4 text-gray-400" />}
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
                            placeholder="Filter by source"
                            selectedKeys={sourceFilter !== 'all' ? [sourceFilter] : []}
                            onSelectionChange={(keys) => setSourceFilter(Array.from(keys)[0] || 'all')}
                        >
                            <SelectItem key="all" value="all">All Sources</SelectItem>
                            {leadSources?.map((source) => (
                                <SelectItem key={source.id} value={source.id.toString()}>
                                    {source.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table
                            aria-label="Leads table"
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
                                items={currentLeads}
                                emptyContent="No leads found"
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

            {/* Lead Modal */}
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
                                {selectedLead ? 'Edit Lead' : 'Create New Lead'}
                            </ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Name"
                                        placeholder="Enter lead name"
                                        value={data.name}
                                        onValueChange={(value) => setData('name', value)}
                                        isRequired
                                    />
                                    <Input
                                        label="Company"
                                        placeholder="Enter company name"
                                        value={data.company}
                                        onValueChange={(value) => setData('company', value)}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="Enter email address"
                                        value={data.email}
                                        onValueChange={(value) => setData('email', value)}
                                    />
                                    <Input
                                        label="Phone"
                                        placeholder="Enter phone number"
                                        value={data.phone}
                                        onValueChange={(value) => setData('phone', value)}
                                    />
                                    <Select
                                        label="Lead Source"
                                        placeholder="Select source"
                                        selectedKeys={data.source_id ? [data.source_id.toString()] : []}
                                        onSelectionChange={(keys) => setData('source_id', Array.from(keys)[0])}
                                    >
                                        {leadSources?.map((source) => (
                                            <SelectItem key={source.id} value={source.id.toString()}>
                                                {source.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Status"
                                        placeholder="Select status"
                                        selectedKeys={data.status ? [data.status] : []}
                                        onSelectionChange={(keys) => setData('status', Array.from(keys)[0])}
                                    >
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.key} value={status.key}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Assigned To"
                                        placeholder="Select user"
                                        selectedKeys={data.assigned_to ? [data.assigned_to.toString()] : []}
                                        onSelectionChange={(keys) => setData('assigned_to', Array.from(keys)[0])}
                                        className="md:col-span-2"
                                    >
                                        {users?.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
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
                                    {selectedLead ? 'Update' : 'Create'} Lead
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </AppLayout>
    );
}
