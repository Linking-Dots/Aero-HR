/**
 * Attendance Feature Components Export
 * 
 * @file components/index.js
 * @description Central export point for all attendance feature components
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - Forms: Attendance settings and time tracking form components
 * - Tables: Attendance data display components
 * - Cards: Attendance information cards
 * - Widgets: Attendance dashboard widgets
 */

// Form Components
export { default as AttendanceSettingsForm } from '@/Components/molecules/attendance-settings-form/AttendanceSettingsForm';
// export { default as TimeTrackingForm } from '@/Components/molecules/time-tracking-form/TimeTrackingForm';
// export { default as AttendanceForm } from '@/Components/molecules/attendance-form/AttendanceForm';

// Table Components
export { default as AttendanceAdminTable } from '@/Components/organisms/attendance-admin-table/AttendanceAdminTable';
export { default as TimeSheetTable } from '@/Components/organisms/time-sheet-table/TimeSheetTable';

// Widget Components (future expansion)
// export { default as AttendanceSummaryWidget } from '@/Components/organisms/AttendanceSummaryWidget';
// export { default as TimeTrackingWidget } from '@/Components/organisms/TimeTrackingWidget';

/**
 * Attendance Component Categories
 * 
 * Organized by atomic design principles for easy discovery
 * and consistent usage across the feature module.
 */
export const ATTENDANCE_COMPONENTS = {
  forms: [
    'AttendanceSettingsForm'
    // 'TimeTrackingForm',
    // 'AttendanceForm'
  ],
  tables: [
    'AttendanceAdminTable',
    'TimeSheetTable'
  ],
  widgets: [],
  cards: []
};

/**
 * Feature metadata for development tools
 */
export const FEATURE_METADATA = {
  name: 'Attendance & Time Tracking',
  version: '1.0.0',
  components: {
    total: 3,
    forms: 1,
    tables: 2,
    widgets: 0,
    cards: 0
  },
  status: 'active',
  lastUpdated: '2025-06-18'
};
