import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    DocumentIcon, 
    FolderIcon, 
    ShareIcon, 
    ChartBarIcon,
    CloudArrowUpIcon,
    DocumentPlusIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, stats, recentDocuments, recentActivity }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Document Management System</h2>}
        >
            <Head title="DMS Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <DocumentIcon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Documents
                                        </dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats.total_documents}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <FolderIcon className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            My Documents
                                        </dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats.my_documents}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ShareIcon className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Shared with Me
                                        </dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats.shared_with_me}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Categories
                                        </dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats.categories_count}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link
                                    href={route('dms.documents.create')}
                                    className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                    Upload Document
                                </Link>
                                
                                <Link
                                    href={route('dms.documents')}
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <DocumentIcon className="h-5 w-5 mr-2" />
                                    Browse Documents
                                </Link>
                                
                                <Link
                                    href={route('dms.categories')}
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FolderIcon className="h-5 w-5 mr-2" />
                                    Manage Categories
                                </Link>
                                
                                <Link
                                    href={route('dms.analytics')}
                                    className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <ChartBarIcon className="h-5 w-5 mr-2" />
                                    View Analytics
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Documents */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Recent Documents</h3>
                                    <Link
                                        href={route('dms.documents')}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View all
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {recentDocuments && recentDocuments.length > 0 ? (
                                        recentDocuments.map((document, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center space-x-3">
                                                    <DocumentIcon className="h-6 w-6 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {document.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {document.category?.name} • {new Date(document.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('dms.documents.show', document.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No documents found</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    {recentActivity && recentActivity.length > 0 ? (
                                        recentActivity.slice(0, 5).map((activity, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                                <div className="flex-shrink-0">
                                                    <DocumentIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-medium">{activity.user?.name}</span> {activity.action} 
                                                        <span className="font-medium"> {activity.document?.title}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(activity.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
