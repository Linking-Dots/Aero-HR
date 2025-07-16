import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeft, 
    Edit, 
    FileText, 
    Calendar, 
    User, 
    Building2, 
    Package,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Target,
    Clipboard,
    Download,
    Eye
} from 'lucide-react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: Clock },
        in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: AlertCircle },
        completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
        cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            <Icon className="w-4 h-4 mr-1" />
            {config.label}
        </span>
    );
};

const ResultBadge = ({ result }) => {
    const getResultConfig = (result) => {
        switch (result) {
            case 'passed':
                return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Passed' };
            case 'failed':
                return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' };
            case 'conditionally_passed':
                return { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Conditionally Passed' };
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' };
        }
    };

    const config = getResultConfig(result);
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            <Icon className="w-4 h-4 mr-1" />
            {config.label}
        </span>
    );
};

const CheckpointCard = ({ checkpoint, index }) => {
    const getResultIcon = (result) => {
        switch (result) {
            case 'pass':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'fail':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'conditional':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className={`border-l-4 ${checkpoint.is_critical ? 'border-red-400 bg-red-50' : 'border-blue-400 bg-white'} p-4 rounded-r-lg shadow-sm`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">{checkpoint.checkpoint}</h4>
                        {checkpoint.is_critical && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Critical
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{checkpoint.requirement}</p>
                </div>
                <div className="flex items-center space-x-2">
                    {getResultIcon(checkpoint.result)}
                    <span className="text-sm font-medium text-gray-700">
                        {checkpoint.result?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {checkpoint.measurement_method && (
                    <div>
                        <span className="font-medium text-gray-700">Method:</span>
                        <span className="ml-2 text-gray-600">{checkpoint.measurement_method}</span>
                    </div>
                )}
                {checkpoint.acceptable_range && (
                    <div>
                        <span className="font-medium text-gray-700">Range:</span>
                        <span className="ml-2 text-gray-600">{checkpoint.acceptable_range}</span>
                    </div>
                )}
                {checkpoint.actual_value && (
                    <div>
                        <span className="font-medium text-gray-700">Actual:</span>
                        <span className="ml-2 text-gray-600">{checkpoint.actual_value}</span>
                    </div>
                )}
                {checkpoint.notes && (
                    <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <span className="ml-2 text-gray-600">{checkpoint.notes}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const Show = ({ auth, inspection }) => {
    const [activeTab, setActiveTab] = useState('details');

    const tabs = [
        { id: 'details', name: 'Inspection Details', icon: FileText },
        { id: 'checkpoints', name: 'Checkpoints', icon: Clipboard },
        { id: 'history', name: 'History', icon: Clock },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link
                            href={route('quality.inspections.index')}
                            className="mr-4 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {inspection.title}
                            </h2>
                            <p className="text-sm text-gray-600">#{inspection.inspection_number}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            href={route('quality.inspections.edit', inspection.id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Inspection - ${inspection.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Status Overview */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        <StatusBadge status={inspection.status} />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Current Status</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                        <ResultBadge result={inspection.result_status} />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Result</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {inspection.checkpoints ? inspection.checkpoints.length : 0}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Checkpoints</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {inspection.overall_score || 'N/A'}%
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
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
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                            <dl className="space-y-3">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Inspection Type
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                                                        {inspection.type?.replace('_', ' ')}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        Inspection Date
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {new Date(inspection.inspection_date).toLocaleDateString()}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                        <User className="w-4 h-4 mr-2" />
                                                        Inspector
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {inspection.inspector?.name || 'Not Assigned'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                        <Building2 className="w-4 h-4 mr-2" />
                                                        Department
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {inspection.department?.name || 'Not Specified'}
                                                    </dd>
                                                </div>
                                                {inspection.product_batch && (
                                                    <div>
                                                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                            <Package className="w-4 h-4 mr-2" />
                                                            Product/Batch
                                                        </dt>
                                                        <dd className="mt-1 text-sm text-gray-900">
                                                            {inspection.product_batch}
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Inspection Summary</h3>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                {inspection.description && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                                                        <p className="text-sm text-gray-600">{inspection.description}</p>
                                                    </div>
                                                )}
                                                {inspection.notes && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                                                        <p className="text-sm text-gray-600">{inspection.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Checkpoints Tab */}
                            {activeTab === 'checkpoints' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">Inspection Checkpoints</h3>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <span className="flex items-center">
                                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                                Passed
                                            </span>
                                            <span className="flex items-center">
                                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                                Failed
                                            </span>
                                            <span className="flex items-center">
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                                Conditional
                                            </span>
                                        </div>
                                    </div>

                                    {inspection.checkpoints && inspection.checkpoints.length > 0 ? (
                                        <div className="space-y-4">
                                            {inspection.checkpoints.map((checkpoint, index) => (
                                                <CheckpointCard
                                                    key={checkpoint.id || index}
                                                    checkpoint={checkpoint}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Clipboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No checkpoints defined for this inspection.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* History Tab */}
                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Inspection History</h3>
                                    
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            <li>
                                                <div className="relative pb-8">
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                                <FileText className="h-5 w-5 text-white" />
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    Inspection created
                                                                </p>
                                                            </div>
                                                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                                <time dateTime={inspection.created_at}>
                                                                    {new Date(inspection.created_at).toLocaleDateString()}
                                                                </time>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            
                                            {inspection.updated_at !== inspection.created_at && (
                                                <li>
                                                    <div className="relative pb-8">
                                                        <div className="relative flex space-x-3">
                                                            <div>
                                                                <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                                                                    <Edit className="h-5 w-5 text-white" />
                                                                </span>
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        Inspection updated
                                                                    </p>
                                                                </div>
                                                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                                    <time dateTime={inspection.updated_at}>
                                                                        {new Date(inspection.updated_at).toLocaleDateString()}
                                                                    </time>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Show;
