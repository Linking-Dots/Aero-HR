import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    UserIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CogIcon,
    BuildingOfficeIcon,
    BanknotesIcon,
    AcademicCapIcon
} from "@heroicons/react/24/outline";

/**
 * Common status configurations for consistent status display
 */
export const STATUS_CONFIGS = {
    leave: {
        'New': {
            color: 'primary',
            icon: ExclamationTriangleIcon,
            gradient: 'from-blue-500/10 to-indigo-500/10',
            borderColor: 'border-blue-500/20',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600'
        },
        'Pending': {
            color: 'warning',
            icon: ClockIcon,
            gradient: 'from-orange-500/10 to-amber-500/10',
            borderColor: 'border-orange-500/20',
            iconBg: 'bg-orange-500/20',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-600'
        },
        'Approved': {
            color: 'success',
            icon: CheckCircleIcon,
            gradient: 'from-green-500/10 to-emerald-500/10',
            borderColor: 'border-green-500/20',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-600',
            textColor: 'text-green-600'
        },
        'Declined': {
            color: 'danger',
            icon: XCircleIcon,
            gradient: 'from-red-500/10 to-rose-500/10',
            borderColor: 'border-red-500/20',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-600',
            textColor: 'text-red-600'
        },
        'Rejected': {
            color: 'danger',
            icon: XCircleIcon,
            gradient: 'from-red-500/10 to-rose-500/10',
            borderColor: 'border-red-500/20',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-600',
            textColor: 'text-red-600'
        }
    },
    employee: {
        'Active': {
            color: 'success',
            icon: CheckCircleIcon,
            gradient: 'from-green-500/10 to-emerald-500/10',
            borderColor: 'border-green-500/20',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-600',
            textColor: 'text-green-600'
        },
        'Inactive': {
            color: 'danger',
            icon: XCircleIcon,
            gradient: 'from-red-500/10 to-rose-500/10',
            borderColor: 'border-red-500/20',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-600',
            textColor: 'text-red-600'
        },
        'On Leave': {
            color: 'warning',
            icon: ClockIcon,
            gradient: 'from-orange-500/10 to-amber-500/10',
            borderColor: 'border-orange-500/20',
            iconBg: 'bg-orange-500/20',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-600'
        }
    }
};

/**
 * Common filter configurations for different modules
 */
export const FILTER_CONFIGS = {
    dateRange: {
        key: 'dateRange',
        type: 'date',
        label: 'Date Range',
        gridSize: { md: 3 }
    },
    month: {
        key: 'month',
        type: 'month',
        label: 'Month',
        gridSize: { md: 3 }
    },
    year: {
        key: 'year',
        type: 'year',
        label: 'Year',
        gridSize: { md: 3 },
        options: (() => {
            const currentYear = new Date().getFullYear();
            return Array.from({ length: 10 }, (_, i) => {
                const year = currentYear - i;
                return { key: year.toString(), label: year.toString(), value: year };
            });
        })()
    },
    employee: {
        key: 'employee',
        type: 'search',
        label: 'Search Employee',
        placeholder: 'Enter name or ID...',
        gridSize: { md: 4 }
    },
    department: {
        key: 'department',
        type: 'select',
        label: 'Department',
        options: [
            { key: 'all', label: 'All Departments', value: 'all' },
            { key: 'hr', label: 'Human Resources', value: 'hr' },
            { key: 'it', label: 'Information Technology', value: 'it' },
            { key: 'finance', label: 'Finance', value: 'finance' },
            { key: 'operations', label: 'Operations', value: 'operations' }
        ],
        gridSize: { md: 3 }
    },
    status: {
        key: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { key: 'all', label: 'All Status', value: 'all' },
            { key: 'active', label: 'Active', value: 'active' },
            { key: 'inactive', label: 'Inactive', value: 'inactive' }
        ],
        gridSize: { md: 3 }
    }
};

/**
 * Common page configurations for different modules
 */
