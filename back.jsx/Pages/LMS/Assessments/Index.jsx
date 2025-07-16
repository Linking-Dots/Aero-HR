import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminManagementTemplate from '@/Layouts/AdminManagementTemplate';
import { 
    ClipboardDocumentCheckIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    AcademicCapIcon,
    ClockIcon,
    ChartBarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AssessmentsIndex({ assessments }) {
    const [showModal, setShowModal] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        course_id: '',
        title: '',
        description: '',
        type: 'quiz',
        total_marks: '',
        pass_marks: '',
        duration_minutes: '',
        is_active: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingAssessment) {
            put(route('lms.assessments.update', editingAssessment.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingAssessment(null);
                    reset();
                }
            });
        } else {
            post(route('lms.assessments.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (assessment) => {
        setEditingAssessment(assessment);
        setData({
            course_id: assessment.course_id,
            title: assessment.title,
            description: assessment.description || '',
            type: assessment.type,
            total_marks: assessment.total_marks,
            pass_marks: assessment.pass_marks,
            duration_minutes: assessment.duration_minutes || '',
            is_active: assessment.is_active
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this assessment?')) {
            router.delete(route('lms.assessments.destroy', id));
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'quiz': return 'bg-blue-100 text-blue-800';
            case 'assignment': return 'bg-green-100 text-green-800';
            case 'exam': return 'bg-red-100 text-red-800';
            case 'project': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'quiz': return <ClipboardDocumentCheckIcon className="h-4 w-4" />;
            case 'assignment': return <AcademicCapIcon className="h-4 w-4" />;
            case 'exam': return <CheckCircleIcon className="h-4 w-4" />;
            case 'project': return <ChartBarIcon className="h-4 w-4" />;
            default: return <ClipboardDocumentCheckIcon className="h-4 w-4" />;
        }
    };

    return (
        <AdminManagementTemplate>
            <Head title="Assessment Management - LMS" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <ClipboardDocumentCheckIcon className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
                                <p className="text-gray-600">Create and manage course assessments and exams</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Create Assessment</span>
                        </button>
                    </div>
                </div>

                {/* Assessments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map((assessment) => (
                        <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(assessment.type)}`}>
                                            {getTypeIcon(assessment.type)}
                                            <span className="ml-1">{assessment.type}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(assessment)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(assessment.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assessment.title}</h3>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <AcademicCapIcon className="h-4 w-4" />
                                        <span>{assessment.course?.title || 'No course assigned'}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <ChartBarIcon className="h-4 w-4" />
                                        <span>{assessment.total_marks} marks (Pass: {assessment.pass_marks})</span>
                                    </div>
                                    
                                    {assessment.duration_minutes && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <ClockIcon className="h-4 w-4" />
                                            <span>{assessment.duration_minutes} minutes</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <CheckCircleIcon className="h-4 w-4" />
                                        <span>{assessment.results_count || 0} submissions</span>
                                    </div>
                                </div>
                                
                                {assessment.description && (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {assessment.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assessment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {assessment.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    
                                    {assessment.average_score !== undefined && (
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                Avg: {Math.round(assessment.average_score)}%
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Pass rate: {Math.round(assessment.pass_rate || 0)}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {assessments.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <ClipboardDocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first assessment</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Create Assessment
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingAssessment(null);
                                        reset();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course
                                    </label>
                                    <select
                                        value={data.course_id}
                                        onChange={(e) => setData('course_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Select a course...</option>
                                        {/* You would populate this with available courses */}
                                    </select>
                                    {errors.course_id && <p className="text-red-600 text-sm mt-1">{errors.course_id}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assessment Title
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., Final Exam, Weekly Quiz"
                                        required
                                    />
                                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Brief description of the assessment"
                                    />
                                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assessment Type
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="quiz">Quiz</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="exam">Exam</option>
                                        <option value="project">Project</option>
                                    </select>
                                    {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total Marks
                                        </label>
                                        <input
                                            type="number"
                                            value={data.total_marks}
                                            onChange={(e) => setData('total_marks', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            min="1"
                                            required
                                        />
                                        {errors.total_marks && <p className="text-red-600 text-sm mt-1">{errors.total_marks}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pass Marks
                                        </label>
                                        <input
                                            type="number"
                                            value={data.pass_marks}
                                            onChange={(e) => setData('pass_marks', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            min="1"
                                            required
                                        />
                                        {errors.pass_marks && <p className="text-red-600 text-sm mt-1">{errors.pass_marks}</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        min="1"
                                        placeholder="Leave empty for untimed assessment"
                                    />
                                    {errors.duration_minutes && <p className="text-red-600 text-sm mt-1">{errors.duration_minutes}</p>}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Active Assessment
                                    </label>
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingAssessment(null);
                                            reset();
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : editingAssessment ? 'Update Assessment' : 'Create Assessment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminManagementTemplate>
    );
}
