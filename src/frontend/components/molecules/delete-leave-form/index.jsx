/**
 * DeleteLeaveForm - Molecule Component
 * 
 * @file index.jsx
 * @description Confirmation dialog for deleting leave requests
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Confirmation dialog for leave deletion
 * - Safety confirmation with leave details
 * - Glass morphism design
 * - Async deletion with loading states
 * 
 * @dependencies
 * - React 18+
 * - Material-UI
 * - Inertia.js for deletion
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';

/**
 * DeleteLeaveForm Component
 * 
 * @description Confirmation dialog for deleting leave requests
 * @param {Object} props - Component props
 * @param {string|number} props.leaveId - ID of the leave to delete
 * @param {Object} props.leave - Leave object with details (optional)
 * @param {Function} props.onClose - Close dialog callback
 */
const DeleteLeaveForm = ({
  leaveId,
  leave,
  onClose,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle deletion
  const handleDelete = async () => {
    if (!leaveId) {
      setError('Leave ID is required for deletion');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await router.delete(route('leaves.destroy', leaveId));
      onClose();
    } catch (err) {
      console.error('Error deleting leave:', err);
      setError('Failed to delete leave. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Delete Leave Request
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> This action cannot be undone. The leave request will be permanently deleted.
          </Typography>
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this leave request?
        </Typography>

        {leave && (
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Leave Details:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Employee: {leave.user?.name || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Type: {leave.leave_type?.name || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Duration: {leave.start_date} to {leave.end_date}
            </Typography>
            {leave.reason && (
              <Typography variant="body2" color="text.secondary">
                Reason: {leave.reason}
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={loading}
          sx={{ ml: 2 }}
        >
          {loading ? 'Deleting...' : 'Delete Leave'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { DeleteLeaveForm };
export default DeleteLeaveForm;
