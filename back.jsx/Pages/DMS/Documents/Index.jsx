import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    DocumentIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    CloudArrowUpIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    ShareIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, documents, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [visibilityFilter, setVisibilityFilter] = useState(filters.visibility || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dms.documents'), {
            search,
            category_id: categoryFilter,
            status: statusFilter,
            visibility: visibilityFilter
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setStatusFilter('');
        setVisibilityFilter('');
        router.get(route('dms.documents'));
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getVisibilityBadgeColor = (visibility) => {
        switch (visibility) {
            case 'public': return 'bg-blue-100 text-blue-800';
            case 'internal': return 'bg-green-100 text-green-800';
            case 'restricted': return 'bg-yellow-100 text-yellow-800';
            case 'confidential': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Documents</h2>}
        >
            <Head title="Documents - DMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="mb-4 sm:mb-0">
                                    <h3 className="text-lg font-medium text-gray-900">Document Library</h3>
                                    <p className="text-sm text-gray-600">
                                        Manage and organize your documents
                                    </p>
                                </div>
                                <Link
                                    href={route('dms.documents.create')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                    Upload Document
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="lg:col-span-2">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search documents..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="draft">Draft</option>
                                            <option value="archived">Archived</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={visibilityFilter}
                                            onChange={(e) => setVisibilityFilter(e.target.value)}
                                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">All Visibility</option>
                                            <option value="public">Public</option>
                                            <option value="internal">Internal</option>
                                            <option value="restricted">Restricted</option>
                                            <option value="confidential">Confidential</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <FunnelIcon className="h-4 w-4 mr-2" />
                                        Filter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {documents.data && documents.data.length > 0 ? (
                                <div className="space-y-4">
                                    {documents.data.map((document) => (
                                        <div key={document.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <DocumentIcon className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-medium text-gray-900">
                                                            {document.title}
                                                        </h4>
                                                        {document.description && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {document.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                                            <span>Doc #{document.document_number}</span>
                                                            <span>•</span>
                                                            <span>{document.category?.name}</span>
                                                            <span>•</span>
                                                            <span>{formatFileSize(document.file_size)}</span>
                                                            <span>•</span>
                                                            <span>By {document.creator?.name}</span>
                                                            <span>•</span>
                                                            <span>{new Date(document.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(document.status)}`}>
                                                                {document.status}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVisibilityBadgeColor(document.visibility)}`}>
                                                                {document.visibility}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={route('dms.documents.show', document.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('dms.documents.download', document.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                                        Download
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by uploading a new document.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href={route('dms.documents.create')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                            Upload Document
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {documents.data && documents.data.length > 0 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {documents.from} to {documents.to} of {documents.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {documents.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm rounded-md ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
