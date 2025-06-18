/**
 * Communication Feature Pages Export
 * 
 * @file pages/index.js
 * @description Page components for communication feature
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - LettersPage: Letters management interface
 * - EmailsPage: Email management interface
 */

export { default as LettersPage } from './LettersPage';
export { default as EmailsPage } from './EmailsPage';

/**
 * Communication Pages Configuration
 */
export const COMMUNICATION_PAGES = {
  letters: {
    component: 'LettersPage',
    path: '/communication/letters',
    title: 'Letters Management',
    description: 'Manage letter correspondence and document workflow',
    permissions: ['view-letters', 'manage-letters'],
    features: [
      'Advanced search and filtering',
      'Status workflow management',
      'Document tracking',
      'Export functionality',
      'Mobile responsive design'
    ]
  },
  
  emails: {
    component: 'EmailsPage',
    path: '/communication/emails',
    title: 'Email Management',
    description: 'Comprehensive email management with inbox, compose, and organization features',
    permissions: ['view-emails', 'send-emails'],
    features: [
      'Inbox management',
      'Email composition',
      'Folder organization',
      'Advanced search',
      'Real-time updates'
    ]
  }
};

/**
 * Page utilities
 */
export const CommunicationPagesUtils = {
  /**
   * Get page configuration by key
   */
  getPageConfig: (pageKey) => {
    return COMMUNICATION_PAGES[pageKey];
  },
  
  /**
   * Get all page paths
   */
  getAllPaths: () => {
    return Object.values(COMMUNICATION_PAGES).map(page => page.path);
  },
  
  /**
   * Check if user has permission for page
   */
  hasPermission: (pageKey, userPermissions = []) => {
    const page = COMMUNICATION_PAGES[pageKey];
    if (!page) return false;
    
    return page.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  }
};

export default COMMUNICATION_PAGES;
