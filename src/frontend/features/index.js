/**
 * Features Module Index
 * 
 * @file index.js
 * @description Central registry for all feature modules in the Glass ERP system
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Centralized feature module management
 * - Feature discovery and registration
 * - Lazy loading support
 * - Feature metadata and routing
 * - Development tools integration
 */

// Feature Module Imports
export * from './employee-management';
export * from './project-management';
export * from './leave-management';
export * from './attendance';
export * from './communication';
export * from './events';
export * from './administration';

/**
 * Feature Registry
 * 
 * Central registry of all available feature modules with metadata,
 * routing information, and lazy loading capabilities.
 */
export const FEATURE_REGISTRY = {
  // Employee Management Feature
  'employee-management': {
    name: 'Employee Management',
    version: '1.0.0',
    status: 'complete',
    priority: 'high',
    description: 'Comprehensive employee and user management system',
    route: '/employees',
    icon: 'UserGroupIcon',
    permissions: ['view-employees', 'manage-users'],
    pages: {
      list: {
        component: () => import('./employee-management/pages/EmployeeListPage'),
        route: '/employees/list',
        title: 'Employee List'
      },
      users: {
        component: () => import('./employee-management/pages/UserManagementPage'),
        route: '/users/management',
        title: 'User Management'
      }
    },
    components: {
      forms: 3,
      tables: 2,
      hooks: 5,
      total: 10
    }
  },
  // Project Management Feature
  'project-management': {
    name: 'Project Management',
    version: '1.0.0',
    status: 'complete',
    priority: 'high',
    description: 'Project tracking and daily work management for construction industry',
    route: '/projects',
    icon: 'BuildingOfficeIcon',
    permissions: ['view-projects', 'manage-daily-works'],
    pages: {
      dailyWorks: {
        component: () => import('./project-management/pages/DailyWorksPage'),
        route: '/daily-works',
        title: 'Daily Works'
      },
      dailyWorkSummary: {
        component: () => import('./project-management/pages/DailyWorkSummaryPage'),
        route: '/daily-work-summary',
        title: 'Daily Work Summary'
      },
      projectDashboard: {
        component: () => import('./project-management/pages/ProjectDashboardPage'),
        route: '/project-dashboard',
        title: 'Project Dashboard'
      }
    },
    components: {
      forms: 5,
      tables: 2,
      widgets: 3,
      hooks: 10,
      total: 20
    }
  },
  // Leave Management Feature (Completed)
  'leave-management': {
    name: 'Leave Management',
    version: '1.0.0',
    status: 'complete',
    priority: 'high',
    description: 'Employee leave requests, approvals, and holiday management',
    route: '/leave',
    icon: 'CalendarDaysIcon',
    permissions: ['view-leave', 'manage-leave'],
    pages: {
      admin: {
        component: () => import('./leave-management/pages/LeaveAdminPage'),
        route: '/leave/admin',
        title: 'Leave Administration'
      }
      // Employee and summary pages to be added
    },
    components: {
      forms: 3,
      tables: 2,
      hooks: 5,
      total: 10
    }
  },
  // Attendance Management Feature
  'attendance': {
    name: 'Attendance & Time Tracking',
    version: '1.0.0',
    status: 'complete',
    priority: 'medium',
    description: 'Employee attendance tracking and time management',
    route: '/attendance',
    icon: 'ClockIcon',
    permissions: ['view-attendance', 'manage-attendance'],
    pages: {
      admin: {
        component: () => import('./attendance/pages/AttendanceAdminPage'),
        route: '/attendance/admin',
        title: 'Attendance Administration'
      }
    },
    components: {
      forms: 2,
      tables: 2,
      hooks: 6,
      total: 10
    }
  },

  // Communication Feature
  'communication': {
    name: 'Communication & Letters',
    version: '1.0.0',
    status: 'complete',
    priority: 'medium',
    description: 'Internal communication, emails, and letter management',
    route: '/communication',
    icon: 'ChatBubbleLeftRightIcon',
    permissions: ['view-communication', 'send-messages'],
    pages: {
      letters: {
        component: () => import('./communication/pages/LettersPage'),
        route: '/letters',
        title: 'Letters Management'
      },
      emails: {
        component: () => import('./communication/pages/EmailsPage'),
        route: '/emails',
        title: 'Email Management'
      }
    },
    components: {
      forms: 2,
      tables: 1,      hooks: 6,
      total: 10
    }
  },

  // Events & Activities Feature
  'events': {
    name: 'Events & Activities',
    version: '1.0.0',
    status: 'complete',
    priority: 'low',
    description: 'Company events, activities, and social functions management',
    route: '/events',
    icon: 'SparklesIcon',
    permissions: ['view-events', 'manage-events'],
    pages: {
      picnicParticipants: {
        component: () => import('./events/pages/PicnicParticipantsPage'),
        route: '/picnic-participants',
        title: 'Picnic Participants'
      }
    },
    components: {
      forms: 2,
      tables: 1,
      hooks: 6,
      total: 9
    }
  },
  // Administration Feature
  'administration': {
    name: 'Administration & Settings',
    version: '1.0.0',
    status: 'complete',
    priority: 'medium',
    description: 'System administration, settings, and configuration',
    route: '/admin',
    icon: 'CogIcon',
    permissions: ['admin', 'manage-settings'],
    pages: {
      dashboard: {
        component: () => import('./administration/pages/DashboardPage'),
        route: '/admin-dashboard',
        title: 'Admin Dashboard'
      },
      roleSettings: {
        component: () => import('./administration/pages/RoleSettingsPage'),
        route: '/roles-settings',
        title: 'Role Settings'
      },
      userManagement: {
        component: () => import('./administration/pages/UserManagementPage'),
        route: '/administration/users',
        title: 'User Management'
      },
      systemSettings: {
        component: () => import('./administration/pages/SystemSettingsPage'),
        route: '/administration/settings',
        title: 'System Settings'
      }
    },
    components: {
      forms: 3,
      tables: 1,
      hooks: 17,
      total: 21
    }
  }
};

