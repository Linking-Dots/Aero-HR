import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    DocumentIcon,
    FolderIcon,
    CloudArrowUpIcon,
    CloudArrowDownIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    DocumentTextIcon,
    DocumentPdfIcon,
    PhotoIcon,
    VideoCameraIcon,
    ArchiveBoxIcon,
    LockClosedIcon,
    ClockIcon,
    UserIcon,
    CalendarDaysIcon,
    TagIcon
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
import { formatDate, formatFileSize } from '@/utils/dateUtils';
import { hasPermission } from '@/utils/permissionUtils';

const DocumentsIndex = ({ documents = [], categories = [], stats = {}, auth }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTab, setSelectedTab] = useState('documents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        description: '',
        category_id: '',
        document_type: '',
        access_level: 'public',
        tags: '',
        expiry_date: '',
        is_confidential: false,
        requires_signature: false,
        file: null,
        category_name: '',
        category_description: '',
        category_color: '#3B82F6'
    });

    const mockDocuments = documents.length === 0 ? [
        {
            id: 1,
            title: 'Employee Handbook 2024',
            description: 'Updated employee handbook with new policies',
            category: 'Policies',
            document_type: 'PDF',
            file_size: 2548576,
            access_level: 'public',
            is_confidential: false,
            uploaded_by: 'HR Manager',
            upload_date: '2024-01-15T10:00:00Z',
            last_accessed: '2024-01-20T14:30:00Z',
            download_count: 45,
            tags: ['handbook', 'policies', '2024'],
            expiry_date: null,
            status: 'active'
        },
        {
            id: 2,
            title: 'Confidential Salary Structure',
            description: 'Internal salary structure document',
            category: 'Compensation',
            document_type: 'Excel',
            file_size: 1024000,
            access_level: 'restricted',
            is_confidential: true,
            uploaded_by: 'Finance Director',
            upload_date: '2024-01-10T09:15:00Z',
            last_accessed: '2024-01-18T11:45:00Z',
            download_count: 8,
            tags: ['salary', 'compensation', 'confidential'],
            expiry_date: '2024-12-31',
            status: 'active'
        },
        {
            id: 3,
            title: 'Training Materials - Q1 2024',
            description: 'Quarterly training materials and resources',
            category: 'Training',
            document_type: 'ZIP',
            file_size: 15728640,
            access_level: 'public',
            is_confidential: false,
            uploaded_by: 'Training Coordinator',
            upload_date: '2024-01-05T16:20:00Z',
            last_accessed: '2024-01-22T08:30:00Z',
            download_count: 72,
            tags: ['training', 'materials', 'Q1', '2024'],
            expiry_date: '2024-03-31',
            status: 'active'
        },
        {
            id: 4,
            title: 'Performance Review Template',
            description: 'Standard template for annual performance reviews',
            category: 'Performance',
            document_type: 'Word',
            file_size: 524288,
            access_level: 'managers',
            is_confidential: false,
            uploaded_by: 'HR Specialist',
            upload_date: '2024-01-08T13:45:00Z',
            last_accessed: '2024-01-19T15:20:00Z',
            download_count: 23,
            tags: ['performance', 'review', 'template'],
            expiry_date: null,
            status: 'active'
        }
    ] : documents;

    const mockCategories = categories.length === 0 ? [
        { id: 1, name: 'Policies', description: 'Company policies and procedures', color: '#3B82F6', document_count: 12 },
        { id: 2, name: 'Training', description: 'Training materials and resources', color: '#10B981', document_count: 18 },
        { id: 3, name: 'Performance', description: 'Performance management documents', color: '#F59E0B', document_count: 8 },
        { id: 4, name: 'Compensation', description: 'Salary and benefits information', color: '#EF4444', document_count: 5 },
        { id: 5, name: 'Legal', description: 'Legal documents and contracts', color: '#8B5CF6', document_count: 7 },
        { id: 6, name: 'Onboarding', description: 'New employee onboarding materials', color: '#06B6D4', document_count: 15 }
    ] : categories;

    const mockStats = Object.keys(stats).length === 0 ? {
        total_documents: 65,
        total_size: 156789632,
        categories: 6,
        downloads_this_month: 234,
        confidential_docs: 12,
        expiring_soon: 3
    } : stats;

    const documentTypes = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Image', 'Video', 'ZIP', 'Other'];
    const accessLevels = [
        { value: 'public', label: 'Public - All employees' },
        { value: 'managers', label: 'Managers only' },
        { value: 'restricted', label: 'Restricted access' },
        { value: 'confidential', label: 'Confidential' }
    ];

    const getFileIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'pdf':
                return DocumentPdfIcon;
            case 'word':
            case 'doc':
            case 'docx':
                return DocumentTextIcon;
            case 'excel':
            case 'xls':
            case 'xlsx':
                return DocumentIcon;
            case 'image':
            case 'jpg':
            case 'png':
            case 'gif':
                return PhotoIcon;
            case 'video':
            case 'mp4':
            case 'avi':
                return VideoCameraIcon;
            case 'zip':
            case 'rar':
                return ArchiveBoxIcon;
            default:
                return DocumentIcon;
        }
    };

    const getAccessLevelColor = (level) => {
        switch (level) {
            case 'public':
                return 'bg-green-100 text-green-800';
            case 'managers':
                return 'bg-blue-100 text-blue-800';
            case 'restricted':
                return 'bg-yellow-100 text-yellow-800';
            case 'confidential':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredDocuments = mockDocuments.filter(document => {
        const matchesSearch = document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !selectedCategory || document.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingDocument) {
            put(route('hr.documents.update', editingDocument.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingDocument(null);
                    reset();
                }
            });
        } else {
            post(route('hr.documents.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (document) => {
        setEditingDocument(document);
        setData({
            title: document.title,
            description: document.description,
            category_id: document.category_id || '',
            document_type: document.document_type,
            access_level: document.access_level,
            tags: document.tags.join(', '),
            is_confidential: document.is_confidential,
            requires_signature: document.requires_signature || false
        });
        setIsModalOpen(true);
    };

    const handleDelete = (document) => {
        if (confirm('Are you sure you want to delete this document?')) {
            destroy(route('hr.documents.destroy', document.id));
        }
    };

    const tabs = [
        { id: 'documents', name: 'Documents', icon: DocumentIcon },
        { id: 'categories', name: 'Categories', icon: FolderIcon },
        { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
    ];

    const renderDocumentsTab = () => (
        <div className="space-y-6">
            {/* Documents Header */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Document Library</h3>
                        <p className="text-sm text-gray-600">Manage HR documents, policies, and resources</p>
                    </div>
                    {hasPermission(auth.user, 'hr.documents.create') && (
                        <PrimaryButton
                            onClick={() => {
                                setEditingDocument(null);
                                reset();
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center"
                        >
                            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                            Upload Document
                        </PrimaryButton>
                    )}
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <TextInput
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <SelectInput
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-48"
                    >
                        <option value="">All Categories</option>
                        {mockCategories.map(category => (
                            <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                    </SelectInput>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDocuments.map((document) => {
                    const FileIcon = getFileIcon(document.document_type);
                    return (
                        <div key={document.id} className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{document.title}</h4>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {document.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {document.is_confidential && (
                                        <LockClosedIcon className="w-4 h-4 text-red-500" title="Confidential" />
                                    )}
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(document.access_level)}`}>
                                        {document.access_level}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">{document.description}</p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Type:</span>
                                    <span className="font-medium">{document.document_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Size:</span>
                                    <span className="font-medium">{formatFileSize(document.file_size)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Downloads:</span>
                                    <span className="font-medium">{document.download_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Uploaded:</span>
                                    <span className="font-medium">{formatDate(document.upload_date)}</span>
                                </div>
                                {document.expiry_date && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Expires:</span>
                                        <span className="font-medium text-yellow-600">{formatDate(document.expiry_date)}</span>
                                    </div>
                                )}
                            </div>

                            {document.tags.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-1">
                                        {document.tags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                <TagIcon className="w-3 h-3 mr-1" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex items-center gap-2">
                                <SecondaryButton className="flex-1 justify-center">
                                    <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                                    Download
                                </SecondaryButton>
                                <SecondaryButton>
                                    <ShareIcon className="w-4 h-4" />
                                </SecondaryButton>
                                {hasPermission(auth.user, 'hr.documents.update') && (
                                    <SecondaryButton onClick={() => handleEdit(document)}>
                                        <PencilIcon className="w-4 h-4" />
                                    </SecondaryButton>
                                )}
                                {hasPermission(auth.user, 'hr.documents.delete') && (
                                    <DangerButton onClick={() => handleDelete(document)}>
                                        <TrashIcon className="w-4 h-4" />
                                    </DangerButton>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderCategoriesTab = () => (
        <div className="space-y-6">
            {/* Categories Header */}
            <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Document Categories</h3>
                        <p className="text-sm text-gray-600">Organize documents into categories for better management</p>
                    </div>
                    {hasPermission(auth.user, 'hr.documents.categories.create') && (
                        <PrimaryButton
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="inline-flex items-center"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Category
                        </PrimaryButton>
                    )}
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCategories.map((category) => (
                    <div key={category.id} className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div 
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: `${category.color}20` }}
                                >
                                    <FolderIcon 
                                        className="w-6 h-6" 
                                        style={{ color: category.color }}
                                    />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                                    <p className="text-sm text-gray-600">{category.document_count} documents</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                        <div className="flex items-center gap-2">
                            <SecondaryButton className="flex-1 justify-center">
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View Documents
                            </SecondaryButton>
                            {hasPermission(auth.user, 'hr.documents.categories.update') && (
                                <SecondaryButton>
                                    <PencilIcon className="w-4 h-4" />
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
            <Head title="HR Document Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">HR Document Management</h1>
                            <p className="text-indigo-100">Centralized document storage and management system</p>
                        </div>
                        <DocumentIcon className="w-12 h-12 text-indigo-200" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <DocumentIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.total_documents}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ArchiveBoxIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Size</p>
                                <p className="text-2xl font-bold text-gray-900">{formatFileSize(mockStats.total_size)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FolderIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.categories}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <CloudArrowDownIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Downloads</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.downloads_this_month}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <LockClosedIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Confidential</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.confidential_docs}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <ClockIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                                <p className="text-2xl font-bold text-gray-900">{mockStats.expiring_soon}</p>
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
                        {selectedTab === 'documents' && renderDocumentsTab()}
                        {selectedTab === 'categories' && renderCategoriesTab()}
                        {selectedTab === 'analytics' && (
                            <div className="text-center py-12">
                                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Document Analytics</h3>
                                <p className="mt-1 text-sm text-gray-500">Analyze document usage and access patterns</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Document Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {editingDocument ? 'Edit Document' : 'Upload New Document'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="title" value="Document Title" />
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
                            <InputLabel htmlFor="category_id" value="Category" />
                            <SelectInput
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            >
                                <option value="">Select Category</option>
                                {mockCategories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </SelectInput>
                            {errors.category_id && <div className="text-red-600 text-sm mt-1">{errors.category_id}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="document_type" value="Document Type" />
                            <SelectInput
                                id="document_type"
                                value={data.document_type}
                                onChange={(e) => setData('document_type', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            >
                                <option value="">Select Type</option>
                                {documentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </SelectInput>
                            {errors.document_type && <div className="text-red-600 text-sm mt-1">{errors.document_type}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="access_level" value="Access Level" />
                            <SelectInput
                                id="access_level"
                                value={data.access_level}
                                onChange={(e) => setData('access_level', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            >
                                {accessLevels.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                            </SelectInput>
                            {errors.access_level && <div className="text-red-600 text-sm mt-1">{errors.access_level}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="tags" value="Tags (comma separated)" />
                            <TextInput
                                id="tags"
                                value={data.tags}
                                onChange={(e) => setData('tags', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="policy, handbook, 2024"
                            />
                            {errors.tags && <div className="text-red-600 text-sm mt-1">{errors.tags}</div>}
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="description" value="Description" />
                            <TextareaInput
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full"
                                rows={3}
                            />
                            {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                        </div>

                        {!editingDocument && (
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="file" value="File" />
                                <input
                                    type="file"
                                    id="file"
                                    onChange={(e) => setData('file', e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                />
                                {errors.file && <div className="text-red-600 text-sm mt-1">{errors.file}</div>}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_confidential}
                                onChange={(e) => setData('is_confidential', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">Mark as confidential</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.requires_signature}
                                onChange={(e) => setData('requires_signature', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600">Requires signature</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {editingDocument ? 'Update Document' : 'Upload Document'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminManagementTemplate>
    );
};

export default DocumentsIndex;
