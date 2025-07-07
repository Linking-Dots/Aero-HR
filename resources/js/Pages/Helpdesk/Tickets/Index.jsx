import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ClockIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    PauseIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import { formatDate, formatDateTime } from '@/Utils/formatters';

export default function TicketIndex({ tickets, filters, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTickets, setFilteredTickets] = useState(tickets.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredTickets(tickets.data);
        } else {
            const filtered = tickets.data.filter(ticket => 
                ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (ticket.requester && ticket.requester.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (ticket.category && ticket.category.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredTickets(filtered);
        }
    }, [searchTerm, tickets.data]);
    
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'low':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    Low
                </span>;
            case 'medium':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    Medium
                </span>;
            case 'high':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-orange-100 text-orange-800">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    High
                </span>;
            case 'critical':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    Critical
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    {priority}
                </span>;
        }
    };
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    Open
                </span>;
            case 'in_progress':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    In Progress
                </span>;
            case 'on_hold':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                    <PauseIcon className="w-4 h-4 mr-1" />
                    On Hold
                </span>;
            case 'resolved':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Resolved
                </span>;
            case 'closed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    Closed
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    {status}
                </span>;
        }
    };
    
    const renderStatusFilter = () => {
        const statuses = [
            { value: '', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
        ];
        
        return (
            <div className="relative">
                <select 
                    value={filters.status || ''}
                    onChange={e => {
                        window.location.href = route('helpdesk.tickets.index', {
                            ...filters,
                            status: e.target.value,
                        });
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                </select>
            </div>
        );
    };
    
    const renderPriorityFilter = () => {
        const priorities = [
            { value: '', label: 'All Priorities' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
        ];
        
        return (
            <div className="relative">
                <select 
                    value={filters.priority || ''}
                    onChange={e => {
                        window.location.href = route('helpdesk.tickets.index', {
                            ...filters,
                            priority: e.target.value,
                        });
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                </select>
            </div>
        );
    };
    
    return (
        <AppLayout
            title="Helpdesk Tickets"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Helpdesk Tickets
                </h2>
            )}
        >
            <Head title="Helpdesk Tickets" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 sm:px-20 bg-white border-b border-gray-200">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                <SearchFilter 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Search tickets..." 
                                />
                                <Link
                                    href={route('helpdesk.tickets.create')}
                                    className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150"
                                >
                                    Create New Ticket
                                </Link>
                            </div>
                            
                            {status && (
                                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{status}</span>
                                </div>
                            )}
                            
                            <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="w-full sm:w-1/4">
                                    {renderStatusFilter()}
                                </div>
                                <div className="w-full sm:w-1/4">
                                    {renderPriorityFilter()}
                                </div>
                            </div>
                            
                            <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ticket
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Requester
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assignee
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTickets.length > 0 ? (
                                            filteredTickets.map(ticket => (
                                                <tr key={ticket.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    <Link href={route('helpdesk.tickets.show', ticket.id)} className="hover:text-indigo-600">
                                                                        {ticket.title}
                                                                    </Link>
                                                                </div>
                                                                {ticket.category && (
                                                                    <div className="text-sm text-gray-500">
                                                                        {ticket.category}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {ticket.requester && (
                                                            <div className="flex items-center">
                                                                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                                <span className="text-sm text-gray-900">{ticket.requester.name}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {ticket.assignee ? (
                                                            <div className="flex items-center">
                                                                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                                <span className="text-sm text-gray-900">{ticket.assignee.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getPriorityBadge(ticket.priority)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(ticket.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                            {formatDateTime(ticket.created_at)}
                                                        </div>
                                                        {ticket.due_date && (
                                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                                <span className="text-xs font-semibold">Due: {formatDate(ticket.due_date)}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('helpdesk.tickets.show', ticket.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                            <EyeIcon className="h-5 w-5 inline" />
                                                        </Link>
                                                        <Link href={route('helpdesk.tickets.edit', ticket.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                            <PencilIcon className="h-5 w-5 inline" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this ticket?')) {
                                                                    // Delete logic here
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-5 w-5 inline" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                    No tickets found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination class="mt-6" links={tickets.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
