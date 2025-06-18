/**
 * Employee Management Feature Components Export
 * 
 * @file components/index.js
 * @description Central export point for all employee management feature components
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - Forms: Employee-related form components
 * - Tables: Employee data display components
 * - Cards: Employee information cards
 * - Widgets: Employee dashboard widgets
 */

// Form Components
export { default as ProfileForm } from '@/Components/molecules/profile-form/ProfileForm';
export { default as PersonalInformationForm } from '@/Components/molecules/personal-information-form/PersonalInformationForm';
export { default as AddUserForm } from '@/Components/molecules/add-user-form/AddUserForm';

// Table Components
export { default as EmployeeTable } from '@/Components/organisms/employee-table/EmployeeTable';
export { default as UsersTable } from '@/Components/organisms/users-table/UsersTable';

// Card Components (if they exist)
// export { default as EmployeeCard } from '@/Components/molecules/EmployeeCard';
// export { default as DepartmentCard } from '@/Components/molecules/DepartmentCard';

// Widget Components (if they exist)
// export { default as EmployeeStatsWidget } from '@/Components/organisms/EmployeeStatsWidget';
// export { default as DepartmentWidget } from '@/Components/organisms/DepartmentWidget';

/**
 * Employee Management Component Categories
 * 
 * Organized by atomic design principles for easy discovery
 * and consistent usage across the feature module.
 */
export const EMPLOYEE_COMPONENTS = {
  forms: [
    'ProfileForm',
    'PersonalInformationForm', 
    'AddUserForm'
  ],
  tables: [
    'EmployeeTable',
    'UsersTable'
  ],
  // Future expansion
  cards: [],
  widgets: []
};

/**
 * Feature metadata for development tools
 */
export const FEATURE_METADATA = {
  name: 'Employee Management',
  version: '1.0.0',
  components: {
    total: 5,
    forms: 3,
    tables: 2,
    cards: 0,
    widgets: 0
  },
  status: 'active',
  lastUpdated: '2025-06-18'
};
