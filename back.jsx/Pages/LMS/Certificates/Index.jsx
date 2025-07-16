import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    DocumentIcon,
    AcademicCapIcon,
    UserGroupIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PrinterIcon
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

const CertificatesIndex = ({ certificates, courses, students, stats, auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [certificateToDelete, setCertificateToDelete] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewCertificate, setPreviewCertificate] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        student_id: '',
        course_id: '',
        certificate_template: '',
        issue_date: '',
        expiry_date: '',
        certificate_number: '',
        status: 'draft',
        notes: ''
    });

    // Statistics for dashboard cards
    const dashboardStats = [
        { 
            title: 'Total Certificates', 
            value: stats?.total_certificates || 0, 
            icon: DocumentIcon, 
            color: 'blue',
            change: '+12%',
            changeType: 'positive'
        },
        { 
            title: 'Active Certificates', 
            value: stats?.active_certificates || 0, 
            icon: CheckCircleIcon, 
            color: 'green',
            change: '+8%',
            changeType: 'positive'
        },
        { 
            title: 'Pending Certificates', 
            value: stats?.pending_certificates || 0, 
            icon: CalendarIcon, 
            color: 'yellow',
            change: '+5%',
            changeType: 'positive'
        },
        { 
            title: 'Expired Certificates', 
            value: stats?.expired_certificates || 0, 
            icon: XCircleIcon, 
            color: 'red',
            change: '-2%',
            changeType: 'negative'
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCertificate) {
            put(`/lms/certificates/${editingCertificate.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingCertificate(null);
                    reset();
                }
            });
        } else {
            post('/lms/certificates', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (certificate) => {
        setEditingCertificate(certificate);
        setData({
            student_id: certificate.student_id,
            course_id: certificate.course_id,
            certificate_template: certificate.certificate_template,
            issue_date: certificate.issue_date,
            expiry_date: certificate.expiry_date,
            certificate_number: certificate.certificate_number,
            status: certificate.status,
            notes: certificate.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = (certificate) => {
        setCertificateToDelete(certificate);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (certificateToDelete) {
            post(`/lms/certificates/${certificateToDelete.id}`, {
                _method: 'DELETE',
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setCertificateToDelete(null);
                }
            });
        }
    };

    const handlePreview = (certificate) => {
        setPreviewCertificate(certificate);
        setShowPreview(true);
    };

    const generateCertificate = (certificateId) => {
        // In a real app, this would generate the actual certificate
        alert(`Generating certificate for ID: ${certificateId}`);
    };

    const filteredCertificates = certificates?.filter(certificate => {
        const matchesSearch = 
            certificate.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            certificate.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            certificate.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || certificate.status === statusFilter;
        const matchesCourse = courseFilter === 'all' || certificate.course_id === parseInt(courseFilter);
        
        return matchesSearch && matchesStatus && matchesCourse;
    }) || [];

    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'issued', label: 'Issued' },
        { value: 'expired', label: 'Expired' },
        { value: 'revoked', label: 'Revoked' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'issued': return 'bg-green-100 text-green-800';
            case 'expired': return 'bg-red-100 text-red-800';
            case 'revoked': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <AdminManagementTemplate
            title="Certificate Management"
            subtitle="Manage student certificates and certifications"
            auth={auth}
            stats={dashboardStats}
            actions={
                <div className="flex gap-3">
                    <SecondaryButton
                        onClick={() => window.print()}
                        className="flex items-center gap-2"
                    >
                        <PrinterIcon className="h-4 w-4" />
                        Print
                    </SecondaryButton>
                    <SecondaryButton
                        onClick={() => alert('Export functionality')}
                        className="flex items-center gap-2"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export
                    </SecondaryButton>
                    {hasPermission(auth.user, 'create_certificate') && (
                        <PrimaryButton
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Issue Certificate
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title="Certificate Management" />

            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <TextInput
                                type="text"
                                placeholder="Search by certificate number, student, or course..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <SelectInput
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="min-w-[150px]"
                        >
                            <option value="all">All Status</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectInput>
                        <SelectInput
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="min-w-[150px]"
                        >
                            <option value="all">All Courses</option>
                            {courses?.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-white/20">
                            <tr>
                                <th className="text-left p-4 font-medium text-gray-700">Certificate</th>
                                <th className="text-left p-4 font-medium text-gray-700">Student</th>
                                <th className="text-left p-4 font-medium text-gray-700">Course</th>
                                <th className="text-left p-4 font-medium text-gray-700">Issue Date</th>
                                <th className="text-left p-4 font-medium text-gray-700">Expiry Date</th>
                                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            {filteredCertificates.map((certificate) => (
                                <tr key={certificate.id} className="hover:bg-white/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                <AcademicCapIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {certificate.certificate_number}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {certificate.certificate_template}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-900">
                                            {certificate.student?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {certificate.student?.email || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-900">
                                            {certificate.course?.title || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {certificate.course?.code || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-900">
                                        {formatDate(certificate.issue_date)}
                                    </td>
                                    <td className="p-4 text-sm text-gray-900">
                                        {certificate.expiry_date ? formatDate(certificate.expiry_date) : 'No expiry'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(certificate.status)}`}>
                                            {certificate.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePreview(certificate)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Preview Certificate"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => generateCertificate(certificate.id)}
                                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Generate Certificate"
                                            >
                                                <DocumentIcon className="h-4 w-4" />
                                            </button>
                                            {hasPermission(auth.user, 'edit_certificate') && (
                                                <button
                                                    onClick={() => handleEdit(certificate)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Certificate"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            {hasPermission(auth.user, 'delete_certificate') && (
                                                <button
                                                    onClick={() => handleDelete(certificate)}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Certificate"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Certificate Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900">
                        {editingCertificate ? 'Edit Certificate' : 'Issue New Certificate'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="student_id" value="Student" />
                            <SelectInput
                                id="student_id"
                                value={data.student_id}
                                onChange={(e) => setData('student_id', e.target.value)}
                                required
                            >
                                <option value="">Select Student</option>
                                {students?.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} ({student.email})
                                    </option>
                                ))}
                            </SelectInput>
                            {errors.student_id && <p className="text-red-600 text-sm mt-1">{errors.student_id}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="course_id" value="Course" />
                            <SelectInput
                                id="course_id"
                                value={data.course_id}
                                onChange={(e) => setData('course_id', e.target.value)}
                                required
                            >
                                <option value="">Select Course</option>
                                {courses?.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title} ({course.code})
                                    </option>
                                ))}
                            </SelectInput>
                            {errors.course_id && <p className="text-red-600 text-sm mt-1">{errors.course_id}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="certificate_number" value="Certificate Number" />
                            <TextInput
                                id="certificate_number"
                                type="text"
                                value={data.certificate_number}
                                onChange={(e) => setData('certificate_number', e.target.value)}
                                required
                                placeholder="CERT-2024-001"
                            />
                            {errors.certificate_number && <p className="text-red-600 text-sm mt-1">{errors.certificate_number}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="certificate_template" value="Certificate Template" />
                            <SelectInput
                                id="certificate_template"
                                value={data.certificate_template}
                                onChange={(e) => setData('certificate_template', e.target.value)}
                                required
                            >
                                <option value="">Select Template</option>
                                <option value="completion">Course Completion</option>
                                <option value="achievement">Achievement Certificate</option>
                                <option value="participation">Participation Certificate</option>
                                <option value="excellence">Excellence Award</option>
                            </SelectInput>
                            {errors.certificate_template && <p className="text-red-600 text-sm mt-1">{errors.certificate_template}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="issue_date" value="Issue Date" />
                            <TextInput
                                id="issue_date"
                                type="date"
                                value={data.issue_date}
                                onChange={(e) => setData('issue_date', e.target.value)}
                                required
                            />
                            {errors.issue_date && <p className="text-red-600 text-sm mt-1">{errors.issue_date}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="expiry_date" value="Expiry Date (Optional)" />
                            <TextInput
                                id="expiry_date"
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                            />
                            {errors.expiry_date && <p className="text-red-600 text-sm mt-1">{errors.expiry_date}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <SelectInput
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                required
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="notes" value="Notes" />
                            <TextareaInput
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                placeholder="Additional notes or comments..."
                            />
                            {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={() => setShowModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {editingCertificate ? 'Update Certificate' : 'Issue Certificate'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Confirm Delete</h2>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete certificate "{certificateToDelete?.certificate_number}"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            Delete Certificate
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminManagementTemplate>
    );
};

export default CertificatesIndex;
