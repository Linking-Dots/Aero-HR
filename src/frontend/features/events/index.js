/**
 * Events & Activities Feature Module
 * 
 * @file index.js
 * @description Complete events and activities management system
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Picnic and event participant management
 * - Team organization and balancing
 * - Activity planning and coordination
 * - Payment tracking and reporting
 * - Event analytics and insights
 * - Modern responsive design
 */

// Export all feature components
export * from './components';
export * from './hooks';
export * from './pages';

// Feature Configuration
export const EVENTS_FEATURE_CONFIG = {
  name: 'Events & Activities',
  version: '1.0.0',
  description: 'Comprehensive events and activities management with team organization and participant tracking',
  
  // Feature metadata
  metadata: {
    category: 'social-activities',
    priority: 'medium',
    status: 'complete',
    lastUpdated: '2025-06-18',
    maintainers: ['Glass ERP Development Team']
  },
  
  // Feature capabilities
  capabilities: {
    core: [
      'Picnic participant registration and management',
      'Team assignment and automatic balancing',
      'Payment tracking with multiple status options',
      'Lucky number generation for activities',
      'Advanced search and filtering capabilities',
      'Mobile-responsive interface design'
    ],
    advanced: [
      'Team optimization algorithms',
      'Payment analytics and reporting',
      'Participant behavior tracking',
      'Event statistics and insights',
      'Export functionality (Excel/PDF)',
      'Real-time participant updates'
    ],
    business: [
      'Multi-step participant deletion with impact analysis',
      'Financial tracking and budget management',
      'Team dynamics analysis',
      'Event ROI calculations',
      'Compliance and audit trails',
      'Integration with HR systems'
    ]
  },
  
  // Feature routes
  routes: {
    picnicParticipants: '/events/picnic-participants',
    events: '/events/management',
    calendar: '/events/calendar',
    activities: '/events/activities',
    analytics: '/events/analytics'
  },
  
  // Required permissions
  permissions: {
    view: ['view-events'],
    manage: ['manage-events'],
    picnic: ['view-events', 'manage-picnic'],
    admin: ['admin-events']
  },
  
  // Component statistics
  components: {
    pages: 1,
    forms: 2,
    tables: 0, // Planned for future implementation
    hooks: 6,
    total: 9
  },
  
  // Integration points
  integrations: {
    hr: 'Employee management integration',
    finance: 'Payment and budget tracking',
    notifications: 'Event reminder system',
    calendar: 'Corporate calendar integration'
  }
};

/**
 * Event types configuration
 */
export const EVENT_TYPES = {
  PICNIC: {
    label: 'Company Picnic',
    icon: 'Park',
    color: 'success',
    features: ['team-assignments', 'payment-tracking', 'lucky-numbers']
  },
  CONFERENCE: {
    label: 'Conference',
    icon: 'Business',
    color: 'primary',
    features: ['speaker-management', 'session-tracking', 'attendance']
  },
  WORKSHOP: {
    label: 'Workshop',
    icon: 'School',
    color: 'info',
    features: ['skill-tracking', 'certification', 'feedback']
  },
  CELEBRATION: {
    label: 'Celebration',
    icon: 'Celebration',
    color: 'warning',
    features: ['guest-management', 'entertainment', 'catering']
  }
};

/**
 * Team assignment strategies
 */
export const TEAM_STRATEGIES = {
  BALANCED: {
    name: 'Balanced Distribution',
    description: 'Distribute participants evenly across teams',
    algorithm: 'round-robin'
  },
  DEPARTMENT_BASED: {
    name: 'Department Based',
    description: 'Group participants by department',
    algorithm: 'department-grouping'
  },
  RANDOM: {
    name: 'Random Assignment',
    description: 'Randomly assign participants to teams',
    algorithm: 'random'
  },
  SKILL_BASED: {
    name: 'Skill Based',
    description: 'Balance teams based on skills and experience',
    algorithm: 'skill-balancing'
  }
};

/**
 * Payment statuses
 */
export const PAYMENT_STATUSES = {
  PENDING: { label: 'Pending', color: 'warning', value: 'pending' },
  PARTIAL: { label: 'Partial', color: 'info', value: 'partial' },
  PAID: { label: 'Paid', color: 'success', value: 'paid' },
  REFUNDED: { label: 'Refunded', color: 'error', value: 'refunded' },
  WAIVED: { label: 'Waived', color: 'default', value: 'waived' }
};

/**
 * Feature utilities
 */
export const EventsUtils = {
  /**
   * Get event type configuration
   */
  getEventTypeConfig: (type) => {
    return EVENT_TYPES[type] || EVENT_TYPES.PICNIC;
  },
  
  /**
   * Get payment status configuration
   */
  getPaymentStatusConfig: (status) => {
    return PAYMENT_STATUSES[status.toUpperCase()] || PAYMENT_STATUSES.PENDING;
  },
  
  /**
   * Calculate team balance score
   */
  calculateTeamBalance: (teams) => {
    if (teams.length === 0) return 100;
    
    const sizes = teams.map(team => team.members?.length || 0);
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
    
    // Convert variance to balance score (0-100, higher is better)
    return Math.max(0, 100 - (variance * 10));
  },
  
  /**
   * Generate lucky number
   */
  generateLuckyNumber: (participantId, totalParticipants = 100) => {
    // Use participant ID as seed for consistent numbers
    const seed = typeof participantId === 'string' ? 
      participantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 
      participantId;
    
    return (seed % totalParticipants) + 1;
  },
  
  /**
   * Format currency for display
   */
  formatCurrency: (amount, currency = '₹') => {
    return `${currency}${parseFloat(amount || 0).toFixed(2)}`;
  }
};

/**
 * Feature initialization function
 */
export const initializeEventsFeature = () => {
  return {
    ...EVENTS_FEATURE_CONFIG,
    initialized: true,
    timestamp: new Date().toISOString(),
    features: {
      picnicManagement: true,
      teamAssignment: true,
      paymentTracking: true,
      eventCalendar: false,    // Planned
      activityPlanning: false, // Planned
      analytics: false         // Planned
    }
  };
};

export default EVENTS_FEATURE_CONFIG;
