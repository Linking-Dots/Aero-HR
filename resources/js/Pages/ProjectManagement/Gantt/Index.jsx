import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CalendarIcon, ClockIcon, FlagIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, projects }) {
    const [selectedProject, setSelectedProject] = useState(null);
    const [timelineData, setTimelineData] = useState(null);
    const [viewMode, setViewMode] = useState('days'); // days, weeks, months

    useEffect(() => {
        if (selectedProject) {
            fetchTimelineData(selectedProject.id);
        }
    }, [selectedProject]);

    const fetchTimelineData = async (projectId) => {
        try {
            const response = await fetch(route('project-management.gantt.timeline', projectId));
            const data = await response.json();
            setTimelineData(data);
        } catch (error) {
            console.error('Error fetching timeline data:', error);
        }
    };

    const handleTaskDateUpdate = async (taskId, newDates) => {
        try {
            await router.put(route('project-management.gantt.update-task-dates', taskId), newDates);
            fetchTimelineData(selectedProject.id);
        } catch (error) {
            console.error('Error updating task dates:', error);
        }
    };

    const calculateDaysBetween = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    const getStatusColor = (status) => {
        const colors = {
            'todo': 'bg-gray-400',
            'in_progress': 'bg-blue-500',
            'in_review': 'bg-yellow-500',
            'completed': 'bg-green-500',
            'blocked': 'bg-red-500',
        };
        return colors[status] || 'bg-gray-400';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': 'border-l-green-500',
            'medium': 'border-l-yellow-500',
            'high': 'border-l-orange-500',
            'urgent': 'border-l-red-500',
        };
        return colors[priority] || 'border-l-gray-500';
    };

    const generateTimelineScale = () => {
        if (!timelineData || !timelineData.tasks || timelineData.tasks.length === 0) return [];

        const allDates = timelineData.tasks.flatMap(task => [
            new Date(task.start_date),
            new Date(task.due_date)
        ]);

        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));

        const scale = [];
        const currentDate = new Date(minDate);

        while (currentDate <= maxDate) {
            scale.push(new Date(currentDate));
            if (viewMode === 'days') {
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (viewMode === 'weeks') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (viewMode === 'months') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }

        return scale;
    };

    const timelineScale = generateTimelineScale();

    const getTaskPosition = (task) => {
        if (!timelineScale.length) return { left: 0, width: 0 };

        const startDate = new Date(task.start_date);
        const endDate = new Date(task.due_date);
        const timelineStart = timelineScale[0];
        const timelineEnd = timelineScale[timelineScale.length - 1];

        const totalDays = calculateDaysBetween(timelineStart, timelineEnd);
        const taskStartDays = calculateDaysBetween(timelineStart, startDate);
        const taskDuration = calculateDaysBetween(startDate, endDate);

        const leftPercentage = (taskStartDays / totalDays) * 100;
        const widthPercentage = (taskDuration / totalDays) * 100;

        return {
            left: `${Math.max(0, leftPercentage)}%`,
            width: `${Math.max(1, widthPercentage)}%`
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gantt Chart
                    </h2>
                    <div className="flex space-x-2">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="days">Daily View</option>
                            <option value="weeks">Weekly View</option>
                            <option value="months">Monthly View</option>
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Gantt Chart" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Project Selection */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium text-gray-700">Select Project:</label>
                                <select
                                    value={selectedProject?.id || ''}
                                    onChange={(e) => {
                                        const project = projects.find(p => p.id === parseInt(e.target.value));
                                        setSelectedProject(project);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select a project</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>{project.project_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Gantt Chart */}
                        {selectedProject && timelineData ? (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {selectedProject.project_name} - Timeline
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span>{new Date(selectedProject.start_date).toLocaleDateString()} - {new Date(selectedProject.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                        {/* Timeline Header */}
                                        <div className="flex border-b border-gray-200">
                                            <div className="w-80 px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Task
                                            </div>
                                            <div className="flex-1 relative">
                                                <div className="flex">
                                                    {timelineScale.map((date, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex-1 px-2 py-3 text-xs text-center text-gray-500 border-r border-gray-200"
                                                            style={{ minWidth: '60px' }}
                                                        >
                                                            {viewMode === 'days' && date.getDate()}
                                                            {viewMode === 'weeks' && `W${Math.ceil(date.getDate() / 7)}`}
                                                            {viewMode === 'months' && date.toLocaleDateString('en-US', { month: 'short' })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tasks */}
                                        <div className="divide-y divide-gray-200">
                                            {timelineData.tasks.map((task) => {
                                                const position = getTaskPosition(task);
                                                return (
                                                    <div key={task.id} className="flex hover:bg-gray-50">
                                                        <div className={`w-80 px-4 py-3 border-l-4 ${getPriorityColor(task.priority)}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-gray-900">{task.name}</h4>
                                                                    <p className="text-xs text-gray-500">{task.assigned_user?.name}</p>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></span>
                                                                    <span className="text-xs text-gray-500">{task.progress}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 relative px-2 py-3">
                                                            <div className="relative h-6">
                                                                <div
                                                                    className={`absolute top-1 h-4 rounded ${getStatusColor(task.status)} opacity-80 cursor-pointer hover:opacity-100`}
                                                                    style={{
                                                                        left: position.left,
                                                                        width: position.width
                                                                    }}
                                                                    title={`${task.name} (${new Date(task.start_date).toLocaleDateString()} - ${new Date(task.due_date).toLocaleDateString()})`}
                                                                >
                                                                    <div className="h-full flex items-center justify-center">
                                                                        <span className="text-xs text-white font-medium">
                                                                            {task.progress}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Milestones */}
                                        {timelineData.milestones && timelineData.milestones.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-sm font-medium text-gray-900 mb-3">Milestones</h4>
                                                <div className="flex border-b border-gray-200">
                                                    <div className="w-80 px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500">
                                                        Milestone
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        {timelineData.milestones.map((milestone) => {
                                                            const position = getTaskPosition({
                                                                start_date: milestone.due_date,
                                                                due_date: milestone.due_date
                                                            });
                                                            return (
                                                                <div
                                                                    key={milestone.id}
                                                                    className="absolute top-3 transform -translate-x-1/2"
                                                                    style={{ left: position.left }}
                                                                >
                                                                    <FlagIcon className="w-4 h-4 text-red-500" />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="divide-y divide-gray-200">
                                                    {timelineData.milestones.map((milestone) => (
                                                        <div key={milestone.id} className="flex hover:bg-gray-50">
                                                            <div className="w-80 px-4 py-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <FlagIcon className="w-4 h-4 text-red-500" />
                                                                    <span className="text-sm font-medium text-gray-900">{milestone.name}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex-1 px-2 py-3">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                    milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    milestone.status === 'delayed' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                    {milestone.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {selectedProject ? 'Loading timeline...' : 'Select a project to view timeline'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedProject ? 'Please wait while we load the project timeline.' : 'Choose a project from the dropdown above to display its Gantt chart.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