export const PAGE_CONFIGS = {
    leaves: {
        admin: {
            title: 'Leave Management',
            description: 'Manage employee leave requests and approvals',
            icon: CalendarIcon,
            permission: 'leaves.view'
        },
        employee: {
            title: 'My Leaves',
            description: 'View and manage your leave requests',
            icon: CalendarIcon,
            permission: 'leave.own.view'
        }
    },
    employees: {
        admin: {
            title: 'Employee Management',
            description: 'Manage employee records and information',
            icon: UserIcon,
            permission: 'employees.view'
        }
    },
    dashboard: {
        admin: {
            title: 'Admin Dashboard',
            description: 'System overview and key metrics',
            icon: ChartBarIcon,
            permission: 'dashboard.admin'
        },
        employee: {
            title: 'My Dashboard',
            description: 'Your personal dashboard and quick access',
            icon: ChartBarIcon,
            permission: 'dashboard.view'
        }
    },
    reports: {
        admin: {
            title: 'Reports & Analytics',
            description: 'Generate and view system reports',
            icon: DocumentTextIcon,
            permission: 'reports.view'
        }
    },
    settings: {
        admin: {
            title: 'System Settings',
            description: 'Configure system preferences and options',
            icon: CogIcon,
            permission: 'settings.manage'
        }
    },
    departments: {
        admin: {
            title: 'Department Management',
            description: 'Manage organizational departments',
            icon: BuildingOfficeIcon,
            permission: 'departments.view'
        }
    },
    payroll: {
        admin: {
            title: 'Payroll Management',
            description: 'Manage employee payroll and compensation',
            icon: BanknotesIcon,
            permission: 'payroll.view'
        }
    },
    training: {
        admin: {
            title: 'Training Management',
            description: 'Manage employee training and development',
            icon: AcademicCapIcon,
            permission: 'training.view'
        }
    }
};

/**
 * Common table column configurations
 */
export const COLUMN_CONFIGS = {
    employee: [
        { key: 'name', name: 'Name', icon: UserIcon, sortable: true },
        { key: 'email', name: 'Email', sortable: true },
        { key: 'department', name: 'Department', sortable: true },
        { key: 'position', name: 'Position', sortable: true },
        { key: 'status', name: 'Status', sortable: true },
        { key: 'actions', name: 'Actions', align: 'center' }
    ],
    leave: [
        { key: 'employee', name: 'Employee', icon: UserIcon, adminOnly: true },
        { key: 'leave_type', name: 'Leave Type', icon: DocumentTextIcon, sortable: true },
        { key: 'from_date', name: 'From Date', icon: CalendarIcon, sortable: true },
        { key: 'to_date', name: 'To Date', icon: CalendarIcon, sortable: true },
        { key: 'status', name: 'Status', sortable: true },
        { key: 'reason', name: 'Reason' },
        { key: 'actions', name: 'Actions', align: 'center', adminOnly: true }
    ]
};

/**
 * Common bulk action configurations
 */
export const BULK_ACTIONS = {
    leave: [
        {
            key: 'approve',
            label: 'Approve Selected',
            color: 'success',
            variant: 'flat',
            icon: CheckCircleIcon,
            permission: 'leaves.approve'
        },
        {
            key: 'reject',
            label: 'Reject Selected',
            color: 'danger',
            variant: 'flat',
            icon: XCircleIcon,
            permission: 'leaves.approve'
        }
    ],
    employee: [
        {
            key: 'activate',
            label: 'Activate Selected',
            color: 'success',
            variant: 'flat',
            icon: CheckCircleIcon,
            permission: 'employees.update'
        },
        {
            key: 'deactivate',
            label: 'Deactivate Selected',
            color: 'warning',
            variant: 'flat',
            icon: ClockIcon,
            permission: 'employees.update'
        }
    ]
};

/**
 * Utility functions for configuration
 */
export const ConfigUtils = {
    /**
     * Get status configuration by type and status
     */
    getStatusConfig: (type, status) => {
        return STATUS_CONFIGS[type]?.[status] || STATUS_CONFIGS.leave['New'];
    },

    /**
     * Get page configuration by module and view type
     */
    getPageConfig: (module, viewType = 'admin') => {
        return PAGE_CONFIGS[module]?.[viewType] || {
            title: 'Page',
            description: 'Page description',
            icon: ChartBarIcon,
            permission: null
        };
    },

    /**
     * Filter columns by admin/employee view
     */
    filterColumns: (columns, isAdminView = false) => {
        return columns.filter(col => !col.adminOnly || isAdminView);
    },

    /**
     * Filter bulk actions by permissions
     */
    filterBulkActions: (actions, userPermissions = []) => {
        return actions.filter(action => 
            !action.permission || userPermissions.includes(action.permission)
        );
    },

    /**
     * Generate year options for filters
     */
    generateYearOptions: (startYear = 2020, endYear = null) => {
        const end = endYear || new Date().getFullYear();
        return Array.from({ length: end - startYear + 1 }, (_, i) => {
            const year = startYear + i;
            return { key: year.toString(), label: year.toString(), value: year };
        }).reverse();
    },

    /**
     * Generate month options for filters
     */
    generateMonthOptions: () => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.map((month, index) => ({
            key: (index + 1).toString().padStart(2, '0'),
            label: month,
            value: (index + 1).toString().padStart(2, '0')
        }));
    }
};

export default {
    STATUS_CONFIGS,
    FILTER_CONFIGS,
    PAGE_CONFIGS,
    COLUMN_CONFIGS,
    BULK_ACTIONS,
    ConfigUtils
};
