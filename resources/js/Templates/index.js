// Admin Management Templates
export { default as AdminManagementTemplate } from './AdminManagement/AdminManagementTemplate';

// Employee View Templates  
export { default as EmployeeViewTemplate } from './EmployeeViews/EmployeeViewTemplate';

// Shared Components
export { default as DataTableTemplate } from './SharedComponents/DataTableTemplate';
export { default as FilterTemplate } from './SharedComponents/FilterTemplate';
export { default as FormTemplate, FormSection, FormFieldGroup } from './SharedComponents/FormTemplate';
export { default as ModalTemplate, ConfirmationModal, InfoModal, FormModal } from './SharedComponents/ModalTemplate';
export { default as DashboardTemplate, DashboardWidget, QuickActionCard } from './SharedComponents/DashboardTemplate';
export {
    BulkActionBar,
    StatusChip,
    QuickStatsGrid,
    EmptyState,
    LoadingState,
    ErrorState
} from './SharedComponents/CommonComponents';

// Template Configurations and Utilities
export {
    STATUS_CONFIGS,
    FILTER_CONFIGS,
    PAGE_CONFIGS,
    COLUMN_CONFIGS,
    BULK_ACTIONS,
    ConfigUtils
} from './SharedComponents/TemplateConfigs';
