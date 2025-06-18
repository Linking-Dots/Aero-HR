/**
 * LeaveHistoryTable - Organism Component
 * Modern leave history table with filtering and admin actions
 * Phase 6: Complete frontend migration
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@atoms/button';
import { Input } from '@atoms/input';
import { Badge } from '@shared/components/ui';

const LeaveHistoryTable = ({ 
    data = [],
    isEmployeeView = false,
    showActions = ['view', 'edit', 'approve', 'reject'],
    onView = null,
    onEdit = null,
    onApprove = null,
    onReject = null,
    onCancel = null
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filter data based on search and filters
    const filteredData = useMemo(() => {
        return data.filter(leave => {
            const matchesSearch = leave.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
            const matchesType = typeFilter === 'all' || leave.leave_type === typeFilter;
            
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [data, searchTerm, statusFilter, typeFilter]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Get unique leave types for filter
    const leaveTypes = useMemo(() => {
        const types = [...new Set(data.map(leave => leave.leave_type).filter(Boolean))];
        return types.sort();
    }, [data]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: 'warning', label: 'Pending' },
            approved: { variant: 'success', label: 'Approved' },
            rejected: { variant: 'danger', label: 'Rejected' },
            cancelled: { variant: 'default', label: 'Cancelled' },
            'in-progress': { variant: 'primary', label: 'In Progress' },
            completed: { variant: 'success', label: 'Completed' }
        };
        
        const config = statusConfig[status?.toLowerCase()] || { variant: 'default', label: status || 'Unknown' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return '-';
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Header with Search and Filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isEmployeeView ? 'My Leave History' : 'Leave Applications'}
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search leaves..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>

                        {/* Leave Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {leaveTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {!isEmployeeView && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Leave Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                End Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applied Date
                            </th>
                            {showActions.length > 0 && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? currentItems.map((leave) => (
                            <tr key={leave.id} className="hover:bg-gray-50">
                                {!isEmployeeView && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                {leave.employee_avatar ? (
                                                    <img
                                                        className="h-8 w-8 rounded-full"
                                                        src={leave.employee_avatar}
                                                        alt={leave.employee_name}
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {leave.employee_name?.charAt(0) || 'N'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {leave.employee_name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {leave.employee_id || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {leave.leave_type || '-'}
                                    </div>
                                    {leave.reason && (
                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                            {leave.reason}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(leave.start_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(leave.end_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {calculateDuration(leave.start_date, leave.end_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(leave.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(leave.applied_date || leave.created_at)}
                                </td>
                                {showActions.length > 0 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            {showActions.includes('view') && onView && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onView(leave)}
                                                >
                                                    View
                                                </Button>
                                            )}
                                            {showActions.includes('edit') && onEdit && leave.status === 'pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(leave)}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            {showActions.includes('approve') && onApprove && leave.status === 'pending' && !isEmployeeView && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onApprove(leave)}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                            {showActions.includes('reject') && onReject && leave.status === 'pending' && !isEmployeeView && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onReject(leave)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Reject
                                                </Button>
                                            )}
                                            {showActions.includes('cancel') && onCancel && leave.status === 'pending' && isEmployeeView && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onCancel(leave)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td 
                                    colSpan={isEmployeeView ? (showActions.length > 0 ? 7 : 6) : (showActions.length > 0 ? 8 : 7)}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center">
                                        <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-lg font-medium text-gray-900 mb-1">No leave applications found</p>
                                        <p className="text-sm text-gray-500">
                                            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                                ? 'No applications match your current filters.'
                                                : 'No leave applications available.'
                                            }
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{indexOfFirstItem + 1}</span>
                                    {' '}to{' '}
                                    <span className="font-medium">
                                        {Math.min(indexOfLastItem, filteredData.length)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-medium">{filteredData.length}</span>
                                    {' '}results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === currentPage
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { LeaveHistoryTable };
