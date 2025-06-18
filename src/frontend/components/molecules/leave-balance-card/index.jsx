/**
 * Leave Balance Card Molecule Export
 * 
 * Leave balance display card component showing employee leave statistics.
 */

export { default as LeaveBalanceCard } from './LeaveBalanceCard';

// Component metadata
export const LeaveBalanceCardMeta = {
  component: 'LeaveBalanceCard',
  type: 'molecule',
  category: 'information',
  description: 'Displays employee leave balance information with statistics and usage tracking',
  props: {
    leaveBalance: 'object - Leave balance data with available, used, total days',
    loading: 'boolean - Loading state indicator',
    variant: 'string - Card variant (default, compact)',
    showDetails: 'boolean - Whether to show detailed breakdown'
  },
  features: [
    'Leave balance visualization',
    'Progress indicators',
    'Multiple leave types support',
    'Loading state with skeleton',
    'Responsive design',
    'Accessible markup with ARIA labels'
  ],
  usage: `
import { LeaveBalanceCard } from '@components/molecules/leave-balance-card';

<LeaveBalanceCard 
  leaveBalance={{
    annual: { total: 25, used: 10, available: 15 },
    sick: { total: 12, used: 2, available: 10 },
    casual: { total: 8, used: 3, available: 5 }
  }}
  loading={false}
  showDetails={true}
/>
  `
};
