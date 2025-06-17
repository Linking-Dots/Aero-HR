/**
 * Updates Cards Organism Export
 * 
 * Dashboard component for displaying employee updates and holiday information.
 */

export { default } from './UpdatesCards';
export { updatesUtils } from './utils';
export * from './hooks';

// Component metadata
export const UpdatesCardsMeta = {
  component: 'UpdatesCards',
  type: 'organism',
  category: 'dashboard',
  description: 'Dashboard component displaying employee leave updates, holiday information, and team status in organized card sections',
  props: {
    refreshInterval: 'number - Data refresh interval in milliseconds (default: 300000)',
    maxAvatars: 'number - Maximum avatars to show per section (default: 4)',
    showHolidays: 'boolean - Whether to show holiday information (default: true)'
  },
  features: [
    'Real-time employee leave tracking',
    'Interactive employee avatars with leave details',
    'Holiday information display',
    'Responsive grid layout',
    'Auto-refresh functionality',
    'Loading states with skeletons',
    'Error handling with user feedback',
    'Popover details for leave information',
    'Time-based categorization (Today, Tomorrow, Next 7 Days)',
    'Current user leave status highlighting'
  ],
  hooks: [
    'useUpdatesData - Data fetching and state management'
  ],
  utils: [
    'formatLeaveDuration - Format leave date ranges',
    'formatHolidayDates - Format holiday date displays',
    'generateLeaveSummaries - Process leave data for display',
    'validateUpdatesData - Validate API response structure',
    'sanitizeLeaveData - Clean and filter leave records'
  ],
  usage: `
import { UpdatesCards } from '@components/organisms/updates-cards';

<UpdatesCards 
  refreshInterval={300000}
  maxAvatars={4}
  showHolidays={true}
/>
  `
};
