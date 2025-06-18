/**
 * Attendance & Time Tracking Feature Module
 * 
 * @file index.js
 * @description Complete attendance and time tracking feature with modern UI/UX
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Real-time attendance tracking
 * - Time sheet management
 * - Attendance analytics and reporting
 * - Location-based attendance
 * - Mobile-first responsive design
 * - Role-based access control
 */

// Export all feature components
export * from './components';
export * from './hooks';
export * from './pages';

// Feature Configuration
export const ATTENDANCE_FEATURE_CONFIG = {
  name: 'Attendance & Time Tracking',
  version: '1.0.0',
  description: 'Comprehensive attendance and time tracking system with real-time monitoring',
  
  // Feature metadata
  metadata: {
    category: 'hr-management',
    priority: 'high',
    status: 'complete',
    lastUpdated: '2025-06-18',
    maintainers: ['Glass ERP Development Team']
  },
  
  // Feature capabilities
  capabilities: {
    core: [
      'Real-time attendance tracking',
      'Time sheet management and reporting',
      'Monthly attendance grids with visual indicators',
      'Excel/PDF export functionality',
      'Location-based attendance verification',
      'Mobile-responsive design'
    ],
    advanced: [
      'Attendance analytics and insights',
      'Automated time calculations',
      'Leave integration with attendance',
      'Overtime tracking and reporting',
      'Attendance policy enforcement',
      'Real-time notifications'
    ],
    business: [
      'Role-based access control',
      'Multi-level approval workflows',
      'Compliance reporting',
      'Audit trail maintenance',
      'Integration with payroll systems',
      'Performance metrics tracking'
    ]
  },
  
  // Feature routes
  routes: {
    admin: '/attendance/admin',
    employee: '/attendance/employee',
    reports: '/attendance/reports',
    settings: '/attendance/settings'
  },
  
  // Required permissions
  permissions: {
    view: ['view-attendance'],
    manage: ['manage-attendance'],
    admin: ['admin-attendance'],
    reports: ['attendance-reports']
  },
  
  // Component statistics
  components: {
    pages: 1,
    forms: 1,
    tables: 2,
    hooks: 5,
    total: 9
  }
};

/**
 * Feature initialization function
 */
export const initializeAttendanceFeature = () => {
  return {
    ...ATTENDANCE_FEATURE_CONFIG,
    initialized: true,
    timestamp: new Date().toISOString()
  };
};

export default ATTENDANCE_FEATURE_CONFIG;
