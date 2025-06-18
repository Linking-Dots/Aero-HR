/**
 * Communication Feature Components Export
 * 
 * @file components/index.js
 * @description Central export point for all communication feature components
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - Tables: Letter and email display components
 * - Forms: Communication form components (planned)
 * - Widgets: Communication dashboard widgets (planned)
 */

// Table Components
export { default as LettersTable } from '@/Components/organisms/letters-table/LettersTable';
// export { default as EmailsTable } from '@/Components/organisms/emails-table/EmailsTable'; // Future implementation

// Form Components (planned)
// export { default as LetterForm } from '@/Components/molecules/letter-form/LetterForm';
// export { default as EmailComposeForm } from '@/Components/molecules/email-compose-form/EmailComposeForm';
// export { default as NotificationForm } from '@/Components/molecules/notification-form/NotificationForm';

// Widget Components (planned)
// export { default as CommunicationWidget } from '@/Components/organisms/CommunicationWidget';
// export { default as NotificationsWidget } from '@/Components/organisms/NotificationsWidget';

/**
 * Communication Component Categories
 */
export const COMMUNICATION_COMPONENTS = {
  // Core components currently available
  tables: {
    LettersTable: {
      description: 'Advanced letters management table with workflow features',
      features: ['sorting', 'filtering', 'status-management', 'export'],
      status: 'available'
    }
  },
  
  // Planned components
  forms: {
    planned: [
      'LetterForm - Letter creation and editing',
      'EmailComposeForm - Email composition interface',
      'NotificationForm - Internal notification management'
    ]
  },
  
  widgets: {
    planned: [
      'CommunicationWidget - Communication overview dashboard',
      'NotificationsWidget - Real-time notifications display'
    ]
  }
};

/**
 * Component utilities and helpers
 */
export const CommunicationUtils = {
  /**
   * Get available components
   */
  getAvailableComponents: () => {
    return Object.entries(COMMUNICATION_COMPONENTS.tables)
      .filter(([key, component]) => component.status === 'available')
      .map(([key]) => key);
  },
  
  /**
   * Get component features
   */
  getComponentFeatures: (componentName) => {
    const component = COMMUNICATION_COMPONENTS.tables[componentName];
    return component ? component.features : [];
  }
};

export default COMMUNICATION_COMPONENTS;
