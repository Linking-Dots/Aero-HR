import React from 'react';
import { 
    Card, 
    CardBody,
    Button
} from "@heroui/react";
import { 
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Typography } from '@mui/material';

/**
 * BulkActionBar - A reusable component for bulk operations
 * 
 * @param {Object} props
 * @param {Set} props.selectedItems - Set of selected item IDs
 * @param {Function} props.onClearSelection - Clear selection handler
 * @param {Array} props.actions - Array of action objects
 * @param {string} props.itemLabel - Label for items (e.g., "leave", "employee")
 * @param {boolean} props.visible - Whether to show the bar
 */
export const BulkActionBar = ({
    selectedItems = new Set(),
    onClearSelection,
    actions = [],
    itemLabel = "item",
    visible = false
}) => {
    if (!visible || selectedItems.size === 0) return null;

    return (
        <Card className="mb-4 bg-primary-50 border border-primary-200">
            <CardBody className="py-3">
                <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-primary-700">
                        {selectedItems.size} {itemLabel}{selectedItems.size > 1 ? 's' : ''} selected
                    </Typography>
                    <div className="flex gap-2">
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                size="sm"
                                color={action.color || 'primary'}
                                variant={action.variant || 'flat'}
                                startContent={action.icon && <action.icon className="w-4 h-4" />}
                                onPress={() => action.onPress && action.onPress(Array.from(selectedItems))}
                                isDisabled={action.disabled}
                            >
                                {action.label}
                            </Button>
                        ))}
                        <Button
                            size="sm"
                            variant="light"
                            onPress={onClearSelection}
                        >
                            Clear Selection
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

/**
 * StatusChip - A reusable status chip component
 * 
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {Object} props.statusConfig - Status configuration object
 * @param {string} props.size - Chip size
 */
export const StatusChip = ({ 
    status, 
    statusConfig = {}, 
    size = "sm" 
}) => {
    const defaultConfig = {
        'New': { color: 'primary', icon: ExclamationTriangleIcon },
        'Pending': { color: 'warning', icon: ClockIcon },
        'Approved': { color: 'success', icon: CheckCircleIcon },
        'Declined': { color: 'danger', icon: XCircleIcon },
        'Rejected': { color: 'danger', icon: XCircleIcon },
    };

    const config = statusConfig[status] || defaultConfig[status] || defaultConfig['New'];
    const StatusIcon = config.icon;

    return (
        <div className="flex items-center gap-1">
            {StatusIcon && <StatusIcon className="w-3 h-3" />}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${config.color === 'success' ? 'bg-green-100 text-green-800' :
                  config.color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  config.color === 'danger' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'}`}>
                {status}
            </span>
        </div>
    );
};

/**
 * QuickStatsGrid - A reusable grid for displaying quick statistics
 * 
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects
 * @param {number} props.columns - Number of columns (auto-calculated if not provided)
 */
export const QuickStatsGrid = ({ stats = [], columns }) => {
    if (!stats.length) return null;

    const gridCols = columns || (stats.length <= 2 ? stats.length : stats.length <= 4 ? 2 : 4);
    
    return (
        <div className={`grid gap-4 mb-6 grid-cols-1 sm:grid-cols-${Math.min(gridCols, 2)} lg:grid-cols-${gridCols}`}>
            {stats.map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                    <Card 
                        key={index}
                        className={`${stat.gradient || 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'} 
                                  border ${stat.borderColor || 'border-blue-500/20'} 
                                  hover:scale-105 transition-transform duration-200`}
                    >
                        <CardBody className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.iconBg || 'bg-blue-500/20'}`}>
                                    <StatIcon className={`w-5 h-5 ${stat.iconColor || 'text-blue-600'}`} />
                                </div>
                                <div>
                                    <Typography variant="h6" className={`font-bold ${stat.textColor || 'text-blue-600'}`}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" className="text-default-500">
                                        {stat.label}
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
};

/**
 * EmptyState - A reusable empty state component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Action button or component
 */
export const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    action 
}) => {
    return (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardBody className="text-center py-12">
                {Icon && <Icon className="w-16 h-16 text-default-400 mx-auto mb-4" />}
                <Typography variant="h6" className="mb-2">
                    {title}
                </Typography>
                <Typography color="textSecondary">
                    {description}
                </Typography>
                {action && (
                    <div className="mt-4">
                        {action}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

/**
 * LoadingState - A reusable loading state component
 * 
 * @param {Object} props
 * @param {string} props.message - Loading message
 * @param {number} props.size - Progress circle size
 */
export const LoadingState = ({ 
    message = "Loading data...", 
    size = 40 
}) => {
    return (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardBody className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <Typography color="textSecondary">
                    {message}
                </Typography>
            </CardBody>
        </Card>
    );
};

/**
 * ErrorState - A reusable error state component
 * 
 * @param {Object} props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {Function} props.onRetry - Retry function
 */
export const ErrorState = ({ 
    title = "Error Loading Data", 
    message, 
    onRetry 
}) => {
    return (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardBody className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-warning-500 mx-auto mb-4" />
                <Typography variant="h6" className="mb-2">
                    {title}
                </Typography>
                <Typography color="textSecondary" className="mb-4">
                    {message}
                </Typography>
                {onRetry && (
                    <Button
                        color="primary"
                        variant="flat"
                        onPress={onRetry}
                    >
                        Try Again
                    </Button>
                )}
            </CardBody>
        </Card>
    );
};
