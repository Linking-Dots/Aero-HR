/**
 * Punch Status Card Organism Export
 * 
 * Comprehensive attendance tracking component with real-time monitoring.
 */

export { default } from './PunchStatusCard';
export { punchStatusUtils } from './utils';
export * from './hooks';
export * from './components';

// Component metadata
export const PunchStatusCardMeta = {
  component: 'PunchStatusCard',
  type: 'organism',
  category: 'attendance',
  description: 'Comprehensive attendance tracking component with check-in/out functionality, real-time monitoring, and location verification',
  props: {
    user: 'object - Current user object with profile information',
    onStatusChange: 'function - Optional callback for status changes',
    config: 'object - Configuration options for features and behavior'
  },
  features: [
    'Real-time attendance tracking',
    'Location-based verification',
    'Session management with detailed logging',
    'Connection status monitoring',
    'Device fingerprinting for security',
    'Responsive design with mobile optimization',
    'Comprehensive error handling',
    'Activity history with expandable details',
    'Toast notifications for user feedback',
    'Session information dialog'
  ],
  hooks: [
    'usePunchStatus - Core punch status management',
    'useLocationTracking - Geolocation handling',
    'useConnectionStatus - Network and device monitoring'
  ],
  components: [
    'SessionDialog - Post-punch session information modal',
    'ActivityList - Today\'s punch activity display',
    'ConnectionStatus - Connection status indicators'
  ],
  usage: `
import { PunchStatusCard } from '@components/organisms/punch-status-card';

<PunchStatusCard 
  user={currentUser}
  onStatusChange={handleStatusChange}
  config={{
    enableRealTimeTracking: true,
    enableLocationVerification: true,
    refreshInterval: 1000,
    showActivityDetails: true,
    compactMode: false
  }}
/>
  `
};
