/**
 * Notice Board Configuration
 * 
 * Configuration object for notice board component.
 * Contains styling, validation, and UI settings.
 */

export const NOTICE_BOARD_CONFIG = {
  // Validation Rules
  validation: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 500
    }
  },

  // Default Notice Values
  defaultNotice: {
    title: '',
    description: ''
  },

  // Sample Notices
  sampleNotices: [
    {
      id: 1,
      title: 'Team Meeting',
      description: 'There will be a team meeting tomorrow at 10 AM in the conference room.',
      date: new Date(),
      priority: 'medium'
    },
    {
      id: 2,
      title: 'Project Deadline',
      description: 'The deadline for the ABC project has been extended to next Friday.',
      date: new Date(),
      priority: 'high'
    }
  ],

  // UI Configuration
  ui: {
    gridSpacing: 3,
    maxWidth: 'lg',
    cardElevation: 2,
    dialogMaxWidth: 'sm',
    buttonVariant: 'contained',
    inputRows: 4
  },

  // Animation Settings
  animation: {
    fadeIn: true,
    growTransition: true,
    staggerDelay: 100
  },

  // Colors and Styling
  styling: {
    alertSeverity: 'info',
    alertVariant: 'outlined',
    buttonColor: 'primary',
    inputMargin: 'normal'
  },

  // Icons
  icons: {
    add: 'AddCircleOutlineIcon',
    delete: 'DeleteIcon',
    announcement: 'AnnouncementIcon'
  },

  // Date Formatting
  dateFormat: {
    locale: 'en-US',
    options: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  },

  // Accessibility
  accessibility: {
    boardLabel: 'Notice board with announcements',
    addButtonLabel: 'Add new notice',
    deleteButtonLabel: 'Delete notice',
    dialogLabel: 'Add new notice dialog',
    titleInputLabel: 'Notice title',
    descriptionInputLabel: 'Notice description'
  },

  // Labels and Text
  labels: {
    title: 'Notice Board',
    addButton: 'Add Notice',
    dialogTitle: 'Add New Notice',
    titleField: 'Title',
    descriptionField: 'Description',
    cancelButton: 'Cancel',
    submitButton: 'Add',
    emptyState: 'No notices available',
    loadingText: 'Loading notices...'
  },

  // Error Messages
  errorMessages: {
    titleRequired: 'Title is required',
    titleTooShort: 'Title must be at least 3 characters',
    titleTooLong: 'Title must be less than 100 characters',
    descriptionRequired: 'Description is required',
    descriptionTooShort: 'Description must be at least 10 characters',
    descriptionTooLong: 'Description must be less than 500 characters',
    addFailed: 'Failed to add notice',
    deleteFailed: 'Failed to delete notice'
  }
};
