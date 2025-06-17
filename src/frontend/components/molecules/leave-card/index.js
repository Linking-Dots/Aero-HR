/**
 * Leave Card Molecule Export
 * 
 * Holiday information display card component.
 */

export { default } from './LeaveCard';

// Component metadata
export const LeaveCardMeta = {
  component: 'LeaveCard',
  type: 'molecule',
  category: 'information',
  description: 'Displays upcoming holiday information with formatted dates and responsive design',
  props: {
    upcomingHoliday: 'object - Holiday data with title, from_date, to_date, description',
    loading: 'boolean - Loading state indicator',
    variant: 'string - Card variant (default, compact)',
    onViewDetails: 'function - Optional callback for viewing holiday details'
  },
  features: [
    'Holiday information display',
    'Formatted date ranges',
    'Loading state with skeleton',
    'Responsive design',
    'Optional details interaction',
    'Accessible markup with ARIA labels'
  ],
  usage: `
import { LeaveCard } from '@components/molecules/leave-card';

<LeaveCard 
  upcomingHoliday={{
    title: "Christmas Day",
    from_date: "2024-12-25",
    to_date: "2024-12-25",
    description: "Celebrate the holiday season"
  }}
  loading={false}
  onViewDetails={handleViewDetails}
/>
  `
};
