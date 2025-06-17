/**
 * Employee Table Organism Index
 * 
 * Main entry point for the Employee Table organism with all its
 * sub-components, hooks, utilities, and configurations following
 * atomic design principles and ISO compliance standards.
 * 
 * @module EmployeeTableOrganism
 */

// Main component export
export { default as EmployeeTable } from './EmployeeTable';

// Sub-components
export {
  EmployeeTableCell,
  EmployeeActions,
  EmployeeMobileCard,
  AttendanceConfigModal
} from './components';

// Hooks
export { useEmployeeTable } from './hooks/useEmployeeTable';

// Utilities
export * from './utils';

// Configuration
export * from './config';

// Default export (main component)
export { default } from './EmployeeTable';
