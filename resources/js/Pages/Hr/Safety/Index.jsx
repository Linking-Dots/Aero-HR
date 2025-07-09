import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    CalendarDaysIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import AdminManagementTemplate from '@/Components/Templates/AdminManagementTemplate';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { formatDate } from '@/utils/dateUtils';
import { hasPermission } from '@/utils/permissionUtils';

const WorkplaceSafetyIndex = ({ incidents = [], inspections = [], trainings = [], stats = {}, auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedTab, setSelectedTab] = useState('incidents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState('incident'); // incident, inspection, training

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        // Incident fields
        title: '',
        description: '',
        incident_type: '',
        severity: '',
        location: '',
        date_occurred: '',
        time_occurred: '',
        reported_by: '',
        witnesses: '',
        injuries: '',
        property_damage: '',
        immediate_actions: '',
        investigation_notes: '',
        corrective_actions: '',
        status: 'open',
        // Inspection fields
        inspection_area: '',
        inspector_name: '',
        inspection_date: '',
        inspection_type: '',
        findings: '',
        recommendations: '',
        follow_up_required: false,
        follow_up_date: '',
        // Training fields
        training_title: '',
        training_description: '',
        trainer_name: '',
        training_date: '',
        duration: '',
        attendees: '',
        training_type: '',
        materials: '',
        completion_criteria: '',
        certificate_issued: false
    });

    const mockIncidents = incidents.length === 0 ? [
        {
            id: 1,
            title: 'Slip and Fall in Warehouse',
            description: 'Employee slipped on wet floor near loading dock',
            incident_type: 'Slip/Fall',
            severity: 'Minor',
            location: 'Warehouse - Loading Dock',
            date_occurred: '2024-01-15',
            reported_by: 'John Smith',
            status: 'under_investigation',
            injuries: 'Minor bruising on knee',
            created_at: '2024-01-15T10:30:00Z'
        },
        {
            id: 2,
            title: 'Chemical Spill in Lab',
            description: 'Small chemical spill during routine testing',
            incident_type: 'Chemical',
            severity: 'Moderate',
            location: 'Laboratory - Room 205',
            date_occurred: '2024-01-20',
            reported_by: 'Sarah Johnson',
            status: 'resolved',
            injuries: 'None',
            created_at: '2024-01-20T14:15:00Z'
        },
        {
            id: 3,
            title: 'Equipment Malfunction',
            description: 'Conveyor belt stopped unexpectedly',
            incident_type: 'Equipment',
            severity: 'Minor',
            location: 'Production Floor A',
            date_occurred: '2024-01-25',
            reported_by: 'Mike Wilson',
            status: 'open',
            injuries: 'None',
            created_at: '2024-01-25T09:45:00Z'
        }
    ] : incidents;

    const mockInspections = inspections.length === 0 ? [
        {
            id: 1,
            inspection_area: 'Fire Safety Systems',
            inspector_name: 'Safety Team',
            inspection_date: '2024-01-10',
            inspection_type: 'Monthly',
            status: 'completed',
            findings: 'All fire extinguishers checked and functional',
            recommendations: 'Replace batteries in smoke detectors',
            follow_up_required: true,
            follow_up_date: '2024-02-10'
        },
        {
            id: 2,
            inspection_area: 'Electrical Systems',
            inspector_name: 'External Contractor',
            inspection_date: '2024-01-22',
            inspection_type: 'Annual',
            status: 'in_progress',
            findings: 'Minor wiring issues in break room',
            recommendations: 'Schedule electrical repairs',
            follow_up_required: true,
            follow_up_date: '2024-02-01'
        }
    ] : inspections;

    const mockTrainings = trainings.length === 0 ? [
        {
            id: 1,
            training_title: 'Emergency Response Procedures',
            training_description: 'Annual emergency response training',
            trainer_name: 'Safety Coordinator',
            training_date: '2024-02-01',
            duration: '2 hours',
            attendees: 25,
            training_type: 'Mandatory',
            status: 'scheduled',
            completion_rate: 0
        },
        {
            id: 2,
            training_title: 'Chemical Handling Safety',
            training_description: 'Safe handling of hazardous chemicals',
            trainer_name: 'External Expert',
            training_date: '2024-01-15',
            duration: '4 hours',
            attendees: 12,
            training_type: 'Mandatory',
            status: 'completed',
            completion_rate: 100
        }
    ] : trainings;

    const mockStats = Object.keys(stats).length === 0 ? {
        total_incidents: 15,
        open_incidents: 5,
        resolved_incidents: 10,
        monthly_inspections: 8,
        overdue_inspections: 2,
        safety_trainings: 6,
        trained_employees: 95,
        safety_score: 88
    } : stats;

    const incidentTypes = ['Slip/Fall', 'Chemical', 'Equipment', 'Fire', 'Electrical', 'Vehicle', 'Violence', 'Other'];
    const severityLevels = ['Minor', 'Moderate', 'Serious', 'Critical'];
    const statusOptions = ['open', 'under_investigation', 'resolved', 'closed'];

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical':
                return 'bg-red-100 text-red-800';
            case 'Serious':
                return 'bg-orange-100 text-orange-800';
            case 'Moderate':
                return 'bg-yellow-100 text-yellow-800';
            case 'Minor':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-red-100 text-red-800';
            case 'under_investigation':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeMap = {
            incident: editingItem ? route('hr.safety.incidents.update', editingItem.id) : route('hr.safety.incidents.store'),
            inspection: editingItem ? route('hr.safety.inspections.update', editingItem.id) : route('hr.safety.inspections.store'),
            training: editingItem ? route('hr.safety.training.update', editingItem.id) : route('hr.safety.training.store')
        };

        if (editingItem) {
            put(routeMap[modalType], {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    reset();
                }
            });
        } else {
            post(routeMap[modalType], {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (item, type) => {
        setEditingItem(item);
        setModalType(type);
        // Set appropriate data based on type
        if (type === 'incident') {
            setData({
                title: item.title || '',
                description: item.description || '',
                incident_type: item.incident_type || '',
                severity: item.severity || '',
                location: item.location || '',
                status: item.status || 'open'
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = (item, type) => {
        const routeMap = {
            incident: route('hr.safety.incidents.destroy', item.id),
            inspection: route('hr.safety.inspections.destroy', item.id),
            training: route('hr.safety.training.destroy', item.id)
        };

        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            destroy(routeMap[type]);
        }
    };

    const tabs = [
        { id: 'incidents', name: 'Safety Incidents', icon: ExclamationTriangleIcon },
        { id: 'inspections', name: 'Safety Inspections', icon: ClipboardDocumentCheckIcon },
        { id: 'training', name: 'Safety Training', icon: UserGroupIcon },
        { id: 'reports', name: 'Safety Reports', icon: DocumentTextIcon }
    ];

    const renderIncidentsTab = () => (
        <div className="space-y-6">
            {/* Incidents Header */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Safety Incidents</h3>
                        <p className="text-sm text-gray-600">Track and manage workplace safety incidents</p>
                    </div>
                    {hasPermission(auth.user, 'hr.safety.incidents.create') && (
                        <PrimaryButton
                            onClick={() => {
                                setEditingItem(null);
                                setModalType('incident');
                                reset();
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Report Incident
                        </PrimaryButton>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <TextInput
                                placeholder="Search incidents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <SelectInput
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-48"
                    >
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="under_investigation">Under Investigation</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </SelectInput>
                </div>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
                {mockIncidents.map((incident) => (
                    <div key={incident.id} className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">{incident.title}</h4>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                                        {incident.severity}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                        {incident.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{incident.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Type:</span>
                                        <span className="ml-2 font-medium">{incident.incident_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Location:</span>
                                        <span className="ml-2 font-medium">{incident.location}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <span className="ml-2 font-medium">{formatDate(incident.date_occurred)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Reported by:</span>
                                        <span className="ml-2 font-medium">{incident.reported_by}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Injuries:</span>
                                        <span className="ml-2 font-medium">{incident.injuries}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Created:</span>
                                        <span className="ml-2 font-medium">{formatDate(incident.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                                <SecondaryButton onClick={() => {}}>
                                    <EyeIcon className="w-4 h-4" />
                                </SecondaryButton>
                                {hasPermission(auth.user, 'hr.safety.incidents.update') && (
                                    <SecondaryButton onClick={() => handleEdit(incident, 'incident')}>
                                        <PencilIcon className="w-4 h-4" />
                                    </SecondaryButton>
                                )}
                                {hasPermission(auth.user, 'hr.safety.incidents.delete') && (
                                    <DangerButton onClick={() => handleDelete(incident, 'incident')}>
                                        <TrashIcon className="w-4 h-4" />
                                    </DangerButton>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderInspectionsTab = () => (
        <div className="space-y-6">
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Safety Inspections</h3>
                        <p className="text-sm text-gray-600">Schedule and track safety inspections</p>
                    </div>
                    {hasPermission(auth.user, 'hr.safety.inspections.create') && (
                        <PrimaryButton
                            onClick={() => {
                                setEditingItem(null);
                                setModalType('inspection');
                                reset();
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Schedule Inspection
                        </PrimaryButton>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockInspections.map((inspection) => (
                    <div key={inspection.id} className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{inspection.inspection_area}</h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                                    {inspection.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-500" />
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Inspector:</span>
                                <span className="font-medium">{inspection.inspector_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span className="font-medium">{formatDate(inspection.inspection_date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Type:</span>
                                <span className="font-medium">{inspection.inspection_type}</span>
                            </div>
                            {inspection.follow_up_required && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Follow-up:</span>
                                    <span className="font-medium text-yellow-600">{formatDate(inspection.follow_up_date)}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-600">{inspection.findings}</p>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            <SecondaryButton className="flex-1 justify-center">
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View Details
                            </SecondaryButton>
                            {hasPermission(auth.user, 'hr.safety.inspections.update') && (
                                <SecondaryButton
                                    onClick={() => handleEdit(inspection, 'inspection')}
                                    className="flex-1 justify-center"
                                >
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    Edit
                                </SecondaryButton>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AdminManagementTemplate>
            <Head title="Workplace Safety" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Workplace Safety</h1>
                            <p className="text-red-100">Manage workplace safety incidents, inspections, and training programs</p>
                        </div>
                        <ShieldCheckIcon className="w-12 h-12 text-red-200" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.total_incidents}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <ClockIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.open_incidents}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Resolved</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.resolved_incidents}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Inspections</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.monthly_inspections}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <CalendarDaysIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Overdue</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.overdue_inspections}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <UserGroupIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Trainings</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.safety_trainings}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Trained Staff</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.trained_employees}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Safety Score</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.safety_score}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                                            selectedTab === tab.id
                                                ? 'border-red-500 text-red-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {selectedTab === 'incidents' && renderIncidentsTab()}
                        {selectedTab === 'inspections' && renderInspectionsTab()}
                        {selectedTab === 'training' && (
                            <div className="text-center py-12">
                                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Safety Training</h3>
                                <p className="mt-1 text-sm text-gray-500">Manage safety training programs and certifications</p>
                            </div>
                        )}
                        {selectedTab === 'reports' && (
                            <div className="text-center py-12">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Safety Reports</h3>
                                <p className="mt-1 text-sm text-gray-500">Generate and view safety compliance reports</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingItem ? `Edit ${modalType}` : `Report New ${modalType}`}
                    </h2>

                    {modalType === 'incident' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="title" value="Incident Title" />
                                <TextInput
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="incident_type" value="Incident Type" />
                                <SelectInput
                                    id="incident_type"
                                    value={data.incident_type}
                                    onChange={(e) => setData('incident_type', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {incidentTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </SelectInput>
                                {errors.incident_type && <div className="text-red-600 text-sm mt-1">{errors.incident_type}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="severity" value="Severity" />
                                <SelectInput
                                    id="severity"
                                    value={data.severity}
                                    onChange={(e) => setData('severity', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                >
                                    <option value="">Select Severity</option>
                                    {severityLevels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </SelectInput>
                                {errors.severity && <div className="text-red-600 text-sm mt-1">{errors.severity}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="location" value="Location" />
                                <TextInput
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {errors.location && <div className="text-red-600 text-sm mt-1">{errors.location}</div>}
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <SelectInput
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 block w-full"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status.replace('_', ' ').toUpperCase()}
                                        </option>
                                    ))}
                                </SelectInput>
                                {errors.status && <div className="text-red-600 text-sm mt-1">{errors.status}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="description" value="Description" />
                                <TextareaInput
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full"
                                    rows={4}
                                    required
                                />
                                {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {editingItem ? `Update ${modalType}` : `Report ${modalType}`}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminManagementTemplate>
    );
};

export default WorkplaceSafetyIndex;
