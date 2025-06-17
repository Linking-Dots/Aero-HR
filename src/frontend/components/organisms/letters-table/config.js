/**
 * Letters Table Configuration
 * 
 * Centralized configuration for the LettersTable organism including
 * status mappings, workflow states, and table settings.
 */

// Letter status configuration
export const LETTER_STATUS = {
  OPEN: {
    value: 'Open',
    label: 'Open',
    color: 'danger',
    description: 'Letter is open and pending action'
  },
  CLOSED: {
    value: 'Closed',
    label: 'Closed',
    color: 'success',
    description: 'Letter has been closed/completed'
  },
  PROCESSING: {
    value: 'Processing',
    label: 'Processing',
    color: 'primary',
    description: 'Letter is being processed'
  },
  SIGNED: {
    value: 'Signed',
    label: 'Signed',
    color: 'warning',
    description: 'Letter has been signed'
  },
  SENT: {
    value: 'Sent',
    label: 'Sent',
    color: 'success',
    description: 'Letter has been sent'
  }
};

// Handling status options
export const HANDLING_STATUS = {
  PROCESSING: 'Processing',
  SIGNED: 'Signed',
  SENT: 'Sent'
};

// Workflow checkbox fields
export const WORKFLOW_FIELDS = {
  NEED_REPLY: 'need_reply',
  REPLIED_STATUS: 'replied_status',
  NEED_FORWARD: 'need_forward',
  FORWARDED_STATUS: 'forwarded_status'
};

// Table configuration
export const LETTERS_CONFIG = {
  table: {
    defaultSortField: 'received_date',
    highlightOnHover: true,
    responsive: true,
    dense: true,
    keyField: 'id'
  },
  
  columns: {
    from: {
      width: '80px',
      sortable: true,
      center: true
    },
    status: {
      width: '170px',
      sortable: true,
      center: true
    },
    receivedDate: {
      width: '160px',
      sortable: true,
      center: true
    },
    memoNumber: {
      width: '200px',
      sortable: true,
      center: true
    },
    subject: {
      width: '260px',
      sortable: true,
      left: true
    },
    actionTaken: {
      width: '250px',
      sortable: true,
      left: true
    },
    handlingLink: {
      width: '200px',
      sortable: true,
      center: true
    },
    handlingStatus: {
      width: '180px',
      sortable: true,
      center: true
    },
    needReply: {
      width: '80px',
      center: true
    },
    repliedStatus: {
      width: '80px',
      center: true
    },
    needForward: {
      width: '80px',
      center: true
    },
    forwardedStatus: {
      width: '90px',
      center: true
    },
    dealtBy: {
      width: '260px',
      sortable: true,
      center: true
    },
    actions: {
      width: '150px',
      center: true
    }
  },

  // Search highlighting configuration
  searchHighlight: {
    backgroundColor: 'yellow',
    color: 'black',
    fontWeight: 'bold'
  },

  // Mobile responsive breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '1024px'
  },

  // Accessibility settings
  accessibility: {
    tableRole: 'table',
    rowRole: 'row',
    cellRole: 'cell',
    sortableLabel: 'Sort by {column}',
    statusLabel: 'Change status to {status}',
    checkboxLabel: '{field} checkbox for letter {id}',
    userLabel: 'Assign to {user}'
  },

  // Toast notification settings
  notifications: {
    duration: 5000,
    position: 'top-right',
    style: {
      backdropFilter: 'blur(16px) saturate(200%)',
      borderRadius: '8px'
    }
  },

  // Tooltip configuration
  tooltip: {
    maxWidth: '300px',
    placement: 'top',
    showArrow: true,
    radius: 'md',
    size: 'md'
  }
};

// Status color mapping function
export const getStatusColor = (status) => {
  const statusConfig = Object.values(LETTER_STATUS).find(s => s.value === status);
  return statusConfig?.color || 'default';
};

// Workflow validation rules
export const WORKFLOW_RULES = {
  canReply: (letter) => letter.need_reply && letter.status === LETTER_STATUS.OPEN.value,
  canForward: (letter) => letter.need_forward && letter.status !== LETTER_STATUS.CLOSED.value,
  canClose: (letter) => letter.replied_status || !letter.need_reply,
  requiresAction: (letter) => letter.status === LETTER_STATUS.OPEN.value && !letter.action_taken
};

// Export utilities
export const EXPORT_CONFIG = {
  fileName: 'letters_export',
  dateFormat: 'YYYY-MM-DD',
  includeFields: [
    'from',
    'status',
    'received_date',
    'memo_number',
    'subject',
    'action_taken',
    'handling_status',
    'need_reply',
    'replied_status',
    'need_forward',
    'forwarded_status',
    'dealt_by'
  ]
};
