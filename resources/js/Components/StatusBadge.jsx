import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  PlayCircleOutline as InProgressIcon,
  AccessTime as ScheduledIcon,
  Block as BlockedIcon,
  Error as RejectedIcon,
} from '@mui/icons-material';

const StatusBadge = ({ status, size = 'small', variant = 'filled' }) => {
  // Define status configurations
  const statusConfig = {
    // General statuses
    'pending': { color: 'warning', icon: <PendingIcon fontSize="small" />, label: 'Pending' },
    'in-progress': { color: 'info', icon: <InProgressIcon fontSize="small" />, label: 'In Progress' },
    'completed': { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' },
    'cancelled': { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Cancelled' },
    
    // Approval statuses
    'approved': { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Approved' },
    'rejected': { color: 'error', icon: <RejectedIcon fontSize="small" />, label: 'Rejected' },
    
    // Time-related statuses
    'scheduled': { color: 'secondary', icon: <ScheduledIcon fontSize="small" />, label: 'Scheduled' },
    'overdue': { color: 'error', icon: <AccessTime fontSize="small" />, label: 'Overdue' },
    
    // Document statuses
    'draft': { color: 'default', icon: <PendingIcon fontSize="small" />, label: 'Draft' },
    'active': { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Active' },
    'archived': { color: 'default', icon: <BlockedIcon fontSize="small" />, label: 'Archived' },
    'expired': { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Expired' },
    
    // Default for unknown status
    'default': { color: 'default', icon: null, label: status }
  };
  
  // Get config for the provided status or use default
  const config = statusConfig[status.toLowerCase()] || statusConfig.default;
  
  // If the label should be the original status string (with proper capitalization)
  const label = config.label || status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <Chip
      icon={config.icon}
      label={label}
      color={config.color}
      size={size}
      variant={variant}
    />
  );
};

export default StatusBadge;
