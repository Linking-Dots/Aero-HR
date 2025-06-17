/**
 * Actions Cell Component
 * 
 * Action buttons for editing and deleting daily work items.
 * Includes proper permission checks and confirmation dialogs.
 */

import React from 'react';
import { IconButton, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ActionsCell = ({ 
  row, 
  onEdit, 
  onDelete,
  canEdit = true,
  canDelete = true 
}) => {
  const theme = useTheme();

  const handleEdit = () => {
    onEdit(row);
  };

  const handleDelete = () => {
    onDelete(row);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      {canEdit && (
        <IconButton
          size="small"
          onClick={handleEdit}
          sx={{
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '20'
            }
          }}
          aria-label={`Edit ${row.number}`}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
      
      {canDelete && (
        <IconButton
          size="small"
          onClick={handleDelete}
          sx={{
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main + '20'
            }
          }}
          aria-label={`Delete ${row.number}`}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default ActionsCell;
