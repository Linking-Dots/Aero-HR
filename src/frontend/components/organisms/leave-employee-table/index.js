/**
 * Leave Employee Table Main Index
 * 
 * Main export point for the LeaveEmployeeTable organism component.
 * Provides the primary interface for consuming this component.
 */

export { default } from './LeaveEmployeeTable';
export { default as LeaveEmployeeTable } from './LeaveEmployeeTable';

// Re-export sub-components for direct access if needed
export * from './components';

// Re-export utilities for external use
export * from './utils';

// Re-export configuration
export { LEAVE_TABLE_CONFIG } from './config';

// Re-export hook
export { useLeaveTable } from './hooks/useLeaveTable';
