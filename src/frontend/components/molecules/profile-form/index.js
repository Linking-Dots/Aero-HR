/**
 * Profile Form Molecule Export
 * 
 * User profile management form component with advanced validation,
 * image upload, and responsive design capabilities.
 * 
 * @see ProfileForm
 */

export { default } from './ProfileForm';

// Component metadata for development tools
export const ProfileFormMeta = {
  component: 'ProfileForm',
  type: 'molecule',
  category: 'forms',
  description: 'Comprehensive user profile management form with validation and image upload',
  version: '1.0.0',
  
  // Props documentation
  props: {
    user: {
      type: 'object',
      required: true,
      description: 'User data object with profile information'
    },
    allUsers: {
      type: 'array',
      required: false,
      default: '[]',
      description: 'List of all users for manager selection'
    },
    departments: {
      type: 'array',
      required: true,
      description: 'List of available departments'
    },
    designations: {
      type: 'array',
      required: true,
      description: 'List of available designations'
    },
    open: {
      type: 'boolean',
      required: true,
      description: 'Controls dialog open/close state'
    },
    onClose: {
      type: 'function',
      required: true,
      description: 'Callback fired when dialog should close'
    },
    onSave: {
      type: 'function',
      required: true,
      description: 'Callback fired when form is submitted'
    },
    mode: {
      type: 'string',
      required: false,
      default: 'edit',
      description: 'Form mode: edit, create, or view'
    },
    loading: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Loading state indicator'
    }
  },
  
  // Usage examples
  examples: [
    {
      name: 'Basic Profile Form',
      code: `
<ProfileForm
  user={userData}
  departments={departments}
  designations={designations}
  allUsers={allUsers}
  open={isOpen}
  onClose={handleClose}
  onSave={handleSave}
/>
      `
    },
    {
      name: 'Create New Profile',
      code: `
<ProfileForm
  user={{}}
  departments={departments}
  designations={designations}
  allUsers={allUsers}
  open={isOpen}
  onClose={handleClose}
  onSave={handleCreateUser}
  mode="create"
/>
      `
    },
    {
      name: 'View Only Mode',
      code: `
<ProfileForm
  user={userData}
  departments={departments}
  designations={designations}
  allUsers={allUsers}
  open={isOpen}
  onClose={handleClose}
  mode="view"
/>
      `
    }
  ],
  
  // Dependencies
  dependencies: [
    '@mui/material',
    '@mui/icons-material',
    '@mui/lab',
    'react-hook-form',
    '@hookform/resolvers/yup',
    'yup',
    'lodash',
    'react-toastify'
  ],
  
  // Accessibility features
  accessibility: [
    'WCAG 2.1 AA compliant',
    'Keyboard navigation support',
    'Screen reader friendly',
    'Focus management',
    'ARIA labels and descriptions',
    'High contrast support'
  ],
  
  // Features
  features: [
    'Real-time form validation',
    'Profile image upload with crop',
    'Responsive design',
    'Optimistic updates',
    'Error boundary protection',
    'Accessibility compliance',
    'Glass morphism design',
    'Advanced file validation',
    'Drag and drop support'
  ]
};
