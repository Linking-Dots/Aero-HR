import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { 
    BriefcaseIcon,
    CurrencyDollarIcon,
    TrendingUpIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import {
    Card,
    CardHeader,
    CardBody,
    Chip,
    Button,
    Select,
    SelectItem
} from "@heroui/react";

export default function PipelineIndex({ pipelineData, salesStages, users }) {
    const [selectedUser, setSelectedUser] = useState('all');
    const [selectedPeriod, setPeriod] = useState('current');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getStageColor = (stageName) => {
        switch (stageName?.toLowerCase()) {
            case 'prospecting':
                return 'primary';
            case 'qualification':
                return 'warning';
            case 'proposal':
                return 'secondary';
            case 'negotiation':
                return 'success';
            case 'closed won':
                return 'success';
            case 'closed lost':
                return 'danger';
            default:
                return 'default';
        }
    };

    const StageColumn = ({ stage, opportunities = [] }) => {
        const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
        
        return (
            <div className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Chip
                            color={getStageColor(stage.name)}
                            variant="flat"
                            size="sm"
                        >
                            {stage.name}
                        </Chip>
                        <span className="text-sm text-gray-500">({opportunities.length})</span>
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {formatCurrency(totalValue)}
                    </div>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {opportunities.map((opportunity) => (
                        <Card key={opportunity.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardBody className="p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                            {opportunity.title}
                                        </h4>
                                        <span className="text-sm font-bold text-green-600">
                                            {formatCurrency(opportunity.value)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <UsersIcon className="w-4 h-4" />
                                        <span>{opportunity.customer?.name || 'Unknown Customer'}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1">
                                            <TrendingUpIcon className="w-3 h-3 text-blue-500" />
                                            <span>{opportunity.probability}%</span>
                                        </div>
                                        <span className="text-gray-500">
                                            {opportunity.expected_close_date && 
                                                new Date(opportunity.expected_close_date).toLocaleDateString()
                                            }
                                        </span>
                                    </div>
                                    
                                    {opportunity.assigned_user && (
                                        <div className="text-xs text-gray-500">
                                            Assigned to: {opportunity.assigned_user.name}
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                    
                    {opportunities.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <BriefcaseIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No opportunities in this stage</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AppLayout title="Sales Pipeline">
            <Head title="Sales Pipeline" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Pipeline</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Visual overview of your sales opportunities by stage
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <Select
                            placeholder="Filter by user"
                            selectedKeys={selectedUser !== 'all' ? [selectedUser] : []}
                            onSelectionChange={(keys) => setSelectedUser(Array.from(keys)[0] || 'all')}
                            className="w-48"
                        >
                            <SelectItem key="all" value="all">All Users</SelectItem>
                            {users?.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </Select>
                        
                        <Select
                            placeholder="Select period"
                            selectedKeys={[selectedPeriod]}
                            onSelectionChange={(keys) => setPeriod(Array.from(keys)[0])}
                            className="w-48"
                        >
                            <SelectItem key="current" value="current">Current Quarter</SelectItem>
                            <SelectItem key="next" value="next">Next Quarter</SelectItem>
                            <SelectItem key="year" value="year">This Year</SelectItem>
                        </Select>
                    </div>

                    {/* Pipeline Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Opportunities</p>
                                        <p className="text-2xl font-bold">{pipelineData?.total_opportunities || 0}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(pipelineData?.total_value)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                        <TrendingUpIcon className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Weighted Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(pipelineData?.weighted_value)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        
                        <Card>
                            <CardBody className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                        <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Deal Size</p>
                                        <p className="text-2xl font-bold">{formatCurrency(pipelineData?.avg_deal_size)}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Pipeline Kanban Board */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Pipeline Stages
                        </h3>
                        
                        <div className="flex gap-6 overflow-x-auto pb-4">
                            {salesStages && salesStages.map((stage) => {
                                const stageOpportunities = pipelineData?.opportunities_by_stage?.[stage.id] || [];
                                return (
                                    <StageColumn
                                        key={stage.id}
                                        stage={stage}
                                        opportunities={stageOpportunities}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
