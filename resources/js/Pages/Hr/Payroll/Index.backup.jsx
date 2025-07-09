import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    CurrencyDollarIcon,
    DocumentTextIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ClockIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    DocumentDuplicateIcon,
    EnvelopeIcon,
    ArrowDownTrayIcon,
    Cog6ToothIcon,
    DocumentArrowDownIcon,
    BanknotesIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import App from '@/Layouts/App';
import GlassCard from '@/Components/GlassCard';
import PageHeader from '@/Components/PageHeader';
import StatsCards from '@/Components/StatsCards';
import { Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';

const PayrollIndex = ({ payrolls, stats, auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedPayrolls, setSelectedPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isOpen: isBulkProcessOpen, onOpen: onBulkProcessOpen, onClose: onBulkProcessClose } = useDisclosure();
    const { isOpen: isBulkPayslipOpen, onOpen: onBulkPayslipOpen, onClose: onBulkPayslipClose } = useDisclosure();

    // Filter payrolls based on search and status
    const filteredPayrolls = useMemo(() => {
        return payrolls.data.filter(payroll => {
            const matchesSearch = payroll.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                payroll.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [payrolls.data, searchTerm, statusFilter]);

    // Stats data for cards
    const statsData = [
        {
            title: "Total Payrolls",
            value: stats.total_payrolls,
            icon: <DocumentTextIcon />,
            color: "text-blue-400",
            iconBg: "bg-blue-500/20",
            description: "All time payrolls"
        },
        {
            title: "Current Month",
            value: stats.current_month_payrolls,
            icon: <ClockIcon />,
            color: "text-orange-400",
            iconBg: "bg-orange-500/20",
            description: "This month's payrolls"
        },
        {
            title: "Processed",
            value: stats.processed_payrolls,
            icon: <CheckCircleIcon />,
            color: "text-green-400",
            iconBg: "bg-green-500/20",
            description: "Successfully processed"
        },
        {
            title: "Total Payout",
            value: `$${stats.total_payout?.toLocaleString() || 0}`,
            icon: <CurrencyDollarIcon />,
            color: "text-purple-400",
            iconBg: "bg-purple-500/20",
            description: "Total salary paid"
        },
        {
            title: "Pending",
            value: stats.pending_payrolls,
            icon: <ClockIcon />,
            color: "text-yellow-400",
            iconBg: "bg-yellow-500/20",
            description: "Awaiting processing"
        },
        {
            title: "Average Salary",
            value: `$${stats.average_salary?.toLocaleString() || 0}`,
            icon: <BanknotesIcon />,
            color: "text-indigo-400",
            iconBg: "bg-indigo-500/20",
            description: "Average net salary"
        }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'draft': { color: 'warning', label: 'Draft' },
            'processed': { color: 'success', label: 'Processed' },
            'cancelled': { color: 'danger', label: 'Cancelled' }
        };
        
        const config = statusConfig[status] || statusConfig['draft'];
        
        return (
            <Chip color={config.color} size="sm" variant="flat">
                {config.label}
            </Chip>
        );
    };

    const handleView = (payroll) => {
        router.visit(route('hr.payroll.show', payroll.id));
    };

    const handleEdit = (payroll) => {
        if (payroll.status === 'processed') {
            toast.error('Cannot edit processed payroll');
            return;
        }
        router.visit(route('hr.payroll.edit', payroll.id));
    };

    const handleDelete = (payroll) => {
        if (payroll.status === 'processed') {
            toast.error('Cannot delete processed payroll');
            return;
        }
        
        if (confirm('Are you sure you want to delete this payroll?')) {
            router.delete(route('hr.payroll.destroy', payroll.id));
        }
    };

    const handleProcessPayroll = (payroll) => {
        if (payroll.status === 'processed') {
            toast.error('Payroll already processed');
            return;
        }
        
        if (confirm('Are you sure you want to process this payroll?')) {
            setLoading(true);
            router.post(route('hr.payroll.process', payroll.id), {}, {
                onSuccess: () => {
                    setLoading(false);
                    toast.success('Payroll processed successfully');
                },
                onError: () => {
                    setLoading(false);
                    toast.error('Failed to process payroll');
                }
            });
        }
    };

    const handleGeneratePayslip = (payroll) => {
        if (payroll.status !== 'processed') {
            toast.error('Payroll must be processed first');
            return;
        }
        
        setLoading(true);
        router.post(route('hr.payroll.payslip.generate', payroll.id), {}, {
            onSuccess: () => {
                setLoading(false);
                toast.success('Payslip generated successfully');
            },
            onError: () => {
                setLoading(false);
                toast.error('Failed to generate payslip');
            }
        });
    };

    const handleDownloadPayslip = (payroll) => {
        if (!payroll.payslip) {
            toast.error('Payslip not available');
            return;
        }
        
        window.open(route('hr.payroll.payslip.download', payroll.id), '_blank');
    };

    const handleEmailPayslip = (payroll) => {
        if (!payroll.payslip) {
            toast.error('Payslip not available');
            return;
        }
        
        setLoading(true);
        router.post(route('hr.payroll.payslip.email', payroll.id), {}, {
            onSuccess: () => {
                setLoading(false);
                toast.success('Payslip email sent successfully');
            },
            onError: () => {
                setLoading(false);
                toast.error('Failed to send payslip email');
            }
        });
    };

    const handleSelectPayroll = (payrollId) => {
        setSelectedPayrolls(prev => 
            prev.includes(payrollId) 
                ? prev.filter(id => id !== payrollId)
                : [...prev, payrollId]
        );
    };

    const handleSelectAllPayrolls = () => {
        if (selectedPayrolls.length === filteredPayrolls.length) {
            setSelectedPayrolls([]);
        } else {
            setSelectedPayrolls(filteredPayrolls.map(p => p.id));
        }
    };

    const handleBulkProcess = () => {
        if (selectedPayrolls.length === 0) {
            toast.error('Please select payrolls to process');
            return;
        }
        
        setLoading(true);
        router.post(route('hr.payroll.bulk.process'), { 
            payroll_ids: selectedPayrolls 
        }, {
            onSuccess: () => {
                setLoading(false);
                setSelectedPayrolls([]);
                onBulkProcessClose();
                toast.success('Payrolls processed successfully');
            },
            onError: () => {
                setLoading(false);
                toast.error('Failed to process payrolls');
            }
        });
    };

    const handleBulkGeneratePayslips = (sendEmail = false) => {
        if (selectedPayrolls.length === 0) {
            toast.error('Please select payrolls to generate payslips');
            return;
        }
        
        setLoading(true);
        router.post(route('hr.payroll.payslips.bulk.generate'), { 
            payroll_ids: selectedPayrolls,
            send_email: sendEmail
        }, {
            onSuccess: () => {
                setLoading(false);
                setSelectedPayrolls([]);
                onBulkPayslipClose();
                toast.success('Payslips generated successfully');
            },
            onError: () => {
                setLoading(false);
                toast.error('Failed to generate payslips');
            }
        });
    };

    const handleViewReports = () => {
        router.visit(route('hr.payroll.reports'));
    };

    return (
        <App>
            <Head title="Payroll Management" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Payroll Management"
                    subtitle="Manage employee payroll, salary calculations, and payslips"
                    actions={
                        <div className="flex space-x-3">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<ChartBarIcon className="w-4 h-4" />}
                                onClick={handleViewReports}
                            >
                                Reports
                            </Button>
                            <Button
                                color="primary"
                                startContent={<PlusIcon className="w-4 h-4" />}
                                onClick={() => router.visit(route('hr.payroll.create'))}
                            >
                                Generate Payroll
                            </Button>
                        </div>
                    }
                />

                <StatsCards stats={statsData} />

                {/* Bulk Actions */}
                {selectedPayrolls.length > 0 && (
                    <GlassCard className="p-4 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium">
                                    {selectedPayrolls.length} payroll(s) selected
                                </span>
                                <Button size="sm" variant="flat" onClick={() => setSelectedPayrolls([])}>
                                    Clear Selection
                                </Button>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    startContent={<PlayIcon className="w-4 h-4" />}
                                    onClick={onBulkProcessOpen}
                                >
                                    Process Selected
                                </Button>
                                <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    startContent={<DocumentTextIcon className="w-4 h-4" />}
                                    onClick={onBulkPayslipOpen}
                                >
                                    Generate Payslips
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Filters */}
                <GlassCard className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="processed">Processed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </GlassCard>

                {/* Payrolls Table */}
                <GlassCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedPayrolls.length === filteredPayrolls.length}
                                            onChange={handleSelectAllPayrolls}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pay Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gross Salary
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Net Salary
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayrolls.map((payroll) => (
                                    <tr key={payroll.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedPayrolls.includes(payroll.id)}
                                                onChange={() => handleSelectPayroll(payroll.id)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <UserGroupIcon className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {payroll.employee?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {payroll.employee?.employee_id || payroll.employee?.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(payroll.pay_period_start).toLocaleDateString()} - 
                                                {new Date(payroll.pay_period_end).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ${payroll.gross_salary?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-green-600">
                                                ${payroll.net_salary?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payroll.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    onClick={() => handleView(payroll)}
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Button>
                                                
                                                {payroll.status === 'draft' && (
                                                    <>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            color="warning"
                                                            onClick={() => handleEdit(payroll)}
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            color="success"
                                                            onClick={() => handleProcessPayroll(payroll)}
                                                            isLoading={loading}
                                                        >
                                                            <PlayIcon className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                
                                                {payroll.status === 'processed' && (
                                                    <>
                                                        {!payroll.payslip && (
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="flat"
                                                                color="primary"
                                                                onClick={() => handleGeneratePayslip(payroll)}
                                                                isLoading={loading}
                                                            >
                                                                <DocumentTextIcon className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        
                                                        {payroll.payslip && (
                                                            <>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color="secondary"
                                                                    onClick={() => handleDownloadPayslip(payroll)}
                                                                >
                                                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color="warning"
                                                                    onClick={() => handleEmailPayslip(payroll)}
                                                                    isLoading={loading}
                                                                >
                                                                    <EnvelopeIcon className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                
                                                {payroll.status === 'draft' && (
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        color="danger"
                                                        onClick={() => handleDelete(payroll)}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                {/* Bulk Process Modal */}
                <Modal isOpen={isBulkProcessOpen} onClose={onBulkProcessClose}>
                    <ModalContent>
                        <ModalHeader>Process Selected Payrolls</ModalHeader>
                        <ModalBody>
                            <p>Are you sure you want to process {selectedPayrolls.length} selected payroll(s)?</p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action cannot be undone. Processed payrolls cannot be edited.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onClick={onBulkProcessClose}>
                                Cancel
                            </Button>
                            <Button 
                                color="success" 
                                onClick={handleBulkProcess}
                                isLoading={loading}
                            >
                                Process Payrolls
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Bulk Payslip Modal */}
                <Modal isOpen={isBulkPayslipOpen} onClose={onBulkPayslipClose}>
                    <ModalContent>
                        <ModalHeader>Generate Payslips</ModalHeader>
                        <ModalBody>
                            <p>Generate payslips for {selectedPayrolls.length} selected payroll(s)?</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Payslips will be generated and can be downloaded or emailed to employees.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onClick={onBulkPayslipClose}>
                                Cancel
                            </Button>
                            <Button 
                                color="primary" 
                                variant="flat"
                                onClick={() => handleBulkGeneratePayslips(false)}
                                isLoading={loading}
                            >
                                Generate Only
                            </Button>
                            <Button 
                                color="primary" 
                                onClick={() => handleBulkGeneratePayslips(true)}
                                isLoading={loading}
                            >
                                Generate & Email
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </App>
    );
};

export default PayrollIndex;
        router.visit(route('hr.payroll.edit', payroll.id));
    };

    const handleProcess = (payroll) => {
        if (payroll.status === 'processed') {
            toast.error('Payroll already processed');
            return;
        }
        
        if (confirm('Are you sure you want to process this payroll? This action cannot be undone.')) {
            router.post(route('hr.payroll.process', payroll.id), {}, {
                onSuccess: () => toast.success('Payroll processed successfully'),
                onError: () => toast.error('Failed to process payroll')
            });
        }
    };

    const handleDelete = (payroll) => {
        if (payroll.status === 'processed') {
            toast.error('Cannot delete processed payroll');
            return;
        }

        if (confirm('Are you sure you want to delete this payroll?')) {
            router.delete(route('hr.payroll.destroy', payroll.id), {
                onSuccess: () => toast.success('Payroll deleted successfully'),
                onError: () => toast.error('Failed to delete payroll')
            });
        }
    };

    return (
        <App>
            <Head title="Payroll Management" />
            
            <div className="space-y-6">
                {/* Page Header */}
                <PageHeader
                    title="Payroll Management"
                    subtitle="Manage employee payroll, salaries, and payslips"
                    icon={<CurrencyDollarIcon className="w-8 h-8" />}
                    variant="gradient"
                    actionButtons={[
                        {
                            label: "Generate Payroll",
                            action: () => router.visit(route('hr.payroll.create')),
                            icon: <PlusIcon className="w-4 h-4" />,
                            variant: "solid",
                            color: "primary"
                        },
                        {
                            label: "Bulk Generate",
                            action: () => router.visit(route('hr.payroll.bulk')),
                            icon: <UserGroupIcon className="w-4 h-4" />,
                            variant: "bordered",
                            color: "secondary"
                        },
                        {
                            label: "View Payslips",
                            action: () => router.visit(route('hr.payroll.payslips')),
                            icon: <DocumentDuplicateIcon className="w-4 h-4" />,
                            variant: "flat",
                            color: "default"
                        }
                    ]}
                />

                {/* Stats Cards */}
                <StatsCards stats={statsData} />

                {/* Payroll Table */}
                <GlassCard>
                    <div className="p-6">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="processed">Processed</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pay Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Basic Salary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Net Salary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPayrolls.map((payroll) => (
                                        <tr key={payroll.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                                            {payroll.employee?.name?.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payroll.employee?.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {payroll.employee?.employee_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payroll.pay_period}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${payroll.basic_salary?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${payroll.net_salary?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(payroll.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<EyeIcon className="w-4 h-4" />}
                                                        onPress={() => handleView(payroll)}
                                                    >
                                                        View
                                                    </Button>
                                                    
                                                    {payroll.status === 'draft' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="warning"
                                                                startContent={<PencilIcon className="w-4 h-4" />}
                                                                onPress={() => handleEdit(payroll)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="success"
                                                                startContent={<PlayIcon className="w-4 h-4" />}
                                                                onPress={() => handleProcess(payroll)}
                                                            >
                                                                Process
                                                            </Button>
                                                            
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="danger"
                                                                startContent={<TrashIcon className="w-4 h-4" />}
                                                                onPress={() => handleDelete(payroll)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredPayrolls.length === 0 && (
                            <div className="text-center py-12">
                                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No payrolls found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Get started by generating your first payroll.'
                                    }
                                </p>
                                {(!searchTerm && statusFilter === 'all') && (
                                    <div className="mt-6">
                                        <Button
                                            color="primary"
                                            variant="solid"
                                            startContent={<PlusIcon className="w-4 h-4" />}
                                            onPress={() => router.visit(route('hr.payroll.create'))}
                                        >
                                            Generate Payroll
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </App>
    );
};

export default PayrollIndex;
