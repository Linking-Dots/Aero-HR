import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminManagementTemplate from '@/Layouts/AdminManagementTemplate';
import { 
    UserIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    StarIcon,
    AcademicCapIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function InstructorsIndex({ instructors }) {
    const [showModal, setShowModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        user_id: '',
        specialization: '',
        experience_years: '',
        qualification: '',
        rating: '',
        bio: '',
        is_active: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingInstructor) {
            put(route('lms.instructors.update', editingInstructor.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingInstructor(null);
                    reset();
                }
            });
        } else {
            post(route('lms.instructors.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (instructor) => {
        setEditingInstructor(instructor);
        setData({
            user_id: instructor.user_id,
            specialization: instructor.specialization,
            experience_years: instructor.experience_years,
            qualification: instructor.qualification,
            rating: instructor.rating || '',
            bio: instructor.bio || '',
            is_active: instructor.is_active
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this instructor?')) {
            router.delete(route('lms.instructors.destroy', id));
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            );
        }
        
        if (hasHalfStar) {
            stars.push(
                <StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
            );
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
            );
        }
        
        return stars;
    };

    return (
        <AdminManagementTemplate>
            <Head title="Instructor Management - LMS" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <UserIcon className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Instructor Management</h1>
                                <p className="text-gray-600">Manage course instructors and their profiles</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Add Instructor</span>
                        </button>
                    </div>
                </div>

                {/* Instructors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instructors.map((instructor) => (
                        <div key={instructor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        {instructor.rating && (
                                            <div className="flex items-center">
                                                {renderStars(instructor.rating)}
                                                <span className="text-sm text-gray-500 ml-2">
                                                    {instructor.rating}/5
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(instructor)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(instructor.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <UserIcon className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {instructor.user?.name || 'N/A'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {instructor.user?.email || 'N/A'}
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">
                                            <strong>Specialization:</strong> {instructor.specialization}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 text-sm">
                                        <ClockIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">
                                            <strong>Experience:</strong> {instructor.experience_years} years
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 text-sm">
                                        <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">
                                            <strong>Qualification:</strong> {instructor.qualification}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 text-sm">
                                        <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">
                                            <strong>Courses:</strong> {instructor.courses_count || 0}
                                        </span>
                                    </div>
                                </div>
                                
                                {instructor.bio && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {instructor.bio}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${instructor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {instructor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {instructors.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first instructor</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Add Instructor
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
                                    {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingInstructor(null);
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
                                {!editingInstructor && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select User
                                        </label>
                                        <select
                                            value={data.user_id}
                                            onChange={(e) => setData('user_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        >
                                            <option value="">Select a user...</option>
                                            {/* You would populate this with available users */}
                                        </select>
                                        {errors.user_id && <p className="text-red-600 text-sm mt-1">{errors.user_id}</p>}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="e.g., Web Development, Data Science"
                                        required
                                    />
                                    {errors.specialization && <p className="text-red-600 text-sm mt-1">{errors.specialization}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Experience (years)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.experience_years}
                                            onChange={(e) => setData('experience_years', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            min="0"
                                            required
                                        />
                                        {errors.experience_years && <p className="text-red-600 text-sm mt-1">{errors.experience_years}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rating (1-5)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.rating}
                                            onChange={(e) => setData('rating', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                        />
                                        {errors.rating && <p className="text-red-600 text-sm mt-1">{errors.rating}</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qualification
                                    </label>
                                    <input
                                        type="text"
                                        value={data.qualification}
                                        onChange={(e) => setData('qualification', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="e.g., PhD in Computer Science, Master's in Data Science"
                                        required
                                    />
                                    {errors.qualification && <p className="text-red-600 text-sm mt-1">{errors.qualification}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="Brief description of instructor's background and expertise"
                                    />
                                    {errors.bio && <p className="text-red-600 text-sm mt-1">{errors.bio}</p>}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Active Instructor
                                    </label>
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingInstructor(null);
                                            reset();
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : editingInstructor ? 'Update Instructor' : 'Add Instructor'}
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
