import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@heroui/react";
import { 
    PlusIcon,
    DocumentArrowDownIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    CalendarIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { AdminManagementTemplate } from '@/Templates';

/**
 * Example implementation of AdminManagementTemplate for Leave Management
 * This shows how to use the template system effectively
 */
const ExampleLeaveAdminView = ({ title, allUsers, leaves, loading, error }) => {
    const [activeTab, setActiveTab] = useState('all-leaves');
    const [filters, setFilters] = useState({
        employee: '',
        selectedMonth: new Date().toISOString().slice(0, 7),
        status: 'all',
        leaveType: 'all'
    });
    const [selectedLeaves, setSelectedLeaves] = useState(new Set());

    // Sample statistics
    const leaveStats = {
        pending: 15,
        approved: 45,
        rejected: 8,
        total: 68
    };

    // Quick stats configuration
    const quickStats = [
        {
            label: 'Pending',
            value: leaveStats.pending,
            icon: ClockIcon,
            gradient: 'from-orange-500/10 to-amber-500/10',
            borderColor: 'border-orange-500/20',
            iconBg: 'bg-orange-500/20',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-600'
        },
        {
            label: 'Approved',
            value: leaveStats.approved,
            icon: CheckCircleIcon,
            gradient: 'from-green-500/10 to-emerald-500/10',
            borderColor: 'border-green-500/20',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-600',
            textColor: 'text-green-600'
        },
        {
            label: 'Rejected',
            value: leaveStats.rejected,
            icon: XCircleIcon,
            gradient: 'from-red-500/10 to-rose-500/10',
            borderColor: 'border-red-500/20',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-600',
            textColor: 'text-red-600'
        },
        {
            label: 'Total',
            value: leaveStats.total,
            icon: CalendarIcon,
            gradient: 'from-blue-500/10 to-indigo-500/10',
            borderColor: 'border-blue-500/20',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600'
        }
    ];

    // Tab configuration
    const tabs = [
        { key: 'all-leaves', title: 'All Leaves' },
        { key: 'pending', title: 'Pending Approval' },
        { key: 'approved', title: 'Approved' },
        { key: 'rejected', title: 'Rejected' }
    ];

    // Filter configuration
    const filterConfig = [
        {
            key: 'employee',
            type: 'search',
            label: 'Search Employee',
            placeholder: 'Enter name or ID...',
            startIcon: MagnifyingGlassIcon,
            gridSize: { md: 3 }
        },
        {
            key: 'selectedMonth',
            type: 'month',
            label: 'Month/Year',
            gridSize: { md: 3 }
        },
        {
            key: 'status',
            type: 'select',
            label: 'Leave Status',
            options: [
                { key: 'all', label: 'All Status', value: 'all' },
                { key: 'pending', label: 'Pending', value: 'pending' },
                { key: 'approved', label: 'Approved', value: 'approved' },
                { key: 'rejected', label: 'Rejected', value: 'rejected' }
            ],
            gridSize: { md: 3 }
        },
        {
            key: 'leaveType',
            type: 'select',
            label: 'Leave Type',
            options: [
                { key: 'all', label: 'All Types', value: 'all' },
                { key: 'annual', label: 'Annual Leave', value: 'annual' },
                { key: 'sick', label: 'Sick Leave', value: 'sick' },
                { key: 'maternity', label: 'Maternity Leave', value: 'maternity' }
            ],
            gridSize: { md: 3 }
        }
    ];

    // Action buttons for header
    const actionButtons = (
        <>
            <Button
                color="primary"
                startContent={<PlusIcon className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
            >
                Add Leave
            </Button>
            <Button
                variant="bordered"
                startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                className="border-white/20 bg-white/5 hover:bg-white/10"
            >
                Export
            </Button>
        </>
    );

    // Filter change handler
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Reset filters handler
    const handleResetFilters = useCallback(() => {
        setFilters({
            employee: '',
            selectedMonth: new Date().toISOString().slice(0, 7),
            status: 'all',
            leaveType: 'all'
        });
    }, []);

    // Sample main content (would be your actual table/data component)
    const mainContent = (
        <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
            <CalendarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Data Component Goes Here</h3>
            <p className="text-default-500">
                Replace this with your actual LeaveEmployeeTable or other data component
            </p>
        </div>
    );

    return (
        <AdminManagementTemplate
            title={title}
            pageTitle="Leave Management"
            pageDescription="Manage employee leave requests and approvals"
            pageIcon={CalendarIcon}
            quickStats={quickStats}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            filters={filterConfig.map(filter => ({
                ...filter,
                value: filters[filter.key],
                onChange: (e) => {
                    const value = filter.type === 'select' ? 
                        (Array.isArray(e) ? e[0] : e) : 
                        e.target.value;
                    handleFilterChange(filter.key, value);
                }
            }))}
            actionButtons={actionButtons}
            loading={loading}
            error={error}
            primaryPermission="leaves.view"
        >
            {mainContent}
        </AdminManagementTemplate>
    );
};

export default ExampleLeaveAdminView;
