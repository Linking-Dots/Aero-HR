/**
 * Employee Management Feature Module
 * 
 * @file index.js
 * @description Main entry point for the Employee Management feature module
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Employee listing and management
 * - User management and role assignment
 * - Department and designation organization
 * - Search and filtering capabilities
 * - Form management and validation
 * 
 * @structure
 * - pages/: Feature page components
 * - components/: Reusable feature components
 * - hooks/: Custom hooks for feature logic
 */

// Page Components
export { default as EmployeeListPage } from './pages/EmployeeListPage';
export { default as UserManagementPage } from './pages/UserManagementPage';

// Export types
export * from './types';

// Export utilities
export * from './utils';

// Export hooks
export * from './hooks';

// Export components
export * from './components';
