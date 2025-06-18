/**
 * AttendanceEmployeePage - Modern Architecture
 * Feature: Attendance Management (Employee View)
 * Phase 6: Complete frontend migration
 */

import React from 'react';
import { PageContainer } from '@templates/page-container';
import { AttendanceForm } from '@molecules/attendance-form';
import { AttendanceHistory } from '@organisms/attendance-history';
import { StatsCards } from '@molecules/stats-cards';

const AttendanceEmployeePage = ({ 
    attendanceData = {}, 
    stats = {},
    canClockIn = false,
    canClockOut = false 
}) => {
    return (
        <PageContainer
            title="My Attendance"
            subtitle="Track your daily attendance and view history"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Attendance', href: '/attendance' }
            ]}
        >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCards
                    stats={[
                        {
                            title: 'This Month',
                            value: stats.thisMonth || '0 days',
                            icon: 'calendar',
                            color: 'blue'
                        },
                        {
                            title: 'Total Hours',
                            value: stats.totalHours || '0 hrs',
                            icon: 'clock',
                            color: 'green'
                        },
                        {
                            title: 'Late Days',
                            value: stats.lateDays || '0',
                            icon: 'warning',
                            color: 'yellow'
                        },
                        {
                            title: 'Early Departures',
                            value: stats.earlyDepartures || '0',
                            icon: 'arrow-left',
                            color: 'red'
                        }
                    ]}
                />
            </div>

            {/* Clock In/Out Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Clock In/Out
                    </h3>
                    <AttendanceForm
                        canClockIn={canClockIn}
                        canClockOut={canClockOut}
                        currentStatus={attendanceData.currentStatus}
                        lastAction={attendanceData.lastAction}
                    />
                </div>

                {/* Today's Summary */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Today's Summary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Clock In:</span>
                            <span className="font-medium">
                                {attendanceData.clockIn || 'Not clocked in'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Clock Out:</span>
                            <span className="font-medium">
                                {attendanceData.clockOut || 'Not clocked out'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Hours:</span>
                            <span className="font-medium">
                                {attendanceData.totalHours || '0:00'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                attendanceData.status === 'present' 
                                    ? 'bg-green-100 text-green-800'
                                    : attendanceData.status === 'late'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {attendanceData.status || 'Not marked'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance History */}
            <div className="mt-8">
                <AttendanceHistory
                    title="My Attendance History"
                    attendanceData={attendanceData.history || []}
                    showActions={false}
                    isEmployeeView={true}
                />
            </div>
        </PageContainer>
    );
};

export default AttendanceEmployeePage;
