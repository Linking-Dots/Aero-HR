/**
 * Letter Actions Cell Component
 * 
 * Action buttons for editing and deleting letters.
 */

import React from 'react';
import { Button } from '@heroui/react';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';

const LetterActionsCell = ({ 
  row, 
  onEdit, 
  onDelete,
  disabled = false 
}) => {
  const handleEdit = () => {
    onEdit('editLetter', row);
  };

  const handleDelete = () => {
    onDelete(row.id);
  };

  return (
    <div className="flex gap-4 items-center">
      <Button 
        variant="bordered" 
        isIconOnly 
        color="warning" 
        aria-label="Edit"
        onClick={handleEdit}
        isDisabled={disabled}
      >
        <EditIcon />
      </Button>
      <Button 
        variant="bordered" 
        isIconOnly 
        color="danger" 
        aria-label="Delete"
        onClick={handleDelete}
        isDisabled={disabled}
      >
        <DeleteIcon />
      </Button>
    </div>
  );
};

export default LetterActionsCell;
