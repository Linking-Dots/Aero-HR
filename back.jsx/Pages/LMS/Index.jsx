import React from 'react';
import { Head } from '@inertiajs/react';
import AdminManagementTemplate from '../../Components/AdminManagementTemplate';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  UserIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const LMSIndex = ({ dashboardData }) => {
  const statsCards = [
    {
      title: 'Total Courses',
      value: dashboardData?.total_courses || 0,
      icon: BookOpenIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      description: `${dashboardData?.active_courses || 0} active`
    },
    {
      title: 'Total Students',
      value: dashboardData?.total_students || 0,
      icon: UserGroupIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-600',
      description: `${dashboardData?.active_students || 0} active`
    },
    {
      title: 'Instructors',
      value: dashboardData?.total_instructors || 0,
      icon: UserIcon,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      description: `${dashboardData?.active_instructors || 0} active`
    },
    {
      title: 'Certificates Issued',
      value: dashboardData?.total_certificates || 0,
      icon: DocumentTextIcon,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-600',
      description: 'All time'
    }
  ];

  const quickActions = [
    {
      title: 'Create Course',
      icon: AcademicCapIcon,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      route: 'lms.courses',
      description: 'Add new learning course'
    },
    {
      title: 'Enroll Student',
      icon: UserGroupIcon,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600',
      route: 'lms.students',
      description: 'Register new student'
    },
    {
      title: 'Add Instructor',
      icon: UserIcon,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      route: 'lms.instructors',
      description: 'Register new instructor'
    },
    {
      title: 'Create Assessment',
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      iconColor: 'text-indigo-600',
      route: 'lms.assessments',
      description: 'Design course assessment'
    }
  ];

  const recentEnrollments = dashboardData?.recent_enrollments || [];
  const popularCourses = dashboardData?.popular_courses || [];
  const completionRate = dashboardData?.completion_rate || 0;

  return (
    <>
      <Head title="Learning Management System - Dashboard" />
      <AdminManagementTemplate>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Learning Management System</h1>
                <p className="text-gray-600">Manage courses, students, and educational content</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => window.location.href = route(action.route)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${action.color}`}
                >
                  <action.icon className={`h-8 w-8 ${action.iconColor} mb-3`} />
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Enrollments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Enrollments</h2>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {recentEnrollments.length > 0 ? recentEnrollments.map((enrollment, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.student?.user?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{enrollment.course?.title || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No recent enrollments</p>
                )}
              </div>
            </div>

            {/* Popular Courses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Popular Courses</h2>
                <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {popularCourses.length > 0 ? popularCourses.map((course, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <BookOpenIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600">{course.category}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {course.enrollments_count} students
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No courses available</p>
                )}
              </div>
            </div>
          </div>

          {/* Completion Rate Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Overall Completion Rate</h2>
              <span className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Average completion rate across all courses
            </p>
          </div>
        </div>
      </AdminManagementTemplate>
    </>
  );
};

export default LMSIndex;
