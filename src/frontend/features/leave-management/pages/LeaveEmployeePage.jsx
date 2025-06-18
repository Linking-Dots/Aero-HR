/**
 * LeaveEmployeePage - Modern Architecture
 * Feature: Leave Management (Employee View)
 * Phase 6: Complete frontend migration
 */

import React, { useState } from 'react';
import { PageContainer } from '@templates/page-container';
import { LeaveApplicationForm } from '@molecules/leave-application-form';
import { LeaveBalanceCard } from '@molecules/leave-balance-card';
import { LeaveHistoryTable } from '@organisms/leave-history-table';
import { Button } from '@atoms/button';

const LeaveEmployeePage = ({ 
    leaveBalance = {},
    leaveHistory = [],
    leaveTypes = [],
    canApply = true 
}) => {
    const [showApplicationForm, setShowApplicationForm] = useState(false);

    return (
        <PageContainer
            title="My Leave Management"
            subtitle="Apply for leave and track your leave balance"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Leave Management', href: '/leaves' }
            ]}
            actions={
                canApply && (
                    <Button
                        onClick={() => setShowApplicationForm(true)}
                        variant="primary"
                        size="md"
                    >
                        Apply for Leave
                    </Button>
                )
            }
        >
            {/* Leave Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <LeaveBalanceCard
                    title="Annual Leave"
                    available={leaveBalance.annual?.available || 0}
                    total={leaveBalance.annual?.total || 0}
                    used={leaveBalance.annual?.used || 0}
                    color="blue"
                />
                <LeaveBalanceCard
                    title="Sick Leave"
                    available={leaveBalance.sick?.available || 0}
                    total={leaveBalance.sick?.total || 0}
                    used={leaveBalance.sick?.used || 0}
                    color="green"
                />
                <LeaveBalanceCard
                    title="Casual Leave"
                    available={leaveBalance.casual?.available || 0}
                    total={leaveBalance.casual?.total || 0}
                    used={leaveBalance.casual?.used || 0}
                    color="yellow"
                />
                <LeaveBalanceCard
                    title="Emergency Leave"
                    available={leaveBalance.emergency?.available || 0}
                    total={leaveBalance.emergency?.total || 0}
                    used={leaveBalance.emergency?.used || 0}
                    color="red"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowApplicationForm(true)}
                        className="w-full"
                    >
                        Apply for Leave
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="w-full"
                    >
                        Print Leave Summary
                    </Button>
                    <Button
                        variant="outline"
                        href="/leave-calendar"
                        className="w-full"
                    >
                        View Leave Calendar
                    </Button>
                </div>
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Leave History
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Track your leave applications and approvals
                    </p>
                </div>
                <LeaveHistoryTable
                    data={leaveHistory}
                    isEmployeeView={true}
                    showActions={['view', 'cancel']}
                />
            </div>

            {/* Leave Application Modal */}
            {showApplicationForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Apply for Leave
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowApplicationForm(false)}
                                className="absolute top-4 right-4"
                            >
                                ×
                            </Button>
                        </div>
                        <div className="p-6">
                            <LeaveApplicationForm
                                leaveTypes={leaveTypes}
                                leaveBalance={leaveBalance}
                                onSuccess={() => {
                                    setShowApplicationForm(false);
                                    // Refresh data
                                }}
                                onCancel={() => setShowApplicationForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

export default LeaveEmployeePage;
