import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PlusIcon, ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, timeEntries, projects, users, filters }) {
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [filterForm, setFilterForm] = useState(filters || {});

    const handleFilter = () => {
        router.get(route('project-management.time-tracking.index'), filterForm, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApprove = (entryId) => {
        router.post(route('project-management.time-tracking.approve', entryId));
    };

    const handleUnapprove = (entryId) => {
        router.post(route('project-management.time-tracking.unapprove', entryId));
    };

    const handleBulkApprove = () => {
        if (selectedEntries.length === 0) {
            alert('Please select time entries to approve');
            return;
        }
        router.post(route('project-management.time-tracking.bulk-approve'), {
            time_entry_ids: selectedEntries
        });
    };

    const handleSelectEntry = (entryId) => {
        setSelectedEntries(prev => 
            prev.includes(entryId) 
                ? prev.filter(id => id !== entryId)
                : [...prev, entryId]
        );
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getStatusColor = (approved) => {
        return approved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Time Tracking
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('project-management.time-tracking.reports')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                        >
                            Reports
                        </Link>
                        <Link
                            href={route('project-management.time-tracking.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Log Time
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Time Tracking" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Filters */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Project</label>
                                    <select
                                        value={filterForm.project_id || ''}
                                        onChange={(e) => setFilterForm({...filterForm, project_id: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Projects</option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id}>{project.project_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User</label>
                                    <select
                                        value={filterForm.user_id || ''}
                                        onChange={(e) => setFilterForm({...filterForm, user_id: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Users</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        value={filterForm.start_date || ''}
                                        onChange={(e) => setFilterForm({...filterForm, start_date: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        value={filterForm.end_date || ''}
                                        onChange={(e) => setFilterForm({...filterForm, end_date: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleFilter}
                                        className="w-full px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                    >
                                        Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedEntries.length > 0 && (
                            <div className="p-4 bg-indigo-50 border-b border-indigo-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-indigo-700">
                                        {selectedEntries.length} entries selected
                                    </span>
                                    <button
                                        onClick={handleBulkApprove}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Approve Selected
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Time Entries Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedEntries(timeEntries.data.map(entry => entry.id));
                                                    } else {
                                                        setSelectedEntries([]);
                                                    }
                                                }}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Project
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Task
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Billable
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
                                    {timeEntries.data.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEntries.includes(entry.id)}
                                                    onChange={() => handleSelectEntry(entry.id)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.user?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.project?.project_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.task?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                    {formatDuration(entry.duration_minutes)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.billable ? (
                                                    <span className="text-green-600">Yes</span>
                                                ) : (
                                                    <span className="text-gray-500">No</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.approved)}`}>
                                                    {entry.approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('project-management.time-tracking.show', entry.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('project-management.time-tracking.edit', entry.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                    {entry.approved ? (
                                                        <button
                                                            onClick={() => handleUnapprove(entry.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApprove(entry.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            <CheckIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {timeEntries.data.length === 0 && (
                            <div className="text-center py-12">
                                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by logging your first time entry.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
