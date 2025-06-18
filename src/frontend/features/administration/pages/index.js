/**
 * Administration Feature Pages Export
 * 
 * @file pages/index.js
 * @description Page components for administration and system management
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - DashboardPage: System administration dashboard
 * - RoleSettingsPage: Role and permission management
 */

export { default as DashboardPage } from './DashboardPage';
export { default as RoleSettingsPage } from './RoleSettingsPage';
export { default as UserManagementPage } from './UserManagementPage';
export { default as SystemSettingsPage } from './SystemSettingsPage';

/**
 * Administration Pages Configuration
 */
export const ADMINISTRATION_PAGES = {
  dashboard: {
    component: 'DashboardPage',
    path: '/administration/dashboard',
    title: 'Administration Dashboard',
    description: 'System overview, monitoring, and administrative controls',
    permissions: ['admin-dashboard', 'view-admin'],
    features: [
      'System health monitoring',
      'User activity tracking',
      'Performance metrics',
      'Quick administrative actions',
      'Real-time analytics',
      'Security monitoring'
    ]
  },
  
  roleSettings: {
    component: 'RoleSettingsPage',
    path: '/administration/roles',
    title: 'Role & Permission Settings',
    description: 'Manage user roles, permissions, and system access control',
    permissions: ['manage-roles', 'admin-settings'],
    features: [
      'Role creation and management',
      'Permission assignment',
      'Module-based access control',
      'Security policy configuration',
      'Audit trail tracking',
      'Bulk permission updates'
    ]
  },
    userManagement: {
    component: 'UserManagementPage',
    path: '/administration/users',
    title: 'User Management',
    description: 'Comprehensive user account management and administration',
    permissions: ['manage-users', 'admin-users'],
    features: [
      'User account creation and editing',
      'Password policy management',
      'Session monitoring',
      'Account activation/deactivation',
      'Bulk user operations',
      'User analytics'
    ]
  },
  
  systemSettings: {
    component: 'SystemSettingsPage',
    path: '/administration/settings',
    title: 'System Settings',
    description: 'Core system configuration and global settings',
    permissions: ['admin-settings', 'system-config'],
    features: [
      'Global system configuration',
      'Security policy settings',
      'Backup and recovery options',
      'Integration management',
      'Performance tuning',
      'Maintenance schedules'
    ]
  }
};

/**
 * Page utilities
 */
export const AdministrationPagesUtils = {
  /**
   * Get page configuration by key
   */
  getPageConfig: (pageKey) => {
    return ADMINISTRATION_PAGES[pageKey];
  },
  
  /**
   * Get available pages (implemented)
   */
  getAvailablePages: () => {
    return Object.entries(ADMINISTRATION_PAGES)
      .filter(([key, page]) => !page.status || page.status !== 'planned')
      .map(([key, page]) => ({ key, ...page }));
  },
  
  /**
   * Get planned pages
   */
  getPlannedPages: () => {
    return Object.entries(ADMINISTRATION_PAGES)
      .filter(([key, page]) => page.status === 'planned')
      .map(([key, page]) => ({ key, ...page }));
  },
  
  /**
   * Get all page paths
   */
  getAllPaths: () => {
    return Object.values(ADMINISTRATION_PAGES).map(page => page.path);
  },
  
  /**
   * Check if user has permission for page
   */
  hasPermission: (pageKey, userPermissions = []) => {
    const page = ADMINISTRATION_PAGES[pageKey];
    if (!page) return false;
    
    return page.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  },
  
  /**
   * Get pages by permission level
   */
  getPagesByPermission: (userPermissions = []) => {
    return Object.entries(ADMINISTRATION_PAGES)
      .filter(([key, page]) => 
        page.permissions.some(permission => userPermissions.includes(permission))
      )
      .map(([key, page]) => ({ key, ...page }));
  }
};

export default ADMINISTRATION_PAGES;
