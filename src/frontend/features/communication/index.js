/**
 * Communication & Letters Feature Module
 * 
 * @file index.js
 * @description Complete communication system with letters, emails, and messaging
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Letter and document management
 * - Email communication system
 * - Internal messaging (planned)
 * - Notification management (planned)
 * - Document workflow tracking
 * - Modern responsive design
 */

// Export all feature components
export * from './components';
export * from './hooks';
export * from './pages';

// Feature Configuration
export const COMMUNICATION_FEATURE_CONFIG = {
  name: 'Communication & Letters',
  version: '1.0.0',
  description: 'Comprehensive communication system for letters, emails, and internal messaging',
  
  // Feature metadata
  metadata: {
    category: 'communication',
    priority: 'medium',
    status: 'complete',
    lastUpdated: '2025-06-18',
    maintainers: ['Glass ERP Development Team']
  },
  
  // Feature capabilities
  capabilities: {
    core: [
      'Letter and document management',
      'Email inbox and composition',
      'Advanced search and filtering',
      'Document workflow tracking',
      'Status management and updates',
      'Mobile-responsive interface'
    ],
    advanced: [
      'Document workflow automation',
      'Email templates and signatures',
      'Advanced filtering and sorting',
      'Export functionality (Excel/PDF)',
      'Real-time status updates',
      'Notification system integration'
    ],
    business: [
      'Document approval workflows',
      'Audit trail and tracking',
      'Role-based access control',
      'Integration with external systems',
      'Compliance and documentation',
      'Performance analytics'
    ]
  },
  
  // Feature routes
  routes: {
    letters: '/communication/letters',
    emails: '/communication/emails',
    notifications: '/communication/notifications',
    settings: '/communication/settings'
  },
  
  // Required permissions
  permissions: {
    view: ['view-communication'],
    manage: ['manage-communication'],
    letters: ['view-letters', 'manage-letters'],
    emails: ['view-emails', 'send-emails'],
    admin: ['admin-communication']
  },
  
  // Component statistics
  components: {
    pages: 2,
    tables: 1,
    forms: 0, // Planned for future implementation
    hooks: 6,
    total: 9
  },
  
  // Integration points
  integrations: {
    notifications: 'Real-time notification system',
    users: 'User management for messaging',
    permissions: 'Role-based access control',
    audit: 'Activity logging and audit trails'
  }
};

/**
 * Communication workflow statuses
 */
export const COMMUNICATION_STATUSES = {
  letters: {
    OPEN: { label: 'Open', color: 'error', priority: 1 },
    PROCESSING: { label: 'Processing', color: 'warning', priority: 2 },
    CLOSED: { label: 'Closed', color: 'success', priority: 3 },
    SIGNED: { label: 'Signed', color: 'info', priority: 4 },
    SENT: { label: 'Sent', color: 'success', priority: 5 }
  },
  
  emails: {
    DRAFT: { label: 'Draft', color: 'default', priority: 1 },
    SENT: { label: 'Sent', color: 'success', priority: 2 },
    READ: { label: 'Read', color: 'info', priority: 3 },
    REPLIED: { label: 'Replied', color: 'success', priority: 4 }
  }
};

/**
 * Communication priorities
 */
export const COMMUNICATION_PRIORITIES = {
  LOW: { label: 'Low', color: 'default', value: 1 },
  NORMAL: { label: 'Normal', color: 'primary', value: 2 },
  HIGH: { label: 'High', color: 'warning', value: 3 },
  URGENT: { label: 'Urgent', color: 'error', value: 4 }
};

/**
 * Feature utilities
 */
export const CommunicationUtils = {
  /**
   * Get status configuration
   */
  getStatusConfig: (type, status) => {
    const statusConfig = COMMUNICATION_STATUSES[type];
    return statusConfig ? statusConfig[status] : null;
  },
  
  /**
   * Get priority configuration
   */
  getPriorityConfig: (priority) => {
    return COMMUNICATION_PRIORITIES[priority] || COMMUNICATION_PRIORITIES.NORMAL;
  },
  
  /**
   * Format communication date
   */
  formatDate: (date, format = 'MMM DD, YYYY') => {
    return dayjs(date).format(format);
  },
  
  /**
   * Check if item needs attention
   */
  needsAttention: (item, type = 'letter') => {
    if (type === 'letter') {
      return item.status === 'Open' && !item.action_taken;
    }
    if (type === 'email') {
      return !item.read;
    }
    return false;
  }
};

/**
 * Feature initialization function
 */
export const initializeCommunicationFeature = () => {
  return {
    ...COMMUNICATION_FEATURE_CONFIG,
    initialized: true,
    timestamp: new Date().toISOString(),
    features: {
      letters: true,
      emails: true,
      notifications: false, // Planned
      messaging: false      // Planned
    }
  };
};

export default COMMUNICATION_FEATURE_CONFIG;
