import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PlusIcon, UserIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, project, resources, availableUsers }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        role: '',
        allocation_percentage: '',
        start_date: '',
        end_date: '',
        hourly_rate: '',
        cost_per_hour: '',
        availability_status: 'available',
        skills: [],
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('project-management.resources.store', project.id), formData, {
            onSuccess: () => {
                setShowAddForm(false);
                setFormData({
                    user_id: '',
                    role: '',
                    allocation_percentage: '',
                    start_date: '',
                    end_date: '',
                    hourly_rate: '',
                    cost_per_hour: '',
                    availability_status: 'available',
                    skills: [],
                    notes: ''
                });
            }
        });
    };

    const handleRemoveResource = (resourceId) => {
        if (confirm('Are you sure you want to remove this resource from the project?')) {
            router.delete(route('project-management.resources.destroy', [project.id, resourceId]));
        }
    };

    const getAvailabilityColor = (status) => {
        const colors = {
            'available': 'bg-green-100 text-green-800',
            'partially_available': 'bg-yellow-100 text-yellow-800',
            'busy': 'bg-orange-100 text-orange-800',
            'unavailable': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getUtilizationColor = (percentage) => {
        if (percentage >= 100) return 'text-red-600';
        if (percentage >= 80) return 'text-orange-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };

    const roleOptions = [
        { value: 'project_manager', label: 'Project Manager' },
        { value: 'team_lead', label: 'Team Lead' },
        { value: 'developer', label: 'Developer' },
        { value: 'designer', label: 'Designer' },
        { value: 'tester', label: 'Tester' },
        { value: 'analyst', label: 'Analyst' },
        { value: 'consultant', label: 'Consultant' },
        { value: 'coordinator', label: 'Coordinator' },
    ];

    const availabilityOptions = [
        { value: 'available', label: 'Available' },
        { value: 'partially_available', label: 'Partially Available' },
        { value: 'busy', label: 'Busy' },
        { value: 'unavailable', label: 'Unavailable' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Resource Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Project: {project.project_name}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            href={route('project-management.projects.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                        >
                            Back to Projects
                        </Link>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Resource
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Resource Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Add Resource Form */}
                    {showAddForm && (
                        <div className="bg-white shadow-xl sm:rounded-lg mb-6">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Add Resource</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Team Member</label>
                                        <select
                                            value={formData.user_id}
                                            onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select a team member</option>
                                            {availableUsers.map(user => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select a role</option>
                                            {roleOptions.map(role => (
                                                <option key={role.value} value={role.value}>{role.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Allocation %</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.allocation_percentage}
                                            onChange={(e) => setFormData({...formData, allocation_percentage: e.target.value})}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Availability Status</label>
                                        <select
                                            value={formData.availability_status}
                                            onChange={(e) => setFormData({...formData, availability_status: e.target.value})}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            {availabilityOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                            required
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.hourly_rate}
                                            onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cost per Hour</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.cost_per_hour}
                                            onChange={(e) => setFormData({...formData, cost_per_hour: e.target.value})}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            rows={3}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Add Resource
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Resources List */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Project Resources</h3>
                        </div>
                        
                        {resources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {resources.map((resource) => (
                                    <div key={resource.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">{resource.user.name}</h4>
                                                    <p className="text-sm text-gray-600">{resource.role.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveResource(resource.id)}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Allocation:</span>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-indigo-600 h-2 rounded-full"
                                                            style={{ width: `${resource.allocation_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium">{resource.allocation_percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Availability:</span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(resource.availability_status)}`}>
                                                    {resource.availability_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Period:</span>
                                                <span className="text-sm">
                                                    {new Date(resource.start_date).toLocaleDateString()} - {new Date(resource.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {resource.hourly_rate && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Hourly Rate:</span>
                                                    <span className="text-sm font-medium">${resource.hourly_rate}</span>
                                                </div>
                                            )}
                                            {resource.cost_per_hour && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Cost per Hour:</span>
                                                    <span className="text-sm font-medium">${resource.cost_per_hour}</span>
                                                </div>
                                            )}
                                            {resource.utilization_percentage !== undefined && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Utilization:</span>
                                                    <span className={`text-sm font-bold ${getUtilizationColor(resource.utilization_percentage)}`}>
                                                        {resource.utilization_percentage}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {resource.skills && resource.skills.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <h5 className="text-sm font-medium text-gray-900 mb-2">Skills:</h5>
                                                <div className="flex flex-wrap gap-1">
                                                    {resource.skills.map((skill, index) => (
                                                        <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {resource.notes && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <h5 className="text-sm font-medium text-gray-900 mb-1">Notes:</h5>
                                                <p className="text-sm text-gray-600">{resource.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No resources assigned</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by assigning team members to this project.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
