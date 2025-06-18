/**
 * Leave Management Feature Components Export
 * 
 * @file components/index.js
 * @description Central export point for all leave management feature components
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - Forms: Leave request and holiday form components
 * - Tables: Leave data display components
 * - Cards: Leave information cards
 * - Widgets: Leave dashboard widgets
 */

// Form Components
export { default as LeaveForm } from '@/Components/molecules/LeaveForm';
export { default as HolidayForm } from '@/Components/molecules/HolidayForm';
export { default as DeleteLeaveForm } from '@/Components/molecules/DeleteLeaveForm';

// Table Components
export { default as LeaveEmployeeTable } from '@/Components/organisms/LeaveEmployeeTable';
export { default as HolidayTable } from '@/Components/organisms/HolidayTable';

// Widget Components (future expansion)
// export { default as LeaveBalanceWidget } from '@/Components/organisms/LeaveBalanceWidget';
// export { default as LeaveStatsWidget } from '@/Components/organisms/LeaveStatsWidget';

/**
 * Leave Management Component Categories
 * 
 * Organized by atomic design principles for easy discovery
 * and consistent usage across the feature module.
 */
export const LEAVE_COMPONENTS = {
  forms: [
    'LeaveForm',
    'HolidayForm',
    'DeleteLeaveForm'
  ],
  tables: [
    'LeaveEmployeeTable',
    'HolidayTable'
  ],
  widgets: [],
  cards: []
};

/**
 * Feature metadata for development tools
 */
export const FEATURE_METADATA = {
  name: 'Leave Management',
  version: '1.0.0',
  components: {
    total: 5,
    forms: 3,
    tables: 2,
    widgets: 0,
    cards: 0
  },
  status: 'active',
  lastUpdated: '2025-06-18'
};
