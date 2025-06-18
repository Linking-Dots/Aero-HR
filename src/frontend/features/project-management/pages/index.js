/**
 * Project Management Pages Index
 * 
 * @file index.js
 * @description Centralized export for all project management page components
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-01-20
 * 
 * @pages
 * - DailyWorksPage: Daily work tracking and management
 * - DailyWorkSummaryPage: Work completion analytics and reporting
 * - ProjectDashboardPage: Comprehensive project monitoring dashboard
 */

// Page component exports
export { default as DailyWorksPage } from './DailyWorksPage';
export { default as DailyWorkSummaryPage } from './DailyWorkSummaryPage';
export { default as ProjectDashboardPage } from './ProjectDashboardPage';

// Page metadata
export const PROJECT_MANAGEMENT_PAGES = {
  DailyWorksPage: {
    name: 'Daily Works',
    description: 'Daily work tracking and management interface',
    route: '/daily-works',
    permissions: ['view-daily-works'],
    features: ['work-tracking', 'file-operations', 'filtering', 'search']
  },
  DailyWorkSummaryPage: {
    name: 'Daily Work Summary',
    description: 'Aggregated work completion analytics and reporting',
    route: '/daily-work-summary',
    permissions: ['view-work-summary'],
    features: ['analytics', 'reporting', 'excel-export', 'filtering']
  },
  ProjectDashboardPage: {
    name: 'Project Dashboard',
    description: 'Comprehensive project monitoring and management center',
    route: '/project-dashboard',
    permissions: ['view-projects'],
    features: ['real-time-monitoring', 'team-management', 'budget-tracking', 'risk-assessment']
  }
};

// Navigation configuration
export const PROJECT_MANAGEMENT_NAVIGATION = [
  {
    label: 'Daily Works',
    path: '/daily-works',
    component: 'DailyWorksPage',
    icon: 'AssignmentIcon',
    order: 1
  },
  {
    label: 'Work Summary',
    path: '/daily-work-summary',
    component: 'DailyWorkSummaryPage',
    icon: 'AnalyticsIcon',
    order: 2
  },
  {
    label: 'Project Dashboard',
    path: '/project-dashboard',
    component: 'ProjectDashboardPage',
    icon: 'DashboardIcon',
    order: 3
  }
];

/**
 * Default export for dynamic imports
 */
export default {
  DailyWorksPage: () => import('./DailyWorksPage'),
  DailyWorkSummaryPage: () => import('./DailyWorkSummaryPage'),
  ProjectDashboardPage: () => import('./ProjectDashboardPage')
};