/**
 * Feature Statistics and Metrics
 */
export const FEATURE_METRICS = {
  total: Object.keys(FEATURE_REGISTRY).length,
  implemented: Object.values(FEATURE_REGISTRY).filter(f => f.status === 'complete').length,
  active: Object.values(FEATURE_REGISTRY).filter(f => f.status === 'active').length,
  planned: Object.values(FEATURE_REGISTRY).filter(f => f.status === 'planned').length,
  
  // Component statistics
  components: {
    total: Object.values(FEATURE_REGISTRY).reduce((sum, f) => sum + f.components.total, 0),
    forms: Object.values(FEATURE_REGISTRY).reduce((sum, f) => sum + f.components.forms, 0),
    tables: Object.values(FEATURE_REGISTRY).reduce((sum, f) => sum + f.components.tables, 0),
    hooks: Object.values(FEATURE_REGISTRY).reduce((sum, f) => sum + f.components.hooks, 0)
  },

  // Priority distribution
  priority: {
    high: Object.values(FEATURE_REGISTRY).filter(f => f.priority === 'high').length,
    medium: Object.values(FEATURE_REGISTRY).filter(f => f.priority === 'medium').length,
    low: Object.values(FEATURE_REGISTRY).filter(f => f.priority === 'low').length
  }
};

/**
 * Feature Discovery Utilities
 */
export const FeatureUtils = {
  /**
   * Get feature by ID
   */
  getFeature: (featureId) => FEATURE_REGISTRY[featureId],

  /**
   * Get features by status
   */
  getFeaturesByStatus: (status) => 
    Object.entries(FEATURE_REGISTRY)
      .filter(([id, feature]) => feature.status === status)
      .reduce((acc, [id, feature]) => ({ ...acc, [id]: feature }), {}),

  /**
   * Get features by priority
   */
  getFeaturesByPriority: (priority) =>
    Object.entries(FEATURE_REGISTRY)
      .filter(([id, feature]) => feature.priority === priority)
      .reduce((acc, [id, feature]) => ({ ...acc, [id]: feature }), {}),

  /**
   * Get all feature routes
   */
  getAllRoutes: () => {
    const routes = [];
    Object.values(FEATURE_REGISTRY).forEach(feature => {
      if (feature.pages) {
        Object.values(feature.pages).forEach(page => {
          routes.push({
            path: page.route,
            component: page.component,
            title: page.title,
            feature: feature.name
          });
        });
      }
    });
    return routes;
  },

  /**
   * Check if feature is available
   */
  isFeatureAvailable: (featureId) => {
    const feature = FEATURE_REGISTRY[featureId];
    return feature && ['complete', 'active'].includes(feature.status);
  }
};

/**
 * Development Tools Integration
 */
export const DEVELOPMENT_TOOLS = {
  featureGenerator: {
    template: 'src/frontend/features/_template',
    scaffoldFeature: (featureName) => {
      // Feature scaffolding logic would go here
      console.log(`Scaffolding feature: ${featureName}`);
    }
  },
  
  documentation: {
    generateDocs: () => {
      // Auto-documentation generation
      console.log('Generating feature documentation...');
    }
  },

  testing: {
    runFeatureTests: (featureId) => {
      // Run tests for specific feature
      console.log(`Running tests for feature: ${featureId}`);
    }
  }
};

/**
 * Export default feature registry
 */
export default FEATURE_REGISTRY;
