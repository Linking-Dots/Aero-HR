/**
 * Leave Application Form Molecule Export
 * 
 * Leave application form component for employee leave requests.
 */

export { default as LeaveApplicationForm } from './LeaveApplicationForm';

// Component metadata
export const LeaveApplicationFormMeta = {
  component: 'LeaveApplicationForm',
  type: 'molecule',
  category: 'form',
  description: 'Complete leave application form with validation and submission handling',
  props: {
    leaveTypes: 'array - Available leave types with configuration',
    leaveBalance: 'object - Current leave balance information',
    onSuccess: 'function - Callback when form is successfully submitted',
    onCancel: 'function - Callback when form is cancelled',
    initialData: 'object - Initial form data for editing',
    mode: 'string - Form mode (create, edit, view)'
  },
  features: [
    'Multiple leave type support',
    'Date range selection with validation',
    'Real-time balance checking',
    'Attachment support',
    'Form validation and error handling',
    'Loading states and feedback',
    'Responsive design'
  ],
  usage: `
import { LeaveApplicationForm } from '@components/molecules/leave-application-form';

<LeaveApplicationForm 
  leaveTypes={availableLeaveTypes}
  leaveBalance={currentBalance}
  onSuccess={handleFormSuccess}
  onCancel={handleFormCancel}
/>
  `
};
