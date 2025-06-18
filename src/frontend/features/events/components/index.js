/**
 * Events Feature Components Export
 * 
 * @file components/index.js
 * @description Central export point for all events feature components
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - Forms: Event and picnic management form components
 * - Tables: Event participants and activities display
 * - Widgets: Event statistics and dashboard components
 */

// Form Components
export { default as PicnicParticipantForm } from '@/Components/molecules/picnic-participant-form/PicnicParticipantForm';
export { default as DeletePicnicParticipantForm } from '@/Components/molecules/delete-picnic-participant-form/DeletePicnicParticipantForm';
// export { default as EventForm } from '@/Components/molecules/event-form/EventForm'; // Future implementation
// export { default as ActivityForm } from '@/Components/molecules/activity-form/ActivityForm'; // Future implementation

// Table Components (planned)
// export { default as EventsTable } from '@/Components/organisms/events-table/EventsTable';
// export { default as ParticipantsTable } from '@/Components/organisms/participants-table/ParticipantsTable';

// Widget Components (planned)
// export { default as EventsWidget } from '@/Components/organisms/EventsWidget';
// export { default as ParticipantsWidget } from '@/Components/organisms/ParticipantsWidget';

/**
 * Events Component Categories
 */
export const EVENTS_COMPONENTS = {
  // Core components currently available
  forms: {
    PicnicParticipantForm: {
      description: 'Advanced picnic participant registration with team management',
      features: ['team-assignment', 'payment-tracking', 'lucky-numbers', 'validation'],
      status: 'available'
    },
    DeletePicnicParticipantForm: {
      description: 'Secure participant deletion with impact assessment',
      features: ['multi-step-confirmation', 'impact-analysis', 'security-validation'],
      status: 'available'
    }
  },
  
  // Planned components
  tables: {
    planned: [
      'EventsTable - Events listing and management',
      'ParticipantsTable - Participants overview with team visualization',
      'ActivitiesTable - Event activities and schedule management'
    ]
  },
  
  widgets: {
    planned: [
      'EventsWidget - Events overview dashboard',
      'ParticipantsWidget - Participant statistics and insights',
      'TeamManagementWidget - Team balancing and assignments'
    ]
  }
};

/**
 * Component utilities and helpers
 */
export const EventsUtils = {
  /**
   * Get available components
   */
  getAvailableComponents: () => {
    return Object.entries(EVENTS_COMPONENTS.forms)
      .filter(([key, component]) => component.status === 'available')
      .map(([key]) => key);
  },
  
  /**
   * Get component features
   */
  getComponentFeatures: (componentName) => {
    const component = EVENTS_COMPONENTS.forms[componentName];
    return component ? component.features : [];
  }
};

export default EVENTS_COMPONENTS;
