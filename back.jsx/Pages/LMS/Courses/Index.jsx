import React, { useEffect, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    PencilIcon,
    TrashIcon,
    AcademicCapIcon,
    ClockIcon,
    UserCircleIcon,
    StarIcon,
    CurrencyDollarIcon,
    BookOpenIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';
import SearchFilter from '@/Components/SearchFilter';
import { formatCurrency } from '@/Utils/formatters';

export default function CourseIndex({ courses, status }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCourses, setFilteredCourses] = useState(courses.data);
    
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredCourses(courses.data);
        } else {
            const filtered = courses.data.filter(course => 
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (course.instructor && course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCourses(filtered);
        }
    }, [searchTerm, courses.data]);
    
    const getLevelBadge = (level) => {
        switch (level) {
            case 'beginner':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    Beginner
                </span>;
            case 'intermediate':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    Intermediate
                </span>;
            case 'advanced':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                    Advanced
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    {level}
                </span>;
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ? 
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Active
            </span> : 
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                <XCircleIcon className="w-4 h-4 mr-1" />
                Inactive
            </span>;
    };
    
    const formatDuration = (minutes) => {
        if (!minutes) return 'N/A';
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
            return `${remainingMinutes} min`;
        } else if (remainingMinutes === 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        } else {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`;
        }
    };
    
    return (
        <AppLayout
            title="Courses"
            renderHeader={() => (
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Learning Management - Courses
                </h2>
            )}
        >
            <Head title="Courses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 sm:px-20 bg-white border-b border-gray-200">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                <SearchFilter 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    placeholder="Search courses..." 
                                />
                                <Link
                                    href={route('lms.courses.create')}
                                    className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150"
                                >
                                    Add New Course
                                </Link>
                            </div>
                            
                            {status && (
                                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{status}</span>
                                </div>
                            )}
                            
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.length > 0 ? (
                                    filteredCourses.map(course => (
                                        <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                            <div className="h-48 bg-gray-200 relative">
                                                {course.thumbnail ? (
                                                    <img 
                                                        src={course.thumbnail} 
                                                        alt={course.title} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <AcademicCapIcon className="h-16 w-16 text-gray-400" />
                                                    </div>
                                                )}
                                                {course.is_featured && (
                                                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md flex items-center text-sm font-semibold">
                                                        <StarIcon className="h-4 w-4 mr-1" />
                                                        Featured
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <Link 
                                                    href={route('lms.courses.show', course.id)} 
                                                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600 block truncate"
                                                >
                                                    {course.title}
                                                </Link>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <UserCircleIcon className="h-4 w-4 mr-1" />
                                                    {course.instructor ? course.instructor.name : 'No instructor assigned'}
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    {formatDuration(course.duration_minutes)}
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                                    {formatCurrency(course.price)}
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {getLevelBadge(course.level)}
                                                    {getStatusBadge(course.is_active)}
                                                </div>
                                                {course.description && (
                                                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                                        {course.description}
                                                    </p>
                                                )}
                                                <div className="mt-4 flex justify-between">
                                                    <Link 
                                                        href={route('lms.courses.edit', course.id)} 
                                                        className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
                                                    >
                                                        <PencilIcon className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Link>
                                                    <Link 
                                                        href={route('lms.courses.show', course.id)} 
                                                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                                                    >
                                                        <BookOpenIcon className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 py-12 text-center text-gray-500">
                                        <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400" />
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Get started by creating a new course.
                                        </p>
                                        <div className="mt-6">
                                            <Link
                                                href={route('lms.courses.create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <BookOpenIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                                Create new course
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Pagination class="mt-6" links={courses.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
