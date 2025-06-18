/**
 * Events Feature Pages Export
 * 
 * @file pages/index.js
 * @description Page components for events and activities feature
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - PicnicParticipantsPage: Picnic participants management
 * - EventsPage: General events management (planned)
 */

export { default as PicnicParticipantsPage } from './PicnicParticipantsPage';
// export { default as EventsPage } from './EventsPage'; // Future implementation
// export { default as EventCalendarPage } from './EventCalendarPage'; // Future implementation

/**
 * Events Pages Configuration
 */
export const EVENTS_PAGES = {
  picnicParticipants: {
    component: 'PicnicParticipantsPage',
    path: '/events/picnic-participants',
    title: 'Picnic Participants',
    description: 'Manage picnic participants, team assignments, and activities',
    permissions: ['view-events', 'manage-picnic'],
    features: [
      'Participant registration and management',
      'Team assignment and balancing',
      'Payment tracking and reporting',
      'Lucky number generation',
      'Advanced search and filtering',
      'Mobile responsive design'
    ]
  },
  
  // Planned pages
  events: {
    component: 'EventsPage',
    path: '/events/management',
    title: 'Events Management',
    description: 'Comprehensive event planning and management system',
    permissions: ['view-events', 'manage-events'],
    features: [
      'Event creation and scheduling',
      'Participant management',
      'Activity coordination',
      'Resource allocation',
      'Event analytics'
    ],
    status: 'planned'
  },
  
  calendar: {
    component: 'EventCalendarPage',
    path: '/events/calendar',
    title: 'Events Calendar',
    description: 'Calendar view of all events and activities',
    permissions: ['view-events'],
    features: [
      'Calendar interface',
      'Event scheduling',
      'Conflict detection',
      'Recurring events',
      'Multi-view support'
    ],
    status: 'planned'
  }
};

/**
 * Page utilities
 */
export const EventsPagesUtils = {
  /**
   * Get page configuration by key
   */
  getPageConfig: (pageKey) => {
    return EVENTS_PAGES[pageKey];
  },
  
  /**
   * Get available pages (implemented)
   */
  getAvailablePages: () => {
    return Object.entries(EVENTS_PAGES)
      .filter(([key, page]) => !page.status || page.status !== 'planned')
      .map(([key, page]) => ({ key, ...page }));
  },
  
  /**
   * Get all page paths
   */
  getAllPaths: () => {
    return Object.values(EVENTS_PAGES).map(page => page.path);
  },
  
  /**
   * Check if user has permission for page
   */
  hasPermission: (pageKey, userPermissions = []) => {
    const page = EVENTS_PAGES[pageKey];
    if (!page) return false;
    
    return page.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  }
};

export default EVENTS_PAGES;
