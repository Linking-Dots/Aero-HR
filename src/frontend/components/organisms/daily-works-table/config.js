/**
 * Daily Works Table Configuration
 * 
 * Centralized configuration for the DailyWorksTable organism including
 * status mappings, colors, table settings, and accessibility options.
 */

// Status configuration with icons and colors
export const DAILY_WORKS_STATUS = {
  NEW: {
    value: 'new',
    label: 'New',
    color: 'primary',
    description: 'Newly created daily work item'
  },
  RESUBMISSION: {
    value: 'resubmission',
    label: 'Resubmission',
    color: 'warning',
    description: 'Item requiring resubmission'
  },
  COMPLETED: {
    value: 'completed',
    label: 'Completed',
    color: 'success',
    description: 'Successfully completed work item'
  },
  EMERGENCY: {
    value: 'emergency',
    label: 'Emergency',
    color: 'danger',
    description: 'Emergency priority work item'
  }
};

// Work type categories
export const WORK_TYPES = {
  EMBANKMENT: 'Embankment',
  STRUCTURE: 'Structure',
  PAVEMENT: 'Pavement'
};

// Table configuration
export const DAILY_WORKS_CONFIG = {
  table: {
    maxHeight: '52vh',
    defaultSortField: 'date',
    highlightOnHover: true,
    responsive: true,
    dense: true,
    pagination: {
      enabled: false
    }
  },
  
  columns: {
    date: {
      width: '110px',
      sortable: true,
      center: true
    },
    rfiNumber: {
      width: '160px',
      sortable: true,
      center: true
    },
    status: {
      width: '220px',
      sortable: true,
      center: true
    },
    assigned: {
      width: '260px',
      sortable: true,
      center: true
    },
    type: {
      width: '140px',
      sortable: true,
      center: true
    },
    description: {
      width: '260px',
      sortable: true,
      left: true
    },
    location: {
      width: '200px',
      sortable: true,
      center: true
    },
    actions: {
      width: '120px',
      center: true
    }
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
    assignLabel: 'Assign to {user}'
  },

  // File upload settings
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    uploadEndpoint: '/api/daily-works/upload'
  },

  // Toast notification styles
  notifications: {
    duration: 5000,
    position: 'top-right',
    style: {
      backdropFilter: 'blur(16px) saturate(200%)',
      borderRadius: '8px'
    }
  }
};

// Status color mapping function
export const getStatusColor = (status) => {
  const statusConfig = Object.values(DAILY_WORKS_STATUS).find(s => s.value === status);
  return statusConfig?.color || 'default';
};

// Status icon mapping
export const getStatusIcon = (status) => {
  switch (status) {
    case DAILY_WORKS_STATUS.NEW.value:
      return 'FiberNew';
    case DAILY_WORKS_STATUS.RESUBMISSION.value:
      return 'Replay';
    case DAILY_WORKS_STATUS.COMPLETED.value:
      return 'CheckCircle';
    case DAILY_WORKS_STATUS.EMERGENCY.value:
      return 'Error';
    default:
      return 'HelpOutline';
  }
};
